'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useQuery } from 'convex/react';
import { useMatch } from '@/hooks/use-match';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/convex/_generated/api';
import {
  defaultSettings,
  themeStyles,
  type DisplaySettings,
} from '@/components/match/display-settings';

const DisplayRenderer = dynamic(
  () =>
    import('@/components/match/display-renderer').then(
      (mod) => mod.DisplayRenderer,
    ),
  { ssr: false },
);

const CATEGORY_NAMES: Record<string, string> = {
  MS: 'Tunggal Putra',
  WS: 'Tunggal Putri',
  MD: 'Ganda Putra',
  WD: 'Ganda Putri',
  XD: 'Ganda Campuran',
  '': 'Tunggal Putra',
};

export default function BwfScoreboard() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.id as string;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displaySettings, setDisplaySettings] =
    useState<DisplaySettings>(defaultSettings);

  const { match, isLoading, error } = useMatch({
    matchId,
    role: 'display',
  });
  const [adLoadFailed, setAdLoadFailed] = useState(false);
  const activeAssetId =
    match?.ads?.active && match?.ads?.currentAssetId
      ? match.ads.currentAssetId
      : undefined;
  const adAsset = useQuery(
    api.media.resolveForDisplay,
    activeAssetId ? { assetId: activeAssetId } : 'skip',
  );

  // Overlay Mode Logic
  const queryOverlay = searchParams.get('overlay') === 'true';
  const isOverlay = queryOverlay || displaySettings.overlay?.enabled;

  const overlayConfig = {
    background: displaySettings.overlay?.background || 'transparent',
    hideHeader: isOverlay
      ? (displaySettings.overlay?.hideHeader ?? true)
      : false,
    hideFooter: isOverlay
      ? (displaySettings.overlay?.hideFooter ?? true)
      : false,
  };

  const bgStyles = {
    transparent: 'bg-transparent',
    'chroma-green': 'bg-[#00FF00]',
    'chroma-blue': 'bg-[#0000FF]',
  };

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('displaySettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed) {
            setDisplaySettings((prev) => ({
              ...prev,
              ...parsed,
              fontSizes: { ...prev.fontSizes, ...parsed.fontSizes },
              teamCodes: { ...prev.teamCodes, ...parsed.teamCodes },
              teamColors: { ...prev.teamColors, ...parsed.teamColors },
            }));
          }
        } catch {}
      }
    };
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  useEffect(() => {
    if (match?.displayConfig?.templateId) {
      setDisplaySettings((prev) => ({
        ...prev,
        template: match.displayConfig!
          .templateId as DisplaySettings['template'],
      }));
    }
  }, [match?.displayConfig?.templateId]);

  useEffect(() => {
    setAdLoadFailed(false);
  }, [activeAssetId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-[#fbbf24] font-mono text-2xl tracking-widest animate-pulse motion-reduce:animate-none">
        MENGINISIALISASI SISTEM...
      </div>
    );
  }
  if (error || !match) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-[#fbbf24] font-mono text-lg tracking-widest gap-8 px-6 text-center">
        <div className="space-y-4">
          <div className="text-4xl font-black animate-pulse motion-reduce:animate-none">
            {error ? 'KESALAHAN KONEKSI' : 'MENUNGGU PERTANDINGAN'}
          </div>
          <p className="text-gray-500 max-w-md mx-auto">
            {error
              ? 'Terputus dari layanan realtime. Silakan periksa internet Anda atau segarkan halaman.'
              : 'Menunggu wasit untuk mengaktifkan data pertandingan.'}
          </p>
        </div>
        <div className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block mb-1">
            ID PELACAKAN
          </span>
          <span className="text-xl font-black text-white">{matchId}</span>
        </div>
        <Link
          href="/"
          className="px-8 py-3 bg-[#fbbf24] text-black font-black uppercase tracking-widest rounded-full hover:bg-yellow-400 transition-[transform,background-color,box-shadow] active:scale-95 shadow-lg flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const shouldRenderAd = Boolean(
    match.ads?.active && activeAssetId && adAsset && !adLoadFailed,
  );
  const adUnavailable = Boolean(
    match.ads?.active && activeAssetId && (adAsset === null || adLoadFailed),
  );

  return (
    <div
      className={cn(
        'w-screen h-screen overflow-hidden flex flex-col font-sans select-none group relative transition-colors duration-500',
        isOverlay ? bgStyles[overlayConfig.background] : 'bg-black',
      )}
      style={themeStyles}
    >
      {/* Universal Header - Simplified */}
      {(!isOverlay || !overlayConfig.hideHeader) && (
        <div className="h-14 bg-black/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-20 group-hover:h-16 transition-[height] duration-300">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Image
                  src="/logo-pb.png"
                  alt="Scorehub logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="text-xs font-black tracking-[0.2em] uppercase text-white/50 group-hover:text-white transition-colors">
                ScoreHub
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={toggleFullscreen}
              className="px-5 py-2 text-xs font-black uppercase tracking-widest text-black bg-[#fbbf24] rounded-full hover:bg-[#fcd34d] shadow-lg active:scale-95 transition-[transform,background-color,box-shadow]"
              aria-label={
                isFullscreen ? 'Keluar dari layar penuh' : 'Masuk layar penuh'
              }
            >
              {isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Template Content */}
      <main
        id="main-content"
        className="flex-1 relative flex flex-col overflow-hidden"
      >
        {shouldRenderAd ? (
          <div className="h-full w-full bg-black flex items-center justify-center relative">
            {adAsset?.type === 'video' ? (
              <video
                src={adAsset.url}
                className="h-full w-full object-contain"
                autoPlay
                muted
                playsInline
                loop
                controls={false}
                onError={() => setAdLoadFailed(true)}
              />
            ) : (
              <Image
                src={adAsset?.url || ''}
                alt={adAsset?.name || 'Media sponsor'}
                fill
                sizes="100vw"
                unoptimized
                className="h-full w-full object-contain"
                onError={() => setAdLoadFailed(true)}
              />
            )}
          </div>
        ) : (
          <>
            {adUnavailable ? (
              <div className="absolute top-3 right-3 z-40 rounded-full bg-red-500/90 px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                Iklan gagal - menampilkan skor
              </div>
            ) : null}
            <DisplayRenderer match={match} displaySettings={displaySettings} />
          </>
        )}
      </main>

      {/* Subtle Metadata Footer - Clean Info */}
      {(!isOverlay || !overlayConfig.hideFooter) && (
        <div className="h-auto sm:h-10 px-4 sm:px-8 py-2 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-white/20 uppercase tracking-[0.2em] sm:tracking-[0.3em] border-t border-white/5 bg-black/20 gap-2">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-bold">
                {match.category || 'MS'}
              </span>
              <span>{CATEGORY_NAMES[match.category || 'MS']}</span>
            </div>
            <div className="w-px h-3 bg-white/10"></div>
            <span>{displaySettings.courtName}</span>
          </div>
          
        </div>
      )}

      {!isOverlay && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute bottom-12 right-4 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-black bg-[#fbbf24] hover:bg-[#fcd34d] shadow-lg transition-[transform,background-color] active:scale-95"
          aria-label={
            isFullscreen ? 'Keluar dari layar penuh' : 'Masuk layar penuh'
          }
        >
          {isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
        </button>
      )}
    </div>
  );
}
