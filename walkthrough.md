# HOD Module: Feature Walkthrough

We have successfully implemented a dedicated module for the **Head of Department (HOD)**. This allows HODs to monitor their department's certification progress independently.

## 1. HOD Registration & Login
HODs now have their own dedicated entry points into the system.

- **Registration**: HODs can sign up at [/hod/register](file:///d:/CERTIFY_HUB/certify_frontend/src/app/hod/register/page.tsx) and must choose their department.
- **Login**: A secure login portal at [/hod/login](file:///d:/CERTIFY_HUB/certify_frontend/src/app/hod/login/page.tsx) ensures they access their specific departmental data.

## 2. Departmental Stats Dashboard
The new [HOD Dashboard](file:///d:/CERTIFY_HUB/certify_frontend/src/app/hod/dashboard/page.tsx) provides a high-level overview of the department's performance.

### Key Features:
- **Real-time Statistics**: View total, accepted, pending, and rejected certificates specifically for your department.
- **Platform Adoption**: A visual bar chart showing which certification platforms (Coursera, Udemy, NPTEL, etc.) are most popular among your students.
- **Completion Rate**: A circular progress indicator showing how much of the department's work has been verified.
- **Detailed Ledger**: A filterable table of all student certificates in the department, with search and filter capabilities by Year, Section, and Status.

## 3. Data Isolation (Security)
The system ensures that a **CSE HOD can only see CSE data**. This is handled both on the frontend and enforced strictly on the backend API using JWT payload department filtering.

## How to Test:
1.  Go to the **HOD Registration** page.
2.  Register a new HOD for a specific department (e.g., "CSE").
3.  Log in as that HOD.
4.  Observe that the dashboard shows only data for students belonging to the "CSE" department.
