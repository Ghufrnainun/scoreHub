'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';


import { Bebas_Neue, Literata } from 'next/font/google';


const displayFont = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
});

const bodyFont = Literata({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});





import { cn } from '@/lib/utils';

const highlights = [
  { label: 'Latensi', value: '< 1 dtk' },
  { label: 'Mode', value: 'Siap LAN' },
  { label: 'Undo', value: '50 kali' },
];

const signatureFeatures = [
  {
    title: 'Rally-first input',
    description:
      'Wasit cukup pilih pemenang rally. Sistem otomatis atur skor, server, dan set.',
  },
  {
    title: 'Display fullscreen',
    description:
      'Tampilan LED-style untuk TV/videotron, realtime tanpa refresh.',
  },
  {
    title: 'Aturan BWF',
    description:
      'Best of 3, 21 poin, win by 2, cap 30. End set & match otomatis.',
  },
  {
    title: 'Offline-ready',
    description: 'Jalan di LAN/WiFi lokal. Tidak wajib internet saat event.',
  },
];

const flowSteps = [
  {
    id: 'create',
    label: 'Buat',
    title: 'Mulai Match',
    description: 'Buat match baru, pilih kategori (MS/WS/MD/WD/XD), atur PIN.',
  },
  {
    id: 'control',
    label: 'Kontrol',
    title: 'Input Reli',
    description: 'Wasit input via web controller. Undo aman sampai 50 reli.',
  },
  {
    id: 'display',
    label: 'Skor',
    title: 'Tayangkan di TV',
    description:
      'Papan skor fullscreen untuk TV/Videotron dengan indikator servis.',
  },
];

