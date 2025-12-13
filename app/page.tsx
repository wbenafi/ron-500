"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PlayerSetup from "@/components/PlayerSetup";
import { useGame } from "@/context/GameContext";
import { loadCurrentGame, getStats } from "@/utils/storage";

export default function Home() {
  const router = useRouter();
  const { startNewGame, loadSavedGame, state } = useGame();
  const [showSetup, setShowSetup] = useState(false);
  // Use lazy initialization to avoid calling setState in useEffect
  const [hasSavedGame] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!loadCurrentGame();
  });
  const [stats] = useState(() => {
    if (typeof window === "undefined") return { gamesPlayed: 0 };
    return getStats();
  });
  
  // Get winning score from saved game or default to 500
  const savedGame = typeof window !== "undefined" ? loadCurrentGame() : null;
  const displayWinningScore = savedGame?.winningScore || state.winningScore || 500;

  const handleStartGame = (players: string[], winningScore: number) => {
    startNewGame(players, winningScore);
    router.push("/game");
  };

  const handleContinueGame = () => {
    loadSavedGame();
    router.push("/game");
  };

  return (
    <>
      <main className="h-full flex flex-col items-center justify-center p-6 pb-20">
        {!showSetup ? (
          <div className="text-center max-w-lg">
            {/* Logo/Title */}
            <div className="mb-8">
              <div className="text-7xl mb-4">🃏</div>
              <h1 className="text-5xl font-bold gradient-text mb-3">RON {displayWinningScore}</h1>
              <p className="text-slate-400 text-lg">
                Contador de puntos para tu partida
              </p>
            </div>

            {/* Target info */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-400">{displayWinningScore}</p>
                  <p className="text-sm text-slate-400">Puntos para ganar</p>
                </div>
                <div className="w-px h-12 bg-slate-700" />
                <div className="text-center">
                  <p className="text-4xl font-bold text-violet-400">
                    {stats.gamesPlayed}
                  </p>
                  <p className="text-sm text-slate-400">Partidas jugadas</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowSetup(true)}
                className="w-full"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Nueva Partida
              </Button>

              {hasSavedGame && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleContinueGame}
                  className="w-full"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Continuar Partida
                </Button>
              )}

              <Link href="/stats" className="w-full">
                <Button variant="ghost" className="w-full">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Estadísticas
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <button
              onClick={() => setShowSetup(false)}
              className="mb-6 flex items-center text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver
            </button>

            <PlayerSetup onStart={handleStartGame} />
          </div>
        )}
      </main>
    </>
  );
}
