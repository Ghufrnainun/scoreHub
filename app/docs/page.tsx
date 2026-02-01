'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const SectionHeader = ({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) => (
  <h2
    id={id}
    className="text-2xl font-black uppercase tracking-tight text-foreground mt-12 mb-6 border-b pb-2 border-primary/20 scroll-mt-24"
  >
    {children}
  </h2>
);

const SubHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-bold text-foreground mt-8 mb-4 flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
    {children}
  </h3>
);

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'guide' | 'rules'>('guide');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      {/* Top Bar */}
      <header className="h-16 border-b bg-card/80 backdrop-blur px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Image
              src="/scorehub-logo.svg"
              alt="Scorehub logo"
              width={20}
              height={20}
              className="h-4 w-4"
            />
          </div>
          <span className="font-display text-sm uppercase tracking-widest font-black">
            ScoreHub
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/create">Back to Lobby</Link>
          </Button>
        </nav>
      </header>

      <main
        id="main-content"
        className="container mx-auto max-w-4xl p-6 lg:p-12"
      >
        <div className="mb-12">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase mb-4">
            System Documentation
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Everything you need to know about running professional badminton
            matches using the MatchPoint ScoreHub system.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-secondary rounded-xl mb-12 w-fit">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'guide'
                ? 'bg-background shadow-md text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            User Guide
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'rules'
                ? 'bg-background shadow-md text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            BWF Rules Engine
          </button>
        </div>

        {activeTab === 'guide' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader id="getting-started">Getting Started</SectionHeader>
            <Card className="p-6 bg-secondary/30 border-none mb-8">
              <p className="mb-4">
                MatchPoint ScoreHub is designed for a dual-device setup:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Referee Tablet/Phone</strong>: Used to control scores,
                  challenges, and match flow.
                </li>
                <li>
                  <strong>Audience Display (TV/Monitor)</strong>: Used to show
                  live scores to the stadium or streaming viewers.
                </li>
              </ul>
            </Card>

            <SubHeader>Creating a Match</SubHeader>
            <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
              <li>Open the MatchPoint landing page on your referee device.</li>
              <li>
                Select <strong>Badminton</strong> from the sport selector.
              </li>
              <li>
                Choose a category (MS, WS, MD, WD, XD) &mdash; this
                automatically sets the singles/doubles mode.
              </li>
              <li>Enter Player/Team names.</li>
              <li>
                Set a <strong>4-6 digit PIN</strong>. This PIN is required for
                referee access only.
              </li>
              <li>
                Click <strong>Start Match</strong> to enter the Control Panel.
              </li>
            </ol>

            <SubHeader>Joining as Audience (Display)</SubHeader>
            <p className="text-muted-foreground mb-4">
              On your display monitor/TV, enter the <strong>Match ID</strong>{' '}
              (e.g., MATCH-X1Y2) in the "Join Existing" section on the landing
              page. Click <strong>Join Display</strong>. No PIN is required for
              viewers.
            </p>

            <SectionHeader id="referee-controls">
              Referee Control Panel
            </SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-5 border-slate-200 dark:border-slate-800">
                <h4 className="font-black uppercase text-xs text-primary mb-3 tracking-widest">
                  Awarding Points
                </h4>
                <p className="text-sm text-muted-foreground">
                  Tap the large Blue (Home) or Red (Away) buttons on the court
                  visual or sidebar to award a point. The system automatically
                  handles set wins and service rotation.
                </p>
              </Card>
              <Card className="p-5 border-slate-200 dark:border-slate-800">
                <h4 className="font-black uppercase text-xs text-primary mb-3 tracking-widest">
                  Undoing Points
                </h4>
                <p className="text-sm text-muted-foreground">
                  Mistakes happen. Use the <strong>Undo Icon</strong> (circular
                  arrow) at the top of the score strip to revert the last point
                  awarded.
                </p>
              </Card>
              <Card className="p-5 border-slate-200 dark:border-slate-800">
                <h4 className="font-black uppercase text-xs text-primary mb-3 tracking-widest">
                  Side Management
                </h4>
                <p className="text-sm text-muted-foreground">
                  While sides switch automatically according to rules, you can
                  use the <strong>SWAP SIDES</strong> button in the header to
                  manually flip the referee's view.
                </p>
              </Card>
              <Card className="p-5 border-slate-200 dark:border-slate-800">
                <h4 className="font-black uppercase text-xs text-primary mb-3 tracking-widest">
                  Match Reset
                </h4>
                <p className="text-sm text-muted-foreground">
                  Found in the footer. This will permanently clear all scores
                  and history for the current match ID. Requires confirmation.
                </p>
              </Card>
            </div>

            <SectionHeader id="audience-ux">
              Audience Display Experience
            </SectionHeader>
            <SubHeader>Fullscreen Mode</SubHeader>
            <p className="text-muted-foreground mb-4">
              To maximize the scoreboard for broadcast or stadium view, click{' '}
              <strong>anywhere</strong> on the display page to toggle Fullscreen
              mode.
            </p>
            <SubHeader>Appearance Settings</SubHeader>
            <p className="text-muted-foreground mb-4">
              The Referee can control the audience's view via the **SETTINGS**
              panel in the control footer:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Font Sizes</strong>: Adjust the scale of team names and
                scores for different screen sizes.
              </li>
              <li>
                <strong>Team Codes</strong>: Toggle 3-letter country/team codes
                (e.g., INA, MAS).
              </li>
              <li>
                <strong>Theme</strong>: Switch the display between a sleek dark
                mode or a high-contrast light mode.
              </li>
              <li>
                <strong>Service Icon</strong>: Toggle the shuttlecock icon
                visibility.
              </li>
            </ul>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader id="scoring-system">Scoring System</SectionHeader>
            <Card className="p-6 bg-primary/5 border-primary/20 mb-8 border">
              <p className="text-foreground font-bold mb-2">
                MatchPoint follows the standard BWF Best of 3 rule:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Points are scored on every serve (rally scoring).</li>
                <li>The first to 21 points wins a set.</li>
                <li>
                  If the score reaches 20-all, the side which gains a 2-point
                  lead first wins that set.
                </li>
                <li>
                  If the score reaches 29-all, the side scoring the 30th point
                  wins that set.
                </li>
              </ul>
            </Card>

            <SectionHeader id="service-rules">
              Service & Positioning
            </SectionHeader>
            <SubHeader>Singles (MS/WS)</SubHeader>
            <p className="text-muted-foreground mb-4">
              The server serves from the **Right service court** when their
              score is **Even** (0, 2, 4…) and from the **Left service court**
              when their score is **Odd** (1, 3, 5…).
            </p>

            <SubHeader>Doubles (MD/WD/XD)</SubHeader>
            <p className="text-muted-foreground mb-4">
              ScoreHub manages the complex doubles rotation automatically:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                If the serving side wins a rally, the same server serves again
                from the alternate service court.
              </li>
              <li>
                If the receiving side wins a rally, they become the new serving
                side. The player standing in the court dictated by their current
                score (Right for Even, Left for Odd) becomes the server.
              </li>
              <li>
                Players do not change their respective service courts until they
                win a point when their side is serving.
              </li>
            </ul>

            <SectionHeader id="auto-switching">
              Automated Side Switching
            </SectionHeader>
            <p className="text-muted-foreground mb-4">
              The digital scoreboard will automatically "Flip" the team
              positions on the screen at these critical moments:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                At the completion of the <strong>First Set</strong>.
              </li>
              <li>
                At the completion of the <strong>Second Set</strong> (if the
                match continues).
              </li>
              <li>
                In the <strong>Third (Decider) Set</strong> when one side
                reaches <strong>11 Points</strong>.
              </li>
            </ul>
          </div>
        )}

        <footer className="mt-24 pt-8 border-t border-border flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Image
              src="/scorehub-logo.svg"
              alt="Scorehub logo"
              width={22}
              height={22}
              className="h-5 w-5"
            />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Version 2.4.0 &bull; Tournament System Control
          </p>
        </footer>
      </main>
    </div>
  );
}
