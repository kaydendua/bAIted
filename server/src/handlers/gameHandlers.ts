import { Server, Socket } from 'socket.io';
import { lobbyManager } from '../managers/LobbyManager';
import { logger } from '../utils/logger';

export function handleCodeUpdate(io: Server, socket: Socket, data: { code: string }) {
  try {
    const lobby = lobbyManager.getLobbyByPlayer(socket.id);
    
    if (!lobby) {
      socket.emit('error', { message: 'Not in a lobby' });
      return;
    }

    const player = lobby.players.find(p => p.id === socket.id);
    if (player) {
      player.codeSubmission = data.code;
    }

    // Broadcast code update to all players in the lobby
    socket.to(lobby.code).emit('player-code-updated', {
      playerId: socket.id,
      code: data.code
    });
  } catch (error) {
    logger.error('Error handling code update:', error);
    socket.emit('error', { message: 'Failed to update code' });
  }
}

export function handleSubmitCode(io: Server, socket: Socket, data: { code: string }) {
  try {
    const lobby = lobbyManager.getLobbyByPlayer(socket.id);
    
    if (!lobby) {
      socket.emit('error', { message: 'Not in a lobby' });
      return;
    }

    const player = lobby.players.find(p => p.id === socket.id);
    if (player) {
      player.codeSubmission = data.code;
      player.isReady = true;
    }

    // Notify all players
    io.to(lobby.code).emit('player-submitted', {
      playerId: socket.id,
      playerName: player?.name
    });

    // Check if all players have submitted
    const allSubmitted = lobby.players.every(p => p.isReady);
    
    if (allSubmitted) {
      lobby.status = 'ended';
      
      // Send results to all players
      io.to(lobby.code).emit('game-ended', {
        lobby,
        players: lobby.players.map(p => ({
          id: p.id,
          name: p.name,
          isImpostor: p.isImpostor,
          codeSubmission: p.codeSubmission
        }))
      });
      
      logger.info(`Game ended in lobby ${lobby.code}`);
    }
  } catch (error) {
    logger.error('Error handling code submission:', error);
    socket.emit('error', { message: 'Failed to submit code' });
  }
}
