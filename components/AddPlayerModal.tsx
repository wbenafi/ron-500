import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { colors } from '@/constants/theme';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, initialScore: number) => void;
  averageScore: number;
  existingNames: string[];
}

function roundToNearestFive(value: number) {
  return Math.round(value / 5) * 5;
}

export default function AddPlayerModal({
  isOpen,
  onClose,
  onAdd,
  averageScore,
  existingNames,
}: AddPlayerModalProps) {
  const [name, setName] = useState('');
  const [initialScore, setInitialScore] = useState('');
  const [error, setError] = useState('');
  const wasOpenRef = useRef(false);

  const defaultInitialScore = useMemo(
    () => String(roundToNearestFive(Math.round(averageScore))),
    [averageScore]
  );

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setInitialScore(defaultInitialScore);
    }

    if (!isOpen && wasOpenRef.current) {
      setName('');
      setInitialScore(defaultInitialScore);
      setError('');
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, defaultInitialScore]);

  const handleClose = () => {
    setName('');
    setInitialScore(defaultInitialScore);
    setError('');
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('El nombre es requerido');
      return;
    }

    if (existingNames.some((existing) => existing.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Ya existe un jugador con ese nombre');
      return;
    }

    const scoreValue = initialScore || defaultInitialScore;
    const parsedScore = parseInt(scoreValue, 10);
    if (Number.isNaN(parsedScore)) {
      setError('La puntuacion inicial debe ser valida');
      return;
    }

    onAdd(trimmedName, parsedScore);
    handleClose();
  };

  const handleScoreChange = (value: string) => {
    if (value === '' || value === '-' || /^-?\d*$/.test(value)) {
      setInitialScore(value);
      setError('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Jugador" size="sm">
      <View style={styles.container}>
        <Input
          label="Nombre del jugador"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError('');
          }}
          placeholder="Nombre"
          autoCapitalize="words"
          error={error.includes('nombre') ? error : ''}
          autoFocus
        />

        <View>
          <Input
            label="Puntuacion inicial"
            value={initialScore || defaultInitialScore}
            onChangeText={handleScoreChange}
            placeholder={defaultInitialScore}
            keyboardType="numbers-and-punctuation"
            error={error.includes('puntuacion') ? error : ''}
          />
          <Text style={styles.averageText}>Promedio actual: {defaultInitialScore} puntos</Text>
        </View>

        {error && !error.includes('nombre') && !error.includes('puntuacion') ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <View style={styles.actions}>
          <Button variant="ghost" onPress={handleClose} style={styles.actionButton}>
            Cancelar
          </Button>
          <Button variant="primary" onPress={handleSubmit} style={styles.actionButton}>
            Agregar
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  averageText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    color: colors.rose,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});