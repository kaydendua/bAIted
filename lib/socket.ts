import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Create singleton socket instance
const getSocket = () => {
  if (typeof window === 'undefined') return null;
  
  if (!(window as any).__socket) {
    (window as any).__socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    console.log('🔌 Created new socket instance');
  }
  
  return (window as any).__socket as Socket;
};

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConnect = () => {
      console.log('✅ Connected to WebSocket server:', socket.id);
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

    // Set up connection event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Set initial state
    if (socket.connected) {
      setIsConnected(true);
    }

    setSocketInstance(socket);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  return { socket: socketInstance, isConnected };
}
