'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface RoundInputProps {
  players: Player[];
  roundNumber: number;
  onSubmit: (scores: Record<string, number>) => void;
  isOpen: boolean;
  onClose: () => void;
  winningScore: number;
}

export default function RoundInput({ players, roundNumber, onSubmit, isOpen, onClose, winningScore }: RoundInputProps) {
  const [scores, setScores] = useState<Record<string, string>>(() => 
    Object.fromEntries(players.map(p => [p.id, '']))
  );

  const updateScore = (playerId: string, value: string) => {
    // Allow negative numbers and empty string
    if (value === '' || value === '-' || /^-?\d*$/.test(value)) {
      setScores(prev => ({ ...prev, [playerId]: value }));
    }
  };

  const handleSubmit = () => {
    const numericScores: Record<string, number> = {};
    
    for (const player of players) {
      const value = scores[player.id];
      numericScores[player.id] = value === '' || value === '-' ? 0 : parseInt(value, 10);
    }
    
    onSubmit(numericScores);
    setScores(Object.fromEntries(players.map(p => [p.id, ''])));
    onClose();
  };

  const handleQuickScore = (playerId: string, amount: number) => {
    const current = !scores[playerId] || scores[playerId] === '' || scores[playerId] === '-' ? 0 : parseInt(scores[playerId], 10);
    setScores(prev => ({ ...prev, [playerId]: String(current + amount) }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ronda ${roundNumber}`} size="md">
      <div className="space-y-4 sm:space-y-5">
        <p className="text-slate-400 text-xs sm:text-sm px-1">
          Ingresa los puntos de cada jugador para esta ronda. Puedes usar números negativos.
        </p>
        <p className="text-amber-400/80 text-xs px-1 -mt-2">
          ⚠️ Si al sumar superas {winningScore}, esos puntos no contarán. Solo ganas con exactamente {winningScore}.
        </p>
        
        {players.map((player) => (
          <div key={player.id} className="space-y-3">
            <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-white font-medium gap-1">
              <span className="text-base sm:text-lg">{player.name}</span>
              <span className="text-xs sm:text-sm text-slate-400">
                Actual: {player.totalScore}
              </span>
            </label>
            
            {/* Mobile: input on top, buttons below. Desktop: buttons on sides */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
              {/* Negative buttons - left side on desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickScore(player.id, -10)}
                  className="px-2 py-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 active:bg-rose-500/40 transition-colors text-base font-medium touch-manipulation"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScore(player.id, -5)}
                  className="px-2 py-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 active:bg-rose-500/40 transition-colors text-base font-medium touch-manipulation"
                >
                  -5
                </button>
              </div>
              
              {/* Input - full width on mobile, flex-1 on desktop */}
              <input
                type="text"
                inputMode="numeric"
                value={scores[player.id] ?? '0'}
                onChange={(e) => updateScore(player.id, e.target.value)}
                placeholder="0"
                className="w-full sm:flex-1 px-3 sm:px-4 py-3 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-center text-xl sm:text-lg font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[48px] touch-manipulation"
              />
              
              {/* Positive buttons - right side on desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickScore(player.id, 5)}
                  className="px-2 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 active:bg-emerald-500/40 transition-colors text-base font-medium touch-manipulation"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScore(player.id, 10)}
                  className="px-2 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 active:bg-emerald-500/40 transition-colors text-base font-medium touch-manipulation"
                >
                  +10
                </button>
              </div>
              
              {/* All buttons below input on mobile */}
              <div className="flex sm:hidden items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickScore(player.id, -10)}
                  className="flex-1 px-3 py-2.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 active:bg-rose-500/40 transition-colors text-sm font-medium touch-manipulation"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScore(player.id, -5)}
                  className="flex-1 px-3 py-2.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 active:bg-rose-500/40 transition-colors text-sm font-medium touch-manipulation"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScore(player.id, 5)}
                  className="flex-1 px-3 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 active:bg-emerald-500/40 transition-colors text-sm font-medium touch-manipulation"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScore(player.id, 10)}
                  className="flex-1 px-3 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 active:bg-emerald-500/40 transition-colors text-sm font-medium touch-manipulation"
                >
                  +10
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6">
          <Button variant="ghost" onClick={onClose} className="flex-1 w-full sm:w-auto min-h-[48px] text-base touch-manipulation">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1 w-full sm:w-auto min-h-[48px] text-base touch-manipulation">
            Guardar Ronda
          </Button>
        </div>
      </div>
    </Modal>
  );
}

