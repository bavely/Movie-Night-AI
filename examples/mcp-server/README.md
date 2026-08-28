# Example Implementation: MCP Server Code Files

This directory contains reference implementations for the MCP server integration.

## Files in this directory:

### 1. `http-server.example.ts`
HTTP API server that your Angular app will connect to. This is the main server that provides the `/api/recommend-movies` endpoint.

### 2. `index.example.ts`
MCP stdio server for Claude Desktop integration. This allows Claude Desktop to use your movie recommendation tools.

### 3. `tsconfig.example.json`
TypeScript configuration for the MCP server.

### 4. `.env.example`
Environment variables template. Copy this to `.env` and fill in your API keys.

### 5. `package.example.json`
Package.json configuration for the MCP server with all necessary dependencies and scripts.

## How to Use These Examples

1. **Create the mcp-server directory:**
   ```bash
   mkdir -p mcp-server/src
   ```

2. **Copy example files:**
   ```bash
   # From the project root
   cp examples/mcp-server/package.example.json mcp-server/package.json
   cp examples/mcp-server/tsconfig.example.json mcp-server/tsconfig.json
   cp examples/mcp-server/.env.example mcp-server/.env
   cp examples/mcp-server/http-server.example.ts mcp-server/src/http-server.ts
   cp examples/mcp-server/index.example.ts mcp-server/src/index.ts
   ```

3. **Edit `.env` and add your API keys**

4. **Install dependencies:**
   ```bash
   cd mcp-server
   npm install
   ```

5. **Run the server:**
   ```bash
   npm run dev
   ```

## What Each File Does

### http-server.example.ts
- Creates Express server on port 3001
- Handles `/api/recommend-movies` endpoint
- Uses OpenAI to generate recommendations
- Fetches movie details from TMDB
- Returns structured JSON response

### index.example.ts  
- Creates MCP stdio server for Claude Desktop
- Defines tools: `recommend_movies` and `search_movie`
- Handles tool calls from Claude
- Same logic as HTTP server but uses MCP protocol

### Environment Variables
Required in `.env`:
- `OPENAI_API_KEY` - Your OpenAI API key
- `TMDB_API_KEY` - Your TMDB API key (with "Bearer " prefix)
- `MCP_SERVER_PORT` - Port for HTTP server (default: 3001)
- `ALLOWED_ORIGINS` - CORS origins (default: http://localhost:4200)

## Integration with Angular App

After setting up the MCP server, update your Angular app:

### Update `src/app/pages/mia/mia.service.ts`:
```typescript
private mcpServerUrl = 'http://localhost:3001';

async openAiCallViaMCP(prompt: string): Promise<any> {
  return this.http.post(`${this.mcpServerUrl}/api/recommend-movies`, {
    query: prompt,
    count: 3
  }).toPromise();
}
```

### Update `src/app/pages/mia/mia.component.ts`:
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

## Testing

1. Start MCP server: `cd mcp-server && npm run dev`
2. Start Angular app: `npm run dev` (from project root)
3. Navigate to http://localhost:4200/mia
4. Test with: "Recommend some action movies"

## Next Steps

See the full guides:
- [Quick Start Guide](../../QUICK_START_MCP.md)
- [Complete Integration Guide](../../MCP_INTEGRATION_GUIDE.md)
