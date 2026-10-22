// What this repository can check by itself, with no game's files: every
// file in js/ loads beside the others as a page loads them, no two declare
// the same name, and what the files write they read back. The decoders are
// held to real archives, and to unar, by the sites that copy them (README).
//
//   node utilities/check.mjs             the checks; exit 1 if any fails
//   node utilities/check.mjs --control   each check given a fault it must
//                                        catch; exit 1 if any lets it pass
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const JS = path.join(ROOT, 'js');
const CONTROL = process.argv.includes('--control');

// The order a page loads them in: mac-bytes.js first, mac-media.js before
// mac-rsrc-types.js, mac-ppc.js before mac-ppc-asm.js; the rest need only
// mac-bytes.js.
const FIRST = ['mac-bytes.js', 'mac-media.js', 'mac-ppc.js'];
const files = fs.readdirSync(JS).filter(f => f.endsWith('.js')).sort();
const order = [...FIRST, ...files.filter(f => !FIRST.includes(f))];
const source = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(JS, f), 'utf8')]));
// The faults --control gives the first three: a file misnamed, a second
// crc32, a file that does not parse. They are checked, never loaded.
const extra = CONTROL ? { 'mac-x.js': '/* mac-y.js */\nfunction crc32(bytes) { return 0; }\n', 'mac-z.js': '/* mac-z.js */ function (' } : {};

const results = [];
const part = (name, fn) => {
  let why = null;
  try { why = fn() || null; } catch (e) { why = e.message; }
  results.push({ name, why });
};

// Every file names itself on its first line, and only js files are here.
part('names', () => {
  const all = { ...source, ...extra };
  const bad = Object.keys(all).filter(f => !all[f].startsWith('/* ' + f + ' '));
  return bad.length ? 'not named on the first line (' + bad.join(', ') + ')' : null;
});

// No top-level name in two files: a page loads them all as classic scripts,
// so the second would silently replace the first.
part('one name, one file', () => {
  const seen = new Map(), clash = [];
  const all = { ...source, ...extra };
  for (const f of Object.keys(all))
    for (const m of all[f].matchAll(/^(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)) {
      if (seen.has(m[1])) clash.push(m[1] + ' in ' + seen.get(m[1]) + ' and ' + f);
      else seen.set(m[1], f);
    }
  return clash.length ? clash.join('; ') : null;
});

// All of them, in one context, as one page.
const ctx = vm.createContext({ console, TextEncoder, TextDecoder, Uint8Array, DataView, Blob: class {}, setTimeout });
part('load', () => {
  for (const f of order) vm.runInContext(source[f], ctx, { filename: f });
  for (const f in extra) new vm.Script(extra[f], { filename: f });
});
const g = ctx;
const bytes = s => new TextEncoder().encode(s);
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const sample = n => { const b = new Uint8Array(n); let x = 12345; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; b[i] = i % 7 < 4 ? 97 + (i % 13) : x >>> 24; } return b; };
const flip = b => { const c = b.slice(); c[c.length >> 1] ^= CONTROL ? 0x10 : 0; return c; };

part('crc-32', () => {
  const v = g.crc32(flip(bytes('123456789')));
  return v === 0xCBF43926 ? null : 'crc32("123456789") is ' + v.toString(16) + ', not cbf43926';
});

part('resource fork', () => {
  const list = [
    { type: 'TEXT', id: 128, name: 'one', attrs: 0, data: bytes('the first') },
    { type: 'STR ', id: -16455, name: null, attrs: 0x20, data: sample(300) },
    { type: 'TEXT', id: 129, name: null, attrs: 0, data: new Uint8Array(0) },
  ];
  const fork = flip(g.writeResourceFork(list));
  const back = g.resourceForkSpec(g.openResourceFork(fork));
  for (const r of list) {
    const b = back.resources.find(x => x.type === r.type && x.id === r.id);
    if (!b) return r.type + ' ' + r.id + ' not read back';
    if (!same(b.data, r.data) || (b.name || null) !== r.name || b.attrs !== r.attrs) return r.type + ' ' + r.id + ' read back changed';
  }
  return same(g.writeResourceFork(back), fork) ? null : 'written again, the fork differs';
});

part('macbinary', () => {
  const f = { name: 'Ünïcode file', type: 'TEXT', creator: 'ttxt', data: sample(1000), rsrc: sample(77) };
  const back = g.sniffMacContainer(flip(g.writeMacBinary(f)));
  if (!back) return 'not recognized';
  for (const k of ['name', 'type', 'creator']) if (back[k] !== f[k]) return k + ' read back as ' + back[k];
  return same(back.data, f.data) && same(back.rsrc, f.rsrc) ? null : 'a fork read back changed';
});

part('zip', () => {
  const plain = sample(5000), packed = sample(70000);
  const zip = g.buildZipBytes([
    { name: 'stored.bin', bytes: plain },
    { name: 'folder/deflated.bin', bytes: packed, deflated: zlib.deflateRawSync(packed) },
  ]);
  const archive = g.parseZipArchive(zip);
  const z = flip(zip);
  for (const [name, expected] of [['stored.bin', plain], ['folder/deflated.bin', packed]]) {
    const e = archive.entries.find(x => x.path === name);
    if (!e) return name + ' not listed';
    if (!same(g.zipFork(z, e, 'data'), expected)) return name + ' read back changed';
  }
});

part('inflate', () => {
  for (const level of [0, 1, 6, 9]) {
    const expected = sample(200000 + level);
    const actual = g.inflateRaw(flip(zlib.deflateRawSync(expected, { level })), expected.length, 8);
    if (!same(actual, expected)) return 'level ' + level + ' inflated wrongly';
  }
});

// The PowerPC decoder and assembler, each the other's inverse on what a
// classic Mac compiler writes at a routine's entry and exit.
part('powerpc', () => {
  const words = [0x7C0802A6, 0x93E1FFFC, 0x9421FFC0, 0x7C7F1B78, 0x38600000, 0x38630001, 0x80010048,
                 0x7C0803A6, 0x4E800020, 0x2C030000, 0x5463103A, 0x7C632214, 0x83E1FFFC, 0x38210040];
  for (const w of words) {
    const d = g.ppcDecode(w);
    if (!d) return w.toString(16) + ' not decoded';
    const back = g.ppcAssemble(d.text, 0);
    const expected = (CONTROL ? w ^ 0x200000 : w) >>> 0;
    if (back >>> 0 !== expected) return d.text + ' assembled as ' + (back >>> 0).toString(16) + ', not ' + expected.toString(16);
  }
});

let failed = 0;
for (const r of results) {
  const ok = CONTROL ? r.why !== null : r.why === null;
  if (!ok) failed++;
  console.log((ok ? 'ok    ' : 'FAIL  ') + r.name.padEnd(20) + (r.why ? r.why : CONTROL ? 'the fault went uncaught' : ''));
}
console.log(CONTROL ? `${results.length - failed} of ${results.length} faults caught` : `${results.length - failed} of ${results.length} checks pass`);
process.exit(failed ? 1 : 0);
