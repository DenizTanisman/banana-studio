import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const lock=JSON.parse(fs.readFileSync(path.join(root,'desktop/node-runtime.json')));
const release=lock.releases[`darwin-${process.arch}`];
if(process.platform!=='darwin'||!release)throw new Error('This helper downloads a pinned official runtime for the current Mac architecture only.');
const url=new URL(release.url);
if(url.protocol!=='https:'||url.hostname!=='nodejs.org'||url.username||url.password)throw new Error('The runtime must come from the official Node.js distribution host.');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
fs.mkdirSync(path.join(root,'.build'),{recursive:true});
const temporary=fs.mkdtempSync(path.join(root,'.build/node-download-'));
try {
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(120_000)});
 if(!response.ok||!response.body)throw new Error('The pinned official Node.js runtime could not be downloaded.');
 let length=0;const parts=[];
 for await(const part of response.body){length+=part.length;if(length>100*1024*1024)throw new Error('The runtime archive exceeds the expected size limit.');parts.push(part);}
 const bytes=Buffer.concat(parts);
 if(digest(bytes)!==release.archiveSha256)throw new Error('Runtime archive checksum mismatch. Nothing was extracted.');
 const archive=path.join(temporary,'official-node.tar.gz');fs.writeFileSync(archive,bytes,{mode:0o600});
 execFileSync('/usr/bin/tar',['-xzf',archive,'-C',temporary],{stdio:['ignore','pipe','pipe']});
 const extracted=path.join(temporary,`node-v${lock.version}-darwin-${process.arch}`);
 if(digest(fs.readFileSync(path.join(extracted,'bin/node')))!==release.binarySha256||digest(fs.readFileSync(path.join(extracted,'LICENSE')))!==release.licenseSha256)throw new Error('Extracted runtime or license checksum mismatch.');
 const target=path.join(root,'.build/node-runtime');fs.rmSync(target,{recursive:true,force:true});fs.renameSync(extracted,target);
 console.log('.build/node-runtime/bin/node');
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
