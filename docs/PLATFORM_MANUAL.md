# META-INNOVA Platform Manual
## Complete User Guide for All Modules and Roles

**Version:** 1.0  
**Last Updated:** January 2025  
**Platform:** META-INNOVA LMS & ERP Suite

---

## Table of Contents

1. [Platform Overview and User Roles](#1-platform-overview-and-user-roles)
2. [LMS - Learning Management System](#2-lms---learning-management-system)
3. [IMS/WMS - Inventory & Warehouse Management](#3-imswms---inventory--warehouse-management)
4. [HRMS - Human Resource Management System](#4-hrms---human-resource-management-system)
5. [ERP System](#5-erp-system)
6. [ATS - Applicant Tracking System](#6-ats---applicant-tracking-system)
7. [PMS - Project & Task Management](#7-pms---project--task-management)
8. [AI Analytics Add-On](#8-ai-analytics-add-on)
9. [Appendices](#appendices)

---

## 1. Platform Overview and User Roles

### 1.1 Platform Architecture

META-INNOVA is a multi-tenant SaaS platform with a two-level hierarchy:

- **Level 1 (Platform Owner)**: META-INNOVA manages internal operations (Super Admin, System Admin/CEO, Meta Employees)
- **Level 2 (Client Institutions)**: Schools/colleges onboarded as tenants with their own Management, Officers, and Students

### 1.2 User Roles and Access Levels

| Role | Description | Dashboard Access |
|------|-------------|------------------|
| **Super Admin** | Technical oversight, system configuration, audit logs | `/super-admin/dashboard` |
| **System Admin (CEO)** | Business operations, full platform control | `/system-admin/dashboard` |
| **Meta Employees** | Internal staff with position-based access (AGM, MD, GM, Manager, Admin Staff) | `/system-admin/dashboard` |
| **Innovation Officer (Trainer)** | Field trainers assigned to one institution | `/tenant/{slug}/officer/dashboard` |
| **Institution Management** | Client institution administrators | `/tenant/{slug}/management/dashboard` |
| **Student** | Enrolled learners | `/tenant/{slug}/student/dashboard` |

### 1.3 Login and First Access

#### Step 1: Navigate to Login Page
- Access: `https://your-platform-url/login`
- Enter email and password provided by administrator

#### Step 2: First-Time Password Change
- All new users receive temporary passwords
- On first login, a mandatory password change dialog appears
- Requirements: 8+ characters, uppercase, lowercase, number, special character
- Cannot be dismissed until new password is set

---

## 2. LMS - Learning Management System

### 2.1 Institution Management Module

**Purpose**: Onboard and manage client institutions, contracts, and licenses.

**Who Can Access**: System Admin, CEO, Meta Employees with `institution_management` permission

#### 2.1.1 Onboard a New Institution

**Navigation**: Sidebar → Institution Management → Add Institution Tab

**Step-by-Step Process**:

**Step 1: Click "Add Institution" Tab**
- Located at the top of the Institution Management page

**Step 2: Fill Institution Details**

| Field | Description | Required |
|-------|-------------|----------|
| Institution Name | Official name (e.g., "Modern School Delhi") | Yes |
| Slug | URL-friendly identifier (e.g., "modern-school-delhi") | Yes |
| Type | University/College/School/Institute | Yes |
| Location | City/Address | Yes |
| Established Year | Year of establishment | No |
| Contact Email | Institution's official email | Yes |
| Contact Phone | Contact number | No |

**Step 3: Set Admin Credentials**

| Field | Description |
|-------|-------------|
| Admin Name | Name of institution administrator |
| Admin Email | Login email for management portal |
| Admin Password | Temporary password (8+ chars recommended) |

**Step 4: Configure License Settings**

| Field | Description |
|-------|-------------|
| License Type | Basic/Standard/Premium/Enterprise |
| Max Users | Maximum allowed users |
| Subscription Plan | Pricing tier |

**Step 5: Set GPS Configuration** (for attendance)

| Field | Description |
|-------|-------------|
| Latitude/Longitude | Institution GPS coordinates |
| Address | Physical address |
| Attendance Radius | Distance in meters for valid check-in |
| Working Hours | Normal working hours per day |
| Check-in/Check-out Time | Default times |

**Step 6: Configure Pricing Model**
- Per Student Cost
- LMS Cost
- Lab Setup Cost
- Monthly Recurring Cost
- Trainer Monthly Fee

**Step 7: Click "Add Institution"**
- Success toast confirms creation
- Institution appears in list with "Pending Setup" credential badge

#### 2.1.2 Set Up Institution Credentials (Two-Step Process)

**Step 1**: Institution is created via Add Institution tab

**Step 2**: Navigate to Credential Management
1. Sidebar → Credential Management → Institutions Tab
2. Find institution with orange "Pending Setup" badge
3. Click "Set Up Credentials"
4. Set/generate temporary password
5. Institution admin receives credentials
6. Badge changes to green "Configured"

#### 2.1.3 Add Classes to Institution

**Navigation**: Click institution name → Institution Detail Page → Classes Tab

**Process**:
1. Click "Add Class" button
2. Fill class details:
   - Class Name (e.g., "Class 6A")
   - Section (e.g., "A", "B")
   - Grade Level
   - Academic Year
3. Click "Create Class"
4. Repeat for all required classes

#### 2.1.4 Assign Innovation Officer to Institution

**Navigation**: Institution Detail → Officers Tab OR Officer Management → Officer Detail → Institutions Tab

**Process**:
1. Click "Assign Officer"
2. Select officer from dropdown (shows unassigned officers only)
3. Click "Assign"

> **Note**: Each officer can only be assigned to ONE institution (UNIQUE constraint)

---

### 2.2 Course Management Module

**Purpose**: Create, manage, and deliver STEM courses with level-based content hierarchy.

**Who Can Access**: 
- System Admin (full CRUD)
- Innovation Officer (view, teach, mark attendance)
- Management (view catalog and analytics)
- Student (enroll, learn, access assigned levels only)

#### 2.2.1 Course Hierarchy Structure

```
Course
├── Level 1 (assigned to Classes 4-6)
│   ├── Session 1.1
│   │   ├── Content 1.1.1 (PDF)
│   │   ├── Content 1.1.2 (Video)
│   │   └── Content 1.1.3 (PPT)
│   └── Session 1.2
│       └── Content 1.2.1
├── Level 2 (assigned to Classes 5-8)
│   └── Sessions...
└── Level 3 (assigned to Classes 7-10)
    └── Sessions...
```

#### 2.2.2 Create a New Course

**Navigation**: Sidebar → Course Management → "Create Course" Button

**Step-by-Step Process**:

**Step 1: Basic Information Tab**

| Field | Description |
|-------|-------------|
| Course Title | Name of the course |
| Description | Detailed course description |
| Thumbnail | Upload course image (stored in cloud storage) |

**Step 2: Click "Create Course"**
- Course is created in draft status
- Redirects to Course Detail page

#### 2.2.3 Add Levels to Course

**Navigation**: Course Detail → Levels Tab → "Add Level" Button

**Process**:
1. Click "Add Level"
2. Fill level details:
   - Level Title (e.g., "Beginner Robotics")
   - Description
   - Learning Objectives
   - Certificate Template (optional - for module completion)
3. Click "Create Level"

#### 2.2.4 Assign Level to Classes

**Navigation**: Level Card → "Manage Class Access" Button

**Process**:
1. Click "Manage Class Access"
2. Select institutions and classes that can access this level
3. Save assignments
4. Students in selected classes will see this level in their courses

#### 2.2.5 Add Sessions to Level

**Navigation**: Click on Level → "Add Session" Button

**Process**:
1. Click "Add Session"
2. Fill session details:
   - Session Title
   - Description
   - Learning Objectives
   - Duration (estimated)
3. Click "Create Session"

#### 2.2.6 Add Content to Session

**Navigation**: Session Card → "Add Content" Button

**Content Types Supported**:

| Type | Description | Source |
|------|-------------|--------|
| PDF | Document files | Upload to storage |
| Video | YouTube videos | YouTube URL |
| PPT | Presentations | Upload to storage |
| Quiz | Interactive assessment | Built-in quiz builder |

**Process**:
1. Click "Add Content"
2. Select content type
3. Fill content details:
   - Title
   - Description
   - File upload OR YouTube URL
   - Display order
4. Click "Save Content"

#### 2.2.7 Edit Course Thumbnail

**Navigation**: Course Detail → "Edit Course" Button

**Process**:
1. Click "Edit Course"
2. In Edit Dialog, scroll to Thumbnail section
3. Current thumbnail preview is shown
4. Click "Change Image" to select new file
5. Preview updates with new image
6. Click "Save Changes"
7. Image uploads to cloud storage automatically

---

### 2.3 Officer Management Module (Trainer)

**Purpose**: Manage Innovation Officers who deliver training at institutions.

**Who Can Access**: System Admin, CEO

#### 2.3.1 Add New Officer

**Navigation**: Sidebar → Officer Management → "Add Officer" Button

**Required Information**:

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | Yes | Officer's complete name |
| Email | Yes | Login email |
| Password | Yes | Initial password |
| Phone | No | Contact number |
| Employee ID | Yes | Unique identifier (e.g., EMP-IOF-001) |
| Join Date | No | Date of joining |
| Employment Type | Yes | Full-time/Part-time/Contract |
| Annual Salary | Yes | Yearly compensation |

**Payroll Configuration**:

| Field | Description |
|-------|-------------|
| Overtime Hourly Rate | Rate per overtime hour (₹/hr) |
| Overtime Multiplier | Multiplier for overtime (default: 1.5x) |

**Process**:
1. Click "Add Officer"
2. Fill all required fields
3. Configure payroll settings
4. Click "Add Officer"
5. Officer appears in list

#### 2.3.2 View Officer Details

**Navigation**: Officer Management → Click on officer row

**Detail Page Tabs**:
1. **Overview**: Personal info, contact, salary
2. **Institutions**: Assigned institution (one only)
3. **Documents**: Uploaded certificates, ID proofs
4. **Attendance**: GPS check-in/out records
5. **Payroll**: Salary breakdown, overtime calculations

#### 2.3.3 Assign Officer to Institution

**Navigation**: Officer Detail → Institutions Tab → "Assign Institution"

**Process**:
1. Click "Assign Institution"
2. Select institution from dropdown
3. Click "Assign"

> **Note**: If already assigned, must unassign first

#### 2.3.4 Upload Officer Documents

**Navigation**: Officer Detail → Documents Tab → "Upload Document"

**Document Types**:
- ID Proof (Aadhar, PAN, etc.)
- Educational Certificates
- Experience Letters
- Agreements/Contracts
- Other

---

### 2.4 Assessment Management Module

**Purpose**: Create and manage assessments for student evaluation.

**Who Can Access**: 
- System Admin (create generic assessments for multiple institutions)
- Innovation Officer (create institution-specific assessments)
- Student (take assessments)

#### 2.4.1 Create Assessment (System Admin)

**Navigation**: Sidebar → Assessment Management → "Create Assessment"

**Step-by-Step**:

**Step 1: Basic Info**
- Title
- Description
- Assessment Type (Quiz/Exam/Practice)
- Duration (minutes)
- Passing Score (%)

**Step 2: Add Questions**
- Question Types: MCQ, True/False, Short Answer
- Points per question
- Correct answer marking

**Step 3: Publishing**
- Select target institutions
- Select target classes
- Set availability dates
- Publish

#### 2.4.2 Student Assessment Flow

**Navigation (Student)**: Sidebar → Assessments

**Tabs**:
- **Available**: Assessments ready to take
- **Completed**: Finished assessments with scores
- **Upcoming**: Scheduled future assessments

**Taking Assessment**:
1. Click on assessment card
2. Review instructions
3. Click "Start Assessment"
4. Timer begins
5. Answer questions
6. Click "Submit"
7. View results (if immediate feedback enabled)

---

### 2.5 Assignment Management Module

**Purpose**: Create standalone assignments with various submission types.

**Who Can Access**: System Admin, Officer, Student

#### 2.5.1 Create Assignment

**Navigation**: Sidebar → Assignment Management → "Create Assignment"

**Assignment Types**:

| Type | Student Submits |
|------|-----------------|
| File Upload | Documents, images, PDFs |
| Text Submission | Written response |
| URL Submission | Link to work |
| Multi-Question | Answers to multiple questions |

**Creation Steps**:
1. Basic Info (title, description, type)
2. Submission Settings (deadline, late policy)
3. Grading Configuration (rubrics, max score)
4. Content/Questions
5. Publishing (select institutions/classes)
6. Review and Create

#### 2.5.2 Student Assignment Flow

**Navigation (Student)**: Sidebar → Assignments

**Tabs**:
- **Pending**: Not yet submitted
- **Submitted**: Awaiting grading
- **Graded**: Completed with feedback

---

### 2.6 Gamification Management Module

**Purpose**: Manage badges, points, and leaderboards for student engagement.

**Features**:
- Badge configuration
- Point systems
- Leaderboard management
- Achievement tracking

---

### 2.7 Credential Management Module

**Purpose**: Centralized password and authentication management for all users.

**Who Can Access**: System Admin, CEO

**Navigation**: Sidebar → Credential Management

#### 2.7.1 Tabs Overview

| Tab | Users Managed |
|-----|---------------|
| Meta Employees | CEO, MD, AGM, GM, Manager, Admin Staff |
| Officers | Innovation Officers |
| Institutions | Institution Admin accounts |
| Students | Student accounts |

#### 2.7.2 Set User Password

**Process**:
1. Navigate to appropriate tab
2. Find user by search/filter
3. Check credential status badge:
   - 🟢 **Configured**: Password set, user active
   - 🟠 **Pending Setup**: Needs password
   - 🟡 **Must Change**: Temporary password set
4. Click "Set Password"
5. Choose:
   - Auto-generate strong password
   - Manual entry (must meet requirements)
6. Click "Set Password"
7. Share credentials with user securely

#### 2.7.3 Send Reset Link

**Process**:
1. Find user
2. Click "Send Reset Link"
3. Email sent with time-limited reset token (1 hour)
4. User clicks link and sets new password

#### 2.7.4 Bulk Password Reset

**Process**:
1. Select multiple users using checkboxes
2. Click "Send Reset Links"
3. Confirm in dialog
4. Progress shown as emails are sent
5. Summary of successful/failed sends

---

### 2.8 Notification System (Email Integration)

**Purpose**: Automated notifications for platform events.

**Notification Types**:
- Password reset emails
- Leave approval notifications
- Assignment due reminders
- Assessment availability alerts
- Purchase request updates

---

### 2.9 Additional LMS Features

#### Newsletter Management
- Create and send newsletters
- Target specific institutions/classes
- Track open rates

#### Survey & Feedback
- Create surveys for feedback collection
- Analyze responses
- Export results

#### SDG Management
- Map courses to UN Sustainable Development Goals
- Track SDG contributions
- Generate SDG reports

#### System Configuration
- Platform-wide settings
- Feature toggles
- Default values

#### ID Configuration
- Employee ID formats
- Institution codes
- Student ID patterns

#### Project Management (Bidirectional)
- Create projects across dashboards
- Sync between Officer/Student/Management views
- Track milestones and deliverables

#### Webinar Management
- Schedule webinars
- Manage registrations
- Track attendance

#### Event Management
- Create events/competitions
- Manage participants
- Award certificates

---

## 3. IMS/WMS - Inventory & Warehouse Management

**Who Can Access**: Officer, Management, System Admin, CEO

### 3.1 Inventory Overview

**Purpose**: Track lab equipment, materials, and supplies at institutions.

#### 3.1.1 Officer - Lab Inventory

**Navigation**: Sidebar → Lab Inventory

**Features**:
- View institution's inventory
- Add items manually
- Create purchase requests
- Report issues

#### 3.1.2 Add Inventory Item (Officer)

**Process**:
1. Click "Add Item"
2. Fill details:
   - Item Name
   - Description
   - Category
   - Unit Price
   - Quantity
3. Click "Save"

### 3.2 Purchase Request Workflow

**Multi-Stage Approval Process**:

```
Officer Creates Request
        ↓
Institution Management Reviews
        ↓ (Approve)
CEO/System Admin Reviews
        ↓ (Approve)
Request Fulfilled
```

#### 3.2.1 Create Purchase Request (Officer)

**Navigation**: Lab Inventory → "Create Request" Button

**Process**:
1. Click "Create Request"
2. Add items:
   - Item Name
   - Description
   - Quantity
   - Estimated Unit Price
3. Add Justification
4. Set Priority (Normal/High/Urgent)
5. Submit Request

**Request Status Flow**:
- `pending` → Created, awaiting institution review
- `approved_institution` → Institution approved, awaiting CEO
- `approved` → Fully approved
- `rejected` → Declined at any stage

#### 3.2.2 Approve Request (Institution Management)

**Navigation**: Sidebar → Inventory & Purchase → Purchase Requests Tab

**Process**:
1. View pending requests
2. Review items and justification
3. Click "Approve" or "Reject"
4. Add comments (required for rejection)
5. Approved requests move to CEO queue

#### 3.2.3 Final Approval (CEO/System Admin)

**Navigation**: Sidebar → Inventory Management → Approvals Tab

**Process**:
1. View institution-approved requests
2. Review all details
3. Click "Approve" or "Reject"
4. Add comments
5. Approved requests marked for fulfillment

### 3.3 Issue Reporting

**Purpose**: Report damaged, missing, or malfunctioning equipment.

#### 3.3.1 Report Issue (Officer)

**Navigation**: Lab Inventory → "Report Issue" Button

**Process**:
1. Select Item Name
2. Choose Issue Type:
   - Damaged
   - Missing
   - Malfunctioning
   - Other
3. Describe Issue
4. Set Severity (Low/Medium/High/Critical)
5. Specify Quantity Affected
6. Submit

**Issue Status Flow**:
- `reported` → Issue submitted
- `acknowledged` → Admin aware
- `resolved` → Issue fixed

---

## 4. HRMS - Human Resource Management System

**Who Can Access**: Officer, System Admin, CEO, Meta Employees

### 4.1 Leave Management

**Purpose**: Apply for and approve leave with hierarchical workflow.

#### 4.1.1 Leave Approval Hierarchies

**Innovation Officers**:
```
Officer Applies
      ↓
Manager Approves
      ↓
AGM Approves (Final)
```

**Meta Staff**:
```
Staff Applies
      ↓
CEO Approves (Final)
```

> **Note**: CEO position is excluded from leave management.

#### 4.1.2 Apply for Leave (Officer)

**Navigation**: Sidebar → Leave Management → "Apply for Leave"

**Process**:
1. Click "Apply for Leave"
2. Fill leave details:
   - Leave Type (Casual/Sick/Earned)
   - Start Date
   - End Date
   - Reason
   - Assign Substitutes (for classes)
3. Submit Application
4. Application enters approval queue

#### 4.1.3 Apply for Leave (Meta Staff)

**Navigation**: Sidebar → Leave → "Apply"

**Process**:
1. Select Leave Type
2. Set Dates
3. Provide Reason
4. Submit (no substitute required)

#### 4.1.4 Approve Leave (Manager)

**Navigation**: Sidebar → Manager Approvals (or Leave Approvals with Manager filter)

**Process**:
1. View pending officer leave requests
2. Review details and dates
3. Check substitute assignments
4. Click "Approve" or "Reject"
5. Add comments
6. Approved requests move to AGM

#### 4.1.5 Approve Leave (AGM)

**Navigation**: Sidebar → AGM Approvals

**Process**:
1. View manager-approved requests
2. Final review
3. Approve or Reject
4. Leave balance automatically updated on approval

#### 4.1.6 Approve Leave (CEO)

**Navigation**: Sidebar → CEO Approvals

**Process**:
1. View meta staff leave requests
2. Review and approve/reject
3. Single-stage final approval

### 4.2 Attendance & GPS Check-in

**Purpose**: Track officer attendance with GPS verification.

#### 4.2.1 Officer Check-in/Check-out

**Navigation (Officer)**: Dashboard → Check-in/Check-out buttons

**Process**:
1. Ensure GPS is enabled on device
2. Click "Check In" when arriving
3. System captures:
   - Timestamp
   - GPS coordinates
   - Distance from institution
4. Click "Check Out" when leaving
5. System calculates hours worked

**GPS Validation**:
- Must be within configured radius (default: 1500m)
- Invalid locations flagged for review

#### 4.2.2 View Attendance Records (System Admin)

**Navigation**: Sidebar → Attendance & Payroll

**Features**:
- Select Institution/Officer/Month
- View attendance calendar
- Check GPS locations
- Flag discrepancies

### 4.3 Payroll Management

**Purpose**: Calculate and manage salaries based on attendance.

#### 4.3.1 Payroll Calculation

**Formula**:
```
Base Pay = (Annual Salary / 12 / Working Days) × Days Present
Overtime Pay = Overtime Hours × Overtime Hourly Rate × Overtime Multiplier
Total = Base Pay + Overtime Pay - Deductions
```

#### 4.3.2 View Payroll (System Admin/CEO)

**Navigation**: Sidebar → Attendance & Payroll

**View Components**:
- Monthly attendance summary
- Base salary calculation
- Overtime hours and pay
- Deductions
- Net payable
- Approval status

#### 4.3.3 Officer Salary Tracker

**Navigation (Officer)**: Dashboard → My Salary Tracker Card

**Shows**:
- Current month earnings (estimated)
- Hours worked
- Overtime hours
- Expected payout

### 4.4 Company & Institutional Calendars

**Purpose**: Manage holidays and important dates.

#### 4.4.1 Company Holidays (System Admin)

**Navigation**: Sidebar → Company Holidays

**Process**:
1. Add holiday with date and name
2. Select applicable regions/institutions
3. Holidays automatically excluded from attendance

#### 4.4.2 Institution Calendar

**Navigation (Officer/Management)**: Sidebar → Institution Calendar

**Features**:
- View scheduled events
- Academic calendar
- Exam schedules
- Holiday list

---

## 5. ERP System

**Who Can Access**: Student, Officer, Management, System Admin, CEO

### 5.1 CRM & Client Management

**Purpose**: Manage relationships with client institutions.

**Navigation**: Sidebar → CRM & Clients

#### 5.1.1 Communication Tracking

**Features**:
- Log calls, emails, meetings
- Set follow-up reminders
- Track interaction history

**Add Communication Log**:
1. Select Institution
2. Choose Type (Call/Email/Meeting/Other)
3. Enter Date/Time
4. Add Contact Person
5. Write Summary
6. Set Priority and Status
7. Define Next Actions
8. Save

#### 5.1.2 Renewals & Contracts

**Features**:
- View contract status
- Track expiry dates
- Initiate renewal workflow

**Create Contract**:
1. Select Institution
2. Set Start/End Dates
3. Enter Contract Value
4. Define Terms
5. Upload Documents
6. Save

#### 5.1.3 Billing & Invoices

**Features**:
- Create invoices
- Track payments
- Download PDF invoices

**Create Invoice**:
1. Select Institution
2. Add Line Items
3. Apply Taxes
4. Set Due Date
5. Generate Invoice
6. Send to Client

### 5.2 Reports Module

**Purpose**: Generate and view platform analytics reports.

**Report Types**:
- Institution Performance
- Officer Attendance Summary
- Course Completion Rates
- Assessment Analytics
- Financial Reports

### 5.3 Invoice Management

**Purpose**: Centralized invoice tracking and management.

**Features**:
- View all invoices
- Filter by status/date/institution
- Track payments
- Send reminders

### 5.4 Performance & Rating System

**Purpose**: Evaluate trainer performance and track achievements.

**Navigation**: Sidebar → Performance & Ratings

#### 5.4.1 Performance Appraisal

**Components**:
- Profile overview
- Lab domains handled
- Projects mentored
- Self-reflection input
- Feedback integration
- Official sign-offs

**Create Appraisal**:
1. Select Officer
2. Choose Period
3. Fill evaluation sections
4. Add ratings and comments
5. Submit for sign-off
6. Print as PDF

#### 5.4.2 HR Rating (Star Summary)

**Purpose**: Track quarterly star earnings from projects.

**Fields**:
- Quarter/Year
- Projects completed
- Competition levels
- Stars earned
- Verification status

### 5.5 RBAC (Position) Management

**Purpose**: Create and manage custom positions with feature access.

**Navigation**: Sidebar → Position Management

#### 5.5.1 Create Custom Position

**Process**:
1. Click "Create Position"
2. Enter Position Name (e.g., "Project Coordinator")
3. Enter Display Name
4. Select Visible Features (sidebar menus)
5. Set is_ceo flag if applicable
6. Save Position

**Available Features for Assignment**:
- institution_management
- course_management
- officer_management
- assessment_management
- assignment_management
- event_management
- inventory_management
- payroll_management
- leave_approvals
- project_management
- task_management
- credential_management
- reports_management
- crm_clients
- position_management
- And 15+ more...

#### 5.5.2 Add User to Position

**Process**:
1. Go to Position Detail
2. Click "Add User"
3. Fill user details:
   - Name, Email, Password
   - Leave Allowances (Casual/Sick/Earned days)
   - Hourly Rate
   - Overtime Multiplier
4. Create User
5. User appears with position's sidebar access

> **Note**: CEO position cannot have "Position Management" feature removed (lockout prevention).

### 5.6 Settings Customization

**Purpose**: User-specific settings and preferences.

**Navigation**: Sidebar → Settings

**Features**:
- Account Security (password change)
- Notification Preferences
- Display Settings
- Theme Selection

---

## 6. ATS - Applicant Tracking System

**Who Can Access**: System Admin, CEO, Meta Employees, Public (job listings)

### 6.1 Job Postings

**Purpose**: Create and manage job listings.

**Navigation**: Sidebar → Job Postings OR Careers → Jobs

**Create Job Posting**:
1. Click "Create Job"
2. Fill Details:
   - Title
   - Department
   - Location
   - Employment Type
   - Salary Range
   - Description
   - Requirements
3. Set Application Deadline
4. Publish

### 6.2 Candidate Applications

**Purpose**: Review and manage job applications.

**Features**:
- View all applications
- Filter by job/status
- Review resumes
- Rate candidates
- Move through pipeline

**Application Stages**:
```
New → Under Review → Shortlisted → Interview → Offer → Hired/Rejected
```

### 6.3 Interview Management

**Purpose**: Schedule and track interviews.

**Features**:
- Schedule interviews
- Assign interviewers
- Set video meeting links
- Collect feedback
- Record decisions

### 6.4 Offer Management

**Purpose**: Create and send job offers.

**Process**:
1. Select candidate
2. Create offer letter
3. Set terms (salary, start date, benefits)
4. Send for approval
5. Send to candidate
6. Track acceptance/rejection

---

## 7. PMS - Project & Task Management

**Who Can Access**: Officer, System Admin, CEO, Meta Employees

### 7.1 Project Management (Jira-style)

**Purpose**: Manage student projects and internal initiatives.

**Navigation**: Sidebar → Project Management (Admin) OR Projects (Officer)

#### 7.1.1 Create Project

**Process**:
1. Click "Create Project"
2. Fill details:
   - Project Name
   - Description
   - Project Type (Student/Internal)
   - Start/End Dates
   - Team Members
3. Create Project

#### 7.1.2 Manage Project

**Features**:
- Kanban board view
- Task tracking
- Milestone management
- File attachments
- Progress tracking

### 7.2 Task Allotment

**Purpose**: Assign and track tasks across team members.

**Navigation**: Sidebar → Task Management

#### 7.2.1 Create Task

**Process**:
1. Click "Create Task"
2. Fill details:
   - Task Title
   - Description
   - Assignee
   - Priority (Low/Medium/High/Critical)
   - Due Date
   - Related Project (optional)
3. Create Task

#### 7.2.2 Task Status Flow

```
To Do → In Progress → Review → Done
```

### 7.3 Task Tracking & Workflow

**Features**:
- My Tasks view (assigned to me)
- Team Tasks view
- Overdue alerts
- Time tracking
- Comments and updates

---

## 8. AI Analytics Add-On

**Who Can Access**: All roles (with appropriate permissions)

### 8.1 Predictive Performance & Reports

**Purpose**: AI-powered insights and predictions.

**Features**:
- Student performance predictions
- At-risk student identification
- Course completion forecasting
- Engagement analytics
- Trend analysis

### 8.2 Ask Metova (AI Assistant)

**Purpose**: Interactive AI assistant for platform queries.

**Navigation**: Sidebar → Ask Metova

**Capabilities**:
- Answer platform questions
- Provide data insights
- Generate reports
- Suggest actions
- Natural language queries

**Usage**:
1. Type question in chat interface
2. AI processes and responds
3. Follow-up questions supported
4. Export conversations

---

## Appendices

### Appendix A: Quick Reference - Navigation Paths

| Feature | Role | Navigation Path |
|---------|------|-----------------|
| Add Institution | System Admin | Institution Management → Add Institution Tab |
| Add Officer | System Admin | Officer Management → Add Officer |
| Create Course | System Admin | Course Management → Create Course |
| Set Credentials | System Admin/CEO | Credential Management → [Tab] → Set Password |
| Apply Leave | Officer | Leave Management → Apply for Leave |
| Approve Leave | Manager | Manager Approvals OR Leave Approvals |
| Purchase Request | Officer | Lab Inventory → Create Request |
| View Inventory | Management | Inventory & Purchase → Inventory Tab |
| Take Assessment | Student | Assessments → Available → Start |
| Submit Assignment | Student | Assignments → Pending → Submit |
| Create Position | CEO | Position Management → Create Position |

---

### Appendix B: Status Badge Reference

| Badge | Color | Meaning |
|-------|-------|---------|
| Active | Green | Currently operational |
| Pending Setup | Orange | Awaiting configuration |
| Configured | Green | Setup complete |
| Must Change | Yellow | Password change required |
| Expired | Red | License/contract expired |
| Expiring Soon | Orange | Less than 30 days remaining |
| Approved | Green | Request approved |
| Rejected | Red | Request denied |
| Pending | Yellow | Awaiting action |

---

### Appendix C: Password Requirements

All passwords must meet these requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

---

### Appendix D: GPS Configuration Guidelines

For accurate attendance tracking:
1. Obtain exact GPS coordinates of institution
2. Set appropriate radius (default: 1500m)
3. Consider:
   - Campus size
   - Building locations
   - Signal strength variations
4. Test with officers before deployment

---

### Appendix E: File Upload Limits

| File Type | Max Size | Formats |
|-----------|----------|---------|
| Course Thumbnail | 5 MB | JPG, PNG, WebP |
| Course Content PDF | 10 MB | PDF |
| Course Content PPT | 20 MB | PPTX, PPT |
| Assignment Submission | 10 MB | PDF, DOC, DOCX, ZIP |
| Documents | 5 MB | PDF, JPG, PNG |
| CSV Bulk Upload | 5 MB | CSV (max 1000 rows) |

---

### Appendix F: Support & Contact

For technical support or questions:
- Email: support@meta-innova.com
- Documentation: [Platform URL]/docs
- In-app: Ask Metova AI Assistant

---

*End of Platform Manual*

**Document Version**: 1.0  
**Generated**: January 2025  
**Platform**: META-INNOVA LMS & ERP Suite
