'use client';

import { useMemo, useState } from 'react';
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

const highlights = [
  { label: 'Latency', value: '< 1s' },
  { label: 'Mode', value: 'LAN Ready' },
  { label: 'Undo', value: '50 states' },
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
    label: 'Create',
    title: 'Start Match',
    description: 'Buat match baru, pilih kategori (MS/WS/MD/WD/XD), set PIN.',
  },
  {
    id: 'control',
    label: 'Control',
    title: 'Input Rally',
    description: 'Wasit input via web controller. Undo aman sampai 50 state.',
  },
  {
    id: 'display',
    label: 'Display',
    title: 'Show on Screen',
    description:
      'Scoreboard fullscreen untuk TV/videotron dengan serve indicator.',
  },
];

const useCases = [
  {
    title: 'Venue',
    description: 'Skor rapi untuk sewa lapangan, liga lokal, sparring rutin.',
  },
  {
    title: 'Perorangan',
    description: 'Pelatih/komunitas kecil yang butuh tampilan profesional.',
  },
  {
    title: 'Event',
    description: 'Turnamen skala kecil-menengah dengan setup cepat.',
  },
];

const faqs = [
  {
    q: 'Apakah butuh akun untuk mulai?',
    a: 'Belum. Kamu bisa langsung Start Match tanpa login.',
  },
  {
    q: 'Bisa dipakai tanpa internet?',
    a: 'Ya. Scorehub dirancang untuk LAN/WiFi lokal.',
  },
  {
    q: 'Berapa match gratis yang bisa aktif?',
    a: 'Free tier: 1 match aktif. Pro tier (planned) untuk multi-match.',
  },
  {
    q: 'Apakah ada history match?',
    a: 'Ada. State match tersimpan persistent di Convex untuk recovery lintas device.',
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

  const flowIndex = useMemo(() => {
    return flowSteps.findIndex((step) => step.id === activeStep.id);
  }, [activeStep.id]);

  return (
    <div
      className={`${bodyFont.className} min-h-screen bg-[#F8FAFC] text-black`}
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
        Skip to content
      </a>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.35),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] left-[-10%] h-[360px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(17,24,39,0.18),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-24 h-[380px] w-[900px] -translate-x-1/2 border border-black/10 bg-[linear-gradient(120deg,rgba(0,0,0,0.04),transparent)] opacity-70" />

        <header className="sticky top-0 z-20 border-b border-black/10 bg-white/80 backdrop-blur">
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
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/50">
                  Badminton Realtime
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.35em] text-black/60">
              {[
                { label: 'Fitur', href: '#features' },
                { label: 'Alur', href: '#flow' },
                { label: 'Pro', href: '#pricing' },
                { label: 'FAQ', href: '#faq' },
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

            <div className="flex items-center gap-3">
              <Link
                href="/create"
                className="hidden rounded-full border border-black/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-black/70 transition-colors hover:border-black/50 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] md:inline-flex"
              >
                Open Console
              </Link>
              <Link
                href="/create"
                className="rounded-full bg-[var(--amber)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Start Match
              </Link>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 lg:px-8">
          <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32">
            <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div className="flex flex-col items-start pt-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" />
                  Live Beta
                </div>

                <h1
                  className={`${displayFont.className} mt-8 text-6xl uppercase leading-[0.85] tracking-[0.05em] text-black text-balance sm:text-7xl lg:text-8xl`}
                >
                  The Stadium <br />
                  <span className="text-black/20">Experience,</span> <br />
                  <span className="text-[var(--amber)]">Anywhere.</span>
                </h1>

                <p className="mt-8 max-w-lg text-lg leading-relaxed text-black/60 font-medium text-pretty">
                  Professional badminton scoreboard system.{' '}
                  <br className="hidden sm:block" />
                  Realtime via LAN. Controls from your phone.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/create"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-xl shadow-black/20 transition-[transform,box-shadow,background-color] hover:-translate-y-1 hover:shadow-2xl hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
                  >
                    Start Match
                  </Link>
                  <a
                    href="#flow"
                    className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 px-8 text-[11px] font-bold uppercase tracking-[0.3em] text-black/60 transition-colors hover:border-black/30 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
                  >
                    How it works
                  </a>
                </div>
              </div>

              <div className="relative">
                {/* Abstract Background Elements */}
                <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[var(--amber)] opacity-20 blur-[100px]" />
                <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-blue-500 opacity-10 blur-[100px]" />

                {/* Main Visual Anchor - Tilted Display */}
                <div className="relative z-10 transform transition-transform duration-700 hover:rotate-0 lg:rotate-[-2deg] hover:scale-[1.02]">
                  <div className="overflow-hidden rounded-3xl border border-black/10 bg-black shadow-2xl shadow-black/20">
                    <div className="relative aspect-video w-full bg-neutral-900 p-1">
                      {/* Screen Bezel */}
                      <div className="h-full w-full rounded-2xl bg-[#000000] overflow-hidden relative flex flex-col font-sans">
                        {/* Header */}
                        <div className="h-12 bg-[#111] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#fbbf24] text-black px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-sm tracking-wider">
                              MS
                            </div>
                            <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
                              Men's Singles
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                          </div>
                        </div>

                        {/* Score Rows */}
                        <div className="flex-1 flex flex-col">
                          {/* Home Row */}
                          <div className="flex-1 border-b border-white/10 flex">
                            {/* Name Side */}
                            <div className="flex-1 bg-[#111] flex items-center px-6 relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 animate-pulse motion-reduce:animate-none"></div>
                              <div className="flex items-center gap-4">
                                <div className="h-8 w-12 bg-blue-600 rounded-sm relative overflow-hidden border border-white/10 shadow-sm">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20"></div>
                                </div>
                                <span className="text-white font-bold text-xl uppercase tracking-wider truncate">
                                  Ginting
                                </span>
                                <div className="h-4 w-4 text-[#fbbf24]">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                  >
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            {/* Sets & Points */}
                            <div className="w-16 bg-[#0a0a0a] flex items-center justify-center border-l border-white/5">
                              <span className="text-2xl font-mono font-bold text-[#fbbf24]/80">
                                21
                              </span>
                            </div>
                            <div className="w-24 bg-black flex items-center justify-center border-l-2 border-white/10 relative overflow-hidden">
                              <span className="text-5xl font-mono font-black text-[#4ade80] tracking-tighter tabular-nums relative z-10">
                                21
                              </span>
                            </div>
                          </div>

                          {/* Away Row */}
                          <div className="flex-1 flex">
                            {/* Name Side */}
                            <div className="flex-1 bg-[#111] flex items-center px-6">
                              <div className="flex items-center gap-4">
                                <div className="h-8 w-12 bg-red-600 rounded-sm relative overflow-hidden border border-white/10 shadow-sm">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20"></div>
                                </div>
                                <span className="text-white/40 font-bold text-xl uppercase tracking-wider truncate">
                                  Axelsen
                                </span>
                              </div>
                            </div>
                            {/* Sets & Points */}
                            <div className="w-16 bg-[#0a0a0a] flex items-center justify-center border-l border-white/5">
                              <span className="text-2xl font-mono font-bold text-[#fbbf24]/80">
                                15
                              </span>
                            </div>
                            <div className="w-24 bg-black flex items-center justify-center border-l-2 border-white/10">
                              <span className="text-5xl font-mono font-black text-[#4ade80] tracking-tighter tabular-nums opacity-60">
                                12
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div className="h-8 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-center gap-6">
                          <div className="text-[9px] font-bold text-[#fbbf24] uppercase tracking-[0.2em]">
                            Set 2
                          </div>
                          <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                            Court 1
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Element: Controller */}
                  <div className="absolute -bottom-12 -left-8 w-48 rounded-[24px] border border-black/10 bg-white p-4 shadow-xl lg:-left-12">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-1.5 w-8 rounded-full bg-black/10"></div>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse motion-reduce:animate-none"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-12 w-full rounded-xl bg-[var(--amber)] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest shadow-md">
                        Point INA
                      </div>
                      <div className="h-12 w-full rounded-xl bg-black/5 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-black/40">
                        Point JPN
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* COMPARISON SECTION - High Contrast Rhythm Breaker */}
          <section id="replace" className="py-24 lg:py-32 scroll-mt-24">
            <div className="rounded-[40px] bg-neutral-900 p-8 lg:p-20 text-white shadow-2xl overflow-hidden relative">
              {/* Background Texture */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

              <div className="relative z-10 grid gap-16 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    The Upgrade
                  </div>
                  <h2
                    className={`${displayFont.className} mt-6 text-5xl uppercase tracking-wider leading-[0.9]`}
                  >
                    Leave the <br />
                    <span className="text-white/40 line-through decoration-amber-500 decoration-4">
                      Whiteboard
                    </span>
                    <br /> Behind.
                  </h2>
                  <p className="mt-6 text-lg text-white/60 text-pretty max-w-md">
                    Manual scoring is prone to error and invisible to the
                    audience. Scorehub centralizes control and broadcasts it
                    instantly.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-4">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-lg">
                      ✕
                    </div>
                    <div>
                      <p className="font-bold text-white/90">The Old Way</p>
                      <p className="text-white/50 text-sm mt-1">
                        Shouting scores, forgetting whose serve it is, manual
                        flipboards that break.
                      </p>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-[var(--amber)] text-black flex items-start gap-4 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-black/10 flex items-center justify-center text-black text-lg">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-black">The Scorehub Way</p>
                      <p className="text-black/70 text-sm mt-1">
                        One tap to add a point. Serve indicator moves
                        automatically. TV updates instantly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES SECTION - Visual Moments */}
          <section id="features" className="py-24 space-y-32 scroll-mt-24">
            {/* Feature 1: Controller */}
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
                <div className="relative rounded-[32px] border border-black/10 bg-white shadow-xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                  {/* Abstract Phone UI */}
                  <div className="w-[45%] h-[85%] bg-black rounded-[2rem] border-4 border-black shadow-2xl flex flex-col overflow-hidden relative">
                    <div className="h-6 w-32 bg-black absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20"></div>
                    <div className="flex-1 bg-neutral-900 p-4 flex flex-col gap-2">
                      <div className="h-14 bg-neutral-800 rounded-xl w-full opacity-50 shrink-0"></div>
                      <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-2 grid grid-rows-2 gap-2">
                        <div className="bg-[var(--amber)] rounded-lg flex items-center justify-center text-black font-bold uppercase tracking-widest text-[10px] shadow-lg">
                          Point Left
                        </div>
                        <div className="bg-neutral-800 rounded-lg flex items-center justify-center text-white/20 font-bold uppercase tracking-widest text-[10px]">
                          Point Right
                        </div>
                      </div>
                      <div className="h-12 bg-neutral-800 rounded-xl shrink-0 flex items-center justify-center gap-4 px-4">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="h-1 w-full bg-white/10 rounded-full"></div>
                        <div className="text-[8px] text-white/50 uppercase tracking-widest">
                          Undo
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <div className="absolute bottom-8 right-8 bg-white px-4 py-2 rounded-full shadow-lg border border-black/5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse motion-reduce:animate-none" />
                    Latency &lt; 50ms
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 px-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--amber)] mb-4">
                  Core Workflow
                </div>
                <h3
                  className={`${displayFont.className} text-5xl uppercase tracking-wide leading-[0.9] text-balance`}
                >
                  Point input, <br /> Not Math class.
                </h3>
                <p className="mt-6 text-lg text-black/60 text-pretty">
                  Referees shouldn't be calculating scores. They should be
                  watching the lines. Just tap who won the rally. We handle the
                  serving order, court sides, and set intervals.
                </p>
              </div>
            </div>

            {/* Feature 2: Display */}
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="px-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-600 mb-4">
                  Visuals
                </div>
                <h3
                  className={`${displayFont.className} text-5xl uppercase tracking-wide leading-[0.9] text-balance`}
                >
                  Broadcast <br /> Quality.
                </h3>
                <p className="mt-6 text-lg text-black/60 text-pretty">
                  Your cheap TV monitor just became a pro scoreboard. Designed
                  for high visibility, reading comfortably from the back of the
                  hall.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--amber)]/10 to-transparent rounded-full blur-3xl" />
                <div className="relative rounded-[32px] border border-black/10 bg-black shadow-2xl overflow-hidden aspect-video flex items-center justify-center group">
                  {/* Screen Content */}
                  <div className="absolute inset-0 flex flex-col p-8 opacity-90 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-end border-b border-white/20 pb-4">
                      <span className="text-4xl font-black text-white">21</span>
                      <span className="text-xl font-medium text-white/50 tracking-widest">
                        SET 1
                      </span>
                      <span className="text-4xl font-black text-[var(--amber)]">
                        19
                      </span>
                    </div>
                    <div className="mt-8 flex justify-between">
                      <div className="text-6xl font-black text-white/20">
                        INA
                      </div>
                      <div className="text-6xl font-black text-white/20">
                        MAS
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-[10px] font-bold text-white/70 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-sm bg-white" /> Fullscreen
                    Mode
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Offline */}
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="relative rounded-[32px] bg-neutral-100 border border-black/5 overflow-hidden aspect-[4/3] flex items-center justify-center">
                  {/* Network Visualization */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,black_1px,transparent_1px)] [background-size:24px_24px]"></div>

                  <div className="relative z-10 grid grid-cols-2 gap-4">
                    <div className="h-24 w-24 bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col items-center justify-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        PC
                      </div>
                      <div className="h-1 w-8 bg-black/10 rounded-full"></div>
                    </div>
                    <div className="h-24 w-24 bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col items-center justify-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[var(--amber)]/20 text-amber-700 flex items-center justify-center">
                        TV
                      </div>
                      <div className="h-1 w-8 bg-black/10 rounded-full"></div>
                    </div>
                    <div className="col-span-2 h-24 w-full bg-neutral-900 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-white">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse motion-reduce:animate-none"></div>
                      <span className="text-xs font-bold uppercase tracking-widest ml-2">
                        Local Server
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-black/5 rounded-full animate-[spin_10s_linear_infinite] motion-reduce:animate-none pointer-events-none border-dashed opacity-20"></div>
                </div>
              </div>
              <div className="order-1 lg:order-2 px-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">
                  Reliability
                </div>
                <h3
                  className={`${displayFont.className} text-5xl uppercase tracking-wide leading-[0.9]`}
                >
                  No Internet? <br /> No Problem.
                </h3>
                <p className="mt-6 text-lg text-black/60 text-pretty">
                  Gyms often have terrible WiFi. We built Scorehub to work over
                  a local LAN. Deploy the server on one laptop, and everyone
                  connects locally.
                </p>
              </div>
            </div>
          </section>

          {/* FLOW SECTION - Interactive Timeline */}
          <section
            id="flow"
            className="py-24 lg:py-32 scroll-mt-24 border-t border-black/5"
          >
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                How it works
              </div>
              <h2
                className={`${displayFont.className} mt-6 text-5xl uppercase tracking-wide`}
              >
                One System. <br /> Three Roles.
              </h2>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] items-center">
              <div className="space-y-4">
                {flowSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step)}
                    className={`group w-full rounded-[32px] border px-8 py-6 text-left transition-[transform,box-shadow,background-color,color,border-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] ${
                      activeStep.id === step.id
                        ? 'border-black bg-black text-white shadow-xl scale-105'
                        : 'border-transparent hover:bg-black/5 hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.2em] ${activeStep.id === step.id ? 'text-[var(--amber)]' : 'text-black/40'}`}
                      >
                        {step.label}
                      </span>
                    </div>
                    <h3
                      className={`${displayFont.className} text-3xl uppercase tracking-wide ${activeStep.id === step.id ? 'text-white' : 'text-black/40 group-hover:text-black'}`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`mt-2 text-sm max-w-xs ${activeStep.id === step.id ? 'text-white/60' : 'text-black/40'}`}
                    >
                      {step.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="relative aspect-[16/10] rounded-[40px] bg-neutral-100 border border-black/5 p-8 lg:p-12 shadow-inner overflow-hidden flex items-center justify-center">
                {/* Dynamic Content Display based on active step */}
                <div
                  key={activeStep.id}
                  className="animate-in fade-in zoom-in duration-500"
                >
                  <div className="text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--amber)] text-black text-3xl font-bold shadow-lg shadow-amber-500/30 mb-6">
                      {activeStep.id === 'create'
                        ? '1'
                        : activeStep.id === 'control'
                          ? '2'
                          : '3'}
                    </div>
                    <h3
                      className={`${displayFont.className} text-5xl uppercase tracking-wide text-black mb-4`}
                    >
                      {activeStep.title}
                    </h3>
                    <p className="text-lg text-black/60 max-w-md mx-auto text-pretty">
                      {activeStep.description}
                    </p>
                  </div>
                </div>

                {/* Decorative background grid */}
                <div className="absolute inset-0 z-[-1] opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              </div>
            </div>
          </section>

          {/* PRICING SECTION */}
          <section id="pricing" className="py-24 lg:py-32 scroll-mt-24">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Free Tier */}
              <div className="rounded-[40px] border border-black/10 bg-white p-10 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
                    Starter
                  </span>
                  <h3
                    className={`${displayFont.className} mt-4 text-6xl uppercase tracking-tight`}
                  >
                    Free
                  </h3>
                  <p className="mt-4 text-black/60 font-medium">
                    Perfect for sparring and local practice.
                  </p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    '1 Active Match',
                    'Basic Scoreboard',
                    'Local Network Support',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm font-semibold text-black/70"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-black/20"></div>{' '}
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/create"
                  className="w-full py-4 rounded-full border-2 border-black text-[11px] font-bold uppercase tracking-[0.25em] text-center hover:bg-black hover:text-white transition-colors"
                >
                  Start Now
                </Link>
              </div>

              {/* Pro Tier (Planned) */}
              <div className="relative rounded-[40px] border border-black/10 bg-neutral-900 p-10 text-white shadow-2xl flex flex-col overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12">
                  <div className="text-[10rem] leading-none font-black tracking-tighter text-white">
                    PRO
                  </div>
                </div>

                <div className="relative z-10 mb-8">
                  <div className="inline-block px-3 py-1 rounded-full bg-[var(--amber)] text-black text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                    Coming Soon
                  </div>
                  <h3
                    className={`${displayFont.className} mt-2 text-6xl uppercase tracking-tight`}
                  >
                    Unlimited
                  </h3>
                  <p className="mt-4 text-white/60 font-medium text-pretty">
                    For tournaments, leagues, and venues requiring multiple
                    courts.
                  </p>
                </div>
                <ul className="relative z-10 space-y-4 mb-10 flex-1">
                  {[
                    'Result History',
                    'Custom Branding',
                    'Cloud Sync',
                    'Tournament Mode',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm font-semibold text-white/80"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]"></div>{' '}
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="relative z-10 w-full py-4 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-[0.25em] text-center text-white/40 cursor-not-allowed"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </section>

          {/* CASES SECTION - Minimal Grid */}
          <section
            id="cases"
            className="py-24 scroll-mt-24 border-t border-black/5"
          >
            <div className="mb-16">
              <h2
                className={`${displayFont.className} text-4xl uppercase tracking-wide text-black/30`}
              >
                Built For
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {useCases.map((item, i) => (
                <div key={item.title} className="group cursor-default">
                  <div className="h-1 w-12 bg-black/10 mb-6 group-hover:w-full group-hover:bg-[var(--amber)] transition-[width,background-color] duration-500"></div>
                  <h3 className="text-lg font-bold uppercase tracking-widest mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-black/60 leading-relaxed text-pretty pr-4">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ SECTION - Clean List */}
          <section
            id="faq"
            className="py-24 scroll-mt-24 border-t border-black/5"
          >
            <div className="mb-16">
              <h2
                className={`${displayFont.className} text-4xl uppercase tracking-wide text-black/30`}
              >
                FAQ
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-black/5 bg-white p-8"
                >
                  <h3 className="text-lg font-bold text-black mb-2">{faq.q}</h3>
                  <p className="text-black/60">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
