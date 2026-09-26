import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Product } from '@shared/types';

interface CakeSelectionContextValue {
  selectedCake: Product | null;
  prefilledCake: Product | null;
  selectCake: (cake: Product) => void;
  clearSelectedCake: () => void;
  orderCake: (cake: Product) => void;
  clearPrefilledCake: () => void;
}

const CakeSelectionContext = createContext<CakeSelectionContextValue | null>(null);

export function CakeSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedCake, setSelectedCake] = useState<Product | null>(null);
  const [prefilledCake, setPrefilledCake] = useState<Product | null>(null);

  const selectCake = (cake: Product) => setSelectedCake(cake);
  const clearSelectedCake = () => setSelectedCake(null);

  const orderCake = (cake: Product) => {
    setPrefilledCake(cake);
    setSelectedCake(null);
  };

  const clearPrefilledCake = () => setPrefilledCake(null);

  const value = useMemo(
    () => ({ selectedCake, prefilledCake, selectCake, clearSelectedCake, orderCake, clearPrefilledCake }),
    [selectedCake, prefilledCake],
  );

  return (
    <CakeSelectionContext.Provider value={value}>
      {children}
    </CakeSelectionContext.Provider>
  );
}

export function useCakeSelection(): CakeSelectionContextValue {
  const ctx = useContext(CakeSelectionContext);
  if (!ctx) throw new Error('useCakeSelection must be used within a CakeSelectionProvider');
  return ctx;
}