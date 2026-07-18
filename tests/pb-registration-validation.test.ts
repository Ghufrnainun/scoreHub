import * as assert from 'node:assert/strict';
import {
  ageCategory,
  documentRule,
  normalizeWhatsApp,
  todayIso,
  validateFile,
} from '../lib/pb-registration-validation.ts';

const now = new Date('2026-07-18T12:00:00Z');
assert.equal(todayIso(now), '2026-07-18');
assert.equal(ageCategory('2011-07-19', now), 'anak');
assert.equal(ageCategory('2011-07-18', now), 'taruna');
assert.equal(ageCategory('2008-07-19', now), 'taruna');
assert.equal(ageCategory('2008-07-18', now), 'dewasa');
assert.throws(() => ageCategory('2026-07-19', now), /masa depan/);
assert.throws(() => ageCategory('2026-02-30', now), /tidak valid/);
assert.equal(normalizeWhatsApp('0812-3456 7890'), '6281234567890');
assert.equal(normalizeWhatsApp('+62 812 3456 7890'), '6281234567890');
assert.throws(() => normalizeWhatsApp('021123456'), /tidak valid/);
assert.deepEqual(documentRule('anak').labels, ['KK', 'akta lahir']);
assert.deepEqual(documentRule('taruna').labels, ['kartu pelajar', 'KK', 'akta lahir']);
assert.deepEqual(documentRule('dewasa').labels, ['KTP', 'SIM']);
assert.doesNotThrow(() => validateFile('foto.jpg', 'image/jpeg', 1024, 'photo'));
assert.throws(() => validateFile('foto.pdf', 'application/pdf', 1024, 'photo'), /Pas foto/);
assert.throws(() => validateFile('ktp.exe', 'image/jpeg', 1024, 'identity'), /JPG/);
assert.throws(() => validateFile('ktp.jpg', 'image/jpeg', 2 * 1024 * 1024 + 1, 'identity'), /2 MiB/);
console.log('pb-registration-validation: 18 assertions passed');
