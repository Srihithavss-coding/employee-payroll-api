// src/routes/reportRoutes.js

import express from 'express';
import { getSummaryReport } from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

const adminHR = [USER_ROLES.ADMIN, USER_ROLES.HR];

// GET /api/reports/summary - Restricted to Admin/HR
router.get('/summary', protect, checkRole(adminHR), getSummaryReport);

// TODO: /api/reports/monthly will be a more detailed report (e.g., total hours, overtime)

export default router;