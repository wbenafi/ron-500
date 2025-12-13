'use client';

import { useState, useCallback } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    options: null,
    onConfirm: null,
  });

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          options,
          onConfirm: () => {
            resolve(true);
            setConfirmState({ isOpen: false, options: null, onConfirm: null });
          },
        });
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    setConfirmState({ isOpen: false, options: null, onConfirm: null });
  }, []);

  const ConfirmDialog = () => {
    if (!confirmState.isOpen || !confirmState.options) return null;

    return (
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleClose}
        onConfirm={confirmState.onConfirm || handleClose}
        title={confirmState.options.title}
        message={confirmState.options.message}
        confirmText={confirmState.options.confirmText}
        cancelText={confirmState.options.cancelText}
        variant={confirmState.options.variant}
      />
    );
  };

  return {
    confirm,
    ConfirmDialog,
  };
}

