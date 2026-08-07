'use client';

import React from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegistrationFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedKabupaten: string;
  onKabupatenChange: (val: string) => void;
  kabupatenList: string[];
  onReset: () => void;
  hasActiveFilters: boolean;
}

export default function RegistrationFilterBar({
  searchQuery,
  onSearchChange,
  selectedKabupaten,
  onKabupatenChange,
  kabupatenList,
  onReset,
  hasActiveFilters,
}: RegistrationFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs text-card-foreground md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari nama atlet, klub, WhatsApp, atau email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-xl border-border bg-secondary/30 pl-10 pr-4 text-sm transition-colors focus:bg-background focus:ring-2 focus:ring-primary"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Hapus kata kunci pencarian"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter:</span>
        </div>


        {/* Kabupaten Select (h-11 for 44px mobile touch target) */}
        <Select
          value={selectedKabupaten || 'all'}
          onValueChange={(val) => onKabupatenChange(val === 'all' ? '' : val)}
        >
          <SelectTrigger className="h-11 w-[180px] rounded-xl border-border bg-background text-xs font-bold text-foreground">
            <SelectValue placeholder="Semua Wilayah" />
          </SelectTrigger>
          <SelectContent className="max-h-[250px] rounded-xl border-border bg-card text-card-foreground">
            <SelectItem value="all" className="text-xs font-semibold">Semua Wilayah</SelectItem>
            {kabupatenList.map((kab) => (
              <SelectItem key={kab} value={kab} className="text-xs font-bold">
                {kab}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-11 gap-1.5 rounded-xl px-3 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
