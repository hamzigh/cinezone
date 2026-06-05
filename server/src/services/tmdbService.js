const env = require('../config/env');

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western'
};

const IMG_BASE = 'https://image.tmdb.org/t/p';

function isConfigured() {
  return Boolean(env.tmdb.apiKey);
}

function posterUrl(path) {
  return path ? `${IMG_BASE}/w500${path}` : '';
}

function backdropUrl(path, fallback) {
  return path ? `${IMG_BASE}/w1280${path}` : fallback;
}

function mapSearchResult(item) {
  const poster = posterUrl(item.poster_path);
  const genres = (item.genre_ids || [])
    .map(id => GENRE_MAP[id])
    .filter(Boolean)
    .join(', ') || 'Movie';

  return {
    id: String(item.id),
    title: item.title || item.original_title || 'Untitled',
    year: item.release_date ? Number(item.release_date.slice(0, 4)) : 0,
    genre: genres,
    rating: Number(item.vote_average) || 0,
    posterUrl: poster,
    backdropUrl: backdropUrl(item.backdrop_path, poster),
    description: item.overview || '',
    cast: [],
    type: 'movie'
  };
}

function mapDetail(item) {
  const poster = posterUrl(item.poster_path);
  return {
    id: String(item.id),
    title: item.title || item.original_title || 'Untitled',
    year: item.release_date ? Number(item.release_date.slice(0, 4)) : 0,
    genre: (item.genres || []).map(g => g.name).join(', ') || 'Movie',
    rating: Number(item.vote_average) || 0,
    posterUrl: poster,
    backdropUrl: backdropUrl(item.backdrop_path, poster),
    description: item.overview || '',
    cast: (item.credits?.cast || []).slice(0, 8).map(c => c.name),
    type: 'movie'
  };
}

async function apiFetch(path) {
  const url = `https://api.themoviedb.org/3${path}${path.includes('?') ? '&' : '?'}api_key=${env.tmdb.apiKey}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function searchMovies(query, genre) {
  if (!isConfigured() || !query) return null;

  const data = await apiFetch(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false&page=1`);
  if (!data?.results?.length) return null;

  let results = data.results.slice(0, 48).map(mapSearchResult);

  if (genre) {
    results = results.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
  }

  return results;
}

async function getMovie(id) {
  if (!isConfigured()) return null;
  const data = await apiFetch(`/movie/${id}?append_to_response=credits`);
  return data ? mapDetail(data) : null;
}

module.exports = { isConfigured, searchMovies, getMovie };
