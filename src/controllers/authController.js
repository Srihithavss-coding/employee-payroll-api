// src/controllers/authController.js

import User from '../models/User.js';
import Employee from '../models/Employee.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // Used to simplify error handling in async functions
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { USER_ROLES } from '../constants/index.js';

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    });
};

// --- Controller Functions ---

// @desc    Register a new employee/user
// @route   POST /api/auth/register
// @access  Public (Initially, only Admin/HR should register employees, but we'll keep it public for initial setup)
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, role, employeeDetails } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Please provide both email and password");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new ApiError(400, 'User already exists');
    }

    // 1. Create the User (Authentication record)
    const user = await User.create({
        email,
        password,
        role: role || USER_ROLES.EMPLOYEE, // Default to EMPLOYEE if role not specified
    });
    
    // 2. If registration is for an Employee, create the Employee record too
    let employee = null;
    if (user.role === USER_ROLES.EMPLOYEE || user.role === USER_ROLES.HR) {
        if (!employeeDetails) {
            throw new ApiError(400, "Employee details are required for this role");
        }

        // Create the Employee HR record
        employee = await Employee.create({
            user: user._id, // Link to the newly created User ID
            ...employeeDetails, // Spread properties like employeeId, firstName, baseSalary, etc.
        });

        // 3. Update the User model to link the Employee ID
        user.employee = employee._id;
        await user.save();
    }
    
    if (user) {
        // Successful response
        res.status(201).json(
            new ApiResponse(201, {
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                employeeId: employee ? employee.employeeId : null,
            }, "User registered successfully")
        );
    } else {
        throw new ApiError(500, 'Invalid user data');
    }
});


// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Please enter email and password");
    }

    // Find user, explicitly select password since it has 'select: false'
    const user = await User.findOne({ email }).select('+password'); 

    if (user && (await user.matchPassword(password))) {
        // Successful login
        res.status(200).json(
            new ApiResponse(200, {
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            }, "User logged in successfully")
        );
    } else {
        throw new ApiError(401, 'Invalid email or password');
    }
});

// @desc    Get user profile (protected route)
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is populated by the authMiddleware (coming up next)
    
    // Retrieve the user, and if they are an Employee/HR, populate their employee details
    const user = await User.findById(req.user._id).select('-password')
        .populate('employee', 'firstName lastName employeeId department designation baseSalary profilePicture status'); // Select specific fields from Employee model

    if (user) {
        res.status(200).json(
            new ApiResponse(200, user, "User profile fetched successfully")
        );
    } else {
        throw new ApiError(404, 'User not found');
    }
});


export { registerUser, loginUser, getUserProfile };