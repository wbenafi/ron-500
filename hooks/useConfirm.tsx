import { useCallback, useEffect, useRef, useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const closeWithResult = useCallback((result: boolean) => {
    setIsOpen(false);
    setOptions(null);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((nextOptions: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(nextOptions);
      setIsOpen(true);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  const ConfirmDialog = () => {
    if (!options) {
      return null;
    }

    return (
      <ConfirmModal
        isOpen={isOpen}
        onCancel={() => closeWithResult(false)}
        onConfirm={() => closeWithResult(true)}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
      />
    );
  };

  return {
    confirm,
    ConfirmDialog,
  };
}