const pool = require('../db/pool');
const movieService = require('./movieService');

async function getWatchlist(userId) {
  const result = await pool.query(
    'SELECT movie_id FROM watchlist WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  const movies = await Promise.all(
    result.rows.map((row) => movieService.getMovie(row.movie_id).catch(() => null))
  );

  return movies.filter(Boolean);
}

async function addToWatchlist(userId, movieId) {
  await movieService.getMovie(movieId);
  await pool.query(
    `
      INSERT INTO watchlist (user_id, movie_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, movie_id) DO NOTHING
    `,
    [userId, movieId]
  );
}

async function removeFromWatchlist(userId, movieId) {
  await pool.query(
    'DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2',
    [userId, movieId]
  );
}

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
