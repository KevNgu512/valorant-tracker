export interface PlayerStats {
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
  damage_made: number;
}

export interface Player {
  puuid: string;
  name: string;
  tag: string;
  team: 'Red' | 'Blue';
  character: string; 
  currenttier_patched: string; // Rank
  currenttier: number;
  stats: PlayerStats;
  assets: {
    agent: {
      small: string; // URL to agent icon
    };
  };
}

export interface MatchMetadata {
  map: string;
  game_version: string;
  game_length: number;
  game_start: number;
  game_start_patched: string;
  rounds_played: number;
  mode: string;
  queue: string;
  cluster: string;
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