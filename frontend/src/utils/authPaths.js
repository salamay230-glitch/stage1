/** @param {string | undefined} role */
export function resolveRoleHomePath(role) {
  if (role === 'admin') {
    return '/admin/dashboard';
  }
  if (role === 'collaborateur') {
    return '/employee/missions';
  }
  return '/login';
}
