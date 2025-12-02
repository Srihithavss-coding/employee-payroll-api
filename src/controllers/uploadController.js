// src/controllers/uploadController.js (The Final, Correct Implementation)

import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { cloudinary } from '../config/cloudinary.js'; // Import configured Cloudinary object

// --- 1. Multer Memory Storage Configuration (THE FIX) ---
// This is essential for cloud deployment: it stores the file in memory (req.file.buffer).
const storage = multer.memoryStorage(); 

// Setup Multer instance 
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

// Multer middleware wrapper function
// We must use 'file' as the key if Postman sends it as 'file'
const uploadMiddleware = upload.single('file'); 

// @desc    Upload a single file to Cloudinary
// @route   POST /api/upload
// @access  Private/All Authenticated Users
const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'File upload failed. No file provided.');
    }

    // Convert the memory buffer (req.file.buffer) to a Base64 string (Data URI)
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    // Upload the Data URI directly to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
        folder: "employee-payroll-uploads", // Name of the folder in Cloudinary
    });

    // Check if the upload was successful
    if (!result || !result.secure_url) {
        throw new ApiError(500, 'Cloudinary upload failed.');
    }

    // Return the successful Cloudinary URL
    res.status(200).json(
        new ApiResponse(200, {
            publicId: result.public_id,
            url: result.secure_url, // THE FINAL LIVE URL
            size: result.bytes,
        }, 'File uploaded successfully to Cloudinary')
    );
});

export { uploadMiddleware, uploadFile };