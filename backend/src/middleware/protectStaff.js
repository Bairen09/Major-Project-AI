// src/middleware/protectStaff.js
// New middleware — mirrors protectAdmin pattern but validates staff tokens.
// Does NOT modify protect.js or any Sprint 1 middleware.

const { verifyToken } = require('../utils/jwt');
const Staff = require('../models/Staff');
const AppError = require('../errors/AppError');

const protectStaff = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to continue.', 401));
    }

    const decoded = verifyToken(token);

    // Ensure this is a staff token, not a user token
    if (decoded.type !== 'staff') {
      return next(new AppError('Invalid token type. Staff access required.', 401));
    }

    const staff = await Staff.findById(decoded.id);

    if (!staff) {
      return next(new AppError('The account belonging to this token no longer exists.', 401));
    }

    if (!staff.isActive) {
      return next(new AppError('Your staff account has been deactivated.', 403));
    }

    req.staff = {
      id: staff._id,
      role: staff.role,
      name: staff.name,
      email: staff.email,
    };

    // Fire-and-forget lastActive update (throttled to 5 minutes)
    if (!staff.lastActive || Date.now() - new Date(staff.lastActive).getTime() > 5 * 60 * 1000) {
      Staff.updateOne({ _id: staff._id }, { lastActive: new Date() }).exec().catch(() => {});
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = protectStaff;
