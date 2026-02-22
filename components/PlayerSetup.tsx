import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { colors, radii, shadows } from '@/constants/theme';

interface PlayerSetupProps {
  onStart: (players: string[], winningScore: number) => void;
  inModal?: boolean;
}

export default function PlayerSetup({ onStart, inModal = false }: PlayerSetupProps) {
  const [players, setPlayers] = useState<string[]>(['', '', '', '']);
  const [winningScore, setWinningScore] = useState('500');
  const [error, setError] = useState('');

  const addPlayer = () => {
    setPlayers((current) => [...current, '']);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) {
      return;
    }

    setPlayers((current) => current.filter((_, playerIndex) => playerIndex !== index));
  };

  const updatePlayer = (index: number, name: string) => {
    setPlayers((current) => {
      const next = [...current];
      next[index] = name;
      return next;
    });
    setError('');
  };

  const handleStart = () => {
    const validPlayers = players.map((player) => player.trim()).filter((player) => player !== '');

    if (validPlayers.length < 2) {
      setError('Se necesitan al menos 2 jugadores');
      return;
    }

    const uniqueNames = new Set(validPlayers.map((player) => player.toLowerCase()));
    if (uniqueNames.size !== validPlayers.length) {
      setError('Los nombres deben ser unicos');
      return;
    }

    const score = parseInt(winningScore, 10);
    if (Number.isNaN(score) || score <= 0) {
      setError('La meta debe ser mayor que 0');
      return;
    }

    onStart(validPlayers, score);
  };

  return (
    <View style={styles.wrapper}>
      <View style={inModal ? styles.modalContent : styles.card}>
        {!inModal ? <Text style={styles.title}>Nueva Partida</Text> : null}

        <Text style={styles.sectionTitle}>Puntos para ganar</Text>
        <TextInput
          value={winningScore}
          onChangeText={(value) => {
            if (value === '' || /^\d*$/.test(value)) {
              setWinningScore(value);
              setError('');
            }
          }}
          keyboardType="number-pad"
          style={styles.winningInput}
          placeholder="500"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.sectionTitle}>Jugadores</Text>
        <View style={styles.playersList}>
          {players.map((player, index) => (
            <View key={`player-${index}`} style={styles.playerRow}>
              <Input
                containerStyle={styles.playerInput}
                value={player}
                placeholder={`Jugador ${index + 1}`}
                onChangeText={(value) => updatePlayer(index, value)}
                autoCapitalize="words"
                returnKeyType={index === players.length - 1 ? 'done' : 'next'}
              />
              {players.length > 2 ? (
                <Pressable onPress={() => removePlayer(index)} style={styles.removeButton}>
                  <MaterialIcons name="delete-outline" size={20} color={colors.rose} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button variant="ghost" onPress={addPlayer}>
            <>
              <MaterialIcons name="person-add-alt-1" size={18} color={colors.muted} />
              <Text style={styles.secondaryActionText}>Agregar Jugador</Text>
            </>
          </Button>
          <Button variant="primary" size="lg" onPress={handleStart}>
            Iniciar Partida
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(15,23,42,0.82)',
    padding: 20,
    gap: 14,
    ...shadows.card,
  },
  modalContent: {
    gap: 14,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  winningInput: {
    borderRadius: radii.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  playersList: {
    gap: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  playerInput: {
    flex: 1,
  },
  removeButton: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: 'rgba(244,63,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.rose,
    fontSize: 13,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  secondaryActionText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
});
