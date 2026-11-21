import { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

// Registers the worker, then tells it which files the running app loaded (fonts, icons) so they work offline too.
const registerServiceWorker = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then(function () { return navigator.serviceWorker.ready; })
      .then(function (registration) {
        var report = function () {
          var urls = performance.getEntriesByType('resource').map(function (entry) { return entry.name; });
          if (registration.active) registration.active.postMessage({ type: 'CACHE_URLS', urls: urls });
        };
        report();
        setTimeout(report, 4000);
      })
      .catch(function () {});
  });
}
`;

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

        {/* Installable web app: manifest, theme colour and home screen icons (iOS ignores the manifest icons). */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="RON 500" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        {/* Offline support. Production builds only, so the dev server never serves stale files. */}
        {process.env.NODE_ENV === 'production' && (
          <script dangerouslySetInnerHTML={{ __html: registerServiceWorker }} />
        )}
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                scrollbar-gutter: stable;
                background: #0f172a;
                overflow: hidden;
              }

              body {
                position: fixed;
                inset: 0;
              }

              #root, #expo-root, [data-expo-root] {
                height: 100vh;
                height: 100lvh;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
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
