# Architecture Diagrams

## Current Architecture (Before MCP Integration)

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Angular App (localhost:4200)                │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  MIA Component (mia.component.ts)            │   │   │
│  │  │  - Chat interface                            │   │   │
│  │  │  - Message display                           │   │   │
│  │  │  - User input handling                       │   │   │
│  │  └──────────────┬───────────────────────────────┘   │   │
│  │                 │                                    │   │
│  │  ┌──────────────▼───────────────────────────────┐   │   │
│  │  │  MIA Service (mia.service.ts)                │   │   │
│  │  │  - openAiCall() - Direct API call           │   │   │
│  │  │  - getData() - TMDB search                  │   │   │
│  │  └──────────────┬───────────────────────────────┘   │   │
│  │                 │                                    │   │
│  └─────────────────┼────────────────────────────────────┘   │
│                    │                                        │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ├─────────────────────────────────┐
                     │                                 │
                     ▼                                 ▼
         ┌───────────────────────┐       ┌───────────────────────┐
         │   OpenAI API          │       │   TMDB API            │
         │   (gpt-4o-mini)       │       │   (Movie Database)    │
         │                       │       │                       │
         │   ⚠️ API Key exposed  │       │   ✅ API Key secured  │
         │   in browser code!    │       │   via interceptor     │
         └───────────────────────┘       └───────────────────────┘

Issues with Current Architecture:
❌ OpenAI API key exposed in browser (security risk)
❌ All AI logic happens in browser (limited control)
❌ Hard to switch AI providers
❌ No centralized AI configuration
```

---

## New Architecture (With MCP Integration)

```
┌────────────────────────────────────────────────────────────────────┐
│                            Browser                                 │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │         Angular App (localhost:4200)                      │    │
│  │                                                             │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │  MIA Component (mia.component.ts)                  │   │    │
│  │  │  - Chat interface (unchanged)                      │   │    │
│  │  │  - Message display (unchanged)                     │   │    │
│  │  │  - User input handling (unchanged)                 │   │    │
│  │  └──────────────┬─────────────────────────────────────┘   │    │
│  │                 │                                          │    │
│  │  ┌──────────────▼─────────────────────────────────────┐   │    │
│  │  │  MIA Service (mia.service.ts) - UPDATED           │   │    │
│  │  │  - openAiCallViaMCP() - New method!              │   │    │
│  │  │  - getData() - TMDB search (unchanged)            │   │    │
│  │  └──────────────┬─────────────────────────────────────┘   │    │
│  │                 │                                          │    │
│  └─────────────────┼──────────────────────────────────────────┘    │
│                    │                                               │
└────────────────────┼───────────────────────────────────────────────┘
                     │
                     │ HTTP POST /api/recommend-movies
                     │ { query: "...", count: 3 }
                     │
                     ▼
         ┌───────────────────────────────────────────────┐
         │   MCP HTTP Server (localhost:3001)            │
         │   ┌─────────────────────────────────────┐     │
         │   │  Express Server                     │     │
         │   │  - POST /api/recommend-movies       │     │
         │   │  - POST /api/search-movie           │     │
         │   │  - GET /health                      │     │
         │   └───────────┬─────────────────────────┘     │
         │               │                               │
         │   ✅ API keys stored in .env (secure!)        │
         │   ✅ Server-side AI logic                     │
         │   ✅ Easy to switch AI providers              │
         │   ✅ Centralized configuration                │
         └───────────────┼───────────────────────────────┘
                         │
                         ├─────────────────────────────────┐
                         │                                 │
                         ▼                                 ▼
             ┌───────────────────────┐       ┌───────────────────────┐
             │   OpenAI API          │       │   TMDB API            │
             │   (gpt-4o-mini)       │       │   (Movie Database)    │
             │                       │       │                       │
             │   ✅ API Key secured  │       │   ✅ API Key secured  │
             │   on server!          │       │   on server!          │
             └───────────────────────┘       └───────────────────────┘


Benefits of New Architecture:
✅ All API keys secured on server
✅ Centralized AI logic and configuration
✅ Easy to add new AI providers (Claude, Gemini, etc.)
✅ Better error handling and monitoring
✅ Can add caching and rate limiting
✅ Same UI/UX for end users
```

---

## Dual Mode: Web App + Claude Desktop

```
┌──────────────────────┐                    ┌──────────────────────┐
│   Angular Web App    │                    │   Claude Desktop     │
│   (localhost:4200)   │                    │   (Native App)       │
└──────────┬───────────┘                    └──────────┬───────────┘
           │                                           │
           │ HTTP                                      │ stdio
           │ /api/recommend-movies                     │ MCP Protocol
           │                                           │
           ▼                                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  MCP Server (Dual Mode)                          │
