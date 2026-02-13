import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Scorehub - Sports Scoreboard System';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(to bottom right, #111827, #000000)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        {/* Simple Icon approximation since we can't easily load local SVG in edge runtime without reading file */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 10,
          fontFamily: 'sans-serif',
        }}
      >
        Scorehub
      </div>
      <div
        style={{
          fontSize: 32,
          opacity: 0.6,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          fontFamily: 'sans-serif',
        }}
      >
        Professional Scoreboard System
      </div>
    </div>,
    {
      ...size,
    },
  );
}
