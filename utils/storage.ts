import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompletedGame, GameState, GameStats } from '@/types/game';

const CURRENT_GAME_KEY = 'ron500_current_game';
const STATS_KEY = 'ron500_stats';

const EMPTY_STATS: GameStats = { gamesPlayed: 0, gamesHistory: [] };

export async function saveCurrentGame(game: GameState): Promise<void> {
  await AsyncStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
}

export async function loadCurrentGame(): Promise<GameState | null> {
  const saved = await AsyncStorage.getItem(CURRENT_GAME_KEY);
  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as GameState;

    if (parsed.rounds && Array.isArray(parsed.rounds)) {
      parsed.rounds = parsed.rounds.map((round) => ({
        ...round,
        ignoredScores: round.ignoredScores || {},
      }));
    }

    if (!parsed.playerAddedEvents || !Array.isArray(parsed.playerAddedEvents)) {
      parsed.playerAddedEvents = [];
    }

    if (typeof parsed.winningScore !== 'number') {
      parsed.winningScore = 500;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function clearCurrentGame(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_GAME_KEY);
}

export async function getStats(): Promise<GameStats> {
  const saved = await AsyncStorage.getItem(STATS_KEY);
  if (!saved) {
    return EMPTY_STATS;
  }

  try {
    return JSON.parse(saved) as GameStats;
  } catch {
    return EMPTY_STATS;
  }
}

export async function saveCompletedGame(game: GameState): Promise<void> {
  if (!game.winner) {
    return;
  }

  const stats = await getStats();
  const alreadySaved = stats.gamesHistory.some((storedGame) => storedGame.id === game.id);
  if (alreadySaved) {
    return;
  }

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

  if (stats.gamesHistory.length > 50) {
    stats.gamesHistory = stats.gamesHistory.slice(0, 50);
  }

  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function finishGameManually(game: GameState): Promise<void> {
  if (game.players.length === 0) {
    return;
  }

  const stats = await getStats();
  const alreadySaved = stats.gamesHistory.some((storedGame) => storedGame.id === game.id);
  if (alreadySaved) {
    return;
  }

  const winner = [...game.players].sort((a, b) => b.totalScore - a.totalScore)[0];

  const completedGame: CompletedGame = {
    id: game.id,
    players: game.players,
    winner,
    rounds: game.rounds.length,
    startedAt: game.startedAt,
    finishedAt: new Date().toISOString(),
  };

  stats.gamesPlayed += 1;
  stats.gamesHistory.unshift(completedGame);

  if (stats.gamesHistory.length > 50) {
    stats.gamesHistory = stats.gamesHistory.slice(0, 50);
  }

  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function clearStats(): Promise<void> {
  await AsyncStorage.removeItem(STATS_KEY);
}

export async function deleteGameFromStats(gameId: string): Promise<void> {
  const stats = await getStats();
  const initialLength = stats.gamesHistory.length;

  stats.gamesHistory = stats.gamesHistory.filter((game) => game.id !== gameId);

  if (stats.gamesHistory.length < initialLength) {
    stats.gamesPlayed = Math.max(0, stats.gamesPlayed - 1);
  }

  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}