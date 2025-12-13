'use client';

import { useState, useMemo, useRef, useEffect, startTransition } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, initialScore: number) => void;
  averageScore: number;
  existingNames: string[];
}

export default function AddPlayerModal({
  isOpen,
  onClose,
  onAdd,
  averageScore,
  existingNames,
}: AddPlayerModalProps) {
  const [name, setName] = useState('');
  const [initialScore, setInitialScore] = useState<string>('');
  const [error, setError] = useState('');
  const prevIsOpenRef = useRef(false);

  // Round to nearest number ending in 5 or 0
  const roundToNearestFive = (num: number): number => {
    return Math.round(num / 5) * 5;
  };

  // Calculate default initial score (rounded to nearest 5 or 0)
  const defaultInitialScore = useMemo(() => roundToNearestFive(Math.round(averageScore)).toString(), [averageScore]);

  // Update initial score when modal opens (not when averageScore changes while open)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Modal just opened, set initial score to current average using startTransition
      startTransition(() => {
        setInitialScore(defaultInitialScore);
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, defaultInitialScore]);

  // Reset form when modal closes via callback
  const handleClose = () => {
    setName('');
    // Recalculate default score when closing (in case averageScore changed)
    const newDefault = roundToNearestFive(Math.round(averageScore)).toString();
    setInitialScore(newDefault);
    setError('');
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('El nombre es requerido');
      return;
    }

    if (existingNames.some(n => n.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Ya existe un jugador con ese nombre');
      return;
    }

    const scoreValue = initialScore || displayInitialScore;
    const score = parseInt(scoreValue, 10);
    if (isNaN(score)) {
      setError('La puntuación inicial debe ser un número válido');
      return;
    }

    onAdd(trimmedName, score);
    handleClose();
  };

  const handleScoreChange = (value: string) => {
    // Allow negative numbers and empty string
    if (value === '' || value === '-' || /^-?\d*$/.test(value)) {
      setInitialScore(value);
      setError('');
    }
  };

  // Use current input value or default initial score
  const displayInitialScore = initialScore || defaultInitialScore;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Jugador" size="sm" key={isOpen ? 'open' : 'closed'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nombre del jugador
          </label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Nombre"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            error={error && error.includes('nombre') ? error : ''}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Puntuación inicial
          </label>
          <Input
            type="text"
            inputMode="numeric"
            value={displayInitialScore}
            onChange={(e) => handleScoreChange(e.target.value)}
            placeholder={defaultInitialScore}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            error={error && error.includes('puntuación') ? error : ''}
          />
          <p className="text-xs text-slate-400 mt-1">
            Promedio actual: {defaultInitialScore} puntos
          </p>
        </div>

        {error && !error.includes('nombre') && !error.includes('puntuación') && (
          <p className="text-rose-400 text-sm">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 w-full sm:w-auto min-h-[48px] text-base touch-manipulation"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1 w-full sm:w-auto min-h-[48px] text-base touch-manipulation"
          >
            Agregar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

