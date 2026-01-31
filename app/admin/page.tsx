'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// Types (Mock for now, should match MatchState)
interface MatchSummary {
  id: string;
  matchId: string; // Friendly ID
  sport: string;
  status: 'active' | 'finished' | 'scheduled';
  home: { name: string; score: number };
  away: { name: string; score: number };
  startTime: string;
}

export default function AdminDashboard() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock Fetch
  useEffect(() => {
    // In real implementation, this fetches from API
    setTimeout(() => {
      setMatches([
        {
          id: '1',
          matchId: 'MATCH-BWF-001',
          sport: 'Badminton',
          status: 'active',
          home: { name: 'Kevin/Gideon', score: 18 },
          away: { name: 'Ahsan/Hendra', score: 16 },
          startTime: new Date().toISOString(),
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Matches</h1>
          <p className="text-muted-foreground">
            Manage and monitor live events.
          </p>
        </div>
        <Link href="/">
          <Button>
            <svg
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card
              key={match.id}
              className="p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse motion-reduce:animate-none" />
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {match.matchId}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2 py-1 rounded text-foreground/80">
                  {match.sport}
                </span>
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
                  <Button variant="secondary" className="w-full text-xs h-8">
                    Control
                  </Button>
                </Link>
                <Link
                  href={`/match/${match.matchId}/display`}
                  target="_blank"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full text-xs h-8">
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
