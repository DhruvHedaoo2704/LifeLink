import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  
  if (!socket) {
    const token = localStorage.getItem('lifelink_token');

    socket = io(socketUrl, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected successfully to', socketUrl);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected. Reason:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket.io] Connection error:', err.message);
    });
  } else {
    // Keep auth token fresh
    const token = localStorage.getItem('lifelink_token');
    socket.auth = { token };
  }

  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
