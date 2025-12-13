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

export interface PlayerAddedEvent {
  id: string;
  type: 'player_added';
  playerId: string;
  playerName: string;
  initialScore: number;
  timestamp: string;
}

export type GameEvent = Round | PlayerAddedEvent;

export interface GameState {
  id: string;
  players: Player[];
  rounds: Round[];
  playerAddedEvents: PlayerAddedEvent[]; // Eventos de jugadores agregados
  winner: Player | null;
  startedAt: string;
  finishedAt: string | null;
  winningScore: number; // Puntos necesarios para ganar (por defecto 500)
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
  | { type: 'SET_PLAYERS'; players: Player[]; winningScore: number }
  | { type: 'ADD_ROUND'; scores: Record<string, number> }
  | { type: 'ADD_PLAYER'; name: string; initialScore: number }
  | { type: 'UNDO_ROUND' }
  | { type: 'SET_WINNER'; winner: Player }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_GAME'; game: GameState };

