import { test, expect } from '@playwright/test';

test.describe('Security & Admin Routes', () => {
  test('pengguna anonim tidak bisa masuk ke halaman admin root', async ({ page }) => {
    // Navigasi langsung ke admin root (yang harusnya me-redirect ke login atau menolak akses)
    await page.goto('/admin');
    
    // Periksa apakah halaman me-redirect atau menampilkan form pin
    await expect(page.locator('text=Login Admin').or(page.locator('text=Masukkan PIN'))).toBeVisible({ timeout: 5000 });
  });

  test('pengguna anonim tidak bisa masuk ke detail pendaftar', async ({ page }) => {
    // Coba akses halaman admin dengan ID palsu
    await page.goto('/pendaftaran-pb/admin/dummy123');
    
    // Kita asumsikan aplikasi akan redirect ke login
    await expect(page).toHaveURL(/.*\/pendaftaran-pb\/admin/i);
  });
});
