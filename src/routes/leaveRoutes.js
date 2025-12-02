// src/routes/leaveRoutes.js

import express from 'express';
import { 
    submitLeaveApplication, 
    reviewLeaveApplication, 
    getLeaveApplications 
} from '../controllers/leaveController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

const adminHR = [USER_ROLES.ADMIN, USER_ROLES.HR];
const allUsers = [USER_ROLES.ADMIN, USER_ROLES.HR, USER_ROLES.EMPLOYEE];


// 1. Submit Application & Get List (POST /api/leaves, GET /api/leaves)
// GET: Accessible by all (Employees get their own, Admin/HR get all/filtered)
// POST: Accessible by all
router.route('/')
    .post(protect, checkRole(allUsers), submitLeaveApplication)
    .get(protect, checkRole(allUsers), getLeaveApplications);


// 2. Review/Approve Application (PUT /api/leaves/:id/approve)
// Restricted to Admin and HR roles
router.route('/:id/approve')
    .put(protect, checkRole(adminHR), reviewLeaveApplication);


export default router;