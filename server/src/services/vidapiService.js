const env = require('../config/env');

function assertOk(response, label) {
  if (!response.ok) {
    throw new Error(`${label} failed with status ${response.status}`);
  }
}

function normalizeVidapiMovie(item) {
  const posterUrl = item.poster_url || '';

  return {
    id: item.imdb_id || String(item.tmdb_id),
    title: item.title || 'Untitled',
    year: Number.parseInt(item.year, 10) || 0,
    genre: item.genre || 'Movie',
    rating: Number.parseFloat(item.rating) || 0,
    posterUrl,
    backdropUrl: item.backdrop_url || posterUrl,
    description: item.description || `${item.title || 'This movie'} is available to stream on CineZone.`,
    cast: Array.isArray(item.cast) ? item.cast : [],
    type: item.type === 'tv' ? 'tv' : 'movie'
  };
}

async function fetchLatestMovies(pages = 10) {
  const movies = [];

  for (let page = 1; page <= pages; page += 1) {
    const url = `${env.vidapiBaseUrl}/movies/latest/page-${page}.json`;
    const response = await fetch(url);
    assertOk(response, 'VidAPI latest movies');
    const data = await response.json();

    movies.push(...(data.items || []).map(normalizeVidapiMovie));
    if (!data.total_pages || page >= data.total_pages) break;
  }

  return movies;
}

function getMovieEmbedUrl(id) {
  return `${env.vidapiPlayerBaseUrl}/embed/movie?imdb=${encodeURIComponent(id)}`;
}

function getTVEmbedUrl(id) {
  return `${env.vidapiPlayerBaseUrl}/embed/tv?imdb=${encodeURIComponent(id)}`;
}

module.exports = {
  fetchLatestMovies,
  getMovieEmbedUrl,
  getTVEmbedUrl,
  normalizeVidapiMovie
};
