const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signUser(user) {
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

module.exports = { signUser };
