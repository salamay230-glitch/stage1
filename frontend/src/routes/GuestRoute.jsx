import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function GuestRoute() {
  const token = useSelector((s) => s.auth.token);

  if (token) {
    return <Navigate to="/hello" replace />;
  }

  return <Outlet />;
}
