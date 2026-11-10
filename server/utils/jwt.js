const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'green_grocery_super_secret_jwt_key_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};
