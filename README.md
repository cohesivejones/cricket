# Cricket Darts Scoreboard 🎯

A real-time, in-memory Cricket darts scoreboard application built with React (TypeScript), Cloudflare Workers, and Cloudflare KV. Share game sessions with friends via simple URL sharing.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Wouter (routing)
- **Backend**: Cloudflare Workers + KV (persistent storage)
- **Communication**: HTTP polling (3-second intervals)
- **Testing**: Vitest + React Testing Library + @cloudflare/vitest-pool-workers (TDD approach)

## 🚀 Features

- ✅ Full Cricket darts game implementation
- ✅ Create new game sessions with unique IDs
- ✅ Share sessions via URL - multiplayer support
- ✅ Real-time score updates across all clients (via polling)
- ✅ Game state persistence (survives page refresh)
- ✅ Multi-tab synchronization
- ✅ Proper Cricket scoring rules:
  - Defensive closing (can't close if behind)
  - Excess marks score as points
  - Visual indicators (🔒 locked, ~~strikethrough~~)
- ✅ Fully typed with TypeScript
- ✅ Comprehensive test coverage (101 tests)

## 🎯 Cricket Darts Rules

Cricket is played on numbers 15-20 and the bullseye. Players must:
1. "Open" a number by hitting it 3 times (marks)
2. Score points on open numbers (if opponent hasn't closed it)
3. Close all numbers and have the most points to win

Scoring:
- Single = 1 mark
- Double = 2 marks  
- Triple = 3 marks
- Can't close a number if you're behind in score (defensive closing)
- Excess marks (beyond 3) score as points if number is still open

## 📦 Project Structure

```
cricket/
├── frontend/          # React TypeScript app
│   ├── src/
│   │   ├── pages/              # Landing & Session pages
│   │   ├── components/         # CricketScoreboard, DartInput
│   │   ├── hooks/              # useSession (polling)
│   │   ├── utils/              # API utilities, game logic
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── test-utils/         # Testing utilities
│   │   └── __tests__/          # Component & integration tests
│   ├── vitest.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── backend/           # Cloudflare Worker
    ├── src/
    │   ├── index.ts            # Worker API endpoints
    │   ├── sessionManager.ts   # Session CRUD logic
    │   ├── types.ts            # TypeScript interfaces
    │   └── __tests__/          # Backend tests (real Worker runtime)
    ├── wrangler.toml
    ├── vitest.config.js        # Uses @cloudflare/vitest-pool-workers
    └── package.json
```

## 🧪 Testing (TDD)

This project was built using Test-Driven Development with comprehensive test coverage:

```bash
# Run all tests (from root)
npm test

# Frontend tests only
cd frontend && npm test

# Backend tests only  
cd backend && npm test

# Watch mode
npm run test:watch
```

**Test Coverage:**

**Frontend (78 tests):**
- ✅ Cricket game logic (29 tests)
  - Scoring mechanics
  - Win conditions
  - Defensive closing
  - Excess marks
- ✅ API utilities (8 tests)
- ✅ useSession hook (5 tests)
- ✅ CricketScoreboard component (12 tests)
- ✅ DartInput component (13 tests)
- ✅ Landing page (7 tests)
- ✅ Session page (4 tests)

**Backend (23 tests):**
- ✅ Session manager CRUD (8 tests)
- ✅ API endpoints (15 tests)
  - Session creation/retrieval
  - Game state persistence (PUT /game)
  - CORS handling
  - Error cases

**Total: 101 tests passing** ✅

**Backend Testing Infrastructure:**
- Uses **@cloudflare/vitest-pool-workers** for real Cloudflare Workers runtime testing
- Tests run in actual Miniflare environment (not mocks)
- Real KV storage testing
- Validates Worker behavior exactly as it runs in production

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

This will start both:
- Backend: `http://localhost:8787` (Cloudflare Worker via Wrangler)
- Frontend: `http://localhost:3000` (Vite dev server)

3. **Access the app:**
Open `http://localhost:3000`

The frontend proxies API requests to the backend automatically.

### Testing

```bash
# All tests
npm test

# Frontend with watch mode
cd frontend && npm run test:watch

# Backend tests (in real Worker runtime)
cd backend && npm test
```

## 📝 API Endpoints

### POST /api/session
Create a new session
```json
{
  "sessionId": "uuid-here",
  "players": ["Alice", "Bob"]
}
```

### GET /api/session/:id
Get session data (includes game state)

### POST /api/session/:id
Update session metadata
```json
{
  "players": ["Alice", "Bob"],
  "scores": { "Alice": 10, "Bob": 5 }
}
```

### PUT /api/session/:id/game
Update game state (persists Cricket game)
```json
{
  "sessionId": "uuid",
  "players": [
    {
      "name": "Alice",
      "numbers": { "20": 3, "19": 2 },
      "totalScore": 15
    }
  ],
  "currentPlayerIndex": 0,
  "dartsRemaining": 3,
  "gameStarted": true,
  "gameEnded": false
}
```

## 🌐 Deployment

### Backend (Cloudflare Workers) ✅ DEPLOYED

**Live URL:** `https://cricket-scoreboard-api.my-cricket-app.workers.dev`

The backend is already deployed! To update:
```bash
cd backend
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
   - Build command: `cd frontend && npm install && npm run build`
   - Build output directory: `frontend/dist`
   - **Environment variable**: 
     - Name: `VITE_API_BASE`
     - Value: `https://cricket-scoreboard-api.my-cricket-app.workers.dev`

**OR use Wrangler:**
```bash
cd frontend
export VITE_API_BASE=https://cricket-scoreboard-api.my-cricket-app.workers.dev
npm run build
npx wrangler pages deploy dist --project-name cricket-scoreboard
```

### Custom Domain (Optional)

To use `cricket.drnatejones.com` as your API domain, see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- Configuring custom routes in wrangler.toml
- Setting up DNS records
- Using your own domain instead of workers.dev

## 🆓 Cloudflare Free Tier

This app fits within Cloudflare's generous free tier:
- **Workers**: 100,000 requests/day
- **KV**: 100,000 reads/day, 1,000 writes/day
- **Pages**: Unlimited bandwidth

With 3-second polling:
- Each active user = ~28,800 reads/day
- Supports **3+ concurrent users**
- Hundreds of games stored in KV

## 🎮 Usage

### Starting a Game

1. Visit the landing page
2. Enter player names (2-4 players)
3. Click "Start Game"
4. You'll be redirected to `/session/{uuid}`

### Multiplayer

1. Share the URL with friends
2. Everyone sees the same game in real-time
3. Game state persists across page refreshes
4. Multi-tab support - open in multiple windows

### Playing

1. Select segment (15-20 or Bull)
2. Choose hit type (Single/Double/Triple)
3. Click "Throw Dart"
4. Numbers get marked (/, X, ⊗)
5. Closed numbers show 🔒 or ~~strikethrough~~
6. Game ends when someone closes all numbers and leads in points

## 🎯 Game Features

### Visual Indicators
- `/` = 1 mark
- `X` = 2 marks
- `⊗` = 3 marks (closed)
- `🔒` = Locked (opponent hasn't closed yet)
- `~~Score~~` = Locked with points scored

### Scoring Rules
- **Opening**: Hit a number 3 times to "open" it
- **Points**: Excess marks score as points (if opponent hasn't closed)
- **Defensive Closing**: Can't close a number while behind in points
- **Winning**: Close all numbers + have most points

## 🔧 Configuration

### Polling Interval
Edit `frontend/src/hooks/useSession.ts`:
```typescript
const POLL_INTERVAL = 3000 // milliseconds
```

### Session Data Structure
See `frontend/src/types.ts` and `backend/src/types.ts`:
```typescript
interface Session {
  sessionId: string
  players: string[]
  scores: Record<string, number>
  metadata: Record<string, unknown>
  cricketGame?: CricketGameState  // Persisted game state
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
- Happy DOM

### Backend
- Cloudflare Workers
- Cloudflare KV (persistent storage)
- TypeScript 5
- Vitest + @cloudflare/vitest-pool-workers
- Miniflare (local development & testing)

## 🏆 Development Approach

This project follows **Test-Driven Development (TDD)**:

1. ✅ Write failing test
2. ✅ Implement minimal code to pass
3. ✅ Refactor
4. ✅ Repeat

All features were built test-first, resulting in:
- 101 tests with 100% pass rate
- High confidence in code correctness
- Easy refactoring
- Living documentation

## 🐛 Known Limitations

- **In-Memory**: Game state resets if Worker is evicted (rare with KV persistence)
- **Polling**: 3-second delay for updates (vs WebSockets)
- **No Authentication**: Anyone with URL can join/modify game
- **KV Eventual Consistency**: Updates may take 60s to propagate globally

## 🤝 Contributing

This is a TDD project. Always write tests first:

1. Write failing test
2. Implement feature
3. Verify test passes
4. Refactor if needed
5. Run full test suite: `npm test`

## 📄 License

MIT

## 🙏 Acknowledgments

Built with modern web technologies:
- Cloudflare Workers & KV (serverless, edge computing)
- React & TypeScript (type-safe UI)
- Vitest (fast, modern testing)
- TDD practices (reliable, maintainable code)
