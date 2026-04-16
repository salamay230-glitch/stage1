import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LanguageSwitcher from '../components/auth/LanguageSwitcher';
import OcpMarkLogo from '../components/branding/OcpMarkLogo';
import { useLocale } from '../context/LocaleContext';
import { logoutUser } from '../features/auth/authSlice';

const NAV_ITEMS = [
  { id: 'dashboard', labelKey: 'adminNavDashboard' },
  { id: 'users', labelKey: 'adminNavUsers' },
  { id: 'missions', labelKey: 'adminNavMissions' },
  { id: 'map', labelKey: 'adminNavMap' },
];

const inputLikeActionClass =
  'flex min-h-[52px] w-full max-w-xs items-center justify-center rounded-[10px] border border-[#4d6f99]/70 bg-[#12314c]/30 px-4 text-[17px] font-semibold tracking-[0.02em] text-[#f1f6fc] outline-none transition-colors duration-200 hover:border-[#6d8fb7] hover:bg-[#12314c]/45 focus-visible:ring-1 focus-visible:ring-emerald-400/35';

function StatTile({ label, value, isRTL }) {
  return (
    <div
      className={`flex flex-col gap-2 border border-[#4d6f99]/35 bg-transparent px-5 py-4 ${isRTL ? 'text-right' : 'text-left'}`}
    >
      <span className="text-[14px] font-medium leading-[20px] text-[#d7e2ef]">{label}</span>
      <span className="text-[28px] font-medium leading-[32px] tracking-[0.05em] text-[#f0f3f6] md:text-[32px] md:leading-[36px]">{value}</span>
    </div>
  );
}

