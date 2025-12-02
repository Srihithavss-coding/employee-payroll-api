// src/config/cloudinary.js (The correct, activated configuration)

import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';

// Configure Cloudinary using environment variables
// It will automatically read process.env.CLOUDINARY_URL 
// if it is set, which is the fix we implemented.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, 
});

// Define a placeholder for storage to avoid breaking controllers that import it, 
// but the actual memoryStorage will be defined in the controller.
const storage = {
    // This object is now just a safe placeholder
    isConfigured: true
};

export { cloudinary, storage };

// Note: If you were using multer-storage-cloudinary, you would need to uncomment the other imports.
// Since we switched to memoryStorage and manual buffer upload in the controller, 
// the simple cloudinary.config() is sufficient.