│  ┌────────────────────────┐      ┌────────────────────────┐     │
│  │  HTTP Server           │      │  stdio Server          │     │
│  │  (http-server.ts)      │      │  (index.ts)            │     │
│  │                        │      │                        │     │
│  │  Express endpoints:    │      │  MCP Tools:            │     │
│  │  - /api/recommend      │      │  - recommend_movies    │     │
│  │  - /api/search         │      │  - search_movie        │     │
│  └────────────────────────┘      └────────────────────────┘     │
│                                                                  │
│  Shared Logic:                                                   │
│  - OpenAI integration                                            │
│  - TMDB API integration                                          │
│  - Movie recommendation algorithm                                │
│  - Error handling                                                │
└──────────────────────────────────────────────────────────────────┘
           │
           ├──────────────────────────────┐
           │                              │
           ▼                              ▼
┌────────────────────┐        ┌────────────────────┐
│   OpenAI API       │        │   TMDB API         │
└────────────────────┘        └────────────────────┘


Use Cases:
1️⃣ Web App Users: Use familiar chat interface in browser
2️⃣ Claude Desktop Users: Use Claude's interface with movie tools
3️⃣ Both share same backend logic and data sources
```

---

## Data Flow Example

### User asks: "Recommend some sci-fi movies"

```
┌─────────────┐
│    User     │
│  (Browser)  │
└──────┬──────┘
       │ Types: "Recommend some sci-fi movies"
       │ Clicks send
       ▼
┌─────────────────────────────┐
│  MIA Component              │
│  - Displays user message    │
│  - Shows loading indicator  │
└──────┬──────────────────────┘
       │ sendMessage("Recommend some sci-fi movies")
       ▼
┌─────────────────────────────┐
│  MIA Service                │
│  - Creates HTTP request     │
└──────┬──────────────────────┘
       │ POST /api/recommend-movies
       │ { query: "Recommend some sci-fi movies", count: 3 }
       ▼
┌─────────────────────────────────────────────┐
│  MCP HTTP Server                            │
│  1. Receives request                        │
│  2. Calls OpenAI with system prompt         │
└──────┬──────────────────────────────────────┘
       │ OpenAI API Call
       │ System: "You are a movie expert..."
       │ User: "Recommend some sci-fi movies"
       ▼
┌─────────────────────────────┐
│  OpenAI API                 │
│  - Processes request        │
│  - Returns JSON:            │
│    {                        │
│      "movies": [            │
│        "Interstellar",      │
│        "The Matrix",        │
│        "Inception"          │
│      ],                     │
│      "reasoning": "..."     │
│    }                        │
└──────┬──────────────────────┘
       │ Returns recommendations
       ▼
┌─────────────────────────────────────────────┐
│  MCP HTTP Server                            │
│  3. Receives movie titles                   │
│  4. Searches TMDB for each movie            │
└──────┬──────────────────────────────────────┘
       │ Parallel TMDB API calls
       │ - Search "Interstellar"
       │ - Search "The Matrix"
       │ - Search "Inception"
       ▼
┌─────────────────────────────┐
│  TMDB API                   │
│  - Returns movie details:   │
│    - Poster URLs            │
│    - Release dates          │
│    - Overviews              │
│    - Ratings                │
└──────┬──────────────────────┘
       │ Returns movie data
       ▼
┌─────────────────────────────────────────────┐
│  MCP HTTP Server                            │
│  5. Combines AI recommendations + TMDB data │
│  6. Returns JSON response:                  │
│     {                                       │
│       "movies": [                           │
│         { id, title, poster, ... },         │
│         { id, title, poster, ... },         │
│         { id, title, poster, ... }          │
│       ],                                    │
│       "fullResponse": "Here are some..."    │
│     }                                       │
└──────┬──────────────────────────────────────┘
       │ Returns to client
       ▼
┌─────────────────────────────┐
│  MIA Service                │
│  - Receives response        │
│  - Returns to component     │
└──────┬──────────────────────┘
       │ Updates UI
       ▼
┌─────────────────────────────┐
│  MIA Component              │
│  - Displays AI message      │
│  - Shows movie posters      │
│  - Stores in localStorage   │
└──────┬──────────────────────┘
       │ Renders UI
       ▼
┌─────────────┐
│    User     │
│  (Browser)  │
│  Sees:      │
│  - AI text  │
│  - 3 movies │
└─────────────┘

Total time: ~2-4 seconds
```

---

## Deployment Architecture

### Development
```
localhost:4200 (Angular) → localhost:3001 (MCP Server) → External APIs
```

### Production
```
your-domain.com (Frontend + Backend)
├── Frontend (Angular built/served by Express)
├── MCP Server (API routes)
└── External APIs
    ├── OpenAI
    └── TMDB
```

---

## Technology Stack

### Frontend (Unchanged)
- **Framework**: Angular 18
- **UI Library**: PrimeNG
- **Styling**: Tailwind CSS
- **HTTP Client**: Angular HttpClient
- **State Management**: Local Storage

### Backend (New)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Protocol**: MCP (Model Context Protocol)
- **AI Provider**: OpenAI (switchable)
- **Movie Data**: TMDB API

### Development Tools
- **TypeScript**: Type safety
- **ts-node**: Development server
- **dotenv**: Environment management
- **CORS**: Cross-origin support
