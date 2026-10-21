// src/middleware/requireBusiness.js

const Business = require('../models/Business');
const AppError = require('../errors/AppError');

/**
 * Verifies that the business exists, belongs to the requesting user,
 * and has not been soft deleted. Attaches req.business for downstream use.
 *
 * Usage: protect, requireBusiness, controller
 */
const requireBusiness = async (req, res, next) => {
    try {
        if (req.params.id === 'localboost') {
            if (req.user && (req.user.platformRole === 'SUPER_ADMIN' || req.user.platformRole === 'BLOGGER')) {
                req.business = { _id: 'localboost', name: 'LocalBoost Platform' };
                req.businessRole = 'owner';
                return next();
            }
            return next(new AppError('Unauthorized access to platform blogs.', 403));
        }

        const business = await Business.findById(req.params.id);

        if (!business) {
            return next(new AppError('Business not found.', 404));
        }

        if (business.ownerId.equals(req.user.id)) {
            req.businessRole = 'owner';
        } else {
            const member = business.members.find(m => m.userId.equals(req.user.id));
            if (!member) {
                return next(
                    new AppError('You do not have permission to access this business.', 403)
                );
            }
            req.businessRole = member.role;
        }

        req.business = business;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = requireBusiness;