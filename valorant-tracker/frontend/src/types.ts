export interface PlayerStats {
  score: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface Player {
  puuid: string;
  name: string;
  tag: string;
  team: 'Red' | 'Blue';
  character: string; 
  currenttier_patched: string; // Rank
  stats: PlayerStats;
  assets: {
    agent: {
      small: string; // URL to agent icon
    };
  };
}

export interface MatchMetadata {
  map: string;
  game_start_patched: string;
  mode: string;
  queue: string; // "Competitive", "Unrated"
}

export interface MatchData {
  metadata: MatchMetadata;
  players: {
    all_players: Player[];
  };
  teams: {
    red: { has_won: boolean; rounds_won: number; rounds_lost: number };
    blue: { has_won: boolean; rounds_won: number; rounds_lost: number };
  };
}