import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import GuestRoute from './routes/GuestRoute';
import PrivateRoute from './routes/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/hello" element={<HomePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
