import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import { useConfirm } from '@/hooks/useConfirm';
import { CompletedGame, GameStats } from '@/types/game';
import { clearStats, deleteGameFromStats, getStats } from '@/utils/storage';
import { colors, radii } from '@/constants/theme';

const EMPTY_STATS: GameStats = { gamesPlayed: 0, gamesHistory: [] };

export default function StatsScreen() {
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();
  const [stats, setStats] = useState<GameStats>(EMPTY_STATS);

  const loadStats = useCallback(async () => {
    const nextStats = await getStats();
    setStats(nextStats);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handleClearStats = async () => {
    const confirmed = await confirm({
      title: 'Eliminar todas las estadisticas',
      message: 'Seguro que quieres borrar todo el historial? Esta accion no se puede deshacer.',
      confirmText: 'Eliminar todo',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (confirmed) {
      await clearStats();
      setStats(EMPTY_STATS);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    const confirmed = await confirm({
      title: 'Eliminar partida',
      message: 'Seguro que quieres eliminar esta partida?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (confirmed) {
      await deleteGameFromStats(gameId);
      await loadStats();
    }
  };

  return (
    <>
      <Head>
        <title>RON 500 - Estadisticas</title>
        <meta
          name="description"
          content="Consulta historial de partidas, ganadores y resultados del RON 500."
        />
      </Head>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backLink} onPress={() => router.push('/')}>
          <MaterialIcons name="arrow-back" size={20} color={colors.muted} />
          <Text style={styles.backText}>Inicio</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <MaterialIcons name="bar-chart" size={24} color={colors.violet} />
          <Text style={styles.title}>Estadisticas</Text>
        </View>

        {stats.gamesPlayed > 0 ? (
          <Button variant="ghost" size="sm" onPress={handleClearStats}>
            Limpiar
          </Button>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryValue}>{stats.gamesPlayed}</Text>
        <Text style={styles.summaryLabel}>Partidas Totales</Text>
      </View>

      {stats.gamesHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="insights" size={64} color={colors.muted} />
          <Text style={styles.emptyTitle}>Sin partidas registradas</Text>
          <Text style={styles.emptyText}>Juega una partida completa para ver estadisticas</Text>
          <Button variant="primary" onPress={() => router.push('/')}>
            Iniciar Partida
          </Button>
        </View>
      ) : (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Historial de Partidas</Text>

          {stats.gamesHistory.map((game: CompletedGame) => (
            <View key={game.id} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <View style={styles.winnerBlock}>
                  <View style={styles.winnerNameRow}>
                    <MaterialIcons name="emoji-events" size={24} color="#fbbf24" />
                    <Text style={styles.winnerName}>{game.winner.name}</Text>
                  </View>
                  <Text style={styles.winnerScore}>{game.winner.totalScore} puntos</Text>
                </View>

                <View style={styles.headerRight}>
                  <View style={styles.gameMeta}>
                    <Text style={styles.metaText}>{formatDate(game.finishedAt)}</Text>
                    <Text style={styles.metaSubText}>{game.rounds} rondas</Text>
                  </View>

                  <Pressable style={styles.deleteButton} onPress={() => handleDeleteGame(game.id)}>
                    <MaterialIcons name="delete-outline" size={20} color={colors.rose} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.playersWrap}>
                {game.players
                  .slice()
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((player, index) => (
                    <View key={player.id} style={[styles.playerPill, index === 0 ? styles.playerPillWinner : null]}>
                      <Text style={[styles.playerPillText, index === 0 ? styles.playerPillTextWinner : null]}>
                        {player.name}: {player.totalScore}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          ))}
        </View>
      )}

      <ConfirmDialog />
    </ScrollView>
    </>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  screen: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
    gap: 14,
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: colors.muted,
    fontSize: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 56,
  },
  summaryCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.45)',
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingVertical: 24,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    color: '#f8fafc',
    fontSize: 52,
    fontWeight: '800',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  emptyState: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(30,41,59,0.45)',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 4,
  },
  historySection: {
    gap: 10,
  },
  historyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  gameCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(30,41,59,0.6)',
    padding: 14,
    gap: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  winnerBlock: {
    gap: 4,
    flexShrink: 1,
  },
  winnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  winnerName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  winnerScore: {
    color: '#6ee7b7',
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameMeta: {
    alignItems: 'flex-end',
    gap: 1,
  },
  metaText: {
    color: colors.muted,
    fontSize: 12,
  },
  metaSubText: {
    color: '#64748b',
    fontSize: 12,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(244,63,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerPill: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  playerPillWinner: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.45)',
  },
  playerPillText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  playerPillTextWinner: {
    color: '#fcd34d',
  },
});
