import { Metadata } from 'next';
import JoinForm from './_components/JoinForm';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Masuk sebagai Wasit - Scorehub',
    description:
      'Masukkan kode display dan PIN untuk mengontrol papan skor pertandingan.',
  };
}

export default async function RefereeJoinPage(props: Props) {
  const searchParams = await props.searchParams;
  const code = typeof searchParams.code === 'string' ? searchParams.code : '';
  const matchId = typeof searchParams.matchId === 'string' ? searchParams.matchId : '';
  const pin = typeof searchParams.pin === 'string' ? searchParams.pin : '';

  return (
    <main id="main-content" className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-[#111827] sm:py-16">
      <JoinForm initialCode={code} initialMatchId={matchId} initialPin={pin} />
    </main>
  );
}
