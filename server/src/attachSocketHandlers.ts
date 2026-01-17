import { Server, Socket } from 'socket.io';
import { handleCreateLobby, handleJoinLobby, handleStartGame } from './handlers/lobbyHandlers';
import { logger } from './utils/logger';
import { handleGetVotes, handleVote } from './handlers/voteHandlers';

export function handleConnection(socket: Socket) {
  socket.emit('connected', { socketId: socket.id });
}

export function attachSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    logger.info(`New connection: ${socket.id}`);
    
    handleConnection(socket);

    socket.on('create-lobby', (data) => handleCreateLobby(io, socket, data));
    socket.on('join-lobby', (data) => handleJoinLobby(io, socket, data));
    // socket.on('leave-lobby', () => handleLeaveLobby(io, socket));
    socket.on('start-game', (data) => handleStartGame(io, socket, data));

    socket.on('vote', (data) => handleVote(io, socket, data));
    socket.on('get-votes', (data) => handleGetVotes(io, socket, data));

    // socket.on('disconnect', () => handleDisconnect(io, socket));
  });
}
