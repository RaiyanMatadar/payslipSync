# Multi-Company Dynamic Salary Slip & Payroll Management System

A MERN stack project for managing multiple companies, each with its own
salary slip template, dynamic employee forms, editable payslip preview,
bulk payslip generation, and PDF export.

## Project Structure

```
payroll-system/
├── backend/
│   ├── config/db.js            # mongodb connection
│   ├── models/                 # Company, SalaryTemplate, Employee, Payslip
│   ├── controllers/            # business logic for each module
│   ├── routes/                 # express routes
│   ├── middleware/errorHandler.js
│   ├── utils/numberToWords.js  # converts net salary to words
│   ├── utils/pdfGenerator.js   # builds the payslip PDF with pdfkit
│   ├── uploads/                # company logos get saved here
│   ├── seed.js                 # inserts two sample templates
│   └── server.js
└── frontend/
    ├── public/index.html
    └── src/
        ├── api/axios.js
        ├── components/Navbar.js, LineItemEditor.js
        ├── pages/CompanyList.js, TemplateList.js, EmployeeForm.js,
        │         EmployeeList.js, PayslipGenerate.js
        ├── App.js
        └── index.js
```

## How to run

### 1. Backend

```
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI if needed
node seed.js               # adds 2 sample salary templates (Template A & B)
npm run dev                # starts on http://localhost:5000
```

Make sure MongoDB is running locally (or update MONGO_URI to point to
MongoDB Atlas).

### 2. Frontend

```
cd frontend
npm install
npm start                  # starts on http://localhost:3000
```

## Typical workflow to test the app

1. Go to `/templates` and confirm the two seeded templates exist
   (Corporate Detailed and Minimalist Startup), or add your own.
2. Go to `/` (Companies) and create a company, picking a template.
3. Click "Add Employee" — notice the form only asks for the fields the
   chosen template requires (this is the dynamic schema part).
4. Go to "Generate Payslip", pick the employee, choose Single Month or
   Bulk (date range), edit line items live on the preview canvas, then
   save and download the PDF.

## Notes / Known Limitations (student project scope)

- No authentication/login screen yet — the SRS mentions role-based access
  control but that hasn't been implemented in this version.
- PDF layout is basic (built with pdfkit) rather than pixel-perfect
  Puppeteer rendering, to avoid needing a headless Chrome install.
- No automated tests included.
- Logo upload field exists on the backend (multer) but the company
  creation form on the frontend doesn't have a file input wired up yet —
  would be a good next step.
