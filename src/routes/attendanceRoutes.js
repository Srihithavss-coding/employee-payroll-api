// src/routes/attendanceRoutes.js

import express from 'express';
import { punchIn, punchOut, getAttendanceHistory } from '../controllers/attendanceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

const allUsers = [USER_ROLES.ADMIN, USER_ROLES.HR, USER_ROLES.EMPLOYEE];


// 1. Punch In/Out APIs
// These are simple actions, protected by authentication for all users
router.route('/punch-in').post(protect, checkRole(allUsers), punchIn);
router.route('/punch-out').post(protect, checkRole(allUsers), punchOut);


// 2. Get Attendance History
// GET /api/attendance/:employeeId
// We handle the role logic inside the controller:
// - Employee: Can only view their own history.
// - Admin/HR: Can view any history based on the employeeId param.
router.route('/attendance/:employeeId')
    .get(protect, getAttendanceHistory);


export default router;