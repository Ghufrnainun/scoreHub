'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle2, AlertCircle, FileCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RegistrationItem {
  _id: string;
  fullName: string;
  dob: string;
  gender: 'pria' | 'wanita' | 'putra' | 'putri';
  club: string;
  whatsapp: string;
  email?: string;
  provinceName?: string;
  regencyName?: string;
  districtName?: string;
  villageName?: string;
  postalCode?: string;
  addressDetail?: string;
  category?: string;
  status: 'baru' | 'valid' | 'sudah_input_pbsi';
  createdAt: number;
  updatedAt: number;
  files?: Array<{
    _id: string;
    docType: string;
    filename: string;
    objectKey: string;
    contentType: string;
    size: number;
  }>;
  history?: Array<{
    _id: string;
    status: 'baru' | 'valid' | 'sudah_input_pbsi';
    createdAt: number;
  }>;
}

interface RegistrationStatsProps {
  data: RegistrationItem[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export default function RegistrationStats({
  data,
  selectedStatus,
  onSelectStatus,
}: RegistrationStatsProps) {
  const statCards = useMemo(() => {
    const counts = {
      all: data.length,
      baru: data.filter((item) => item.status === 'baru').length,
      valid: data.filter((item) => item.status === 'valid').length,
      sudah_input_pbsi: data.filter((item) => item.status === 'sudah_input_pbsi').length,
    };

    return [
      {
        id: '',
        title: 'Total Pendaftar',
        count: counts.all,
        icon: Users,
        colorClass: 'border-border bg-card hover:border-foreground/20 text-card-foreground',
        badgeClass: 'bg-secondary text-foreground',
        iconClass: 'text-foreground bg-secondary',
        activeBorder: 'ring-2 ring-primary border-transparent',
      },
      {
        id: 'baru',
        title: 'Menunggu Verifikasi',
        subtitle: 'Baru',
        count: counts.baru,
        icon: Clock,
        colorClass: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-card-foreground',
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold',
        iconClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
        activeBorder: 'ring-2 ring-amber-500 border-transparent',
      },
      {
        id: 'valid',
        title: 'Disetujui',
        subtitle: 'Valid',
        count: counts.valid,
        icon: CheckCircle2,
        colorClass: 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-card-foreground',
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold',
        iconClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
        activeBorder: 'ring-2 ring-emerald-500 border-transparent',
      },
      {
        id: 'sudah_input_pbsi',
        title: 'Masuk SI PBSI',
        subtitle: 'Sudah Input',
        count: counts.sudah_input_pbsi,
        icon: FileCheck2,
        colorClass: 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-card-foreground',
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold',
        iconClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
        activeBorder: 'ring-2 ring-blue-500 border-transparent',
      },
    ];
  }, [data]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        const isSelected = selectedStatus === card.id;

        return (
          <motion.button
            key={card.id || 'all'}
            type="button"
            onClick={() => onSelectStatus(isSelected ? '' : card.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className={cn(
              'group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer shadow-2xs',
              card.colorClass,
              isSelected ? card.activeBorder : ''
            )}
          >
            <div className="flex items-start justify-between w-full">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
                  card.iconClass
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>

              {card.subtitle && (
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] tracking-wider uppercase', card.badgeClass)}>
                  {card.subtitle}
                </span>
              )}
            </div>

            <div className="mt-4">
              <div className="text-2xl font-black tracking-tight text-foreground">
                {card.count}
              </div>
              <div className="text-xs font-semibold text-muted-foreground mt-0.5 line-clamp-1">
                {card.title}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
