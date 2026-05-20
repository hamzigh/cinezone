const express = require('express');
const movieService = require('../services/movieService');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const movies = await movieService.listMovies({
      search: req.query.search,
      genre: req.query.genre
    });
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const movie = await movieService.getMovie(req.params.id);
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/stream', async (req, res, next) => {
  try {
    const stream = await movieService.getStream(req.params.id);
    res.json(stream);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
