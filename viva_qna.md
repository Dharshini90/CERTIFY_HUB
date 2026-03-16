# CertifyHub: Ultimate Viva Q&A Guide

This document contains a curated list of questions you are likely to be asked during your project viva, along with concise, technically accurate answers.

---

## 🟢 Category 1: General & Introduction

**Q1: What is the main objective of CertifyHub?**
*   **A**: To modernize and automate the manual certification verification process in colleges. It provides a three-tiered system (Student, Faculty, HOD) for uploading, authenticating, and analyzing student certification data.

**Q2: What are the primary modules of your system?**
*   **A**: We have 3 main modules:
    1.  **Student Module**: For management of certificate uploads and progress tracking.
    2.  **Faculty Module**: For bulk student record management and verification.
    3.  **HOD Module**: For departmental analytics, leadership oversight, and bulk reporting.

**Q3: Why did you choose this technology stack?**
*   **A**: We chose **Next.js** for a modern React-based SEO-friendly frontend, **Express** with **TypeScript** for a scalable and type-safe backend, and **PostgreSQL** for its reliability in handling structured relational data.

---

## 🔵 Category 2: Frontend (Next.js & UI/UX)

**Q4: Why did you use Next.js instead of plain React?**
*   **A**: Next.js provides built-in routing (App Router), optimized image handling, and better developer experience out of the box. Its folder-based routing (`app/student/dashboard/page.tsx`) makes the project very organized.

**Q5: How did you handle the complex filter layout in the HOD Dashboard?**
*   **A**: I used a combination of **Tailwind CSS Grid and Flexbox**. I also modified our reusable [Select](file:///D:/CERTIFY_HUB/certify_frontend/src/components/ui/Select.tsx#4-10) component to accept a `containerClassName` prop so I could control the layout and alignment of the labels and dropdowns globally.

**Q6: How do you handle file previews (PDFs/Images) in the browser?**
*   **A**: For PDFs, we use an `<iframe>` pointing to a backend stream route. For images, we use a standard `<img>` tag. We pass an `auth_token` in the URL query to ensure only authorized users can view the files.

---

## 🟡 Category 3: Backend (Node.js & TypeScript)

**Q7: What is the advantage of using TypeScript over JavaScript in the backend?**
*   **A**: TypeScript adds static types. If we try to access a field that doesn't exist on the [User](file:///D:/CERTIFY_HUB/certify_frontend/src/types/index.ts#2-14) object, the code won't compile. This prevents "Undefined" errors and makes the code much more predictable.

**Q8: Explain the role of a Controller in your MVC architecture.**
*   **A**: Controllers act as the "Brain." They receive the request from the Route, process the logic (like calculating statistics or validating data), interact with the Models (Database), and send the final Response back to the user.

**Q9: How do you handle file uploads in Express?**
*   **A**: We use **Multer**, a middleware for handling `multipart/form-data`. It saves the files to a specific directory (`uploads/`) and we store the resulting file path in the database.

---

## 🔴 Category 4: Database (PostgreSQL)

**Q10: Can you explain your database schema/tables?**
*   **A**: We have 4 core tables:
    1.  `users`: Stores credentials and roles (Student, Faculty, HOD).
    2.  `certificates`: Stores metadata like file paths and verification status.
    3.  `departments`: Defines the list of available departments.
    4.  `sections`: Defines student sections.

**Q11: What is a "Foreign Key," and how did you use it?**
*   **A**: A Foreign Key connects two tables. For example, `student_id` in the `certificates` table is a foreign key that references the [id](file:///D:/CERTIFY_HUB/certify_frontend/src/contexts/AuthContext.tsx#16-62) in the `users` table. This ensures every certificate belongs to a real student.

**Q12: How do you calculate "Completion Rate" in the database?**
*   **A**: We use the SQL `COUNT` function. We divide the number of 'accepted' certificates by the total number of certificates and multiply by 100.

---

## 🔒 Category 5: Security & Authentication

**Q13: What is JWT, and how is it used in your project?**
*   **A**: **JSON Web Token**. It’s a string sent by the server after login. The client stores it and sends it in the `Authorization` header for every API request. It’s "stateless," meaning the server doesn't need to keep a session record.

**Q14: How do you prevent a Student from accessing HOD data?**
*   **A**: We use **Role-Based Access Control (RBAC)**. We have a middleware called [requireRole](file:///D:/CERTIFY_HUB/certify_backend/src/middleware/auth.ts#36-51). When an API is called, the middleware checks the `role` inside the JWT. If it doesn't match 'hod', the request is rejected with a `403 Forbidden` error.

**Q15: How are passwords stored securely?**
*   **A**: We use **Bcrypt** hashing. We never store the actual password. Instead, we store a "salted hash." Even if the database is leaked, the original passwords remain safe.

---

## 🚀 Category 6: Advanced Features

**Q16: How did you implement the Excel Export feature?**
*   **A**: We used the `ExcelJS` library. The backend fetches the stats, creates an Excel workbook in memory, styles the headers (bold fonts, colors), and then streams it to the client as a `.xlsx` file.

**Q17: What happens technically when a student is deleted?**
*   **A**: 
    1.  The backend finds all certificates belonging to that student.
    2.  It uses the `fs.unlink` (Node.js File System) to delete the physical PDF/JPG files.
    3.  It then runs a SQL `DELETE` query to remove the user and their records from the database.

**Q18: How do you ensure HODs only see their department?**
*   **A**: During login, the HOD's department is part of the JWT. Every HOD API automatically adds a `WHERE department = 'HOD_DEPT'` filter to the SQL query to isolate the data.

---

## 💡 Final Closing Tip
If you are asked a question you don't know the exact answer to, say:
*"I focused primarily on the implementation of the [Your Module], but from our architectural discussions, I know we handled [Topic] using a [Middleware/Service] approach. I'd be happy to walk you through how it integrates with the rest of the system."*
