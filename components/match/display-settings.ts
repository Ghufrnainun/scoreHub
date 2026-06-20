export interface DisplaySettings {
  template:
    | 'modern'
    | 'classic'
    | 'minimal'
    | 'neon'
    | 'bwf-court'
    | 'hoops-classic'
    | 'hoops-led'
    | 'volley-clean'
    | 'volley-led'
    | 'tennis-scoreline'
    | 'tennis-minimal'
    | 'futsal-broadcast'
    | 'futsal-minimal'
    | 'soccer-broadcast'
    | 'soccer-minimal';
  fontSizes: { teamName: number; score: number };
  teamCodes: { home: string; away: string; show: boolean };
  teamColors: { home: string; away: string };
  teamLabels: { home: string; away: string };
  courtName: string;
  showServerIcon: boolean;
  overlay?: {
    enabled: boolean;
    background: 'transparent' | 'chroma-green' | 'chroma-blue';
    hideHeader: boolean;
    hideFooter: boolean;
  };
}

export const defaultSettings: DisplaySettings = {
  template: 'modern',
  fontSizes: { teamName: 24, score: 72 },
  teamCodes: { home: '', away: '', show: true },
  teamColors: { home: '#3b82f6', away: '#ef4444' },
  teamLabels: { home: 'TUAN RUMAH', away: 'TAMU' },
  courtName: 'LAPANGAN 1',
  showServerIcon: true,
};

export const themeStyles = {
  '--bg': '#000000',
  '--text-primary': '#FFFFFF',
  '--text-secondary': '#fbbf24',
  '--text-highlight': '#4ade80',
  '--panel-gap': '4px',
} as React.CSSProperties;
