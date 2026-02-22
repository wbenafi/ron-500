import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Player } from '@/types/game';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { colors, radii } from '@/constants/theme';

interface RoundInputProps {
  players: Player[];
  roundNumber: number;
  onSubmit: (scores: Record<string, number>) => void;
  isOpen: boolean;
  onClose: () => void;
  winningScore: number;
}

function createDefaultScores(players: Player[]) {
  return Object.fromEntries(players.map((player) => [player.id, ''])) as Record<string, string>;
}

export default function RoundInput({
  players,
  roundNumber,
  onSubmit,
  isOpen,
  onClose,
  winningScore,
}: RoundInputProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 760;

  const [scores, setScores] = useState<Record<string, string>>(() => createDefaultScores(players));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setScores(createDefaultScores(players));
      setCurrentIndex(0);
    }
  }, [isOpen, players]);

  useEffect(() => {
    if (currentIndex >= players.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, players.length]);

  const visiblePlayers = useMemo(() => {
    if (!isCompact) {
      return players;
    }

    return players.slice(currentIndex, currentIndex + 1);
  }, [isCompact, players, currentIndex]);

  const isLastCompactPlayer = isCompact && currentIndex === players.length - 1;

  const updateScore = (playerId: string, value: string) => {
    if (value === '' || value === '-' || /^-?\d*$/.test(value)) {
      setScores((current) => ({ ...current, [playerId]: value }));
    }
  };

  const handleQuickScore = (playerId: string, amount: number) => {
    const current = scores[playerId];
    const currentNumeric = current && current !== '-' ? parseInt(current, 10) || 0 : 0;
    setScores((stored) => ({ ...stored, [playerId]: String(currentNumeric + amount) }));
  };

  const handleSubmit = () => {
    const numericScores: Record<string, number> = {};

    for (const player of players) {
      const rawValue = scores[player.id];
      numericScores[player.id] = rawValue === '' || rawValue === '-' ? 0 : parseInt(rawValue, 10);
    }

    onSubmit(numericScores);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ronda ${roundNumber}`} size="md">
      <View style={styles.container}>
        <Text style={styles.caption}>
          Ingresa puntos por jugador. Se permiten negativos.
        </Text>
        <Text style={styles.warning}>
          Si un jugador supera {winningScore}, esos puntos se ignoran. Solo se gana con {winningScore} exactos.
        </Text>

        {isCompact && players.length > 0 ? (
          <View style={styles.chipsWrapper}>
            {players.map((player, index) => {
              const raw = scores[player.id];
              const empty = raw === '' || raw === '-' || raw == null;
              const display = index > currentIndex && empty ? '...' : empty ? '0' : raw;

              return (
                <Pressable
                  key={player.id}
                  onPress={() => setCurrentIndex(index)}
                  style={[styles.chip, index === currentIndex ? styles.chipActive : null]}
                >
                  <Text style={[styles.chipText, index === currentIndex ? styles.chipTextActive : null]}>
                    {player.name}: {display}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.playersList}>
          {visiblePlayers.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerHeader}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerCurrent}>Actual: {player.totalScore}</Text>
              </View>

              <TextInput
                value={scores[player.id] ?? ''}
                onChangeText={(value) => updateScore(player.id, value)}
                keyboardType="numbers-and-punctuation"
                placeholder="0"
                placeholderTextColor={colors.muted}
                style={styles.scoreInput}
              />

              <View style={styles.quickActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => handleQuickScore(player.id, -10)}
                  style={[styles.quickButton, styles.quickButtonNegative]}
                  textStyle={styles.quickNegativeText}
                >
                  -10
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => handleQuickScore(player.id, -5)}
                  style={[styles.quickButton, styles.quickButtonNegative]}
                  textStyle={styles.quickNegativeText}
                >
                  -5
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => handleQuickScore(player.id, 5)}
                  style={[styles.quickButton, styles.quickButtonPositive]}
                  textStyle={styles.quickPositiveText}
                >
                  +5
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => handleQuickScore(player.id, 10)}
                  style={[styles.quickButton, styles.quickButtonPositive]}
                  textStyle={styles.quickPositiveText}
                >
                  +10
                </Button>
              </View>
            </View>
          ))}
        </View>

        {isCompact ? (
          <View style={styles.compactActions}>
            {currentIndex > 0 ? (
              <Button variant="ghost" onPress={() => setCurrentIndex((index) => Math.max(0, index - 1))} style={styles.actionButton}>
                Anterior
              </Button>
            ) : null}
            <Button
              variant="primary"
              onPress={isLastCompactPlayer ? handleSubmit : () => setCurrentIndex((index) => Math.min(players.length - 1, index + 1))}
              style={styles.actionButton}
            >
              {isLastCompactPlayer ? 'Guardar Ronda' : 'Siguiente'}
            </Button>
          </View>
        ) : (
          <View style={styles.actions}>
            <Button variant="ghost" onPress={onClose} style={styles.actionButton}>
              Cancelar
            </Button>
            <Button variant="primary" onPress={handleSubmit} style={styles.actionButton}>
              Guardar Ronda
            </Button>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  caption: {
    color: colors.muted,
    fontSize: 13,
  },
  warning: {
    color: colors.warning,
    fontSize: 12,
    lineHeight: 18,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: colors.emerald,
    backgroundColor: 'rgba(16,185,129,0.14)',
  },
  chipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#a7f3d0',
  },
  playersList: {
    gap: 10,
  },
  playerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
    gap: 10,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
  playerCurrent: {
    color: colors.muted,
    fontSize: 12,
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#0b1528',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 6,
  },
  quickButton: {
    flex: 1,
  },
  quickButtonNegative: {
    backgroundColor: 'rgba(244,63,94,0.10)',
    borderColor: 'rgba(244,63,94,0.28)',
  },
  quickButtonPositive: {
    backgroundColor: 'rgba(16,185,129,0.10)',
    borderColor: 'rgba(16,185,129,0.28)',
  },
  quickNegativeText: {
    color: '#fda4af',
  },
  quickPositiveText: {
    color: '#6ee7b7',
  },
  compactActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
  },
});
