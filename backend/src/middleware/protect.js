// src/middleware/protect.js

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const AppError = require('../errors/AppError');

const protect = async (req, res, next) => {
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

        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new AppError('The account belonging to this token no longer exists.', 401));
        }

        if (!user.isActive || user.status === 'SUSPENDED' || user.status === 'DELETED') {
            return next(new AppError('Your account has been deactivated or suspended.', 403));
        }

        req.user = {
            id: user._id,
            role: user.role,
        };

        // Fire and forget lastActive update (throttled to 5 minutes to reduce DB load)
        if (!user.lastActive || Date.now() - new Date(user.lastActive).getTime() > 5 * 60 * 1000) {
            User.updateOne({ _id: user._id }, { lastActive: new Date() }).exec().catch(() => {});
        }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = protect;