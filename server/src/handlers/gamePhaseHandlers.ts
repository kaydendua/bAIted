// gamePhaseHandlers.ts
import { Server, Socket } from 'socket.io';
import { gamePhaseManager } from '../managers/GamePhaseManager';
import { lobbyManager } from '../managers/LobbyManager';
import { logger } from '../utils/logger';

export function handleSubmitCode(
  io: Server,
  socket: Socket,
  data: { lobbyCode: string; code: string }
) {
  try {
    const { lobbyCode, code } = data;
    const playerId = socket.id;

    const lobby = lobbyManager.getLobby(lobbyCode);
    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' });
      return;
    }

    const currentPhase = gamePhaseManager.getCurrentPhase(lobbyCode);
    if (currentPhase !== 'coding') {
      socket.emit('error', { message: 'Not in coding phase' });
      return;
    }

    // Check if player is in lobby
    if (!lobby.players.find(p => p.id === playerId)) {
      socket.emit('error', { message: 'You are not in this lobby' });
      return;
    }

    // Submit the code
    const success = gamePhaseManager.submitCode(lobbyCode, playerId, code);
    
    if (!success) {
      socket.emit('error', { message: 'Failed to submit code' });
      return;
    }

    // Confirm submission to player
    socket.emit('code-submitted', {
      success: true,
      submittedAt: Date.now()
    });

    // Notify all players about submission count
    const submissions = gamePhaseManager.getSubmissions(lobbyCode);
    io.to(lobbyCode).emit('submission-update', {
      submittedCount: submissions.size,
      totalPlayers: lobby.players.length
    });

    // Check if all players have submitted
    gamePhaseManager.checkAllSubmitted(lobbyCode, io);

    logger.info(`Code submitted by ${playerId} in lobby ${lobbyCode}`);
  } catch (error) {
    logger.error('Error submitting code:', error);
    socket.emit('error', { message: 'Failed to submit code' });
  }
}

export function handleStartReadingPhase(
  io: Server,
  socket: Socket,
  data: { lobbyCode: string }
) {
  try {
    const { lobbyCode } = data;
    const lobby = lobbyManager.getLobby(lobbyCode);

    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' });
      return;
    }

    if (lobby.hostSocketId !== socket.id) {
      socket.emit('error', { message: 'Only the host can start the reading phase' });
      return;
    }

    if (lobby.status !== 'in-progress') {
      socket.emit('error', { message: 'Game not in progress' });
      return;
    }

    gamePhaseManager.startReadingPhase(lobbyCode, io);
  } catch (error) {
    logger.error('Error starting reading phase:', error);
    socket.emit('error', { message: 'Failed to start reading phase' });
  }
}