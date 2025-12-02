// src/controllers/attendanceController.js

import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Helper to get the employee ID linked to the authenticated user
const getEmployeeId = async (userId) => {
    const employee = await Employee.findOne({ user: userId }).select('_id');
    if (!employee) {
        throw new ApiError(404, 'Employee record not found for this user.');
    }
    return employee._id;
};

// @desc    Employee punches in
// @route   POST /api/punch-in
// @access  Private/Employee, HR, Admin
const punchIn = asyncHandler(async (req, res) => {
    const employeeId = await getEmployeeId(req.user._id);

    // 1. Check for an existing open attendance record today
    // We look for any attendance record for this employee where punchOut is null
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openAttendance = await Attendance.findOne({
        employee: employeeId,
        punchOut: null,
    });

    if (openAttendance) {
        throw new ApiError(400, 'You are already punched in. Please punch out first.');
    }

    // 2. Create a new attendance record
    const newPunchIn = await Attendance.create({
        employee: employeeId,
        punchIn: Date.now(),
        date: today, // Store the start of the day for easy grouping
        note: req.body.note, // Optional note on punch-in
    });

    res.status(201).json(
        new ApiResponse(201, { 
            punchIn: newPunchIn.punchIn, 
            message: 'Punch-in successful' 
        }, 'Attendance recorded.')
    );
});


// @desc    Employee punches out
// @route   POST /api/punch-out
// @access  Private/Employee, HR, Admin
const punchOut = asyncHandler(async (req, res) => {
    const employeeId = await getEmployeeId(req.user._id);

    // 1. Find the active, open attendance record
    const openAttendance = await Attendance.findOne({
        employee: employeeId,
        punchOut: null, // Find the record that hasn't been closed
    });

    if (!openAttendance) {
        throw new ApiError(400, 'You are not currently punched in. Please punch in first.');
    }

    // 2. Update the record with punch-out time
    openAttendance.punchOut = Date.now();

    // 3. Calculate the duration in minutes
    const durationMs = openAttendance.punchOut.getTime() - openAttendance.punchIn.getTime();
    openAttendance.durationMinutes = Math.floor(durationMs / (1000 * 60)); // Convert milliseconds to minutes

    // 4. Save the updated record
    const completedAttendance = await openAttendance.save();

    res.status(200).json(
        new ApiResponse(200, {
            punchIn: completedAttendance.punchIn,
            punchOut: completedAttendance.punchOut,
            durationMinutes: completedAttendance.durationMinutes,
            durationHours: (completedAttendance.durationMinutes / 60).toFixed(2),
            message: 'Punch-out successful. Have a good day!'
        }, 'Attendance session closed.')
    );
});


// @desc    Get employee's attendance history
// @route   GET /api/attendance/:employeeId
// @access  Private/Admin, HR (or Employee viewing own record)
const getAttendanceHistory = asyncHandler(async (req, res) => {
    const targetEmployeeId = req.params.employeeId; // Employee ID from URL param (HR/Admin)
    const authenticatedUserId = req.user._id;

    let employeeId;

    // Determine the actual employee ID to query based on user role and request
    if (req.user.role === 'Employee') {
        // Employee can only view their own history
        const employee = await getEmployeeId(authenticatedUserId);
        employeeId = employee._id.toString();
        
        // Safety check: ensure the URL param (if present) matches the user's own ID
        if (targetEmployeeId && targetEmployeeId !== employeeId) {
             throw new ApiError(403, 'Employees can only view their own attendance history.');
        }

    } else {
        // HR/Admin can view any employee's history based on the URL param
        employeeId = targetEmployeeId;
    }
    
    // Pagination and Filters (Optional, but good practice)
    const pageSize = Number(req.query.limit) || 30;
    const page = Number(req.query.page) || 1;
    const startDate = req.query.startDate; 
    const endDate = req.query.endDate;

    const query = { employee: employeeId };
    
    // Date Range Filter
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) {
            // Include records up to the end of the end date
            const nextDay = new Date(endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.date.$lt = nextDay;
        }
    }

    const count = await Attendance.countDocuments(query);
    
    const attendanceRecords = await Attendance.find(query)
        .sort({ punchIn: -1 }) // Sort by newest first
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json(
        new ApiResponse(200, {
            records: attendanceRecords,
            page,
            pages: Math.ceil(count / pageSize),
            totalRecords: count,
        }, 'Attendance history fetched successfully')
    );
});


export { punchIn, punchOut, getAttendanceHistory };