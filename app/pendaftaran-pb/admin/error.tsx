'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Panel Error:', error);
    
    // Auto-reset if it's an auth error and we can clear local storage
    if (error.message.includes('Admin session') || error.message.includes('Akses ditolak')) {
      localStorage.removeItem('pb_admin_token');
      localStorage.removeItem('admin_session');
    }
  }, [error]);

  return (
    <div className="flex min-h-dvh w-full items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-lg text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Sesi Berakhir / Tidak Valid</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Sesi admin Anda telah berakhir atau terjadi kesalahan autentikasi. Silakan login kembali.
        </p>
        <Button 
          onClick={() => {
            localStorage.removeItem('pb_admin_token');
            localStorage.removeItem('admin_session');
            window.location.reload();
          }}
          className="w-full"
        >
          Kembali ke Halaman Login
        </Button>
      </div>
    </div>
  );
}