export default function AdministrationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, isRTL } = useLocale();
  const user = useSelector((s) => s.auth.user);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [stats, setStats] = useState({
    total_missions: 0,
    ongoing_missions: 0,
    completed_missions: 0,
    delayed_missions: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(false);
    try {
      const { data } = await api.get('/admin/mission-stats');
      setStats({
        total_missions: data?.total_missions ?? 0,
        ongoing_missions: data?.ongoing_missions ?? 0,
        completed_missions: data?.completed_missions ?? 0,
        delayed_missions: data?.delayed_missions ?? 0,
      });
    } catch {
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeNav === 'dashboard') {
      void loadStats();
    }
  }, [activeNav, loadStats]);

  const shell = (
    <div className="relative min-h-screen overflow-hidden bg-[#031726]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,#0b3b34_0%,#052033_33%,#031726_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_52%,rgba(8,72,60,0.28)_0%,rgba(3,23,38,0)_58%)]" />

      <div className="relative flex min-h-screen flex-col px-4 pb-20 pt-4 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        <header
          className={`flex flex-wrap items-center gap-4 border-b border-[#4d6f99]/25 pb-4 ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}
        >
          <div className={`flex items-center gap-[10px] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <OcpMarkLogo />
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-[18px] font-semibold text-white">{t.brand}</p>
              <p className="mt-1 max-w-[380px] text-[14px] font-medium leading-[20px] text-[#d7e2ef]">{t.adminPageTitle}</p>
            </div>
          </div>
          <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p className="max-w-[220px] truncate text-[14px] font-medium leading-[20px] text-[#d7e2ef]">{user?.name}</p>
            <button
              type="button"
              onClick={() => {
                dispatch(logoutUser()).finally(() => navigate('/login', { replace: true }));
              }}
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 transition hover:border-emerald-400/45 hover:text-white"
            >
              {t.logout}
            </button>
          </div>
        </header>

        <div className={`mt-6 flex min-h-0 flex-1 flex-col gap-8 lg:flex-row lg:gap-10 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
          <nav
            className={`w-full shrink-0 lg:w-[220px] ${isRTL ? 'lg:border-l lg:border-[#4d6f99]/30 lg:pl-6' : 'lg:border-r lg:border-[#4d6f99]/30 lg:pr-6'}`}
            aria-label="Administration"
          >
            <ul className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {NAV_ITEMS.map((item) => {
                const active = activeNav === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveNav(item.id)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left text-[15px] font-medium leading-snug tracking-[0.02em] transition-colors ${
                        isRTL ? 'text-right' : 'text-left'
                      } ${
                        active
                          ? 'border-emerald-400/35 bg-[#12314c]/35 text-[#f0f3f6]'
                          : 'border-transparent text-[#d7e2ef] hover:border-[#4d6f99]/40 hover:bg-[#12314c]/20 hover:text-[#f0f3f6]'
                      }`}
                    >
                      {t[item.labelKey]}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <main className="min-w-0 flex-1 pb-8">
            {activeNav === 'dashboard' && (
              <div className="space-y-10">
                <div className={`border-b border-[#4d6f99]/25 pb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <h1 className="text-[36px] font-medium leading-[40px] tracking-[0.05em] text-[#f0f3f6] md:text-[42px] md:leading-[46px]">
                    {t.adminNavDashboard}
                  </h1>
                  <p className="mt-3 max-w-[480px] text-[14px] font-medium leading-[20px] text-[#d7e2ef]">{t.adminComingSoon}</p>
                </div>

                <section aria-label={t.adminNavDashboard}>
                  <div
                    className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <StatTile label={t.adminStatsTotal} value={statsLoading ? '—' : stats.total_missions} isRTL={isRTL} />
                    <StatTile label={t.adminStatsOngoing} value={statsLoading ? '—' : stats.ongoing_missions} isRTL={isRTL} />
                    <StatTile label={t.adminStatsCompleted} value={statsLoading ? '—' : stats.completed_missions} isRTL={isRTL} />
                    <StatTile label={t.adminStatsDelayed} value={statsLoading ? '—' : stats.delayed_missions} isRTL={isRTL} />
                  </div>
                  {statsError ? (
                    <p className={`mt-3 text-[14px] font-medium leading-[20px] text-amber-300/90 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t.errors?.unexpectedError ?? 'Unable to load statistics.'}
                    </p>
                  ) : null}
                </section>

                <section
                  className={`border-t border-dashed border-[#4d6f99]/30 pt-8 ${isRTL ? 'text-right' : 'text-left'}`}
                  aria-label={t.adminNavMap}
                >
                  <h2 className="text-[22px] font-medium leading-tight tracking-[0.05em] text-[#f0f3f6] md:text-[26px]">{t.adminNavMap}</h2>
                  <div className="mt-4 min-h-[200px] rounded-[10px] border border-dashed border-[#4d6f99]/45 bg-[#12314c]/15 px-4 py-8 text-[14px] font-medium leading-[22px] text-[#d7e2ef]">
                    {t.adminMapPlaceholder}
                  </div>
                </section>

                <section className={`flex flex-wrap gap-3 border-t border-[#4d6f99]/25 pt-8 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <button type="button" className={inputLikeActionClass}>
                    {t.adminAddMission}
                  </button>
                  <button type="button" className={inputLikeActionClass}>
                    {t.adminAssignMission}
                  </button>
                </section>
              </div>
            )}

            {activeNav === 'users' && (
              <PlaceholderSection title={t.adminNavUsers} body={t.adminSectionUsersHint} isRTL={isRTL} />
            )}
            {activeNav === 'missions' && (
              <PlaceholderSection title={t.adminNavMissions} body={t.adminSectionMissionsHint} isRTL={isRTL} />
            )}
            {activeNav === 'map' && (
              <PlaceholderSection title={t.adminNavMap} body={t.adminMapPlaceholder} isRTL={isRTL} tall />
            )}
          </main>
        </div>

        <LanguageSwitcher />
      </div>
    </div>
  );

  return shell;
}

function PlaceholderSection({ title, body, isRTL, tall = false }) {
  return (
    <div className={`space-y-4 border-b border-[#4d6f99]/20 pb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      <h1 className="text-[36px] font-medium leading-[40px] tracking-[0.05em] text-[#f0f3f6] md:text-[42px] md:leading-[46px]">{title}</h1>
      <div
        className={`rounded-[10px] border border-dashed border-[#4d6f99]/40 bg-[#12314c]/10 px-4 py-6 text-[14px] font-medium leading-[22px] text-[#d7e2ef] ${tall ? 'min-h-[320px]' : 'min-h-[160px]'}`}
      >
        {body}
      </div>
    </div>
  );
}
