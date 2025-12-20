'use client';

import { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { GameState, GameAction, Player, Round, PlayerAddedEvent } from '@/types/game';
import { saveCurrentGame, loadCurrentGame, clearCurrentGame, saveCompletedGame, finishGameManually, generateId } from '@/utils/storage';

const DEFAULT_WINNING_SCORE = 500;

const initialState: GameState = {
  id: '',
  players: [],
  rounds: [],
  playerAddedEvents: [],
  winner: null,
  startedAt: '',
  finishedAt: null,
  winningScore: DEFAULT_WINNING_SCORE,
};

function calculateTotalScores(
  players: Player[], 
  rounds: Round[], 
  winningScore: number,
  playerAddedEvents: PlayerAddedEvent[] = []
): Player[] {
  return players.map(player => {
    // Buscar si el jugador fue agregado durante el juego
    const playerAddedEvent = playerAddedEvents.find(e => e.playerId === player.id);
    
    // Determinar puntuación inicial y desde qué ronda empezar a contar
    let totalScore = playerAddedEvent ? playerAddedEvent.initialScore : 0;
    const playerAddedTimestamp = playerAddedEvent?.timestamp;
    
    // Calcular total aplicando la regla: si al sumar una ronda supera el winningScore, esos puntos no se suman
    for (const round of rounds) {
      // Si el jugador fue agregado después de esta ronda, saltarla
      if (playerAddedTimestamp && round.timestamp < playerAddedTimestamp) {
        continue;
      }
      
      const roundScore = round.scores[player.id] || 0;
      const newTotal = totalScore + roundScore;
      
      // Si al sumar esta ronda superaría el winningScore, no se suman los puntos de esta ronda
      if (newTotal > winningScore) {
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
  newScores: Record<string, number>,
  winningScore: number,
  playerAddedEvents: PlayerAddedEvent[] = []
): Record<string, boolean> {
  const ignoredScores: Record<string, boolean> = {};
  
  // Calcular los totales actuales antes de agregar la nueva ronda
  const currentTotals = calculateTotalScores(players, existingRounds, winningScore, playerAddedEvents);
  
  // Verificar para cada jugador si sus puntos serían ignorados
  players.forEach(player => {
    const currentTotal = currentTotals.find(p => p.id === player.id)?.totalScore || 0;
    const newScore = newScores[player.id] || 0;
    const newTotal = currentTotal + newScore;
    
    // Si al sumar superaría el winningScore, marcar como ignorado
    if (newTotal > winningScore) {
      ignoredScores[player.id] = true;
    }
  });
  
  return ignoredScores;
}

function checkWinner(players: Player[], winningScore: number): Player | null {
  // Solo gana si llega exactamente al winningScore
  const winner = players.find(p => p.totalScore === winningScore);
  return winner || null;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYERS': {
      const newState: GameState = {
        ...initialState,
        id: generateId(),
        players: action.players,
        winningScore: action.winningScore,
        startedAt: new Date().toISOString(),
        playerAddedEvents: [],
      };
      return newState;
    }
    
    case 'ADD_ROUND': {
      // Calcular qué puntos fueron ignorados antes de crear la ronda
      const ignoredScores = calculateIgnoredScores(
        state.players,
        state.rounds,
        action.scores,
        state.winningScore,
        state.playerAddedEvents
      );
      
      const newRound: Round = {
        id: generateId(),
        roundNumber: state.rounds.length + 1,
        scores: action.scores,
        timestamp: new Date().toISOString(),
        ignoredScores,
      };
      
      const updatedRounds = [...state.rounds, newRound];
      const updatedPlayers = calculateTotalScores(state.players, updatedRounds, state.winningScore, state.playerAddedEvents);
      const winner = checkWinner(updatedPlayers, state.winningScore);
      
      const newState: GameState = {
        ...state,
        rounds: updatedRounds,
        players: updatedPlayers,
        winner,
        finishedAt: winner ? new Date().toISOString() : null,
      };
      
      return newState;
    }
    
    case 'ADD_PLAYER': {
      // Recalcular totales para jugadores existentes
      const existingPlayersWithScores = calculateTotalScores(state.players, state.rounds, state.winningScore, state.playerAddedEvents);
      
      // Crear nuevo jugador con su puntuación inicial
      const newPlayerId = generateId();
      const newPlayer: Player = {
        id: newPlayerId,
        name: action.name,
        totalScore: action.initialScore,
      };
      
      // Crear evento de jugador agregado
      const playerAddedEvent: PlayerAddedEvent = {
        id: generateId(),
        type: 'player_added',
        playerId: newPlayerId,
        playerName: action.name,
        initialScore: action.initialScore,
        timestamp: new Date().toISOString(),
      };
      
      // Actualizar la lista de eventos de jugadores agregados
      const updatedPlayerAddedEvents = [...state.playerAddedEvents, playerAddedEvent];
      
      // Recalcular totales para todos los jugadores (incluyendo el nuevo) con los eventos actualizados
      // El nuevo jugador empezará con su initialScore y solo procesará rondas después de su timestamp
      const allPlayers = [...existingPlayersWithScores, newPlayer];
      const updatedPlayers = calculateTotalScores(allPlayers, state.rounds, state.winningScore, updatedPlayerAddedEvents);
      const winner = checkWinner(updatedPlayers, state.winningScore);
      
      return {
        ...state,
        players: updatedPlayers,
        playerAddedEvents: [...state.playerAddedEvents, playerAddedEvent],
        winner,
        finishedAt: winner ? new Date().toISOString() : null,
      };
    }
    
    case 'UNDO_ROUND': {
      if (state.rounds.length === 0) return state;
      
      const updatedRounds = state.rounds.slice(0, -1);
      const updatedPlayers = calculateTotalScores(state.players, updatedRounds, state.winningScore, state.playerAddedEvents);
      
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
  startNewGame: (playerNames: string[], winningScore?: number) => void;
  addRound: (scores: Record<string, number>) => void;
  addPlayer: (name: string, initialScore: number) => void;
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

  const startNewGame = (playerNames: string[], winningScore: number = DEFAULT_WINNING_SCORE) => {
    const players: Player[] = playerNames.map(name => ({
      id: generateId(),
      name,
      totalScore: 0,
    }));
    dispatch({ type: 'SET_PLAYERS', players, winningScore });
  };

  const addRound = (scores: Record<string, number>) => {
    dispatch({ type: 'ADD_ROUND', scores });
  };

  const addPlayer = (name: string, initialScore: number) => {
    dispatch({ type: 'ADD_PLAYER', name, initialScore });
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
        addPlayer,
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

