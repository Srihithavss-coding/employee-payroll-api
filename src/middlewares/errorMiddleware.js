// src/middlewares/errorMiddleware.js

// Middleware to handle routes that don't exist (404)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404); // Set the response status to 404
    next(error); // Pass the error to the general error handler
};

// General error handling middleware
const errorHandler = (err, req, res, next) => {
    // Determine the status code: use the existing status or default to 500 (Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode);

    // Send a structured JSON error response
    res.json({
        message: err.message, // The error message
        // Include stack trace only in development environment for debugging
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };