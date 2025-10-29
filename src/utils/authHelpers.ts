export function canUploadStudents(userRole: string, userInstitutionId?: string, targetInstitutionId?: string): boolean {
  // System Admin can upload to any institution
  if (userRole === 'system_admin') {
    return true;
  }

  // Institution Admin can upload to their own institution
  if (userRole === 'institution_admin' && userInstitutionId && targetInstitutionId) {
    return userInstitutionId === targetInstitutionId;
  }

  return false;
}

export function canManageInstitution(userRole: string): boolean {
  return ['system_admin', 'institution_admin'].includes(userRole);
}
