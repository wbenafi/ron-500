'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import ScoreBoard from '@/components/ScoreBoard';
import RoundInput from '@/components/RoundInput';
import RoundHistory from '@/components/RoundHistory';
import WinnerModal from '@/components/WinnerModal';
import AddPlayerModal from '@/components/AddPlayerModal';
import Button from '@/components/ui/Button';
import { useConfirm } from '@/hooks/useConfirm';

export default function GamePage() {
  const router = useRouter();
  const { state, addRound, addPlayer, undoLastRound, resetGame, finishGame } = useGame();
  const { confirm, ConfirmDialog } = useConfirm();
  const [showRoundInput, setShowRoundInput] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const isClient = typeof window !== 'undefined';

  // Redirect to home if no game is active
  useEffect(() => {
    if (isClient && state.players.length === 0) {
      router.push('/');
    }
  }, [isClient, state.players.length, router]);

  const handleNewGame = () => {
    resetGame();
    router.push('/');
  };

  const handleViewStats = () => {
    resetGame();
    router.push('/stats');
  };

  const calculateAverageScore = () => {
    if (state.players.length === 0) return 0;
    const sum = state.players.reduce((acc, player) => acc + player.totalScore, 0);
    return sum / state.players.length;
  };

  const handleAddPlayer = (name: string, initialScore: number) => {
    addPlayer(name, initialScore);
    setShowAddPlayerModal(false);
  };

  const handleFinishClick = async () => {
    const confirmed = await confirm({
      title: "Terminar partida",
      message: "¿Estás seguro de que quieres terminar la partida? La partida se guardará en las estadísticas con las puntuaciones actuales.",
      confirmText: "Terminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (confirmed) {
      finishGame();
      handleNewGame();
    }
  };

  if (!isClient || state.players.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </div>
    );
  }

  return (
    <main className="h-full p-4 md:p-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Inicio</span>
        </Link>

        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🃏</span>
          RON {state.winningScore}
        </h1>

        <Button
          variant="danger"
          size="sm"
          onClick={handleFinishClick}
        >
          Terminar
        </Button>
      </header>

      {/* Game info bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{state.players.length}</p>
              <p className="text-xs text-slate-400">Jugadores</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{state.rounds.length}</p>
              <p className="text-xs text-slate-400">Rondas</p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowRoundInput(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Ronda
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scoreboard */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
          <ScoreBoard 
            players={state.players} 
            targetScore={state.winningScore}
            onAddPlayer={() => setShowAddPlayerModal(true)}
          />
        </div>

        {/* History */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
          <RoundHistory
            rounds={state.rounds}
            players={state.players}
            playerAddedEvents={state.playerAddedEvents}
            onUndo={undoLastRound}
            winningScore={state.winningScore}
          />
        </div>
      </div>

      {/* Round Input Modal */}
      <RoundInput
        players={state.players}
        roundNumber={state.rounds.length + 1}
        onSubmit={addRound}
        isOpen={showRoundInput}
        onClose={() => setShowRoundInput(false)}
        winningScore={state.winningScore}
      />

      {/* Winner Modal */}
      <WinnerModal
        winner={state.winner}
        onNewGame={handleNewGame}
        onViewStats={handleViewStats}
      />

      {/* Add Player Modal */}
      <AddPlayerModal
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        onAdd={handleAddPlayer}
        averageScore={calculateAverageScore()}
        existingNames={state.players.map(p => p.name)}
      />

      <ConfirmDialog />
    </main>
  );
}

