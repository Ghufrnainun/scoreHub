import { isMale } from './gender';

// Ikon gender universal: Mars (♂) untuk laki-laki, Venus (♀) untuk perempuan.
// Dipakai sebagai placeholder avatar biar langsung kelihatan jenis kelaminnya.
export function GenderIcon({ gender, className = '' }: { gender?: string | null; className?: string }) {
  const male = isMale(gender);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label={male ? 'Laki-laki' : 'Perempuan'}
      role="img"
    >
      {male ? (
        <>
          <circle cx="12" cy="7" r="4.5" />
          <path d="M12 11.5V21" />
          <path d="M8.5 15.5h7" />
        </>
      ) : (
        <>
          <circle cx="12" cy="8" r="4.5" />
          <path d="M12 12.5V21" />
          <path d="M8.5 16.5h7" />
        </>
      )}
    </svg>
  );
}