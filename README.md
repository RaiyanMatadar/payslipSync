# 💼 Multi-Company Dynamic Salary Slip & Payroll Management System

A full-stack, enterprise-grade payroll and dynamic salary slip management system built with **React (Vite)**, **Node.js (Express)**, and **MongoDB (Mongoose)**. Designed to handle multiple corporate entities, flexible salary templates, employee master records with encrypted compliance fields, interactive WYSIWYG payslip editing, and high-fidelity PDF/ZIP exports.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide](#-quick-start-guide)
- [Default Admin Credentials](#-default-admin-credentials)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Security & Data Encryption](#-security--data-encryption)
- [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## ✨ Features

- **Multi-Company Management**: Manage multiple legal entities/companies with individual addresses, tax IDs (GSTIN, PAN), contact details, and brand logos.
- **Dynamic Salary Templates**: Create customizable salary structures (e.g., *Corporate Detailed*, *Minimalist Startup*) with configurable earnings, deductions, and mandatory compliance fields.
- **Employee Directory**: Maintain employee profiles linked to specific companies and templates, tracking designations, departments, baseline compensation, and bank credentials.
- **Interactive Payslip Generator**: Live WYSIWYG salary slip editor with instant calculations for gross salary, total deductions, and net pay.
- **Automated Amount in Words**: Automatic conversion of net pay figures to localized words (e.g., INR formatting).
- **PDF Generation & Branding**: Download professional, vectorized PDF salary slips generated on the server using `pdfkit` complete with company branding and signatory disclosures.
- **Bulk Processing & ZIP Export**: Batch generate payroll across date ranges and export company-wide payslips bundled in a single ZIP archive.
- **Zero-Config Developer Database**: Automatic fallback to `mongodb-memory-server` if local MongoDB is not running—enabling immediate testing with zero setup.
- **Database-Backed Authentication**: Uses administrator accounts stored in MongoDB without creating demo credentials on startup.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/) (with JWT request/response interceptors)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) (with [MongoMemoryServer](https://github.com/nodkz/mongodb-memory-server) fallback)
- **Authentication**: JWT (JSON Web Tokens) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **PDF & File Streaming**: [PDFKit](https://pdfkit.org/) & [Archiver](https://www.archiverjs.com/)
- **File Uploads**: [Multer](https://github.com/expressjs/multer) & [Cloudinary](https://cloudinary.com/) (with fallback to base64 Data URIs)
- **Cryptography**: Node.js `crypto` (AES-256-CBC) for sensitive employee data

---

## 🏗 System Architecture

```text
payroll-system/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection & Cloudinary setup
│   │   ├── controllers/        # Express route handlers (Auth, Company, Employee, etc.)
│   │   ├── middleware/         # Auth verification, file upload, global error handling
│   │   ├── models/             # Mongoose schemas (Admin, Company, Employee, Payslip, Template)
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── utils/              # PDF generator, number-to-words, encryption, database seeder
│   │   └── server.js           # Express app bootstrap & database connection
│   ├── uploads/                # Local asset storage fallback
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Configured Axios instance with interceptors
│   │   ├── components/         # Reusable UI widgets, Navbar, ProtectedRoute, Canvas editor
│   │   ├── context/            # AuthContext & global state
│   │   ├── pages/              # Dashboard, Companies, Employees, Payslip views, Login
│   │   ├── utils/              # Client-side salary calculators
│   │   ├── App.jsx             # Router definition & route guards
│   │   └── main.jsx            # Application mount point
│   ├── vite.config.js          # Vite config & API reverse proxy
│   ├── tailwind.config.js      # Tailwind styling definitions
│   └── package.json
│
└── README.md
```

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js**: `v18.x` or higher (LTS recommended)
- **npm** (`v9+`) or **yarn**
- *(Optional)* **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a MongoDB Atlas URI. **Note:** If no MongoDB connection is configured or reachable, the backend will automatically spin up an in-memory database.

---

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
   The backend will start at **`http://localhost:5000`** and will use the administrator accounts already stored in MongoDB.

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

## 🔐 Administrator Access

Sign in with an administrator account already stored in MongoDB. For initial setup, create an account through `POST /api/auth/register`, then use its email or username at the login screen.

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

---

## 🔒 Security & Data Encryption

1. **Field-Level Encryption**: Sensitive identifiers (such as PAN, UAN, PF number, Aadhar) are encrypted before persisting to MongoDB using Node's `crypto` with **AES-256-CBC**. They are automatically decrypted when loaded.
2. **Immutable Payslip Snapshots**: When a payslip is generated, a complete immutable snapshot of company branding, signatory titles, and employee metadata is preserved with the payslip. Changes to an employee profile later will not alter historic records.
3. **Protected Downloads**: Secure PDF and bulk ZIP exports validate JWT tokens directly via headers or tokenized query parameters.

---

## ❓ Troubleshooting & FAQ

<details>
<summary><strong>Q: I restarted the backend and my newly added companies/employees disappeared. Why?</strong></summary>

If you do not specify a `MONGO_URI` in `backend/.env` and do not have a local MongoDB daemon running on port 27017, the backend uses `mongodb-memory-server`. In-memory databases are stored strictly in RAM and will reset when the server process terminates. To persist data permanently, install MongoDB locally or provide a MongoDB Atlas URI in `backend/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/payroll
```
</details>

<details>
<summary><strong>Q: How does the frontend communicate with the backend?</strong></summary>

Vite is configured with a development proxy in `frontend/vite.config.js`. Requests made to `/api` or `/uploads` from port `3000` are automatically proxied to `http://localhost:5000`. You do not need to configure CORS for local development.
</details>

<details>
<summary><strong>Q: Can I run this system without a Cloudinary account?</strong></summary>

**Yes.** If Cloudinary credentials are not set, the application automatically handles uploaded company logos as Base64 data URIs. These render natively in both the browser UI and generated PDF payslips.
</details>

<details>
<summary><strong>Q: How do I change the default admin password?</strong></summary>

You can register a new admin account via `POST /api/auth/register` and then sign in using the created credentials.
</details>

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

