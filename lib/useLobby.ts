import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './socket';
import { Lobby, Player } from './types';

export function useLobby() {
  const { socket, isConnected } = useSocket();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Listen for lobby events
  useEffect(() => {
    if (!socket) return;

    // Lobby created
    socket.on('lobby-created', (data: { lobby: Lobby }) => {
      console.log('Lobby created:', data.lobby);
      setLobby(data.lobby);
      setIsLoading(false);
      setError('');
    });

    // Lobby joined
    socket.on('lobby-joined', (data: { lobby: Lobby }) => {
      console.log('Joined lobby:', data.lobby);
      setLobby(data.lobby);
      setIsLoading(false);
      setError('');
    });

    // Player joined (broadcast to all in lobby)
    socket.on('player-joined', (data: { lobby: Lobby; player?: Player }) => {
      console.log('Player joined:', data.player?.name);
      setLobby(data.lobby);
    });

    // Player left
    socket.on('player-left', (data: { lobby: Lobby; playerId: string }) => {
      console.log('Player left:', data.playerId);
      setLobby(data.lobby);
    });

    // Game started
    socket.on('game-started', (data: { lobby: Lobby }) => {
      console.log('Game started!');
      setLobby(data.lobby);
    });

    // You are impostor
    socket.on('you-are-impostor', (data: { message: string }) => {
      console.log('🎭 You are the impostor!');
      // Handle impostor notification
    });

    // Lobby closed
    socket.on('lobby-closed', (data: { reason: string }) => {
      console.log('Lobby closed:', data.reason);
      setLobby(null);
      setError(`Lobby closed: ${data.reason}`);
    });

    // Errors
    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
      setError(data.message);
      setIsLoading(false);
    });

    return () => {
      socket.off('lobby-created');
      socket.off('lobby-joined');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-started');
      socket.off('you-are-impostor');
      socket.off('lobby-closed');
      socket.off('error');
    };
  }, [socket]);

  const createLobby = useCallback((playerName: string, maxPlayers: number = 6) => {
    console.log("createLobby called")
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }

    if (!playerName.trim()) {
      setError('Player name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    socket.emit('create-lobby', {
      playerName: playerName.trim(),
      maxPlayers
    });
  }, [socket, isConnected]);

  const joinLobby = useCallback((lobbyCode: string, playerName: string) => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }

    if (!playerName.trim()) {
      setError('Player name is required');
      return;
    }

    if (!lobbyCode.trim()) {
      setError('Lobby code is required');
      return;
    }

    setIsLoading(true);
    setError('');

    socket.emit('join-lobby', {
      lobbyCode: lobbyCode.trim().toLowerCase(),
      playerName: playerName.trim()
    });
  }, [socket, isConnected]);

  const leaveLobby = useCallback(() => {
    if (!socket) return;

    socket.emit('leave-lobby');
    setLobby(null);
    setError('');
  }, [socket]);

  const startGame = useCallback(() => {
    if (!socket || !lobby) return;

    socket.emit('start-game', { code: lobby.code });
  }, [socket, lobby]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    // State
    lobby,
    error,
    isLoading,
    isConnected,
    
    // Actions
    createLobby,
    joinLobby,
    leaveLobby,
    startGame,
    clearError,

    // Computed
    isHost: lobby ? socket?.id === lobby.hostSocketId : false,
    currentPlayer: lobby?.players.find(p => p.id === socket?.id),
  };
}
