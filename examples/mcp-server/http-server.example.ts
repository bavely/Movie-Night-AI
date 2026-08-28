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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
