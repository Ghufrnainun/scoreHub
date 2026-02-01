'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  isPro?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Broadcast grid with set columns.',
    previewColor: 'bg-amber-500',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Straight scoreboard with set rows.',
    previewColor: 'bg-emerald-500',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Big score focus, clean typography.',
    previewColor: 'bg-slate-800',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'High contrast, esports glow.',
    previewColor: 'bg-fuchsia-500',
  },
];

export default function TemplateSelector() {
  const [selectedId, setSelectedId] = useState('modern');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Display Templates</h1>
        <p className="text-muted-foreground">
          Choose the visual style for the big screen display.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            type="button"
            aria-pressed={selectedId === t.id}
            className={`w-full text-left cursor-pointer transition-colors transition-shadow duration-300 relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg border bg-card text-card-foreground shadow-sm ${
              selectedId === t.id
                ? 'ring-2 ring-primary border-primary shadow-lg'
                : 'hover:border-primary/50 hover:shadow-md'
            }`}
          >
            {/* Preview Area */}
            <div
              className={`h-32 ${t.previewColor} relative flex items-center justify-center`}
            >
              <span className="text-white/20 font-black text-4xl uppercase tracking-tighter">
                {t.id.split('-')[0]}
              </span>

              {/* Pro Badge */}
              {t.isPro && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-950 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  PRO
                </div>
              )}

              {/* Selected Indicator */}
              {selectedId === t.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
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

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight">{t.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.description}
              </p>

              <div className="mt-4 pt-4 border-t flex justify-end">
                <span
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors h-9 w-full ${
                    selectedId === t.id
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                  aria-hidden="true"
                >
                  {selectedId === t.id ? 'Active Template' : 'Select Theme'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
