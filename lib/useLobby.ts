import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './socket';
import { Lobby, Player } from './types';

export function useLobby() {
  const { socket, isConnected } = useSocket();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImpostor, setIsImpostor] = useState(false);

  console.log('useLobby hook - socket:', socket?.id, 'isConnected:', isConnected, 'lobby:', lobby);

  // Listen for lobby events
  useEffect(() => {
    if (!socket) {
      console.log('⏳ Socket not available yet');
      return;
    }

    console.log('🔧 Setting up socket event listeners for socket:', socket.id);

    const handleLobbyCreated = (data: { lobby: Lobby }) => {
      console.log('📢 [EVENT] lobby-created:', data.lobby);
      setLobby(data.lobby);
      setIsLoading(false);
      setError('');
    };

    const handleLobbyJoined = (data: { lobby: Lobby }) => {
      console.log('📢 [EVENT] lobby-joined:', data.lobby);
      setLobby(data.lobby);
      setIsLoading(false);
      setError('');
    };

    const handlePlayerJoined = (data: { lobby: Lobby; player?: Player }) => {
      console.log('📢 [EVENT] player-joined:', data.player?.name);
      setLobby(data.lobby);
    };

    const handlePlayerLeft = (data: { lobby: Lobby; playerId: string }) => {
      console.log('📢 [EVENT] player-left:', data.playerId);
      setLobby(data.lobby);
    };

    const handleGameStarted = (data: { lobby: Lobby }) => {
      console.log('📢 [EVENT] game-started!', JSON.stringify(data, null, 2));
      console.log('Setting lobby state to:', data.lobby);
      setLobby(data.lobby);
      console.log('Lobby state updated!');
    };

    const handleYouAreAi = (data: { message: string }) => {
      console.log('📢 [EVENT] you-are-ai!', data);
      setIsImpostor(true);
    };

    const handleLobbyClosed = (data: { reason: string }) => {
      console.log('📢 [EVENT] lobby-closed:', data.reason);
      setLobby(null);
      setError(`Lobby closed: ${data.reason}`);
    };

    const handleError = (data: { message: string }) => {
      console.error('📢 [EVENT] error:', data.message);
      setError(data.message);
      setIsLoading(false);
    };

    // Register all event listeners
    socket.on('lobby-created', handleLobbyCreated);
    socket.on('lobby-joined', handleLobbyJoined);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('game-started', handleGameStarted);
    socket.on('you-are-ai', handleYouAreAi);
    socket.on('lobby-closed', handleLobbyClosed);
    socket.on('error', handleError);

    console.log('✅ All socket event listeners registered');

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket event listeners');
      socket.off('lobby-created', handleLobbyCreated);
      socket.off('lobby-joined', handleLobbyJoined);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('game-started', handleGameStarted);
      socket.off('you-are-ai', handleYouAreAi);
      socket.off('lobby-closed', handleLobbyClosed);
      socket.off('error', handleError);
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
    if (!socket || !lobby) {
      console.error('Cannot start game - socket:', socket?.id, 'lobby:', lobby);
      return;
    }

    console.log('🎮 Starting game for lobby:', lobby.code);
    console.log('Socket ID:', socket.id);
    console.log('Socket connected:', socket.connected);
    
    // Add a one-time listener to verify we get a response
    socket.once('game-started', (data) => {
      console.log('🎉 DIRECT LISTENER: game-started received!', data);
    });

    socket.emit('start-game', { code: lobby.code });
    console.log('✅ start-game event emitted');
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
    isImpostor,
    
    // Actions
    createLobby,
    joinLobby,
    leaveLobby,
    startGame,
    clearError,

    // Computed
    isHost: lobby ? socket?.id === lobby.hostSocketId : false,
    currentPlayer: lobby?.players.find(p => p.id === socket?.id),

    // Socket details
    socket: socket ?? null,
  };
}
