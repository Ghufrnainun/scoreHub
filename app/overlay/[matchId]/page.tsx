'use client';

import { use, useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSearchParams } from 'next/navigation';
import { CornerBarOverlay } from '@/components/overlay/CornerBarOverlay';
import { ScorelineOverlay } from '@/components/overlay/ScorelineOverlay';
import { MinimalCardOverlay } from '@/components/overlay/MinimalCardOverlay';
import { BwfOverlay } from '@/components/overlay/BwfOverlay';
import { DisplayStyleOverlay } from '@/components/overlay/DisplayStyleOverlay';
import { BroadcastOverlay } from '@/components/overlay/BroadcastOverlay';
import { MatchWinnerBanner } from '@/components/overlay/MatchWinnerBanner';
import type { MatchState } from '@/lib/match-types';

type OverlayStyle = 'corner-bar' | 'scoreline' | 'minimal-card' | 'bwf' | 'display-style' | 'broadcast';
type OverlayPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-center' | 'top-center' | 'fit';
type ChromaBg = 'transparent' | 'chroma-green' | 'chroma-blue';

const BG_MAP: Record<ChromaBg, string> = {
  transparent: 'transparent',
  'chroma-green': '#00FF00',
  'chroma-blue': '#0000FF',
};

// ─── Auto-scale hook ──────────────────────────────────────────────────────────
// Designs are authored at 1920×1080. This hook calculates a CSS transform scale
// so the overlay renders identically at any OBS Browser Source resolution.
const DESIGN_WIDTH = 1920;

function useOverlayScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function calculate() {
      setScale(window.innerWidth / DESIGN_WIDTH);
    }
    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, []);

  return scale;
}

interface OverlayPageProps {
  params: Promise<{ matchId: string }>;
}

export default function OverlayPage({ params }: OverlayPageProps) {
  const { matchId } = use(params);
  const searchParams = useSearchParams();
  const scale = useOverlayScale();

  const style = (searchParams.get('style') || 'corner-bar') as OverlayStyle;
  const position = (searchParams.get('position') || 'bottom-right') as OverlayPosition;
  const chroma = (searchParams.get('bg') || 'transparent') as ChromaBg;
  const accentColor = searchParams.get('color') || '#fbbf24';
  const showWinner = searchParams.get('winner') !== 'false'; // default: show winner banner

  const theme = searchParams.get('theme') as 'classic-bronze' | 'rounded-crimson' | 'neon' | null;

  const matchResult = useQuery(api.matches.get, { matchId });

  const bgStyle = BG_MAP[chroma] ?? 'transparent';

  // Loading state - invisible so OBS shows nothing
  if (matchResult === undefined) {
    return (
      <div
        className="w-screen h-screen"
        style={{ background: bgStyle }}
      />
    );
  }

  // Match not found
  if (!matchResult) {
    return (
      <div
        className="w-screen h-screen flex items-center justify-center"
        style={{ background: bgStyle }}
      >
        {chroma !== 'transparent' && (
          <p className="text-white/60 text-sm font-mono">
            Match &ldquo;{matchId}&rdquo; tidak ditemukan
          </p>
        )}
      </div>
    );
  }

  const match = matchResult as MatchState;

  // Type-safe fallback position for overlays that don't support 'fit'
  const standardPosition = position === 'fit' ? 'bottom-right' : position;
  const centeredPosition = position === 'fit' ? 'bottom-center' : position;

  // ─── FIT MODE ───────────────────────────────────────────────────────────────
  // The OBS Browser Source Width×Height becomes the bounding box.
  // Set it to match overlay content size (e.g. 550×180 for bwf).
  // The overlay renders at top-left (0,0) so the bounding box wraps tightly.
  // Then drag the source anywhere on your OBS canvas — easy to reposition!
  if (position === 'fit') {
    return (
      <div
        className="w-screen h-screen relative"
        style={{ background: bgStyle }}
      >
        {style === 'corner-bar' && (
          <CornerBarOverlay match={match} position="top-left" accentColor={accentColor} />
        )}
        {style === 'scoreline' && (
          <ScorelineOverlay match={match} accentColor={accentColor} position="top" />
        )}
        {style === 'minimal-card' && (
          <MinimalCardOverlay match={match} position="top-left" accentColor={accentColor} />
        )}
        {style === 'bwf' && (
          <BwfOverlay match={match} position="top-left" accentColor={accentColor} />
        )}
        {style === 'display-style' && (
          <DisplayStyleOverlay match={match} position="top-center" accentColor={accentColor} />
        )}
        {style === 'broadcast' && (
          <BroadcastOverlay match={match} position="fit" accentColor={accentColor} theme={theme || undefined} />
        )}
        {showWinner && <MatchWinnerBanner match={match} accentColor={accentColor} />}
      </div>
    );
  }

  // ─── POSITIONED MODE (default) ─────────────────────────────────────────────
  // Full 1920×1080 canvas with auto-scale. Overlay is absolute-positioned.
  return (
    <div
      className="w-screen h-screen relative overflow-hidden"
      style={{ background: bgStyle }}
    >
      {/* Auto-scale wrapper: renders at 1920px design width, then CSS-scales to actual viewport */}
      <div
        style={{
          width: DESIGN_WIDTH,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="relative"
      >
        {style === 'corner-bar' && (
          <CornerBarOverlay match={match} position={standardPosition} accentColor={accentColor} />
        )}
        {style === 'scoreline' && (
          <ScorelineOverlay
            match={match}
            accentColor={accentColor}
            position={position === 'top-left' || position === 'top-right' ? 'top' : 'bottom'}
          />
        )}
        {style === 'minimal-card' && (
          <MinimalCardOverlay match={match} position={standardPosition} accentColor={accentColor} />
        )}
        {style === 'bwf' && (
          <BwfOverlay match={match} position={standardPosition} accentColor={accentColor} />
        )}
        {style === 'display-style' && (
          <DisplayStyleOverlay match={match} position={centeredPosition} accentColor={accentColor} />
        )}
        {style === 'broadcast' && (
          <BroadcastOverlay match={match} position={position} accentColor={accentColor} theme={theme || undefined} />
        )}
        {showWinner && <MatchWinnerBanner match={match} accentColor={accentColor} />}
      </div>
    </div>
  );
}
