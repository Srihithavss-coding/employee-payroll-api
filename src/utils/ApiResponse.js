// src/utils/ApiResponse.js

// Utility class for sending standardized successful API responses
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        // Success status based on HTTP code (any code starting with 2xx is success)
        this.success = statusCode < 400; 
    }
}

export { ApiResponse };