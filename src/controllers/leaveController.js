// src/controllers/leaveController.js

import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { USER_ROLES } from '../constants/index.js';

// Helper to get the employee ID linked to the authenticated user
const getEmployeeId = async (userId) => {
    const employee = await Employee.findOne({ user: userId }).select('_id');
    if (!employee) {
        throw new ApiError(404, 'Employee record not found for this user.');
    }
    return employee._id;
};

// @desc    Employee submits a new leave application
// @route   POST /api/leaves
// @access  Private/All authenticated users (Employee, HR, Admin)
const submitLeaveApplication = asyncHandler(async (req, res) => {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    if (!leaveType || !startDate || !endDate || !reason) {
        throw new ApiError(400, 'Please provide leave type, start date, end date, and reason.');
    }
    
    // Get the employee ID associated with the logged-in user
    const employee = await getEmployeeId(req.user._id);
    
    // Create the leave record. The 'pre-validate' hook in the model will calculate totalDays.
    const newLeave = await Leave.create({
        employee: employee._id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'Pending',
    });

    res.status(201).json(
        new ApiResponse(201, newLeave, 'Leave application submitted successfully. Status: Pending.')
    );
});


// @desc    HR/Admin approves or rejects a leave application
// @route   PUT /api/leaves/:id/approve
// @access  Private/Admin, HR
const reviewLeaveApplication = asyncHandler(async (req, res) => {
    const leaveId = req.params.id;
    const { action } = req.body; // 'approve' or 'reject'

    const leave = await Leave.findById(leaveId);

    if (!leave) {
        throw new ApiError(404, 'Leave application not found.');
    }
    
    if (leave.status !== 'Pending') {
        throw new ApiError(400, `Leave is already ${leave.status.toLowerCase()}.`);
    }

    if (action === 'approve') {
        leave.status = 'Approved';
    } else if (action === 'reject') {
        leave.status = 'Rejected';
    } else {
        throw new ApiError(400, "Invalid action. Must be 'approve' or 'reject'.");
    }

    leave.reviewer = req.user._id;
    leave.reviewDate = Date.now();

    const updatedLeave = await leave.save();
    
    // Populate the employee field for the response
    await updatedLeave.populate('employee', 'firstName lastName employeeId'); 

    res.status(200).json(
        new ApiResponse(200, updatedLeave, `Leave application successfully ${updatedLeave.status.toLowerCase()}.`)
    );
});


// @desc    Get leave applications (with search, filters, pagination)
// @route   GET /api/leaves?status=Pending&employeeId=...&page=1&limit=10
// @access  Private/Admin, HR (or Employee viewing own)
const getLeaveApplications = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const status = req.query.status; // Filter by Pending, Approved, Rejected
    const employeeId = req.query.employeeId; // Filter by a specific employee (Admin/HR only)
    
    const query = {};

    // 1. Employee restriction: If the user is an employee, they only see their own leaves.
    if (req.user.role === USER_ROLES.EMPLOYEE) {
        const employee = await getEmployeeId(req.user._id);
        query.employee = employee._id;
    } else if (employeeId) {
        // Admin/HR filter by specific employee ID
        query.employee = employeeId;
    }

    // 2. Status filter
    if (status) {
        query.status = status;
    }

    const count = await Leave.countDocuments(query); 
    
    const leaves = await Leave.find(query)
        .sort({ createdAt: -1 }) // Newest applications first
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        // Populate employee details for easy viewing
        .populate('employee', 'firstName lastName employeeId department'); 

    res.json(
        new ApiResponse(200, {
            leaves,
            page,
            pages: Math.ceil(count / pageSize),
            totalRecords: count,
        }, 'Leave applications fetched successfully')
    );
});

export { 
    submitLeaveApplication, 
    reviewLeaveApplication, 
    getLeaveApplications 
};