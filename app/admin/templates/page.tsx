'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CheckCircle2, Loader2 } from 'lucide-react';
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Template Tampilan</h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Pilih gaya visual untuk layar skor utama. 
          </p> 
        </div> 

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto">
          <span className="text-xs font-black uppercase text-muted-foreground ml-2">
            Match Tujuan: 
          </span> 
          <select
            className="h-10 text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[220px] font-semibold"
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
            className="h-10 rounded-xl px-4 font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
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
            className={`group cursor-pointer overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:translate-y-0 ${
              selectedId === t.id 
                ? 'border-primary ring-2 ring-primary/25 ring-offset-2'
                : 'border-slate-200 hover:border-slate-300'
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <span className="relative z-10 text-white/90 font-black text-4xl uppercase tracking-tighter drop-shadow-lg">
                {t.id.split('-')[0]}
              </span>



              {/* Selected Indicator */}
              {selectedId === t.id && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px] z-20">
                  <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-xl">
                    <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </div>

            {/* Info Area */}
            <div className="p-5">
              <div className="flex justify-between items-start gap-3 mb-1">
                <h3 className="font-black text-lg text-slate-900">{t.name}</h3>
                {selectedId === t.id ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    Dipilih
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>
            </div> 
          </Card> 
        ))} 
      </div>
    </div>
  );
}

