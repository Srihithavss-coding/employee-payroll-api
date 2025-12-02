// src/middlewares/roleMiddleware.js

import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

/**
 * Middleware factory to check if the authenticated user's role is in the list of allowed roles.
 * * @param {string[]} allowedRoles - An array of roles that are permitted to access the route (e.g., ['Admin', 'HR']).
 * @returns {function} Express middleware function.
 */
const checkRole = (allowedRoles) => asyncHandler(async (req, res, next) => {
    // req.user is populated by the 'protect' middleware (authMiddleware.js)

    if (!req.user) {
        // Should generally not happen if 'protect' runs first, but a good safeguard
        throw new ApiError(401, 'Not authorized, user data missing');
    }

    // Check if the user's role is included in the allowedRoles array
    if (allowedRoles.includes(req.user.role)) {
        // Role is authorized, continue to the next middleware or controller
        next();
    } else {
        // Role is NOT authorized
        // Use 403 Forbidden to indicate the user is authenticated but not allowed to access this resource
        throw new ApiError(403, `Access forbidden. Required role: ${allowedRoles.join(' or ')}`);
    }
});

export { checkRole };