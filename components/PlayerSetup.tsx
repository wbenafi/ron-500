'use client';

import { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

interface PlayerSetupProps {
  onStart: (players: string[], winningScore: number) => void;
}

export default function PlayerSetup({ onStart }: PlayerSetupProps) {
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [winningScore, setWinningScore] = useState<string>('500');
  const [error, setError] = useState('');

  const addPlayer = () => {
    setPlayers([...players, '']);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, name: string) => {
    const updated = [...players];
    updated[index] = name;
    setPlayers(updated);
    setError('');
  };

  const handleStart = () => {
    const validPlayers = players.map(p => p.trim()).filter(p => p !== '');
    
    if (validPlayers.length < 2) {
      setError('Se necesitan al menos 2 jugadores');
      return;
    }
    
    const uniqueNames = new Set(validPlayers.map(p => p.toLowerCase()));
    if (uniqueNames.size !== validPlayers.length) {
      setError('Los nombres de los jugadores deben ser únicos');
      return;
    }

    const score = parseInt(winningScore, 10);
    if (isNaN(score) || score <= 0) {
      setError('El máximo de puntos debe ser un número mayor a 0');
      return;
    }
    
    onStart(validPlayers, score);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-linear-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Nueva Partida
        </h2>

        {/* Winning Score Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Puntos para ganar
          </label>
          <input
            type="number"
            min="1"
            value={winningScore}
            onChange={(e) => {
              setWinningScore(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-center text-xl font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="500"
          />
        </div>

        <h3 className="text-lg font-bold text-white mb-6 text-center">
          Jugadores
        </h3>
        
        <div className="space-y-4 mb-6">
          {players.map((player, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder={`Jugador ${index + 1}`}
                  value={player}
                  onChange={(e) => updatePlayer(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (index === players.length - 1) {
                        addPlayer();
                      }
                    }
                  }}
                />
              </div>
              {players.length > 2 && (
                <button
                  onClick={() => removePlayer(index)}
                  className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  aria-label="Eliminar jugador"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-rose-400 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            onClick={addPlayer}
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Jugador
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            onClick={handleStart}
            className="w-full"
          >
            Iniciar Partida
          </Button>
        </div>
      </div>
    </div>
  );
}

