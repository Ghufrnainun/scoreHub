import { v, ConvexError } from 'convex/values';
import { action, internalQuery, mutation, query } from './_generated/server';
import { internal } from './_generated/api';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAdminSession, hashSecret, generateToken, ADMIN_SESSION_TTL_MS } from './utils';
import { cleanText, normalizeWhatsApp, validateFile } from '../lib/pb-registration-validation';

const status = v.union(v.literal('baru'), v.literal('valid'), v.literal('sudah_input_pbsi'));
const docType = v.string();
const clean = (value: string) => value.trim().replace(/\s+/g, ' ');
function fileMeta(filename: string, contentType: string, size: number, type: string) { try { validateFile(filename, contentType, size, 'identity'); } catch (error) { throw new ConvexError((error as Error).message); } }

async function assertPBAdminSession(ctx: any, token?: string): Promise<void> {
  const session = await getAdminSession(ctx, token);
  const allowed = ['pb', undefined];
  if (!allowed.includes(session.scope)) {
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

export const create = mutation({
  args: {
    nik: v.string(),
    fullName: v.string(),
    bwfId: v.optional(v.string()),
    gender: v.union(v.literal('pria'), v.literal('wanita'), v.literal('putra'), v.literal('putri')),
    motherName: v.string(),
    birthPlace: v.string(),
    dob: v.string(),
    playingHand: v.union(v.literal('kiri'), v.literal('kanan')),
    addressDetail: v.string(),
    postalCode: v.optional(v.string()),
    provinceCode: v.string(),
    regencyCode: v.string(),
    districtCode: v.optional(v.string()),
    club: v.string(),
    nationality: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const fullName = cleanText(args.fullName, 'Nama', 3, 100);
      const club = cleanText(args.club, 'Klub', 2, 100);
      const addressDetail = cleanText(args.addressDetail, 'Detail alamat', 5, 300);
      const email = args.email?.trim().toLowerCase() || undefined;

      if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        throw new Error('Email tidak valid.');
      }

      const codes = [args.provinceCode, args.regencyCode, args.districtCode].filter(Boolean) as string[];
      const regions = await Promise.all(codes.map(code => ctx.db.query('regions').withIndex('by_code', q => q.eq('code', code)).unique()));

      if (regions.some(region => !region)) {
        throw new Error('Wilayah tidak ditemukan. Impor data wilayah dahulu.');
      }

      const province = regions.find(r => r?.level === 'province');
      const regency = regions.find(r => r?.level === 'regency');
      const district = regions.find(r => r?.level === 'district');

      if (!province || !regency || regency.parentCode !== province.code) {
        throw new Error('Hierarki wilayah tidak valid.');
      }

      const now = Date.now();
      
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let registrationCode = 'PB';
      for (let i = 0; i < 6; i++) {
        registrationCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const id = await ctx.db.insert('pb_registrations', {
        nik: args.nik,
        fullName,
        bwfId: args.bwfId,
        registrationCode,
        gender: args.gender,
        motherName: args.motherName,
        birthPlace: args.birthPlace,
        dob: args.dob,
        playingHand: args.playingHand,
        club: cleanText(args.club, 'Klub', 2, 100),
        whatsapp: normalizeWhatsApp(args.whatsapp),
        email: args.email ? args.email.toLowerCase() : undefined,
        provinceCode: args.provinceCode,
        provinceName: province!.name,
        regencyCode: args.regencyCode,
        regencyName: regency!.name,
        districtCode: district?.code,
        districtName: district?.name,
        addressDetail,
        postalCode: args.postalCode,
        nationality: args.nationality,
        phone: args.phone,
        status: 'baru',
        createdAt: now,
        updatedAt: now
      });

      await ctx.db.insert('pb_registration_history', { registrationId: id, status: 'baru', createdAt: now });

      return { id, code: registrationCode };
    } catch (error) {
      throw new ConvexError((error as Error).message);
    }
  }
});

export const recordFile = mutation({
  args: {
    registrationId: v.id('pb_registrations'),
    docType,
    filename: v.string(),
    contentType: v.string(),
    size: v.number()
  },
  handler: async (ctx, args) => {
    fileMeta(args.filename, args.contentType, args.size, args.docType);
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) throw new ConvexError('Pendaftaran tidak ditemukan.');

    const old = await ctx.db.query('pb_registration_files').withIndex('by_registration', q => q.eq('registrationId', args.registrationId)).collect();
    for (const item of old.filter(item => item.docType === args.docType)) {
      await ctx.db.delete(item._id);
    }

    return ctx.db.insert('pb_registration_files', {
      ...args,
      objectKey: `pb/${args.registrationId}/${args.docType}`,
      filename: clean(args.filename),
      createdAt: Date.now()
    });
  }
});

