// src/constants/index.js

// Define the standard user roles for the platform
export const USER_ROLES = {
    // Highest privileges: Can manage all employees, payroll, and leaves.
    ADMIN: 'Admin', 
    
    // HR staff: Can manage employee records and process leave approvals.
    HR: 'HR',       
    
    // Standard employee: Can view their profile, punch in/out, and apply for leave.
    EMPLOYEE: 'Employee', 
};