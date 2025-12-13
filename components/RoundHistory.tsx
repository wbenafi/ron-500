'use client';

import { Round, Player, PlayerAddedEvent, GameEvent } from '@/types/game';
import Button from './ui/Button';

interface RoundHistoryProps {
  rounds: Round[];
  players: Player[];
  playerAddedEvents: PlayerAddedEvent[];
  onUndo: () => void;
  winningScore: number;
}

export default function RoundHistory({ rounds, players, playerAddedEvents, onUndo, winningScore }: RoundHistoryProps) {
  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Desconocido';
  };

  // Combine rounds and player added events, sorted by timestamp
  const allEvents: GameEvent[] = [
    ...rounds,
    ...playerAddedEvents,
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎴</div>
        <p className="text-slate-400">No hay rondas registradas</p>
        <p className="text-slate-500 text-sm mt-1">Agrega puntos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Historial
        </h2>
        
        {rounds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            className="text-rose-400 hover:text-rose-300"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Deshacer
          </Button>
        )}
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {[...allEvents].reverse().map((event) => {
          // Check if it's a player added event
          if ('type' in event && event.type === 'player_added') {
            const playerEvent = event as PlayerAddedEvent;
            return (
              <div
                key={playerEvent.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-400">
                      + Jugador agregado
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(playerEvent.timestamp).toLocaleTimeString('es', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="bg-slate-900/50 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm font-medium">
                      {playerEvent.playerName}
                    </span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {playerEvent.initialScore}
                    </span>
                  </div>
                </div>
              </div>
            );
          }
          
          // It's a round
          const round = event as Round;
          return (
            <div
              key={round.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-emerald-400">
                  Ronda {round.roundNumber}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(round.timestamp).toLocaleTimeString('es', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(round.scores).map(([playerId, score]) => {
                  const wasIgnored = round.ignoredScores?.[playerId] || false;
                  return (
                    <div
                      key={playerId}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 relative ${
                        wasIgnored 
                          ? 'bg-amber-500/10 border border-amber-500/30' 
                          : 'bg-slate-900/50'
                      }`}
                    >
                      <span className="text-slate-300 text-sm truncate">
                        {getPlayerName(playerId)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`
                          font-bold tabular-nums
                          ${wasIgnored ? 'text-amber-400 line-through opacity-60' : ''}
                          ${!wasIgnored && score > 0 ? 'text-emerald-400' : ''}
                          ${!wasIgnored && score < 0 ? 'text-rose-400' : ''}
                          ${!wasIgnored && score === 0 ? 'text-slate-400' : ''}
                        `}>
                          {score > 0 ? '+' : ''}{score}
                        </span>
                        {wasIgnored && (
                          <span 
                            className="text-amber-400 text-xs" 
                            title={`Estos puntos no se sumaron porque superarían ${winningScore}`}
                          >
                            ⚠️
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

