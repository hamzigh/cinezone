const express = require('express');
const collectionService = require('../services/collectionService');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await collectionService.getUserCollections(req.user.id));
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await collectionService.createCollection(req.user.id, req.body));
  } catch (err) { next(err); }
});

// Must be registered before /:id to prevent "containing" matching as an id param
router.get('/containing', async (req, res, next) => {
  try {
    const movieId = String(req.query.movieId || '').trim();
    if (!movieId) return res.status(400).json({ message: 'movieId is required' });
    res.json(await collectionService.getCollectionsContaining(req.user.id, movieId));
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await collectionService.getCollection(Number(req.params.id), req.user.id));
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    res.json(await collectionService.renameCollection(Number(req.params.id), req.user.id, req.body));
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await collectionService.deleteCollection(Number(req.params.id), req.user.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

router.post('/:id/items', async (req, res, next) => {
  try {
    await collectionService.addItem(Number(req.params.id), req.user.id, req.body);
    res.status(204).end();
  } catch (err) { next(err); }
});

router.delete('/:id/items/:movieId', async (req, res, next) => {
  try {
    await collectionService.removeItem(Number(req.params.id), req.user.id, req.params.movieId);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
