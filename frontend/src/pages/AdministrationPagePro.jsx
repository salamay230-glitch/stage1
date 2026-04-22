import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import api from '../api/axios';
import LanguageSwitcher from '../components/auth/LanguageSwitcher';
import OcpMarkLogo from '../components/branding/OcpMarkLogo';
import MissionStatusBadge from '../components/missions/MissionStatusBadge';
import { useLocale } from '../context/LocaleContext';
import { logoutUser } from '../features/auth/authSlice';

const CARTO_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const CARTO_LABELS = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png';

const btn =
  'rounded-[10px] border border-[#4d6f99]/70 bg-[#12314c]/35 px-4 py-2 text-[16px] font-semibold text-[#f1f6fc] transition hover:border-[#6d8fb7] hover:bg-[#12314c]/50';
const input =
  'h-[48px] w-full rounded-[10px] border border-[#4d6f99]/70 bg-[#12314c]/30 px-4 text-[#e8eff7] placeholder:text-[#9fb4cb] outline-none focus:border-[#6d8fb7]';
const glass =
  'rounded-[14px] border border-[#4d6f99]/35 bg-[#0b2740]/55 p-4 backdrop-blur-xl';

const emptyEmployeeForm = { nom: '', prenom: '', email: '', password: '' };
const emptyMissionForm = {
  title: '',
  description: '',
  latitude: '',
  longitude: '',
  employee_id: '',
};

const formatDate = (v) => (v ? new Date(v).toLocaleString() : '—');
const formatDateOnly = (v) => (v ? new Date(v).toLocaleDateString() : '—');

