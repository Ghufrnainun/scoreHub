'use client';

import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, Loader } from 'lucide-react';

export interface Region {
  code: string;
  name: string;
  postalCode?: string;
}

export interface CustomSelectProps {
  label: string;
  placeholder: string;
  items?: Region[];
  value: string;
  disabled: boolean;
  isLoading?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function CustomSelect({
  label,
  placeholder,
  items,
  value,
  disabled,
  isLoading,
  required = true,
  onChange,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectId = useId();
  const listboxId = `${selectId}-listbox`;

  const selectedItem = useMemo(
    () => items?.find((item) => item.code === value),
    [items, value]
  );

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!search.trim()) return items;
    const query = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, search]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setActiveIndex(
        selectedItem
          ? filteredItems.findIndex((item) => item.code === selectedItem.code)
          : 0
      );
    } else if (!isOpen) {
      setSearch('');
      setActiveIndex(-1);
    }
  }, [isOpen, selectedItem, filteredItems]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isLoading) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredItems.length) {
        onChange(filteredItems[activeIndex].code);
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label
        htmlFor={selectId}
        className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
      >
        <span>
          {label} {required && <span className="text-destructive font-bold">*</span>}
        </span>
        {isLoading && (
          <span className="text-[10px] text-muted-foreground font-medium animate-pulse">
            Memuat data...
          </span>
        )}
      </label>

      <div className="relative">
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          disabled={disabled || isLoading}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          className={`flex min-h-[46px] w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs ${
            isOpen
              ? 'border-emerald-600 bg-white dark:bg-slate-900 font-semibold'
              : selectedItem
              ? 'border-emerald-500/80 bg-emerald-50/20 text-slate-900 font-medium dark:border-emerald-500/60 dark:bg-emerald-950/20 dark:text-white'
              : 'border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600'
          }`}
        >
          <span className={selectedItem ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 dark:text-slate-500 font-normal'}>
            {isLoading ? (
              <span className="inline-flex items-center gap-2 w-full">
                <span className="h-4 w-28 bg-secondary animate-pulse rounded-md" />
              </span>
            ) : selectedItem ? (
              selectedItem.name
            ) : (
              placeholder
            )}
          </span>
          {isLoading ? (
            <Loader size={16} className="text-muted-foreground animate-spin shrink-0" aria-hidden="true" />
          ) : (
            <ChevronDown
              size={16}
              className={`text-slate-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-foreground font-semibold' : ''}`}
              aria-hidden="true"
            />
          )}
        </button>

        <AnimatePresence>
          {isOpen && !disabled && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-2 shadow-xl shadow-black/10 dark:shadow-black/40"
            >
              <div className="relative mb-2 px-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Cari ${label.toLowerCase()}…`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2 pl-9 pr-3 text-xs font-medium text-foreground outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              <div
                ref={listboxRef}
                id={listboxId}
                role="listbox"
                aria-label={`Daftar ${label}`}
                className="max-h-56 overflow-y-auto rounded-xl space-y-0.5 pr-1"
              >
                {filteredItems && filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const isSelected = item.code === value;
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(item.code);
                          setIsOpen(false);
                          triggerRef.current?.focus();
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-left transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-2xs'
                            : isActive
                            ? 'bg-emerald-500/15 font-semibold text-emerald-950 dark:text-emerald-200'
                            : 'text-foreground font-medium hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{item.name}</span>
                        {isSelected && <Check size={14} className="text-white dark:text-slate-900 shrink-0 font-bold" aria-hidden="true" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground font-medium">
                    Tidak ditemukan data {label.toLowerCase()}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
