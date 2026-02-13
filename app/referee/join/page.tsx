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
    .slice(0, 8) || '';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const code =
    typeof searchParams.code === 'string' ? searchParams.code : undefined;

  if (!code || code.length < 4) {
    return {
      title: 'Join as Referee - Scorehub',
      description:
        'Enter display code and PIN to control the match scoreboard.',
    };
  }

  const normalizedCode = normalizeCode(code);
  const match = await client.query(api.matches.getByDisplayCode, {
    displayCode: normalizedCode,
  });

  if (!match) {
    return {
      title: 'Match Not Found - Scorehub',
      description: 'The display code provided does not exist.',
    };
  }

  return {
    title: `Referee: ${match.teams.home} vs ${match.teams.away}`,
    description: `Control the ${match.sport} match scoreboard. Status: ${match.status}.`,
    openGraph: {
      title: `Referee: ${match.teams.home} vs ${match.teams.away}`,
      description: `Control the ${match.sport} match scoreboard. Status: ${match.status}.`,
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
