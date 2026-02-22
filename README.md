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