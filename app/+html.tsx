import { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <title>RON 500 - Contador de Puntos</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta
          name="description"
          content="RON 500 es una aplicacion para llevar el conteo de puntos, rondas y estadisticas de tus partidas de cartas."
        />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content="RON 500 - Contador de Puntos" />
        <meta
          property="og:description"
          content="Controla rondas, puntajes y resultados en tus partidas de RON 500 desde una app simple y rapida."
        />
        <meta property="og:type" content="website" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                min-height: 100%;
                background: #0f172a;
              }

              #root, #expo-root, [data-expo-root] {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                background: #0f172a;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
