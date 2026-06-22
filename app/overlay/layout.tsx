import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ScoreHub Overlay',
  description: 'Live scoreboard overlay for OBS and streaming software.',
  robots: 'noindex, nofollow',
};

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Stripped-down layout — no navbar, no footer, no scrollbars.
  // The entire page is transparent so OBS can composite it over video.
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }
      `}} />
      <div
        style={{
          background: 'transparent',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          width: '100vw',
          height: '100vh',
        }}
      >
        {children}
      </div>
    </>
  );
}
