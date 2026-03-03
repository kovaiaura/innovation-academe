

# Notification System Overhaul: Realtime + Toast Alerts + Fix Leave Notifications

## Current Issues

1. **Dual notification systems**: Some components (student dialogs, officer leave, mock leave data) still use the old `localStorage`-based `createNotification` from `useNotifications.ts`, while the proper system uses the database-backed `notification.service.ts` + `useDbNotifications.ts`. The localStorage notifications never appear in the bell dropdown.

2. **Realtime is already wired** -- the `notifications` table is in `supabase_realtime` publication, and `useDbNotifications` subscribes to postgres_changes. So realtime should work, but only for notifications that actually get inserted into the DB. The localStorage-based ones are invisible.

3. **No toast/popup alert** when a new notification arrives -- user must click the bell to see them.

## Plan

### 1. Migrate localStorage notification calls to DB-backed service

Replace all imports of `createNotification` / `createNotificationForSystemAdmin` from `@/hooks/useNotifications` with `notificationService.createNotification` from `@/services/notification.service`.

**Files to update:**
- `src/components/student/SubmitAssignmentDialog.tsx` -- change `createNotification(...)` to `notificationService.createNotification(...)`
- `src/components/student/TakeQuizDialog.tsx` -- same
- `src/components/student/TakeAssignmentDialog.tsx` -- same
- `src/data/mockLeaveData.ts` -- replace all `createNotification` / `createNotificationForSystemAdmin` calls with `notificationService.createNotification`
- `src/pages/officer/LeaveManagement.tsx` -- remove unused `useNotifications` import

### 2. Add toast popup for new notifications

Modify `useDbNotifications.ts` to show a `sonner` toast when a new notification INSERT arrives via realtime:

```typescript
import { toast } from 'sonner';

// Inside the INSERT handler:
toast(newNotification.title, {
  description: newNotification.message,
  action: newNotification.link ? {
    label: 'View',
    onClick: () => window.location.href = newNotification.link
  } : undefined,
  duration: 6000,
});
```

This gives the user an instant top-right popup bar when any notification arrives, without needing to refresh or click the bell.

### 3. Deprecate the old localStorage hook

After migration, the `useNotifications` hook and `createNotification`/`createNotificationForSystemAdmin` functions in `src/hooks/useNotifications.ts` become dead code. Clean them up or mark as deprecated.

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/hooks/useDbNotifications.ts` (add toast on new notification) |
| Modify | `src/components/student/SubmitAssignmentDialog.tsx` (use DB service) |
| Modify | `src/components/student/TakeQuizDialog.tsx` (use DB service) |
| Modify | `src/components/student/TakeAssignmentDialog.tsx` (use DB service) |
| Modify | `src/data/mockLeaveData.ts` (use DB service for all notifications) |
| Modify | `src/pages/officer/LeaveManagement.tsx` (remove old import) |
| Cleanup | `src/hooks/useNotifications.ts` (mark deprecated / remove) |

