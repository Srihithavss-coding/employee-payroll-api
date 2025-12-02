// src/config/cloudinary.js (Final, minimalist configuration)

import { v2 as cloudinary } from 'cloudinary';

// Cloudinary will automatically read the CLOUDINARY_URL environment variable
// and configure itself. No need for manual cloudinary.config() call.

// Just ensure the library is initialized by calling its config without arguments
// if the URL is set in the environment.
cloudinary.config(); 

const storage = {
    isConfigured: true
};

export { cloudinary, storage };