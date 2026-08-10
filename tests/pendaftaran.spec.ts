import { test, expect } from '@playwright/test';

test.describe('Pendaftaran Atlet', () => {
  test('harus memuat halaman pendaftaran', async ({ page }) => {
    await page.goto('/pendaftaran-pb');
    await expect(page.locator('h1').filter({ hasText: 'Pendaftaran Atlet Baru' })).toBeVisible();
  });

  test('validasi form jika input wajib tidak diisi', async ({ page }) => {
    await page.goto('/pendaftaran-pb');
    
    // Pesan error dari HTML5 validation atau disable button
    // Karena tombol disable jika form tidak lengkap, kita cek atribut disabled
    const kirimButton = page.getByRole('button', { name: /Tinjau & Kirim/i });
    await expect(kirimButton).toBeDisabled();
  });
  
  // Tes lebih kompleks seperti dropdown dan submit success
  // biasanya memerlukan mock API atau backend khusus,
  // di sini kita cek apakah elemen form muncul dengan baik.
  test('harus bisa mengetik input NIK dan Nama Lengkap', async ({ page }) => {
    await page.goto('/pendaftaran-pb');
    
    const nikInput = page.getByLabel(/NIK/i);
    await nikInput.fill('1234567890123456');
    await expect(nikInput).toHaveValue('1234567890123456');

    const nameInput = page.getByLabel(/Nama Lengkap/i);
    await nameInput.fill('Atlet Dummy Test');
    await expect(nameInput).toHaveValue('Atlet Dummy Test');
  });
});
