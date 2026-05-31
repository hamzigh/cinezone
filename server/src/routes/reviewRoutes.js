const express = require('express');
const reviewService = require('../services/reviewService');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const movieId = String(req.query.movieId || '').trim();
    if (!movieId) return res.status(400).json({ message: 'movieId is required' });
    const reviews = await reviewService.getReviews(movieId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { movieId, rating, comment } = req.body;
    if (!movieId) return res.status(400).json({ message: 'movieId is required' });
    const review = await reviewService.createReview(req.user.id, movieId, { rating, comment });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      Number(req.params.id),
      req.user.id,
      req.body
    );
    res.json(review);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await reviewService.deleteReview(Number(req.params.id), req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
