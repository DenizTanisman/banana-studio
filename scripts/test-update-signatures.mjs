import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { generateKeyPairSync, verify as verifySignature } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

// An isolated trust test. The ephemeral signing seed stays in memory and is
// passed through stdin. No maintainer key or Keychain access is involved.
const root=path.resolve(import.meta.dirname,'..');
const toolkit=path.join(root,'desktop/macos/.build/artifacts/sparkle/Sparkle/bin');
const pair=generateKeyPairSync('ed25519');
const seed=pair.privateKey.export({format:'der',type:'pkcs8'}).subarray(-32);
const tool=path.join(toolkit,'sign_update');
const options=()=>({input:seed.toString('base64')+'\n',encoding:'utf8',timeout:15_000,stdio:['pipe','pipe','pipe']});
const run=args=>{try{return execFileSync(tool,['--ed-key-file','-',...args],options()).trim();}catch{throw new Error('Sparkle could not sign the synthetic fixture.');}};
const verify=(file,signature)=>{
 const result=spawnSync(tool,['--ed-key-file','-','--verify',file,...(signature?[signature]:[])],options());
 if(result.error)throw new Error('The Sparkle signature verifier could not run.');
 return result.status===0;
};
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'banana-update-trust-'));
try {
 const archive=path.join(temporary,'synthetic-update.zip');
 fs.writeFileSync(archive,Buffer.from('synthetic update bytes; no application or user data'));
 const signature=run(['-p',archive]);
 assert.equal(Buffer.from(signature,'base64').length,64);
 assert.ok(verifySignature(null,fs.readFileSync(archive),pair.publicKey,Buffer.from(signature,'base64')),'The archive must also verify independently with Node crypto.');
 assert.ok(verify(archive,signature),'An unchanged signed archive must verify.');
 fs.appendFileSync(archive,'tampered');
 assert.equal(verify(archive,signature),false,'A changed archive must be rejected.');
 const feed=path.join(temporary,'appcast.xml');
 fs.writeFileSync(feed,'<?xml version="1.0" encoding="utf-8"?>\n<rss version="2.0"><channel><title>Synthetic update trust test</title></channel></rss>\n');
 run([feed]);
 assert.ok(verify(feed),'An unchanged signed feed must verify.');
 fs.writeFileSync(feed,fs.readFileSync(feed,'utf8').replace('Synthetic update trust test','Altered update information'));
 assert.equal(verify(feed),false,'Changed feed content must be rejected.');
 console.log('Signed archive and feed verified; both tampered copies were rejected. No update was published.');
} finally { seed.fill(0); fs.rmSync(temporary,{recursive:true,force:true}); }
