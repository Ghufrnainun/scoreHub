import { cronJobs } from 'convex/server';
import { internalMutation } from './_generated/server';
import { internal } from './_generated/api';

export const cleanupExpiredData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let sessionsDeleted = 0;
    let codesDeleted = 0;

    // 1. Bersihkan sesi admin yang sudah kedaluwarsa
    const expiredSessions = await ctx.db
      .query('admin_sessions')
      .withIndex('by_expiresAt', (q) => q.lte('expiresAt', now))
      .collect();
    
    for (const session of expiredSessions) {
      await ctx.db.delete(session._id);
      sessionsDeleted++;
    }

    // 2. Bersihkan kode akses sementara yang sudah kedaluwarsa lebih dari 30 hari
    // Kita simpan history selama 30 hari terakhir agar admin tetap bisa melihat riwayat di dashboard
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const oldTempCodes = await ctx.db
      .query('temp_access_codes')
      .withIndex('by_expiresAt', (q) => q.lte('expiresAt', thirtyDaysAgo))
      .collect();

    for (const code of oldTempCodes) {
      await ctx.db.delete(code._id);
      codesDeleted++;
    }

    console.log(
      `[Automation] Berhasil membersihkan ${sessionsDeleted} sesi kedaluwarsa dan ${codesDeleted} kode akses usang.`
    );
  },
});

const crons = cronJobs();

// Jadwalkan otomatis berjalan setiap hari pada pukul 02.00 UTC (09.00 WIB)
crons.daily(
  'cleanup-expired-auth-data',
  { hourUTC: 2, minuteUTC: 0 },
  internal.crons.cleanupExpiredData
);

export default crons;
