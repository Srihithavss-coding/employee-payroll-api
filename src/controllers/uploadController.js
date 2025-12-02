// src/controllers/uploadController.js

import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import path from 'path'; // Used for disk storage
import { fileURLToPath } from 'url'; // Used for disk storage
import { dirname } from 'path'; // Used for disk storage

// --- Multer Disk Storage Configuration ---

// Get the current directory (needed for __dirname equivalent in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define storage location (e.g., in a 'uploads' folder in the root)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Path to the uploads folder (create it manually in your project root!)
        cb(null, path.join(__dirname, '../../uploads/')); 
    },
    filename: (req, file, cb) => {
        // Give the file a unique name (timestamp-originalfilename.ext)
        cb(null, `${Date.now()}-${file.originalname}`); 
    }
});

// Setup Multer instance with disk storage
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
});

// Multer middleware wrapper function (uses the internal disk storage)
const uploadMiddleware = upload.single('file'); 

// @desc    Upload a single file (to local disk)
// @route   POST /api/upload
// @access  Private/All Authenticated Users
const uploadFile = asyncHandler(async (req, res) => {
    if (req.file) {
        // req.file contains the details from Multer disk storage
        res.status(200).json(
            new ApiResponse(200, {
                fileName: req.file.filename,
                path: `/uploads/${req.file.filename}`, // Local path
                size: req.file.size,
            }, 'File uploaded successfully to local disk (Cloudinary disabled)')
        );
    } else {
        throw new ApiError(400, 'File upload failed. No file provided or server error.');
    }
});

export { uploadMiddleware, uploadFile };