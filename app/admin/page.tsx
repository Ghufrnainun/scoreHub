'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { api } from '@/convex/_generated/api';

// Types (Mock for now, should match MatchState)
interface MatchSummary {
  id: string;
  matchId: string; // Friendly ID
  sport: string;
  status: 'active' | 'finished' | 'scheduled' | 'paused';
  home: { name: string; score: number };
  away: { name: string; score: number };
  startTime: string;
  updatedAt?: number;
}

const AUTH_STORAGE_KEY = 'scorehub:admin:auth';

export default function AdminDashboard() {
  const [adminPin, setAdminPin] = useState('');
  const [isPinReady, setIsPinReady] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | MatchSummary['status']
  >('all');
  const [sportFilter, setSportFilter] = useState('all');

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setAdminPin(parsed?.pin || '');
      } catch {
        setAdminPin('');
      }
    }
    setIsPinReady(true);
  }, []);

  const matchData = useQuery(
    api.matches.listAdmin,
    isPinReady ? { adminPin: adminPin || undefined } : 'skip',
  );
  const isLoading = !isPinReady || matchData === undefined;

  const matches = useMemo<MatchSummary[]>(() => {
    const data = matchData || [];
    return data.map((item: any, index: number) => ({
      id: item.matchId || `${index}`,
      matchId: item.matchId,
      sport: item.sport,
      status: item.status,
      home: {
        name: item.teams?.home || 'HOME',
        score: item.scores?.home || 0,
      },
      away: {
        name: item.teams?.away || 'AWAY',
        score: item.scores?.away || 0,
      },
      startTime: new Date().toISOString(),
      updatedAt: item.updatedAt,
    }));
  }, [matchData]);

  const sportOptions = useMemo(() => {
    const sports = Array.from(new Set(matches.map((match) => match.sport)));
    return sports.filter(Boolean).sort();
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return matches.filter((match) => {
      const matchesQuery =
        !term ||
        match.matchId.toLowerCase().includes(term) ||
        match.home.name.toLowerCase().includes(term) ||
        match.away.name.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === 'all' || match.status === statusFilter;
      const matchesSport =
        sportFilter === 'all' || match.sport === sportFilter;
      return matchesQuery && matchesStatus && matchesSport;
    });
  }, [matches, query, statusFilter, sportFilter]);

  const statusCounts = useMemo(() => {
    return matches.reduce(
      (acc, match) => {
        acc.total += 1;
        acc[match.status] += 1;
        return acc;
      },
      {
        total: 0,
        active: 0,
        paused: 0,
        scheduled: 0,
        finished: 0,
      } as Record<string, number>,
    );
  }, [matches]);

  const statusDot: Record<MatchSummary['status'], string> = {
    active: 'bg-emerald-500',
    paused: 'bg-amber-500',
    scheduled: 'bg-slate-400',
    finished: 'bg-rose-500',
  };

  const statusBadge: Record<MatchSummary['status'], string> = {
    active: 'bg-emerald-500/10 text-emerald-600',
    paused: 'bg-amber-500/10 text-amber-600',
    scheduled: 'bg-slate-500/10 text-slate-600',
    finished: 'bg-rose-500/10 text-rose-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-bebas)] tracking-wide uppercase text-black text-balance">
            Active Matches
          </h1>
          <p className="text-black/60 font-medium text-pretty">
            Manage and monitor live events.
          </p>
        </div>
        <Link href="/">
          <Button className="rounded-full bg-[#111827] text-white hover:bg-black shadow-lg shadow-black/20 tracking-wide uppercase font-bold text-xs h-10 px-6">
            <svg aria-hidden="true"
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Match
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.total}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Active
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.active}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Paused
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.paused}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Scheduled
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.scheduled}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Finished
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.finished}
          </div>
        </Card>
      </div>

      <Card className="p-4 rounded-3xl border border-black/10 bg-white/90">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Search
            </label>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by match ID or team..."
              className="mt-2 h-10 rounded-2xl bg-black/5 border-transparent focus:bg-white focus:border-black/20"
            />
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Status
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['all', 'active', 'paused', 'scheduled', 'finished'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`h-8 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        statusFilter === status
                          ? 'bg-black text-white'
                          : 'bg-black/5 text-black/50 hover:bg-black/10'
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Sport
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSportFilter('all')}
                  className={`h-8 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    sportFilter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-black/5 text-black/50 hover:bg-black/10'
                  }`}
                >
                  All
                </button>
                {sportOptions.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => setSportFilter(sport)}
                    className={`h-8 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      sportFilter === sport
                        ? 'bg-black text-white'
                        : 'bg-black/5 text-black/50 hover:bg-black/10'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-secondary/50 animate-pulse motion-reduce:animate-none rounded-xl"
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <div className="text-muted-foreground mb-4">
            No active matches found
          </div>
          <Link href="/">
            <Button className="rounded-full bg-[#111827] text-white hover:bg-black shadow-lg shadow-black/20 tracking-wide uppercase font-bold text-xs h-10 px-6">
              Create Match
            </Button>
          </Link>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <div className="text-muted-foreground mb-4">
            No matches match the current filters
          </div>
          <Button
            onClick={() => {
              setQuery('');
              setStatusFilter('all');
              setSportFilter('all');
            }}
            className="rounded-full bg-black text-white hover:bg-black/90 tracking-widest uppercase font-bold text-xs h-10 px-6"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <Card
              key={match.id}
              className="p-5 flex flex-col gap-4 border border-black/10 shadow-sm bg-white hover:border-black/20 rounded-3xl transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${statusDot[match.status]} ${match.status === 'active' ? 'animate-pulse motion-reduce:animate-none' : ''}`}
                  />
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {match.matchId}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/5 px-2 py-1 rounded text-black/60">
                    {match.sport}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${statusBadge[match.status]}`}
                  >
                    {match.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <div className="text-center flex-1">
                  <div className="font-bold truncate text-sm mb-1">
                    {match.home.name}
                  </div>
                  <div className="text-3xl font-black">{match.home.score}</div>
                </div>
                <div className="text-xs font-bold text-muted-foreground px-2">
                  VS
                </div>
                <div className="text-center flex-1">
                  <div className="font-bold truncate text-sm mb-1">
                    {match.away.name}
                  </div>
                  <div className="text-3xl font-black">{match.away.score}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Link
                  href={`/match/${match.matchId}/control?role=admin`}
                  className="w-full"
                >
                  <Button
                    variant="secondary"
                    className="w-full text-xs h-8 rounded-full bg-black/5 hover:bg-black/10 text-black shadow-none"
                  >
                    Control
                  </Button>
                </Link>
                <Link
                  href={`/match/${match.matchId}/display`}
                  target="_blank"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full text-xs h-8 rounded-full border-black/10 text-black hover:bg-black/5 hover:text-black"
                  >
                    View Display
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
