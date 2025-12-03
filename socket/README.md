# Whispo Socket.IO Server

Real-time messaging server for the Whispo chat application using Socket.IO and Express.

## Setup

1. **Important**: This server uses the Prisma Client from the parent directory (`../node_modules/@prisma/client`), so make sure you've run `npx prisma generate` in the parent `whispo` directory first.

2. **Create `.env` file** with your encryption key:
```bash
# Generate a secure key with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

MESSAGE_ENCRYPTION_KEY=your-64-character-hex-key-here
```

3. Install dependencies:
```bash
npm install
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server runs on **port 4000** by default.

## Database Connection

The server connects to the same PostgreSQL database as the main Next.js app using Prisma Client from the parent directory. Make sure your `.env` file in the parent directory has the correct `DATABASE_URL`.

## Socket Events

### Client → Server

- **`join-room`** - Join a conversation room
  ```js
  socket.emit('join-room', { roomId: 'user1-user2' });
  ```

- **`leave-room`** - Leave a conversation room
  ```js
  socket.emit('leave-room', { roomId: 'user1-user2' });
  ```

- **`get-messages`** - Fetch message history
  ```js
  socket.emit('get-messages', { senderId: 'user1', receiverId: 'user2' });
  ```

- **`send-message`** - Send a new message
  ```js
  socket.emit('send-message', { 
    senderId: 'user1', 
    receiverId: 'user2', 
    message: 'Hello!' 
  });
  ```

### Server → Client

- **`messages-history`** - Returns array of messages
- **`new-message`** - New message received (sent to both sender and receiver)
- **`error`** - Error occurred

## Features

- Real-time message delivery
- **AES-256-GCM encryption** for all messages stored in database
- Message persistence with Prisma
- Active user tracking
- Room-based messaging
- Automatic reconnection support
- CORS enabled for Next.js frontend (localhost:3000)

## Security

All messages are encrypted using **AES-256-GCM** (Advanced Encryption Standard with Galois/Counter Mode):
- **256-bit encryption key** from environment variable
- **96-bit initialization vector (IV)** generated per message
- **128-bit authentication tag** for message integrity
- Messages stored encrypted in database with `cipherText`, `iv`, and `tag`
- Decryption happens server-side before sending to clients via Socket.IO

## Database

Uses Prisma Client to connect to the same PostgreSQL database as the main Next.js app.
