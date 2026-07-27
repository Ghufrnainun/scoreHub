'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'reicon-react';
import { todayIso } from '@/lib/pb-registration-validation';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export interface CustomDatePickerProps {
  value: string;
  onChange: (dob: string) => void;
}

type PickerMode = 'calendar' | 'month-picker' | 'year-picker';

export default function CustomDatePicker({ value, onChange }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>('calendar');

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  const dateId = useId();

  const currentDate = value ? new Date(value) : new Date(2008, 0, 1);
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) {
      setMode('calendar');
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'year-picker' && yearListRef.current) {
      const activeEl = yearListRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [mode]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const formattedDisplay = value
    ? `${new Date(value).getDate()} ${MONTH_NAMES[new Date(value).getMonth()]} ${new Date(value).getFullYear()}`
    : '';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label
        htmlFor={dateId}
        className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
      >
        <span>
          Tanggal Lahir <span className="text-destructive font-bold">*</span>
        </span>
        <span className="text-[10px] font-normal text-muted-foreground lowercase">
          (format: hh mmmm tttt)
        </span>
      </label>

      <div className="relative">
        <button
          ref={triggerRef}
          id={dateId}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={`flex min-h-[46px] w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all shadow-2xs focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${
            isOpen
              ? 'border-emerald-600 bg-white dark:bg-slate-900 font-semibold'
              : value
              ? 'border-emerald-500/80 bg-emerald-50/20 text-slate-900 font-medium dark:border-emerald-500/60 dark:bg-emerald-950/20 dark:text-white'
              : 'border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600'
          }`}
        >
          <span className={formattedDisplay ? 'font-medium text-slate-900 dark:text-white tabular-nums' : 'text-slate-400 dark:text-slate-500 font-normal'}>
            {formattedDisplay || 'Pilih tanggal lahir'}
          </span>
          <CalendarIcon size={16} className="text-slate-500 shrink-0 transition-transform duration-200 group-hover:text-foreground" aria-hidden="true" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 top-full z-50 mt-1.5 w-full sm:w-[320px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-4 shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden text-card-foreground"
              role="dialog"
              aria-label="Pilih tanggal lahir atlet"
            >
              {/* HEADER SELECTORS */}
              <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'month-picker' ? 'calendar' : 'month-picker')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors border ${
                      mode === 'month-picker'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 font-black'
                        : 'bg-secondary text-foreground border-border/60 hover:border-border hover:bg-secondary/80'
                    }`}
                  >
                    {MONTH_NAMES[viewMonth]}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode(mode === 'year-picker' ? 'calendar' : 'year-picker')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors border tabular-nums ${
                      mode === 'year-picker'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 font-black'
                        : 'bg-secondary text-foreground border-border/60 hover:border-border hover:bg-secondary/80'
                    }`}
                  >
                    {viewYear}
                  </button>
                </div>

                {mode === 'calendar' && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (viewMonth === 0) {
                          setViewMonth(11);
                          setViewYear(viewYear - 1);
                        } else setViewMonth(viewMonth - 1);
                      }}
                      aria-label="Bulan sebelumnya"
                      className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors border border-transparent hover:border-border/60"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (viewMonth === 11) {
                          setViewMonth(0);
                          setViewYear(viewYear + 1);
                        } else setViewMonth(viewMonth + 1);
                      }}
                      aria-label="Bulan berikutnya"
                      className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors border border-transparent hover:border-border/60"
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {/* MODE 1: MONTH PICKER GRID */}
              {mode === 'month-picker' && (
                <div className="grid grid-cols-3 gap-1.5 py-1 animate-in fade-in duration-150">
                  {MONTH_NAMES.map((m, i) => {
                    const isSelected = viewMonth === i;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setViewMonth(i);
                          setMode('calendar');
                        }}
                        className={`flex min-h-[40px] items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-black shadow-2xs'
                            : 'bg-secondary/40 text-foreground hover:bg-secondary'
                        }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MODE 2: YEAR PICKER GRID */}
              {mode === 'year-picker' && (
                <div
                  ref={yearListRef}
                  className="max-h-56 overflow-y-auto grid grid-cols-3 gap-1.5 py-1 pr-1 animate-in fade-in duration-150 tabular-nums"
                >
                  {years.map((y) => {
                    const isSelected = viewYear === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        data-active={isSelected}
                        onClick={() => {
                          setViewYear(y);
                          setMode('calendar');
                        }}
                        className={`flex min-h-[40px] items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-black shadow-2xs'
                            : 'bg-secondary/40 text-foreground hover:bg-secondary'
                        }`}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MODE 3: CALENDAR GRID */}
              {mode === 'calendar' && (
                <div>
                  <div className="mb-1.5 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Min</span>
                    <span>Sen</span>
                    <span>Sel</span>
                    <span>Rab</span>
                    <span>Kam</span>
                    <span>Jum</span>
                    <span>Sab</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 tabular-nums">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-[40px] min-w-[40px]" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const monthStr = String(viewMonth + 1).padStart(2, '0');
                      const dayStr = String(dayNum).padStart(2, '0');
                      const isoStr = `${viewYear}-${monthStr}-${dayStr}`;
                      const isSelected = value === isoStr;
                      const isFuture = isoStr > todayIso();

                      return (
                        <button
                          key={dayNum}
                          type="button"
                          disabled={isFuture}
                          onClick={() => handleSelectDay(dayNum)}
                          className={`flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-sm scale-105'
                              : isFuture
                              ? 'cursor-not-allowed opacity-20 text-muted-foreground'
                              : 'text-foreground hover:bg-secondary hover:font-bold'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
