'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Bebas_Neue, Literata } from 'next/font/google';


const displayFont = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
});

const bodyFont = Literata({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ADMIN_AUTH_STORAGE_KEY } from '@/lib/auth';
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
  const router = useRouter();

  // Role Logic State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [refereeJoinOpen, setRefereeJoinOpen] = useState(false);
  const [displayJoinOpen, setDisplayJoinOpen] = useState(false);

  const [pinInput, setPinInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [displayCodeInput, setDisplayCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyAdminMutation = useMutation(api.matches.verifyAdminPin);

  const handleAdminAuth = async () => {
    if (!pinInput) return;
    setIsVerifying(true);
    try {
      const isValid = await verifyAdminMutation({ pin: pinInput });
      if (isValid) {
        localStorage.setItem(
          ADMIN_AUTH_STORAGE_KEY,
          JSON.stringify({ pin: pinInput, ts: Date.now() }),
        );
        setAdminAuthOpen(false);
        router.push('/admin');
      } else {
        setAuthError('PIN Administrator Salah');
      }
    } catch (err) {
      setAuthError('Gagal verifikasi PIN');
    } finally {
      setIsVerifying(false);
    }
  };

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
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/50">
                  Badminton Realtime
                </p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.35em] text-black/60">
              {[
                { label: 'Fitur', href: '#features' },
                { label: 'Alur', href: '#flow' },
                { label: 'Pro', href: '#pricing' },
                { label: 'Tanya Jawab', href: '#faq' },
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
              <button
                onClick={() => setRoleModalOpen(true)}
                className="hidden sm:block rounded-full border border-black/20 px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-black/70 transition-all hover:border-black/50 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
              >
                Pusat Kontrol
              </button>
              <button
                onClick={() => setRoleModalOpen(true)}
                className="rounded-full bg-[var(--amber)] px-4 sm:px-6 py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-black shadow-[0_10px_30px_-10px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-amber-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Mulai Match
              </button>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 lg:px-8 overflow-x-hidden">
          <section className="relative pt-12 sm:pt-24 pb-20 lg:pt-32 lg:pb-32">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div className="flex flex-col items-start px-2 sm:px-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" />
                  Live Beta
                </div>

                <h1
                  className={`${displayFont.className} mt-8 text-4xl sm:text-7xl lg:text-8xl uppercase leading-[0.9] sm:leading-[0.85] tracking-[0.05em] text-black text-balance`}
                >
                  Sensasi Pro <br />
                  <span className="text-black/20 text-3xl sm:text-6xl lg:text-7xl">Di mana saja,</span> <br />
                  <span className="text-[var(--amber)]">Kapan saja.</span>
                </h1>

                <p className="mt-8 max-w-lg text-base sm:text-lg leading-relaxed text-black/60 font-medium text-pretty">
                  Sistem papan skor badminton profesional.<br className="hidden sm:block" />
                  Realtime via LAN. Kontrol lewat HP Anda sekarang.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <button
                    onClick={() => setRoleModalOpen(true)}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-xl shadow-black/20 transition-[transform,box-shadow,background-color] hover:-translate-y-1 hover:shadow-2xl hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
                  >
                    Mulai Pertandingan
                  </button>
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
                            <div className="bg-[#fbbf24] text-black px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-sm tracking-widest">
                              MS
                            </div>
                            <div className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
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
                          <div className="text-[9px] font-bold text-[#fbbf24] uppercase tracking-widest">
                            Set 2
                          </div>
                          <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                            Lapangan 1
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-8 -left-4 w-40 sm:w-48 rounded-[24px] border border-black/10 bg-white p-4 shadow-2xl lg:-left-12">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-1.5 w-8 rounded-full bg-black/10" />
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 sm:h-12 w-full rounded-xl bg-[var(--amber)] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest shadow-md">
                        Poin INA
                      </div>
                      <div className="h-10 sm:h-12 w-full rounded-xl bg-black/5 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-black/40">
                        Poin JPN
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ADDED MISSING SECTIONS HERE */}
          <section id="replace" className="py-12 lg:py-32 scroll-mt-24">
            <div className="rounded-[40px] bg-neutral-900 p-8 lg:p-20 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
              <div className="relative z-10 grid gap-16 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
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
                        <div className="bg-[var(--amber)] rounded-lg flex items-center justify-center text-black font-bold uppercase tracking-widest text-[10px] shadow-lg">Poin Kiri</div>
                        <div className="bg-neutral-800 rounded-lg flex items-center justify-center text-white/20 font-bold uppercase tracking-widest text-[10px]">Poin Kanan</div>
                      </div>
                      <div className="h-12 bg-neutral-800 rounded-xl shrink-0 flex items-center justify-center gap-4 px-4">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="h-1 w-full bg-white/10 rounded-full"></div>
                        <div className="text-[8px] text-white/50 uppercase tracking-widest">Undo</div>
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
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--amber)] mb-4">Fitur Utama</div>
              <h3 className={`${displayFont.className} text-5xl uppercase tracking-wide leading-[0.9] text-balance`}>Fokus Reli, <br /> Bukan Hitung-hitungan.</h3>
              <p className="mt-6 text-lg text-black/60 text-pretty text-sm sm:text-lg">Wasit tidak perlu pusing hitung poin. Cukup tap siapa pemenang relinya. Kami atur urutan servis, posisi lapangan, dan interval set secara otomatis.</p>
            </div>
          </section>

          <section id="flow" className="py-12 lg:py-32 scroll-mt-24 border-t border-black/5">
            <div className="text-center mb-20 px-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Cara Kerja</div>
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
                      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${activeStep.id === step.id ? 'text-[var(--amber)]' : 'text-black/40'}`}>{step.label}</span>
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

          <section id="pricing" className="py-12 lg:py-32 scroll-mt-24">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Free Tier */}
              <div className="rounded-[40px] border border-black/10 bg-white p-10 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">Pemula</span>
                  <h3 className={`${displayFont.className} mt-4 text-6xl uppercase tracking-tight`}>Gratis</h3>
                  <p className="mt-4 text-black/60 font-medium">Cocok untuk sparing dan latihan rutin.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['1 Match Aktif', 'Papan Skor Dasar', 'Dukungan Jaringan Lokal'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-semibold text-black/70">
                      <div className="h-1.5 w-1.5 rounded-full bg-black/20"></div> {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setRoleModalOpen(true)}
                  className="w-full py-4 rounded-full border-2 border-black text-[11px] font-bold uppercase tracking-[0.25em] text-center hover:bg-black hover:text-white transition-colors"
                >
                  Mulai Sekarang
                </button>
              </div>
              {/* Pro Tier (Placeholder) */}
              <div className="relative rounded-[40px] border border-black/10 bg-neutral-900 p-10 text-white shadow-2xl flex flex-col overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12">
                  <div className="text-[10rem] leading-none font-black tracking-tighter text-white">PRO</div>
                </div>
                <div className="relative z-10 mb-8">
                  <div className="inline-block px-3 py-1 rounded-full bg-[var(--amber)] text-black text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Segera Hadir</div>
                  <h3 className={`${displayFont.className} mt-2 text-6xl uppercase tracking-tight`}>PRO</h3>
                  <p className="mt-4 text-white/60 font-medium text-pretty">Untuk turnamen, liga, dan GOR dengan banyak lapangan.</p>
                </div>
                <ul className="relative z-10 space-y-4 mb-10 flex-1">
                  {['Riwayat Hasil', 'Branding Kustom', 'Cloud Sync', 'Mode Turnamen'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-semibold text-white/80">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]"></div> {item}
                    </li>
                  ))}
                </ul>
                <button disabled className="relative z-10 w-full py-4 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-[0.25em] text-center text-white/40 cursor-not-allowed">Daftar Antrean</button>
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

          <section id="faq" className="py-24 scroll-mt-24 border-t border-black/5">
            <div className="mb-16"><h2 className={`${displayFont.className} text-4xl uppercase tracking-wide text-black/30`}>FAQ</h2></div>
            <div className="grid gap-8 md:grid-cols-2">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-3xl border border-black/5 bg-white p-8">
                  <h3 className="text-lg font-bold text-black mb-2">{faq.q}</h3>
                  <p className="text-black/60">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Role Selection Dialog */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-[2.5rem] border-black/10 p-2 overflow-hidden bg-white">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className={`${displayFont.className} text-4xl uppercase tracking-wider text-black`}>Pilih Peran Anda</DialogTitle>
              <DialogDescription className="text-black/60 font-medium">Pilih bagaimana Anda ingin menggunakan sistem papan skor hari ini.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <button onClick={() => { setRoleModalOpen(false); setAdminAuthOpen(true); setAuthError(""); setPinInput(""); }} className="group relative flex flex-col items-start p-6 rounded-[2rem] border border-black/10 transition-[background-color,transform,box-shadow] hover:bg-neutral-900 text-left hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10">
                <div className="mb-4 h-10 w-10 flex items-center justify-center rounded-xl bg-black text-[var(--amber)] group-hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </div>
                <h4 className={`${displayFont.className} text-2xl uppercase tracking-wider text-black group-hover:text-white`}>Administrator</h4>
                <p className="text-[10px] text-black/50 group-hover:text-white/40 mt-1 uppercase tracking-widest font-black leading-none">Buat pertandingan & kelola dashboard</p>
              </button>
              <button onClick={() => { setRoleModalOpen(false); setRefereeJoinOpen(true); setAuthError(""); setCodeInput(""); }} className="group relative flex flex-col items-start p-6 rounded-[2rem] border border-black/10 transition-[background-color,transform,box-shadow] hover:bg-neutral-900 text-left hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10">
                <div className="mb-4 h-10 w-10 flex items-center justify-center rounded-xl bg-black text-[var(--amber)] group-hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                </div>
                <h4 className={`${displayFont.className} text-2xl uppercase tracking-wider text-black group-hover:text-white`}>Wasit Lapangan</h4>
                <p className="text-[10px] text-black/50 group-hover:text-white/40 mt-1 uppercase tracking-widest font-black leading-none">Kontrol papan skor pertandingan live</p>
              </button>
              <button onClick={() => { setRoleModalOpen(false); setDisplayJoinOpen(true); setDisplayCodeInput(""); }} className="group relative flex flex-col items-start p-6 rounded-[2rem] border border-black/10 transition-[background-color,transform,box-shadow] hover:bg-neutral-900 text-left hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10">
                <div className="mb-4 h-10 w-10 flex items-center justify-center rounded-xl bg-black text-[var(--amber)] group-hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h4 className={`${displayFont.className} text-2xl uppercase tracking-wider text-black group-hover:text-white`}>Layar Scoreboard</h4>
                <p className="text-[10px] text-black/50 group-hover:text-white/40 mt-1 uppercase tracking-widest font-black leading-none">Layar utama untuk TV atau Videotron</p>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Authentication Dialog */}
      <Dialog open={adminAuthOpen} onOpenChange={setAdminAuthOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-black/10 p-0 overflow-hidden bg-white">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className={`${displayFont.className} text-4xl uppercase tracking-wider text-black`}>Akses Admin</DialogTitle>
              <DialogDescription className="text-black/60 font-medium">Masukkan PIN administrator untuk lanjut ke dashboard.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Input type="password" placeholder="••••" value={pinInput} onChange={(e) => setPinInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()} className="h-14 text-center text-2xl tracking-[0.5em] rounded-2xl border-black/10 bg-black/5 focus:bg-white focus:border-black/20" />
                {authError && <p className="text-xs font-bold uppercase tracking-widest text-red-500 text-center">{authError}</p>}
              </div>
              <Button 
                onClick={handleAdminAuth} 
                className="w-full h-14 rounded-full bg-black text-white hover:bg-neutral-800 text-[11px] font-bold uppercase tracking-[0.3em] relative overflow-hidden"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]" />
                  </span>
                ) : (
                  'Autentikasi'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Referee Join Dialog */}
      <Dialog open={refereeJoinOpen} onOpenChange={setRefereeJoinOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-black/10 p-0 overflow-hidden bg-white">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className={`${displayFont.className} text-4xl uppercase tracking-wider text-black`}>Kode Match</DialogTitle>
              <DialogDescription className="text-black/60 font-medium">Masukkan kode display untuk pertandingan yang Anda pimpin.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <Input placeholder="KODE-MATCH" value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && codeInput.length >= 4 && router.push(`/referee/join?code=${codeInput}`)} className="h-14 text-center text-xl tracking-[0.2em] font-black rounded-2xl border-black/10 bg-black/5 focus:bg-white focus:border-black/20 uppercase" />
              <Button onClick={() => router.push(`/referee/join?code=${codeInput}`)} disabled={codeInput.length < 4} className="w-full h-14 rounded-full bg-black text-white hover:bg-neutral-800 text-[11px] font-bold uppercase tracking-[0.3em] disabled:opacity-50">Lanjut ke PIN</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Match Display Dialog */}
      <Dialog open={displayJoinOpen} onOpenChange={setDisplayJoinOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-black/10 p-0 overflow-hidden bg-white">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className={`${displayFont.className} text-4xl uppercase tracking-wider text-black`}>Kode Tampilan</DialogTitle>
              <DialogDescription className="text-black/60 font-medium">Masukkan 8-karakter kode match untuk melihat papan skor.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 font-black text-xl tracking-[0.1em] transition-colors group-focus-within:text-black/40">MATCH-</div>
                <Input 
                  placeholder="MM3J57GL" 
                  value={displayCodeInput} 
                  onChange={(e) => setDisplayCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} 
                  onKeyDown={(e) => e.key === 'Enter' && displayCodeInput.length === 8 && router.push(`/display/MATCH-${displayCodeInput}`)} 
                  className="h-14 pl-28 text-left text-xl tracking-[0.2em] font-black rounded-2xl border-black/10 bg-black/5 focus:bg-white focus:border-black/20 uppercase" 
                />
              </div>
              <Button 
                onClick={() => router.push(`/display/MATCH-${displayCodeInput}`)} 
                disabled={displayCodeInput.length < 8} 
                className="w-full h-14 rounded-full bg-black text-white hover:bg-neutral-800 text-[11px] font-bold uppercase tracking-[0.3em] disabled:opacity-50"
              >
                Buka Skor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
