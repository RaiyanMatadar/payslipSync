# Multi-Company Dynamic Salary Slip & Payroll Management System

A full-featured MERN stack system designed for managing payroll across multiple companies, each with its own compliance salary template, dynamic employee forms, live interactive WYSIWYG A4 salary slip editor, single & bulk range generation, Cloudinary asset storage, database encryption, and dual PDF & ZIP export.

---

## Tech Stack & Architecture

- **Frontend**: React.js 18, Vite, Tailwind CSS, React Router 6, Axios, Lucide Icons
- **Backend**: Node.js, Express.js (REST API)
- **Database**: MongoDB & Mongoose (with automated in-memory fallback for zero-setup local runs)
- **Security**: JWT Admin Authentication, AES-256-CBC field encryption for sensitive data (PAN, GSTIN)
- **Document & PDF Engine**: PDFKit (server-side vector-sharp A4 PDF), Browser Web Print (`@media print`), Archiver (bulk ZIP bundling)
- **Storage**: Cloudinary v2 (for company logos and exported assets) + 3rd-party domain logo discovery fallback

```
payroll-system/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── server.js              ← entry point (npm start / npm run dev)
│       ├── config/                ← db.js (with in-memory fallback), cloudinary.js
│       ├── models/                ← Admin, Company, Employee, SalaryTemplate, Payslip
│       ├── controllers/           ← auth, company, template, employee, payslip
│       ├── routes/                ← authRoutes, companyRoutes, templateRoutes, ...
│       ├── middleware/            ← auth (JWT guard), errorHandler, upload (memory multer)
│       └── utils/                 ← encryption, numberToWords, salaryCalculator,
│                                     pdfGenerator, seed
│
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx               ← Vite root
        ├── App.jsx                ← Routes & ProtectedRoute guard
        ├── index.css              ← Tailwind directives & A4 print CSS
        ├── api/                   ← axios.js with JWT interceptor
        ├── context/               ← AuthContext.jsx
        ├── components/            ← Navbar, EditablePayslipCanvas, LineItemEditor, DynamicField, LogoUpload
        ├── pages/                 ← Login, Dashboard, Companies, Templates, Employees, PayslipGenerate, PayslipHistory
        └── utils/                 ← salaryCalculator.js (client mirror & words converter)
```

---

## Default Admin Credentials

When the server starts for the first time, it automatically seeds the default administrator account and sample salary templates:

- **Email**: `admin@payroll.com`
- **Username**: `admin`
- **Password**: `admin123`

*(A one-click demo credentials autofill button is also available directly on the login screen.)*

---

## Features

1. **Admin Authentication**:
   - Secure JWT-based admin access. All administrative endpoints are guarded.
2. **Company Management**:
   - Create, edit, and view companies with address, email, phone, and website.
   - Upload official company logos directly to Cloudinary or use the **"⚡ Auto-Fetch"** feature to discover high-resolution logos by entering a website domain.
   - Link each company to an active salary template.
   - Sensitive tax IDs (PAN, GSTIN) are automatically encrypted in MongoDB using AES-256.
3. **Dynamic Template System**:
   - Rulebooks governing required vs optional employee fields and default salary heads.
   - Pre-seeded with:
     - **Corporate Detailed (Template A)**: Full compliance requiring PAN, UAN, PF No, Bank Account, IFSC, and Department.
     - **Minimalist Startup (Template B)**: Streamlined structure requiring Bank Account.
4. **Dynamic Employee Management**:
   - Employee creation form automatically adapts to show only the fields enforced by the company's active template.
   - Maintains baseline compensation structures (Basic Pay, HRA, Allowances, PF, Professional Tax, TDS).
5. **Live Interactive WYSIWYG A4 Payslip Canvas**:
   - Real-time in-browser A4 document editor where you can adjust attendance days, add or delete custom earnings (e.g. Bonus, Overtime) and deductions (e.g. Advance, Penalty).
   - Live calculations with exact 2-decimal precision (Gross Pay, Total Deductions, Net Pay).
   - Instant Indian currency text conversion (e.g. *"Rupees Ninety-Five Thousand Only"*).
6. **Single & Bulk Range Generation**:
   - **Single Month**: Select employee and month, preview in WYSIWYG canvas, edit, and save frozen snapshot.
   - **Bulk Mode**: Select employee and a date range (e.g. Jan 2026 – Jun 2026) to generate slips across all months simultaneously.
7. **Immutable Snapshots**:
   - Finalized payslips are stored as frozen snapshots of company and employee details at generation time. Future changes to employee salaries or company profiles never alter historical slips.
8. **Dual Export & Bulk ZIP Bundle**:
   - **Print / Save Web PDF**: Direct high-resolution vector PDF export from the web browser.
   - **PDFKit Server PDF**: Pixel-perfect server-rendered A4 PDF with embedded company logo, subtotals, and signatory block.
   - **ZIP Archive Export**: Download single or multi-slip bundles packaged inside a `.zip` archive.

---

## How to Run

### 1. Backend

```bash
cd backend
npm install
npm start
```

*The backend starts on `http://localhost:5000`. If no local MongoDB is running, it automatically initializes an in-memory MongoDB instance for development.*

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

*The Vite dev server starts on `http://localhost:3000` with automated proxying to the backend.*

---

## Step-by-Step User Flow

1. Open `http://localhost:3000` and sign in with `admin@payroll.com` / `admin123`.
2. Visit **Companies** (`/companies`):
   - Click **Add Company**. Enter company details and website domain (e.g. `stripe.com`).
   - Click **⚡ Auto-Fetch Logo** to pull the brand logo or upload an image. Assign an active template and save.
3. Visit **Employees** (`/employees`):
   - Click **Add Employee**. Select your company — the form dynamically shows only the fields required by the active template. Fill out details and save.
4. Visit **Generate Salary Slip** (`/generate`):
   - Select the company and employee.
   - In **Single Mode**, the interactive A4 canvas renders immediately with pre-filled baseline compensation.
   - Edit attendance, add a bonus or deduction, watch totals and words recalculate live.
   - Click **Save Payslip Snapshot**.
   - Click **Print / Save Web PDF** or **PDFKit Export** to download the salary slip.
   - Or toggle to **Bulk Date Range** to generate multiple consecutive months in one click.
5. Visit **Payslip History** (`/payslips`):
   - Search by employee code or name, filter by company/month.
   - Click **Edit / Preview** to re-open any slip in the interactive WYSIWYG editor.
   - Select multiple slips and click **Export Selected as ZIP** to download a packaged `.zip` archive.
