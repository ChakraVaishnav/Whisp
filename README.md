## 🚀 Whisp

A modern, privacy-focused real-time chat application built with Next.js (App Router), Prisma, Socket.IO, and Upstash Redis presence.

Whisp delivers a polished, fast, and secure chatting experience with:

- Token-based authentication
- Real-time encrypted messaging
- Client-side encrypted file transfer
- Online/offline presence
- Smooth dashboard UI

✨ Features

🔐 Authentication (bro-auth powered)

- Access token stored in-memory on the client.
- Refresh token stored as a secure HttpOnly cookie (`bro_refresh`).
- Token binding via browser fingerprint (prevents refresh token theft).

💬 Realtime Messaging

- Built on Socket.IO.
- Messages are stored encrypted (AES-256-GCM).
- Real-time plaintext delivery to connected clients.
- Chat rooms are deterministic: `roomId = sort(userA, userB)`.

📁 Secure File Relay

- Files encrypted client-side with AES-GCM.
- Server relays encrypted blobs + key/iv to recipient.
- Server does not store file data.

🟢 Presence via Redis

- Socket server sets `presence:{userId} = 1` (TTL).
- Disconnect updates last-seen timestamp.
- Clients listen to global presence updates.

🎨 Dashboard UI (Next.js + Tailwind)

- Whispers list
- Add Whisper modal
- Connection statuses (Connect / Pending / Requested / Connected)
- Chat window with smooth animations
- Presence badges
- Typing indicators (coming soon)

🧱 Architecture

whisp/
│
├── app/                    # Next.js frontend
│   ├── api/                # Serverless routes (auth, users, whispers, messages)
│   ├── context/            # AuthContext + SocketContext
│   └── components/         # UI: Sidebar, ChatWindow, Modals
│
├── prisma/                 # Prisma models + migrations
│
└── socket/                 # Socket.IO backend (Node.js server)
    ├── server.js
    ├── redis.js
    ├── presence.js
    └── prisma.js

Frontend (Vercel)

- Auth
- Dashboard UI
- File encryption
- REST API for presence lookup (Upstash REST API)

Backend (Railway/Render/VPS)

- Persistent Socket.IO server
- Message encryption
- Redis presence events
- Connection & message routing

Redis (Upstash)

- Online/offline tracking
- Last-seen timestamps
- Optional rate-limiting

⚙️ Environment Variables

Root `.env` (Next.js)
```
DATABASE_URL=
ACCESS_SECRET=
REFRESH_SECRET=
COOKIE_SECURE=false
COOKIE_SAMESITE=Lax

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

`socket/.env`
```
PORT=4000
ACCESS_SECRET=
MESSAGE_ENCRYPTION_KEY=
REDIS_URL=rediss://...
REDIS_PRESENCE_TTL=120
```

🛠️ Local Development

Next.js App
```powershell
cd whisp
npm install
npx prisma generate
npm run dev
```

Socket Server
```powershell
cd socket
npm install
npm run dev
```

Runs on:

- Frontend: http://localhost:3000
- Sockets: http://localhost:4000

🔄 Common Workflows

🔑 Login

- Client posts email, password, fingerprint.
- Server returns accessToken + sets bro_refresh cookie.

💬 Sending Messages

Client → Socket.IO:
```json
{
  "senderId": "...",
  "receiverId": "...",
  "message": "...",
  "token": "...",
  "fingerprint": "..."
}
```

Server:

- Verifies auth
- Encrypts message for DB
- Broadcasts plaintext to both participants

📁 File Transfer

- Browser encrypts file (AES-GCM)
- Sends encrypted blob + key + iv
- Server relays
- Receiver decrypts in browser

🟢 Presence Flow

- On connect → presence:{userId}=1 (TTL)
- On disconnect → delete presence key + update lastSeen
- Clients receive:
  - user-online
  - user-offline

🛡 Security

Messages at rest

- AES-256-GCM
- Stored as { cipherText, iv, tag }

Files

- Encrypted client-side
- Server cannot read file contents unless key is compromised

Recommend E2EE key-wrapping for full privacy

Recommended upgrades

- Device-based session tracking
- Public-key E2EE (Curve25519)
- Rate limiting via Redis

🧪 Troubleshooting

Socket Errors

- Check CORS origin
- Ensure socket server is running on correct port
- Ensure NEXT_PUBLIC_SOCKET_URL is set

Refresh Token 401

- Requests must use credentials: 'include'
- Check cookie flags in production

Redis Errors

- Ensure correct TCP URL (socket)
- Ensure REST URL + Token (Next.js)