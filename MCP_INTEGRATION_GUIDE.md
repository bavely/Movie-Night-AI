# MCP Server Integration Guide for Movie Night AI

## Table of Contents
1. [Current Architecture Overview](#current-architecture-overview)
2. [What is MCP (Model Context Protocol)](#what-is-mcp-model-context-protocol)
3. [MCP Server Setup](#mcp-server-setup)
4. [Claude AI Client Configuration](#claude-ai-client-configuration)
5. [Web App Integration](#web-app-integration)
6. [Complete Implementation Steps](#complete-implementation-steps)
7. [Testing the Integration](#testing-the-integration)

---

## Current Architecture Overview

### Existing MIA (Movies Insights Assistant) Structure

The current Movie Night AI application has the following architecture:

**Frontend (Angular 18):**
- **Component**: `src/app/pages/mia/mia.component.ts`
- **Service**: `src/app/pages/mia/mia.service.ts`
- **Template**: `src/app/pages/mia/mia.component.html`

**Current Flow:**
```
User Input → MIA Component → OpenAI API (browser) → Movie Suggestions → TMDB API → Display Results
```

**Key Features:**
- Direct OpenAI integration via browser
- Real-time chat interface
- Movie recommendations based on user preferences
- Integration with TMDB API for movie details
- Local storage for chat history

**Current API Keys Required:**
- `NG_APP_OPEN_AI_KEY` - OpenAI API key
- `NG_APP_TMDB_API_KEY` - The Movie Database API key
- `NG_APP_BRAND_FETCH` - Brand fetch API key
- `NG_APP_JUST_WATCH` - JustWatch API key

---

## What is MCP (Model Context Protocol)

**Model Context Protocol (MCP)** is an open protocol developed by Anthropic that standardizes how applications provide context to Large Language Models (LLMs). Think of it as a universal connector between your data sources and AI models.

### Key Benefits of MCP:
1. **Standardized Integration**: One protocol for all AI integrations
2. **Better Context**: Provides richer context to AI models
3. **Server-Side Processing**: More secure than browser-based API calls
4. **Tool Integration**: Allows AI to use custom tools and functions
5. **Scalability**: Easier to manage and scale

### MCP Architecture:
```
Client (Claude Desktop/Web) ↔ MCP Server ↔ Your Resources (APIs, Databases, Tools)
```

---

## MCP Server Setup

### Step 1: Install MCP Server Dependencies

First, create an MCP server directory in your project:

```bash
# From project root
mkdir mcp-server
cd mcp-server
npm init -y
```

Install required dependencies:

```bash
npm install @modelcontextprotocol/sdk openai axios express cors dotenv
npm install --save-dev typescript @types/node @types/express @types/cors ts-node
```

### Step 2: Create MCP Server Configuration

Create `mcp-server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 3: Create Environment Configuration

Create `mcp-server/.env`:

```env
# API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TMDB_API_KEY=your_tmdb_api_key_here

# Server Configuration
MCP_SERVER_PORT=3001
MCP_SERVER_HOST=localhost

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:4200
```

### Step 4: Create MCP Server Implementation

Create `mcp-server/src/index.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Define movie recommendation tool
const MOVIE_RECOMMENDATION_TOOL: Tool = {
  name: 'recommend_movies',
  description: 'Recommends movies based on user preferences, mood, genre, or specific criteria',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'User query describing their movie preferences or criteria',
      },
      count: {
        type: 'number',
        description: 'Number of movies to recommend (default: 3)',
        default: 3,
      },
    },
    required: ['query'],
  },
};

// Define movie search tool
const MOVIE_SEARCH_TOOL: Tool = {
  name: 'search_movie',
  description: 'Search for specific movies by title',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Movie title to search for',
      },
    },
    required: ['title'],
  },
};

class MovieNightMCPServer {
  private server: Server;
  private tmdbApiKey: string;

  constructor() {
    this.tmdbApiKey = process.env.TMDB_API_KEY || '';
    
    this.server = new Server(
      {
        name: 'movie-night-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [MOVIE_RECOMMENDATION_TOOL, MOVIE_SEARCH_TOOL],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'recommend_movies') {
          return await this.handleMovieRecommendation(args);
        } else if (name === 'search_movie') {
          return await this.handleMovieSearch(args);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private async handleMovieRecommendation(args: any) {
    const query = args.query as string;
    const count = (args.count as number) || 3;

    // Use OpenAI to generate movie recommendations
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a movie recommendation expert. Based on the user's query, recommend ${count} movie titles in JSON format:
{
  "movies": ["Movie Title 1", "Movie Title 2", "Movie Title 3"],
  "reasoning": "Brief explanation of why these movies match the criteria"
}`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const response = completion.choices[0].message.content || '{}';
    const movieData = JSON.parse(response);

    // Fetch movie details from TMDB
    const movieDetails = await Promise.all(
      movieData.movies.map((title: string) => this.searchTMDB(title))
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            movies: movieDetails.filter(Boolean),
            reasoning: movieData.reasoning,
            fullResponse: `Here are some movies you might like: ${movieData.movies.join(', ')}. ${movieData.reasoning}`,
          }),
        },
      ],
    };
  }

  private async handleMovieSearch(args: any) {
    const title = args.title as string;
    const movieData = await this.searchTMDB(title);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(movieData),
        },
      ],
    };
  }

  private async searchTMDB(title: string) {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie`,
        {
          params: {
            query: title,
            include_adult: false,
            language: 'en-US',
            page: 1,
          },
          headers: {
            Authorization: this.tmdbApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.results[0];
    } catch (error) {
      console.error(`Error searching TMDB for "${title}":`, error);
      return null;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Movie Night MCP server running on stdio');
  }
}

const server = new MovieNightMCPServer();
server.run().catch(console.error);
```

### Step 5: Create HTTP Server for Web Integration

Create `mcp-server/src/http-server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.MCP_SERVER_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
}));
app.use(express.json());

// Movie recommendation endpoint
app.post('/api/recommend-movies', async (req, res) => {
  try {
    const { query, count = 3 } = req.body;

    // Use OpenAI for recommendations
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a movie recommendation expert. Based on the user's query, recommend ${count} movie titles in JSON format:
{
  "movies": ["Movie Title 1", "Movie Title 2", "Movie Title 3"],
  "reasoning": "Brief explanation of why these movies match the criteria"
}`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const response = completion.choices[0].message.content || '{}';
    const movieData = JSON.parse(response);

    // Fetch movie details from TMDB
    const movieDetails = await Promise.all(
      movieData.movies.map((title: string) => searchTMDB(title))
    );

    res.json({
      movies: movieDetails.filter(Boolean),
      reasoning: movieData.reasoning,
      fullResponse: `Here are some movies you might like: ${movieData.movies.join(', ')}. ${movieData.reasoning}`,
    });
  } catch (error) {
    console.error('Error in recommend-movies:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Movie search endpoint
app.post('/api/search-movie', async (req, res) => {
  try {
    const { title } = req.body;
    const movieData = await searchTMDB(title);
    res.json(movieData);
  } catch (error) {
    console.error('Error in search-movie:', error);
    res.status(500).json({ error: 'Failed to search movie' });
  }
});

async function searchTMDB(title: string) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: {
          query: title,
          include_adult: false,
          language: 'en-US',
          page: 1,
        },
        headers: {
          Authorization: process.env.TMDB_API_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.results[0];
  } catch (error) {
    console.error(`Error searching TMDB for "${title}":`, error);
    return null;
  }
}

app.listen(PORT, () => {
  console.log(`MCP HTTP Server running on http://localhost:${PORT}`);
});
```

### Step 6: Update package.json Scripts

Edit `mcp-server/package.json` to add build and run scripts:

```json
{
  "name": "movie-night-mcp-server",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/http-server.js",
    "dev": "ts-node src/http-server.ts",
    "mcp": "ts-node src/index.ts"
  }
}
```

---

## Claude AI Client Configuration

### Option 1: Claude Desktop App (Recommended for Development)

1. **Install Claude Desktop App**
   - Download from: https://claude.ai/download
   - Install on your system

2. **Configure MCP Server**

Create/edit Claude configuration file:

**On macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**On Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "movie-night": {
      "command": "node",
      "args": [
        "/absolute/path/to/Movie-Night-AI/mcp-server/dist/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "your_openai_key",
        "TMDB_API_KEY": "your_tmdb_key"
      }
    }
  }
}
```

3. **Restart Claude Desktop App**
   - The MCP server will automatically start when Claude launches
   - You should see the movie recommendation tools available

4. **Test the Integration**
   - In Claude, ask: "Can you recommend some sci-fi movies?"
   - Claude will use the MCP server tools to provide recommendations

### Option 2: Claude API Integration (For Web App)

For integrating Claude directly in your web app:

1. **Get Anthropic API Key**
   - Sign up at https://console.anthropic.com/
   - Generate an API key

2. **Add to Environment Variables**
   ```
   NG_APP_ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

---

## Web App Integration

### Option 1: Keep Existing OpenAI Integration + Add MCP Server Backend

This approach maintains the current UI while moving AI logic to a secure backend.

#### Step 1: Update MIA Service

Edit `src/app/pages/mia/mia.service.ts`:

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MiaService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private mcpServerUrl = 'http://localhost:3001'; // MCP Server URL

  constructor(private http: HttpClient) {}

  // NEW: Use MCP Server for AI recommendations
  async openAiCallViaMCP(prompt: string): Promise<any> {
    return this.http.post(`${this.mcpServerUrl}/api/recommend-movies`, {
      query: prompt,
      count: 3
    }).toPromise();
  }

  // Keep existing method for backward compatibility
  getData(keyword: string[]): Observable<any> {
    let requests = keyword.map(k => 
      this.http.get(`${this.baseUrl}/search/movie?query=${k}&include_adult=false&language=en-US&page=1`)
    );
    return forkJoin(requests);
  }
}
```

#### Step 2: Update MIA Component

Edit `src/app/pages/mia/mia.component.ts`:

```typescript
async callOpenAi(ms: string) {
  this.featcingData = true;
  
  try {
    // Use MCP Server instead of direct OpenAI call
    const response = await this.mianservice.openAiCallViaMCP(ms);
    
    this.isInit = false;
    this.sugestedMovies = response.movies || [];
    
    this.messages = [
      ...this.messages,
      {
        id: Math.floor(Math.random() * 1000),
        message: response.fullResponse || "",
        roll: "mia",
        time: format(new Date(), 'Pp')
      }
    ];
    
    localStorage.setItem('messages', JSON.stringify(this.messages));
    localStorage.setItem('sugestedMovies', JSON.stringify(this.sugestedMovies));
  } catch (error) {
    console.error('Error calling MCP server:', error);
    this.messages = [
      ...this.messages,
      {
        id: Math.floor(Math.random() * 1000),
        message: "Sorry, I encountered an error. Please try again.",
        roll: "mia",
        time: format(new Date(), 'Pp')
      }
    ];
  } finally {
    this.featcingData = false;
  }
}
```

### Option 2: Use Claude AI via Anthropic API

To use Claude directly instead of OpenAI:

#### Step 1: Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

#### Step 2: Create Claude Service

Create `src/app/services/claude.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import Anthropic from '@anthropic-ai/sdk';

@Injectable({
  providedIn: 'root'
})
export class ClaudeService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: import.meta.env['NG_APP_ANTHROPIC_API_KEY'],
      dangerouslyAllowBrowser: true // Only for development
    });
  }

  async getMovieRecommendations(prompt: string): Promise<any> {
    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a movie recommendation expert. Based on this request: "${prompt}", recommend 3 movies in JSON format:
{
  "movies": ["Movie Title 1", "Movie Title 2", "Movie Title 3"],
  "fullResponse": "A friendly response with your recommendations"
}`
        }
      ]
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Unexpected response format');
  }
}
```

---

## Complete Implementation Steps

### Step-by-Step Guide to Integrate MCP with Your Web App

#### Phase 1: MCP Server Setup (Backend)

1. **Create MCP Server Directory**
   ```bash
   cd /path/to/Movie-Night-AI
   mkdir mcp-server
   cd mcp-server
   npm init -y
   ```

2. **Install Dependencies**
   ```bash
   npm install @modelcontextprotocol/sdk openai axios express cors dotenv
   npm install --save-dev typescript @types/node @types/express @types/cors ts-node
   ```

3. **Create Configuration Files**
   - Copy the `tsconfig.json` configuration from Step 2 above
   - Copy the `.env` file template from Step 3 above
   - Add your actual API keys to `.env`

4. **Create Server Files**
   - Create `src/index.ts` (MCP stdio server)
   - Create `src/http-server.ts` (HTTP API server)
   - Copy the code from Steps 4 and 5 above

5. **Build and Test**
   ```bash
   npm run build
   npm run dev  # Start HTTP server
   ```

#### Phase 2: Claude Desktop Configuration (Optional)

1. **Install Claude Desktop**
   - Download and install from https://claude.ai/download

2. **Configure MCP Server**
   - Edit Claude config file (location based on OS)
   - Add Movie Night MCP server configuration
   - Restart Claude Desktop

3. **Test in Claude Desktop**
   - Open Claude Desktop
   - Ask for movie recommendations
   - Verify it uses your MCP tools

#### Phase 3: Web App Integration

1. **Update Environment Variables**
   - Add MCP server URL to environment config
   - Update `.gitignore` to exclude sensitive files

2. **Update MIA Service**
   - Modify `mia.service.ts` to use MCP HTTP endpoint
   - Keep backward compatibility with existing methods

3. **Update MIA Component**
   - Modify `callOpenAi()` method to use new service
   - Add error handling for MCP server failures

4. **Test the Integration**
   ```bash
   # Terminal 1: Start MCP Server
   cd mcp-server
   npm run dev

   # Terminal 2: Start Angular App
   cd ..
   npm run dev
   ```

5. **Verify Everything Works**
   - Navigate to http://localhost:4200/mia
   - Send a message: "Recommend some action movies"
   - Verify movies appear and chat works

#### Phase 4: Production Deployment

1. **Update Main Server**
   - Modify `server.js` to proxy MCP requests
   - Add MCP server as a middleware

2. **Environment Configuration**
   - Use production API keys
   - Configure CORS properly
   - Set up environment variables on hosting platform

3. **Build and Deploy**
   ```bash
   # Build MCP Server
   cd mcp-server
   npm run build

   # Build Angular App
   cd ..
   npm run build

   # Deploy to your hosting platform
   ```

---

## Testing the Integration

### Local Testing Checklist

- [ ] MCP HTTP server starts without errors
- [ ] Angular app can connect to MCP server
- [ ] Movie recommendations work correctly
- [ ] Chat interface displays responses
- [ ] Movie details are fetched from TMDB
- [ ] Error handling works properly
- [ ] Chat history persists in localStorage

### Claude Desktop Testing

- [ ] Claude Desktop recognizes MCP server
- [ ] Tools appear in Claude's interface
- [ ] `recommend_movies` tool works
- [ ] `search_movie` tool works
- [ ] Responses include movie details

### Production Readiness

- [ ] All API keys secured (not in code)
- [ ] CORS configured properly
- [ ] Error logging implemented
- [ ] Rate limiting added (if needed)
- [ ] Health check endpoint created
- [ ] Documentation updated

---

## Architecture Diagram

### Current Architecture (Before MCP)
```
┌─────────────┐
│   Browser   │
│   (Angular) │
└──────┬──────┘
       │
       ├─→ OpenAI API (Direct, insecure)
       │
       └─→ TMDB API
