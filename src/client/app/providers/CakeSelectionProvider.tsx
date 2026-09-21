import { createContext, useContext, useState, ReactNode } from 'react';
import { CakeGalleryItem } from '@shared/types';

interface CakeSelectionContextValue {
  selectedCake: CakeGalleryItem | null;
  prefilledCake: CakeGalleryItem | null;
  selectCake: (cake: CakeGalleryItem) => void;
  clearSelectedCake: () => void;
  commissionCake: (cake: CakeGalleryItem) => void;
  clearPrefilledCake: () => void;
}

const CakeSelectionContext = createContext<CakeSelectionContextValue | null>(null);

export function CakeSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedCake, setSelectedCake] = useState<CakeGalleryItem | null>(null);
  const [prefilledCake, setPrefilledCake] = useState<CakeGalleryItem | null>(null);

  const selectCake = (cake: CakeGalleryItem) => setSelectedCake(cake);
  const clearSelectedCake = () => setSelectedCake(null);

  const commissionCake = (cake: CakeGalleryItem) => {
    setPrefilledCake(cake);
    setSelectedCake(null);
  };

  const clearPrefilledCake = () => setPrefilledCake(null);

  return (
    <CakeSelectionContext.Provider
      value={{ selectedCake, prefilledCake, selectCake, clearSelectedCake, commissionCake, clearPrefilledCake }}
    >
      {children}
    </CakeSelectionContext.Provider>
  );
}

export function useCakeSelection(): CakeSelectionContextValue {
  const ctx = useContext(CakeSelectionContext);
  if (!ctx) throw new Error('useCakeSelection must be used within a CakeSelectionProvider');
  return ctx;
}