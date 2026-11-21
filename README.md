# RON 500 (React Native + Expo)

Aplicacion mobile para llevar el conteo de puntos de RON 500 en Android e iOS.

## Stack

- Expo + Expo Router
- React Native + TypeScript
- AsyncStorage para persistencia local

## Correr el proyecto

```bash
npm install
npm run start
```

Luego abre:

- `a` para Android
- `i` para iOS (macOS)
- Escanea QR con Expo Go

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
```

## Estructura principal

- `app/index.tsx` - Pantalla principal
- `app/game.tsx` - Partida activa
- `app/stats.tsx` - Estadisticas
- `context/GameContext.tsx` - Estado global del juego
- `utils/storage.ts` - Persistencia AsyncStorage

## Instalar como app (PWA)

RON 500 es una aplicación web progresiva: abre el sitio publicado en tu celular y agrégalo a la pantalla de inicio (Android Chrome: menú → *Instalar app*; iPhone Safari: Compartir → *Añadir a pantalla de inicio*). Después de abrirla una vez con internet, también funciona sin conexión.

El service worker (`public/sw.js`) solo se registra en el build de producción. Para probarlo localmente: `npx expo export --platform web && npx serve -s dist`. Sube `VERSION` en `public/sw.js` para forzar que las apps instaladas renueven su caché.
