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
