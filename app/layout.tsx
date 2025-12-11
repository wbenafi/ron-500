import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RON 500 - Contador de Puntos",
  description: "Aplicación para llevar el conteo de puntos del juego de cartas RON 500",
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-slate-900 h-dvh`}
      >
        <GameProvider>
          <div className="h-dvh bg-grid-pattern flex flex-col">
            <div className="fixed inset-0 bg-linear-to-br from-emerald-900/20 via-transparent to-violet-900/20 pointer-events-none" />
            <div className="relative flex-1">
              {children}
            </div>
          </div>
        </GameProvider>
      </body>
    </html>
  );
}
