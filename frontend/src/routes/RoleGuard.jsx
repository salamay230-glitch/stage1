import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { resolveRoleHomePath } from '../utils/authPaths';

/**
 * @param {{ allow: string[], children: import('react').ReactNode }} props
 */
export default function RoleGuard({ allow, children }) {
  const user = useSelector((s) => s.auth.user);
  const role = user?.role === 'admin' ? 'responsable' : user?.role;
  const allowed = allow.map((r) => (r === 'admin' ? 'responsable' : r));

  if (!role || !allowed.includes(role)) {
    return <Navigate to={resolveRoleHomePath(role)} replace />;
  }

  return children;
}
