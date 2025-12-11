'use client';

import { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { GameState, GameAction, Player, Round } from '@/types/game';
import { saveCurrentGame, loadCurrentGame, clearCurrentGame, saveCompletedGame, finishGameManually, generateId } from '@/utils/storage';

const WINNING_SCORE = 500;

const initialState: GameState = {
  id: '',
  players: [],
  rounds: [],
  winner: null,
  startedAt: '',
  finishedAt: null,
};

function calculateTotalScores(players: Player[], rounds: Round[]): Player[] {
  return players.map(player => {
    let totalScore = 0;
    
    // Calcular total aplicando la regla: si al sumar una ronda supera 500, esos puntos no se suman
    for (const round of rounds) {
      const roundScore = round.scores[player.id] || 0;
      const newTotal = totalScore + roundScore;
      
      // Si al sumar esta ronda superaría 500, no se suman los puntos de esta ronda
      if (newTotal > WINNING_SCORE) {
        // No sumar los puntos de esta ronda
        continue;
      }
      
      totalScore = newTotal;
    }
    
    return { ...player, totalScore };
  });
}

function calculateIgnoredScores(
  players: Player[],
  existingRounds: Round[],
  newScores: Record<string, number>
): Record<string, boolean> {
  const ignoredScores: Record<string, boolean> = {};
  
  // Calcular los totales actuales antes de agregar la nueva ronda
  const currentTotals = calculateTotalScores(players, existingRounds);
  
  // Verificar para cada jugador si sus puntos serían ignorados
  players.forEach(player => {
    const currentTotal = currentTotals.find(p => p.id === player.id)?.totalScore || 0;
    const newScore = newScores[player.id] || 0;
    const newTotal = currentTotal + newScore;
    
    // Si al sumar superaría 500, marcar como ignorado
    if (newTotal > WINNING_SCORE) {
      ignoredScores[player.id] = true;
    }
  });
  
  return ignoredScores;
}

function checkWinner(players: Player[]): Player | null {
  // Solo gana si llega exactamente a 500
  const winner = players.find(p => p.totalScore === WINNING_SCORE);
  return winner || null;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYERS': {
      const newState: GameState = {
        ...initialState,
        id: generateId(),
        players: action.players,
        startedAt: new Date().toISOString(),
      };
      return newState;
    }
    
    case 'ADD_ROUND': {
      // Calcular qué puntos fueron ignorados antes de crear la ronda
      const ignoredScores = calculateIgnoredScores(
        state.players,
        state.rounds,
        action.scores
      );
      
      const newRound: Round = {
        id: generateId(),
        roundNumber: state.rounds.length + 1,
        scores: action.scores,
        timestamp: new Date().toISOString(),
        ignoredScores,
      };
      
      const updatedRounds = [...state.rounds, newRound];
      const updatedPlayers = calculateTotalScores(state.players, updatedRounds);
      const winner = checkWinner(updatedPlayers);
      
      const newState: GameState = {
        ...state,
        rounds: updatedRounds,
        players: updatedPlayers,
        winner,
        finishedAt: winner ? new Date().toISOString() : null,
      };
      
      return newState;
    }
    
    case 'UNDO_ROUND': {
      if (state.rounds.length === 0) return state;
      
      const updatedRounds = state.rounds.slice(0, -1);
      const updatedPlayers = calculateTotalScores(state.players, updatedRounds);
      
      return {
        ...state,
        rounds: updatedRounds,
        players: updatedPlayers,
        winner: null,
        finishedAt: null,
      };
    }
    
    case 'SET_WINNER': {
      return {
        ...state,
        winner: action.winner,
        finishedAt: new Date().toISOString(),
      };
    }
    
    case 'RESET_GAME': {
      clearCurrentGame();
      return initialState;
    }
    
    case 'LOAD_GAME': {
      return action.game;
    }
    
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startNewGame: (playerNames: string[]) => void;
  addRound: (scores: Record<string, number>) => void;
  undoLastRound: () => void;
  resetGame: () => void;
  finishGame: () => void;
  hasSavedGame: boolean;
  loadSavedGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const hasSavedToStatsRef = useRef<string | null>(null);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (state.id && state.players.length > 0) {
      saveCurrentGame(state);
      
      // If there's a winner, save to stats (only once per game)
      if (state.winner && state.finishedAt) {
        // Only save if we haven't already saved this game to stats
        if (hasSavedToStatsRef.current !== state.id) {
          saveCompletedGame(state);
          hasSavedToStatsRef.current = state.id;
          clearCurrentGame();
        }
      } else {
        // Reset the ref when game is not finished
        hasSavedToStatsRef.current = null;
      }
    }
  }, [state]);

  const startNewGame = (playerNames: string[]) => {
    const players: Player[] = playerNames.map(name => ({
      id: generateId(),
      name,
      totalScore: 0,
    }));
    dispatch({ type: 'SET_PLAYERS', players });
  };

  const addRound = (scores: Record<string, number>) => {
    dispatch({ type: 'ADD_ROUND', scores });
  };

  const undoLastRound = () => {
    dispatch({ type: 'UNDO_ROUND' });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const finishGame = () => {
    if (state.id && state.players.length > 0) {
      finishGameManually(state);
      clearCurrentGame();
    }
  };

  const hasSavedGame = typeof window !== 'undefined' && !!loadCurrentGame();

  const loadSavedGame = () => {
    const savedGame = loadCurrentGame();
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', game: savedGame });
    }
  };

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        startNewGame,
        addRound,
        undoLastRound,
        resetGame,
        finishGame,
        hasSavedGame,
        loadSavedGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

