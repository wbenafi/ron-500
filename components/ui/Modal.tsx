import { MaterialIcons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Modal as NativeModal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ReactNode } from 'react';
import { colors, radii, shadows } from '@/constants/theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const maxWidthBySize = {
  sm: 380,
  md: 520,
  lg: 700,
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <NativeModal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrapper}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable
            style={[styles.sheet, { maxWidth: maxWidthBySize[size] }]}
            onPress={(event) => event.stopPropagation()}
          >
            {title ? (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={20} color={colors.muted} />
                </Pressable>
              </View>
            ) : null}

            <View style={styles.content}>{children}</View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    borderRadius: radii.lg,
    backgroundColor: '#111c31',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  content: {
    padding: 16,
    gap: 10,
  },
});