import { StyleSheet, Text, View } from 'react-native';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface ConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export default function ConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  title = 'Confirmar',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <View style={styles.container}>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Button variant="ghost" onPress={onCancel} style={styles.actionButton}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onPress={onConfirm}
            style={styles.actionButton}
          >
            {confirmText}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  message: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});