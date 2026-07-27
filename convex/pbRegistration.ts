import { v, ConvexError } from 'convex/values';
import { action, internalQuery, mutation, query } from './_generated/server';
import { internal } from './_generated/api';
import { getAdminSession, hashSecret, generateToken, ADMIN_SESSION_TTL_MS } from './utils';
// import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ageCategory, cleanText, normalizeWhatsApp, validateFile } from '../lib/pb-registration-validation';

const category = v.union(v.literal('anak'), v.literal('taruna'), v.literal('dewasa'));
const status = v.union(v.literal('baru'), v.literal('valid'), v.literal('revisi'), v.literal('sudah_input_pbsi'));
const docType = v.union(v.literal('foto_profil'), v.literal('dokumen_identitas'));
const clean = (value: string) => value.trim().replace(/\s+/g, ' ');
function fileMeta(filename: string, contentType: string, size: number, type: 'foto_profil' | 'dokumen_identitas') { try { validateFile(filename, contentType, size, type === 'foto_profil' ? 'photo' : 'identity'); } catch (error) { throw new ConvexError((error as Error).message); } }

async function assertPBAdminSession(ctx: any, token?: string): Promise<void> {
  const session = await getAdminSession(ctx, token);
  if (session.scope !== 'pb' && session.isTemporary) {
    throw new ConvexError('Akses ditolak: Diperlukan sesi Admin Pendaftaran PB.');
  }
  if (typeof ctx.db.patch === 'function') {
    await ctx.db.patch(session._id, { lastUsedAt: Date.now() });
  }
}

export const verifyAdminPBPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    const inputPin = args.pin.trim();
    const now = Date.now();

    const pbCred = await ctx.db.query('admin_credentials').withIndex('by_key', q => q.eq('key', 'pb_admin_pin')).unique();
    const masterCred = await ctx.db.query('admin_credentials').withIndex('by_key', q => q.eq('key', 'master_pin')).unique();

    let isValid = false;
    const pinHash = await hashSecret(inputPin);

    if (pbCred && pinHash === pbCred.pinHash) {
      isValid = true;
    } else if (!pbCred && inputPin === (process.env.PB_ADMIN_PASSWORD || 'pb123456')) {
      isValid = true;
    } else if (masterCred && pinHash === masterCred.pinHash) {
      isValid = true;
    } else if (!masterCred && inputPin === (process.env.ADMIN_PASSWORD || '123456')) {
      isValid = true;
    }

    if (!isValid) {
      throw new ConvexError('PIN Admin Pendaftaran PB tidak valid.');
    }

    const token = generateToken(24);
    const tokenHash = await hashSecret(token);
    const sessionExpiresAt = now + ADMIN_SESSION_TTL_MS;

    await ctx.db.insert('admin_sessions', {
      tokenHash,
      expiresAt: sessionExpiresAt,
      createdAt: now,
      lastUsedAt: now,
      isTemporary: false,
      label: 'Admin Pendaftaran PB',
      scope: 'pb',
    });

    return { token, expiresAt: sessionExpiresAt, label: 'Admin Pendaftaran PB' };
  }
});

