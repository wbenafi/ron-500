import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { GameAction, GameState, Player, PlayerAddedEvent, Round } from '@/types/game';
import {
  clearCurrentGame,
  finishGameManually,
  generateId,
  loadCurrentGame,
  saveCompletedGame,
  saveCurrentGame,
} from '@/utils/storage';

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
  return players.map((player) => {
    const playerAddedEvent = playerAddedEvents.find((event) => event.playerId === player.id);

    let totalScore = playerAddedEvent ? playerAddedEvent.initialScore : 0;
    const playerAddedTimestamp = playerAddedEvent?.timestamp;

    for (const round of rounds) {
      if (playerAddedTimestamp && round.timestamp < playerAddedTimestamp) {
        continue;
      }

      const roundScore = round.scores[player.id] || 0;
      const newTotal = totalScore + roundScore;

      if (newTotal > winningScore) {
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
  const currentTotals = calculateTotalScores(players, existingRounds, winningScore, playerAddedEvents);

  players.forEach((player) => {
    const currentTotal = currentTotals.find((storedPlayer) => storedPlayer.id === player.id)?.totalScore || 0;
    const newScore = newScores[player.id] || 0;
    const newTotal = currentTotal + newScore;

    if (newTotal > winningScore) {
      ignoredScores[player.id] = true;
    }
  });

  return ignoredScores;
}

function checkWinner(players: Player[], winningScore: number): Player | null {
  const winner = players.find((player) => player.totalScore === winningScore);
  return winner || null;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYERS': {
      return {
        ...initialState,
        id: generateId(),
        players: action.players,
        winningScore: action.winningScore,
        startedAt: new Date().toISOString(),
        playerAddedEvents: [],
      };
    }

    case 'ADD_ROUND': {
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
      const updatedPlayers = calculateTotalScores(
        state.players,
        updatedRounds,
        state.winningScore,
        state.playerAddedEvents
      );
      const winner = checkWinner(updatedPlayers, state.winningScore);

      return {
        ...state,
        rounds: updatedRounds,
        players: updatedPlayers,
        winner,
        finishedAt: winner ? new Date().toISOString() : null,
      };
    }

    case 'ADD_PLAYER': {
      const existingPlayersWithScores = calculateTotalScores(
        state.players,
        state.rounds,
        state.winningScore,
        state.playerAddedEvents
      );

      const newPlayerId = generateId();
      const newPlayer: Player = {
        id: newPlayerId,
        name: action.name,
        totalScore: action.initialScore,
      };

      const playerAddedEvent: PlayerAddedEvent = {
        id: generateId(),
        type: 'player_added',
        playerId: newPlayerId,
        playerName: action.name,
        initialScore: action.initialScore,
        timestamp: new Date().toISOString(),
      };

      const updatedPlayerAddedEvents = [...state.playerAddedEvents, playerAddedEvent];
      const allPlayers = [...existingPlayersWithScores, newPlayer];
      const updatedPlayers = calculateTotalScores(
        allPlayers,
        state.rounds,
        state.winningScore,
        updatedPlayerAddedEvents
      );
      const winner = checkWinner(updatedPlayers, state.winningScore);

      return {
        ...state,
        players: updatedPlayers,
        playerAddedEvents: updatedPlayerAddedEvents,
        winner,
        finishedAt: winner ? new Date().toISOString() : null,
      };
    }

    case 'UNDO_ROUND': {
      if (state.rounds.length === 0) {
        return state;
      }

      const updatedRounds = state.rounds.slice(0, -1);
      const updatedPlayers = calculateTotalScores(
        state.players,
        updatedRounds,
        state.winningScore,
        state.playerAddedEvents
      );

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
  resetGame: () => Promise<void>;
  finishGame: () => Promise<void>;
  hasSavedGame: boolean;
  loadSavedGame: () => Promise<boolean>;
  hydrated: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const hasSavedToStatsRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const savedGame = await loadCurrentGame();
      if (!mounted) {
        return;
      }

      if (savedGame) {
        dispatch({ type: 'LOAD_GAME', game: savedGame });
        setHasSavedGame(true);
      } else {
        setHasSavedGame(false);
      }

      setHydrated(true);
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let active = true;

    const persist = async () => {
      if (state.id && state.players.length > 0) {
        await saveCurrentGame(state);
        if (active) {
          setHasSavedGame(true);
        }

        if (state.winner && state.finishedAt) {
          if (hasSavedToStatsRef.current !== state.id) {
            await saveCompletedGame(state);
            hasSavedToStatsRef.current = state.id;
            await clearCurrentGame();
            if (active) {
              setHasSavedGame(false);
            }
          }
        } else {
          hasSavedToStatsRef.current = null;
        }
      } else {
        await clearCurrentGame();
        if (active) {
          setHasSavedGame(false);
        }
      }
    };

    persist();

    return () => {
      active = false;
    };
  }, [state, hydrated]);

  const startNewGame = useCallback((playerNames: string[], winningScore: number = DEFAULT_WINNING_SCORE) => {
    hasSavedToStatsRef.current = null;
    const players: Player[] = playerNames.map((name) => ({
      id: generateId(),
      name,
      totalScore: 0,
    }));

    dispatch({ type: 'SET_PLAYERS', players, winningScore });
  }, []);

  const addRound = useCallback((scores: Record<string, number>) => {
    dispatch({ type: 'ADD_ROUND', scores });
  }, []);

  const addPlayer = useCallback((name: string, initialScore: number) => {
    dispatch({ type: 'ADD_PLAYER', name, initialScore });
  }, []);

  const undoLastRound = useCallback(() => {
    dispatch({ type: 'UNDO_ROUND' });
  }, []);

  const resetGame = useCallback(async () => {
    hasSavedToStatsRef.current = null;
    dispatch({ type: 'RESET_GAME' });
    await clearCurrentGame();
    setHasSavedGame(false);
  }, []);

  const finishGame = useCallback(async () => {
    if (!state.id || state.players.length === 0) {
      return;
    }

    await finishGameManually(state);
    await clearCurrentGame();
    setHasSavedGame(false);
    hasSavedToStatsRef.current = state.id;
  }, [state]);

  const loadSavedGameIntoState = useCallback(async () => {
    const savedGame = await loadCurrentGame();
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', game: savedGame });
      setHasSavedGame(true);
      return true;
    }

    return false;
  }, []);

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
        loadSavedGame: loadSavedGameIntoState,
        hydrated,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }

  return context;
}