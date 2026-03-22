# Certificate Hub

A centralized web-based system for managing, viewing, verifying, and exporting student certificates with structured organization and bulk operations support.

## 🚀 Features

### Universal Features
- ✅ **Mobile-First Design**: Fully responsive layout optimized for smartphones and tablets
- ✅ **Mobile Navigation**: Intuitive slide-out hamburger menus for seamless mobile experience
- ✅ **Responsive Data**: Smart horizontal scrolling for large data tables on smaller screens

### Student Module
- ✅ Secure student registration and login
- ✅ Upload certificates with platform and category selection
- ✅ Dynamic category dropdown (appears for Coursera platform)
- ✅ View uploaded certificates with verification status
- ✅ Dashboard with statistics (total, verified, pending, rejected)
- ✅ Support for all file formats (PDF, images, etc.)

### Faculty Module
- ✅ Faculty login and authentication
- ✅ View all students with certificate counts and **"Verified By"** status
- ✅ Search and filter students by academic year, section, name, or roll number
- ✅ View all certificates for any student with individual verifier names
- ✅ PDF and image preview support
- ✅ Accept/reject certificate verification (recorded with verifier identity)
- ✅ Download individual student certificates as ZIP
- ✅ Bulk download with filters (creates nested ZIP structure)
- ✅ Export reports in CSV, Excel, or PDF format
- ✅ **Student Management**: Securely delete student profiles and their associated records
- ✅ **Dynamic Settings (Admins Only)**: Add, edit, or delete Departments, Sections, and Platforms

### HOD Module
- ✅ HOD login with department scoping
- ✅ **Administrative Delegation**: Create faculty accounts and grant/revoke admin powers
- ✅ **Department Management**: List all department faculty and manage their administrative status
- ✅ **Faculty Deletion**: Securely remove faculty profiles from the platform
- ✅ **Profile Management**: Update HOD profile details and credentials
- ✅ Department-level dashboard stats (total, verified, pending, rejected)
- ✅ Platform adoption and completion rate analytics
- ✅ Department ledger with filters (year, section, platform, status)
- ✅ Bulk department download (filtered ZIP)
- ✅ Export department report (Excel)

## 🛠️ Technology Stack

### Backend
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **File Processing**: Archiver (ZIP), ExcelJS, PDFKit

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Zustand
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form

## 📁 Project Structure

```
CERTIFY_HUB/
├── certify_backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, upload, error handling
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (file, export)
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helper functions
│   │   └── index.ts         # Application entry point
│   ├── database/
│   │   └── schema.sql       # Database schema
│   ├── uploads/             # File storage (gitignored)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── certify_frontend/
    ├── src/
    │   ├── app/             # Next.js app router pages
    │   │   ├── student/     # Student pages
    │   │   ├── faculty/     # Faculty pages
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── components/      # Reusable components
    │   │   └── ui/          # UI components
    │   ├── contexts/        # React contexts
    │   ├── lib/             # Utilities and API client
    │   └── types/           # TypeScript types
    ├── package.json
    ├── tsconfig.json
    └── tailwind.config.ts
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Database Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE certify_hub;
```

