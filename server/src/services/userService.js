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

module.exports = { signup, login };
