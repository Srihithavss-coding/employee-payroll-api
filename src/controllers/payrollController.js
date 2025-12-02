// src/controllers/payrollController.js

import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// --- Helper Functions for Calculation ---

// Simplified tax function (e.g., flat 10% tax for demo purposes)
const calculateTax = (gross) => {
    const TAX_RATE = 0.10; // 10%
    return gross * TAX_RATE;
};

const getDaysInMonth = (year, month) => {
    // month is 0-indexed in JS Date object (e.g., January=0, December=11)
    // year must be a number here
    return new Date(year, month + 1, 0).getDate(); 
};

// --- Controller Functions ---

// @desc    Calculate and generate payroll for a specific employee and month
// @route   GET /api/payroll/:employeeId?month=YYYY-MM
// @access  Private/Admin, HR (Generates the payslip)
// src/controllers/payrollController.js (Replace existing function completely)

// @desc    Calculate and generate payroll for a specific employee and month
// @route   GET /api/payroll/:employeeId?month=MM&year=YYYY
// @access  Private/Admin, HR (Generates the payslip)
const generatePayroll = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    
    // --- 1. PARSE MONTH AND YEAR FROM QUERY ---
    const monthParam = req.query.month; // e.g., '12'
    const yearParam = req.query.year;   // e.g., '2025'

    // Default to current month/year if query is missing
    const today = new Date();
    // CRITICAL: Ensure year is parsed as number
    const targetYear = parseInt(yearParam) || today.getFullYear();
    // Convert 1-12 month parameter to 0-11 JS index
    const targetMonth0Indexed = (parseInt(monthParam) || today.getMonth() + 1) - 1; 

    const payPeriod = `${targetYear}-${String(targetMonth0Indexed + 1).padStart(2, '0')}`;
    // ------------------------------------------
    
    // Check if payroll already exists for this period
    const existingPayroll = await Payroll.findOne({ employee: employeeId, payPeriod });
    if (existingPayroll && req.query.regenerate !== 'true') {
        return res.status(200).json(
            new ApiResponse(200, existingPayroll, `Payroll for ${payPeriod} already exists.`)
        );
    }
    
    // 2. Fetch Employee Data
    const employee = await Employee.findById(employeeId);
    if (!employee) {
        throw new ApiError(404, 'Employee not found');
    }

    // 3. INITIAL CALCULATIONS (Ensuring numbers are used)
    const totalDaysInMonth = getDaysInMonth(targetYear, targetMonth0Indexed);
    // CRITICAL: Ensure baseSalary is parsed as a number
    const monthlyBaseSalary = parseFloat(employee.baseSalary); 
    
    const dailyRate = monthlyBaseSalary / totalDaysInMonth; 
    
    // Check for bad input *before* continuing
    if (isNaN(dailyRate) || dailyRate === Infinity) {
        throw new ApiError(500, 'Payroll calculation failed due to invalid base salary or month days.');
    }
    
    // Define date range for queries
    const startDate = new Date(targetYear, targetMonth0Indexed, 1); 
    const endDate = new Date(targetYear, targetMonth0Indexed + 1, 0); 
    endDate.setHours(23, 59, 59, 999);

    // 4. Fetch Attendance and Calculate Paid Days (NUCLEAR FIX APPLIED)
    const attendanceFilter = {
        employee: employeeId,
        punchOut: { 
            $exists: true,
            $ne: null,
            $gte: startDate,
            $lte: endDate
        },
    };
    // Use the underlying collection's countDocuments to skip Mongoose casting errors
    const paidAttendanceDays = await Attendance.collection.countDocuments(attendanceFilter); 
    
    let totalWorkingDays = paidAttendanceDays;
    // src/controllers/payrollController.js (Around line 75 - APPLY THIS REVERSION)

    // 3. Fetch Leave Data (for unpaid leave calculation)
    // Revert to Mongoose Model.find() to correctly read the totalDays field
    const approvedLeaves = await Leave.find({
        employee: employeeId,
        status: 'Approved',
        $or: [
            // Check for any overlap with the pay period
            { startDate: { $lte: endDate }, endDate: { $gte: startDate } } 
        ]
    });

    let unpaidLeaveDays = 0;
        
    // Calculate the total number of approved UNPAID leave days within the pay period
    approvedLeaves.forEach(leave => {
        if (leave.leaveType === 'Unpaid Leave') {
            // Since 'leave' is now a Mongoose document, 'totalDays' will be read correctly as a number.
            unpaidLeaveDays += leave.totalDays;
        }
    });
    // -------------------------------------------------------------------

