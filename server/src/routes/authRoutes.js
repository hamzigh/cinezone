const express = require('express');
const userService = require('../services/userService');
const requireAuth = require('../middleware/auth');
const env = require('../config/env');

const router = express.Router();

function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/'
  };
}

router.post('/signup', async (req, res, next) => {
  try {
    const { token, user } = await userService.signup(req.body);
    res.cookie('cinezone_token', token, authCookieOptions());
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { token, user } = await userService.login(req.body);
    res.cookie('cinezone_token', token, authCookieOptions());
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('cinezone_token', { path: '/' });
  res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
  const user = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  };
  res.json({ user });
});

module.exports = router;
