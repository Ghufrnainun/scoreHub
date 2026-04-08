'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ADMIN_AUTH_STORAGE_KEY, ADMIN_AUTH_TTL_MS } from '@/lib/auth';

// Icons
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const MediaIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const TemplateIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
    />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const MENU_ITEMS = [
  { name: 'Pertandingan', path: '/admin', icon: DashboardIcon },
  { name: 'Media & Iklan', path: '/admin/media', icon: MediaIcon },
  { name: 'Templat', path: '/admin/templates', icon: TemplateIcon },
  { name: 'Pengaturan', path: '/admin/settings', icon: SettingsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  const adminPin = useMemo(() => {
    return process.env.NEXT_PUBLIC_ADMIN_PIN || '';
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (!adminPin) {
      setIsAuthed(true);
      setIsReady(true);
      return;
    }

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          pin?: string;
          ts?: number;
        };
        const isValid =
          parsed?.pin === adminPin &&
          typeof parsed.ts === 'number' &&
          Date.now() - parsed.ts < ADMIN_AUTH_TTL_MS;
        if (isValid) {
          setIsAuthed(true);
        }
      } catch {
        // Ignore invalid storage
      }
    }
    // Set sidebar open by default on desktop
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
    setIsReady(true);
  }, [adminPin]);

  const handlePinSubmit = () => {
    if (!adminPin) {
      setIsAuthed(true);
      setError('');
      return;
    }

    if (pinInput.trim() !== adminPin) {
      setError('PIN salah. Coba lagi.');
      return;
    }

    localStorage.setItem(
      ADMIN_AUTH_STORAGE_KEY,
      JSON.stringify({ pin: adminPin, ts: Date.now() }),
    );
    setIsAuthed(true);
    setError('');
  };

  if (!isReady) {
    return (
      <div className="min-h-dvh bg-background text-foreground flex items-center justify-center">
        <div className="text-sm text-muted-foreground font-mono">
          Memuat akses admin...
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-dvh bg-background text-foreground flex items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image
                src="/scorehub-logo.svg"
                alt="Scorehub logo"
                width={20}
                height={20}
                className="h-4 w-4"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-pretty">Akses Admin</p>
              <p className="text-xs text-muted-foreground text-pretty">
                Masukkan PIN global untuk masuk.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <label htmlFor="admin-pin" className="text-xs font-semibold">
              PIN
            </label>
            <Input
              id="admin-pin"
              name="adminPin"
              autoComplete="one-time-code"
              inputMode="numeric"
              type="password"
              spellCheck={false}
              value={pinInput}
              onChange={(event) => {
                setPinInput(event.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handlePinSubmit();
                }
              }}
              className="h-11 text-center font-mono text-lg tracking-widest"
            />
            {error ? (
              <p className="text-xs text-destructive text-pretty" role="status" aria-live="polite">
                {error}
              </p>
            ) : null}
            <Button className="w-full" onClick={handlePinSubmit}>
              Masuk Admin
            </Button>
            <p className="text-[11px] text-muted-foreground text-pretty">
              PIN disimpan lokal selama 8 jam.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] text-[#111827] font-[family-name:var(--font-literata)] flex transition-colors duration-300 overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-black/10 transition-[width,transform] duration-300 flex flex-col fixed inset-y-0 left-0 z-20 md:relative ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b px-4">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight text-black">
            <div className="w-8 h-8 rounded-lg bg-[#111827] text-[#F59E0B] flex items-center justify-center">
              <Image
                src="/scorehub-logo.svg"
                alt="Scorehub logo"
                width={20}
                height={20}
                className="h-4 w-4"
              />
            </div>
            {isSidebarOpen && (
              <span className="font-[family-name:var(--font-bebas)] tracking-wider">
                Admin
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]"
              >
                <div
                  onClick={() => {
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group cursor-pointer ${
                    isActive
                      ? 'bg-[#111827] text-white font-bold'
                      : 'text-black/60 hover:bg-black/5 hover:text-black'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-[#F59E0B]' : 'group-hover:text-black'}`}
                  />
                  {isSidebarOpen && (
                    <span className="text-sm">{item.name}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-black/60 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer group">
              <LogoutIcon className="w-5 h-5" />
              {isSidebarOpen && (
                <span className="text-sm font-bold">Keluar Admin</span>
              )}
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-black/10 bg-white/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
            className="p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-black/60 bg-black/5 px-2 py-1 rounded">
              v1.0-beta
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
