// src/config/cloudinary.js (Finalized, relying on three separate Env Vars)

import { v2 as cloudinary } from 'cloudinary';
// NOTE: No need for `import { createRequire } from 'module';` unless using old storage

// Configure Cloudinary using the three separate environment variables
// These MUST be present on the Render dashboard for this to work.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, 
});

// Safe placeholder for controller import
const storage = {
    isConfigured: true
};

export { cloudinary, storage };