const useCases = [
  {
    title: 'Lapangan / GOR',
    description: 'Skor rapi untuk sewa lapangan, liga lokal, sparring rutin.',
  },
  {
    title: 'Komunitas',
    description: 'Pelatih atau komunitas kecil yang butuh tampilan profesional.',
  },
  {
    title: 'Turnamen',
    description: 'Turnamen skala kecil-menengah dengan setup yang cepat.',
  },
];

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black/70 shadow-sm">
      {label}
      <span className="ml-2 text-black tabular-nums">{value}</span>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-black/50">
        {kicker}
      </p>
      <h2
        className={`${displayFont.className} mt-4 text-4xl uppercase tracking-[0.08em] text-black text-balance sm:text-5xl`}
      >
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-black/70 text-pretty">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h3
        className={`${displayFont.className} text-2xl uppercase tracking-[0.06em]`}
      >
        {title}
      </h3>
      <p className="mt-3 text-sm text-black/70 text-pretty">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(flowSteps[0]);
  const router = useRouter();


  const flowIndex = useMemo(() => {
    return flowSteps.findIndex((step) => step.id === activeStep.id);
  }, [activeStep.id]);

  return (
    <div
      className={cn(bodyFont.className, "min-h-screen bg-[#F8FAFC] text-black w-full overflow-x-hidden")}
      style={
        {
          '--amber': '#F59E0B',
          '--ink': '#111827',
          '--paper': '#F8FAFC',
        } as React.CSSProperties
      }
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-black focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-white"
      >
        Lanjut ke Konten
      </a>
      <div className="relative overflow-hidden w-full">
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.35),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] left-[-10%] h-[360px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(17,24,39,0.18),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-24 h-[380px] w-full max-w-[900px] -translate-x-1/2 border-x border-black/10 bg-[linear-gradient(120deg,rgba(0,0,0,0.04),transparent)] opacity-70 hidden lg:block" />

        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur w-full">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--ink)] text-[var(--amber)]">
                <Image
                  src="/scorehub-logo.svg"
                  alt="Scorehub logo"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </div>
              <div>
                <p
                  className={`${displayFont.className} text-sm uppercase tracking-[0.35em]`}
                >
                  Scorehub
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Badminton Realtime
                </p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-[0.35em] text-black/60">
              {[
                { label: 'Fitur', href: '#features' },
                { label: 'Alur', href: '#flow' },
                { label: 'Panduan', href: '/guide' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-2 py-1 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/guide"
                className="hidden sm:inline-flex rounded-full border border-black/20 px-3 sm:px-4 py-2 text-xs sm:text-[11px] font-bold uppercase tracking-[0.3em] text-black/70 transition-all hover:border-black/50 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
              >
                Panduan
              </Link>
              <a href="#roles" className="hidden sm:inline-flex items-center rounded-full border border-black/20 px-3 sm:px-4 py-2 text-xs sm:text-[11px] font-bold uppercase tracking-[0.3em] text-black/70 transition-all hover:border-black/50 hover:text-black">Pusat Kontrol</a>
              <a href="#roles" className="inline-flex items-center rounded-full bg-[var(--amber)] px-4 sm:px-6 py-2.5 text-xs sm:text-[11px] font-black uppercase tracking-[0.3em] text-black shadow-[0_10px_30px_-10px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-amber-500/50">Mulai Match</a>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 lg:px-8 overflow-x-hidden">
          <section className="relative pt-12 sm:pt-24 pb-20 lg:pt-32 lg:pb-32">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div className="flex flex-col items-start px-2 sm:px-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" />
                  Live Beta
                </div>

                <h1
                  className={`${displayFont.className} mt-8 text-4xl sm:text-7xl lg:text-8xl uppercase leading-[0.9] sm:leading-[0.85] tracking-[0.05em] text-black text-balance`}
                >
                  Sensasi Turnamen PB <br />
                  <span className="text-black/20 text-3xl sm:text-6xl lg:text-7xl">Di mana saja,</span> <br />
                  <span className="text-[var(--amber)]">Kapan saja.</span>
                </h1>

                <p className="mt-8 max-w-lg text-base sm:text-lg leading-relaxed text-black/60 font-medium text-pretty">
                  Sistem papan skor badminton profesional.<br className="hidden sm:block" />
                  Realtime via LAN. Cocok untuk Turnamen & Latihan PB.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <a href="#roles" className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-xl shadow-black/20 transition-[transform,box-shadow,background-color] hover:-translate-y-1 hover:shadow-2xl hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]">Mulai Pertandingan</a>
                  <Link
                    href="/guide"
                    className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 px-8 text-[11px] font-bold uppercase tracking-[0.3em] text-black/60 transition-colors hover:border-black/30 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
                  >
                    Buka Panduan
                  </Link>
                  <a
                    href="#flow"
                    className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 px-8 text-[11px] font-bold uppercase tracking-[0.3em] text-black/60 transition-colors hover:border-black/30 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
                  >
                    Cara Kerja
                  </a>
                </div>
              </div>

              <div className="relative px-2 sm:px-0">
                <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[var(--amber)] opacity-20 blur-[100px]" />
                <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-blue-500 opacity-10 blur-[100px]" />

                <div className="relative z-10 transform transition-transform duration-700 lg:rotate-[-2deg] hover:rotate-0 hover:scale-[1.02]">
                  <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-black shadow-2xl shadow-black/20">
                    <div className="relative aspect-video w-full bg-neutral-900 p-0.5 sm:p-1">
                      <div className="h-full w-full rounded-[1.8rem] bg-[#000000] overflow-hidden relative flex flex-col font-sans">
                        <div className="h-12 bg-[#111] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#fbbf24] text-black px-1.5 py-0.5 text-xs font-bold uppercase rounded-sm tracking-widest">
                              MS
                            </div>
                            <div className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] font-mono">
                              Tunggal Putra
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <div className="flex-1 border-b border-white/10 flex">
                            <div className="flex-1 bg-[#111] flex items-center px-4 sm:px-6 relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 animate-pulse" />
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-6 w-10 sm:h-8 sm:w-12 bg-blue-600 rounded-sm relative overflow-hidden border border-white/10 shadow-sm">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />
                                </div>
                                <span className="text-white font-bold text-base sm:text-xl uppercase tracking-wider truncate max-w-[80px] sm:max-w-none">
                                  Ginting
                                </span>
                                <div className="h-4 w-4 text-[#fbbf24]">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div className="w-12 sm:w-16 bg-[#0a0a0a] flex items-center justify-center border-l border-white/5">
                              <span className="text-xl sm:text-2xl font-mono font-bold text-[#fbbf24]/80">
                                21
                              </span>
                            </div>
                            <div className="w-20 sm:w-24 bg-black flex items-center justify-center border-l-2 border-white/10 relative overflow-hidden">
                              <span className="text-4xl sm:text-5xl font-mono font-black text-[#4ade80] tracking-tighter tabular-nums relative z-10">
                                21
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 flex">
                            <div className="flex-1 bg-[#111] flex items-center px-4 sm:px-6">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-6 w-10 sm:h-8 sm:w-12 bg-red-600 rounded-sm relative overflow-hidden border border-white/10 shadow-sm">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />
                                </div>
                                <span className="text-white/40 font-bold text-base sm:text-xl uppercase tracking-wider truncate max-w-[80px] sm:max-w-none">
                                  Axelsen
                                </span>
                              </div>
                            </div>
                            <div className="w-12 sm:w-16 bg-[#0a0a0a] flex items-center justify-center border-l border-white/5">
                              <span className="text-xl sm:text-2xl font-mono font-bold text-[#fbbf24]/80">
                                15
                              </span>
                            </div>
                            <div className="w-20 sm:w-24 bg-black flex items-center justify-center border-l-2 border-white/10">
                              <span className="text-4xl sm:text-5xl font-mono font-black text-[#4ade80] tracking-tighter tabular-nums opacity-60">
                                12
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="h-8 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-center gap-6">
                          <div className="text-xs font-bold text-[#fbbf24] uppercase tracking-widest">
                            Set 2
                          </div>
                          <div className="text-xs font-bold text-white/30 uppercase tracking-widest">
                            Lapangan 1
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-2 sm:-bottom-8 sm:-left-4 w-32 sm:w-48 rounded-[16px] sm:rounded-[24px] border border-black/10 bg-white p-3 sm:p-4 shadow-2xl lg:-left-12">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="h-1.5 w-6 sm:w-8 rounded-full bg-black/10" />
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="h-8 sm:h-12 w-full rounded-lg sm:rounded-xl bg-[var(--amber)] flex items-center justify-center text-xs font-bold uppercase tracking-widest shadow-md">
                        Poin INA
                      </div>
                      <div className="h-8 sm:h-12 w-full rounded-lg sm:rounded-xl bg-black/5 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-black/40">
                        Poin JPN
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* ROLES SELECTION SECTION */}
          <section id="roles" className="py-24 scroll-mt-20 border-t border-black/5 relative">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03),transparent_70%)]"></div>
            <div className="text-center mb-16 px-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-amber-600 mb-4">
                Pusat Kontrol
              </div>
              <h2 className={`${displayFont.className} text-5xl sm:text-7xl uppercase tracking-wide text-black`}>
                Pilih Peran Anda
              </h2>
              <p className="mt-4 text-base sm:text-lg text-black/60 max-w-xl mx-auto font-medium">
                Akses cepat ke modul sistem papan skor sesuai kebutuhan.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto px-4 lg:px-8">
              {/* Administrator Card */}
              <Link 
                href="/admin" 
                className="group relative flex flex-col items-start p-8 sm:p-10 rounded-[3rem] bg-white border border-black/5 shadow-lg shadow-black/[0.01] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 hover:border-black/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="mb-10 h-20 w-20 flex items-center justify-center rounded-3xl bg-black text-amber-500 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-black/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="mt-auto z-10">
                  <h3 className={`${displayFont.className} text-4xl sm:text-5xl uppercase tracking-wider text-black mb-3`}>
                    Admin
                  </h3>
                  <p className="text-sm text-black/50 font-bold uppercase tracking-widest leading-relaxed">
                    Buat match & kelola dashboard utama
                  </p>
                </div>
                <div className="absolute top-10 right-10 h-10 w-10 flex items-center justify-center rounded-full border border-black/10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>

              {/* Wasit Card */}
              <Link 
                href="/referee/join" 
                className="group relative flex flex-col items-start p-8 sm:p-10 rounded-[3rem] bg-white border border-black/5 shadow-lg shadow-black/[0.01] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 hover:border-black/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="mb-10 h-20 w-20 flex items-center justify-center rounded-3xl bg-black text-amber-500 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-black/20 relative overflow-hidden">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="mt-auto z-10">
                  <h3 className={`${displayFont.className} text-4xl sm:text-5xl uppercase tracking-wider text-black mb-3`}>
                    Wasit
                  </h3>
                  <p className="text-sm text-black/50 font-bold uppercase tracking-widest leading-relaxed">
                    Kontrol papan skor di lapangan live
                  </p>
                </div>
                <div className="absolute top-10 right-10 h-10 w-10 flex items-center justify-center rounded-full border border-black/10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>

              {/* Display Card */}
              <Link 
                href="/display" 
                className="group relative flex flex-col items-start p-8 sm:p-10 rounded-[3rem] bg-white border border-black/5 shadow-lg shadow-black/[0.01] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 hover:border-black/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="mb-10 h-20 w-20 flex items-center justify-center rounded-3xl bg-black text-amber-500 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-black/20 relative overflow-hidden">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mt-auto z-10">
                  <h3 className={`${displayFont.className} text-4xl sm:text-5xl uppercase tracking-wider text-black mb-3`}>
                    Display
                  </h3>
                  <p className="text-sm text-black/50 font-bold uppercase tracking-widest leading-relaxed">
                    Portal TV / Videotron untuk penonton
                  </p>
                </div>
                <div className="absolute top-10 right-10 h-10 w-10 flex items-center justify-center rounded-full border border-black/10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            </div>
          </section>


                    {/* ADDED MISSING SECTIONS HERE */}
          <section id="replace" className="py-12 lg:py-32 scroll-mt-24">
            <div className="rounded-[40px] bg-neutral-900 p-8 lg:p-20 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
              <div className="relative z-10 grid gap-16 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                    Pembaruan
                  </div>
                  <h2 className={`${displayFont.className} mt-6 text-5xl uppercase tracking-wider leading-[0.9]`}>
                    Tinggalkan <br /><span className="text-white/40 line-through decoration-amber-500 decoration-4">Papan Tulis</span><br /> Manual.
                  </h2>
                  <p className="mt-6 text-lg text-white/60 text-pretty max-w-md">Scoring manual sering salah dan tidak terlihat penonton. Scorehub memusatkan kontrol dan menayangkannya secara instan.</p>
                </div>
                <div className="grid gap-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-4">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-lg">✕</div>
                    <div>
                      <p className="font-bold text-white/90">Cara Lama</p>
                      <p className="text-white/50 text-sm mt-1">Teriak skor, lupa siapa servis, dan papan manual yang mudah rusak.</p>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-[var(--amber)] text-black flex items-start gap-4 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-black/10 flex items-center justify-center text-black text-lg">✓</div>
                    <div>
                      <p className="font-bold text-black">Cara Scorehub</p>
                      <p className="text-black/70 text-sm mt-1">Satu ketukan untuk poin. Indikator servis otomatis. TV update instan.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="py-12 lg:py-32 space-y-24 lg:space-y-32 scroll-mt-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
                <div className="relative rounded-[32px] border border-black/10 bg-white shadow-xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                  <div className="w-[45%] h-[85%] bg-black rounded-[2rem] border-4 border-black shadow-2xl flex flex-col overflow-hidden relative">
                    <div className="h-6 w-32 bg-black absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20"></div>
                    <div className="flex-1 bg-neutral-900 p-4 flex flex-col gap-2">
                      <div className="h-14 bg-neutral-800 rounded-xl w-full opacity-50 shrink-0"></div>
                      <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-2 grid grid-rows-2 gap-2">
                        <div className="bg-[var(--amber)] rounded-lg flex items-center justify-center text-black font-bold uppercase tracking-widest text-xs shadow-lg">Poin Kiri</div>
                        <div className="bg-neutral-800 rounded-lg flex items-center justify-center text-white/20 font-bold uppercase tracking-widest text-xs">Poin Kanan</div>
                      </div>
                      <div className="h-12 bg-neutral-800 rounded-xl shrink-0 flex items-center justify-center gap-4 px-4">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="h-1 w-full bg-white/10 rounded-full"></div>
                        <div className="text-xs text-white/50 uppercase tracking-widest">Undo</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-8 right-8 bg-white px-4 py-2 rounded-full shadow-lg border border-black/5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Latensi &lt; 50ms
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 px-4">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--amber)] mb-4">Fitur Utama</div>
              <h3 className={`${displayFont.className} text-5xl uppercase tracking-wide leading-[0.9] text-balance`}>Fokus Reli, <br /> Bukan Hitung-hitungan.</h3>
              <p className="mt-6 text-lg text-black/60 text-pretty text-sm sm:text-lg">Wasit tidak perlu pusing hitung poin. Cukup tap siapa pemenang relinya. Kami atur urutan servis, posisi lapangan, dan interval set secara otomatis.</p>
            </div>
          </section>

          <section id="flow" className="py-12 lg:py-32 scroll-mt-24 border-t border-black/5">
            <div className="text-center mb-20 px-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-black/40">Cara Kerja</div>
              <h2 className={`${displayFont.className} mt-6 text-5xl uppercase tracking-wide`}>Satu Sistem. <br /> Tiga Peran Utama.</h2>
            </div>
            <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] items-center">
              <div className="space-y-4">
                {flowSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step)}
                    className={`group w-full rounded-[32px] border px-8 py-6 text-left transition-[transform,box-shadow,background-color,color,border-color] duration-300 ${activeStep.id === step.id ? 'border-black bg-black text-white shadow-xl scale-105' : 'border-transparent hover:bg-black/5 hover:scale-105'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold uppercase tracking-[0.2em] ${activeStep.id === step.id ? 'text-[var(--amber)]' : 'text-black/40'}`}>{step.label}</span>
                    </div>
                    <h3 className={`${displayFont.className} text-3xl uppercase tracking-wide ${activeStep.id === step.id ? 'text-white' : 'text-black/40 group-hover:text-black'}`}>{step.title}</h3>
                    <p className={`mt-2 text-sm max-w-xs ${activeStep.id === step.id ? 'text-white/60' : 'text-black/40'}`}>{step.description}</p>
                  </button>
                ))}
              </div>
              <div className="relative aspect-[16/10] rounded-[40px] bg-neutral-100 border border-black/5 p-8 lg:p-12 shadow-inner overflow-hidden flex items-center justify-center">
                <div key={activeStep.id} className="animate-in fade-in zoom-in duration-500">
                  <div className="text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--amber)] text-black text-3xl font-bold shadow-lg shadow-amber-500/30 mb-6">
                      {activeStep.id === 'create' ? '1' : activeStep.id === 'control' ? '2' : '3'}
                    </div>
                    <h3 className={`${displayFont.className} text-5xl uppercase tracking-wide text-black mb-4`}>{activeStep.title}</h3>
                    <p className="text-lg text-black/60 max-w-md mx-auto text-pretty">{activeStep.description}</p>
                  </div>
                </div>
                <div className="absolute inset-0 z-[-1] opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              </div>
            </div>
          </section>



          <section id="cases" className="py-24 scroll-mt-24 border-t border-black/5">
            <div className="mb-16 px-4 md:px-0"><h2 className={`${displayFont.className} text-4xl uppercase tracking-wide text-black/30`}>Dirancang Untuk</h2></div>
            <div className="grid gap-8 md:grid-cols-3">
              {useCases.map((item) => (
                <div key={item.title} className="group cursor-default">
                  <div className="h-1 w-12 bg-black/10 mb-6 group-hover:w-full group-hover:bg-[var(--amber)] transition-[width,background-color] duration-500"></div>
                  <h3 className="text-lg font-bold uppercase tracking-widest mb-3">{item.title}</h3>
                  <p className="text-sm text-black/60 leading-relaxed text-pretty pr-4 text-left">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

          </div>
  );
}
