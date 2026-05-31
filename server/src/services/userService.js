const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const HttpError = require('../utils/httpError');
const { signUser } = require('./tokenService');

function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email
  };
}

async function signup({ name, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();

  if (!cleanName || !normalizedEmail || !password) {
    throw new HttpError(400, 'Name, email, and password are required');
  }

  if (String(password).length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await pool.query(
      `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email
      `,
      [cleanName, normalizedEmail, passwordHash]
    );

    const user = toPublicUser(result.rows[0]);
    return { token: signUser(user), user };
  } catch (err) {
    if (err.code === '23505') {
      throw new HttpError(409, 'An account with that email already exists');
    }
    throw err;
  }
}

async function login({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new HttpError(400, 'Email and password are required');
  }

  const result = await pool.query(
    'SELECT id, name, email, password_hash FROM users WHERE email = $1',
    [normalizedEmail]
  );

  const row = result.rows[0];
  if (!row) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, row.password_hash);
  if (!isValid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const user = toPublicUser(row);
  return { token: signUser(user), user };
}

async function getProfile(id) {
  const result = await pool.query(
    'SELECT id, name, email, preferred_genres FROM users WHERE id = $1',
    [id]
  );
  const row = result.rows[0];
  if (!row) throw new HttpError(404, 'User not found');
  return { id: row.id, name: row.name, email: row.email, preferredGenres: row.preferred_genres || [] };
}

async function updateProfile(id, { name, email }) {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanName || !cleanEmail) throw new HttpError(400, 'Name and email are required');

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = now() WHERE id = $3 RETURNING id, name, email',
      [cleanName, cleanEmail, id]
    );
    if (!result.rows[0]) throw new HttpError(404, 'User not found');
    return toPublicUser(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'That email is already in use');
    throw err;
  }
}

async function changePassword(id, { currentPassword, newPassword }) {
  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
  const row = result.rows[0];
  if (!row) throw new HttpError(404, 'User not found');

  const isValid = await bcrypt.compare(currentPassword, row.password_hash);
  if (!isValid) throw new HttpError(401, 'Current password is incorrect');

  if (String(newPassword).length < 6) throw new HttpError(400, 'New password must be at least 6 characters');

  const newHash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [newHash, id]);
}

async function updatePreferences(id, preferredGenres) {
  const genres = Array.isArray(preferredGenres) ? preferredGenres : [];
  await pool.query('UPDATE users SET preferred_genres = $1, updated_at = now() WHERE id = $2', [genres, id]);
}

async function deleteAccount(id, password) {
  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
  const row = result.rows[0];
  if (!row) throw new HttpError(404, 'User not found');

  const isValid = await bcrypt.compare(password, row.password_hash);
  if (!isValid) throw new HttpError(401, 'Incorrect password');

  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { signup, login, getProfile, updateProfile, changePassword, updatePreferences, deleteAccount };