2. Run the schema file:
```bash
cd certify_backend
psql -U postgres -d certify_hub -f database/schema.sql
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd certify_backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=certify_hub
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

5. Start the development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd certify_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Student
- `POST /api/student/certificates/upload` - Upload certificate
- `GET /api/student/certificates` - Get my certificates
- `GET /api/student/dashboard` - Get dashboard stats

### Faculty
- `GET /api/faculty/students` - Get student list (paginated)
- `GET /api/faculty/students/:studentId/certificates` - Get student certificates
- `GET /api/faculty/certificates/:certificateId/file` - Get certificate file
- `PUT /api/faculty/certificates/:certificateId/verify` - Verify certificate
- `GET /api/faculty/download/student/:studentId` - Download student ZIP
- `POST /api/faculty/download/bulk` - Bulk download with filters
- `POST /api/faculty/export` - Export report (CSV/Excel/PDF)
- `POST /api/faculty/departments` - Create department (**Admin Only**)
- `POST /api/faculty/sections` - Create section (**Admin Only**)
- `POST /api/faculty/platforms` - Create platform (**Admin Only**)

### HOD
- `GET /api/hod/stats` - Department dashboard stats
- `GET /api/hod/platform-adoption` - Platform adoption (per platform student counts)
- `GET /api/hod/completion-rate` - Completion rate (verified/processed percentage)
- `GET /api/hod/ledger` - Department ledger (filters: year, section, platform, status)
- `POST /api/hod/bulk-download` - Bulk download filtered certificates (ZIP)
- `POST /api/hod/export-report` - Export department report (Excel)

### Platforms
- `GET /api/platforms` - Get all platforms
- `GET /api/platforms/:platformId/categories` - Get platform categories

## 🎯 Usage Guide

### For Students

1. **Register**: Go to Student Login → Register
   - Provide email, password, name, roll number, academic year, and section

2. **Upload Certificate**:
   - Select platform (Coursera, Internship, Skill Course, Others)
   - If Coursera is selected, choose category (Domain, ESRM, Elective)
   - Select file and upload

3. **View Status**: Check dashboard for verification status

### For Faculty

1. **Login**: Use faculty credentials

2. **View Students**: Browse student list with filters

3. **Verify Certificates**:
   - Click "View" button next to student
   - Review certificates
   - Accept or reject each certificate

4. **Download**:
   - Single student: Click download button next to student
   - Bulk: Apply filters and click "Bulk Download"

5. **Export Report**:
   - Apply filters (optional)
   - Click "Export CSV/Excel/PDF"
   - Report includes roll number, name, year, section, certificate counts

6. **Settings (Super Admin Only)**:
   - Faculty members with **Department Admin** status can access the "Settings" menu.
   - Dynamically manage the list of **Departments**, **Sections**, and **Platforms** (including Coursera categories).
   - Any changes made here reflect globally for all students and faculty.

### For HOD

1. **Login**: Use HOD credentials (department is tied to your account)

2. **Faculty Management**:
   - **Register Faculty**: Use the "Create Faculty" button in the header to register new faculty members for your department.
   - **Delegate Admin Power**: Visit the "Faculty List" to promote faculty members to "Super Admin" status, granting them registration and deletion privileges.
   - **Revoke Privileges**: Use the action menu in the Faculty List or Dashboard to revoke administrative status instantly.

3. **View Department Dashboard**:
   - See totals (uploaded, verified, pending, rejected)
   - Check platform adoption and completion rate charts
   - View a list of current Department Administrators and take quick actions.

4. **Ledger & Filters**:
   - Filter by year, section, platform, status
   - Drill into certificate records for the department

5. **Bulk Download**:
   - Apply filters, then click "Bulk Download" to get a department ZIP archive

6. **Export Department Report**:
   - Click "Export" to download an Excel report containing the filtered ledger

## 🔐 Default Credentials

The database schema includes a default faculty account:
- **Email**: faculty@certifyhub.com
- **Password**: faculty123

⚠️ **Important**: Change this password after first login!

## 📦 File Storage

Certificates are stored in `certify_backend/uploads/certificates/` with the following structure:
```
uploads/
└── certificates/
    └── {studentId}/
        └── {timestamp}_{originalFileName}
```

For production, migrate to cloud storage (AWS S3, Azure Blob, etc.)

## 🚢 Production Deployment

### Backend
1. Build TypeScript:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

### Frontend
1. Build Next.js:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

### Environment Variables
- Set `NODE_ENV=production`
- Use strong JWT secret
- Configure production database
- Set up HTTPS
- Configure CORS for production domain

## 🤝 Contributing

This is an educational project. Feel free to fork and modify as needed.

## 📄 License

MIT License

## 👥 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for efficient certificate management**
