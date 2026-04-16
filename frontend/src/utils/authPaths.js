/** @param {string | undefined} role */
export function resolveRoleHomePath(role) {
  if (role === 'admin') {
    return '/administration';
  }
  if (role === 'collaborateur') {
    return '/collaboration';
  }
  return '/login';
}
