export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export interface Round {
  id: string;
  roundNumber: number;
  scores: Record<string, number>; // playerId -> puntos
  timestamp: string;
  ignoredScores?: Record<string, boolean>; // playerId -> si los puntos fueron ignorados
}

export interface GameState {
  id: string;
  players: Player[];
  rounds: Round[];
  winner: Player | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface CompletedGame {
  id: string;
  players: Player[];
  winner: Player;
  rounds: number;
  startedAt: string;
  finishedAt: string;
}

export interface GameStats {
  gamesPlayed: number;
  gamesHistory: CompletedGame[];
}

export type GameAction =
  | { type: 'SET_PLAYERS'; players: Player[] }
  | { type: 'ADD_ROUND'; scores: Record<string, number> }
  | { type: 'UNDO_ROUND' }
  | { type: 'SET_WINNER'; winner: Player }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_GAME'; game: GameState };

