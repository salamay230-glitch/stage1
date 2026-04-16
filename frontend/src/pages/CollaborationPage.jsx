import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/authSlice';
import { useLocale } from '../context/LocaleContext';

export default function CollaborationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLocale();
  const user = useSelector((s) => s.auth.user);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#031726] px-6 text-white">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400/90">{t.collaborationBadge}</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{t.collaborationTitle}</h1>
        <p className="mt-4 text-base text-white/75">
          {user?.name} · {user?.email}
        </p>
      </div>
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
