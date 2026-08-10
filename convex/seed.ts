import { internalMutation } from './_generated/server';

export const mockAdminData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Proceed with seeding without requiring regions

    const mockData = [
      {
        fullName: 'Budi Santoso',
        dob: '2012-05-15',
        gender: 'putra',
        club: 'PB Djarum',
        whatsapp: '081234567890',
        email: 'budi.s@example.com',
        provinceCode: '33',
        regencyCode: '3374',
        districtCode: '337401',
        villageCode: '3374011001',
        provinceName: 'JAWA TENGAH',
        regencyName: 'KOTA SEMARANG',
        districtName: 'SEMARANG TENGAH',
        villageName: 'MIJEN',
        postalCode: '50111',
        addressDetail: 'Jl. Pemuda No. 12, RT 01 RW 02',
        category: 'anak',
        status: 'baru',
        createdAt: now - 86400000 * 2,
        updatedAt: now - 86400000 * 2,
        finalizedAt: now - 86400000 * 2,
      },
      {
        fullName: 'Siti Aminah',
        dob: '2008-11-20',
        gender: 'putri',
        club: 'PB Jaya Raya',
        whatsapp: '085678901234',
        email: 'siti.am@example.com',
        provinceCode: '33',
        regencyCode: '3374',
        districtCode: '337402',
        villageCode: '3374021002',
        provinceName: 'JAWA TENGAH',
        regencyName: 'KOTA SEMARANG',
        districtName: 'SEMARANG UTARA',
        villageName: 'KUNINGAN',
        postalCode: '50176',
        addressDetail: 'Komp. Beringin Indah Blok A4',
        category: 'taruna',
        status: 'valid',
        createdAt: now - 86400000 * 5,
        updatedAt: now - 86400000 * 1,
        finalizedAt: now - 86400000 * 5,
      },
      {
        fullName: 'Andi Wijaya',
        dob: '2002-03-10',
        gender: 'putra',
        club: 'PB Mutiara Cardinal',
        whatsapp: '089876543210',
        provinceCode: '33',
        regencyCode: '3374',
        districtCode: '337403',
        villageCode: '3374031001',
        provinceName: 'JAWA TENGAH',
        regencyName: 'KOTA SEMARANG',
        districtName: 'SEMARANG TIMUR',
        villageName: 'KEMIJEN',
        postalCode: '50122',
        addressDetail: 'Jl. Pahlawan No. 99, Kos Mutiara',
        category: 'dewasa',
        status: 'sudah_input_pbsi',
        createdAt: now - 86400000 * 10,
        updatedAt: now - 86400000 * 2,
        finalizedAt: now - 86400000 * 10,
      }
    ];

    for (const data of mockData) {
      const regId = await ctx.db.insert('pb_registrations', data as any);
      
      // insert history
      await ctx.db.insert('pb_registration_history', {
        registrationId: regId,
        status: 'baru',
        createdAt: data.createdAt
      });
      
      if (data.status === 'valid') {
        await ctx.db.insert('pb_registration_history', {
          registrationId: regId,
          status: 'valid',
          createdAt: data.updatedAt
        });
      } else if (data.status === 'sudah_input_pbsi') {
        await ctx.db.insert('pb_registration_history', {
          registrationId: regId,
          status: 'valid',
          createdAt: data.createdAt + 86400000
        });
        await ctx.db.insert('pb_registration_history', {
          registrationId: regId,
          status: 'sudah_input_pbsi',
          createdAt: data.updatedAt
        });
      }
    }
  }
});
