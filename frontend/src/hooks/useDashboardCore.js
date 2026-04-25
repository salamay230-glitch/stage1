import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { YEAR_OPTIONS_LENGTH, YEAR_START, TOAST_DURATION } from '../constants/appConstants';

export default function useDashboardCore({ emptyMissionForm }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, isRTL } = useLocale();
  const user = useSelector((s) => s.auth.user);

  // Shared UI state
  const headerNavRef = useRef(null);
  const missionMapSectionRef = useRef(null);
  const mainMapRef = useRef(null);
  const [section, setSection] = useState('missions');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [missionDetail, setMissionDetail] = useState(null);
  const [missionDeleteTarget, setMissionDeleteTarget] = useState(null);
  const [missionPanelOpen, setMissionPanelOpen] = useState(false);
  const [missionEditingId, setMissionEditingId] = useState(null);
  const [missionForm, setMissionForm] = useState(emptyMissionForm);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  // Shared data state
  const [stats, setStats] = useState({
    total_missions: 0,
    ongoing_missions: 0,
    completed_missions: 0,
    not_started_missions: 0,
  });
  const [missions, setMissions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Shared derived state
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

  const tomorrowDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const monthOptions = useMemo(
    () => (isRTL
      ? [
          { value: '1', label: 'يناير' },
          { value: '2', label: 'فبراير' },
          { value: '3', label: 'مارس' },
          { value: '4', label: 'أبريل' },
          { value: '5', label: 'ماي' },
          { value: '6', label: 'يونيو' },
          { value: '7', label: 'يوليوز' },
          { value: '8', label: 'غشت' },
          { value: '9', label: 'شتنبر' },
          { value: '10', label: 'أكتوبر' },
          { value: '11', label: 'نونبر' },
          { value: '12', label: 'دجنبر' },
        ]
      : [
          { value: '1', label: 'January' },
          { value: '2', label: 'February' },
          { value: '3', label: 'March' },
          { value: '4', label: 'April' },
          { value: '5', label: 'May' },
          { value: '6', label: 'June' },
          { value: '7', label: 'July' },
          { value: '8', label: 'August' },
          { value: '9', label: 'September' },
          { value: '10', label: 'October' },
          { value: '11', label: 'November' },
          { value: '12', label: 'December' },
        ]),
    [isRTL],
  );

  const yearOptions = useMemo(() => Array.from({ length: YEAR_OPTIONS_LENGTH }, (_, i) => String(YEAR_START + i)), []);

  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      const statusMatch =
        statusFilter === 'all'
          ? true
          : m.status?.toLowerCase() === statusFilter.toLowerCase();

      const deadline = m.end_date ? new Date(m.end_date) : null;
      const refDate = deadline ?? (m.created_at ? new Date(m.created_at) : null);
      const monthMatch =
        monthFilter === 'all' ||
        (refDate instanceof Date && !Number.isNaN(refDate.getTime()) && refDate.getMonth() + 1 === Number(monthFilter));
      const yearMatch =
        yearFilter === 'all' ||
        (refDate instanceof Date && !Number.isNaN(refDate.getTime()) && refDate.getFullYear() === Number(yearFilter));

      return statusMatch && monthMatch && yearMatch;
    });
  }, [missions, monthFilter, statusFilter, yearFilter]);

  // Shared handlers
  const pushToast = useCallback((msg) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, msg }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, TOAST_DURATION);
  }, []);

  const openNotifications = useCallback(async (apiEndpoint) => {
    const nextOpen = !notifOpen;
    setNotifOpen(nextOpen);
    setProfileOpen(false);
    if (nextOpen && notifications.some((n) => !n.is_read)) {
      const snapshot = notifications;
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      try {
        await api.put(apiEndpoint);
      } catch {
        setNotifications(snapshot);
      }
    }
  }, [notifOpen, notifications]);

  const openMissionDetailPanel = useCallback((mission) => {
    if (!mission) return;
    setMissionDetail(mission);
  }, []);

  const focusMissionOnMainMap = useCallback((mission) => {
    if (!mission) return;
    const lat = Number(mission.latitude);
    const lng = Number(mission.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    missionMapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const map = mainMapRef.current;
      if (!map) return;
      if (typeof map.flyTo === 'function') {
        map.flyTo([lat, lng], 11, { duration: 1.2 });
        return;
      }
      map.setView([lat, lng], 11, { animate: true });
    }, 220);
  }, []);

  const openMissionEditor = useCallback((mission) => {
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
            end_date: mission.end_date ? String(mission.end_date).slice(0, 10) : '',
          }
        : emptyMissionForm,
    );
    setPickerPosition(initialLat && initialLng ? [Number(initialLat), Number(initialLng)] : null);
    setLocationPickerOpen(false);
    setMissionPanelOpen(true);
  }, [emptyMissionForm]);

  const openLocationPicker = useCallback(() => {
    const lat = missionForm.latitude ? Number(missionForm.latitude) : null;
    const lng = missionForm.longitude ? Number(missionForm.longitude) : null;
    setPickerPosition(lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng) ? [lat, lng] : center);
    setLocationPickerOpen(true);
  }, [missionForm, center]);

  // Shared effects
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

  const goMissions = useCallback(() => {
    setSection('missions');
    setProfileOpen(false);
  }, []);

  const goUsers = useCallback(() => {
    setSection('users');
    setProfileOpen(false);
  }, []);

  return {
    // Shared state
    t,
    isRTL,
    user,
    headerNavRef,
    missionMapSectionRef,
    mainMapRef,
    section,
    setSection,
    profileOpen,
    setProfileOpen,
    notifOpen,
    setNotifOpen,
    stats,
    setStats,
    missions,
    setMissions,
    notifications,
    setNotifications,
    toasts,
    setToasts,
    missionDetail,
    setMissionDetail,
    missionDeleteTarget,
    setMissionDeleteTarget,
    missionPanelOpen,
    setMissionPanelOpen,
    missionEditingId,
    setMissionEditingId,
    missionForm,
    setMissionForm,
    locationPickerOpen,
    setLocationPickerOpen,
    pickerPosition,
    setPickerPosition,
    statusFilter,
    setStatusFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter,
    missionsWithCoords,
    center,
    unreadCount,
    pageSubtitle,
    tomorrowDate,
    monthOptions,
    yearOptions,
    filteredMissions,

    // Shared handlers
    pushToast,
    openNotifications,
    openMissionDetailPanel,
    focusMissionOnMainMap,
    openMissionEditor,
    openLocationPicker,
    goMissions,
    goUsers,
    
    // Core utilities
    dispatch,
    navigate,
  };
}