import { paginationOptsValidator } from 'convex/server';

export const listAdmin = query({
  args: { adminSessionToken: v.optional(v.string()), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await assertPBAdminSession(ctx, args.adminSessionToken);
    return await ctx.db.query('pb_registrations').order('desc').paginate(args.paginationOpts);
  }
});

export const getRegistrationDetail = query({
  args: { adminSessionToken: v.optional(v.string()), registrationId: v.id('pb_registrations') },
  handler: async (ctx, args) => {
    await assertPBAdminSession(ctx, args.adminSessionToken);
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) throw new ConvexError('Pendaftaran tidak ditemukan.');
    const files = await ctx.db.query('pb_registration_files').withIndex('by_registration', q => q.eq('registrationId', args.registrationId)).collect();
    const history = await ctx.db.query('pb_registration_history').withIndex('by_registration', q => q.eq('registrationId', args.registrationId)).collect();
    return { ...registration, files, history };
  }
});

export const updateStatus = mutation({
  args: {
    registrationId: v.id('pb_registrations'),
    status,
    adminSessionToken: v.string()
  },
  handler: async (ctx, args) => {
    await assertPBAdminSession(ctx, args.adminSessionToken);
    await ctx.db.patch(args.registrationId, { status: args.status, updatedAt: Date.now() });
    await ctx.db.insert('pb_registration_history', { registrationId: args.registrationId, status: args.status, createdAt: Date.now() });
  }
});

export const adminUpdateData = mutation({
  args: {
    registrationId: v.id('pb_registrations'),
    adminSessionToken: v.string(),
    fullName: v.optional(v.string()),
    dob: v.optional(v.string()),
    gender: v.optional(v.union(v.literal('pria'), v.literal('wanita'), v.literal('putra'), v.literal('putri'))),
    club: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    email: v.optional(v.string()),
    bwfId: v.optional(v.string()),
    nik: v.optional(v.string()),
    motherName: v.optional(v.string()),
    birthPlace: v.optional(v.string()),
    playingHand: v.optional(v.union(v.literal('kiri'), v.literal('kanan'))),
    addressDetail: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertPBAdminSession(ctx, args.adminSessionToken);
    
    const patch: any = { updatedAt: Date.now() };
    if (args.fullName !== undefined) patch.fullName = cleanText(args.fullName, 'Nama', 3, 100);
    if (args.club !== undefined) patch.club = cleanText(args.club, 'Klub', 2, 100);
    if (args.dob !== undefined) {
      patch.dob = args.dob;
    }
    if (args.gender !== undefined) patch.gender = args.gender;
    if (args.whatsapp !== undefined) patch.whatsapp = normalizeWhatsApp(args.whatsapp);
    if (args.email !== undefined) patch.email = args.email.trim().toLowerCase() || undefined;
    if (args.bwfId !== undefined) patch.bwfId = args.bwfId.trim().toUpperCase() || undefined;
    if (args.nik !== undefined) patch.nik = args.nik.trim() || undefined;
    if (args.motherName !== undefined) patch.motherName = cleanText(args.motherName, 'Ibu Kandung', 1, 100);
    if (args.birthPlace !== undefined) patch.birthPlace = cleanText(args.birthPlace, 'Tempat Lahir', 1, 100);
    if (args.playingHand !== undefined) patch.playingHand = args.playingHand;
    if (args.addressDetail !== undefined) patch.addressDetail = cleanText(args.addressDetail, 'Alamat', 1, 300);
    if (args.phone !== undefined) patch.phone = args.phone.replace(/[^0-9]/g, '') || undefined;

    await ctx.db.patch(args.registrationId, patch);
  }
});

