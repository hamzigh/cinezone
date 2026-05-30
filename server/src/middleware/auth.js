const jwt = require('jsonwebtoken');
const env = require('../config/env');
const HttpError = require('../utils/httpError');

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  if (!header) return null;

  // Very small cookie parser: "a=b; c=d"
  const parts = header.split(';');
  for (const part of parts) {
    const [rawKey, ...rawValueParts] = part.trim().split('=');
    if (!rawKey) continue;
    if (rawKey === name) {
      const value = rawValueParts.join('=');
      return value ? decodeURIComponent(value) : '';
    }
  }
  return null;
}

function requireAuth(req, res, next) {
  const token = getCookie(req, 'cinezone_token');
  if (!token) return next(new HttpError(401, 'Authentication required'));

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
}

module.exports = requireAuth;
