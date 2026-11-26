export interface OfficerClassAccessGrant {
  class_id: string;
  is_active: boolean | null;
  valid_from: string;
  valid_until: string | null;
}

export function getOfficerAssignableClassIds(
  timetableClassIds: string[],
  grants: OfficerClassAccessGrant[],
  today: string,
): string[] {
  const accessibleClassIds = new Set(timetableClassIds.filter(Boolean));

  grants.forEach((grant) => {
    const isWithinValidity = grant.valid_from <= today && (!grant.valid_until || grant.valid_until >= today);
    if (grant.is_active && isWithinValidity && grant.class_id) {
      accessibleClassIds.add(grant.class_id);
    }
  });

  return Array.from(accessibleClassIds);
}