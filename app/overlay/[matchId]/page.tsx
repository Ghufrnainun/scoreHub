'use client';

import { use } from 'react';
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

interface OverlayPageProps {
  params: Promise<{ matchId: string }>;
}

export default function OverlayPage({ params }: OverlayPageProps) {
  const { matchId } = use(params);
  const searchParams = useSearchParams();

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

  return (
    <div
      className="w-screen h-screen relative overflow-hidden"
      style={{ background: bgStyle }}
    >
      {/* Overlay component based on style param */}
      {style === 'corner-bar' && (
        <CornerBarOverlay
          match={match}
          position={standardPosition}
          accentColor={accentColor}
        />
      )}

      {style === 'scoreline' && (
        <ScorelineOverlay
          match={match}
          accentColor={accentColor}
          position={
            position === 'top-left' || position === 'top-right' ? 'top' : 'bottom'
          }
        />
      )}

      {style === 'minimal-card' && (
        <MinimalCardOverlay
          match={match}
          position={standardPosition}
          accentColor={accentColor}
        />
      )}

      {style === 'bwf' && (
        <BwfOverlay
          match={match}
          position={standardPosition}
          accentColor={accentColor}
        />
      )}

      {style === 'display-style' && (
        <DisplayStyleOverlay
          match={match}
          position={centeredPosition}
          accentColor={accentColor}
        />
      )}

      {style === 'broadcast' && (
        <BroadcastOverlay
          match={match}
          position={position}
          accentColor={accentColor}
          theme={theme || undefined}
        />
      )}

      {/* Winner banner — shown on top of everything */}
      {showWinner && <MatchWinnerBanner match={match} accentColor={accentColor} />}
    </div>
  );
}
