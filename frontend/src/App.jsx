import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdministrationPage from './pages/AdministrationPagePro';
import CollaborationPage from './pages/CollaborationPage';
import LoginPage from './pages/LoginPage';
import GuestRoute from './routes/GuestRoute';
import PostLoginRedirect from './routes/PostLoginRedirect';
import PrivateRoute from './routes/PrivateRoute';
import RoleGuard from './routes/RoleGuard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/hello" element={<PostLoginRedirect />} />
          <Route
            path="/administration"
            element={
              <RoleGuard allow={['admin']}>
                <AdministrationPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RoleGuard allow={['admin']}>
                <AdministrationPage />
              </RoleGuard>
            }
          />
          <Route
            path="/collaboration"
            element={
              <RoleGuard allow={['collaborateur']}>
                <CollaborationPage />
              </RoleGuard>
            }
          />
          <Route
            path="/employee/missions"
            element={
              <RoleGuard allow={['collaborateur']}>
                <CollaborationPage />
              </RoleGuard>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
