'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { clearAdminSession } from '@/lib/auth';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRelogin = () => {
    clearAdminSession();
    window.location.href = '/admin';
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] p-6 text-[#111827]">
      <section className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <span className="text-xl font-black">!</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">Sesi admin bermasalah</h1>
        <p className="mt-2 text-sm leading-relaxed text-black/60">
          Akses admin tidak bisa diverifikasi. Masuk ulang untuk memuat data terbaru.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            className="h-11 rounded-xl border-black/10 font-bold text-black hover:bg-black/5 hover:text-black"
          >
            Coba Lagi
          </Button>
          <Button
            type="button"
            onClick={handleRelogin}
            className="h-11 rounded-xl bg-[#111827] font-bold text-white hover:bg-black"
          >
            Masuk Ulang
          </Button>
        </div>
      </section>
    </main>
  );
}
