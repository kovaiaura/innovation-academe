

# About IMS Feature

A new "About IMS" page accessible from the sidebar for all roles, with 3 tabs showing platform information, assessment weightage formulas, and gamification rules. Plus a settings section in System Config for the CEO to manage the About Us PDF and role visibility.

## What It Does

### 1. New "About IMS" Sidebar Menu
- Added for **all roles** (system_admin, management, officer, student, super_admin)
- Links to `/about-ims` route
- Uses an Info/BookOpen icon

### 2. Three Tabs

**Tab 1: About IMS**
- Displays a PDF document uploaded by the CEO
- Uses `react-pdf` (already installed) to render the PDF inline
- Falls back to a "No document uploaded yet" message if none exists

**Tab 2: Assessment Weightage**
- Static informational page showing the weightage formula:
  - FA1 (Formative Assessment 1): 20%
  - FA2 (Formative Assessment 2): 20%
  - Final Assessment: 40%
  - Internal Assessment: 20%
- Visual breakdown with a formula explanation: `Total = (FA1% x 0.20) + (FA2% x 0.20) + (Final% x 0.40) + (Internal% x 0.20)`
- Example calculation for clarity
- Info about absent students receiving 0 for that category

**Tab 3: Gamification Rules**
- Displays XP rules fetched from the `xp_rules` database table (activity, points, description)
- Shows badge thresholds (from the hardcoded BADGE_DEFINITIONS): Projects (1/5/10/15/20), Achievements (1/5/10/20), Assessments (5/10/15/20), Assignments (5/10/15/20)
- Shows the ranking formula: Assessments 50%, Assignments 20%, Projects 20%, XP 10%

### 3. CEO Settings (System Config)
- New settings section in the existing Settings page (or System Config for super_admin)
- **Upload PDF**: File upload to a storage bucket for the About IMS PDF
- **Role Visibility**: Checkboxes to select which roles can see the About IMS page (e.g., student, officer, management, system_admin)
- Settings stored in `system_configurations` table with keys like `about_ims_pdf_url` and `about_ims_visible_roles`

## Technical Details

### Database Changes
- No new tables needed -- uses existing `system_configurations` table for storing settings
- Two config entries:
  - `about_ims_pdf_url` (text) -- URL of the uploaded PDF in storage
  - `about_ims_visible_roles` (JSON array) -- roles that can see the page, e.g. `["student","officer","management","system_admin"]`

### Storage
- Use existing `site-assets` bucket (public) for the About IMS PDF upload

### New Files
1. **`src/pages/AboutIMS.tsx`** -- Main page with 3 tabs, shared across all roles
2. **`src/components/about-ims/AboutIMSTab.tsx`** -- PDF viewer tab using react-pdf
3. **`src/components/about-ims/AssessmentWeightageTab.tsx`** -- Static formula display with visual cards
4. **`src/components/about-ims/GamificationRulesTab.tsx`** -- XP rules table and badge thresholds
5. **`src/components/about-ims/AboutIMSSettings.tsx`** -- Settings component for CEO (PDF upload + role visibility checkboxes)

### Modified Files
1. **`src/components/layout/Sidebar.tsx`** -- Add "About IMS" menu item for all roles, conditionally shown based on `about_ims_visible_roles` config
2. **`src/App.tsx`** -- Add `/about-ims` route accessible to all roles
3. **`src/pages/super-admin/SystemConfig.tsx`** (or CEO Settings page) -- Add "About IMS" settings tab with PDF upload and role visibility controls

### Data Flow
- CEO uploads PDF via Settings -> stored in `site-assets` bucket -> URL saved in `system_configurations`
- CEO selects visible roles -> saved as JSON array in `system_configurations`
- Sidebar checks the `about_ims_visible_roles` config to conditionally show/hide the menu for each role
- About IMS page fetches PDF URL from `system_configurations` and renders it with `react-pdf`
- Gamification tab fetches live XP rules from the `xp_rules` table

