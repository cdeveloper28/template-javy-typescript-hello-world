require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.static('.'));

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

// Validate API key on startup
if (!OMDB_API_KEY || OMDB_API_KEY.length < 8) {
  console.error('Error: Invalid or missing OMDb API key. Please check your .env file');
  process.exit(1);
}

// GET /api/genres
app.get('/api/genres', (req, res) => {
  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi',
    'Thriller', 'War', 'Western'
  ];
  res.json({ genres });
});

// GET /api/movies?genre=GENRE
app.get('/api/movies', async (req, res) => {
  const { genre } = req.query;
  if (!genre) {
    return res.status(400).json({ error: 'Genre parameter is required' });
  }

  try {
    console.log(`Fetching movies for genre: ${genre}`);
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: genre,
        type: 'movie',
        page: 1
      }
    });

    console.log('OMDb API Response:', response.data);

    if (response.data.Response === 'False') {
      return res.json({ 
        movies: [],
        error: response.data.Error || 'No movies found'
      });
    }

    // Fetch detailed information for each movie to get ratings
    const movies = await Promise.all(
      response.data.Search.slice(0, 10).map(async (movie) => {
        const detailsResponse = await axios.get(OMDB_BASE_URL, {
          params: {
            apikey: OMDB_API_KEY,
            i: movie.imdbID,
            plot: 'short'
          }
        });

        const movieDetails = detailsResponse.data;
        const rating = movieDetails.imdbRating !== 'N/A' ? parseFloat(movieDetails.imdbRating) : 0;
        const plot = movieDetails.Plot !== 'N/A' ? movieDetails.Plot : 'Click to see details';

        return {
          title: movie.Title,
          genre: genre,
          rating: rating,
          poster: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster',
          description: plot
        };
      })
    );

    res.json({ movies });
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    if (error.response) {
      console.error('OMDb API Error:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch movies',
      details: error.message
    });
  }
});

// GET /api/suggestions
app.get('/api/suggestions', async (req, res) => {
  try {
    const popularGenres = ['Horror', 'Romance', 'Comedy', 'Action', 'Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Romance', 'Comedy', 'Action', 'Drama', 'Sci-Fi', 'Thriller', 'Horrors',  'Mystery', 'Romance', 'Sci-Fi',
      'Thriller', 'War'];
    const suggestions = [];

    for (const genre of popularGenres) {
      const response = await axios.get(OMDB_BASE_URL, {
        params: {
          apikey: OMDB_API_KEY,
          s: genre,
          type: 'movie',
          page: 2
        }
      });

      if (response.data.Response === 'True' && response.data.Search.length > 0) {
        const randomMovie = response.data.Search[
          Math.floor(Math.random() * response.data.Search.length)
        ];
        
        // Fetch detailed movie information to get the rating
        const detailsResponse = await axios.get(OMDB_BASE_URL, {
          params: {
            apikey: OMDB_API_KEY,
            i: randomMovie.imdbID,
            plot: 'short'
          }
        });

        const movieDetails = detailsResponse.data;
        const rating = movieDetails.imdbRating !== 'N/A' ? parseFloat(movieDetails.imdbRating) : 0;
        const plot = movieDetails.Plot !== 'N/A' ? movieDetails.Plot : 'Click to see details';

        suggestions.push({
          title: randomMovie.Title,
          genre: genre,
          rating: rating,
          poster: randomMovie.Poster !== 'N/A' ? randomMovie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster',
          description: plot
        });
      }
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error.message);
    if (error.response) {
      console.error('OMDb API Error:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch suggestions',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using OMDb API key: ${OMDB_API_KEY.substring(0, 4)}...`);
}); 