// NOTE: The Attendance query (paidAttendanceDays) should remain using 
// Attendance.collection.countDocuments(...) as that fixed the date casting error.

    // 6. Final Calculation
    let paidDays = totalDaysInMonth - unpaidLeaveDays;
    paidDays = Math.max(0, paidDays); // Cannot be negative

    const grossEarnings = paidDays * dailyRate;
    const leaveDeduction = unpaidLeaveDays * dailyRate;
    
    const taxDeduction = calculateTax(grossEarnings);
    
    const netSalary = grossEarnings - taxDeduction;

    // 7. Create/Update Payroll Record
    const payrollData = {
        employee: employeeId,
        payPeriod,
        baseSalary: monthlyBaseSalary,
        totalWorkingDays: totalDaysInMonth,
        paidDays,
        grossEarnings: parseFloat(grossEarnings.toFixed(2)),
        unpaidLeaveDays: unpaidLeaveDays,
        leaveDeduction: parseFloat(leaveDeduction.toFixed(2)),
        taxDeduction: parseFloat(taxDeduction.toFixed(2)),
        netSalary: parseFloat(netSalary.toFixed(2)),
        status: 'Calculated',
    };

    let payroll;
    if (existingPayroll) {
        // Update existing record
        payroll = await Payroll.findByIdAndUpdate(existingPayroll._id, payrollData, { new: true });
    } else {
        // Create new record
        payroll = await Payroll.create(payrollData);
    }
    
    // Populate the employee details for the payslip view
    // Note: The payroll record returned by findByIdAndUpdate or create is a Mongoose model, so populate works.
    await payroll.populate('employee', 'firstName lastName employeeId department designation');

    res.status(existingPayroll ? 200 : 201).json(
        new ApiResponse(existingPayroll ? 200 : 201, payroll, 'Payroll calculated and summary generated successfully')
    );
});

// @desc    Get an employee's payroll history (payslips)
// @route   GET /api/payroll/:employeeId/history
// @access  Private/Admin, HR (or Employee viewing own)
const getPayrollHistory = asyncHandler(async (req, res) => {
    const targetEmployeeId = req.params.employeeId;
    
    // Role Check: Employees can only view their own payroll
    if (req.user.role === 'Employee') {
        const employee = await Employee.findOne({ user: req.user._id }).select('_id');
        if (!employee || employee._id.toString() !== targetEmployeeId) {
            throw new ApiError(403, 'Access denied. You can only view your own payroll history.');
        }
    }
    
    const payrollRecords = await Payroll.find({ employee: targetEmployeeId })
        .sort({ payPeriod: -1 })
        .populate('employee', 'firstName lastName employeeId');

    if (payrollRecords.length === 0) {
        throw new ApiError(404, 'No payroll records found for this employee.');
    }

    res.json(
        new ApiResponse(200, payrollRecords, 'Payroll history fetched successfully')
    );
});

// src/controllers/payrollController.js (Add this new function)

// @desc    Update payroll status to 'Paid'
// @route   PUT /api/payroll/:payrollId/pay
// @access  Private/Admin, HR
const markPayrollAsPaid = asyncHandler(async (req, res) => {
    const { payrollId } = req.params;

    const payroll = await Payroll.findById(payrollId);

    if (!payroll) {
        throw new ApiError(404, 'Payroll record not found');
    }

    if (payroll.status === 'Paid') {
        return res.status(200).json(
            new ApiResponse(200, payroll, 'Payroll is already marked as Paid.')
        );
    }

    if (payroll.status !== 'Calculated') {
        throw new ApiError(400, `Payroll status must be 'Calculated' to be marked Paid. Current status: ${payroll.status}`);
    }

    // Update status and record the payment date
    payroll.status = 'Paid';
    payroll.paymentDate = Date.now();
    await payroll.save();

    res.status(200).json(
        new ApiResponse(200, payroll, `Payroll for ${payroll.payPeriod} successfully marked as Paid.`)
    );
});

// src/controllers/payrollController.js (Final export statement)

export { generatePayroll, getPayrollHistory, markPayrollAsPaid };