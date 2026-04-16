import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { resolveRoleHomePath } from '../utils/authPaths';

export default function GuestRoute() {
  const { token, user } = useSelector((s) => s.auth);

  if (token) {
    return <Navigate to={resolveRoleHomePath(user?.role)} replace />;
  }

  return <Outlet />;
}
