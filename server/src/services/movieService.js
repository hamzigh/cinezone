const HttpError = require('../utils/httpError');
const imdbService = require('./imdbService');
const vidapiService = require('./vidapiService');

let cachedMovies = [];
let cachedAt = 0;
const cacheTtlMs = 15 * 60 * 1000;

async function getCatalog() {
  const now = Date.now();
  if (cachedMovies.length && now - cachedAt < cacheTtlMs) {
    return cachedMovies;
  }

  cachedMovies = await vidapiService.fetchLatestMovies();
  cachedAt = now;
  return cachedMovies;
}

function filterMovies(movies, search, genre) {
  const searchTerm = String(search || '').trim().toLowerCase();
  const genreTerm = String(genre || '').trim().toLowerCase();

  return movies.filter((movie) => {
    const matchesSearch = !searchTerm || movie.title.toLowerCase().includes(searchTerm);
    const matchesGenre = !genreTerm || movie.genre.toLowerCase().includes(genreTerm);
    return matchesSearch && matchesGenre;
  });
}

async function listMovies({ search, genre }) {
  if (search && imdbService.isConfigured()) {
    const imdbMovies = await imdbService.searchMovies(search, genre);
    if (imdbMovies?.length) {
      return imdbMovies;
    }
  }

  const catalog = await getCatalog();
  return filterMovies(catalog, search, genre).slice(0, 48);
}

async function getMovie(id) {
  const imdbMovie = await imdbService.getMovie(id);
  if (imdbMovie) {
    return imdbMovie;
  }

  const catalog = await getCatalog();
  const movie = catalog.find((item) => item.id === id);
  if (!movie) {
    throw new HttpError(404, 'Movie not found');
  }

  return movie;
}

async function getStream(id) {
  const item = await getMovie(id);
  const url = item.type === 'tv'
    ? vidapiService.getTVEmbedUrl(id)
    : vidapiService.getMovieEmbedUrl(id);
  return { url };
}

module.exports = {
  listMovies,
  getMovie,
  getStream
};
