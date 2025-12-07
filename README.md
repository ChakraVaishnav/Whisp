<p align="center">
  <strong>Whisp — encrypted‑first chat for teams and communities</strong>
  <br>
  <a href="https://whispchat.vercel.app"><img src="https://img.shields.io/badge/demo-live-green?style=flat-square" alt="Live demo"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT license"></a>
</p>

## 🧭 Why Whisp?

Whisp is a Next.js App Router experience that prioritizes privacy, performance, and delight. Real-time messaging is backed by Socket.IO, Prisma, and Upstash Redis so you can rely on end-to-end encryption, offline queueing, and resilient presence detection across desktop and mobile.

### Built for:

- **Private teams** that want encrypted channels without sacrificing speed
- **Communities** that rely on frictionless onboarding with guest tokens
- **Developers** looking for a composable real-time reference with modern tooling

Whisp ships with in-memory token binding, client-side AES-GCM file relay, and offline queue persistence so every message is secure, resumable, and replay-safe.

---

## 🧱 Features

- 🔐 **Scoped auth**: bro-auth token binding with HttpOnly refresh, auto-expiring sessions, and device fingerprint checks
- 💬 **Encrypted messaging**: AES-256-GCM for every text/file, room keys never leave the client
- 📦 **Offline queue + persistence**: messages are stored locally and replayed once sockets reconnect
- ⚡ **Optimized UI**: responsive chat list, sticky send controls, adaptive scroll trapping on mobile
- 🧵 **Presence + typing**: Redis-based presence broadcasts and typing indicators tuned for low bandwidth
- 📁 **File relay with masking**: client-only encryption keeps the server as a blind relay
- 📍 **SEO-ready site**: metadata, OpenGraph, Google verification, and robots tags wired via `src/app/layout.js`

---

## 🧰 Tech stack

| Layer | Primary tech |
| --- | --- |
| Frontend | Next.js App Router, Tailwind CSS, Framer Motion, Zustand (client state) |
| Real-time | Socket.IO server (Node 20, TypeScript), message queue, Prisma + Postgres, Upstash Redis for presence |
| Auth | bro-auth token / fingerprint binding, HttpOnly refresh tokens |
| Data | Prisma client (shared across routes and APIs via `lib/prisma`), PostgreSQL |
| Deployment | Vercel for frontend, custom Socket server, optional Render / Railway for backend |

---

## 🚀 Local setup

1. Clone the repo and install dependencies

  ```powershell
  git clone https://github.com/ChakraVaishnav/Whisp.git
  cd Whisp
  npm install
  npx prisma generate
  ```

2. Copy and configure environment variables

  ```powershell
  cp .env.example .env
  # Update NEXT_PUBLIC_SITE_URL, DATABASE_URL, REDIS_URL, SOCKET_SECRET, etc.
  ```

3. Start the Next.js app

  ```powershell
  npm run dev
  ```

4. Run the Socket.IO server (inside `/socket`)

  ```powershell
  cd socket
  npm install
  npm run dev
  ```

5. Visit [http://localhost:3000](http://localhost:3000) and authenticate via pin or token flows to test messaging

---

## ⚙️ Environment overview

- `NEXT_PUBLIC_SITE_URL`: base URL for metadata, image assets, and socket URL derivation
- `DATABASE_URL`: Postgres (or Neon) connection string used by Prisma
- `REDIS_URL`: Upstash or self-hosted Redis for presence/queue signals
- `SOCKET_SECRET`: key for bro-auth token signing
- `HOSTED_MESSAGE_URL`: optional endpoint where socket server persists messages when receivers are offline

---

## 🧭 Architecture snapshot

```
whisp/
├─ src/app/              # Next.js UI + App Router + metadata (see layout.js)
│  ├─ api/readings       # Prisma-backed APIs for offline queue + history
│  └─ context/AuthContext # bro-auth token binding across components
├─ prisma/               # schema, migrations, seeders
├─ socket/               # Socket.IO server, offline queue persistence, message relay events
└─ public/               # Favicons, OG assets, metadata images
```

Key integrations:

- Shared Prisma client pattern ensures every route (app or API) reuses the same pool and avoids excessive connections.
- Socket server persists offline queue events to Postgres so reconnects can replay unread messages.
- `AuthProvider` wraps the app and streams token refresh/locking logic down the tree.

---

## 📘 Extensibility ideas

1. **Add push notifications** by bridging Push API with Socket.IO events on reconnect.
2. **Multi-room management** with nested room metadata stored in Redis + Postgres.
3. **Schema-first encryption** by integrating a key management service for asymmetry (Curve25519 with WebCrypto).
4. **AI assistant** for message summarization, inserted as a background worker in the socket queue pipeline.

---

## 📸 Screenshots

- Run `npm run storybook` (if available) or build the UI locally and use `npx playwright open http://localhost:3000` for automated screenshotting.
- Replace the OG/Twitter card assets in `public/` and update paths referenced in `src/app/layout.js` to keep marketing imagery on brand.

---

## 🤝 Contributing

1. Fork and branch (`feature/`, `fix/`, `docs/`).
2. Keep PRs small and include a demo link when possible.
3. Run `npm run lint` and any relevant tests.
4. Open an issue first if you plan to tackle a large upgrade (e.g., Postgres sharding, Redis failover).

---

## 📚 Additional resources

- [Socket server documentation](socket/README.md)
- [Security notes](docs/security.md) (or add one if missing)
- Issues: https://github.com/ChakraVaishnav/Whisp/issues

---

## ⚖️ License

This project is licensed under the MIT License. Contributions are welcome under the same terms.

*Built with intent by the Whisp contributors.*
