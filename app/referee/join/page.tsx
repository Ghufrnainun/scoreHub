import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { Metadata } from 'next';
import JoinForm from './_components/JoinForm';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper to normalize code same as logic
const normalizeCode = (value: string) =>
  value
    ?.toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || '';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const code =
    typeof searchParams.code === 'string' ? searchParams.code : undefined;

  if (!code || normalizeCode(code).length !== 6) {
    return {
      title: 'Masuk sebagai Wasit - Scorehub',
      description:
        'Masukkan kode display dan PIN untuk mengontrol papan skor pertandingan.',
    };
  }

  const normalizedCode = normalizeCode(code);
  const match = await client.query(api.matches.getByDisplayCode, {
    displayCode: normalizedCode,
  });

  if (!match) {
    return {
      title: 'Pertandingan Tidak Ditemukan - Scorehub',
      description: 'Kode display yang dimasukkan tidak terdaftar.',
    };
  }

  return {
    title: `Wasit: ${match.teams.home} vs ${match.teams.away}`,
    description: `Kontrol papan skor pertandingan ${match.sport}. Status: ${match.status}.`,
    openGraph: {
      title: `Wasit: ${match.teams.home} vs ${match.teams.away}`,
      description: `Kontrol papan skor pertandingan ${match.sport}. Status: ${match.status}.`,
    },
  };
}

export default async function RefereeJoinPage(props: Props) {
  const searchParams = await props.searchParams;
  const code = typeof searchParams.code === 'string' ? searchParams.code : '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] px-4 py-10 sm:py-16">
      <JoinForm initialCode={code} />
    </div>
  );
}
