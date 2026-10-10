import { describe, expect, it } from 'vitest';
import { formatExif } from '../scripts/exif.mjs';

const item = (name: string, value: unknown) => ({ name, value });

describe('formatExif camera', () => {
  it('keeps Model when it already starts with Make', () => {
    expect(formatExif([item('Make', 'Canon'), item('Model', 'Canon EOS 5D Mark III')]).camera).toBe('Canon EOS 5D Mark III');
  });

  it('matches on the first word of Make only', () => {
    expect(formatExif([item('Make', 'NIKON CORPORATION'), item('Model', 'NIKON D750')]).camera).toBe('NIKON D750');
  });

  it('prefixes Make when Model lacks it', () => {
    expect(formatExif([item('Make', 'FUJIFILM'), item('Model', 'X-T3')]).camera).toBe('FUJIFILM X-T3');
  });

  it('collapses whitespace and trims', () => {
    expect(formatExif([item('Make', 'Canon'), item('Model', '  Canon   EOS   5D  ')]).camera).toBe('Canon EOS 5D');
  });

  it('is null without Model', () => {
    expect(formatExif([item('Make', 'Canon')]).camera).toBeNull();
    expect(formatExif([]).camera).toBeNull();
  });
});

describe('formatExif settings', () => {
  it('formats rational focal lengths', () => {
    expect(formatExif([item('FocalLength', '70/1')]).settings).toBe('70mm');
  });

  it('formats plain and numeric focal lengths', () => {
    expect(formatExif([item('FocalLength', '35')]).settings).toBe('35mm');
    expect(formatExif([item('FocalLength', 24.5)]).settings).toBe('25mm');
  });

  it('keeps one decimal under 10mm', () => {
    expect(formatExif([item('FocalLength', 5.9)]).settings).toBe('5.9mm');
  });

  it('formats aperture and drops trailing .0', () => {
    expect(formatExif([item('FNumber', '28/10')]).settings).toBe('F2.8');
    expect(formatExif([item('FNumber', '40/10')]).settings).toBe('F4');
    expect(formatExif([item('FNumber', 4)]).settings).toBe('F4');
  });

  it('formats rational shutters', () => {
    expect(formatExif([item('ExposureTime', '1/1000')]).settings).toBe('1/1000s');
    expect(formatExif([item('ExposureTime', '10/2000')]).settings).toBe('1/200s');
  });

  it('formats numeric shutters', () => {
    expect(formatExif([item('ExposureTime', 0.004)]).settings).toBe('1/250s');
    expect(formatExif([item('ExposureTime', '0.5')]).settings).toBe('1/2s');
    expect(formatExif([item('ExposureTime', 2)]).settings).toBe('2s');
  });

  it('formats ISO from either key', () => {
    expect(formatExif([item('ISOSpeedRatings', 100)]).settings).toBe('ISO100');
    expect(formatExif([item('PhotographicSensitivity', '100')]).settings).toBe('ISO100');
  });

  it('joins parts in focal/aperture/shutter/ISO order', () => {
    const meta = [
      item('FocalLength', '70/1'),
      item('FNumber', '28/10'),
      item('ExposureTime', '10/2000'),
      item('ISOSpeedRatings', 100),
    ];
    expect(formatExif(meta).settings).toBe('70mm F2.8 1/200s ISO100');
  });

  it('is null with no settings parts', () => {
    expect(formatExif([]).settings).toBeNull();
  });
});

describe('formatExif date', () => {
  it('converts colon dates', () => {
    expect(formatExif([item('DateTimeOriginal', '2016:07:30 14:22:05')]).date).toBe('2016/07/30');
  });

  it('accepts dash dates and the DateTime fallback', () => {
    expect(formatExif([item('DateTimeOriginal', '2016-07-30 14:22:05')]).date).toBe('2016/07/30');
    expect(formatExif([item('DateTime', '2016:07:30 14:22:05')]).date).toBe('2016/07/30');
  });

  it('is null when unknown', () => {
    expect(formatExif([]).date).toBeNull();
    expect(formatExif([item('DateTimeOriginal', 'yesterday')]).date).toBeNull();
  });
});

describe('formatExif edge cases', () => {
  it('returns all null for an empty array', () => {
    expect(formatExif([])).toEqual({ camera: null, settings: null, date: null });
  });

  it('picks the first scalar from nested value arrays', () => {
    const meta = [
      item('Make', ['Canon']),
      item('Model', [['Canon EOS 5D Mark III']]),
      item('FocalLength', [['70/1']]),
      item('ISOSpeedRatings', [[100]]),
    ];
    expect(formatExif(meta)).toEqual({ camera: 'Canon EOS 5D Mark III', settings: '70mm ISO100', date: null });
  });
});