const markerIcon = (s) =>
  L.divIcon({
    className: 'custom-mission-marker',
    html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:${
      s === 'completed' ? '#10b981' : s === 'in_progress' ? '#0ea5e9' : '#d4a574'
    };border:2px solid rgba(241,246,252,.85);box-shadow:0 0 0 3px rgba(8,20,35,.45)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const draftLocationIcon = L.divIcon({
  className: 'custom-draft-marker',
  html: '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#ef4444;border:2px solid #fee2e2;box-shadow:0 0 0 4px rgba(127,29,29,.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
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
  const missionMapSectionRef = useRef(null);
  const [section, setSection] = useState('missions');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [stats, setStats] = useState({
    total_missions: 0,
    ongoing_missions: 0,
    completed_missions: 0,
    not_started_missions: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [missions, setMissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [missionDetail, setMissionDetail] = useState(null);
  const [missionDeleteTarget, setMissionDeleteTarget] = useState(null);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeDeleteTarget, setEmployeeDeleteTarget] = useState(null);
  const [employeeEditingId, setEmployeeEditingId] = useState(null);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);
  const [missionPanelOpen, setMissionPanelOpen] = useState(false);
  const [missionEditingId, setMissionEditingId] = useState(null);
  const [missionForm, setMissionForm] = useState(emptyMissionForm);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState(null);

  const missionsWithCoords = useMemo(
    () =>
      missions.filter(
        (m) =>
          m.latitude != null &&
          m.longitude != null &&
          !Number.isNaN(Number(m.latitude)) &&
          !Number.isNaN(Number(m.longitude)),
      ),
    [missions],
  );

  const center = useMemo(
    () =>
      missionsWithCoords.length
        ? [Number(missionsWithCoords[0].latitude), Number(missionsWithCoords[0].longitude)]
        : [31.7917, -7.0926],
    [missionsWithCoords],
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const pageSubtitle = section === 'missions' ? t.missionControl : t.manageEmployees;

  const pushToast = useCallback((msg) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, msg }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const loadData = useCallback(async () => {
    const [s, e, m, n] = await Promise.allSettled([
      api.get('/responsable/mission-stats'),
      api.get('/responsable/employees'),
      api.get('/responsable/missions'),
      api.get('/responsable/notifications'),
    ]);
    const missionsOrEmployeesFailed = m.status === 'rejected' || e.status === 'rejected';
    if (missionsOrEmployeesFailed) {
      console.error('Dashboard load failed', { s, e, m, n });
      pushToast(t.dataLoadFailed);
    }
    if (s.status === 'fulfilled') {
      const d = s.value.data ?? {};
      setStats({
        total_missions: Number(d.total_missions) || 0,
        ongoing_missions: Number(d.ongoing_missions) || 0,
        completed_missions: Number(d.completed_missions) || 0,
        not_started_missions: Number(d.not_started_missions ?? d.delayed_missions) || 0,
      });
    }
    if (e.status === 'fulfilled') setEmployees(e.value.data?.employees ?? []);
    if (m.status === 'fulfilled') setMissions(m.value.data?.missions ?? []);
    if (n.status === 'fulfilled') setNotifications(n.value.data?.notifications ?? []);
  }, [pushToast, t.dataLoadFailed]);

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

  const openNotifications = async () => {
    const nextOpen = !notifOpen;
    setNotifOpen(nextOpen);
    setProfileOpen(false);
    if (nextOpen && notifications.some((n) => !n.is_read)) {
      const snapshot = notifications;
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      try {
        await api.put('/responsable/notifications/read-all');
      } catch {
        setNotifications(snapshot);
      }
    }
  };

  const openMissionDetailPanel = (mission) => {
    if (!mission) return;
    setMissionDetail(mission);
  };

  const openMissionEditor = (mission) => {
    setMissionDetail(null);
    const initialLat = mission?.latitude != null ? String(mission.latitude) : '';
    const initialLng = mission?.longitude != null ? String(mission.longitude) : '';
    setMissionEditingId(mission?.id ?? null);
    setMissionForm(
      mission
        ? {
            title: mission.title ?? '',
            description: mission.description ?? '',
            latitude: initialLat,
            longitude: initialLng,
            employee_id: String(mission.employee_id ?? ''),
          }
        : emptyMissionForm,
    );
    setPickerPosition(initialLat && initialLng ? [Number(initialLat), Number(initialLng)] : null);
    setLocationPickerOpen(false);
    setMissionPanelOpen(true);
  };

  const openLocationPicker = () => {
    const lat = missionForm.latitude ? Number(missionForm.latitude) : null;
    const lng = missionForm.longitude ? Number(missionForm.longitude) : null;
    setPickerPosition(lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng) ? [lat, lng] : center);
    setLocationPickerOpen(true);
  };

  const saveMission = async (e) => {
    e.preventDefault();
    if (!missionForm.employee_id) {
      pushToast(t.employeeRequiredForMission);
      return;
    }
    const payload = {
      title: missionForm.title.trim(),
      description: missionForm.description.trim(),
      latitude: Number(missionForm.latitude),
      longitude: Number(missionForm.longitude),
      employee_id: Number(missionForm.employee_id),
    };
    const response = missionEditingId
      ? await api.put(`/responsable/missions/${missionEditingId}`, payload)
      : await api.post('/responsable/missions', payload);
    const savedMission = response.data?.mission;
    if (savedMission) {
      setMissions((prev) => {
        if (missionEditingId) return prev.map((m) => (m.id === missionEditingId ? savedMission : m));
        return [savedMission, ...prev];
      });
    }
    setMissionPanelOpen(false);
    setMissionEditingId(null);
    setMissionForm(emptyMissionForm);
    setLocationPickerOpen(false);
    setPickerPosition(null);
    pushToast(t.missionSaved);
    void loadData();
  };

  const confirmDeleteMission = async () => {
    if (!missionDeleteTarget) return;
    try {
      await api.delete(`/responsable/missions/${missionDeleteTarget.id}`);
      setMissionDeleteTarget(null);
      pushToast(t.missionDeleted);
      await loadData();
    } catch {
      pushToast(t.errors.unexpectedError);
    }
  };

  const saveEmployee = async (e) => {
    e.preventDefault();
    const payload = { nom: employeeForm.nom.trim(), prenom: employeeForm.prenom.trim(), email: employeeForm.email.trim() };
    if (!employeeEditingId || employeeForm.password.trim()) payload.password = employeeForm.password;
    if (employeeEditingId) await api.put(`/responsable/employees/${employeeEditingId}`, payload);
    else await api.post('/responsable/employees', payload);
    setEmployeeModalOpen(false);
    setEmployeeEditingId(null);
    setEmployeeForm(emptyEmployeeForm);
    pushToast(t.employeeSavedToast);
    await loadData();
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeDeleteTarget) return;
    await api.delete(`/responsable/employees/${employeeDeleteTarget.id}`);
    setEmployeeDeleteTarget(null);
    pushToast(t.employeeDeletedToast);
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
      <div className="relative flex min-h-screen flex-col px-4 pb-20 pt-4 font-ocp not-italic sm:px-8 lg:px-14">
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
                aria-expanded={notifOpen}
                onClick={() => void openNotifications()}
                className="relative flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[10px] border border-[#2a4a58]/80 bg-[#0d1928] text-[#e8edf4] transition hover:border-[#3d6275] hover:bg-[#102436]"
              >
                <BellIcon />
                <span
                  aria-hidden
                  className={`pointer-events-none absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#4f95ff] ring-2 ring-[#0d1928] transition-all duration-500 ease-out ${
                    unreadCount > 0 ? 'ocp-notif-dot-enter scale-100 opacity-100' : 'scale-75 opacity-0'
                  }`}
                />
              </button>

              {notifOpen ? (
                <div
                  className={`ocp-floating-nav-enter ocp-floating-nav-panel ocp-glass-heavy absolute right-0 top-[calc(100%+8px)] z-30 w-[min(360px,calc(100vw-2rem))] rounded-[14px] border border-white/[0.1] p-3 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)]`}
                >
                  <p className="mb-2 text-left text-[15px] font-semibold tracking-[0.03em] text-[#f0f3f6]">{t.recentAlerts}</p>
                  <div className="max-h-[320px] space-y-2 overflow-auto pr-0.5">
                    {notifications.length === 0 ? (
                      <p className="text-left text-[14px] text-[#d7e2ef]">{t.noNotifications}</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="rounded-[10px] border border-white/[0.08] bg-[#12314c]/35 p-3 text-left text-[#d7e2ef] backdrop-blur-sm transition hover:bg-[#12314c]/55"
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
                  className="ocp-floating-nav-enter ocp-floating-nav-panel ocp-glass-heavy absolute right-0 top-[calc(100%+8px)] z-40 min-w-[272px] rounded-[14px] border border-white/[0.1] p-1 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)]"
                >
                  <div className="border-b border-white/10 px-3 pb-3 pt-2 text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8aa3b8]">{t.responsableProfileTrigger}</p>
                    <p className="mt-1 truncate text-[16px] font-semibold tracking-[0.02em] text-white">{user?.name ?? '—'}</p>
                    {user?.email ? <p className="mt-0.5 truncate text-[12px] text-[#9fb4cb]">{user.email}</p> : null}
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      role="menuitem"
                      className="ocp-nav-item-flat flex w-full items-center gap-3 rounded-[8px] px-3 py-3.5 text-left text-[16px] font-semibold tracking-[0.02em] text-[#eef4fb]"
                      onClick={goMissions}
                    >
                      <IconMission />
                      <span>{t.missionControl}</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="ocp-nav-item-flat flex w-full items-center gap-3 rounded-[8px] px-3 py-3.5 text-left text-[16px] font-semibold tracking-[0.02em] text-[#eef4fb]"
                      onClick={goUsers}
                    >
                      <IconUsers />
                      <span>{t.responsableNavUsers}</span>
                    </button>
                    <div className="mx-2 my-1 h-px bg-white/10" />
                    <button
                      type="button"
                      role="menuitem"
                      className="ocp-nav-item-flat flex w-full items-center gap-3 rounded-[8px] px-3 py-3.5 text-left text-[16px] font-semibold tracking-[0.02em] text-[#f0e0e0]"
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
                <StatTile variant="total" label={t.responsableStatsTotal} value={stats.total_missions ?? 0} />
                <StatTile variant="notStarted" label={t.responsableStatsNotStarted} value={stats.not_started_missions ?? 0} />
                <StatTile variant="ongoing" label={t.responsableStatsOngoing} value={stats.ongoing_missions ?? 0} />
                <StatTile variant="completed" label={t.responsableStatsCompleted} value={stats.completed_missions ?? 0} />
              </div>
              <section ref={missionMapSectionRef} className={`${glass} w-full border border-white/[0.08]`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-left text-[24px] font-semibold tracking-[0.04em] text-[#f0f3f6]">{t.missionMapTitle}</h2>
                  <button type="button" className={btn} onClick={() => openMissionEditor(null)}>
                    {t.addMission}
                  </button>
                </div>
                <div className="h-[500px] w-full overflow-hidden rounded-[12px] border border-white/[0.1]">
                  <MapContainer
                    key={`map-${missionsWithCoords.length}-${missionsWithCoords[0]?.id ?? 'none'}`}
                    center={center}
                    zoom={6}
                    className="h-full w-full"
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer attribution="&copy; OpenStreetMap & CARTO" url={CARTO_DARK} />
                    <TileLayer attribution="" url={CARTO_LABELS} opacity={0.22} />
                    <MarkerClusterGroup chunkedLoading>
                      {missionsWithCoords.map((m) => (
                        <Marker key={m.id} position={[Number(m.latitude), Number(m.longitude)]} icon={markerIcon(m.status)}>
                          <Popup>
                            <MissionMapPopupBody mission={m} t={t} onViewFullDetails={() => openMissionDetailPanel(m)} />
                          </Popup>
                        </Marker>
                      ))}
                    </MarkerClusterGroup>
                  </MapContainer>
                </div>
              </section>
              <section className={`${glass} border border-white/[0.08]`}>
                <h3 className="mb-4 text-left text-[22px] font-semibold tracking-[0.04em] text-[#f0f3f6]">{t.missionListTitle}</h3>
                <div className="overflow-x-auto rounded-[12px] border border-white/[0.06] bg-[#061f33]/40 backdrop-blur-md">
                  <div className="min-w-[720px] divide-y divide-white/[0.08]">
                    <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,0.95fr)_auto] gap-3 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">
                      <span>{t.title}</span>
                      <span>{t.missionAssignedTo}</span>
                      <span>{t.missionStatus}</span>
                      <span className="text-right">{t.missionActions}</span>
                    </div>
                    {missions.length === 0 ? (
                      <p className="px-4 py-8 text-left text-[14px] text-[#9fb4cb]">{t.missionListEmpty}</p>
                    ) : (
                      missions.map((m) => (
                        <div
                          key={m.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openMissionDetailPanel(m)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openMissionDetailPanel(m);
                            }
                          }}
                          className="grid cursor-pointer grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,0.95fr)_auto] items-center gap-3 px-4 py-3.5 text-left text-[#d7e2ef] outline-none transition hover:bg-white/[0.055] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_22px_-10px_rgba(0,0,0,0.35)] focus-visible:ring-2 focus-visible:ring-[#4f95ff]/40"
                        >
                          <div className="min-w-0 pointer-events-none">
                            <p className="truncate text-[15px] font-semibold tracking-[0.02em] text-[#f0f3f6]">{m.title}</p>
                            <p className="mt-0.5 line-clamp-1 text-[12px] leading-snug text-[#8aa3b8]">{m.description}</p>
                          </div>
                          <p className="truncate text-[14px] tracking-[0.01em] pointer-events-none">
                            {`${m.employee?.prenom ?? ''} ${m.employee?.nom ?? ''}`.trim() || '—'}
                          </p>
                          <div className="min-w-0 pointer-events-none">
                            <MissionStatusBadge status={m.status} t={t} />
                          </div>
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className={btn} onClick={() => openMissionEditor(m)}>
                              {t.missionEdit}
                            </button>
                            <button type="button" className={btn} onClick={() => setMissionDeleteTarget(m)}>
                              {t.missionDelete}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                  {t.addEmployee}
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
                        {t.editEmployee}
                      </button>
                      <button type="button" className={btn} onClick={() => setEmployeeDeleteTarget(e)}>
                        {t.deleteEmployee}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

        </main>

        <LanguageSwitcher />

        <div
          className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(360px,calc(100vw-2rem))] flex-col items-end gap-2 font-ocp not-italic"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="ocp-toast pointer-events-auto max-w-full rounded-[12px] border border-white/[0.12] bg-[rgba(8,32,56,0.9)] px-4 py-3 text-left shadow-[0_18px_44px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            >
              <p className="text-[14px] font-semibold leading-snug tracking-[0.03em] text-[#f0f6ff]">{toast.msg}</p>
            </div>
          ))}
        </div>
      </div>

      {missionDetail ? (
        <div
          className="ocp-mission-detail-backdrop fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-[#020a12]/80 px-4 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-detail-title"
          onClick={() => setMissionDetail(null)}
        >
          <div
            className="ocp-mission-detail-panel ocp-glass-heavy ocp-glass-modal font-ocp not-italic relative mt-2 w-full max-w-[600px] rounded-[18px] border border-white/[0.1] p-7 shadow-[0_32px_72px_-20px_rgba(0,0,0,0.65)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div className="min-w-0 flex-1 text-left">
                <p id="mission-detail-title" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8aa3b8]">
                  {t.missionDetailHeading}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-left text-[24px] font-semibold leading-tight tracking-[0.02em] text-white">{missionDetail.title}</h2>
                  <MissionStatusBadge status={missionDetail.status} t={t} />
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-[10px] border border-white/12 bg-white/[0.05] px-3.5 py-2 text-left text-[13px] font-semibold text-[#e8eff7] transition hover:bg-white/[0.1]"
                onClick={() => setMissionDetail(null)}
              >
                {t.missionCloseDetail}
              </button>
            </div>

            <section className="mt-5 text-left">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{t.missionDetailDescriptionLabel}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#d7e2ef]">{missionDetail.description?.trim() || '—'}</p>
            </section>

            <dl className="mt-6 space-y-4 border-t border-white/[0.06] pt-6 text-left text-[14px]">
              <div className="flex flex-col gap-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{t.missionDetailAssigneeLabel}</dt>
                <dd className="text-[16px] font-medium text-[#f0f3f6]">
                  {`${missionDetail.employee?.prenom ?? ''} ${missionDetail.employee?.nom ?? ''}`.trim() || '—'}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{t.missionDeadline}</dt>
                <dd className="text-[16px] font-medium text-[#f0f3f6]">{formatDateOnly(missionDetail.end_date)}</dd>
              </div>
            </dl>

            <section className="mt-6 text-left">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{t.missionDetailLocationPreview}</h3>
              <div className="mt-2 space-y-3">
                <MissionDetailStaticMap lat={missionDetail.latitude} lng={missionDetail.longitude} status={missionDetail.status} />
                <p className="text-[13px] text-[#9fb4cb]">
                  {missionDetail.latitude != null && missionDetail.longitude != null
                    ? `${Number(missionDetail.latitude).toFixed(5)}, ${Number(missionDetail.longitude).toFixed(5)}`
                    : '—'}
                </p>
                <button
                  type="button"
                  className={`${btn} w-full max-w-xs border-[#4f95ff]/40 text-[#cfe8ff]`}
                  onClick={() => {
                    setMissionDetail(null);
                    window.requestAnimationFrame(() => {
                      missionMapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                  }}
                >
                  {t.missionViewOnMainMap}
                </button>
              </div>
            </section>

            <div className="mt-8 flex flex-wrap gap-2 border-t border-white/[0.06] pt-6">
              <button type="button" className={btn} onClick={() => openMissionEditor(missionDetail)}>
                {t.missionEditFromDetail}
              </button>
              <button type="button" className={btn} onClick={() => setMissionDetail(null)}>
                {t.missionCloseDetail}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {missionDeleteTarget ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#031726]/78 px-4 backdrop-blur-md">
          <div className={`${glass} ocp-glass-heavy w-full max-w-[440px] border border-white/[0.12] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)]`}>
            <p className="text-left text-[18px] font-semibold leading-snug text-[#f0f3f6]">{missionDeleteTarget.title}</p>
            <p className="mt-3 text-left text-[15px] leading-relaxed text-[#d7e2ef]">{t.missionDeleteConfirmBody}</p>
            <div className="mt-6 flex gap-2">
              <button type="button" className={`${btn} w-full`} onClick={() => setMissionDeleteTarget(null)}>
                {t.cancel}
              </button>
              <button
                type="button"
                className={`${btn} w-full border-rose-900/50 bg-rose-950/35 text-rose-50 hover:border-rose-700/60 hover:bg-rose-950/50`}
                onClick={() => void confirmDeleteMission()}
              >
                {t.missionDeleteConfirmAction}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {missionPanelOpen ? (
        <div className="fixed inset-0 z-50 bg-[#031726]/65 backdrop-blur-sm">
          <div className="ocp-glass-modal absolute right-0 top-0 h-full w-full max-w-[520px] border-l border-white/[0.1] p-5 shadow-[-12px_0_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-left text-[24px] font-semibold text-[#f0f3f6]">{missionEditingId ? t.editMission : t.addMission}</h3>
            <form onSubmit={saveMission} className="mt-5 space-y-3">
              <input
                className={input}
                placeholder={t.title}
                value={missionForm.title}
                onChange={(e) => setMissionForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
              <textarea
                className={`${input} min-h-[100px] py-3`}
                placeholder={t.description}
                value={missionForm.description}
                onChange={(e) => setMissionForm((p) => ({ ...p, description: e.target.value }))}
                required
              />
              <div className="relative">
                <p className="mb-1.5 text-left text-[12px] font-medium uppercase tracking-[0.12em] text-[#8aa3b8]">{t.responsableAssignMission}</p>
                <select
                  className={input}
                  value={missionForm.employee_id}
                  onChange={(e) => setMissionForm((p) => ({ ...p, employee_id: e.target.value }))}
                  required
                >
                  <option value="">{t.assignEmployeePlaceholder}</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.prenom} {emp.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-1.5 text-left text-[12px] font-medium uppercase tracking-[0.12em] text-[#8aa3b8]">
                  Cliquez sur la carte pour choisir l'emplacement
                </p>
                <button
                  type="button"
                  className={`${btn} w-full text-left`}
                  onClick={openLocationPicker}
                >
                  Ajouter place
                </button>
              </div>
              <input
                className={input}
                placeholder="Location (Lat, Lng)"
                value={missionForm.latitude && missionForm.longitude ? `${missionForm.latitude}, ${missionForm.longitude}` : ''}
                readOnly
                required
                onClick={openLocationPicker}
              />
              <div className="flex gap-2">
                <button type="submit" className={`${btn} w-full`}>
                  {missionEditingId ? t.updateMission : t.createMission}
                </button>
                <button
                  type="button"
                  className={`${btn} w-full`}
                  onClick={() => {
                    setMissionPanelOpen(false);
                    setLocationPickerOpen(false);
                    setPickerPosition(null);
                  }}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {locationPickerOpen ? (
        <div className="fixed inset-0 z-[60] bg-[#031726]/70 px-4 py-6 backdrop-blur-sm">
          <div className="ocp-glass-modal mx-auto flex h-full w-full max-w-5xl flex-col rounded-[14px] border border-white/[0.12] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-left text-[22px] font-semibold text-[#f0f3f6]">Local Selection Map</h3>
              <div className="flex gap-2">
                <button type="button" className={btn} onClick={() => setLocationPickerOpen(false)}>
                  {t.cancel}
                </button>
                <button
                  type="button"
                  className={btn}
                  disabled={!pickerPosition}
                  onClick={() => {
                    if (!pickerPosition) return;
                    setMissionForm((prev) => ({
                      ...prev,
                      latitude: pickerPosition[0].toFixed(6),
                      longitude: pickerPosition[1].toFixed(6),
                    }));
                    setLocationPickerOpen(false);
                  }}
                >
                  Confirmer
                </button>
              </div>
            </div>
            <p className="mb-3 text-left text-[13px] text-[#9fb4cb]">
              Cliquez sur la carte pour choisir l'emplacement
            </p>
            <div className="h-[500px] w-full overflow-hidden rounded-[12px] border border-white/[0.1]">
              <MapContainer
                center={pickerPosition ?? center}
                zoom={6}
                className="h-full w-full font-ocp not-italic"
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer attribution="&copy; OpenStreetMap & CARTO" url={CARTO_DARK} />
                <TileLayer attribution="" url={CARTO_LABELS} opacity={0.22} />
                <MapPlacePicker enabled onPick={(lat, lng) => setPickerPosition([lat, lng])} />
                {pickerPosition ? (
                  <Marker position={pickerPosition} icon={draftLocationIcon}>
                    <Popup>
                      <div className="text-left text-[13px] font-ocp not-italic text-[#d7e2ef]">
                        {pickerPosition[0].toFixed(6)}, {pickerPosition[1].toFixed(6)}
                      </div>
                    </Popup>
                  </Marker>
                ) : null}
              </MapContainer>
            </div>
          </div>
        </div>
      ) : null}

      {employeeModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#031726]/70 px-4 backdrop-blur-sm">
          <div className={`${glass} ocp-glass-heavy w-full max-w-[520px] border border-white/[0.1]`}>
            <h3 className="text-left text-[24px] font-semibold text-[#f0f3f6]">{employeeEditingId ? t.editEmployee : t.addEmployee}</h3>
            <form onSubmit={saveEmployee} className="mt-4 space-y-3">
              <input className={input} placeholder={t.employeeName} value={employeeForm.nom} onChange={(e) => setEmployeeForm((p) => ({ ...p, nom: e.target.value }))} required />
              <input className={input} placeholder={t.employeeSurname} value={employeeForm.prenom} onChange={(e) => setEmployeeForm((p) => ({ ...p, prenom: e.target.value }))} required />
              <input className={input} type="email" placeholder={t.employeeEmail} value={employeeForm.email} onChange={(e) => setEmployeeForm((p) => ({ ...p, email: e.target.value }))} required />
              <input
                className={input}
                type="password"
                placeholder={employeeEditingId ? t.passwordOptional : t.passwordPlaceholder}
                value={employeeForm.password}
                onChange={(e) => setEmployeeForm((p) => ({ ...p, password: e.target.value }))}
                required={!employeeEditingId}
              />
              <div className="flex gap-2">
                <button type="button" className={`${btn} w-full`} onClick={() => setEmployeeModalOpen(false)}>
                  {t.cancel}
                </button>
                <button type="submit" className={`${btn} w-full`}>
                  {t.saveEmployee}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {employeeDeleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#031726]/75 px-4 backdrop-blur-sm">
          <div className={`${glass} ocp-glass-heavy w-full max-w-[480px] border border-white/[0.1]`}>
            <p className="text-left text-[24px] font-semibold text-[#f0f3f6]">{t.confirmDeleteEmployee}</p>
            <p className="mt-2 text-left text-[#d7e2ef]">
              {t.deleteEmployee} {`${employeeDeleteTarget.prenom} ${employeeDeleteTarget.nom}`.trim()}?
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" className={`${btn} w-full`} onClick={() => setEmployeeDeleteTarget(null)}>
                {t.cancel}
              </button>
              <button type="button" className={`${btn} w-full`} onClick={() => void confirmDeleteEmployee()}>
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MissionDetailStaticMap({ lat, lng, status }) {
  const latN = Number(lat);
  const lngN = Number(lng);
  if (lat == null || lng == null || Number.isNaN(latN) || Number.isNaN(lngN)) {
    return <p className="text-left text-[14px] text-[#9fb4cb]">—</p>;
  }
  const position = [latN, lngN];
  return (
    <div className="h-[200px] w-full overflow-hidden rounded-[12px] border border-white/[0.1] bg-[#031726]">
      <MapContainer
        key={`detail-map-${latN}-${lngN}`}
        center={position}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
        className="z-0 h-full w-full font-ocp not-italic"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer attribution="&copy; OpenStreetMap & CARTO" url={CARTO_DARK} />
        <Marker position={position} icon={markerIcon(status)} />
      </MapContainer>
    </div>
  );
}

function MapPlacePicker({ enabled, onPick }) {
  useMapEvents({
    click(event) {
      if (!enabled) return;
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function MissionStatusIcon({ status }) {
  const tone =
    status === 'completed'
      ? 'bg-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]'
      : status === 'in_progress'
        ? 'bg-[#0ea5e9] shadow-[0_0_0_2px_rgba(14,165,233,0.28)]'
        : 'bg-[#d4a574] shadow-[0_0_0_2px_rgba(212,165,116,0.28)]';
  return <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone}`} aria-hidden />;
}

function MissionMapPopupBody({ mission, t, onViewFullDetails }) {
  const employeeLabel = `${mission.employee?.prenom ?? ''} ${mission.employee?.nom ?? ''}`.trim() || '—';
  return (
    <div className="font-ocp not-italic">
      <div className="flex items-start gap-3 p-4">
        <MissionStatusIcon status={mission.status} />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[16px] font-semibold leading-snug tracking-[0.02em] text-white">{mission.title}</p>
          <p className="mt-1.5 text-[12px] text-[#9fb4cb]">
            {t.missionAssignedTo}: <span className="text-[#d7e2ef]">{employeeLabel}</span>
          </p>
          <div className="mt-2">
            <MissionStatusBadge status={mission.status} t={t} />
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.08] px-4 py-3">
        <button
          type="button"
          onClick={onViewFullDetails}
          className="text-left text-[13px] font-semibold tracking-[0.02em] text-[#7ec8ff] underline decoration-[#7ec8ff]/35 underline-offset-4 transition hover:text-[#a8dbff]"
        >
          {t.missionViewFullDetails}
        </button>
      </div>
    </div>
  );
}

function StatTile({ label, value, variant }) {
  const accent =
    variant === 'total'
      ? 'bg-[#94a3b8] shadow-[0_0_14px_-2px_rgba(148,163,184,0.45)]'
      : variant === 'notStarted'
        ? 'bg-[#c4a574] shadow-[0_0_14px_-2px_rgba(196,165,116,0.45)]'
        : variant === 'ongoing'
          ? 'bg-[#0ea5e9] shadow-[0_0_16px_-2px_rgba(14,165,233,0.5)]'
          : 'bg-[#10b981] shadow-[0_0_16px_-2px_rgba(16,185,129,0.45)]';
  const hoverGlow =
    variant === 'total'
      ? 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_-12px_rgba(148,163,184,0.18)]'
      : variant === 'notStarted'
        ? 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_-12px_rgba(196,165,116,0.2)]'
        : variant === 'ongoing'
          ? 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_-12px_rgba(14,165,233,0.22)]'
          : 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_-12px_rgba(16,185,129,0.2)]';
  return (
    <div
      className={`relative flex min-h-[132px] flex-col overflow-hidden rounded-[12px] border border-[#2a4a6a]/55 bg-[#030d15]/92 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition ${hoverGlow}`}
    >
      <div className={`absolute left-0 top-0 h-full w-[3px] ${accent}`} aria-hidden />
      <div className="flex min-h-[132px] flex-1 flex-col px-5 pb-4 pt-3.5 pl-[22px]">
        <span className="text-left text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{label}</span>
        <p className="mt-auto pt-4 text-left text-[34px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-[#f0f3f6]">{value}</p>
      </div>
    </div>
  );
}
