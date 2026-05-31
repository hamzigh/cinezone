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

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    const token = require('../services/tokenService').signUser(user);
    res.cookie('cinezone_token', token, authCookieOptions());
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.put('/password', requireAuth, async (req, res, next) => {
  try {
    await userService.changePassword(req.user.id, req.body);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.put('/preferences', requireAuth, async (req, res, next) => {
  try {
    await userService.updatePreferences(req.user.id, req.body.preferredGenres);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.delete('/account', requireAuth, async (req, res, next) => {
  try {
    await userService.deleteAccount(req.user.id, req.body.password);
    res.clearCookie('cinezone_token', { path: '/' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
