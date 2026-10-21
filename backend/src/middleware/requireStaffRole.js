// src/middleware/requireStaffRole.js
// New middleware — mirrors requireRole pattern but checks req.staff.role.
// Does NOT modify requireRole.js.

const AppError = require('../errors/AppError');

/**
 * Middleware factory — restricts access to staff members with specific roles.
 * @param {...string} roles - Allowed STAFF_ROLES values
 */
const requireStaffRole = (...roles) => {
  return (req, res, next) => {
    if (!req.staff) {
      return next(new AppError('Staff authentication required.', 401));
    }

    if (!roles.includes(req.staff.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.staff.role}.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = requireStaffRole;
