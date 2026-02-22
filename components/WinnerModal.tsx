import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Player } from '@/types/game';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface WinnerModalProps {
  winner: Player | null;
  onNewGame: () => void;
  onViewStats: () => void;
}

export default function WinnerModal({ winner, onNewGame, onViewStats }: WinnerModalProps) {
  if (!winner) {
    return null;
  }

  return (
    <Modal isOpen={!!winner} onClose={() => {}} size="sm">
      <View style={styles.container}>
        <MaterialCommunityIcons name="trophy-award" size={88} color="#fbbf24" />

        <Text style={styles.title}>Tenemos un ganador</Text>
        <Text style={styles.name}>{winner.name}</Text>
        <Text style={styles.score}>{winner.totalScore} puntos</Text>

        <View style={styles.actions}>
          <Button variant="primary" size="lg" onPress={onNewGame} style={styles.actionButton}>
            Nueva Partida
          </Button>
          <Button variant="secondary" onPress={onViewStats} style={styles.actionButton}>
            Ver Estadisticas
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  title: {
    color: '#fcd34d',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  name: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  score: {
    color: '#6ee7b7',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    width: '100%',
  },
});