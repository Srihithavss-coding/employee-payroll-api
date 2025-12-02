// src/routes/employeeRoutes.js

import express from 'express';
import { 
    createEmployee, 
    getEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee 
} from '../controllers/employeeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

const adminHR = [USER_ROLES.ADMIN, USER_ROLES.HR];
const adminOnly = [USER_ROLES.ADMIN];


// 1. Create Employee (POST /api/employees)
// Accessible by Admin or HR
router.route('/')
    .post(protect, checkRole(adminHR), createEmployee);


// 2. Get All Employees (GET /api/employees)
// Accessible by Admin or HR
router.route('/')
    .get(protect, checkRole(adminHR), getEmployees);


// 3. Get Single Employee, Update, Delete (Specific ID routes)
router.route('/:id')
    // GET /api/employees/:id - Accessible by Admin or HR
    .get(protect, checkRole(adminHR), getEmployeeById) 
    
    // PUT /api/employees/:id - Accessible by Admin or HR
    .put(protect, checkRole(adminHR), updateEmployee)
    
    // DELETE /api/employees/:id - Only accessible by Admin
    .delete(protect, checkRole(adminOnly), deleteEmployee);


export default router;