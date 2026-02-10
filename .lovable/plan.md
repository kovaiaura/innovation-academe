

## Add Certificates Tab Back to Gamification Page

### What Happened
The old gamification page had a "Certificates" tab that displayed the `CertificateTemplateManager` component (for managing certificate templates). During the revamp, this tab was removed along with the other legacy tabs. The certificate components themselves (`CertificateTemplateManager`, `CertificateTemplateDialog`, `CertificateSelector`) are untouched and still work wherever else they are used (e.g., Assessment Management).

### Fix
Add a 4th tab "Certificates" back to the gamification page that renders the existing `CertificateTemplateManager` component.

### Technical Changes

**File: `src/pages/system-admin/GamificationManagement.tsx`**
- Import `CertificateTemplateManager` from `@/components/gamification/CertificateTemplateManager`
- Add `FileText` icon import from lucide-react
- Change `grid-cols-3` to `grid-cols-4` in TabsList
- Add a 4th TabsTrigger for "Certificates"
- Add a 4th TabsContent rendering `<CertificateTemplateManager />`

No other files need changes -- the certificate components are intact.
