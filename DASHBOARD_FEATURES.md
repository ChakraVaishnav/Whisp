# Whisp Chat Dashboard

## Features Implemented

### 1. **Dashboard Layout** (`/dashboard`)
- Premium dark UI matching landing page theme
- Responsive design with glassmorphism effects
- Three main sections: Top bar, Whispers sidebar, Chat window

### 2. **Whispers Sidebar** (Left)
- Shows all accepted whisper connections
- Search bar to filter whispers by username/email
- "+" button to add new whisper connections
- Each whisper shows:
  - Avatar with gradient background
  - Username or email
  - Last message preview (placeholder)
  - Unread count badge (placeholder)
- Selected whisper is highlighted with gradient border

### 3. **Notification Bell** (Top Right)
- Shows count badge for pending whisper requests
- Dropdown with list of pending requests
- Accept/Reject buttons for each request
- Auto-refreshes every 30 seconds
- Updates whispers list when request is accepted

### 4. **Add Whisper Modal**
- Search users by username or email
- Send whisper connect requests
- Premium modal with blur backdrop
- Shows search results with avatars
- "Connect" button for each user

### 5. **Chat Window** (Main Area)
- Shows selected whisper conversation
- Message history with sender/receiver distinction
- Real-time message send (press Enter or click Send)
- Messages styled with gradient for sent messages
- Empty state when no whisper selected
- Auto-scrolls to latest message

### 6. **API Routes**
- `GET /api/whispers?userId={id}` - Get accepted whispers
- `POST /api/whispers` - Create whisper request
- `GET /api/whispers/pending?userId={id}` - Get pending requests
- `PATCH /api/whispers/[id]` - Accept whisper
- `DELETE /api/whispers/[id]` - Reject whisper
- `GET /api/messages?whisperId={id}` - Get messages
- `POST /api/messages` - Send message
- `GET /api/users/search?query={text}` - Search users

## Database Schema
Uses Prisma with PostgreSQL:
- **User**: id, username, email, password
- **Whisper**: userAId, userBId, status (PENDING/ACCEPTED)
- **Message**: senderId, receiverId, cipherText, iv, tag

## UI Theme
- Dark background (gray-950)
- Purple-to-blue gradients for accents
- Glassmorphism with backdrop-blur
- Smooth animations with Framer Motion
- Consistent with landing page design

## Next Steps (Optional)
- Add real-time updates with WebSocket or polling
- Implement message encryption (AES-GCM)
- Add message read receipts
- Add typing indicators
- Add file/image message support
- Add user online status
- Add message search
- Add group chats
