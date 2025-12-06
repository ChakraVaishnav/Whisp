const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const prisma = require('./prisma');
// bro-auth verify helper
const { verifyAccessToken } = require('bro-auth/core');
require('dotenv').config();
const Redis = require('ioredis');
const logger = require('./logger');

const app = express();
const httpServer = createServer(app);

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY 
  ? Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY, 'hex')
  : crypto.randomBytes(32); // 256-bit key

// Encrypt message using AES-GCM 256
function encryptMessage(plaintext) {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const tag = cipher.getAuthTag();
  
  return {
    cipherText: encrypted,
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

// Decrypt message using AES-GCM 256
function decryptMessage(cipherText, iv, tag) {
  try {
        // Handle old messages that weren't encrypted (empty iv/tag)
        if (!iv || !tag || iv === '' || tag === '') {
          logger.log('[Encryption] Old unencrypted message detected, returning as plaintext');
          return cipherText; // Return the plaintext stored in cipherText
        }

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      ENCRYPTION_KEY,
      Buffer.from(iv, 'base64')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    
    let decrypted = decipher.update(cipherText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    } catch (error) {
    logger.error('[Encryption] Decryption failed:', error.message);
    return cipherText; // Return cipherText as fallback
  }
}

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
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

  // Get message history
  socket.on('get-messages', async ({ senderId, receiverId }) => {
    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, username: true, email: true },
          },
          receiver: {
            select: { id: true, username: true, email: true },
          },
        },
      });

      // Decrypt messages before sending to client
      const decryptedMessages = messages.map(msg => {
        const decryptedText = decryptMessage(msg.cipherText, msg.iv, msg.tag);
        return {
          ...msg,
          message: decryptedText // Add decrypted message for client
        };
      });

      socket.emit('messages-history', decryptedMessages);
    } catch (error) {
      logger.error('[Socket] Error fetching messages:', error);
      socket.emit('error', { message: 'Failed to fetch messages' });
    }
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

      // Encrypt the message using AES-GCM 256
      const encrypted = encryptMessage(message);
      
      // Save encrypted message to database
      const newMessage = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          cipherText: encrypted.cipherText,
          iv: encrypted.iv,
          tag: encrypted.tag,
        },
        include: {
          sender: {
            select: { id: true, username: true, email: true },
          },
          receiver: {
            select: { id: true, username: true, email: true },
          },
        },
      });

      // Add decrypted message for real-time transmission
      const messageWithPlaintext = {
        ...newMessage,
        message: message // Send plaintext to clients (encrypted in DB)
      };

      // Emit to sender
      socket.emit('new-message', messageWithPlaintext);

      // Emit to the room so the receiver gets it once
      // Using socket.to(roomId) ensures the sender won't receive a duplicate
      const roomId = [senderId, receiverId].sort().join('-');
      socket.to(roomId).emit('new-message', messageWithPlaintext);

      logger.log(`[Socket] Encrypted message sent from ${senderId} to ${receiverId}`);
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
  logger.log(`[Encryption] Using ${ENCRYPTION_KEY.length}-byte encryption key`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.log('[Socket.IO Server] Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
