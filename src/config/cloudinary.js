// src/config/cloudinary.js (TEMPORARY FIX TO START SERVER)

import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import os from 'os';

// ⚠️ NOTE: This file is currently configured for local disk storage (Multer) 
// to bypass the persistent Cloudinary import error and allow the server to run.

const tempDir = path.join(os.tmpdir(), 'hr-uploads');

// Ensure the temporary directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// ----------------------------------------------------
// 🛑 Cloudinary configuration is commented out for now:
// ----------------------------------------------------
/* // const require = createRequire(import.meta.url);
// const storageModule = require('multer-storage-cloudinary');
// const CloudinaryStorage = storageModule.CloudinaryStorage || storageModule.default;

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     secure: true, 
// });
*/
// ----------------------------------------------------

// ----------------------------------------------------
// ✅ LOCAL DISK STORAGE CONFIGURATION (uses built-in path/fs)
// ----------------------------------------------------

// Define Multer storage for local file upload
const storage = {
    // This is NOT the full Multer diskStorage object, but a placeholder 
    // to avoid the original error in the upload controller.
    // We will handle the actual Multer setup in uploadController.js
    diskStorage: true 
}; 

// Re-export the cloudinary object (even though it's not configured yet)
export { cloudinary, storage };