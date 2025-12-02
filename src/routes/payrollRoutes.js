// src/routes/payrollRoutes.js

import express from 'express';
import { generatePayroll, getPayrollHistory, markPayrollAsPaid } from '../controllers/payrollController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../constants/index.js';


const router = express.Router();

const adminHR = [USER_ROLES.ADMIN, USER_ROLES.HR];
const allUsers = [USER_ROLES.ADMIN, USER_ROLES.HR, USER_ROLES.EMPLOYEE];


// 1. Generate/Calculate Payroll (GET /api/payroll/:employeeId)
// Restricted to Admin and HR (Payroll staff)
// Note: We use GET here to fetch/calculate a summary, but POST could be used to trigger bulk calculation.
router.route('/:employeeId')
    .get(protect, checkRole(adminHR), generatePayroll);


// 2. Get Payroll History (GET /api/payroll/:employeeId/history)
// Accessible by Admin/HR (for any employee) OR Employee (for self)
router.route('/:employeeId/history')
    .get(protect, checkRole(allUsers), getPayrollHistory);

// src/routes/payroll.routes.js (Add this new route)

// src/routes/payroll.routes.js (The new route fix)

// 3. Mark Payroll as Paid (PUT /api/payroll/:payrollId/pay)
// Restricted to Admin and HR
router.route('/:payrollId/pay')
    .put(protect, checkRole(adminHR), markPayrollAsPaid);

// NOTE: If you intended to use 'verifyJWT' and 'isAdminOrHR' as aliases, 
// you would need to import and rename them. Using 'protect' and 'checkRole(adminHR)' is cleaner
// as it follows your existing file structure.
export default router;