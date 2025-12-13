'use client';

import { Player } from '@/types/game';
import Button from './ui/Button';

interface ScoreBoardProps {
  players: Player[];
  targetScore?: number;
  onAddPlayer?: () => void;
}

export default function ScoreBoard({ players, targetScore = 500, onAddPlayer }: ScoreBoardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  
  const getPositionStyles = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-linear-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50';
      case 1:
        return 'bg-linear-to-r from-slate-400/20 to-gray-400/20 border-slate-400/50';
      case 2:
        return 'bg-linear-to-r from-orange-600/20 to-amber-600/20 border-orange-600/50';
      default:
        return 'bg-slate-800/50 border-slate-700/50';
    }
  };

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}`;
    }
  };

  const getProgressPercentage = (score: number) => {
    return Math.min((score / targetScore) * 100, 100);
  };


  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Puntuaciones
        </h2>
        {onAddPlayer && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddPlayer}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Jugador
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`
              relative overflow-hidden
              border rounded-xl p-4
              transition-all duration-300
              ${getPositionStyles(index)}
            `}
          >
            {/* Progress bar background */}
            <div
              className="absolute inset-0 bg-emerald-500/10 transition-all duration-500"
              style={{ width: `${getProgressPercentage(player.totalScore)}%` }}
            />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMedalEmoji(index)}</span>
                <span className="font-semibold text-white text-lg">{player.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`
                  text-2xl font-bold tabular-nums
                  ${player.totalScore === targetScore ? 'text-emerald-400' : 'text-white'}
                  ${player.totalScore < 0 ? 'text-rose-400' : ''}
                  ${player.totalScore > targetScore ? 'text-amber-400' : ''}
                `}>
                  {player.totalScore}
                </span>
                <span className="text-slate-500 text-sm">/ {targetScore}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

