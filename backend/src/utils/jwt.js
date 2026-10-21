const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Sign a JWT for a Staff account.
 * Adds `type: 'staff'` to the payload so it is distinguishable from user tokens.
 */
const signStaffToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign({ ...payload, type: 'staff' }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

module.exports = {
  generateToken,
  verifyToken,
  signStaffToken,
};

