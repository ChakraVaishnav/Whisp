const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const prisma = require('./prisma');
require('dotenv').config();

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
          console.log('[Encryption] Old unencrypted message detected, returning as plaintext');
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
    console.error('[Encryption] Decryption failed:', error.message);
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

// Store active users and their socket IDs
const activeUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log(`[Socket] User connected: ${userId} (${socket.id})`);

  // Store user socket mapping
  if (userId) {
    activeUsers.set(userId, socket.id);
  }

  // Join a room for a conversation
  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`[Socket] User ${userId} joined room: ${roomId}`);
  });

  // Leave a room
  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    console.log(`[Socket] User ${userId} left room: ${roomId}`);
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
      console.error('[Socket] Error fetching messages:', error);
      socket.emit('error', { message: 'Failed to fetch messages' });
    }
  });

  // Send a new message
  socket.on('send-message', async ({ senderId, receiverId, message }) => {
    try {
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

      console.log(`[Socket] Encrypted message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error('[Socket] Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    if (userId) {
      activeUsers.delete(userId);
    }
    console.log(`[Socket] User disconnected: ${userId} (${socket.id})`);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`[Socket.IO Server] Running on port ${PORT}`);
  console.log(`[Encryption] Using ${ENCRYPTION_KEY.length}-byte encryption key`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[Socket.IO Server] Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
