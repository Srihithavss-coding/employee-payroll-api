// src/utils/ApiError.js

// Custom error class for API errors
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        // Call the parent Error constructor
        super(message); 
        this.statusCode = statusCode;
        this.data = null; // A standard practice, often set to null
        this.message = message;
        this.success = false; // Always false for an error
        this.errors = errors;

        // Capture stack trace for better debugging
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };