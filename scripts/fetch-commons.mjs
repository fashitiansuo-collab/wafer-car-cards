import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatExif } from './exif.mjs';

const UA = 'TCGcar/0.1 (personal art project; local script)';
const ORDER = ['C', 'UC', 'R', 'UR', 'SEC', 'RSEC'];
const BATCH = 20;
const API = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|commonmetadata&iiurlwidth=900&titles=';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cleanAuthor(html) {
  const s = String(html ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s || 'Unknown';
}

function licenseOk(lic) {
  return /^(cc0|public domain|pd|cc by(-sa)? )/i.test(lic) || lic === 'CC BY' || lic === 'CC BY-SA';
}

async function queryBatch(titles) {
  const url = API + titles.map((t) => encodeURIComponent(t)).join('|');
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`API ${res.status} for ${titles.length} titles`);
  return res.json();
}

async function download(url, dest) {
  if (existsSync(dest) && statSync(dest).size > 0) return;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`download ${res.status} for ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const argv = process.argv.slice(2);
  const si = argv.indexOf('--series');
  const series = si >= 0 ? Number(argv[si + 1]) : 0;
  const prefixes = { 2: 'd', 3: 'e' };
  const cfg = series === 2 || series === 3
    ? { lineup: `lineup-s${series}.json`, cards: `cards-s${series}.json`, credits: `CREDITS-s${series}.md`, prefix: prefixes[series], title: `# Credits \u2014 series ${series}` }
    : { lineup: 'lineup.json', cards: 'cards.json', credits: 'CREDITS.md', prefix: 'c', title: '# Credits' };
  const lineup = JSON.parse(await readFile(join(root, 'scripts', cfg.lineup), 'utf8'));
  const sorted = [...lineup].sort((a, b) => ORDER.indexOf(a.rarity) - ORDER.indexOf(b.rarity));
  const info = new Map();
  for (let i = 0; i < sorted.length; i += BATCH) {
    // An RSEC entry also carries the stock photo it hides under (entry.stock.file).
    const batch = sorted.slice(i, i + BATCH).flatMap((e) => (e.stock ? [e.file, e.stock.file] : [e.file]));
    const data = await queryBatch(batch);
    const norm = new Map((data.query?.normalized ?? []).map((n) => [n.to, n.from]));
    for (const page of Object.values(data.query?.pages ?? {})) {
      const file = norm.get(page.title) ?? page.title;
      info.set(file, page.imageinfo?.[0]);
    }
  }
  const credit = (file) => {
    const ii = info.get(file);
    const meta = ii?.extmetadata ?? {};
    const license = String(meta.LicenseShortName?.value ?? '').trim();
    const src = ii?.thumburl ?? ii?.url;
    if (!ii || !src || !licenseOk(license)) return null;
    return { author: cleanAuthor(meta.Artist?.value), license, licenseUrl: meta.LicenseUrl?.value ?? '', sourceUrl: ii.descriptionurl ?? '', thumburl: src, exif: formatExif(ii.commonmetadata ?? []) };
  };
  const accepted = [];
  let rejected = 0;
  for (const e of sorted) {
    if (e.stock && !credit(e.stock.file)) {
      console.error(`REJECT stock ${e.stock.file}`);
      rejected++;
      continue;
    }
    const ii = info.get(e.file);
    const meta = ii?.extmetadata ?? {};
    const license = String(meta.LicenseShortName?.value ?? '').trim();
    const src = ii?.thumburl ?? ii?.url;
    if (!ii || !src || !licenseOk(license)) {
      console.error(`REJECT ${e.file} ${license}`);
      rejected++;
      continue;
    }
    accepted.push({
      entry: e,
      author: cleanAuthor(meta.Artist?.value),
      license,
      licenseUrl: meta.LicenseUrl?.value ?? '',
      sourceUrl: ii.descriptionurl ?? '',
      thumburl: src,
      exif: formatExif(ii.commonmetadata ?? []),
    });
  }
  await mkdir(join(root, 'public', 'cards'), { recursive: true });
  const cards = [];
  let n = 0;
  for (const a of accepted) {
    n++;
    const id = cfg.prefix + String(n).padStart(3, '0');
    await download(a.thumburl, join(root, 'public', 'cards', `${id}.jpg`));
    const card = {
      id,
      no: n,
      rarity: a.entry.rarity,
      maker: a.entry.maker,
      model: a.entry.model,
      year: a.entry.year,
      country: a.entry.country,
      image: `./cards/${id}.jpg`,
    };
    if (series) card.series = series;
    if (a.entry.focus) card.focus = a.entry.focus;
    card.exif = a.exif;
    if (a.entry.frame) card.frame = a.entry.frame;
    if (a.entry.focusManual) card.focusManual = true;
    card.credit = { author: a.author, license: a.license, licenseUrl: a.licenseUrl, sourceUrl: a.sourceUrl, modified: true };
    for (const k of ['spec', 'flavor']) if (a.entry[k]) card[k] = a.entry[k];
    if (a.entry.stock) {
      // RSEC: the common-looking card on top, peeled off to show the race photo.
      const st = credit(a.entry.stock.file);
      await sleep(300);
      await download(st.thumburl, join(root, 'public', 'cards', `${id}-stock.jpg`));
      card.stock = {
        image: `./cards/${id}-stock.jpg`,
        model: a.entry.stock.model,
        frame: a.entry.stock.frame ?? 'gallery',
        exif: st.exif,
        credit: { author: st.author, license: st.license, licenseUrl: st.licenseUrl, sourceUrl: st.sourceUrl, modified: true },
      };
      if (a.entry.stock.focus) card.stock.focus = a.entry.stock.focus;
    }
    cards.push(card);
    if (n < accepted.length) await sleep(300);
  }
  await mkdir(join(root, 'src', 'data'), { recursive: true });
  await writeFile(join(root, 'src', 'data', cfg.cards), JSON.stringify(cards, null, 2) + '\n');
  const lines = [cfg.title, '', 'All photos are from Wikimedia Commons and were cropped and colour-graded (modified) for use as card art.', ''];
  accepted.forEach((a, i) => {
    const no = 'No.' + String(i + 1).padStart(3, '0');
    lines.push(`- ${no} — ${a.author} — [${a.license}](${a.licenseUrl}) — [source](${a.sourceUrl}) — modified`);
    const st = a.entry.stock && credit(a.entry.stock.file);
    if (st) lines.push(`  - (under) ${st.author} — [${st.license}](${st.licenseUrl}) — [source](${st.sourceUrl}) — modified`);
  });
  await writeFile(join(root, cfg.credits), lines.join('\n') + '\n');
  console.log(`accepted: ${accepted.length}`);
  console.log(`rejected: ${rejected}`);
  for (const r of ORDER) console.log(`${r}: ${accepted.filter((a) => a.entry.rarity === r).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
