import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { resolveRoleHomePath } from '../utils/authPaths';

/**
 * @param {{ allow: string[], children: import('react').ReactNode }} props
 */
export default function RoleGuard({ allow, children }) {
  const user = useSelector((s) => s.auth.user);
  const role = user?.role;

  if (!role || !allow.includes(role)) {
    return <Navigate to={resolveRoleHomePath(role)} replace />;
  }

  return children;
}
