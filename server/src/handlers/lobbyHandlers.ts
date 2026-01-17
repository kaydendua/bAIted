import { Server, Socket } from 'socket.io';
import { lobbyManager } from '../managers/LobbyManager';
import { logger } from '../utils/logger';

export function handleCreateLobby(io: Server, socket: Socket, data: { playerName: string }) {
  try {
    const { playerName } = data;
    
    if (!playerName || playerName.trim().length === 0) {
      socket.emit('error', { message: 'Player name is required' });
      return;
    }

    const lobby = lobbyManager.createLobby(socket.id, playerName);
    
    // Join socket room
    socket.join(lobby.code);
    
    // Send success response
    socket.emit('lobby-created', { lobby });
    
    logger.info(`Lobby created: ${lobby.code}`);
  } catch (error) {
    logger.error('Error creating lobby:', error);
    socket.emit('error', { message: 'Failed to create lobby' });
  }
}

export function handleJoinLobby(io: Server, socket: Socket, data: { code: string; playerName: string }) {
  try {
    const { code, playerName } = data;
    
    if (!code || !playerName) {
      socket.emit('error', { message: 'Lobby code and player name are required' });
      return;
    }

    const lobby = lobbyManager.joinLobby(code.toUpperCase(), socket.id, playerName);
    
    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found or game already started' });
      return;
    }

    // Join socket room
    socket.join(lobby.code);
    
    // Notify player
    socket.emit('lobby-joined', { lobby });
    
    // Notify all players in lobby
    io.to(lobby.code).emit('player-joined', {
      lobby,
      player: lobby.players.find(p => p.id === socket.id)
    });
    
    logger.info(`Player ${playerName} joined lobby ${code}`);
  } catch (error) {
    logger.error('Error joining lobby:', error);
    socket.emit('error', { message: 'Failed to join lobby' });
  }
}

export function handleLeaveLobby(io: Server, socket: Socket) {
  try {
    const result = lobbyManager.leaveLobby(socket.id);
    
    if (result.lobby) {
      socket.leave(result.lobby.code);
      
      // Notify remaining players
      io.to(result.lobby.code).emit('player-left', {
        lobby: result.lobby,
        playerId: socket.id
      });
      
      socket.emit('lobby-left', { success: true });
    } else if (result.wasHost) {
      // Lobby was deleted
      const rooms = Array.from(socket.rooms);
      const lobbyCode = rooms.find(room => room !== socket.id);
      
      if (lobbyCode) {
        io.to(lobbyCode).emit('lobby-closed', {
          reason: 'Host left the lobby'
        });
        socket.leave(lobbyCode);
      }
    }
  } catch (error) {
    logger.error('Error leaving lobby:', error);
    socket.emit('error', { message: 'Failed to leave lobby' });
  }
}

export function handleStartGame(io: Server, socket: Socket, data: { code: string }) {
  try {
    const { code } = data;
    const lobby = lobbyManager.getLobby(code);
    
    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' });
      return;
    }

    if (lobby.hostId !== socket.id) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }

    const updatedLobby = lobbyManager.startGame(code);
    
    if (!updatedLobby) {
      socket.emit('error', { message: 'Failed to start game. Need at least 3 players.' });
      return;
    }

    // Notify all players that game is starting
    // Note: Don't send impostor info to all players!
    io.to(code).emit('game-started', {
      lobby: {
        ...updatedLobby,
        impostorId: undefined, // Hide impostor from broadcast
        players: updatedLobby.players.map(p => ({
          ...p,
          isImpostor: false // Hide impostor status
        }))
      }
    });

    // Send impostor info only to the impostor
    if (updatedLobby.impostorId) {
      io.to(updatedLobby.impostorId).emit('you-are-impostor', {
        message: 'You are the impostor! Use AI to help you code.'
      });
    }
    
    logger.info(`Game started in lobby ${code}`);
  } catch (error) {
    logger.error('Error starting game:', error);
    socket.emit('error', { message: 'Failed to start game' });
  }
}
