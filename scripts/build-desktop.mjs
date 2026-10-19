import { build } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
const root=path.resolve(import.meta.dirname,'..');
const replacements={auth:'auth.mjs',openaiGuard:'guard.mjs',imageJobQueue:'queue.mjs',providerMedia:'providerMedia.mjs',rasterCodec:'rasterCodec.mjs'};
fs.mkdirSync(path.join(root,'.build/desktop'),{recursive:true});
const result=await build({entryPoints:[path.join(root,'desktop/server/main.mjs')],outfile:path.join(root,'.build/desktop/server.mjs'),platform:'node',target:'node24',format:'esm',banner:{js: "import { createRequire as __bananaCreateRequire } from 'node:module'; const require = __bananaCreateRequire(import.meta.url);"},bundle:true,packages:'bundle',external:['sharp'],sourcemap:false,metafile:true,plugins:[{name:'local-workspace-boundary',setup(build){build.onResolve({filter:/(auth|openaiGuard|imageJobQueue|providerMedia|rasterCodec)\.(js|ts)$/},args=>{
 const resolved=path.resolve(args.resolveDir,args.path);if(path.dirname(resolved)!==path.join(root,'api/_lib'))return;
 const name=path.basename(args.path).replace(/\.(js|ts)$/,'');return {path:path.join(root,'desktop/server',replacements[name])};
});}}]});
fs.writeFileSync(path.join(root,'.build/desktop/metafile.json'),JSON.stringify(result.metafile));
console.log('Built the standalone workspace server.');
