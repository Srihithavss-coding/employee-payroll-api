// src/models/Attendance.js

import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
    // Link to the Employee record
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    // Timestamp for when the employee started work
    punchIn: {
        type: Date,
        required: true,
    },
    // Timestamp for when the employee finished work (can be null if currently punched in)
    punchOut: {
        type: Date,
        default: null,
    },
    // Calculated duration of the work session in minutes (updated on punch-out)
    durationMinutes: {
        type: Number,
        default: 0,
    },
    // Optional: Notes or location data (for future features)
    note: {
        type: String,
        trim: true,
    },
    // Date of the attendance record (useful for quick indexing and grouping)
    date: {
        type: Date,
        required: true,
        // Set to start of the day
        default: Date.now,
    },
}, {
    timestamps: true, // Includes createdAt and updatedAt
});

// Index for quick lookups by employee and date
attendanceSchema.index({ employee: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;