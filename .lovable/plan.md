

# Plan: Fix Credential Management Students Tab Infinite Loading

## Problem
When selecting an institution with 1000+ students, the Students tab shows an infinite loading spinner. The `fetchStudentsByInstitution` function fetches students in paginated batches (good), but then passes ALL `user_id`s into a single `.in('id', userIds)` call to fetch profiles. With hundreds of UUIDs, this creates an extremely long query string that can timeout or exceed PostgREST URL limits, causing the entire query to hang silently.

## Fix

### File: `src/services/credentialService.ts` (lines 241-252)

Chunk the `.in('id', userIds)` profiles query into batches of 200 IDs:

```typescript
if (userIds.length > 0) {
  const chunkSize = 200;
  for (let i = 0; i < userIds.length; i += chunkSize) {
    const chunk = userIds.slice(i, i + chunkSize);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, password_changed, must_change_password')
      .in('id', chunk);
    if (profiles) {
      profiles.forEach(p => profileMap.set(p.id, {
        password_changed: p.password_changed || false,
        must_change_password: p.must_change_password || false,
      }));
    }
  }
}
```

This is a single-file, ~15-line change that chunks the profile lookup to prevent URL length overflow and timeouts.

