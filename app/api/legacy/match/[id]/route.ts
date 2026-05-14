import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const resolveParams = async (params: RouteContext['params']) =>
  Promise.resolve(params);

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await resolveParams(context.params);

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { ok: false, error: 'Invalid match id' },
      { status: 400 },
    );
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { ok: false, error: 'Convex URL not configured' },
      { status: 500 },
    );
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const match = await client.query(api.matches.get, { matchId: id });

    if (!match) {
      return NextResponse.json(
        { ok: false, error: 'Match not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        matchId: match.matchId,
        displayCode: match.displayCode || null,
        status: match.status || 'unknown',
        sport: match.sport || 'unknown',
        category: match.category || 'MS',
        tournamentName: match.tournamentName || '',
        server: match.server || null,
        currentSet: match.currentSet || 1,
        sets: match.sets || [],
        updatedAt: match.updatedAt || null,
        isFlipped: Boolean(match.isFlipped),
        displayConfig: match.displayConfig || null,
        teams: {
          home: {
            name: match.teams?.home?.name || 'HOME',
            country: match.teams?.home?.country || '',
            score: Number(match.teams?.home?.score || 0),
            setsWon: Number(match.teams?.home?.setsWon || 0),
            players: match.teams?.home?.players || [],
          },
          away: {
            name: match.teams?.away?.name || 'AWAY',
            country: match.teams?.away?.country || '',
            score: Number(match.teams?.away?.score || 0),
            setsWon: Number(match.teams?.away?.setsWon || 0),
            players: match.teams?.away?.players || [],
          },
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 },
    );
  }
}

