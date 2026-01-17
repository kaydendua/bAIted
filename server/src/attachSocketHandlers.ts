import { Server, Socket } from 'socket.io';
import { handleCreateLobby, handleJoinLobby } from './handlers/lobbyHandlers';
import { submissionsManager } from '../managers/SubmissionManager';
import { lobbyManager } from '../managers/LobbyManager';
import { logger } from './utils/logger';

export function handleConnection(socket: Socket) {
  socket.emit('connected', { socketId: socket.id });
}

export function attachSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    logger.info(`New connection: ${socket.id}`);
    
    handleConnection(socket);

    socket.on('create-lobby', (data) => handleCreateLobby(io, socket, data));
    socket.on('join-lobby', (data) => handleJoinLobby(io, socket, data));
    
    // Code submission handlers
    socket.on('submitCode', ({ lobbyId, playerId, code }) => {
      const submission = submissionsManager.submitCode(lobbyId, playerId, code);
      
      if (submission) {
        io.to(lobbyId).emit('submissionReceived', {
          playerId,
          submittedAt: submission.submittedAt,
          totalSubmissions: submissionsManager.getSubmissionCount(lobbyId)
        });

        const lobby = lobbyManager.getLobby(lobbyId);
        if (lobby) {
          const submittedCount = submissionsManager.getSubmissionCount(lobbyId);
          if (submittedCount === lobby.players.length) {
            io.to(lobbyId).emit('allSubmissionsReceived');
          }
        }
      }
    });

    socket.on('getSubmissions', (lobbyId) => {
      const submissions = submissionsManager.getLobbySubmissions(lobbyId);
      socket.emit('lobbySubmissions', submissions);
    });

    socket.on('disconnect', () => {
      submissionsManager.clearPlayerSubmission(socket.id);
      logger.info(`Disconnected: ${socket.id}`);
    });
    
    // socket.on('leave-lobby', () => handleLeaveLobby(io, socket));
    // socket.on('start-game', (data) => handleStartGame(io, socket, data));
  });
}