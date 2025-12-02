// src/routes/authRoutes.js

import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Will be created next

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private (Protected) Route
// The 'protect' middleware will verify the JWT before allowing access to getUserProfile
router.get('/profile', protect, getUserProfile); 

export default router;