// src/routes/uploadRoutes.js

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadMiddleware, uploadFile } from '../controllers/uploadController.js';

const router = express.Router();

// The middleware chain: 
// 1. protect (checks JWT) 
// 2. uploadMiddleware (handles Multer/Cloudinary upload) 
// 3. uploadFile (sends final response with URL)
router.post('/', protect, uploadMiddleware, uploadFile);

export default router;