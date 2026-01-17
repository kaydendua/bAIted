import { Server, Socket } from 'socket.io';
import { handleConnection, handleDisconnect } from '../handlers/connectionHandlers';
import { handleCreateLobby, handleJoinLobby, handleLeaveLobby, handleStartGame } from '../handlers/lobbyHandlers';
import { handleCodeUpdate, handleSubmitCode } from '../handlers/gameHandlers';
import { logger } from '../utils/logger';

export function attachSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    logger.info(`New connection: ${socket.id}`);
    
    handleConnection(socket);

    // Lobby events
    socket.on('create-lobby', (data) => handleCreateLobby(io, socket, data));
    socket.on('join-lobby', (data) => handleJoinLobby(io, socket, data));
    socket.on('leave-lobby', () => handleLeaveLobby(io, socket));
    socket.on('start-game', (data) => handleStartGame(io, socket, data));

    // Game events
    socket.on('code-update', (data) => handleCodeUpdate(io, socket, data));
    socket.on('submit-code', (data) => handleSubmitCode(io, socket, data));

    // Disconnect
    socket.on('disconnect', () => handleDisconnect(io, socket));
  });
}
