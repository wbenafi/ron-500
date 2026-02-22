import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Player } from '@/types/game';
import Button from '@/components/ui/Button';
import { colors, radii } from '@/constants/theme';

interface ScoreBoardProps {
  players: Player[];
  targetScore?: number;
  onAddPlayer?: () => void;
}

function getCardStyle(index: number) {
  if (index === 0) {
    return {
      backgroundColor: 'rgba(245,158,11,0.14)',
      borderColor: 'rgba(245,158,11,0.4)',
    };
  }

  if (index === 1) {
    return {
      backgroundColor: 'rgba(148,163,184,0.16)',
      borderColor: 'rgba(148,163,184,0.45)',
    };
  }

  if (index === 2) {
    return {
      backgroundColor: 'rgba(249,115,22,0.16)',
      borderColor: 'rgba(249,115,22,0.45)',
    };
  }

  return {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  };
}

function getBadge(index: number) {
  if (index <= 2) {
    return (
      <MaterialIcons
        name="emoji-events"
        size={22}
        color={index === 0 ? '#fbbf24' : index === 1 ? '#cbd5e1' : '#fb923c'}
      />
    );
  }

  return <Text style={styles.positionText}>{index + 1}</Text>;
}

export default function ScoreBoard({ players, targetScore = 500, onAddPlayer }: ScoreBoardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialIcons name="leaderboard" size={24} color={colors.emerald} />
          <Text style={styles.title}>Puntuaciones</Text>
        </View>
        {onAddPlayer ? (
          <Button variant="ghost" size="sm" onPress={onAddPlayer}>
            <>
              <MaterialIcons name="person-add-alt-1" size={16} color="#6ee7b7" />
              <Text style={styles.addPlayerText}>Agregar Jugador</Text>
            </>
          </Button>
        ) : null}
      </View>

      <View style={styles.list}>
        {sortedPlayers.map((player, index) => {
          const progress = Math.min((player.totalScore / targetScore) * 100, 100);

          return (
            <View key={player.id} style={[styles.card, getCardStyle(index)]}>
              <View style={[styles.progress, { width: `${progress}%` }]} />
              <View style={styles.cardContent}>
                <View style={styles.playerIdentity}>
                  {getBadge(index)}
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.name}
                  </Text>
                </View>
                <View style={styles.scoreBlock}>
                  <Text
                    style={[
                      styles.score,
                      player.totalScore < 0 ? styles.scoreNegative : null,
                      player.totalScore === targetScore ? styles.scoreWinner : null,
                    ]}
                  >
                    {player.totalScore}
                  </Text>
                  <Text style={styles.scoreLimit}>/ {targetScore}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
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
  list: {
    gap: 10,
  },
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  playerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  positionText: {
    color: colors.muted,
    fontWeight: '700',
    width: 22,
    textAlign: 'center',
  },
  playerName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 1,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  score: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 28,
  },
  scoreWinner: {
    color: colors.emerald,
  },
  scoreNegative: {
    color: colors.rose,
  },
  scoreLimit: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 4,
  },
  addPlayerText: {
    color: '#6ee7b7',
    fontSize: 14,
    fontWeight: '600',
  },
});
