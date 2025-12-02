// src/models/Employee.js

import mongoose from 'mongoose';

const employeeSchema = mongoose.Schema({
    // Link to the User for authentication purposes (1:1 relationship)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    department: {
        type: String,
        required: true,
        trim: true,
    },
    designation: {
        type: String,
        required: true,
        trim: true,
    },
    // Employment details
    joiningDate: {
        type: Date,
        required: true,
    },
    baseSalary: {
        type: Number,
        required: true,
        min: 0,
    },
    // Placeholder for profile picture URL (will be handled by Multer/Cloudinary)
    profilePicture: {
        type: String,
        default: '/images/default_profile.png', 
    },
    // Current status (e.g., Active, On Leave, Terminated)
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Terminated'],
        default: 'Active',
    },
}, {
    timestamps: true,
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;