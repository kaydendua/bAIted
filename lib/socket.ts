import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    // Create socket connection only once
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server:', socket?.id);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from WebSocket server');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        setIsConnected(false);
      });

      setSocketInstance(socket);
    }

    return () => {
      // Don't disconnect on component unmount
      // Socket stays alive for the entire session
    };
  }, []);

  return { socket: socketInstance, isConnected };
}
