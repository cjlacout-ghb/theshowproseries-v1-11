export type BattingStat = {
  id?: number;
  playerId: number;
  gameId: number;
  plateAppearances: number;
  atBats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  hitByPitch: number;
  sacHits: number;
  sacFlies: number;
  strikeOuts: number;
  stolenBases: number;
};

export type PitchingStat = {
  id?: number;
  playerId: number;
  gameId: number;
  inningsPitched: number; // using float .1, .2
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeOuts: number;
  homeRuns: number;
  wins: number;
  losses: number;
  saves: number;
};

export type Player = {
  id: number;
  name: string;
  number: number;
  role: string;
  placeOfBirth: string;
  teamId: number;
  battingStats?: BattingStat[];
  pitchingStats?: PitchingStat[];
};

export type Team = {
  id: number;
  name: string;
  players: Player[];
};

export type Game = {
  id: number;
  team1Id: string;
  score1: string;
  hits1: string;
  errors1: string;
  team2Id: string;
  score2: string;
  hits2: string;
  errors2: string;
  day?: string;
  time?: string;
  innings: (string | number)[][]; // 7 innings, 2 teams
  isChampionship?: boolean;
  battingStats?: BattingStat[];
  pitchingStats?: PitchingStat[];
};

export type Standing = {
  teamId: number;
  pos: number;
  w: number;
  l: number;
  rs: number;
  ra: number;
  pct: number;
  gb: number;
};

export type Award = {
  id?: number;
  category: 'ronda_inicial' | 'partido_final';
  title: string;
  playerName: string;
  teamName: string;
  description: string;
  updated_at?: string;
};

// Database Types (snake_case matches Supabase)
export interface DBTeam {
  id: number;
  name: string;
  logo_url?: string;
  players: DBPlayer[];
}

export interface DBPlayer {
  id: number;
  team_id: number;
  name: string;
  number: number;
  role: string;
  place_of_birth: string;
  batting_stats?: any[];
  pitching_stats?: any[];
}

export interface DBGame {
  id: number;
  team1_id: number;
  team2_id: number;
  score1: number | null;
  score2: number | null;
  hits1: number | null;
  hits2: number | null;
  errors1: number | null;
  errors2: number | null;
  innings: any[];
  batting_stats?: any[];
  pitching_stats?: any[];
  is_championship?: boolean; // Sometimes inferred or extra column
}
