import { isMale } from './gender';
import { GenderIcon } from './gender-icon';
import { cn } from './utils';

// Avatar dengan warna pembeda gender:
// - Laki-laki  → biru (sky)
// - Perempuan  → pink/merah muda (rose)
// Dipakai di banner detail & tabel daftar biar cepat dikenali.
export function GenderAvatar({
  gender,
  size = 'lg',
  className = '',
}: {
  gender?: string | null;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const male = isMale(gender);
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl border',
        size === 'lg' ? 'h-14 w-14' : 'h-10 w-10 rounded-xl',
        male
          ? 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400 dark:border-sky-500/30'
          : 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400 dark:border-rose-500/30',
        className,
      )}
    >
      <GenderIcon gender={gender} className={size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'} />
    </div>
  );
}