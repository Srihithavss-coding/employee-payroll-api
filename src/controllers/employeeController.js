// src/controllers/employeeController.js

import Employee from '../models/Employee.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { USER_ROLES } from '../constants/index.js';

// Helper function to create a basic user account (for employee login)
const createBasicUser = async (email, password, role, employeeId) => {
    // NOTE: This logic assumes a temporary password is provided by HR and must be changed later.
    // For simplicity, we use a default temporary password here. 
    // In a real app, an email invitation with a password reset link is preferred.
    
    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, `User with email ${email} already exists.`);
    }

    const user = await User.create({
        email,
        password: password || 'Welcome123', // Temp password for new employees
        role: role || USER_ROLES.EMPLOYEE,
    });
    return user;
};


// @desc    Create a new employee and their login account
// @route   POST /api/employees
// @access  Private/Admin, HR
const createEmployee = asyncHandler(async (req, res) => {
    const { 
        email, password, role, 
        employeeId, firstName, lastName, department, designation, joiningDate, baseSalary 
    } = req.body;

    // 1. Basic Validation
    if (!employeeId || !firstName || !lastName || !department || !designation || !joiningDate || !baseSalary || !email) {
        throw new ApiError(400, 'Please provide all required employee details and email.');
    }

    // 2. Check if employeeId already exists
    const employeeExists = await Employee.findOne({ employeeId });
    if (employeeExists) {
        throw new ApiError(400, 'Employee ID already exists.');
    }

    // 3. Create the linked User account
    const user = await createBasicUser(email, password, role, employeeId);
    
    // 4. Create the Employee HR record
    const employee = await Employee.create({
        user: user._id,
        employeeId,
        firstName,
        lastName,
        department,
        designation,
        joiningDate: new Date(joiningDate),
        baseSalary,
        // Other optional fields like phoneNumber, profilePicture will be default/null
    });

    // 5. Link employee ID back to the user object
    user.employee = employee._id;
    await user.save();

    res.status(201).json(
        new ApiResponse(201, employee, 'Employee and linked user account created successfully')
    );
});


// @desc    Get all employees with search, filter, and pagination
// @route   GET /api/employees?search=...&department=...&page=1&limit=10
// @access  Private/Admin, HR
const getEmployees = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const search = req.query.search;
    const department = req.query.department;
    
    const query = {};

    // 1. Search filter (by name or employeeId)
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { lastName: { $regex: search, $options: 'i' } },
            { employeeId: { $regex: search, $options: 'i' } },
        ];
    }

    // 2. Department filter
    if (department) {
        query.department = department;
    }

    // Get total count for pagination metadata
    const count = await Employee.countDocuments(query); 
    
    // Fetch data with pagination
    const employees = await Employee.find(query)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        // Populate the linked user's email for convenience
        .populate('user', 'email'); 

    res.json(
        new ApiResponse(200, {
            employees,
            page,
            pages: Math.ceil(count / pageSize),
            totalEmployees: count,
        }, 'Employees fetched successfully')
    );
});


// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private/Admin, HR
const getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id)
        .populate('user', 'email role'); // Include linked user info

    if (employee) {
        res.json(new ApiResponse(200, employee, 'Employee fetched successfully'));
    } else {
        throw new ApiError(404, 'Employee not found');
    }
});


// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private/Admin, HR
const updateEmployee = asyncHandler(async (req, res) => {
    const { firstName, lastName, department, designation, baseSalary, status, email, role } = req.body;

    const employee = await Employee.findById(req.params.id);

    if (employee) {
        // Update employee details
        employee.firstName = firstName || employee.firstName;
        employee.lastName = lastName || employee.lastName;
        employee.department = department || employee.department;
        employee.designation = designation || employee.designation;
        employee.baseSalary = baseSalary || employee.baseSalary;
        employee.status = status || employee.status;

        const updatedEmployee = await employee.save();

        // Optional: Update linked user's email/role if provided
        const user = await User.findById(employee.user);
        if (user) {
            user.email = email || user.email;
            user.role = role || user.role;
            await user.save();
        }

        res.json(new ApiResponse(200, updatedEmployee, 'Employee updated successfully'));
    } else {
        throw new ApiError(404, 'Employee not found');
    }
});


// @desc    Delete an employee and their linked user account
// @route   DELETE /api/employees/:id
// @access  Private/Admin (High privilege operation)
const deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);

    if (employee) {
        // 1. Delete the linked User account
        await User.findByIdAndDelete(employee.user);
        
        // 2. Delete the Employee record
        await employee.deleteOne();

        res.json(new ApiResponse(200, null, 'Employee and linked user account removed successfully'));
    } else {
        throw new ApiError(404, 'Employee not found');
    }
});

export { 
    createEmployee, 
    getEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee 
};