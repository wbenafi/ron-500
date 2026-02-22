import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useGame } from '@/context/GameContext';
import { useConfirm } from '@/hooks/useConfirm';
import AddPlayerModal from '@/components/AddPlayerModal';
import RoundHistory from '@/components/RoundHistory';
import RoundInput from '@/components/RoundInput';
import ScoreBoard from '@/components/ScoreBoard';
import WinnerModal from '@/components/WinnerModal';
import Button from '@/components/ui/Button';
import { colors, radii } from '@/constants/theme';

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const { state, addRound, addPlayer, undoLastRound, resetGame, finishGame, hydrated } = useGame();
  const { confirm, ConfirmDialog } = useConfirm();

  const [showRoundInput, setShowRoundInput] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  useEffect(() => {
    if (!hydrated || state.players.length > 0) {
      return;
    }

    const redirectTimer = setTimeout(() => {
      router.replace('/');
    }, 120);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [hydrated, state.players.length, router]);

  const handleNewGame = async () => {
    await resetGame();
    router.replace('/');
  };

  const handleViewStats = async () => {
    await resetGame();
    router.replace('/stats');
  };

  const calculateAverageScore = () => {
    if (state.players.length === 0) {
      return 0;
    }

    const sum = state.players.reduce((total, player) => total + player.totalScore, 0);
    return sum / state.players.length;
  };

  const handleAddPlayer = (name: string, initialScore: number) => {
    addPlayer(name, initialScore);
    setShowAddPlayerModal(false);
  };

  const handleFinishClick = async () => {
    const confirmed = await confirm({
      title: 'Terminar partida',
      message:
        'Seguro que quieres terminar la partida? Se guardara en estadisticas con los puntajes actuales.',
      confirmText: 'Terminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (confirmed) {
      await finishGame();
      await handleNewGame();
    }
  };

  if (!hydrated || state.players.length === 0) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backLink} onPress={() => router.push('/')}>
          <MaterialIcons name="arrow-back" size={20} color={colors.muted} />
          <Text style={styles.backText}>Inicio</Text>
        </Pressable>

        <View style={styles.headerTitle} pointerEvents="none">
          <Image source={require('@/assets/icon.png')} style={styles.headerLogo} />
          <Text style={styles.headerTitleText}>RON {state.winningScore}</Text>
        </View>
      </View>

      <View style={styles.infoBar}>
        <View style={styles.infoStats}>
          <View style={styles.infoStatCol}>
            <Text style={styles.infoValue}>{state.players.length}</Text>
            <Text style={styles.infoLabel}>Jugadores</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoStatCol}>
            <Text style={[styles.infoValue, styles.infoValueGreen]}>{state.rounds.length}</Text>
            <Text style={styles.infoLabel}>Rondas</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Button variant="primary" onPress={() => setShowRoundInput(true)} style={styles.actionButton}>
            <>
              <MaterialIcons name="add-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.actionPrimaryText}>Agregar Ronda</Text>
            </>
          </Button>
          <Button variant="danger" onPress={handleFinishClick} style={styles.actionButton}>
            <>
              <MaterialIcons name="stop-circle" size={18} color="#ffffff" />
              <Text style={styles.actionPrimaryText}>Terminar</Text>
            </>
          </Button>
        </View>
      </View>

      <View style={[styles.grid, isWide ? styles.gridWide : null]}>
        <View style={[styles.panel, isWide ? styles.panelWide : null]}>
          <ScoreBoard
            players={state.players}
            targetScore={state.winningScore}
            onAddPlayer={() => setShowAddPlayerModal(true)}
          />
        </View>

        <View style={[styles.panel, isWide ? styles.panelWide : null]}>
          <RoundHistory
            rounds={state.rounds}
            players={state.players}
            playerAddedEvents={state.playerAddedEvents}
            onUndo={undoLastRound}
            winningScore={state.winningScore}
          />
        </View>
      </View>

      <RoundInput
        players={state.players}
        roundNumber={state.rounds.length + 1}
        onSubmit={addRound}
        isOpen={showRoundInput}
        onClose={() => setShowRoundInput(false)}
        winningScore={state.winningScore}
      />

      <WinnerModal winner={state.winner} onNewGame={handleNewGame} onViewStats={handleViewStats} />

      <AddPlayerModal
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        onAdd={handleAddPlayer}
        averageScore={calculateAverageScore()}
        existingNames={state.players.map((player) => player.name)}
      />

      <ConfirmDialog />
    </ScrollView>
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
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  screen: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
    gap: 12,
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    minHeight: 34,
    position: 'relative',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  backText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  headerLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  headerTitleText: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
  },
  infoBar: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(30,41,59,0.6)',
    padding: 14,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  actionPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  infoStatCol: {
    alignItems: 'center',
  },
  infoValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  infoValueGreen: {
    color: '#6ee7b7',
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  infoDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border,
  },
  grid: {
    gap: 12,
  },
  gridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  panel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(30,41,59,0.4)',
    padding: 14,
  },
  panelWide: {
    flex: 1,
  },
});
