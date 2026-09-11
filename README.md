# 💼 Multi-Company Dynamic Salary Slip & Payroll Management System

A full-stack, enterprise-grade payroll and dynamic salary slip management system built with **React (Vite)**, **Node.js (Express)**, and **MongoDB (Mongoose)**. Designed to handle multiple corporate entities, flexible salary templates, employee master records with encrypted compliance fields, interactive WYSIWYG payslip editing, and high-fidelity PDF/ZIP exports.

## 🚀 Quick Start Guide

Follow these steps to get the project running locally:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd payroll-system
```

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for local dev):
   ```bash
   # On Linux / macOS:
   cp .env.example .env

   # On Windows (PowerShell):
   copy .env.example .env
   ```
   > **Note**: The backend works out of the box with defaults. If `MONGO_URI` is omitted, it will automatically launch an in-memory MongoDB database.

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will start at **`http://localhost:5000`** and will auto-seed the default administrator account and salary templates.

---

### 3. Frontend Setup

1. In a new terminal window, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🔐 Default Admin Credentials

Upon initial server boot, the system automatically seeds an administrator account:

| Field | Value |
|---|---|
| **Login URL** | `http://localhost:3000/login` |
| **Email** | `admin@payroll.com` |
| **Username** | `admin` |
| **Password** | `admin123` |

> 💡 *You can log in using either the Email or the Username.*

---

## ⚙️ Environment Variables

The backend supports configuration via environment variables. Create a `backend/.env` file with the following keys:

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port for the Express server to listen on |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`) |
| `MONGO_URI` | No | *In-Memory DB* | MongoDB connection string (e.g. `mongodb://127.0.0.1:27017/payroll`) |
| `JWT_SECRET` | No (Dev) / Yes (Prod) | Built-in fallback | Secret key used to sign and verify JSON Web Tokens |
| `ENCRYPTION_KEY` | No (Dev) / Yes (Prod) | Built-in fallback | 32-character key for AES-256-CBC field encryption |
| `CLOUDINARY_CLOUD_NAME`| No | *None* | Cloudinary Cloud Name for storing company logos |
| `CLOUDINARY_API_KEY` | No | *None* | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | No | *None* | Cloudinary API Secret |

> **Graceful Fallbacks**:
> - If `MONGO_URI` is not reachable, the system uses an embedded MongoDB in-memory server.
> - If Cloudinary is not configured, company logos are converted and stored as standard Base64 data URIs.

---

## 📜 Available Scripts

### Backend (`/backend`)

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `nodemon src/server.js` | Starts the server with live-reloading via Nodemon |
| `npm start` | `node src/server.js` | Runs the server in production mode |
| `npm run seed` | `node src/utils/seed.js` | Manually resets or syncs default admin user & templates |

### Frontend (`/frontend`)

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Starts the Vite development server on port `3000` |
| `npm run build` | `vite build` | Compiles and bundles production-ready frontend assets |
| `npm run preview`| `vite preview` | Previews the compiled production build locally |

---

## 🔌 API Endpoints Overview

All backend endpoints are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header (`Bearer <token>`).

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate admin and receive JWT token
- `POST /api/auth/register` - Register a new administrator
- `GET /api/auth/me` - Fetch authenticated user details *(Protected)*

### 🏢 Companies (`/api/companies`)
- `GET /api/companies` - List all registered companies *(Protected)*
- `GET /api/companies/:id` - Get company details by ID *(Protected)*
- `POST /api/companies` - Register a new company with logo upload (`multipart/form-data`) *(Protected)*
- `PUT /api/companies/:id` - Update company details or replace logo *(Protected)*
- `DELETE /api/companies/:id` - Remove a company *(Protected)*
- `GET /api/companies/lookup-logo?name=Company` - Fetch public logo suggestions

### 📑 Salary Templates (`/api/templates`)
- `GET /api/templates` - Retrieve all templates *(Protected)*
- `GET /api/templates/:id` - Retrieve a single template by ID *(Protected)*
- `POST /api/templates` - Create a custom salary template *(Protected)*
- `PUT /api/templates/:id` - Update an existing template *(Protected)*
- `DELETE /api/templates/:id` - Delete a salary template *(Protected)*

### 👥 Employees (`/api/employees`)
- `GET /api/employees` - List employees (filterable by `companyId`) *(Protected)*
- `GET /api/employees/:id` - Get employee profile *(Protected)*
- `POST /api/employees` - Create an employee profile *(Protected)*
- `PUT /api/employees/:id` - Update employee information *(Protected)*
- `DELETE /api/employees/:id` - Delete an employee record *(Protected)*

### 💵 Payslips (`/api/payslips`)
- `POST /api/payslips/preview` - Live recalculation preview for draft payslips
- `GET /api/payslips` - Search and list payslips (by company, month, year) *(Protected)*
- `GET /api/payslips/:id` - Get single payslip snapshot *(Protected)*
- `POST /api/payslips` - Save and generate a finalized payslip *(Protected)*
- `POST /api/payslips/bulk` - Batch generate payslips for employees *(Protected)*
- `GET /api/payslips/:id/pdf` - Stream generated PDF payslip *(Protected)*
- `GET /api/payslips/export/zip` - Download bundled ZIP archive of payslip PDFs *(Protected)*
- `DELETE /api/payslips/:id` - Delete a generated payslip *(Protected)*