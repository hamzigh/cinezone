const pool = require('../db/pool');
const HttpError = require('../utils/httpError');

function toPublicReview(row) {
  return {
    id: row.id,
    movieId: row.movie_id,
    userId: row.user_id,
    userName: row.user_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function validate({ rating, comment }) {
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    throw new HttpError(400, 'Rating must be a whole number between 1 and 5');
  }
  const c = String(comment || '').trim();
  if (c.length < 10) throw new HttpError(400, 'Comment must be at least 10 characters');
  if (c.length > 500) throw new HttpError(400, 'Comment must be 500 characters or fewer');
  return { rating: r, comment: c };
}

async function getReviews(movieId) {
  const result = await pool.query(
    `SELECT r.id, r.movie_id, r.user_id, u.name AS user_name,
            r.rating, r.comment, r.created_at, r.updated_at
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.movie_id = $1
     ORDER BY r.created_at DESC`,
    [movieId]
  );
  return result.rows.map(toPublicReview);
}

async function createReview(userId, movieId, body) {
  const { rating, comment } = validate(body);
  try {
    const result = await pool.query(
      `INSERT INTO reviews (movie_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, movie_id, user_id, rating, comment, created_at, updated_at`,
      [movieId, userId, rating, comment]
    );
    const row = result.rows[0];
    const nameResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    return toPublicReview({ ...row, user_name: nameResult.rows[0]?.name });
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'You have already reviewed this movie');
    throw err;
  }
}

async function updateReview(id, userId, body) {
  const { rating, comment } = validate(body);
  const result = await pool.query(
    `UPDATE reviews
     SET rating = $1, comment = $2, updated_at = now()
     WHERE id = $3 AND user_id = $4
     RETURNING id, movie_id, user_id, rating, comment, created_at, updated_at`,
    [rating, comment, id, userId]
  );
  if (!result.rows[0]) throw new HttpError(404, 'Review not found or not yours');
  const row = result.rows[0];
  const nameResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
  return toPublicReview({ ...row, user_name: nameResult.rows[0]?.name });
}

async function deleteReview(id, userId) {
  const result = await pool.query(
    'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  if (!result.rows[0]) throw new HttpError(404, 'Review not found or not yours');
}

module.exports = { getReviews, createReview, updateReview, deleteReview };
