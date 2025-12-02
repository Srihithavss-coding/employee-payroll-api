// src/models/Leave.js

import mongoose from 'mongoose';

const leaveSchema = mongoose.Schema({
    // Link to the Employee submitting the request
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    // Type of leave being requested
    leaveType: {
        type: String,
        enum: ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'],
        required: true,
    },
    // Start and end dates of the requested leave period (inclusive)
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    // Total days requested (calculated on submission/approval)
    totalDays: {
        type: Number,
        required: true,
        min: 0.5, // Allow half-day leaves
    },
    // Reason for the leave
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    // Current status of the application
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    // Optional: Employee (HR/Admin) who approved or rejected the application
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    // Date of review
    reviewDate: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true, // Includes createdAt and updatedAt
});

// Calculate the number of days between two dates (excluding weekends/holidays is complex, 
// so for simplicity, we calculate calendar days here. A real system would use a helper function 
// to account for working days.)

leaveSchema.pre('validate', async function () { 
    // Check if the document is new or if the dates have been modified
    if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
        
        if (this.startDate && this.endDate) {
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            
            // Set dates to midnight to prevent timezone/time errors
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            // Calculate the difference in milliseconds
            const diffTime = end.getTime() - start.getTime();
            
            // Convert milliseconds to days. Add 1 to be inclusive.
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; 

            // ⚠️ Assign the required field BEFORE Mongoose checks if it is required
            this.totalDays = diffDays; 
        }
    }
    
    // Check for non-positive days (good practice)
    if (this.totalDays <= 0) {
        throw new Error('Leave duration must be at least one day.');
    }
});

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;