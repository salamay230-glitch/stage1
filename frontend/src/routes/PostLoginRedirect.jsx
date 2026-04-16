import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { resolveRoleHomePath } from '../utils/authPaths';

export default function PostLoginRedirect() {
  const role = useSelector((s) => s.auth.user?.role);
  return <Navigate to={resolveRoleHomePath(role)} replace />;
}
