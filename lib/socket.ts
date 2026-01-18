import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let globalSocket: Socket | null = null;

function getSocket(): Socket | null {
  // Only create socket on client side
  if (typeof window === 'undefined') {
    return null;
  }

  if (!globalSocket) {
    console.log('🔌 Creating new socket connection to:', SOCKET_URL);
    globalSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }

  return globalSocket;
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = getSocket();
    
    if (!socketInstance) {
      console.log('⏳ Socket not available (SSR)');
      return;
    }

    console.log('🔧 Initializing socket:', socketInstance.id);
    setSocket(socketInstance);

    const handleConnect = () => {
      console.log('✅ Connected to WebSocket server:', socketInstance.id);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('🔌 Disconnected from WebSocket server');
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleConnectError);

    // Set initial connected state
    if (socketInstance.connected) {
      console.log('Socket already connected');
      setIsConnected(true);
    }

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connect_error', handleConnectError);
    };
  }, []);

  return { socket, isConnected };
}
