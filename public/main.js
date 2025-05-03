const API_BASE = 'https://violet-sparrow-avivah-up4aa4r4.bls.dev/api';

const genreButtons = document.getElementById('genre-buttons');
const moviesGrid = document.getElementById('movies-grid');
const suggestionsGrid = document.getElementById('suggestions-grid');
const recMessage = document.getElementById('rec-message');

// SVG icon mapping for genres (fallback to icon-film)
const genreIcons = {
  'Action': 'icon-action',
  'Adventure': 'icon-adventure',
  'Comedy': 'icon-comedy',
  'Crime': 'icon-crime',
  'Drama': 'icon-drama',
  'Family': 'icon-family',
  'Fantasy': 'icon-fantasy',
  'History': 'icon-history',
  'Horror': 'icon-horror',
  'Musical': 'icon-musical',
  'Mystery': 'icon-mystery',
  'Romance': 'icon-romance',
  'Sci-Fi': 'icon-scifi',
  'Animation': 'icon-animation',
  'Documentary': 'icon-documentary',
};

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.tabIndex = 0;

  const poster = document.createElement('img');
  poster.className = 'movie-poster';
  poster.src = movie.poster;
  poster.alt = `${movie.title} poster`;

  const info = document.createElement('div');
  info.className = 'movie-info';

  // Title
  const title = document.createElement('div');
  title.className = 'movie-title';
  title.innerText = movie.title;

  // Genre
  const genre = document.createElement('div');
  genre.className = 'movie-genre';
  const genreIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  genreIcon.setAttribute('width', '18');
  genreIcon.setAttribute('height', '18');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `icons.svg#${genreIcons[movie.genre] || 'icon-film'}`);
  genreIcon.appendChild(use);
  genre.appendChild(genreIcon);
  genre.appendChild(document.createTextNode(movie.genre));

  // Rating
  const rating = document.createElement('div');
  rating.className = 'movie-rating';
  const starIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  starIcon.setAttribute('width', '18');
  starIcon.setAttribute('height', '18');
  const useStar = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  useStar.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'icons.svg#icon-star');
  starIcon.appendChild(useStar);
  rating.appendChild(starIcon);
  rating.appendChild(document.createTextNode(movie.rating.toFixed(1)));

  // Description
  const desc = document.createElement('div');
  desc.className = 'movie-desc';
  desc.innerText = movie.description;

  info.appendChild(title);
  info.appendChild(genre);
  info.appendChild(rating);
  info.appendChild(desc);

  card.appendChild(poster);
  card.appendChild(info);

  return card;
}

function createGenreButton(genre) {
  const button = document.createElement('button');
  button.className = 'genre-button';
  button.setAttribute('data-genre', genre);
  
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('width', '24');
  icon.setAttribute('height', '24');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `icons.svg#${genreIcons[genre] || 'icon-film'}`);
  icon.appendChild(use);
  
  const text = document.createElement('span');
  text.textContent = genre;
  
  button.appendChild(icon);
  button.appendChild(text);
  
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    document.querySelectorAll('.genre-button').forEach(btn => {
      btn.classList.remove('active');
    });
    // Add active class to clicked button
    button.classList.add('active');
    fetchMovies(genre);
  });
  
  return button;
}

async function fetchGenres() {
  try {
    const res = await fetch(`${API_BASE}/genres`);
    const data = await res.json();
    genreButtons.innerHTML = '';
    data.genres.forEach(genre => {
      genreButtons.appendChild(createGenreButton(genre));
    });
  } catch (e) {
    genreButtons.innerHTML = '<div class="message">Failed to load genres</div>';
  }
}

async function fetchMovies(genre) {
  moviesGrid.innerHTML = '';
  recMessage.textContent = '';
  if (!genre) return;
  try {
    const res = await fetch(`${API_BASE}/movies?genre=${encodeURIComponent(genre)}`);
    if (!res.ok) {
      const err = await res.json();
      recMessage.textContent = err.error || 'Failed to fetch movies.';
      return;
    }
    const data = await res.json();
    if (!data.movies.length) {
      recMessage.textContent = 'No movies found for this genre.';
      return;
    }
    data.movies.forEach((movie, i) => {
      setTimeout(() => {
        moviesGrid.appendChild(createMovieCard(movie));
      }, i * 80);
    });
  } catch (e) {
    recMessage.textContent = 'Failed to fetch movies.';
  }
}

async function fetchSuggestions() {
  suggestionsGrid.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}/suggestions`);
    const data = await res.json();
    data.suggestions.forEach((movie, i) => {
      setTimeout(() => {
        suggestionsGrid.appendChild(createMovieCard(movie));
      }, i * 80);
    });
  } catch (e) {
    suggestionsGrid.innerHTML = '<div class="message">Failed to load suggestions.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchGenres();
  fetchSuggestions();
}); 