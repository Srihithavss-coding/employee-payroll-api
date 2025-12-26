# Employee Payroll & HR Management RESTful API

**Project Overview**
This is a production-ready Node.js/Express.js RESTful API designed to manage core Human Resources (HR) and Payroll functionalities. It features a secure, role-based access control (RBAC) architecture to govern access for Administrators, HR staff, and Employees. The API handles complex business logic, including automated payroll calculation and secure cloud storage.

**Key Features**

* **Role-Based Access Control (RBAC):** Distinct workflows for Admin and Employee roles with secure JWT authentication (9999-day demo session).
* **Efficient Data Management:** Server-side **Pagination** and **Regex Search** on the Employee list to handle large datasets.
* **Media Integration:** Profile picture management using **Multer** and **Cloudinary** for persistent image hosting.
* **Complex Analytics:** Advanced **MongoDB Aggregation Pipelines** to generate real-time payroll and attendance summaries.
* **Attendance Tracking:** Geo-fencing ready Punch-In/Out system with leave management logic.


**Technology Stack**

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | **Node.js, Express.js** | Core runtime environment and web framework. |
| **Database** | **MongoDB, Mongoose** | NoSQL database and Object Data Modeling (ODM). |
| **Authentication** | **JWT, bcrypt** | Token-based security and password hashing. |
| **External Services** | **Cloudinary** | Secure cloud storage for files (e.g., employee photos, resumes). |
| **Development** | **Nodemon, dotenv** | Live reloading and environment variable management. |
| **Deployment** | **Git, Render** | Version control and cloud hosting platform. |


**Security and Access Control**


| Role | Access Level | Examples of Exclusive Access |
| :--- | :--- | :--- |
| **Admin** | Full access to all endpoints. | User registration, employee CRUD, final payroll approval. |
| **HR** | Management access (less than Admin). | Employee CRUD, Leave approval, Payroll generation. |
| **Employee** | Self-service access only. | Punch in/out, View own profile, Request leave. |


**API Endpoints (Quick Reference)**

The base URL for all endpoints is {{BASE_URL}}/api/.

| Feature | Method | Endpoint Example | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/auth/login` | Public | Generate JWT and establish session. |
| **Employee** | `GET` | `/employees?page=1&status=active` | Admin/HR | Retrieve all employees with search/pagination. |
| **Attendance** | `POST` | `/punch-in` | Employee | Record start of shift. |
| **Leave** | `PUT` | `/leaves/:id/approve` | Admin/HR | Approve or reject a submitted leave request. |
| **Payroll** | `GET` | `/payroll/:employeeId` | Admin/HR | **Calculate and generate** payroll record. |
| **Payroll** | `PUT` | `/payroll/:id/pay` | Admin/HR | Finalize payroll and mark status as **Paid**. |
| **Reports** | `GET` | `/reports/summary` | Admin/HR | Retrieve aggregated dashboard statistics. |
| **File Upload** | `POST` | `/upload` | Private | Upload files to Cloudinary. |

**Setup and Local Installation**
Prerequisites:
Node.js (v18+) and npm installed.

MongoDB Atlas account for a cloud database connection.

Cloudinary account for file storage.

The API is fully deployed and production-ready.   
Platform: Render

## Demo & Testing

To explore the API's protected features (Role-Based Access, Payroll Reports), you can use the live base URL and the demo credentials provided below.

### Demo Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `demoPassword123` |
| **Employee** | `demo.employee.final@hr.com@` | `UserPassword123` |   

 # Live API URL: [(https://employee-payroll-api-live.onrender.com)]
* **Interactive API Documentation:** (https://documenter.getpostman.com/view/46779970/2sBXVZpa6M)

### Quick Start for Recruiters
1. **Login:** Send a `POST` request to `/auth/login` with the Admin credentials.
2. **Authorize:** Copy the `accessToken` and paste it into the **Bearer Token** field in Postman.
3. **Explore:** Access protected routes like `GET /reports/summary` to see the payroll aggregation in action.
