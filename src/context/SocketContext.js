"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import logger from '../utils/logger';

const SocketContext = createContext(null);

export function SocketProvider({ children, userId }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    // Connect to your Express Socket.IO server
    const socketInstance = io(socketUrl, {
      auth: { userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      logger.log('[Socket] Connected to server');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      logger.log('[Socket] Disconnected from server');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      logger.error('[Socket] Connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
