// src/types.ts

export interface PlayerStats {
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
}

export interface Player {
  puuid: string;
  name: string;
  tag: string;
  team: 'Red' | 'Blue';
  character: string; // The Agent name (e.g., "Jett")
  currenttier_patched: string; // Rank (e.g., "Gold 1")
  stats: PlayerStats;
  assets: {
    card: {
      small: string;
      large: string;
    };
    agent: {
      small: string;
      full: string;
    };
  };
}

export interface MatchMetadata {
  map: string;
  game_version: string;
  game_length: number; // In milliseconds
  game_start: number; // Unix timestamp
  game_start_patched: string; // Human readable date
  rounds_played: number;
  mode: string; // e.g., "Competitive"
  queue: string; // e.g., "Standard"
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

export interface APIResponse {
  status: number;
  data: MatchData[]; // Array of matches
}