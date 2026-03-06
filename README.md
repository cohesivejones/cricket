# Cricket Scoreboard

A real-time, in-memory scoreboard application built with React (TypeScript), Cloudflare Workers, and Cloudflare KV. Share game sessions with friends via simple URL sharing.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Wouter (routing)
- **Backend**: Cloudflare Workers + KV (free tier)
- **Communication**: HTTP polling (3-second intervals)
- **Testing**: Vitest + React Testing Library (TDD approach)

## 🚀 Features

- ✅ Create new game sessions with unique IDs
- ✅ Share sessions via URL
- ✅ Real-time score updates (via polling)
- ✅ Add players dynamically
- ✅ Increment/decrement scores
- ✅ Fully typed with TypeScript
- ✅ Comprehensive test coverage

## 📦 Project Structure

```
cricket/
├── frontend/          # React TypeScript app
│   ├── src/
│   │   ├── pages/         # Landing & Session pages
│   │   ├── components/    # Scoreboard component
│   │   ├── hooks/         # useSession hook (polling)
│   │   ├── utils/         # API utilities
│   │   ├── types.ts       # TypeScript interfaces
│   │   └── test-utils/    # Testing utilities
│   ├── vitest.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── backend/           # Cloudflare Worker
    ├── src/
    │   ├── index.js           # Worker endpoints
    │   ├── sessionManager.js  # Session CRUD logic
    │   └── __tests__/         # Backend tests
    ├── wrangler.toml
    └── package.json
```

## 🧪 Testing (TDD)

This project was built using Test-Driven Development:

```bash
# Run all tests
npm test                    # Frontend tests
cd backend && npm test      # Backend tests

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Test Coverage:**
- ✅ API utilities (8 tests)
- ✅ useSession hook (5 tests)
- ✅ Landing page (3 tests)
- ✅ Session page (4 tests)
- ✅ Backend session manager (7 tests)
- ✅ Backend API endpoints (7 tests)

**Total: 34 tests passing**

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- npm

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Run locally:**
```bash
npm run dev
```

This will start both the backend (localhost:8787) and frontend (localhost:3000) concurrently.

3. **Access the app:**
Open http://localhost:3000

The frontend proxies API requests to the backend automatically.

## 📝 API Endpoints

### POST /api/session
Create a new session
```json
{
  "sessionId": "uuid-here"
}
```

### GET /api/session/:id
Get session data

### POST /api/session/:id
Update session data
```json
{
  "players": ["Alice", "Bob"],
  "scores": { "Alice": 10, "Bob": 5 }
}
```

## 🌐 Deployment

### Backend (Cloudflare Workers)

1. **Create KV namespace:**
```bash
cd backend
npx wrangler kv:namespace create "SESSIONS"
```

2. **Update `wrangler.toml` with the KV namespace ID returned**

3. **Deploy:**
```bash
npm run deploy
```

### Frontend (Cloudflare Pages)

1. **Build:**
```bash
cd frontend
npm run build
```

2. **Deploy to Cloudflare Pages:**
   - Push code to GitHub
   - Connect repository to Cloudflare Pages
   - Set build command: `cd frontend && npm install && npm run build`
   - Set build output directory: `frontend/dist`
   - Add environment variable for API URL if needed

**OR use Wrangler:**
```bash
npx wrangler pages deploy dist
```

## 🆓 Cloudflare Free Tier

This app fits comfortably within Cloudflare's free tier:
- **Workers**: 100,000 requests/day (polling every 3s = ~28,800 requests/day per user)
- **KV**: 100,000 reads/day, 1,000 writes/day
- **Pages**: Unlimited bandwidth and requests

Supports **2-3 concurrent users** or **10-20 games** with intermittent activity.

## 🎮 Usage

1. **Create a game:**
   - Visit the landing page
   - Click "New Game"
   - You'll be redirected to `/session/{uuid}`

2. **Share with friends:**
   - Copy the URL
   - Share with friends
   - Everyone sees the same session

3. **Track scores:**
   - Add players
   - Use +1/-1 buttons to update scores
   - Changes sync across all clients (3-second delay)

## 🔧 Configuration

### Polling Interval
Edit `frontend/src/hooks/useSession.ts`:
```typescript
const POLL_INTERVAL = 3000 // milliseconds
```

### Session Data Structure
See `frontend/src/types.ts`:
```typescript
interface Session {
  sessionId: string
  players: string[]
  scores: Record<string, number>
  metadata: Record<string, unknown>
  createdAt: string
  lastUpdated: string
}
```

## 📚 Tech Stack

### Frontend
- React 18
- TypeScript 5
- Vite 5
- Wouter 3 (routing)
- Vitest + React Testing Library

### Backend
- Cloudflare Workers
- Cloudflare KV
- Vitest

## 🤝 Contributing

This is a TDD project. Always write tests first:

1. Write failing test
2. Implement feature
3. Verify test passes
4. Refactor if needed

## 📄 License

MIT

## 🙏 Credits

Built with ❤️ using modern web technologies and TDD practices.
