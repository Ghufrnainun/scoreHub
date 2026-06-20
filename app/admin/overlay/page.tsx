'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { loadValidAdminSession } from '@/lib/admin-session';
import { cn } from '@/lib/utils';
import {
  Copy,
  Check,
  ExternalLink,
  Monitor,
  Tv2,
  LayoutDashboard,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────
type OverlayStyle = 'corner-bar' | 'scoreline' | 'minimal-card' | 'bwf' | 'display-style' | 'broadcast';
type OverlayPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-center' | 'top-center' | 'fit';
type ChromaBg = 'transparent' | 'chroma-green' | 'chroma-blue';

interface OverlayConfig {
  matchId: string;
  style: OverlayStyle;
  position: OverlayPosition;
  bg: ChromaBg;
  color: string;
  showWinner: boolean;
  theme?: 'classic-bronze' | 'rounded-crimson' | 'neon';
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STYLES: { id: OverlayStyle; label: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
  {
    id: 'bwf',
    label: 'BWF Style',
    desc: 'Mirip scoreboard resmi BWF — strip flag, nama pemain, serve indicator ◆',
    icon: <Tv2 className="w-5 h-5" />,
    badge: 'BWF',
  },
  {
    id: 'broadcast',
    label: 'Broadcast TV Style',
    desc: 'Desain BWF TV Broadcast Graphic premium — bar horizontal putih, flag box, font Georgia, dan badge skor mengkilap',
    icon: <Tv2 className="w-5 h-5" />,
    badge: 'TV',
  },
  {
    id: 'display-style',
    label: 'Display Style',
    desc: 'Replikasi papan skor utama venue — struktur tabel modern dengan kolom set & poin lengkap',
    icon: <Tv2 className="w-5 h-5" />,
    badge: 'VENUE',
  },
  {
    id: 'corner-bar',
    label: 'Corner Bar',
    desc: 'Card kompak di sudut layar — paling populer untuk streaming kasual',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: 'scoreline',
    label: 'Scoreline',
    desc: 'Bar tipis horizontal penuh ala ESPN/Sky Sports untuk broadcast profesional',
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    id: 'minimal-card',
    label: 'Minimal Card',
    desc: 'Card kecil modern bergaya esports — clean dan elegan',
    icon: <Layers className="w-5 h-5" />,
  },
];

const POSITIONS: { id: OverlayPosition; label: string; styles?: OverlayStyle[] }[] = [
  { id: 'bottom-right', label: 'Bawah Kanan' },
  { id: 'bottom-left', label: 'Bawah Kiri' },
  { id: 'bottom-center', label: 'Bawah Tengah', styles: ['bwf', 'display-style', 'broadcast'] },
  { id: 'top-right', label: 'Atas Kanan' },
  { id: 'top-left', label: 'Atas Kiri' },
  { id: 'top-center', label: 'Atas Tengah', styles: ['bwf', 'display-style', 'broadcast'] },
  { id: 'fit', label: 'Fit / Bebas (Sesuai Ukuran OBS Source)', styles: ['broadcast'] },
];

const BG_OPTIONS: { id: ChromaBg; label: string; color: string }[] = [
  { id: 'transparent', label: 'Transparan', color: 'transparent' },
  { id: 'chroma-green', label: 'Chroma Green', color: '#00FF00' },
  { id: 'chroma-blue', label: 'Chroma Blue', color: '#0000FF' },
];

const PRESET_COLORS = [
  '#fbbf24', // amber
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#f97316', // orange
  '#ffffff', // white
];

const OBS_STEPS = [
  'Buka OBS Studio → klik tombol **"+"** di panel Sources',
  'Pilih **Browser Source** dari menu',
  'Centang **"Local file"** jika menggunakan server lokal, atau paste URL langsung',
  'Paste URL overlay di kolom URL',
  'Set Width: **1920** dan Height: **1080**',
  'Centang **"Shutdown source when not visible"** (opsional tapi disarankan)',
  'Klik **OK** → drag & resize layer overlay sesuai kebutuhan',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function OverlayGeneratorPage() {
  const [adminSessionToken, setAdminSessionToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<OverlayConfig>({
    matchId: '',
    style: 'bwf',
    position: 'bottom-left',
    bg: 'transparent',
    color: '#fbbf24',
    showWinner: true,
    theme: 'classic-bronze',
  });

  useEffect(() => {
    const session = loadValidAdminSession();
    setAdminSessionToken(session?.token || '');
  }, []);

  const authorizedMatches = useQuery(
    api.matches.listAdmin,
    adminSessionToken ? { adminSessionToken } : 'skip',
  );

  const getOverlayUrl = useCallback(() => {
    if (!config.matchId) return '';
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      style: config.style,
      position: config.position,
      bg: config.bg,
      color: config.color,
      winner: String(config.showWinner),
    });
    if (config.style === 'broadcast' && config.theme) {
      params.append('theme', config.theme);
    }
    return `${base}/overlay/${encodeURIComponent(config.matchId)}?${params.toString()}`;
  }, [config]);

  const handleCopy = () => {
    const url = getOverlayUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const overlayUrl = getOverlayUrl();

  let stepCounter = 1;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <Tv2 className="w-6 h-6 text-primary" />
          Overlay OBS / Streaming
        </h1>
        <p className="text-xs text-muted-foreground font-medium">
          Generate URL overlay skor real-time untuk dimasukkan ke OBS, Streamlabs, atau software streaming lainnya sebagai Browser Source.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── Left column: config ── */}
        <div className="space-y-6">

          {/* Step 1: Pick match */}
          <section className="space-y-3">
            <SectionLabel step={stepCounter++} label="Pilih Pertandingan" />
            <div className="space-y-2">
              {authorizedMatches === undefined ? (
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ) : authorizedMatches.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center text-xs text-muted-foreground">
                  Tidak ada match aktif yang ditemukan
                </div>
              ) : (
                <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                  {authorizedMatches.map((m: any) => {
                    const isLive = m.status === 'live' || m.status === 'active';
                    const isSelected = config.matchId === m.matchId;
                    return (
                      <button
                        key={m.matchId}
                        onClick={() => setConfig((c) => ({ ...c, matchId: m.matchId }))}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full flex-shrink-0',
                              isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400',
                            )}
                          />
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-100">
                              {m.matchId}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {m.teams?.home?.name ?? '?'} vs {m.teams?.away?.name ?? '?'}
                              {' · '}
                              {m.category || 'MS'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'text-[9px] font-black uppercase px-2 py-0.5 rounded-full',
                            isLive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800',
                          )}
                        >
                          {isLive ? 'LIVE' : m.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Step 2: Pick style */}
          <section className="space-y-3">
            <SectionLabel step={stepCounter++} label="Pilih Gaya Overlay" />
            <div className="grid gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setConfig((c) => ({ ...c, style: s.id }))}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                    config.style === s.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-900/40',
                  )}
                >
                  <span
                    className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      config.style === s.id
                        ? 'bg-primary/10 text-primary'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500',
                    )}
                  >
                    {s.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {s.label}
                      {s.badge && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-widest">
                          {s.badge}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Step 2.5: Tema Grafik TV (only for broadcast style) */}
          {config.style === 'broadcast' && (
            <section className="space-y-3">
              <SectionLabel step={stepCounter++} label="Tema Grafik TV" />
              <div className="grid gap-2">
                {[
                  { id: 'classic-bronze', label: 'Classic Bronze & Wood', desc: 'BWF Classic Replica — layout horizontal asimetris bernuansa kayu & perunggu' },
                  { id: 'rounded-crimson', label: 'Rounded Crimson', desc: 'BWF modern/crimson — desain melengkung dinamis dengan aksen merah ceri gelap' },
                  { id: 'neon', label: 'Esports Neon', desc: 'Desain cyberpunk modern — gelap transparan dengan aksen cyan & kuning menyala' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setConfig((c) => ({ ...c, theme: t.id as any }))}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                      config.theme === t.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-900/40',
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {t.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {t.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 3: Position (hidden for scoreline since it's full-width) */}
          {config.style !== 'scoreline' && (
            <section className="space-y-3">
              <SectionLabel step={stepCounter++} label="Posisi Overlay" />
              <div className="grid grid-cols-2 gap-2">
                {POSITIONS
                  .filter((p) => !p.styles || p.styles.includes(config.style))
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setConfig((c) => ({ ...c, position: p.id }))}
                      className={cn(
                        'px-3 py-2 rounded-xl border text-xs font-bold transition-all',
                        config.position === p.id
                          ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 bg-white dark:bg-slate-900/40',
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
              </div>
            </section>
          )}

          {/* Step 4: Background chroma */}
          <section className="space-y-3">
            <SectionLabel
              step={stepCounter++}
              label="Background"
            />
            <div className="grid grid-cols-3 gap-2">
              {BG_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setConfig((c) => ({ ...c, bg: b.id }))}
                  className={cn(
                    'flex flex-col items-center gap-2 px-3 py-3 rounded-xl border transition-all',
                    config.bg === b.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-900/40',
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg border border-black/10 flex-shrink-0"
                    style={{
                      background: b.color === 'transparent'
                        ? 'repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 12px 12px'
                        : b.color,
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">
                    {b.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Step 5: Accent color — hidden for BWF (uses flag colors) */}
          {config.style !== 'bwf' && (
            <section className="space-y-3">
              <SectionLabel
                step={stepCounter++}
                label="Warna Aksen"
              />
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setConfig((cfg) => ({ ...cfg, color: c }))}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      config.color === c
                        ? 'border-primary scale-110 ring-2 ring-primary/30'
                        : 'border-transparent hover:scale-105',
                    )}
                    style={{ background: c }}
                    title={c}
                  />
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden"
                    style={{ background: config.color }}
                  />
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) => setConfig((c) => ({ ...c, color: e.target.value }))}
                    className="opacity-0 absolute"
                  />
                  <span className="text-xs font-bold text-slate-500">Custom</span>
                </label>
              </div>
            </section>
          )}

          {/* Winner banner toggle */}
          <section className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Tampilkan Banner Pemenang
              </p>
              <p className="text-[10px] text-muted-foreground">
                Banner &quot;GAME!&quot; muncul otomatis saat pertandingan selesai
              </p>
            </div>
            <button
              onClick={() => setConfig((c) => ({ ...c, showWinner: !c.showWinner }))}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors flex-shrink-0',
                config.showWinner ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  config.showWinner ? 'translate-x-6' : 'translate-x-0',
                )}
              />
            </button>
          </section>
        </div>

        {/* ── Right column: URL output + OBS guide ── */}
        <div className="space-y-6">
          {/* Preview frame */}
          <section className="space-y-3">
            <SectionLabel step={null} label="Preview (iframe)" />
            <div
              className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900"
              style={{ aspectRatio: '16/9' }}
            >
              {overlayUrl ? (
                <iframe
                  key={overlayUrl}
                  src={overlayUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Overlay Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Pilih pertandingan untuk melihat preview
                  </p>
                </div>
              )}

              {/* Corner overlay guide */}
              {overlayUrl && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[9px] text-white/70 font-bold px-2 py-1 rounded-md uppercase tracking-widest">
                  Preview 16:9
                </div>
              )}
            </div>
          </section>

          {/* Generated URL */}
          <section className="space-y-3">
            <SectionLabel step={null} label="URL Overlay" />
            <div className="space-y-2">
              {overlayUrl ? (
                <>
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
                    <span className="flex-1 break-all">{overlayUrl}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      className="flex-1 h-10 rounded-xl font-bold gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Salin URL
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(overlayUrl, '_blank')}
                      className="h-10 rounded-xl font-bold gap-2 px-4 border-slate-200 dark:border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Buka
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    URL akan muncul setelah pilih pertandingan
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* OBS Steps */}
          <section className="space-y-3">
            <SectionLabel step={null} label="Cara Pasang di OBS" />
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {OBS_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p
                    className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: step.replace(
                        /\*\*(.+?)\*\*/g,
                        '<strong class="text-slate-800 dark:text-slate-100 font-bold">$1</strong>',
                      ),
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Tip box */}
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10 p-3 text-[11px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
              💡 <strong>Tips:</strong> Gunakan background{' '}
              <strong>Transparan</strong> jika OBS mendukung, atau{' '}
              <strong>Chroma Green</strong> + Color Key filter untuk efek background removal manual.
              Resolusi browser source disarankan <strong>1920×1080</strong>.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Small helper ─────────────────────────────────────────────────────────────
function SectionLabel({ step, label }: { step: number | null; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {step !== null && (
        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center flex-shrink-0">
          {step}
        </span>
      )}
      <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        {label}
      </h3>
    </div>
  );
}
