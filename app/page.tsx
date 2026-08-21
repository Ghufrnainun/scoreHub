'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bebas_Neue, Literata } from 'next/font/google';
import { cn } from '@/lib/utils';

const displayFont = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
});

const bodyFont = Literata({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const flowSteps = [
  {
    id: 'create',
    label: '1',
    title: 'Buat Match',
    description: 'Atur kategori, nama pemain, dan PIN akses.',
  },
  {
    id: 'control',
    label: '2',
    title: 'Kontrol Skor',
    description: 'Wasit input pemenang reli dari Smartphone atau Tablet.',
  },
  {
    id: 'display',
    label: '3',
    title: 'Tayang',
    description: 'Tampilan live di TV/Videotron untuk penonton.',
  },
];

const useCases = [
  {
    title: 'GOR / Lapangan',
    description: 'Tingkatkan nilai sewa dengan fasilitas papan skor digital yang profesional.',
  },
  {
    title: 'Komunitas',
    description: 'Bikin sparring rutin terasa seperti turnamen resmi BWF.',
  },
  {
    title: 'Turnamen Lokal',
    description: 'Sistem live score yang mudah diatur dalam hitungan menit tanpa teknisi khusus.',
  },
];

export default function LandingPage() {
  return (
    <div className={cn(bodyFont.className, "min-h-dvh bg-white text-black selection:bg-black selection:text-white")}>
      {/* HEADER */}
      <header className="border-b border-black/5 bg-white/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/icon.svg" 
              alt="Scorehub" 
              width={24} 
              height={24} 
              className="h-6 w-6 object-contain" 
              priority 
            />
            <span className={`${displayFont.className} text-xl tracking-widest uppercase mt-1`}>Scorehub</span>
          </div>
          <nav className="flex items-center gap-5 text-xs font-bold tracking-widest uppercase text-black/55">
            <Link href="/guide" className="hidden transition-colors hover:text-black sm:block">Panduan</Link>
            <Link href="/admin" className="hidden transition-colors hover:text-black sm:block">Admin</Link>
            <Link href="/admin" className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0">
              Mulai
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-6">
        {/* HERO */}
        <section className="grid gap-12 py-24 md:grid-cols-[1.1fr_0.9fr] md:items-end md:py-36">
          <div className="max-w-3xl">
          <div className="mb-9 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span> Live Beta
          </div>
          <h1 className={`${displayFont.className} text-6xl sm:text-8xl md:text-[104px] uppercase leading-[0.85] tracking-tight text-balance`}>
            Papan Skor <br />
            <span className="text-black/35">Badminton</span> <br />
            Realtime.
          </h1>
          <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-black/62 md:text-xl">
            Tinggalkan papan manual. Atur skor dari HP, tayangkan di TV. Didesain minimalis untuk latensi rendah dan kemudahan penggunaan di lapangan.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/admin" className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-xs font-bold uppercase tracking-widest text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0">
              Buat Match
            </Link>
            <Link href="/guide" className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 px-8 text-xs font-bold uppercase tracking-widest text-black/60 transition-colors hover:border-black/35 hover:text-black">
              Pelajari Sistem
            </Link>
          </div>
          </div>
          <div className="rounded-[2rem] border border-black/10 bg-[#F8FAFC] p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
            <div className="rounded-[1.5rem] bg-white p-5">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/40">Court 01</p>
                  <p className={`${displayFont.className} mt-1 text-2xl uppercase tracking-wider`}>Final MD</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">Live</span>
              </div>
              {[
                ['Garuda Timur', '21', '18', '14'],
                ['Rajawali Utara', '19', '21', '16'],
              ].map((team) => (
                <div key={team[0]} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-black/5 py-4 last:border-0">
                  <p className="truncate text-sm font-bold text-black/75">{team[0]}</p>
                  <span className="font-mono text-sm text-black/40">{team[1]}</span>
                  <span className="font-mono text-sm text-black/40">{team[2]}</span>
                  <span className="font-mono text-4xl font-black text-black">{team[3]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROLES */}
        <section className="border-t border-black/5 py-20">
          <h2 className={`${displayFont.className} mb-10 text-4xl uppercase tracking-wider`}>Akses Modul</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/admin" className="group flex min-h-44 flex-col rounded-3xl border border-black/10 bg-black/[0.015] p-7 transition-[border-color,background-color,transform] hover:-translate-y-1 hover:border-black/35 hover:bg-white md:p-8">
              <span className={`${displayFont.className} text-3xl uppercase tracking-wider mb-4 group-hover:translate-x-2 transition-transform`}>Admin</span>
              <p className="text-sm text-black/60 leading-relaxed">Buat pertandingan, atur pemain, dan kelola turnamen.</p>
            </Link>
            <Link href="/referee/join" className="group flex min-h-44 flex-col rounded-3xl border border-black/10 bg-black/[0.015] p-7 transition-[border-color,background-color,transform] hover:-translate-y-1 hover:border-black/35 hover:bg-white md:p-8">
              <span className={`${displayFont.className} text-3xl uppercase tracking-wider mb-4 group-hover:translate-x-2 transition-transform`}>Wasit</span>
              <p className="text-sm text-black/60 leading-relaxed">Kontrol poin dan servis langsung dari lapangan.</p>
            </Link>
            <Link href="/display" className="group flex min-h-44 flex-col rounded-3xl border border-black/10 bg-black/[0.015] p-7 transition-[border-color,background-color,transform] hover:-translate-y-1 hover:border-black/35 hover:bg-white md:p-8">
              <span className={`${displayFont.className} text-3xl uppercase tracking-wider mb-4 group-hover:translate-x-2 transition-transform`}>Display</span>
              <p className="text-sm text-black/60 leading-relaxed">Tampilan layar penuh untuk layar TV atau videotron.</p>
            </Link>
          </div>
        </section>

        {/* ALUR */}
        <section className="border-t border-black/5 py-20">
          <div className="grid gap-12 md:grid-cols-2 md:gap-24">
            <div>
              <h2 className={`${displayFont.className} text-4xl uppercase tracking-wider mb-6`}>Alur Kerja</h2>
              <p className="text-black/60 text-lg">Tiga langkah sederhana untuk memulai pertandingan profesional Anda.</p>
            </div>
            <div className="flex flex-col gap-10">
              {flowSteps.map((step) => (
                <div key={step.id} className="flex gap-6 md:gap-8">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                    {step.label}
                  </div>
                  <div>
                    <h3 className={`${displayFont.className} text-3xl uppercase tracking-wider mb-3`}>{step.title}</h3>
                    <p className="text-base text-black/60 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-24 border-t border-black/5">
          <h2 className={`${displayFont.className} text-4xl uppercase tracking-wider mb-12`}>Dirancang Untuk</h2>
          <div className="grid sm:grid-cols-3 gap-10">
            {useCases.map((item) => (
              <div key={item.title}>
                <div className="w-8 h-1 bg-black/10 mb-6"></div>
                <h3 className={`${displayFont.className} text-2xl uppercase tracking-wider mb-4`}>{item.title}</h3>
                <p className="text-sm text-black/60 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Image src="/icon.svg" alt="" width={16} height={16} className="h-4 w-4 grayscale" />
            <span className={`${displayFont.className} text-sm tracking-widest uppercase mt-1`}>Scorehub</span>
          </div>
          <p className="text-[10px] text-black/40 font-bold tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Scorehub. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
