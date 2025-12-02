import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';

// Import Middleware
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import uploadRoutes from './routes/uploadRoutes.js'; 
import reportRoutes from './routes/reportRoutes.js'; 


// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- Express Configuration ---
// Parse JSON bodies (for requests)
app.use(express.json());

// --- Core API Routes ---
// Health Check Route
app.get('/', (req, res) => {
    res.send('Employee Payroll API is running...');
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Employee Management Routes (Protected)
app.use('/api/employees', employeeRoutes);

// Attendance Routes (Punch in/out)
app.use('/api', attendanceRoutes); // Using /api/punch-in, /api/punch-out

// Leave Routes
app.use('/api/leaves', leaveRoutes);

// Payroll Routes
app.use('/api/payroll', payrollRoutes);

// File Upload Route
app.use('/api/upload', uploadRoutes); 
// src/index.js (More Additions)

// Reports & Dashboard Route
app.use('/api/reports', reportRoutes); // <-- NEW ROUTE


// --- Error Handling Middleware ---
// Handle 404 Not Found errors
app.use(notFound);

// Custom error handling (must be the last middleware)
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});