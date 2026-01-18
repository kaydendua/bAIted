'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLobby } from './useLobby';

type LobbyContextType = ReturnType<typeof useLobby>;

const LobbyContext = createContext<LobbyContextType | null>(null);

export function LobbyProvider({ children }: { children: ReactNode }) {
  const lobbyData = useLobby();

  return (
    <LobbyContext.Provider value={lobbyData}>
      {children}
    </LobbyContext.Provider>
  );
}

export function useLobbyContext() {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error('useLobbyContext must be used within LobbyProvider');
  }
  return context;
}
