const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
// bro-auth verify helper
const { verifyAccessToken } = require('bro-auth/core');
require('dotenv').config();
const Redis = require('ioredis');
const logger = require('./logger');
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Redis presence client (optional). Use REDIS_URL env var if provided.
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI || null;
const PRESENCE_TTL = parseInt(process.env.REDIS_PRESENCE_TTL || '120', 10);
let redisClient = null;
if (REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL);
    redisClient.on('connect', () => logger.log('[Redis] Connected to Redis for presence'));
    redisClient.on('error', (err) => logger.error('[Redis] Client Error', err));
  } catch (e) {
    logger.warn('[Redis] Failed to create client:', e.message);
    redisClient = null;
  }
} else {
  logger.log('[Redis] REDIS_URL not set — presence will be in-memory only via socket events');
}

// Store active users and their socket IDs
const activeUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  logger.log(`[Socket] User connected: ${userId} (${socket.id})`);

  // Store user socket mapping
  if (userId) {
    activeUsers.set(userId, socket.id);
    // mark presence in redis if available
    (async () => {
      try {
        if (redisClient) {
          await redisClient.set(`presence:${userId}`, socket.id, 'EX', PRESENCE_TTL);
        }
        // Broadcast presence update to all clients
        io.emit('presence-update', { userId, online: true });
      } catch (e) {
        logger.warn('[Redis] Failed to set presence:', e.message);
      }
    })();
  }

  // Join a room for a conversation
    socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);
    logger.log(`[Socket] User ${userId} joined room: ${roomId}`);
  });

  // Leave a room
  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    logger.log(`[Socket] User ${userId} left room: ${roomId}`);
  });

  // Send a new message
  // Expects: { senderId, receiverId, message, token, fingerprint }
  socket.on('send-message', async ({ senderId, receiverId, message, token, fingerprint }) => {
    try {
      // Verify access token before accepting message
      try {
        const accessSecret = process.env.ACCESS_SECRET || process.env.NEXT_PUBLIC_ACCESS_SECRET;
        if (!accessSecret) throw new Error('ACCESS_SECRET missing');
        const verifyResult = verifyAccessToken(token, fingerprint, accessSecret);
          if (!verifyResult.valid) {
          logger.warn('[Socket] Access token verification failed:', verifyResult.error);
          socket.emit('error', { message: 'Not authorized' });
          return;
        }
      } catch (e) {
        logger.warn('[Socket] Authorization error:', e.message);
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      const roomId = [senderId, receiverId].sort().join('-');
      const payload = {
        senderId,
        receiverId,
        message,
        createdAt: new Date().toISOString(),
      };

      socket.emit('new-message', payload);
      socket.to(roomId).emit('new-message', payload);

      logger.log(`[Socket] Message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      logger.error('[Socket] Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Relay an encrypted file payload without storing it in DB
  // Expects: { senderId, receiverId, fileName, mimeType, dataBase64, token, fingerprint }
  socket.on('send-file', async ({ senderId, receiverId, fileName, mimeType, dataBase64, keyBase64, ivBase64, token, fingerprint }) => {
    try {
      // Verify access token
      try {
        const accessSecret = process.env.ACCESS_SECRET || process.env.NEXT_PUBLIC_ACCESS_SECRET;
        if (!accessSecret) throw new Error('ACCESS_SECRET missing');
        const verifyResult = verifyAccessToken(token, fingerprint, accessSecret);
          if (!verifyResult.valid) {
          logger.warn('[Socket] Access token verification failed (file):', verifyResult.error);
          socket.emit('error', { message: 'Not authorized' });
          return;
        }
      } catch (e) {
        logger.warn('[Socket] Authorization error (file):', e.message);
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      // Relay to room (no DB persist). Include keyBase64 & ivBase64 if provided so receiver can decrypt client-side
      const payload = { senderId, receiverId, fileName, mimeType, dataBase64, keyBase64, ivBase64 };
      const roomId = [senderId, receiverId].sort().join('-');
      // send to sender
      socket.emit('file-sent', payload);
      // send to room (excludes sender)
        socket.to(roomId).emit('file-received', payload);
      logger.log(`[Socket] Relayed file from ${senderId} to ${receiverId} name=${fileName} (keyProvided=${!!keyBase64})`);
    } catch (err) {
      logger.error('[Socket] Error relaying file:', err);
      socket.emit('error', { message: 'Failed to send file' });
    }
  });

  // Allow clients to query presence for a list of userIds
  // Expects: { userIds: [id1, id2,...] } and optional callback
  socket.on('get-presence', async ({ userIds }, callback) => {
    try {
      const result = {};
        if (redisClient) {
        const keys = userIds.map((id) => `presence:${id}`);
        const values = await redisClient.mget(...keys);
        userIds.forEach((id, idx) => {
          result[id] = !!values[idx];
        });
      } else {
        // fallback to checking in-memory map
        userIds.forEach((id) => {
          result[id] = activeUsers.has(id);
        });
      }
      if (typeof callback === 'function') callback(result);
      else socket.emit('presence-result', result);
    } catch (err) {
      logger.error('[Socket] Error in get-presence:', err.message);
      if (typeof callback === 'function') callback({ error: err.message });
      else socket.emit('presence-result', { error: err.message });
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    if (userId) {
      activeUsers.delete(userId);
      // remove presence key in redis and broadcast
      (async () => {
        try {
          if (redisClient) await redisClient.del(`presence:${userId}`);
          io.emit('presence-update', { userId, online: false });
        } catch (e) {
          logger.warn('[Redis] Failed to remove presence:', e.message);
        }
      })();
    }
    logger.log(`[Socket] User disconnected: ${userId} (${socket.id})`);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  logger.log(`[Socket.IO Server] Running on port ${PORT}`);
});
