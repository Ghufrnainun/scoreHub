'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Loader2 } from 'lucide-react';
import { loadValidAdminSession } from '@/lib/admin-session';

interface Template {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  image: string;
}

const TEMPLATES: Template[] = [
  { 
    id: 'modern', 
    name: 'Modern', 
    description: 'Grid broadcast dengan kolom set.', 
    previewColor: 'bg-amber-500',
    image: '/templates/modern.png',
  },
  { 
    id: 'classic', 
    name: 'Classic', 
    description: 'Scoreboard lurus dengan baris set.', 
    previewColor: 'bg-emerald-500',
    image: '/templates/classic.png',
  },
  { 
    id: 'minimal', 
    name: 'Minimal', 
    description: 'Fokus ke skor besar dan tipografi bersih.', 
    previewColor: 'bg-slate-800',
    image: '/templates/minimal.png',
  },
  { 
    id: 'neon', 
    name: 'Neon', 
    description: 'Kontras tinggi dengan nuansa glow.', 
    previewColor: 'bg-fuchsia-500',
    image: '/templates/neon.png',
  },
];

export default function TemplatesPage() { 
  const [selectedId, setSelectedId] = useState('modern'); 
  const [selectedMatchId, setSelectedMatchId] = useState<string>(''); 
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [adminSessionToken, setAdminSessionToken] = useState('');
  useEffect(() => {
    const session = loadValidAdminSession();
    setAdminSessionToken(session?.token || '');
  }, []);

  const authorizedMatches = useQuery(
    api.matches.listAdmin,
    adminSessionToken ? { adminSessionToken } : 'skip',
  );
  const changeTemplate = useMutation(api.matches.changeTemplate);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => { 
    if (!selectedMatchId) { 
      setFeedback({
        type: 'error',
        message: 'Pilih pertandingan tujuan terlebih dahulu.',
      });
      return; 
    } 

    setIsApplying(true); 
    setFeedback(null);
    try { 
      await changeTemplate({ 
        matchId: selectedMatchId, 
        role: 'admin', 
        adminSessionToken, 
        templateId: selectedId, 
      }); 
      setFeedback({
        type: 'success',
        message: `Template '${selectedId}' berhasil diterapkan ke match ${selectedMatchId}.`,
      });
    } catch (e) { 
      console.error(e); 
      setFeedback({
        type: 'error',
        message: 'Gagal menerapkan template. Silakan coba lagi.',
      });
    } finally { 
      setIsApplying(false); 
    } 
  }; 

  return ( 
    <div className="space-y-8 max-w-6xl mx-auto"> 
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"> 
        <div> 
          <h1 className="text-2xl font-bold tracking-tight">Template Tampilan</h1> 
          <p className="text-muted-foreground"> 
            Pilih gaya visual untuk layar skor utama. 
          </p> 
        </div> 

        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <span className="text-xs font-bold uppercase text-muted-foreground ml-2"> 
            Match Tujuan: 
          </span> 
          <select
            className="h-8 text-sm border-none bg-transparent focus:ring-0 cursor-pointer min-w-[200px]"
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
          >
            <option value="">-- Pilih Match Aktif --</option> 
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
              'Terapkan' 
            )} 
          </Button> 
        </div> 
      </div> 

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
        {TEMPLATES.map((t) => ( 
          <Card 
            key={t.id} 
            className={`group cursor-pointer overflow-hidden transition-all hover:scale-105 active:scale-95 ${ 
              selectedId === t.id 
                ? 'ring-4 ring-primary ring-offset-2' 
                : 'hover:border-primary/50' 
            }`}
            onClick={() => setSelectedId(t.id)}
            role="button"
            tabIndex={0}
            aria-pressed={selectedId === t.id}
            aria-label={`Pilih template ${t.name}`}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedId(t.id);
              }
            }}
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

