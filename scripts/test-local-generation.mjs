import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';

const app=path.resolve(process.argv[2]||'.build/staging/Banana Studio.app');
const resources=path.join(app,'Contents/Resources'),executable=path.join(app,'Contents/MacOS/BananaStudio');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'banana-generation-test-'));
const codec=input=>JSON.parse(execFileSync(executable,['--raster-codec'],{input:JSON.stringify(input),maxBuffer:200*1024*1024,timeout:30_000,env:{PATH:'/usr/bin:/bin'}}));
let child,output='',diagnostics='';
try {
 const width=1024,height=1024,sourcePixels=Buffer.alloc(width*height*4),generatedPixels=Buffer.alloc(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;sourcePixels.set([x%256,y%256,127,255],i);generatedPixels.set([17,83,191,255],i);}
 const encode=pixels=>Buffer.from(codec({operation:'encode',data:pixels.toString('base64'),width,height}).data,'base64');
 const sourcePNG=encode(sourcePixels),providerPNG=encode(generatedPixels);fs.writeFileSync(path.join(root,'provider.png'),providerPNG,{mode:0o600});
 const preload=path.join(root,'mock-provider.mjs');
 fs.writeFileSync(preload,`import fs from 'node:fs';\nconst output=fs.readFileSync(${JSON.stringify(path.join(root,'provider.png'))}).toString('base64');\nglobalThis.fetch=async(url,options={})=>{\n if(!String(url).startsWith('https://api.openai.com/v1/images/'))throw new Error('Unexpected network request blocked by test');\n const input=JSON.parse(options.body);fs.appendFileSync(${JSON.stringify(path.join(root,'provider-calls.jsonl'))},JSON.stringify({size:input.size,hasDataURL:input.images?.[0]?.image_url?.startsWith('data:image/png;base64,'),hasCookie:!!options.headers.Cookie})+'\\n');\n return new Response(JSON.stringify({data:[{b64_json:output}],usage:{input_tokens:0,output_tokens:0}}),{status:200,headers:{'Content-Type':'application/json','x-request-id':'synthetic-request'}});\n};\n`);
 const bootstrap=randomBytes(32).toString('hex');
 child=spawn(path.join(resources,'runtime/node'),['--import',preload,path.join(resources,'workspace/server.mjs')],{cwd:path.join(resources,'workspace'),env:{PATH:'/usr/bin:/bin'},stdio:['pipe','pipe','pipe']});
 child.stdout.on('data',data=>output+=data);child.stderr.on('data',data=>diagnostics+=data);
 child.stdin.write(JSON.stringify({dataDirectory:path.join(root,'workspace'),webRoot:path.join(resources,'workspace/web'),bootstrap,keys:{OPENAI_API_KEY:'integration-test-only-value'}})+'\n');
 let ready;const deadline=Date.now()+15_000;
 while(Date.now()<deadline&&!ready){ready=output.split('\n').map(line=>{try{return JSON.parse(line);}catch{return null;}}).find(v=>v?.event==='ready');if(!ready)await new Promise(resolve=>setTimeout(resolve,50));}
 assert.ok(ready,'Packaged local server did not become ready.');
 const origin=ready.origin;
 const init=await fetch(origin+'/local/bootstrap',{headers:{'X-Banana-Bootstrap':bootstrap},redirect:'manual'}),cookie=init.headers.get('set-cookie').split(';')[0];
 const headers={Cookie:cookie,Origin:origin,'Content-Type':'application/json'};
 const post=async(route,value)=>{const r=await fetch(origin+route,{method:'POST',headers,body:JSON.stringify(value)});return {status:r.status,body:await r.json()};};
 const config=await(await fetch(origin+'/api/workspace-config',{headers:{Cookie:cookie}})).json();
 const sourcePath=config.userId+'/refs/synthetic-source.png';
 const upload=await fetch(origin+'/local/upload',{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'image/png','X-Media-Path':encodeURIComponent(sourcePath)},body:sourcePNG});assert.equal(upload.status,200);
 const sourceURL=origin+'/storage/v1/object/authenticated/media/'+sourcePath;
 const references=[{id:'gallery-synthetic-source',data:sourceURL,mimeType:'image/png'}];
 for(const protectedEdit of [true,false]) {
  const id=protectedEdit?'synthetic-protected-edit':'synthetic-reference-generation';
  const refs=references.map(ref=>({...ref,isEditSource:protectedEdit,...(protectedEdit?{editRegion:{x:.25,y:.25,width:.5,height:.5}}:{})}));
  const submitted=await post('/api/openai-image-enqueue',{id,model:'gpt-image-2.5-sunburst',prompt:protectedEdit?'Change the selected object to blue.':'Create a completely new scene inspired by the reference.',aspectRatio:'1:1',resolution:'1K',referenceImages:refs,options:{quality:'auto',background:'opaque',outputFormat:'png',moderation:'auto'}});
  assert.equal(submitted.status,202,JSON.stringify(submitted.body));
  let row;const until=Date.now()+20_000;
  while(Date.now()<until){const result=await post('/local/query',{table:'generations',operation:'select',columns:'*',filters:[{column:'id',operator:'eq',value:id}],single:true});row=result.body.data;if(['completed','failed'].includes(row?.status))break;await new Promise(resolve=>setTimeout(resolve,100));}
  assert.equal(row?.status,'completed',row?.metadata?.error||'The local image job did not complete.');
  const result=await fetch(origin+'/storage/v1/object/authenticated/media/'+row.storage_path,{headers:{Cookie:cookie}});assert.equal(result.status,200);
  const decoded=Buffer.from(codec({operation:'decode',data:Buffer.from(await result.arrayBuffer()).toString('base64')}).data,'base64');
  if(protectedEdit){let outside=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++){if(x>=256&&x<768&&y>=256&&y<768)continue;const i=(y*width+x)*4;assert.ok(decoded.subarray(i,i+4).equals(sourcePixels.subarray(i,i+4)));outside++;}assert.ok(decoded.subarray((512*width+512)*4,(512*width+512)*4+4).equals(generatedPixels.subarray(0,4)));console.log(`Protected edit preserved ${outside} outside pixels exactly.`);}
  else {assert.ok(decoded.equals(generatedPixels));console.log('Reference-only generation used the full generated canvas without an edit mask.');}
 }
 const calls=fs.readFileSync(path.join(root,'provider-calls.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(calls.length,2);assert.ok(calls.every(call=>call.hasDataURL&&!call.hasCookie));
 console.log('Packaged app → local queue → mock provider → local gallery flow passed. No paid provider was contacted.');
} catch(error){console.error(error.message);process.exitCode=1;}
finally {if(child&&child.exitCode===null){const closed=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');await closed;}fs.rmSync(root,{recursive:true,force:true});}