```

### New Architecture (With MCP)
```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Browser   │────→│  MCP Server  │────→│  OpenAI    │
│   (Angular) │     │   (Node.js)  │     │    API     │
└─────────────┘     └──────┬───────┘     └────────────┘
                           │
                           ├─→ TMDB API
                           │
                           └─→ Other APIs

┌─────────────┐     ┌──────────────┐
│   Claude    │────→│  MCP Server  │ (stdio)
│  Desktop    │     │   (stdio)    │
└─────────────┘     └──────────────┘
```

### Benefits of New Architecture

1. **Security**: API keys stored server-side, not exposed in browser
2. **Flexibility**: Can switch AI providers (OpenAI, Claude, etc.)
3. **Standardization**: MCP protocol makes integration consistent
4. **Desktop Integration**: Same backend works with Claude Desktop
5. **Scalability**: Easier to add new AI features and tools

---

## Troubleshooting

### Common Issues

**Issue**: MCP server not starting
- **Solution**: Check if all dependencies are installed, verify `.env` file exists with correct keys

**Issue**: CORS errors in browser
- **Solution**: Ensure `ALLOWED_ORIGINS` in `.env` includes your Angular dev server URL

**Issue**: Claude Desktop doesn't see MCP server
- **Solution**: Check config file path, ensure absolute paths are used, restart Claude Desktop

**Issue**: Movie recommendations not working
- **Solution**: Verify OpenAI API key is valid, check server logs for errors

**Issue**: TMDB API errors
- **Solution**: Confirm TMDB API key format (should include "Bearer " prefix)

---

## Next Steps

1. **Enhance MCP Server**
   - Add more tools (movie ratings, reviews, etc.)
   - Implement caching for better performance
   - Add analytics and logging

2. **Improve UI**
   - Add loading indicators
   - Implement retry logic
   - Show AI reasoning/thinking process

3. **Add Features**
   - Watchlist integration
   - Personalized recommendations based on history
   - Multi-language support
   - Social features (share recommendations)

4. **Production Optimization**
   - Add Redis caching
   - Implement API rate limiting
   - Set up monitoring and alerts
   - Configure CDN for static assets

---

## Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Anthropic MCP SDK](https://github.com/anthropics/modelcontextprotocol)
- [Claude API Documentation](https://docs.anthropic.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [TMDB API Documentation](https://developers.themoviedb.org/3)

---

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review MCP server logs for errors
3. Open an issue in the GitHub repository
4. Consult the official MCP documentation

---

**Last Updated**: January 2026
**Version**: 1.0.0
