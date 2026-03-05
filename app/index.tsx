import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { Image, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useGame } from '@/context/GameContext';
import { getStats, loadCurrentGame } from '@/utils/storage';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PlayerSetup from '@/components/PlayerSetup';
import { colors, radii } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { startNewGame, loadSavedGame, state, hydrated } = useGame();
  const [showSetup, setShowSetup] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [savedWinningScore, setSavedWinningScore] = useState<number | null>(null);

  const displayWinningScore = useMemo(() => {
    return savedWinningScore || state.winningScore || 500;
  }, [savedWinningScore, state.winningScore]);

  const refreshHomeData = useCallback(async () => {
    const [saved, stats] = await Promise.all([loadCurrentGame(), getStats()]);
    setHasSavedGame(!!saved);
    setSavedWinningScore(saved?.winningScore || null);
    setGamesPlayed(stats.gamesPlayed);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshHomeData();
    }, [refreshHomeData])
  );

  const handleStartGame = (players: string[], winningScore: number) => {
    setShowSetup(false);
    startNewGame(players, winningScore);
    router.push('/game');
  };

  const handleContinueGame = async () => {
    const loaded = await loadSavedGame();
    if (loaded) {
      router.push('/game');
    }
  };

  return (
    <>
      <Head>
        <title>RON 500 - Inicio</title>
        <meta
          name="description"
          content="Inicia una partida de RON 500, continua juegos guardados y revisa tus estadisticas."
        />
      </Head>

      {!hydrated ? (
        <View style={styles.loadingScreen}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.screen}>
          <View style={styles.homeContainer}>
        <View style={styles.logoBlock}>
          <View style={styles.logoCircle}>
            <Image source={require('@/assets/icon.png')} style={styles.logoImage} />
          </View>
          <Text style={styles.title}>RON {displayWinningScore}</Text>
          <Text style={styles.subtitle}>Contador de puntos para tu partida</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsCol}>
            <Text style={styles.statsValue}>{displayWinningScore}</Text>
            <Text style={styles.statsLabel}>Puntos para ganar</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statsCol}>
            <Text style={[styles.statsValue, styles.statsValueViolet]}>{gamesPlayed}</Text>
            <Text style={styles.statsLabel}>Partidas jugadas</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button variant="primary" size="lg" onPress={() => setShowSetup(true)}>
            <>
              <MaterialIcons name="add-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.actionPrimaryText}>Nueva Partida</Text>
            </>
          </Button>

          {hasSavedGame ? (
            <Button variant="secondary" size="lg" onPress={handleContinueGame}>
              <>
                <MaterialIcons name="play-circle-outline" size={18} color={colors.text} />
                <Text style={styles.actionSecondaryText}>Continuar Partida</Text>
              </>
            </Button>
          ) : null}

          <Button variant="ghost" onPress={() => router.push('/stats')}>
            <>
              <MaterialIcons name="insights" size={18} color={colors.muted} />
              <Text style={styles.actionGhostText}>Estadisticas</Text>
            </>
          </Button>
        </View>
      </View>

          <Modal isOpen={showSetup} onClose={() => setShowSetup(false)} title="Nueva Partida" size="md">
            <PlayerSetup onStart={handleStartGame} inModal />
          </Modal>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.muted,
    fontSize: 16,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  screen: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
    paddingBottom: 80,
  },
  homeContainer: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 18,
  },
  logoBlock: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.45)',
    backgroundColor: 'rgba(16,185,129,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoImage: {
    width: 78,
    height: 78,
    borderRadius: 16,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 16,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(30,41,59,0.55)',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  statsCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statsValue: {
    color: '#6ee7b7',
    fontSize: 36,
    fontWeight: '800',
  },
  statsValueViolet: {
    color: '#c4b5fd',
  },
  statsLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: colors.border,
  },
  actions: {
    gap: 10,
  },
  actionPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionSecondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  actionGhostText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '700',
  },
});
