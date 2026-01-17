import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

describe('WebSocket Server Tests', () => {
  let hostSocket: Socket;
  let player1Socket: Socket;
  let player2Socket: Socket;
  let lobbyCode: string;

  // Helper function to wait for an event
  const waitForEvent = <T>(socket: Socket, event: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, 5000);

      socket.once(event, (data: T) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });
  };

  // Helper function to create and connect a socket
  const createSocket = (): Promise<Socket> => {
    return new Promise((resolve, reject) => {
      const socket = io(SERVER_URL, {
        transports: ['websocket', 'polling']
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Connection timeout'));
      }, 5000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(error);
      });
    });
  };

  afterEach(() => {
    // Cleanup sockets after each test
    if (hostSocket?.connected) hostSocket.disconnect();
    if (player1Socket?.connected) player1Socket.disconnect();
    if (player2Socket?.connected) player2Socket.disconnect();
  });

  describe('Lobby Creation', () => {
    it('should create a lobby successfully', async () => {
      hostSocket = await createSocket();
      
      const createPromise = waitForEvent(hostSocket, 'lobby-created');
      hostSocket.emit('create-lobby', {
        playerName: 'HostPlayer',
        maxPlayers: 5
      });

      const response: any = await createPromise;
      
      expect(response.lobby).toBeDefined();
      expect(response.lobby.code).toBeDefined();
      expect(response.lobby.code).toHaveLength(6);
      expect(response.lobby.players).toHaveLength(1);
      expect(response.lobby.players[0].name).toBe('HostPlayer');
      expect(response.lobby.status).toBe('waiting');
      expect(response.lobby.maxPlayers).toBe(5);

      lobbyCode = response.lobby.code;
    });

    it('should assign host as first player', async () => {
      hostSocket = await createSocket();
      
      const createPromise = waitForEvent(hostSocket, 'lobby-created');
      hostSocket.emit('create-lobby', {
        playerName: 'TestHost',
        maxPlayers: 4
      });

      const response: any = await createPromise;
      
      expect(response.lobby.hostSocketId).toBe(hostSocket.id);
      expect(response.lobby.players[0].id).toBe(hostSocket.id);
      expect(response.lobby.players[0].name).toBe('TestHost');
    });
  });

  describe('Lobby Joining', () => {
    beforeEach(async () => {
      // Create a lobby before each test
      hostSocket = await createSocket();
      
      const createPromise = waitForEvent(hostSocket, 'lobby-created');
      hostSocket.emit('create-lobby', {
        playerName: 'HostPlayer',
        maxPlayers: 5
      });

      const response: any = await createPromise;
      lobbyCode = response.lobby.code;
    });

    it('should allow a player to join an existing lobby', async () => {
      player1Socket = await createSocket();
      
      const joinPromise = waitForEvent(player1Socket, 'lobby-joined');
      player1Socket.emit('join-lobby', {
        lobbyCode: lobbyCode,
        playerName: 'Player1'
      });

      const response: any = await joinPromise;
      
      expect(response.lobby).toBeDefined();
      expect(response.lobby.code).toBe(lobbyCode);
      expect(response.lobby.players).toHaveLength(2);
      expect(response.lobby.players[1].name).toBe('Player1');
    });

    it('should broadcast player-joined event to all players in lobby', async () => {
      player1Socket = await createSocket();
      
      // Host should receive player-joined broadcast
      const hostBroadcastPromise = waitForEvent(hostSocket, 'player-joined');
      
      player1Socket.emit('join-lobby', {
        lobbyCode: lobbyCode,
        playerName: 'Player1'
      });

      const hostBroadcast: any = await hostBroadcastPromise;
      
      expect(hostBroadcast.lobby).toBeDefined();
      expect(hostBroadcast.player.name).toBe('Player1');
      expect(hostBroadcast.lobby.players).toHaveLength(2);
    });

    it('should reject joining with invalid lobby code', async () => {
      player1Socket = await createSocket();
      
      const errorPromise = waitForEvent(player1Socket, 'error');
      player1Socket.emit('join-lobby', {
        lobbyCode: 'INVALID',
        playerName: 'Player1'
      });

      const error: any = await errorPromise;
      
      expect(error.message).toBeDefined();
      expect(error.message).toContain('not found');
    });

    it('should allow multiple players to join', async () => {
      player1Socket = await createSocket();
      player2Socket = await createSocket();
      
      // Player 1 joins
      const join1Promise = waitForEvent(player1Socket, 'lobby-joined');
      player1Socket.emit('join-lobby', {
        lobbyCode: lobbyCode,
        playerName: 'Player1'
      });
      await join1Promise;

      // Player 2 joins
      const join2Promise = waitForEvent(player2Socket, 'lobby-joined');
      player2Socket.emit('join-lobby', {
        lobbyCode: lobbyCode,
        playerName: 'Player2'
      });
      const response: any = await join2Promise;

      expect(response.lobby.players).toHaveLength(3);
      expect(response.lobby.players.map((p: any) => p.name)).toEqual([
        'HostPlayer',
        'Player1',
        'Player2'
      ]);
    });

    it('should track all players correctly', async () => {
      player1Socket = await createSocket();
      
      const hostBroadcast = waitForEvent(hostSocket, 'player-joined');
      const joinPromise = waitForEvent(player1Socket, 'lobby-joined');
      
      player1Socket.emit('join-lobby', {
        lobbyCode: lobbyCode,
        playerName: 'Player1'
      });

      const [hostData, player1Data]: any[] = await Promise.all([
        hostBroadcast,
        joinPromise
      ]);

      // Both should see same lobby state
      expect(hostData.lobby.players).toHaveLength(2);
      expect(player1Data.lobby.players).toHaveLength(2);
      expect(hostData.lobby.code).toBe(player1Data.lobby.code);
    });
  });
});
