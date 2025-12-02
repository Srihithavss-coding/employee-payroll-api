// src/controllers/reportController.js

import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import asyncHandler from 'express-async-handler';
import { ApiResponse } from '../utils/ApiResponse.js';
import { USER_ROLES } from '../constants/index.js';

// @desc    Get system-wide summary statistics for dashboard
// @route   GET /api/reports/summary
// @access  Private/Admin, HR
const getSummaryReport = asyncHandler(async (req, res) => {
    
    // 1. Employee Count
    const totalEmployees = await Employee.countDocuments({});
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });

    // 2. Leave Status Count
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });

    // 3. Payroll Status (Current Month)
    const currentPayPeriod = new Date().toISOString().substring(0, 7);
    const calculatedPayroll = await Payroll.countDocuments({ payPeriod: currentPayPeriod, status: 'Calculated' });
    const pendingPayroll = await Payroll.countDocuments({ payPeriod: currentPayPeriod, status: 'Pending' });
    const paidPayroll = await Payroll.countDocuments({ payPeriod: currentPayPeriod, status: 'Paid' });

    res.json(
        new ApiResponse(200, {
            employeeSummary: {
                totalEmployees,
                activeEmployees,
                inactiveEmployees: totalEmployees - activeEmployees,
            },
            leaveSummary: {
                pendingLeaves,
                approvedLeaves,
                rejectedLeaves,
                totalApplications: pendingLeaves + approvedLeaves + rejectedLeaves,
            },
            payrollSummary: {
                payPeriod: currentPayPeriod,
                calculated: calculatedPayroll,
                pending: pendingPayroll,
                paid: paidPayroll,
            },
        }, 'Dashboard summary report generated')
    );
});


export { getSummaryReport };