# Quick Start Guide: MCP Integration with Movie Night AI

This is a condensed version of the full MCP Integration Guide. For detailed information, see [MCP_INTEGRATION_GUIDE.md](./MCP_INTEGRATION_GUIDE.md).

## What You'll Accomplish

Connect your Movie Night AI web app to an MCP (Model Context Protocol) server that can work with both:
1. **Your existing web UI** - Users interact through the current Angular interface
2. **Claude Desktop App** - AI-powered movie recommendations through Claude

---

## Prerequisites

- Node.js 18+ installed
- Movie Night AI repository cloned
- API Keys:
  - OpenAI API key OR Anthropic API key
  - TMDB API key

---

## 5-Minute Setup

### 1. Create MCP Server (2 minutes)

```bash
# From project root
mkdir mcp-server && cd mcp-server
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk openai axios express cors dotenv
npm install --save-dev typescript @types/node @types/express ts-node
```

### 2. Create Environment File (30 seconds)

Create `mcp-server/.env`:

```env
OPENAI_API_KEY=sk-proj-your-key-here
TMDB_API_KEY=Bearer your-tmdb-key-here
MCP_SERVER_PORT=3001
ALLOWED_ORIGINS=http://localhost:4200
```

### 3. Create Server Files (1 minute)

**Create `mcp-server/src/http-server.ts`:**

<details>
<summary>Click to expand code</summary>

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.MCP_SERVER_PORT || 3001;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
}));
app.use(express.json());

app.post('/api/recommend-movies', async (req, res) => {
  try {
    const { query, count = 3 } = req.body;

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
        { role: 'user', content: query },
      ],
    });

    const response = completion.choices[0].message.content || '{}';
    const movieData = JSON.parse(response);

    const movieDetails = await Promise.all(
      movieData.movies.map((title: string) => searchTMDB(title))
    );

    res.json({
      movies: movieDetails.filter(Boolean),
      reasoning: movieData.reasoning,
      fullResponse: `Here are some movies you might like: ${movieData.movies.join(', ')}. ${movieData.reasoning}`,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

async function searchTMDB(title: string) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: { query: title, include_adult: false, language: 'en-US', page: 1 },
        headers: {
          Authorization: process.env.TMDB_API_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.results[0];
  } catch (error) {
    console.error(`Error searching TMDB:`, error);
    return null;
  }
}

app.listen(PORT, () => {
  console.log(`MCP Server running on http://localhost:${PORT}`);
});
```

</details>

**Create `mcp-server/package.json` scripts section:**

```json
{
  "scripts": {
    "dev": "ts-node src/http-server.ts",
    "start": "node dist/http-server.js"
  }
}
```

### 4. Update Angular Service (1 minute)

**Modify `src/app/pages/mia/mia.service.ts`:**

```typescript
// Add this property
private mcpServerUrl = 'http://localhost:3001';

// Add this new method
async openAiCallViaMCP(prompt: string): Promise<any> {
  return this.http.post(`${this.mcpServerUrl}/api/recommend-movies`, {
    query: prompt,
    count: 3
  }).toPromise();
}
```

**Modify `src/app/pages/mia/mia.component.ts`:**

Replace the `callOpenAi()` method:

```typescript
async callOpenAi(ms: string) {
  this.featcingData = true;
  
  try {
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
    console.error('Error:', error);
  } finally {
    this.featcingData = false;
  }
}
```

### 5. Run It! (30 seconds)

```bash
# Terminal 1: Start MCP Server
cd mcp-server
npm run dev

# Terminal 2: Start Angular App
cd ..
npm run dev
```

Navigate to: http://localhost:4200/mia

---

## Testing

1. Open the MIA page in your browser
2. Type: "Recommend some sci-fi movies"
3. You should see:
   - AI analyzing your request
   - Movie recommendations appearing
   - Movie posters on the right side

---

## What's Different?

### Before (Insecure)
```
Browser → OpenAI API (API key exposed!)
```

### After (Secure)
```
Browser → MCP Server → OpenAI API (API key safe on server)
```

---

## Optional: Use with Claude Desktop

1. **Install Claude Desktop**: https://claude.ai/download

2. **Create `mcp-server/src/index.ts`** - See full guide for code

3. **Configure Claude** (macOS example):

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "movie-night": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-key",
        "TMDB_API_KEY": "your-key"
      }
    }
  }
}
```

4. **Restart Claude Desktop**

5. **Try it**: "Can you recommend some action movies?"

---

## Troubleshooting

**MCP server won't start?**
- Check `.env` file exists with valid API keys
- Ensure port 3001 is not in use

**CORS errors?**
- Verify `ALLOWED_ORIGINS` includes `http://localhost:4200`

**No movie recommendations?**
- Check MCP server terminal for errors
- Verify OpenAI API key is valid

**Movies not appearing?**
- Check TMDB API key format (must include "Bearer ")
- Look at browser console for errors

---

## Next Steps

- Read the [full integration guide](./MCP_INTEGRATION_GUIDE.md) for:
  - Production deployment
  - Advanced features
  - Security best practices
  - Detailed architecture explanations

- Enhance your MCP server:
  - Add movie ratings tool
  - Implement caching
  - Add more AI providers (Claude, Gemini)

---

## Architecture Overview

```
┌──────────────────┐
│  Angular Web UI  │  ← User interacts here (same as before)
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   MCP Server     │  ← New! Handles AI securely
│   (Node.js)      │
└────────┬─────────┘
         │
         ├─→ OpenAI (movie recommendations)
         └─→ TMDB (movie details)

┌──────────────────┐
│ Claude Desktop   │  ← Bonus! Also uses MCP server
└────────┬─────────┘
         │
         └─→ Same MCP Server (stdio mode)
```

---

## Key Benefits

✅ **Secure**: API keys stay on server, not in browser
✅ **Flexible**: Easy to switch between OpenAI, Claude, or other AI providers
✅ **Dual Use**: Same backend for web app AND Claude Desktop
✅ **Maintainable**: Standardized MCP protocol
✅ **User-Friendly**: UI stays exactly the same for users

---

## Questions?

See the [full guide](./MCP_INTEGRATION_GUIDE.md) or open an issue!
