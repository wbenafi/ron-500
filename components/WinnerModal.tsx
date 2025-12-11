'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { Player } from '@/types/game';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface WinnerModalProps {
  winner: Player | null;
  onNewGame: () => void;
  onViewStats: () => void;
}

function generateConfetti() {
  const colors = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444'];
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    borderRadius: Math.random() > 0.5 ? '50%' : '0',
  }));
}

export default function WinnerModal({ winner, onNewGame, onViewStats }: WinnerModalProps) {
  const prevWinnerRef = useRef<Player | null>(null);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string; borderRadius: string }>>(() => {
    return winner ? generateConfetti() : [];
  });

  useEffect(() => {
    // Only regenerate confetti when winner changes
    if (winner && winner.id !== prevWinnerRef.current?.id) {
      prevWinnerRef.current = winner;
      startTransition(() => {
        setConfetti(generateConfetti());
      });
    } else if (!winner) {
      prevWinnerRef.current = null;
      startTransition(() => {
        setConfetti([]);
      });
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <Modal isOpen={!!winner} onClose={() => {}} size="md">
      {/* Confetti animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 animate-confetti"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              backgroundColor: particle.color,
              borderRadius: particle.borderRadius,
            }}
          />
        ))}
      </div>

      <div className="relative text-center py-6">
        <div className="text-8xl mb-6 animate-bounce">🏆</div>
        
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-yellow-300 mb-2">
          ¡Tenemos un ganador!
        </h2>
        
        <p className="text-5xl font-bold text-white mt-4 mb-2">
          {winner.name}
        </p>
        
        <p className="text-2xl text-emerald-400 font-semibold mb-8">
          {winner.totalScore} puntos
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Button variant="primary" size="lg" onClick={onNewGame} className="w-full">
            Nueva Partida
          </Button>
          <Button variant="secondary" onClick={onViewStats} className="w-full">
            Ver Estadísticas
          </Button>
        </div>
      </div>
    </Modal>
  );
}

