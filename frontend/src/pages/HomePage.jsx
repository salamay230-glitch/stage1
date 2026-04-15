import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/authSlice';
import { useLocale } from '../context/LocaleContext';

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#031726] px-6 text-white">
      <h1 className="text-5xl font-semibold leading-none">{t.hello}</h1>
      <button
        type="button"
        onClick={() => {
          dispatch(logoutUser()).finally(() => navigate('/login', { replace: true }));
        }}
        className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 transition hover:border-emerald-400/45 hover:text-white"
      >
        {t.logout}
      </button>
    </main>
  );
}
