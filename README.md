<p align="center">
  <strong>Whisp - Modern, privacy-focused real-time chat</strong>
  <br>
  <a href="https://your-demo-link.com"><img src="https://img.shields.io/badge/demo-live-green?style=flat-square"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/ChakraVaishnav/Whisp?style=flat-square"></a>
</p>

## 🚀 Whisp

Whisp is a modern, privacy-focused real-time chat application built with Next.js (App Router), Prisma, Socket.IO, and Upstash Redis.  

Deliver fast, secure messaging with:
- Token-based auth
- Real-time encrypted text & files
- Client-side file encryption
- Online presence
- Smooth UI

---

### 🖥️ Quick Start

#### Prerequisites

- Node.js ≥ 18
- PostgreSQL database
- Redis (Upstash recommended)
- Vercel / Railway / Render or local

#### Setup

```bash
git clone https://github.com/ChakraVaishnav/Whisp.git
cd Whisp
# Install main app deps
npm install
npx prisma generate

# Setup environment
cp .env.example .env            # Fill out .env

# Start frontend
npm run dev

# Start socket server (in /socket)
cd socket
npm install
npm run dev
```

Frontend: [http://localhost:3000](http://localhost:3000)  
Socket: [http://localhost:4000](http://localhost:4000)

---

### 🧰 Tech Stack

| Layer      | Technology                |
|------------|--------------------------|
| Frontend   | Next.js (App Router), Tailwind |
| Auth       | bro-auth, Token binding  |
| Messaging  | Socket.IO                |
| Database   | PostgreSQL, Prisma       |
| Presence   | Upstash Redis            |
| Hosting    | Vercel, Railway, Render  |

---

## ✨ Features

- 🔐 **Secure Auth**: In-memory tokens, HttpOnly refresh, fingerprint binding
- 💬 **Encrypted Messaging**: End-to-end AES-256-GCM, deterministic rooms
- 📁 **Secure File Relay**: Client-side AES-GCM encryption
- 🟢 **Presence Tracking**: Redis-based online/offline
- 🎨 **Dashboard UI**: Smooth Next.js + Tailwind experience

## 🧱 Architecture

```text
whisp/
├── app/         # Next.js frontend
│   ├── api/
│   ├── context/
│   └── components/
├── prisma/      # Prisma models + migrations
└── socket/      # Socket.IO server
```

---

## 🌐 Demo

Wanna try? [Demo Online](https://your-demo-link.com)  
Want to deploy? See [Deploy Docs](docs/deploy.md) (coming soon)

---

## 🤝 Contributing

Pull requests are welcome and appreciated!  
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 🛡 Security

- Messages: AES-256-GCM, stored encrypted
- Files: Client-side encryption, server blind relay
- Recommend: E2EE key-wrapping
- Upgrades considered: Device sessions, public-key E2EE (Curve25519), Redis rate limit
- See: [Security Details](docs/security.md)

---

## 📚 Documentation & Support

- [Socket Server README](socket/README.md)
- [Issues](https://github.com/ChakraVaishnav/Whisp/issues)
- For questions, open an issue or contact [@ChakraVaishnav](https://github.com/ChakraVaishnav)

---

## ⚖️ License

This project is licensed under the MIT License.

---

*Built with ❤️ by ChakraVaishnav and contributors.*
