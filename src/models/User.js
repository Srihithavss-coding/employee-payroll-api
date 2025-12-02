// src/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { USER_ROLES } from '../constants/index.js';

const userSchema = mongoose.Schema({
    // User's email, must be unique and valid
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    // Hashed password
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false, // Prevents password from being returned in queries by default
    },
    // User role for Role-Based Access Control (RBAC)
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.EMPLOYEE,
        required: true,
    },
    // Link to the detailed Employee record (optional for Admin/HR users)
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null, // Employee link is created when an employee is registered
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// --- Model Middleware (Pre-save hook) ---

// Before saving, hash the password if it has been modified (e.g., during registration or update)
// src/models/User.js (Around line 47)
userSchema.pre('save', async function () { // <-- Remove the 'next' parameter
    if (!this.isModified('password')) {
        return; // <-- Use simple return to exit the function
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Do NOT call next() here. The function completing signals Mongoose to proceed.
});

// --- Custom Method ---

// Method to compare the entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this' refers to the user document
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;