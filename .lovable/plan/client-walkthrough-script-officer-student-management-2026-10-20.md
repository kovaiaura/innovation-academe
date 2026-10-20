# Client Walkthrough Script — Officer, Student, Management

A presenter's script document (Word .docx, plus a PDF copy) saved to Files. It covers each role, going through that role's menus in the order they appear in the app.

## Structure

1. **Opening (about 1 min):** what META-INNOVA is (STEM learning plus institution operations in one place), what the client gets, and how the three roles work together.
2. **One chapter per role.** Each chapter starts with:
   - Who this person is and what problem the platform solves for them
   - The role's top 3 USPs
   - A short "say this" opening line for the presenter
3. **Then one block for every menu item in that role**, each with:
   - **What it is**: one line
   - **Show:** what to click during the demo
   - **Say:** a 2–4 sentence spoken script
   - **USP / benefit:** why it matters to the client
4. **Closing:** how the roles connect (officer marks a session, the student's progress and certificate update, management sees the reports), common client questions with answers, and next steps.

## Menus covered (taken from the live app menus)

- **Innovation Officer:** Dashboard, Task, My Timetable, Institution Calendar, Assessments, Assignments, Course Outcomes, Course Curriculum, My Profile, Projects, Awards & Achievements, Lab Inventory, Class Attendance (course/level/session marking, quick bulk marking, remarks), Leave Management, External Events, Ask Metova, MetaINNOVA Events, Newsletters, Notifications.
- **Student:** Dashboard (continue learning, badges, class/institute rank), My Courses, Assessments, Assignments, Course Outcomes, My Projects, Awards & Achievements, External Events, Timetable, Certificates (automatic on completion), Gamification, Resume, Ask Metova, MetaINNOVA Events, Newsletters, Notifications.
- **Management:** Dashboard, Students, Innovation Officers, Courses & Sessions, Assessments, Assignments, Course Outcomes, Analytics (current/previous academic year), Inventory & Purchase, Projects, Awards & Achievements, SDG Dashboard, External Events, Reports (monthly PDF reports from META-INNOVA, attendance reports), MetaINNOVA Events, Newsletters, Timetable, Institution Calendar, Attendance, My Profile, Ask Metova.

Platform-wide points to mention: each institution's data is kept separate, academic year selection, mobile-friendly screens, and secure course PDFs.

## Delivery

- `META-INNOVA_Client_Walkthrough_Script.docx` (editable), plus a PDF copy
- About 20–30 pages, with a clean heading per role and menu, styled to match the META-INNOVA brand
- Before delivery, I'll check every page as an image for layout problems
- No changes to the app itself

## Technical details

- Menu list comes from `src/components/layout/Sidebar.tsx`. I'll check each menu's features by reading the matching page before writing its script.
- I'll generate the file with python-docx, convert it to PDF with LibreOffice, and save both to /mnt/documents.
