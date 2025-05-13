'use client'
// src/contexts/PlayerContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { usePlayerStore, Track } from '@/hooks/usePlayer';

type PlayerContextType = ReturnType<typeof usePlayerStore>;

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const playerStore = usePlayerStore();

  return (
    <PlayerContext.Provider value={playerStore}>
      {children}
    </PlayerContext.Provider>
  );
};