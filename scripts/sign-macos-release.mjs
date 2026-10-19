import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { auditDistribution } from './audit-distribution.mjs';

const root=path.resolve(import.meta.dirname,'..');
const run=(command,args,options={})=>execFileSync(command,args,{encoding:'utf8',maxBuffer:8*1024*1024,...options});
const readPlist=(app,key)=>run('/usr/libexec/PlistBuddy',['-c','Print :'+key,path.join(app,'Contents/Info.plist')]).trim();
const machoMagic=new Set(['feedface','feedfacf','cefaedfe','cffaedfe','cafebabe','bebafeca','cafebabf']);
export function signMacRelease(app) {
 const identity=process.env.BANANA_SIGNING_IDENTITY,profile=process.env.BANANA_NOTARY_PROFILE;
 if(!identity||!profile)throw new Error('Developer ID and a Keychain notarization profile are required for an official release.');
 if(readPlist(app,'BananaDevelopmentBuild')!=='false')throw new Error('A development app cannot be published as an official release.');
 const privateMarkers=Object.entries(process.env).filter(([name,value])=>/(?:KEY|TOKEN|SECRET|PASSWORD)$/.test(name)&&value?.length>=16).map(([,value])=>value);
 const audit=auditDistribution(app,{privateMarkers});if(!audit.ok)throw new Error('App privacy audit failed. No release was produced.');
 const toolkit=path.join(root,'desktop/macos/.build/artifacts/sparkle/Sparkle/bin');
 const publicKey=run(path.join(toolkit,'generate_keys'),['--account','banana-studio','-p']).trim();
 if(publicKey!==readPlist(app,'SUPublicEDKey'))throw new Error('The update signing account does not match this app public key.');
 const files=[],containers=[];
 const visit=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);if(entry.isSymbolicLink())continue;
  if(entry.isDirectory()){visit(file);if(/\.(?:app|framework|xpc)$/.test(entry.name))containers.push(file);}
  else {const handle=fs.openSync(file,'r');const bytes=Buffer.alloc(4);fs.readSync(handle,bytes,0,4,0);fs.closeSync(handle);if(machoMagic.has(bytes.toString('hex')))files.push(file);}
 }};visit(app);
 const runtime=path.join(app,'Contents/Resources/runtime/node'),main=path.join(app,'Contents/MacOS/BananaStudio');
 for(const file of files.filter(file=>file!==main)){
  const args=['--force','--options','runtime','--timestamp','--sign',identity];
  if(file===runtime)args.push('--entitlements',path.join(root,'desktop/macos/Resources/Node.entitlements'));
  else args.push('--preserve-metadata=identifier,entitlements');
  run('/usr/bin/codesign',[...args,file],{stdio:'inherit'});
 }
 for(const container of containers.sort((a,b)=>b.split(path.sep).length-a.split(path.sep).length))run('/usr/bin/codesign',['--force','--options','runtime','--timestamp','--sign',identity,'--preserve-metadata=identifier,entitlements',container],{stdio:'inherit'});
 run('/usr/bin/codesign',['--force','--options','runtime','--timestamp','--sign',identity,app],{stdio:'inherit'});
 run('/usr/bin/codesign',['--verify','--deep','--strict',app],{stdio:'inherit'});
 const version=readPlist(app,'CFBundleShortVersionString'),build=readPlist(app,'CFBundleVersion');
 const directory=path.join(root,'release-artifacts',version);fs.mkdirSync(directory,{recursive:true});
 const filename=`Banana-Studio-${version}-macos-${process.arch}.zip`,archive=path.join(directory,filename);
 const zip=()=>run('/usr/bin/ditto',['-c','-k','--sequesterRsrc','--keepParent',app,archive]);zip();
 // Credentials are referenced by Keychain profile. Passwords/API keys never
 // appear in arguments, environment substitutions, app files or release notes.
 const notarized=JSON.parse(run('/usr/bin/xcrun',['notarytool','submit',archive,'--keychain-profile',profile,'--wait','--output-format','json']));
 if(notarized.status!=='Accepted')throw new Error('Apple did not accept this release. The archive was not approved for publication.');
 run('/usr/bin/xcrun',['stapler','staple',app],{stdio:'inherit'});run('/usr/bin/xcrun',['stapler','validate',app],{stdio:'inherit'});
 run('/usr/sbin/spctl',['--assess','--type','execute','--verbose=2',app],{stdio:'inherit'});
 if(!auditDistribution(app,{privateMarkers}).ok)throw new Error('The final signed app failed its privacy audit.');
 zip();
 const signature=run(path.join(toolkit,'sign_update'),['--account','banana-studio','-p',archive]).trim();
 if(Buffer.from(signature,'base64').length!==64)throw new Error('The archive signature could not be verified.');
 run(path.join(toolkit,'sign_update'),['--account','banana-studio','--verify',archive,signature]);
 const feed=path.join(directory,`appcast-${process.arch}.xml`);
 const url=`https://github.com/orkunisitmak/banana-studio/releases/download/v${version}/${filename}`;
 fs.writeFileSync(feed,`<?xml version="1.0" encoding="utf-8"?>\n<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle"><channel><title>Banana Studio</title><link>https://github.com/orkunisitmak/banana-studio</link><description>Signed Banana Studio updates</description><item><title>Banana Studio ${version}</title><sparkle:version>${build}</sparkle:version><sparkle:shortVersionString>${version}</sparkle:shortVersionString><sparkle:minimumSystemVersion>13.5.0</sparkle:minimumSystemVersion>${process.arch==='arm64'?'<sparkle:hardwareRequirements>arm64</sparkle:hardwareRequirements>':''}<pubDate>${new Date().toUTCString()}</pubDate><description>Application update. Your local data and Keychain entries stay on this Mac.</description><enclosure url="${url}" sparkle:edSignature="${signature}" length="${fs.statSync(archive).size}" type="application/octet-stream" /></item></channel></rss>\n`);
 run(path.join(toolkit,'sign_update'),['--account','banana-studio',feed]);run(path.join(toolkit,'sign_update'),['--account','banana-studio','--verify',feed]);
 fs.writeFileSync(path.join(directory,'verification.json'),JSON.stringify({version,build,architecture:process.arch,notarization:'Accepted',signatureVerified:true,privacyAuditPassed:true,archive:filename},null,2)+'\n');
 return {archive,feed,version,build};
}
