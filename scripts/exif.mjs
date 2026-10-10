function first(value) {
  while (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    value = value[0];
  }
  return value;
}

function get(meta, name) {
  if (!Array.isArray(meta)) return undefined;
  for (const item of meta) {
    if (item && item.name === name) return first(item.value);
  }
  return undefined;
}

function collapse(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

function toFloat(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return null;
    if (s.includes('/')) {
      const parts = s.split('/');
      const n = Number(parts[0].trim());
      const d = Number(parts[1].trim());
      if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
      return n / d;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a || 1;
}

function formatCamera(makeRaw, modelRaw) {
  if (modelRaw === undefined || modelRaw === null) return null;
  let model = collapse(modelRaw);
  if (!model) return null;
  const make = makeRaw === undefined || makeRaw === null ? '' : collapse(makeRaw);
  if (make) {
    const word = make.split(' ')[0];
    if (word && !model.toLowerCase().startsWith(word.toLowerCase())) {
      model = collapse(make + ' ' + model);
    }
  }
  return model || null;
}

function formatFocal(raw) {
  const v = toFloat(raw);
  if (v === null || !(v > 0)) return null;
  if (v < 10) return String(Math.round(v * 10) / 10) + 'mm';
  return String(Math.round(v)) + 'mm';
}

function formatFNumber(raw) {
  const v = toFloat(raw);
  if (v === null || !(v > 0)) return null;
  return 'F' + String(Math.round(v * 10) / 10);
}

function formatSeconds(v) {
  return String(Math.round(v * 10) / 10) + 's';
}

function formatShutter(raw) {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'string' && raw.includes('/')) {
    const parts = raw.split('/');
    const n = Number(parts[0].trim());
    const d = Number(parts[1].trim());
    if (!Number.isFinite(n) || !Number.isFinite(d) || n <= 0 || d <= 0) return null;
    if (Number.isInteger(n) && Number.isInteger(d)) {
      const g = gcd(n, d);
      const sn = n / g;
      const sd = d / g;
      if (sd === 1) return formatSeconds(sn);
      if (sn === 1) return '1/' + sd + 's';
    }
  }
  const v = toFloat(raw);
  if (v === null || !(v > 0)) return null;
  if (v >= 1) return formatSeconds(v);
  const n = Math.round(1 / v);
  if (!(n > 0)) return null;
  return '1/' + n + 's';
}

function formatSettings(meta) {
  const parts = [];
  const focal = formatFocal(get(meta, 'FocalLength'));
  if (focal) parts.push(focal);
  const aperture = formatFNumber(get(meta, 'FNumber'));
  if (aperture) parts.push(aperture);
  const shutter = formatShutter(get(meta, 'ExposureTime'));
  if (shutter) parts.push(shutter);
  const iso = get(meta, 'ISOSpeedRatings') ?? get(meta, 'PhotographicSensitivity');
  if (iso !== undefined && iso !== null && String(iso).trim() !== '') {
    parts.push('ISO' + String(iso).trim());
  }
  return parts.length ? parts.join(' ') : null;
}

function formatDate(raw) {
  if (raw === undefined || raw === null) return null;
  const m = String(raw).match(/(\d{4})[:\-](\d{2})[:\-](\d{2})/);
  if (!m) return null;
  return m[1] + '/' + m[2] + '/' + m[3];
}

export function formatExif(meta) {
  const camera = formatCamera(get(meta, 'Make'), get(meta, 'Model'));
  const settings = formatSettings(meta);
  const date = formatDate(get(meta, 'DateTimeOriginal') ?? get(meta, 'DateTime'));
  return { camera, settings, date };
}
