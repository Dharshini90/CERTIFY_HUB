# CertifyHub: 5-Member Viva Pitch Guide

To impress the examiners, your team should present as a professional "Startup Team" where everyone knows their specific domain. Here is how to divide the roles and topics:

---

## Member 1: Project Lead & System Architect
**Role**: The "Big Picture" Person.
*   **What to explain**:
    *   **Introduction**: The problem statement and why CertifyHub is needed.
    *   **Architecture**: Explain the **Client-Server model** and why you chose the **MVC (Model-View-Controller)** pattern for the backend.
    *   **Overall Flow**: How a certificate moves from Student (Upload) → Faculty (Verify) → HOD (Analytics).

## Member 2: Frontend & UX Lead
**Role**: The "User Experience" Expert.
*   **What to explain**:
    *   **Tech Stack**: Why **Next.js** and **Tailwind CSS** were used (Performance + Responsive Design).
    *   **Identity**: Show the **Authentication Flow** (Login/Register) for different roles.
    *   **Student Module**: Explain how the dashboard motivates students through progress tracking and clear status indicators (Accepted/Rejected).

## Member 3: Backend & Security Specialist
**Role**: The "Gatekeeper" of Data.
*   **What to explain**:
    *   **Authentication Logic**: How **JWT (JSON Web Tokens)** work in this project and why they are safer than traditional sessions.
    *   **Faculty Module**: Explain the **Verification Pipeline**—how faculty can preview files in the browser and record decisions with feedback (Rejection Reasons).
    *   **API Design**: Mention that you used **RESTful principles** for all endpoints.

## Member 4: Data Analytics & Reporting Head
**Role**: The "Admin Power" Person.
*   **What to explain**:
    *   **HOD Dashboard**: How the project transforms raw data into **Real-time KPIs** (Total vs. Verified).
    *   **Export Logic**: Explain the technical side of generating **ZIP archives** (using Archiver) and **Excel Reports** (using ExcelJS).
    *   **Dynamic Selection**: How the system fetches data like Departments dynamically from the API to stay synchronized.

## Member 5: Database & Lifecycle Manager
**Role**: The "Data Integrity" Specialist.
*   **What to explain**:
    *   **Database Schema**: Explain the relations between **Users, Certificates, and Departments** in PostgreSQL.
    *   **Data Integrity**: Why you chose a relational database to ensure students can't be registered without a valid department/section.
    *   **Lifecycle Management**: Explain the **Student Deletion Logic**—how you ensure that when a user is removed, all their files and DB entries are cleared (Cascading cleanup).

---

## Pro-Tips for the Group:
1.  **Seamless Transitions**: When Member 1 finishes, say: *"Now, [Member 2] will walk you through the user interface where all this starts."*
2.  **Cross-Questions**: If an examiner asks Member 2 a database question, Member 2 should answer: *"While I focused on the UI, our Data Lead [Member 5] can explain the specific table relations."* (This shows teamwork!).
3.  **The "Wow" Factor**: Always end by showing the **HOD Excel Report**. It’s the most "complete" feature that shows the project's real-world value.
