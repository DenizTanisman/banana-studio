import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
// Runs the exact Controls attach handlers. onChange behaves like React setState:
// a functional update sees the latest draft, so file reads that await must use one.
const src = readFileSync(new URL('../src/components/Controls.tsx', import.meta.url), 'utf8');
const audio = src.slice(src.indexOf('  const handleAudioFileUpload = async'), src.indexOf('\n  };', src.indexOf('  const handleAudioFileUpload = async')) + 5);
const pif = src.slice(src.indexOf('  const processImageFiles = async'), src.indexOf('  // --- Upload Handlers ---'));
const ds = src.indexOf('    // 1. Handle Desktop Files', src.indexOf('  const handleDrop = async'));
const drop = src.slice(ds, src.indexOf('    // 2. Handle Gallery Drops', ds));
const code = transformSync(`module.exports = env => { let { config, onChange, setAttachmentError, maxReferenceImages, maxReferenceVideos, maxReferenceAudios, isH3VideoConfig, readFileAsBase64, getMimeType, estimateBase64Size, compressImage, processVideoFiles, readAudioDuration, URL, audioInputRef } = env;
  ${audio}
  ${pif}
  return { processImageFiles, handleAudioFileUpload, drop: async e => { ${drop} } }; };`, { loader: 'ts', format: 'cjs' }).code;
const setup = (start, gate, max = 14) => {
  let state = start;
  const env = { config: start, onChange: v => { state = typeof v === 'function' ? v(state) : v; }, setAttachmentError() {},
    maxReferenceImages: max, maxReferenceVideos: 3, maxReferenceAudios: 3, isH3VideoConfig: false,
    readFileAsBase64: async f => { if (gate) await gate; return 'data:' + f.name; }, getMimeType: f => f.type, estimateBase64Size: () => 10, compressImage: async d => d,
    processVideoFiles: async files => { env.onChange(prev => ({ ...prev, referenceVideos: [...(prev.referenceVideos || []), ...files.map(f => ({ id: f.name }))], mode: 'video' })); },
    readAudioDuration: async () => { if (gate) await gate; return 3; }, audioInputRef: { current: null }, URL: { createObjectURL: f => 'blob:' + f.name } };
  const mod = { exports: {} }; new Function('module', code)(mod);
  return { api: mod.exports(env), env, get: () => state };
};

const base = { prompt: 'old', mode: 'image', referenceImages: [], referenceVideos: [], referenceAudios: [] };
const file = (name, type) => ({ name, type });
const gated = () => { let release; const gate = new Promise(r => { release = r; }); return { gate, release }; };

test('one drop with an image, a video and an audio file keeps all three', async () => {
  const t = setup(base);
  await t.api.drop({ dataTransfer: { files: [file('i.png', 'image/png'), file('v.mp4', 'video/mp4'), file('a.mp3', 'audio/mpeg')] } });
  assert.deepEqual([t.get().referenceImages.length, t.get().referenceVideos.length, t.get().referenceAudios.length, t.get().mode], [1, 1, 1, 'video']);
});

test('text typed while an image or audio file is read is kept', async () => {
  for (const kind of ['image', 'audio']) {
    const g = gated(); const t = setup({ ...base, mode: 'video' }, g.gate);
    const pending = kind === 'image' ? t.api.processImageFiles([file('x.png', 'image/png')]) : t.api.handleAudioFileUpload({ target: { files: [file('a.mp3', 'audio/mpeg')] } });
    t.env.onChange(prev => ({ ...prev, prompt: 'typed meanwhile' }));
    g.release(); await pending;
    assert.equal(t.get().prompt, 'typed meanwhile');
    assert.equal(kind === 'image' ? t.get().referenceImages.length : t.get().referenceAudios.length, 1);
  }
});

test('two overlapping pastes keep both images and respect the limit of the latest draft', async () => {
  let g = gated(); let t = setup(base, g.gate);
  let calls = [t.api.processImageFiles([file('a.png', 'image/png')]), t.api.processImageFiles([file('b.png', 'image/png')])];
  g.release(); await Promise.all(calls);
  assert.deepEqual(t.get().referenceImages.map(x => x.data), ['data:a.png', 'data:b.png']);
  g = gated(); t = setup({ ...base, referenceImages: Array.from({ length: 12 }, (_, i) => ({ id: 'r' + i })) }, g.gate);
  calls = [t.api.processImageFiles([file('a.png', 'image/png'), file('b.png', 'image/png')]), t.api.processImageFiles([file('c.png', 'image/png'), file('d.png', 'image/png')])];
  g.release(); await Promise.all(calls);
  assert.equal(t.get().referenceImages.length, 14);
});
