const AppError = require('../errors/AppError');

/**
 * Restrict access to specific roles within a business.
 * Must be used after `requireBusiness` (which attaches req.businessRole).
 * 
 * Usage: requireRole('owner', 'admin')
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.businessRole || !roles.includes(req.businessRole)) {
            return next(
                new AppError('You do not have permission to perform this action within this business.', 403)
            );
        }
        next();
    };
};

module.exports = requireRole;
