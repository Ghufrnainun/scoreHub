// No AgeCategory needed anymore
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
const identityTypes: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
};
const photoTypes: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
};

export const todayIso = (now = new Date()) => now.toISOString().slice(0, 10);

// ageCategory function removed

export function normalizeWhatsApp(value: string): string {
  const raw = value.replace(/[\s().-]/g, '');
  const normalized = raw.startsWith('08') ? `628${raw.slice(2)}` : raw.startsWith('+62') ? `62${raw.slice(3)}` : raw;
  if (!/^628\d{7,12}$/.test(normalized)) throw new Error('Nomor WhatsApp Indonesia tidak valid.');
  return normalized;
}

export function documentRule() {
  return { labels: ['KK', 'akta lahir', 'KTP'] };
}

export function validateFile(filename: string, contentType: string, size: number, kind: 'photo' | 'identity') {
  const extension = filename.toLowerCase().split('.').pop() || '';
  const types = kind === 'photo' ? photoTypes : identityTypes;
  if (!types[contentType]?.includes(extension)) throw new Error(kind === 'photo' ? 'Pas foto harus JPG, PNG, atau WEBP.' : 'Dokumen harus JPG, PNG, WEBP, atau PDF.');
  if (size <= 0 || size > MAX_FILE_SIZE) throw new Error(`File wajib diisi dan maksimal ${MAX_FILE_SIZE / (1024 * 1024)} MiB.`);
}

export function cleanText(value: string, label: string, min: number, max: number) {
  const clean = value.trim().replace(/\s+/g, ' ');
  if (clean.length < min || clean.length > max) throw new Error(`${label} harus ${min}-${max} karakter.`);
  return clean;
}
