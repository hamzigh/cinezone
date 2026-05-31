const pool = require('../db/pool');
const HttpError = require('../utils/httpError');

function toCollection(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    itemCount: Number(row.item_count ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toItem(row) {
  return {
    collectionId: row.collection_id,
    movieId: row.movie_id,
    movieTitle: row.movie_title,
    moviePosterUrl: row.movie_poster_url,
    addedAt: row.added_at
  };
}

function validateName(name) {
  const clean = String(name || '').trim();
  if (!clean) throw new HttpError(400, 'Collection name is required');
  if (clean.length > 100) throw new HttpError(400, 'Name must be 100 characters or fewer');
  return clean;
}

async function getUserCollections(userId) {
  const result = await pool.query(
    `SELECT c.id, c.user_id, c.name, c.created_at, c.updated_at,
            COUNT(ci.movie_id)::int AS item_count
     FROM collections c
     LEFT JOIN collection_items ci ON ci.collection_id = c.id
     WHERE c.user_id = $1
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    [userId]
  );
  return result.rows.map(toCollection);
}

async function getCollection(id, userId) {
  const colResult = await pool.query(
    'SELECT * FROM collections WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!colResult.rows[0]) throw new HttpError(404, 'Collection not found');

  const itemsResult = await pool.query(
    'SELECT * FROM collection_items WHERE collection_id = $1 ORDER BY added_at DESC',
    [id]
  );

  return {
    ...toCollection({ ...colResult.rows[0], item_count: itemsResult.rowCount }),
    items: itemsResult.rows.map(toItem)
  };
}

async function getCollectionsContaining(userId, movieId) {
  const result = await pool.query(
    `SELECT ci.collection_id
     FROM collection_items ci
     JOIN collections c ON ci.collection_id = c.id
     WHERE c.user_id = $1 AND ci.movie_id = $2`,
    [userId, movieId]
  );
  return result.rows.map(r => r.collection_id);
}

async function createCollection(userId, { name }) {
  const cleanName = validateName(name);
  const result = await pool.query(
    'INSERT INTO collections (user_id, name) VALUES ($1, $2) RETURNING *',
    [userId, cleanName]
  );
  return toCollection({ ...result.rows[0], item_count: 0 });
}

async function renameCollection(id, userId, { name }) {
  const cleanName = validateName(name);
  const result = await pool.query(
    `UPDATE collections SET name = $1, updated_at = now()
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [cleanName, id, userId]
  );
  if (!result.rows[0]) throw new HttpError(404, 'Collection not found');

  const countResult = await pool.query(
    'SELECT COUNT(movie_id)::int AS item_count FROM collection_items WHERE collection_id = $1',
    [id]
  );
  return toCollection({ ...result.rows[0], item_count: countResult.rows[0].item_count });
}

async function deleteCollection(id, userId) {
  const result = await pool.query(
    'DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  if (!result.rows[0]) throw new HttpError(404, 'Collection not found');
}

async function addItem(collectionId, userId, { movieId, movieTitle, moviePosterUrl }) {
  const col = await pool.query(
    'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
    [collectionId, userId]
  );
  if (!col.rows[0]) throw new HttpError(404, 'Collection not found');

  await pool.query(
    `INSERT INTO collection_items (collection_id, movie_id, movie_title, movie_poster_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (collection_id, movie_id) DO NOTHING`,
    [collectionId, movieId, String(movieTitle || ''), String(moviePosterUrl || '')]
  );
}

async function removeItem(collectionId, userId, movieId) {
  const col = await pool.query(
    'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
    [collectionId, userId]
  );
  if (!col.rows[0]) throw new HttpError(404, 'Collection not found');

  await pool.query(
    'DELETE FROM collection_items WHERE collection_id = $1 AND movie_id = $2',
    [collectionId, movieId]
  );
}

module.exports = {
  getUserCollections,
  getCollection,
  getCollectionsContaining,
  createCollection,
  renameCollection,
  deleteCollection,
  addItem,
  removeItem
};
