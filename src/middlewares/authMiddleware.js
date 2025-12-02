// src/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

// Middleware to protect routes: validates JWT and attaches user to req
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Check if token exists in the 'Authorization' header (Format: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token (remove "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find the user by ID from the decoded payload and attach to request
            // We exclude the password and only look for the basic user info
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // Token payload contains a user ID that doesn't exist
                throw new ApiError(401, 'Not authorized, user not found');
            }

            next(); // Proceed to the next middleware or controller function
        } catch (error) {
            console.error(error);
            // If token is invalid or expired
            throw new ApiError(401, 'Not authorized, token failed or expired');
        }
    }

    // If no token is provided at all
    if (!token) {
        throw new ApiError(401, 'Not authorized, no token');
    }
});

export { protect };