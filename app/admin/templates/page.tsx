'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  image: string;
  isPro?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Broadcast grid with set columns.',
    previewColor: 'bg-amber-500',
    image:
      'https://images.unsplash.com/photo-1492629766637-82072eb90394?w=800&q=80', // Sleek modern abstract / broadcast feel
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Straight scoreboard with set rows.',
    previewColor: 'bg-emerald-500',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', // Classic data visualization / scoreboard style
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Big score focus, clean typography.',
    previewColor: 'bg-slate-800',
    image:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80', // Minimal geometric art
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'High contrast, esports glow.',
    previewColor: 'bg-fuchsia-500',
    image:
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80', // Neon lights (keeping this one or finding a better one)
  },
];

export default function TemplatesPage() {
  const [selectedId, setSelectedId] = useState('modern');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  const [pin, setPin] = useState('');
  useEffect(() => {
    const stored = localStorage.getItem('scorehub:admin:auth');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setPin(p.pin);
      } catch {}
    }
  }, []);

  const authorizedMatches = useQuery(
    api.matches.listAdmin,
    pin ? { adminPin: pin } : 'skip',
  );
  const changeTemplate = useMutation(api.matches.changeTemplate);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!selectedMatchId) {
      alert('Please select a target match first.');
      return;
    }

    setIsApplying(true);
    try {
      await changeTemplate({
        matchId: selectedMatchId,
        role: 'admin',
        pin,
        templateId: selectedId,
      });
      alert(`Template '${selectedId}' applied to match ${selectedMatchId}`);
    } catch (e) {
      console.error(e);
      alert('Failed to apply template');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Choose the visual style for the main display.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <span className="text-xs font-bold uppercase text-muted-foreground ml-2">
            Target Match:
          </span>
          <select
            className="h-8 text-sm border-none bg-transparent focus:ring-0 cursor-pointer min-w-[200px]"
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
          >
            <option value="">-- Select Active Match --</option>
            {authorizedMatches?.map((m: any, i: number) => (
              <option key={m._id || i} value={m.matchId}>
                {m.matchId} ({m.category || 'Match'})
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!selectedMatchId || isApplying}
          >
            {isApplying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Apply to Match'
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((t) => (
          <Card
            key={t.id}
            className={`cursor-pointer overflow-hidden transition-all hover:scale-105 active:scale-95 ${
              selectedId === t.id
                ? 'ring-4 ring-primary ring-offset-2'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedId(t.id)}
          >
            {/* Preview Area */}
            <div className="h-48 relative flex items-center justify-center bg-muted">
              <img
                src={t.image}
                alt={t.name}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              <span className="relative z-10 text-white/90 font-black text-4xl uppercase tracking-tighter drop-shadow-lg">
                {t.id.split('-')[0]}
              </span>

              {/* Pro Badge */}
              {t.isPro && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-950 text-[10px] font-bold px-2 py-0.5 rounded shadow z-10">
                  PRO
                </div>
              )}

              {/* Selected Indicator */}
              {selectedId === t.id && (
                <div className="absolute inset-0 bg-primary/40 flex items-center justify-center backdrop-blur-[1px] z-20">
                  <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-xl">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Info Area */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg">{t.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
