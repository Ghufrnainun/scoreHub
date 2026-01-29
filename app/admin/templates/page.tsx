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
    id: 'bwf-default',
    name: 'BWF Standard',
    description: 'Official BWF style scoreboard. Clean and readable.',
    previewColor: 'bg-blue-600',
  },
  {
    id: 'broadcast-modern',
    name: 'Broadcast Modern',
    description: 'TV-ready overlay style with gradients and animations.',
    previewColor: 'bg-purple-600',
    isPro: true,
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'High contrast dark mode for LED screens.',
    previewColor: 'bg-zinc-900',
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Futuristic style for esports or fun events.',
    previewColor: 'bg-pink-500',
    isPro: true,
  },
];

export default function TemplateSelector() {
  const [selectedId, setSelectedId] = useState('bwf-default');

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
          <Card
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={`cursor-pointer transition-all duration-300 relative overflow-hidden group ${
              selectedId === t.id
                ? 'ring-2 ring-primary border-primary shadow-lg scale-[1.02]'
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
                <Button
                  size="sm"
                  variant={selectedId === t.id ? 'default' : 'secondary'}
                  className="w-full"
                >
                  {selectedId === t.id ? 'Active Template' : 'Select Theme'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
