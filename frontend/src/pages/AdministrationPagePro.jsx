import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import api from '../api/axios';
import LanguageSwitcher from '../components/auth/LanguageSwitcher';
import OcpMarkLogo from '../components/branding/OcpMarkLogo';
import { useLocale } from '../context/LocaleContext';
import { logoutUser } from '../features/auth/authSlice';

const btn =
  'rounded-[10px] border border-[#4d6f99]/70 bg-[#12314c]/35 px-4 py-2 text-[16px] font-semibold text-[#f1f6fc] transition hover:border-[#6d8fb7] hover:bg-[#12314c]/50';
const input =
  'h-[48px] w-full rounded-[10px] border border-[#4d6f99]/70 bg-[#12314c]/30 px-4 text-[#e8eff7] placeholder:text-[#9fb4cb] outline-none focus:border-[#6d8fb7]';
const glass =
  'rounded-[14px] border border-[#4d6f99]/35 bg-[#0b2740]/55 p-4 backdrop-blur-xl';
const emptyEmployeeForm = { nom: '', prenom: '', email: '', password: '' };
const emptyMissionForm = { title: '', description: '', latitude: '', longitude: '', employee_id: '', status: 'pending' };

const statusLabel = (s) => (s === 'in_progress' ? 'In Progress' : s === 'completed' ? 'Completed' : 'Pending');
const formatDate = (v) => (v ? new Date(v).toLocaleString() : '—');
const marker = (s) =>
  L.divIcon({
    className: 'custom-mission-marker',
    html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:${s === 'completed' ? '#22c55e' : s === 'in_progress' ? '#60a5fa' : '#f59e0b'};border:2px solid #fff;box-shadow:0 0 0 4px rgba(8,20,35,.38)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 17H9M18 17V11C18 7.68629 15.3137 5 12 5C8.68629 5 6 7.68629 6 11V17L4 19V20H20V19L18 17Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[#e8edf4]">
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconMission() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#c5d6e8]" aria-hidden>
      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 21c-3-4-6-6.5-6-10a6 6 0 1 1 12 0c0 3.5-3 6-6 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#c5d6e8]" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#c5d6e8]" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdministrationPagePro() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLocale();
  const user = useSelector((s) => s.auth.user);
  const headerNavRef = useRef(null);
  const [section, setSection] = useState('missions');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [stats, setStats] = useState({ total_missions: 0, ongoing_missions: 0, completed_missions: 0, delayed_missions: 0 });
  const [employees, setEmployees] = useState([]);
  const [missions, setMissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeDeleteTarget, setEmployeeDeleteTarget] = useState(null);
  const [employeeEditingId, setEmployeeEditingId] = useState(null);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);
  const [missionPanelOpen, setMissionPanelOpen] = useState(false);
  const [missionEditingId, setMissionEditingId] = useState(null);
  const [missionForm, setMissionForm] = useState(emptyMissionForm);

  const activeMissions = useMemo(() => missions.filter((m) => ['pending', 'in_progress'].includes(m.status)), [missions]);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);
  const center = activeMissions.length ? [Number(activeMissions[0].latitude), Number(activeMissions[0].longitude)] : [31.7917, -7.0926];

  const pageSubtitle = section === 'missions' ? t.missionControl : t.manageEmployees;

  const loadData = useCallback(async () => {
    const [s, e, m, n] = await Promise.allSettled([
      api.get('/admin/mission-stats'),
      api.get('/admin/employees'),
      api.get('/admin/missions'),
      api.get('/admin/notifications'),
    ]);
    if (s.status === 'fulfilled') setStats(s.value.data);
    if (e.status === 'fulfilled') setEmployees(e.value.data?.employees ?? []);
    if (m.status === 'fulfilled') setMissions(m.value.data?.missions ?? []);
    if (n.status === 'fulfilled') setNotifications(n.value.data?.notifications ?? []);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!headerNavRef.current?.contains(event.target)) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const openMissionEditor = (mission) => {
    setMissionEditingId(mission?.id ?? null);
    setMissionForm(
      mission
        ? {
            title: mission.title ?? '',
            description: mission.description ?? '',
            latitude: String(mission.latitude ?? ''),
            longitude: String(mission.longitude ?? ''),
            employee_id: String(mission.employee_id ?? ''),
            status: mission.status ?? 'pending',
          }
        : emptyMissionForm,
    );
    setMissionPanelOpen(true);
  };

  const saveMission = async (e) => {
    e.preventDefault();
    const payload = {
      title: missionForm.title.trim(),
      description: missionForm.description.trim(),
      latitude: Number(missionForm.latitude),
      longitude: Number(missionForm.longitude),
      employee_id: Number(missionForm.employee_id),
      status: missionForm.status,
    };
    if (missionEditingId) await api.put(`/admin/missions/${missionEditingId}`, payload);
    else await api.post('/admin/missions', payload);
    setMissionPanelOpen(false);
    setMissionEditingId(null);
    setMissionForm(emptyMissionForm);
    setStatusMessage('Mission saved.');
    await loadData();
  };

  const deleteMission = async (id) => {
    await api.delete(`/admin/missions/${id}`);
    setStatusMessage('Mission deleted.');
    await loadData();
  };

  const saveEmployee = async (e) => {
    e.preventDefault();
    const payload = { nom: employeeForm.nom.trim(), prenom: employeeForm.prenom.trim(), email: employeeForm.email.trim() };
    if (!employeeEditingId || employeeForm.password.trim()) payload.password = employeeForm.password;
    if (employeeEditingId) await api.put(`/admin/employees/${employeeEditingId}`, payload);
    else await api.post('/admin/employees', payload);
    setEmployeeModalOpen(false);
    setEmployeeEditingId(null);
    setEmployeeForm(emptyEmployeeForm);
    setStatusMessage('Employee saved.');
    await loadData();
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeDeleteTarget) return;
    await api.delete(`/admin/employees/${employeeDeleteTarget.id}`);
    setEmployeeDeleteTarget(null);
    setStatusMessage('Employee deleted.');
    await loadData();
  };

  const logout = () => dispatch(logoutUser()).finally(() => navigate('/login', { replace: true }));

  const goMissions = () => {
    setSection('missions');
    setProfileOpen(false);
  };
  const goUsers = () => {
    setSection('users');
    setProfileOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#031726]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,#0b3b34_0%,#052033_33%,#031726_70%)]" />
      <div className="relative flex min-h-screen flex-col px-4 pb-20 pt-4 sm:px-8 lg:px-14">
        <header className="flex items-center justify-between border-b border-[#4d6f99]/20 pb-4">
          <div className="flex items-center gap-3">
            <OcpMarkLogo />
            <div className="text-left">
              <p className="text-[18px] font-semibold tracking-[0.04em] text-white">{t.brand}</p>
              <p className="mt-0.5 text-[15px] font-semibold tracking-[0.06em] text-[#d7e2ef]">{pageSubtitle}</p>
            </div>
          </div>

          <div ref={headerNavRef} className="relative flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setNotifOpen((p) => !p);
                  setProfileOpen(false);
                }}
                className="ocp-header-chip relative flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[10px] border border-[#2a4a58]/80 bg-[#0d1928] text-[#e8edf4] transition hover:border-[#3d6275] hover:bg-[#102436]"
              >
                <BellIcon />
                {unreadCount > 0 ? (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#4f95ff] ring-2 ring-[#0d1928]" />
                ) : null}
              </button>

              {notifOpen ? (
                <div
                  className={`ocp-floating-nav-enter ocp-floating-nav-panel absolute right-0 top-[calc(100%+8px)] z-30 w-[min(360px,calc(100vw-2rem))] rounded-[12px] border border-white/10 p-3 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.55)]`}
                >
                <p className="mb-2 text-left text-[15px] font-semibold tracking-[0.03em] text-[#f0f3f6]">Recent alerts</p>
                <div className="max-h-[320px] space-y-2 overflow-auto pr-0.5">
                  {notifications.length === 0 ? (
                    <p className="text-left text-[14px] text-[#d7e2ef]">No notifications.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-[10px] border border-white/[0.08] bg-[#12314c]/35 p-3 text-left text-[#d7e2ef]"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${n.is_read ? 'bg-[#8aa5c2]' : 'bg-[#4f95ff]'}`} />
                          <span className="text-[12px] text-[#9fb4cb]">{formatDate(n.created_at)}</span>
                        </div>
                        <p className="text-[14px] leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label="Menu"
                onClick={() => {
                  setProfileOpen((p) => !p);
                  setNotifOpen(false);
                }}
                className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[10px] border border-[#2a4a58]/80 bg-[#0d1928] text-[#e8edf4] transition hover:border-[#3d6275] hover:bg-[#102436]"
              >
                <HamburgerIcon />
              </button>

              {profileOpen ? (
                <div
                  role="menu"
                  className="ocp-floating-nav-enter ocp-floating-nav-panel absolute right-0 top-[calc(100%+8px)] z-40 min-w-[272px] rounded-[12px] border border-white/10 p-1 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.55)]"
                >
                  <div className="font-serif border-b border-white/10 px-3 pb-3 pt-2 text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8aa3b8]">{t.adminProfileTrigger}</p>
                    <p className="mt-1 truncate text-[16px] font-semibold tracking-[0.02em] text-white">{user?.name ?? '—'}</p>
                    {user?.email ? (
                      <p className="mt-0.5 truncate text-[12px] font-normal text-[#9fb4cb]">{user.email}</p>
                    ) : null}
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      role="menuitem"
                      className="ocp-nav-item-flat flex w-full items-center gap-3 rounded-[8px] px-3 py-3.5 text-left font-serif text-[16px] font-semibold tracking-[0.02em] text-[#eef4fb]"
                      onClick={goMissions}
                    >
                      <IconMission />
                      <span>{t.missionControl}</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="ocp-nav-item-flat flex w-full items-center gap-3 rounded-[8px] px-3 py-3.5 text-left font-serif text-[16px] font-semibold tracking-[0.02em] text-[#eef4fb]"
                      onClick={goUsers}
                    >
                      <IconUsers />
                      <span>{t.adminNavUsers}</span>
                    </button>
                    <div className="mx-2 my-1 h-px bg-white/10" />
                    <button
                      type="button"
                      role="menuitem"
                      className="ocp-nav-item-flat flex w-full items-center gap-3 rounded-[8px] px-3 py-3.5 text-left font-serif text-[16px] font-semibold tracking-[0.02em] text-[#f0e0e0]"
                      onClick={logout}
                    >
                      <IconLogout />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="mt-6 space-y-6 text-left">
          {section === 'missions' ? (
            <section className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile label={t.adminStatsTotal} value={stats.total_missions ?? 0} />
                <StatTile label={t.adminStatsOngoing} value={stats.ongoing_missions ?? 0} />
                <StatTile label={t.adminStatsCompleted} value={stats.completed_missions ?? 0} />
                <StatTile label={t.adminStatsDelayed} value={stats.delayed_missions ?? 0} />
              </div>
              <section className={`${glass} w-full border border-white/[0.08]`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-left text-[24px] font-semibold tracking-[0.04em] text-[#f0f3f6]">Carte Pro - Global GPS</h2>
                  <button type="button" className={btn} onClick={() => openMissionEditor(null)}>
                    Add Mission
                  </button>
                </div>
                <div className="h-[520px] w-full overflow-hidden rounded-[12px] border border-white/[0.1]">
                  <MapContainer center={center} zoom={6} className="h-full w-full">
                    <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <MarkerClusterGroup chunkedLoading>
                      {activeMissions.map((m) => (
                        <Marker key={m.id} position={[Number(m.latitude), Number(m.longitude)]} icon={marker(m.status)}>
                          <Popup>
                            <div className="min-w-[220px] text-left">
                              <p className="text-[16px] font-semibold">{m.title}</p>
                              <p className="text-[13px]">Assigned: {`${m.employee?.prenom ?? ''} ${m.employee?.nom ?? ''}`.trim() || '—'}</p>
                              <p className="text-[13px]">Status: {statusLabel(m.status)}</p>
                              <button
                                type="button"
                                onClick={() => openMissionEditor(m)}
                                className="mt-2 text-left text-[13px] font-semibold text-[#5b9cff] underline decoration-[#5b9cff]/40 underline-offset-2"
                              >
                                View Details
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MarkerClusterGroup>
                  </MapContainer>
                </div>
              </section>
              <section className={`${glass} border border-white/[0.08]`}>
                <h3 className="mb-3 text-left text-[22px] font-semibold tracking-[0.04em] text-[#f0f3f6]">Mission List</h3>
                <div className="space-y-2">
                  {missions.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-[10px] border border-white/[0.08] bg-[#12314c]/25 p-3 text-[#d7e2ef]"
                    >
                      <p className="text-left text-[17px] font-semibold text-[#f0f3f6]">{m.title}</p>
                      <p className="text-left text-[14px]">{m.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" className={btn} onClick={() => openMissionEditor(m)}>
                          Edit
                        </button>
                        <button type="button" className={btn} onClick={() => void deleteMission(m.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </section>
          ) : null}

          {section === 'users' ? (
            <section className={`${glass} border border-white/[0.08]`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-left text-[24px] font-semibold tracking-[0.04em] text-[#f0f3f6]">{t.manageEmployees}</h2>
                <button
                  type="button"
                  className={btn}
                  onClick={() => {
                    setEmployeeModalOpen(true);
                    setEmployeeEditingId(null);
                    setEmployeeForm(emptyEmployeeForm);
                  }}
                >
                  Add Employee
                </button>
              </div>
              <div className="space-y-2">
                {employees.map((e) => (
                  <div
                    key={e.id}
                    className="grid grid-cols-[1fr_1fr_1.4fr_auto] items-center gap-2 rounded-[10px] border border-white/[0.08] bg-[#12314c]/25 p-2 text-[#d7e2ef]"
                  >
                    <p className="text-left">{e.nom}</p>
                    <p className="text-left">{e.prenom}</p>
                    <p className="truncate text-left">{e.email}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={btn}
                        onClick={() => {
                          setEmployeeModalOpen(true);
                          setEmployeeEditingId(e.id);
                          setEmployeeForm({ nom: e.nom, prenom: e.prenom, email: e.email, password: '' });
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className={btn} onClick={() => setEmployeeDeleteTarget(e)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {statusMessage ? <p className="text-left text-[14px] text-emerald-300">{statusMessage}</p> : null}
        </main>

        <LanguageSwitcher />
      </div>

      {missionPanelOpen ? (
        <div className="fixed inset-0 z-50 bg-[#031726]/70">
          <div className="absolute right-0 top-0 h-full w-full max-w-[520px] border-l border-[#4d6f99]/35 bg-[#082038]/90 p-5 backdrop-blur-md">
            <h3 className="text-left text-[24px] font-semibold text-[#f0f3f6]">{missionEditingId ? 'Modifier Mission' : 'Add Mission'}</h3>
            <StatusTracker status={missionForm.status} />
            <form onSubmit={saveMission} className="mt-5 space-y-3">
              <input
                className={input}
                placeholder="Title"
                value={missionForm.title}
                onChange={(e) => setMissionForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
              <textarea
                className={`${input} min-h-[100px] py-3`}
                placeholder="Description"
                value={missionForm.description}
                onChange={(e) => setMissionForm((p) => ({ ...p, description: e.target.value }))}
                required
              />
              <input
                className={input}
                type="number"
                step="any"
                placeholder="Latitude"
                value={missionForm.latitude}
                onChange={(e) => setMissionForm((p) => ({ ...p, latitude: e.target.value }))}
                required
              />
              <input
                className={input}
                type="number"
                step="any"
                placeholder="Longitude"
                value={missionForm.longitude}
                onChange={(e) => setMissionForm((p) => ({ ...p, longitude: e.target.value }))}
                required
              />
              <select
                className={input}
                value={missionForm.employee_id}
                onChange={(e) => setMissionForm((p) => ({ ...p, employee_id: e.target.value }))}
                required
              >
                <option value="">Assign Employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{`${e.prenom} ${e.nom}`}</option>
                ))}
              </select>
              <select className={input} value={missionForm.status} onChange={(e) => setMissionForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className={`${btn} w-full`}>
                  {missionEditingId ? 'Update Mission' : 'Create Mission'}
                </button>
                <button type="button" className={`${btn} w-full`} onClick={() => setMissionPanelOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {employeeModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#031726]/80 px-4">
          <div className={`${glass} w-full max-w-[520px] border border-white/[0.1]`}>
            <h3 className="text-left text-[24px] font-semibold text-[#f0f3f6]">{employeeEditingId ? 'Edit Employee' : 'Add Employee'}</h3>
            <form onSubmit={saveEmployee} className="mt-4 space-y-3">
              <input className={input} placeholder="Name" value={employeeForm.nom} onChange={(e) => setEmployeeForm((p) => ({ ...p, nom: e.target.value }))} required />
              <input className={input} placeholder="Surname" value={employeeForm.prenom} onChange={(e) => setEmployeeForm((p) => ({ ...p, prenom: e.target.value }))} required />
              <input className={input} type="email" placeholder="Email" value={employeeForm.email} onChange={(e) => setEmployeeForm((p) => ({ ...p, email: e.target.value }))} required />
              <input
                className={input}
                type="password"
                placeholder={employeeEditingId ? 'Password (optional)' : 'Password'}
                value={employeeForm.password}
                onChange={(e) => setEmployeeForm((p) => ({ ...p, password: e.target.value }))}
                required={!employeeEditingId}
              />
              <div className="flex gap-2">
                <button type="button" className={`${btn} w-full`} onClick={() => setEmployeeModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${btn} w-full`}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {employeeDeleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#031726]/85 px-4">
          <div className={`${glass} w-full max-w-[480px] border border-white/[0.1]`}>
            <p className="text-left text-[24px] font-semibold text-[#f0f3f6]">Confirm deletion</p>
            <p className="mt-2 text-left text-[#d7e2ef]">Delete {`${employeeDeleteTarget.prenom} ${employeeDeleteTarget.nom}`.trim()}?</p>
            <div className="mt-5 flex gap-2">
              <button type="button" className={`${btn} w-full`} onClick={() => setEmployeeDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className={`${btn} w-full`} onClick={() => void confirmDeleteEmployee()}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusTracker({ status }) {
  const steps = ['pending', 'in_progress', 'completed'];
  const current = Math.max(0, steps.indexOf(status));
  return (
    <div className="mt-4 rounded-[10px] border border-[#4d6f99]/35 bg-[#12314c]/25 p-3">
      <p className="mb-2 text-left text-[13px] font-semibold text-[#d7e2ef]">Status Tracker</p>
      <div className="mb-2 h-2 rounded-full bg-[#102c47]">
        <div className="h-2 rounded-full bg-[#4f95ff] transition-all duration-300" style={{ width: `${((current + 1) / 3) * 100}%` }} />
      </div>
      <div className="flex justify-between text-left text-[12px] text-[#9fb4cb]">
        <span>Pending</span>
        <span>In Progress</span>
        <span>Completed</span>
      </div>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-[12px] border border-[#4d6f99]/35 bg-transparent px-5 py-4 text-left">
      <span className="text-[14px] font-medium text-[#d7e2ef]">{label}</span>
      <p className="text-[30px] font-semibold text-[#f0f3f6]">{value}</p>
    </div>
  );
}
