const express = require('express');
const requireAuth = require('../middleware/auth');
const watchlistService = require('../services/watchlistService');
const HttpError = require('../utils/httpError');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const movies = await watchlistService.getWatchlist(req.user.id);
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const movieId = req.body?.movieId;
    if (!movieId) {
      throw new HttpError(400, 'movieId is required');
    }

    await watchlistService.addToWatchlist(req.user.id, movieId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.delete('/:movieId', async (req, res, next) => {
  try {
    await watchlistService.removeFromWatchlist(req.user.id, req.params.movieId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
