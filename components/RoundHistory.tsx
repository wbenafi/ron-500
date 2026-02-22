import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameEvent, Player, PlayerAddedEvent, Round } from '@/types/game';
import Button from '@/components/ui/Button';
import { colors, radii } from '@/constants/theme';

interface RoundHistoryProps {
  rounds: Round[];
  players: Player[];
  playerAddedEvents: PlayerAddedEvent[];
  onUndo: () => void;
  winningScore: number;
}

export default function RoundHistory({
  rounds,
  players,
  playerAddedEvents,
  onUndo,
  winningScore,
}: RoundHistoryProps) {
  const getPlayerName = (playerId: string) => {
    return players.find((player) => player.id === playerId)?.name || 'Desconocido';
  };

  const allEvents: GameEvent[] = [...rounds, ...playerAddedEvents].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (allEvents.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="history-toggle-off" size={48} color={colors.muted} />
        <Text style={styles.emptyTitle}>No hay rondas registradas</Text>
        <Text style={styles.emptyHint}>Agrega puntos para empezar</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialIcons name="history" size={24} color={colors.violet} />
          <Text style={styles.title}>Historial</Text>
        </View>
        {rounds.length > 0 ? (
          <Button variant="ghost" size="sm" onPress={onUndo} textStyle={styles.undoText}>
            Deshacer
          </Button>
        ) : null}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {[...allEvents].reverse().map((event) => {
          if ('type' in event && event.type === 'player_added') {
            const playerEvent = event as PlayerAddedEvent;

            return (
              <View key={playerEvent.id} style={styles.eventCard}>
                <View style={styles.eventHead}>
                  <Text style={styles.playerAddedLabel}>+ Jugador agregado</Text>
                  <Text style={styles.eventTime}>{formatTime(playerEvent.timestamp)}</Text>
                </View>
                <View style={styles.playerAddedRow}>
                  <Text style={styles.playerAddedName}>{playerEvent.playerName}</Text>
                  <Text style={styles.playerAddedScore}>{playerEvent.initialScore}</Text>
                </View>
              </View>
            );
          }

          const round = event as Round;

          return (
            <View key={round.id} style={styles.eventCard}>
              <View style={styles.eventHead}>
                <Text style={styles.roundLabel}>Ronda {round.roundNumber}</Text>
                <Text style={styles.eventTime}>{formatTime(round.timestamp)}</Text>
              </View>

              <View style={styles.scoresGrid}>
                {Object.entries(round.scores).map(([playerId, score]) => {
                  const wasIgnored = round.ignoredScores?.[playerId] || false;

                  return (
                    <View
                      key={playerId}
                      style={[styles.scoreRow, wasIgnored ? styles.scoreRowIgnored : null]}
                    >
                      <Text numberOfLines={1} style={styles.scorePlayerName}>
                        {getPlayerName(playerId)}
                      </Text>

                      <View style={styles.scoreValueRow}>
                        <Text
                          style={[
                            styles.scoreValue,
                            score > 0 && !wasIgnored ? styles.scorePositive : null,
                            score < 0 && !wasIgnored ? styles.scoreNegative : null,
                            score === 0 && !wasIgnored ? styles.scoreZero : null,
                            wasIgnored ? styles.scoreIgnored : null,
                          ]}
                        >
                          {score > 0 ? '+' : ''}
                          {score}
                        </Text>
                        {wasIgnored ? (
                          <MaterialIcons
                            name="warning-amber"
                            size={14}
                            color={colors.warning}
                            accessibilityLabel={`Puntos ignorados por superar ${winningScore}`}
                          />
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  undoText: {
    color: '#fda4af',
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 30,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
  emptyHint: {
    color: colors.muted,
  },
  eventCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 10,
  },
  eventHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundLabel: {
    color: '#6ee7b7',
    fontWeight: '700',
    fontSize: 14,
  },
  eventTime: {
    color: colors.muted,
    fontSize: 12,
  },
  playerAddedLabel: {
    color: '#6ee7b7',
    fontWeight: '700',
  },
  playerAddedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0b1528',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  playerAddedName: {
    color: colors.text,
    fontWeight: '600',
  },
  playerAddedScore: {
    color: '#6ee7b7',
    fontWeight: '700',
  },
  scoresGrid: {
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.sm,
    backgroundColor: '#0b1528',
  },
  scoreRowIgnored: {
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  scorePlayerName: {
    color: colors.text,
    fontSize: 13,
    flex: 1,
    marginRight: 10,
  },
  scoreValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  scorePositive: {
    color: '#6ee7b7',
  },
  scoreNegative: {
    color: '#fda4af',
  },
  scoreZero: {
    color: colors.muted,
  },
  scoreIgnored: {
    color: colors.warning,
    textDecorationLine: 'line-through',
  },
});