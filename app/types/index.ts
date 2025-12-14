export type SportType = 'nba' | 'nfl' | 'nhl' | 'mlb' | 'soccer-eur';

export interface Lever {
  id: string;
  name: string;
  category: 'individual' | 'team' | 'opponent';
  value: number;
  weight: number;
  description: string;
  stats: { label: string; value: string | number; unit?: string }[];
}

export interface RAI {
  matchId: string;
  overall: number;
  confidence: number;
  topLevers: Lever[];
  narrative: {
    title: string;
    summary: string;
    keyPoints: string[];
  };
}

export interface PAI {
  matchId: string;
  overall: number;
  topLevers: Lever[];
  concordance: { score: number };
  narrative: {
    title: string;
    summary: string;
    keyPoints: string[];
  };
}