export const getRegistration = internalQuery({
  args: { registrationId: v.id('pb_registrations') },
  handler: (ctx, args) => ctx.db.get(args.registrationId)
});

export const getFile = internalQuery({
  args: { registrationId: v.id('pb_registrations'), docType },
  handler: async (ctx, args) => {
    const files = await ctx.db.query('pb_registration_files').withIndex('by_registration', q => q.eq('registrationId', args.registrationId)).collect();
    return files.find(file => file.docType === args.docType) || null;
  }
});

export const authorizeMaster = internalQuery({
  args: { adminSessionToken: v.string() },
  handler: async (ctx, args) => {
    await assertPBAdminSession(ctx, args.adminSessionToken);
    return true;
  }
});

export const finalize = mutation({
  args: { registrationId: v.id('pb_registrations') },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) throw new ConvexError('Pendaftaran tidak ditemukan.');
    const files = await ctx.db.query('pb_registration_files').withIndex('by_registration', q => q.eq('registrationId', args.registrationId)).collect();
    if (!files.some(file => file.docType === 'Kartu Keluarga') || !files.some(file => file.docType === 'Akta Kelahiran')) {
      throw new ConvexError('Dokumen Kartu Keluarga dan Akta Kelahiran wajib dilampirkan.');
    }
    // Set status to 'baru' instead of leaving it alone when finalize is called
    await ctx.db.patch(args.registrationId, { finalizedAt: Date.now(), updatedAt: Date.now(), status: 'baru' });
  }
});

function getS3Client() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
    throw new ConvexError('Konfigurasi Cloudflare R2 belum lengkap di environment variables.');
  }
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export const uploadUrl = action({
  args: {
    registrationId: v.id('pb_registrations'),
    docType,
    filename: v.string(),
    contentType: v.string(),
    size: v.number()
  },
  handler: async (ctx, args): Promise<{ url: string; objectKey: string }> => {
    fileMeta(args.filename, args.contentType, args.size, args.docType);
    const registration = await ctx.runQuery((internal as any).pbRegistration.getRegistration, { registrationId: args.registrationId });
    if (!registration) throw new ConvexError('Pendaftaran tidak ditemukan.');
    
    const Key = `pb/${args.registrationId}/${args.docType}`;
    
    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key,
      ContentType: args.contentType,
      ContentLength: args.size,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { url, objectKey: Key };
  }
});

export const downloadUrl = action({
  args: {
    registrationId: v.id('pb_registrations'),
    docType,
    adminSessionToken: v.string()
  },
  handler: async (ctx, args): Promise<string> => {
    await ctx.runQuery((internal as any).pbRegistration.authorizeMaster, { adminSessionToken: args.adminSessionToken });
    const file = await ctx.runQuery((internal as any).pbRegistration.getFile, {
      registrationId: args.registrationId,
      docType: args.docType,
    });
    if (!file) throw new ConvexError('Dokumen tidak ditemukan.');
    
    const s3Client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: file.objectKey,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  }
});

export const deleteAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all registrations
    const regs = await ctx.db.query('pb_registrations').collect();
    for (const r of regs) await ctx.db.delete(r._id);

    // Delete all files
    const files = await ctx.db.query('pb_registration_files').collect();
    for (const f of files) await ctx.db.delete(f._id);

    // Delete all history
    const history = await ctx.db.query('pb_registration_history').collect();
    for (const h of history) await ctx.db.delete(h._id);
  }
});
