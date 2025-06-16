const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION } = require('../config/jwt');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
};

module.exports = generateToken;
