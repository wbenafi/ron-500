'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getStats, clearStats } from '@/utils/storage';
import { GameStats, CompletedGame } from '@/types/game';
import Button from '@/components/ui/Button';

export default function StatsPage() {
  const isClient = typeof window !== 'undefined';
  // Use lazy initialization to avoid calling setState in useEffect
  const [stats, setStats] = useState<GameStats>(() => {
    if (typeof window === 'undefined') return { gamesPlayed: 0, gamesHistory: [] };
    return getStats();
  });

  const handleClearStats = () => {
    if (confirm('¿Estás seguro de que quieres borrar todas las estadísticas?')) {
      clearStats();
      setStats({ gamesPlayed: 0, gamesHistory: [] });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </div>
    );
  }

  return (
    <main className="h-full p-4 md:p-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Inicio
        </Link>

        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Estadísticas
        </h1>

        {stats.gamesPlayed > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearStats}>
            Limpiar
          </Button>
        )}
      </header>

      {/* Stats summary */}
      <div className="bg-linear-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-5xl font-bold text-white">{stats.gamesPlayed}</p>
            <p className="text-slate-400 mt-1">Partidas Totales</p>
          </div>
        </div>
      </div>

      {/* Games history */}
      {stats.gamesHistory.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-7xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-2">Sin partidas registradas</h2>
          <p className="text-slate-400 mb-6">Juega una partida completa para ver estadísticas</p>
          <Link href="/">
            <Button variant="primary">
              Iniciar Partida
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Historial de Partidas</h2>
          
          {stats.gamesHistory.map((game: CompletedGame) => (
            <div
              key={game.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🏆</span>
                    <span className="text-xl font-bold text-white">{game.winner.name}</span>
                  </div>
                  <p className="text-emerald-400 font-semibold">{game.winner.totalScore} puntos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">{formatDate(game.finishedAt)}</p>
                  <p className="text-sm text-slate-500">{game.rounds} rondas</p>
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-4">
                <p className="text-sm text-slate-400 mb-2">Jugadores:</p>
                <div className="flex flex-wrap gap-2">
                  {game.players
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((player, index) => (
                      <span
                        key={player.id}
                        className={`
                          px-3 py-1 rounded-full text-sm
                          ${index === 0 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : 'bg-slate-700/50 text-slate-300'
                          }
                        `}
                      >
                        {player.name}: {player.totalScore}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

