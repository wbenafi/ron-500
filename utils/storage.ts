import { GameState, GameStats, CompletedGame } from '@/types/game';

const CURRENT_GAME_KEY = 'ron500_current_game';
const STATS_KEY = 'ron500_stats';

export function saveCurrentGame(game: GameState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
  }
}

export function loadCurrentGame(): GameState | null {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem(CURRENT_GAME_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as GameState;
      // Normalizar las rondas para asegurar que tengan ignoredScores si no existe
      if (parsed.rounds && Array.isArray(parsed.rounds)) {
        parsed.rounds = parsed.rounds.map(round => ({
          ...round,
          ignoredScores: round.ignoredScores || {},
        }));
      }
      // Normalizar winningScore para juegos antiguos (por defecto 500)
      if (typeof parsed.winningScore !== 'number') {
        parsed.winningScore = 500;
      }
      return parsed;
    } catch {
      return null;
    }
  }
  return null;
}

export function clearCurrentGame(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_GAME_KEY);
  }
}

export function getStats(): GameStats {
  if (typeof window === 'undefined') {
    return { gamesPlayed: 0, gamesHistory: [] };
  }
  
  const saved = localStorage.getItem(STATS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { gamesPlayed: 0, gamesHistory: [] };
    }
  }
  return { gamesPlayed: 0, gamesHistory: [] };
}

export function saveCompletedGame(game: GameState): void {
  if (typeof window === 'undefined' || !game.winner) return;
  
  const stats = getStats();
  
  // Check if this game is already saved to avoid duplicates
  const alreadySaved = stats.gamesHistory.some(g => g.id === game.id);
  if (alreadySaved) return;
  
  const completedGame: CompletedGame = {
    id: game.id,
    players: game.players,
    winner: game.winner,
    rounds: game.rounds.length,
    startedAt: game.startedAt,
    finishedAt: game.finishedAt || new Date().toISOString(),
  };
  
  stats.gamesPlayed += 1;
  stats.gamesHistory.unshift(completedGame);
  
  // Keep only last 50 games
  if (stats.gamesHistory.length > 50) {
    stats.gamesHistory = stats.gamesHistory.slice(0, 50);
  }
  
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function finishGameManually(game: GameState): void {
  if (typeof window === 'undefined' || game.players.length === 0) return;
  
  const stats = getStats();
  
  // Check if this game is already saved to avoid duplicates
  const alreadySaved = stats.gamesHistory.some(g => g.id === game.id);
  if (alreadySaved) return;
  
  // Determine winner as the player with highest score
  const winner = [...game.players].sort((a, b) => b.totalScore - a.totalScore)[0];
  
  const completedGame: CompletedGame = {
    id: game.id,
    players: game.players,
    winner: winner,
    rounds: game.rounds.length,
    startedAt: game.startedAt,
    finishedAt: new Date().toISOString(),
  };
  
  stats.gamesPlayed += 1;
  stats.gamesHistory.unshift(completedGame);
  
  // Keep only last 50 games
  if (stats.gamesHistory.length > 50) {
    stats.gamesHistory = stats.gamesHistory.slice(0, 50);
  }
  
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function clearStats(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STATS_KEY);
  }
}

export function deleteGameFromStats(gameId: string): void {
  if (typeof window === 'undefined') return;
  
  const stats = getStats();
  const initialLength = stats.gamesHistory.length;
  
  // Remove the game from history
  stats.gamesHistory = stats.gamesHistory.filter(game => game.id !== gameId);
  
  // Update gamesPlayed count if a game was actually removed
  if (stats.gamesHistory.length < initialLength) {
    stats.gamesPlayed = Math.max(0, stats.gamesPlayed - 1);
  }
  
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

