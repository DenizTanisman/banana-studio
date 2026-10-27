import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const tempFile = fileURLToPath(new URL('./.temp-youtube.mjs', import.meta.url));
try {
  await build({
    entryPoints: [fileURLToPath(new URL('../api/youtube.ts', import.meta.url))],
    bundle: true,
    outfile: tempFile,
    format: 'esm',
    platform: 'node',
    packages: 'external',
    plugins: [{ name: 'synthetic-auth', setup(builder) {
      builder.onResolve({ filter: /\/auth\.js$/ }, () => ({ path: 'auth', namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const applyCors=()=>{}; export const requireUser=async()=>({id:"synthetic-user"});' }));
    } }],
  });

  const { default: handler, sanitizeYoutubeParams, buildYoutubeRequestUrl } = await import(pathToFileURL(tempFile).href);

  test('youtube proxy strictly enforces server api key and rejects client key overrides', () => {
    const serverKey = 'AIzaSyRealServerKey12345';
    const attackerKey = 'AIzaSyAttackerInjectedKey999';

    const url = buildYoutubeRequestUrl('videos', serverKey, {
      key: attackerKey,
      KEY: attackerKey,
      id: 'dQw4w9WgXcQ',
      part: 'snippet,contentDetails',
    });

    assert.ok(url instanceof URL);
    assert.equal(url.searchParams.get('key'), serverKey);
    assert.notEqual(url.searchParams.get('key'), attackerKey);
    assert.equal(url.searchParams.get('id'), 'dQw4w9WgXcQ');
  });

  test('youtube proxy allowlists valid query parameters and drops unauthorized fields', () => {
    const sanitized = sanitizeYoutubeParams({
      part: 'snippet,contentDetails',
      id: 'test-video-id',
      forHandle: '@channelhandle',
      q: 'search query',
      untrustedParam: 'should-be-dropped',
      webhook: 'https://attacker.invalid',
    });

    assert.deepEqual(sanitized, {
      part: 'snippet,contentDetails',
      id: 'test-video-id',
      forHandle: '@channelhandle',
      q: 'search query',
    });
  });

  test('youtube proxy bounds maxResults to protect api quotas', () => {
    assert.equal(sanitizeYoutubeParams({ maxResults: '10' }).maxResults, '10');
    assert.equal(sanitizeYoutubeParams({ maxResults: '100' }).maxResults, '50');
    assert.equal(sanitizeYoutubeParams({ maxResults: '99999' }).maxResults, '50');
    assert.equal(sanitizeYoutubeParams({ maxResults: '-1' }).maxResults, undefined);
    assert.equal(sanitizeYoutubeParams({ maxResults: 'invalid' }).maxResults, undefined);
  });

  test('youtube proxy rejects unsupported endpoints', () => {
    const serverKey = 'AIzaSyRealServerKey12345';

    assert.equal(buildYoutubeRequestUrl('unsupportedEndpoint', serverKey), null);
    assert.equal(buildYoutubeRequestUrl('comments', serverKey), null);
    assert.equal(buildYoutubeRequestUrl('../escape', serverKey), null);
    assert.ok(buildYoutubeRequestUrl('videos', serverKey) instanceof URL);
    assert.ok(buildYoutubeRequestUrl('channels', serverKey) instanceof URL);
    assert.ok(buildYoutubeRequestUrl('playlistItems', serverKey) instanceof URL);
    assert.ok(buildYoutubeRequestUrl('search', serverKey) instanceof URL);
  });

  test('upstream failures never disclose repeated credentials to logs or clients',async t=>{
    const previous=process.env.YOUTUBE_API_KEY,key='synthetic-youtube-credential';
    process.env.YOUTUBE_API_KEY=key;
    t.after(()=>{if(previous===undefined)delete process.env.YOUTUBE_API_KEY;else process.env.YOUTUBE_API_KEY=previous;});
    t.mock.method(globalThis,'fetch',async()=>{throw new Error(`request ${key} failed again ${key}`);});
    const logged=t.mock.method(console,'error',()=>{});
    const response={statusCode:200,status(code){this.statusCode=code;return this;},json(value){this.body=value;return this;}};
    await handler({method:'POST',headers:{},body:{endpoint:'videos',params:{part:'snippet',id:'synthetic'}}},response);
    assert.equal(response.statusCode,500);
    assert.deepEqual(response.body,{error:'YouTube request failed'});
    assert.ok(!JSON.stringify(logged.mock.calls).includes(key));
  });
} finally {
  fs.rmSync(tempFile, { force: true });
}
