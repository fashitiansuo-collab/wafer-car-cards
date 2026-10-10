import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const W = 256;
const H = 256;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function crcTable() {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
}

const TABLE = crcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function encodePng(w, h, colorType, raw) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

function noiseRaw(rand) {
  const raw = Buffer.alloc(H * (1 + W * 2));
  let o = 0;
  for (let y = 0; y < H; y++) {
    raw[o++] = 0;
    for (let x = 0; x < W; x++) {
      raw[o++] = Math.floor(rand() * 256);
      raw[o++] = 255;
    }
  }
  return raw;
}

function glitterRaw(rand) {
  const raw = Buffer.alloc(H * (1 + W * 4));
  const at = (x, y) => y * (1 + W * 4) + 1 + x * 4;
  const dot = (x, y, a) => {
    const p = at(x, y);
    raw[p] = 255;
    raw[p + 1] = 255;
    raw[p + 2] = 255;
    raw[p + 3] = a;
  };
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0;
    for (let x = 0; x < W; x++) {
      if (rand() < 0.012) dot(x, y, 160 + Math.floor(rand() * 96));
    }
  }
  for (let s = 0; s < 40; s++) {
    const cx = 1 + Math.floor(rand() * (W - 2));
    const cy = 1 + Math.floor(rand() * (H - 2));
    dot(cx, cy, 255);
    dot(cx - 1, cy, 255);
    dot(cx + 1, cy, 255);
    dot(cx, cy - 1, 255);
    dot(cx, cy + 1, 255);
  }
  return raw;
}

function main() {
  mkdirSync(join(root, 'public', 'fx'), { recursive: true });
  const noise = encodePng(W, H, 4, noiseRaw(mulberry32(7)));
  const glitter = encodePng(W, H, 6, glitterRaw(mulberry32(7)));
  const p1 = join(root, 'public', 'fx', 'noise.png');
  const p2 = join(root, 'public', 'fx', 'glitter.png');
  writeFileSync(p1, noise);
  writeFileSync(p2, glitter);
  console.log(`public/fx/noise.png ${noise.length} bytes`);
  console.log(`public/fx/glitter.png ${glitter.length} bytes`);
}

main();
