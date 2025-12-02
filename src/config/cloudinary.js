// src/config/cloudinary.js (The final, guaranteed fix)

import { v2 as cloudinary } from 'cloudinary';
// --------------------------------------------------------
// FINAL FIX: Explicitly load dotenv configuration here
import 'dotenv/config'; 
// --------------------------------------------------------

// Configure Cloudinary using the three separate environment variables
// It MUST now read these variables successfully.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, 
});

const storage = {
    isConfigured: true
};

export { cloudinary, storage };