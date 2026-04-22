/** @param {string | undefined} role */
export function resolveRoleHomePath(role) {
  if (role === 'responsable' || role === 'admin') {
    return '/responsable/dashboard';
  }
  if (role === 'collaborateur') {
    return '/collaboration';
  }
  return '/login';
}
