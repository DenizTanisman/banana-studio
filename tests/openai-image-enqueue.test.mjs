import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Auth, routing, storage and reference uploads are stubbed; the saved job is already completed.
const stubs = {
  providerRouting: 'export const selectProvider=async()=>"openai";',
  authService: 'const s={access_token:"t",user:{id:"u1"}};export const supabase={};export const getSession=async()=>s;',
  storageService: 'export const getImageById=async id=>({id,status:"completed",url:"https://done"});export const uploadBase64ToPublicUrl=async()=>"p";export const refreshMediaAccessUrl=async v=>v;',
  referenceUploadCache: 'export const createReferenceUploader=()=>async()=>"path";',
  imagePrompting: 'export const validateImageGenerationReferences=()=>{};',
};
const stubbed = new RegExp(`/(${Object.keys(stubs).join('|')})$`);
// A relative entry with absWorkingDir: an absolute Windows entry (D:\\...) would match the package filter below.
const out = await build({ entryPoints: ['src/services/openaiImageService.ts'], absWorkingDir: fileURLToPath(new URL('..', import.meta.url)), bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
  plugins: [{ name: 'stubs', setup(b) {
    b.onResolve({ filter: stubbed }, args => ({ path: args.path.match(stubbed)[1], namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents: stubs[args.path], loader: 'js' }));
    b.onResolve({ filter: /^[^./]/ }, args => args.path.startsWith('node:') ? undefined : { path: import.meta.resolve(args.path), external: true });
  } }] });
const { generateOpenAIImage } = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));

let count = 0;
const enqueue = async (status, body) => {
  globalThis.fetch = async () => ({ status, ok: status < 300,
    json: () => body === undefined ? Promise.reject(new DOMException('The operation timed out.', 'TimeoutError')) : Promise.resolve(body) });
  const id = `img-${count++}`;
  return generateOpenAIImage({ prompt: 'p', imageModel: 'nano', aspectRatio: '1:1', resolution: '1K', referenceImages: [] }, 'p', { id });
};

test('an accepted enqueue whose body times out reconnects to the saved job', async () => {
  assert.equal((await enqueue(202)).url, 'https://done');
});

test('an unreadable or rejected non-202 enqueue still fails', async () => {
  await assert.rejects(enqueue(400), /Image queue request failed \(400\)/);
  await assert.rejects(enqueue(202, { durable: false }), /Image queue request failed \(202\)/);
});
