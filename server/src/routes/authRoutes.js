const express = require('express');
const userService = require('../services/userService');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  try {
    const response = await userService.signup(req.body);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const response = await userService.login(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
