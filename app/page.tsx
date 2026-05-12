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
    <div className={cn(bodyFont.className, "min-h-screen bg-white text-black selection:bg-black selection:text-white")}>
      {/* HEADER */}
      <header className="border-b border-black/5">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo-pb.png" 
              alt="Scorehub" 
              width={24} 
              height={24} 
              className="h-6 w-6 object-contain" 
              priority 
            />
            <span className={`${displayFont.className} text-xl tracking-widest uppercase mt-1`}>Scorehub</span>
          </div>
          <nav className="flex items-center gap-6 text-xs font-bold tracking-widest uppercase text-black/60">
            <Link href="/guide" className="hover:text-black transition-colors hidden sm:block">Panduan</Link>
            <Link href="/admin" className="hover:text-black transition-colors hidden sm:block">Admin</Link>
            <Link href="/admin" className="h-9 inline-flex items-center justify-center bg-black text-white px-5 rounded-full hover:bg-neutral-800 transition-colors">
              Mulai
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* HERO */}
        <section className="py-32 md:py-48 max-w-3xl">
          <div className="inline-flex items-center gap-2 border border-black/10 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span> Live Beta
          </div>
          <h1 className={`${displayFont.className} text-6xl sm:text-8xl md:text-[100px] uppercase leading-[0.85] tracking-tight`}>
            Papan Skor <br />
            <span className="text-black/30">Badminton</span> <br />
            Realtime.
          </h1>
          <p className="mt-10 text-lg md:text-xl text-black/60 max-w-xl leading-relaxed font-medium">
            Tinggalkan papan manual. Atur skor dari HP, tayangkan di TV. Didesain minimalis untuk latensi rendah dan kemudahan penggunaan di lapangan.
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/admin" className="h-14 inline-flex items-center justify-center bg-black text-white px-8 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
              Buat Match
            </Link>
            <Link href="/guide" className="h-14 inline-flex items-center justify-center border border-black/10 px-8 rounded-full text-xs font-bold uppercase tracking-widest text-black/60 hover:text-black hover:border-black transition-colors">
              Pelajari Sistem
            </Link>
          </div>
        </section>

        {/* ROLES */}
        <section className="py-24 border-t border-black/5">
          <h2 className={`${displayFont.className} text-4xl uppercase tracking-wider mb-12`}>Akses Modul</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Link href="/admin" className="group p-8 md:p-10 border border-black/10 hover:border-black transition-colors rounded-3xl flex flex-col">
              <span className={`${displayFont.className} text-3xl uppercase tracking-wider mb-4 group-hover:translate-x-2 transition-transform`}>Admin</span>
              <p className="text-sm text-black/60 leading-relaxed">Buat pertandingan, atur pemain, dan kelola turnamen.</p>
            </Link>
            <Link href="/referee/join" className="group p-8 md:p-10 border border-black/10 hover:border-black transition-colors rounded-3xl flex flex-col">
              <span className={`${displayFont.className} text-3xl uppercase tracking-wider mb-4 group-hover:translate-x-2 transition-transform`}>Wasit</span>
              <p className="text-sm text-black/60 leading-relaxed">Kontrol poin dan servis langsung dari lapangan.</p>
            </Link>
            <Link href="/display" className="group p-8 md:p-10 border border-black/10 hover:border-black transition-colors rounded-3xl flex flex-col">
              <span className={`${displayFont.className} text-3xl uppercase tracking-wider mb-4 group-hover:translate-x-2 transition-transform`}>Display</span>
              <p className="text-sm text-black/60 leading-relaxed">Tampilan layar penuh untuk layar TV atau videotron.</p>
            </Link>
          </div>
        </section>

        {/* ALUR */}
        <section className="py-24 border-t border-black/5">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24">
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
            <Image src="/logo-pb.png" alt="" width={16} height={16} className="h-4 w-4 grayscale" />
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
