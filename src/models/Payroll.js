// src/models/Payroll.js

import mongoose from 'mongoose';

const payrollSchema = mongoose.Schema({
    // Link to the Employee
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    // The pay period being calculated (e.g., 'YYYY-MM')
    payPeriod: {
        type: String,
        required: true,
    },
    // --- Earnings ---
    baseSalary: {
        type: Number,
        required: true,
    },
    totalWorkingDays: {
        type: Number,
        default: 0,
    },
    paidDays: {
        type: Number,
        default: 0,
    },
    // Calculated gross pay based on paid days (Prorated Base Salary)
    grossEarnings: {
        type: Number,
        required: true,
    },
    // --- Deductions & Leave ---
    unpaidLeaveDays: {
        type: Number,
        default: 0,
    },
    leaveDeduction: {
        type: Number,
        default: 0,
    },
    taxDeduction: {
        type: Number,
        default: 0,
    },
    // --- Final Pay ---
    netSalary: {
        type: Number,
        required: true,
    },
    // Status of the payment
    status: {
        type: String,
        enum: ['Calculated', 'Paid', 'Pending'],
        default: 'Calculated',
    },
}, {
    timestamps: true,
});

// Ensures that only one payroll record exists per employee per pay period
payrollSchema.index({ employee: 1, payPeriod: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;