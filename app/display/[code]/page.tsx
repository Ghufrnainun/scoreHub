import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const normalizeCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

type Props = {
  params: Promise<{ code: string }>;
};

function DisplayCodeMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-black text-white flex items-center justify-center"
    >
      <div className="text-center space-y-3">
        <p className="text-sm uppercase tracking-widest text-white/60">
          {title}
        </p>
        <p className="text-xs text-white/40">{description}</p>
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-widest text-[#fbbf24]"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}

export default async function DisplayByCodePage({ params }: Props) {
  const { code: rawCode } = await params;
  const code = normalizeCode(rawCode || '');

  if (code.length !== 6) {
    return (
      <DisplayCodeMessage
        title="Kode Tampilan Tidak Valid"
        description="Kode harus 6 karakter (A-Z, 0-9)."
      />
    );
  }

  const matchRef = await client.query(api.matches.getByDisplayCode, {
    displayCode: code,
  });

  if (!matchRef?.matchId) {
    return (
      <DisplayCodeMessage
        title="Kode Tampilan Tidak Ditemukan"
        description="Periksa kembali kode dari admin, lalu coba lagi."
      />
    );
  }

  redirect(`/match/${matchRef.matchId}/display`);
}