export const create = mutation({ args: { fullName: v.string(), dob: v.string(), gender: v.union(v.literal('putra'), v.literal('putri')), club: v.string(), whatsapp: v.string(), email: v.optional(v.string()), provinceCode: v.string(), regencyCode: v.string(), districtCode: v.string(), villageCode: v.string(), addressDetail: v.string() }, handler: async (ctx, args) => { try { const fullName = cleanText(args.fullName, 'Nama', 3, 100), club = cleanText(args.club, 'Klub', 2, 100), addressDetail = cleanText(args.addressDetail, 'Detail alamat', 5, 300), email = args.email?.trim().toLowerCase() || undefined; if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new Error('Email tidak valid.'); const codes = [args.provinceCode, args.regencyCode, args.districtCode, args.villageCode]; const regions = await Promise.all(codes.map(code => ctx.db.query('regions').withIndex('by_code', q => q.eq('code', code)).unique())); if (regions.some(region => !region)) throw new Error('Wilayah tidak ditemukan. Impor data wilayah dahulu.'); const [province, regency, district, village] = regions; if (province!.level !== 'province' || province!.parentCode !== undefined || regency!.level !== 'regency' || regency!.parentCode !== province!.code || district!.level !== 'district' || district!.parentCode !== regency!.code || village!.level !== 'village' || village!.parentCode !== district!.code) throw new Error('Hierarki wilayah tidak valid.'); const now = Date.now(), computed = ageCategory(args.dob); const id = await ctx.db.insert('pb_registrations', { fullName, dob: args.dob, gender: args.gender, club, kabupaten: regency!.name, whatsapp: normalizeWhatsApp(args.whatsapp), email, provinceCode: province!.code, provinceName: province!.name, regencyCode: regency!.code, regencyName: regency!.name, districtCode: district!.code, districtName: district!.name, villageCode: village!.code, villageName: village!.name, postalCode: village!.postalCode, addressDetail, category: computed, status: 'baru', createdAt: now, updatedAt: now }); await ctx.db.insert('pb_registration_history', { registrationId: id, status: 'baru', createdAt: now }); return { id, category: computed }; } catch (error) { throw new ConvexError((error as Error).message); } } });
export const recordFile = mutation({ args: { registrationId: v.id('pb_registrations'), docType, filename: v.string(), contentType: v.string(), size: v.number() }, handler: async (ctx, args) => { fileMeta(args.filename, args.contentType, args.size, args.docType); const registration = await ctx.db.get(args.registrationId); if (!registration) throw new ConvexError('Pendaftaran tidak ditemukan.'); const old = await ctx.db.query('pb_registration_files').withIndex('by_registration', q => q.eq('registrationId', args.registrationId)).collect(); for (const item of old.filter(item => item.docType === args.docType)) await ctx.db.delete(item._id); return ctx.db.insert('pb_registration_files', { ...args, category: registration.category, objectKey: `pb/${args.registrationId}/${registration.category}/${args.docType}`, filename: clean(args.filename), createdAt: Date.now() }); } });
export const listAdmin = query({ args: { adminSessionToken: v.string() }, handler: async (ctx, args) => { await assertPBAdminSession(ctx, args.adminSessionToken); const all = await ctx.db.query('pb_registrations').order('desc').collect(); return Promise.all(all.map(async registration => ({ ...registration, files: await ctx.db.query('pb_registration_files').withIndex('by_registration', q => q.eq('registrationId', registration._id)).collect(), history: await ctx.db.query('pb_registration_history').withIndex('by_registration', q => q.eq('registrationId', registration._id)).collect() }))); } });
export const updateStatus = mutation({ args: { registrationId: v.id('pb_registrations'), status, note: v.optional(v.string()), adminSessionToken: v.string() }, handler: async (ctx, args) => { await assertPBAdminSession(ctx, args.adminSessionToken); const note = args.note ? clean(args.note) : undefined; await ctx.db.patch(args.registrationId, { status: args.status, reviewNote: note, updatedAt: Date.now() }); await ctx.db.insert('pb_registration_history', { registrationId: args.registrationId, status: args.status, note, createdAt: Date.now() }); } });
export const getRegistration = internalQuery({ args: { registrationId: v.id('pb_registrations') }, handler: (ctx, args) => ctx.db.get(args.registrationId) });
export const getFile = internalQuery({ args: { registrationId: v.id('pb_registrations'), docType }, handler: async (ctx, args) => (await ctx.db.query('pb_registration_files').withIndex('by_registration', q => q.eq('registrationId', args.registrationId)).collect()).find(file => file.docType === args.docType) || null });
export const authorizeMaster = internalQuery({ args: { adminSessionToken: v.string() }, handler: async (ctx, args) => { await assertPBAdminSession(ctx, args.adminSessionToken); return true; } });
export const finalize = mutation({ args: { registrationId: v.id('pb_registrations') }, handler: async (ctx, args) => { const registration = await ctx.db.get(args.registrationId); if (!registration) throw new ConvexError('Pendaftaran tidak ditemukan.'); const files = await ctx.db.query('pb_registration_files').withIndex('by_registration', q => q.eq('registrationId', args.registrationId)).collect(); if (!files.some(file => file.docType === 'foto_profil') || !files.some(file => file.docType === 'dokumen_identitas')) throw new ConvexError('Pas foto dan dokumen identitas wajib.'); await ctx.db.patch(args.registrationId, { finalizedAt: Date.now(), updatedAt: Date.now() }); } });
export const uploadUrl = action({ args: { registrationId: v.id('pb_registrations'), docType, filename: v.string(), contentType: v.string(), size: v.number() }, handler: async (ctx, args): Promise<{ url: string; objectKey: string }> => { fileMeta(args.filename, args.contentType, args.size, args.docType); const registration = await ctx.runQuery((internal as any).pbRegistration.getRegistration, { registrationId: args.registrationId }); if (!registration) throw new ConvexError('Pendaftaran tidak ditemukan.'); const Key = `pb/${args.registrationId}/${registration.category}/${args.docType}`; return { url: '', objectKey: Key }; } });
export const downloadUrl = action({ args: { registrationId: v.id('pb_registrations'), docType, adminSessionToken: v.string() }, handler: async (ctx, args): Promise<string> => { await ctx.runQuery((internal as any).pbRegistration.authorizeMaster, { adminSessionToken: args.adminSessionToken }); const file = await ctx.runQuery((internal as any).pbRegistration.getFile, args); if (!file) throw new ConvexError('Dokumen tidak ditemukan.'); return ''; } });

