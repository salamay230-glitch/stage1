import { useCallback, useState, useEffect } from 'react';
import api from '../api/axios';
import { logoutUser } from '../features/auth/authSlice';
import useDashboardCore from './useDashboardCore';

export default function useAdministrationDashboard({ emptyEmployeeForm, emptyMissionForm }) {
  const core = useDashboardCore({ emptyMissionForm });
  
  // Admin-specific state
  const [employees, setEmployees] = useState([]);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeDeleteTarget, setEmployeeDeleteTarget] = useState(null);
  const [employeeEditingId, setEmployeeEditingId] = useState(null);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);

  // Admin-specific API calls - ONLY admin endpoints
  const loadData = useCallback(async () => {
    const [s, e, m, n] = await Promise.allSettled([
      api.get('/responsable/mission-stats'),
      api.get('/responsable/employees'),
      api.get('/responsable/missions'),
      api.get('/responsable/notifications'),
    ]);
    const missionsOrEmployeesFailed = m.status === 'rejected' || e.status === 'rejected';
    if (missionsOrEmployeesFailed) {
      if (e.status === 'rejected') {
      }
      if (m.status === 'rejected') {
      }
      core.pushToast(core.t.dataLoadFailed);
    }
    if (s.status === 'fulfilled') {
      const d = s.value.data ?? {};
      core.setStats({
        total_missions: Number(d.total_missions) || 0,
        ongoing_missions: Number(d.ongoing_missions) || 0,
        completed_missions: Number(d.completed_missions) || 0,
        not_started_missions: Number(d.not_started_missions ?? d.delayed_missions) || 0,
      });
    }
    if (e.status === 'fulfilled') setEmployees(e.value.data?.employees ?? []);
    if (m.status === 'fulfilled') {
      const missionsData = m.value.data?.missions ?? [];
      core.setMissions(missionsData);
    }
    if (n.status === 'fulfilled') core.setNotifications(n.value.data?.notifications ?? []);
  }, [core.pushToast, core.t.dataLoadFailed]);

  // Auto-load data on mount
  useEffect(() => {
    const token = localStorage.getItem('axys_token') || sessionStorage.getItem('axys_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    void loadData();
  }, [loadData]);

  // Admin-specific mission functions
  const saveMission = async (e) => {
    e.preventDefault();
    if (!core.missionForm.employee_id) {
      core.pushToast(core.t.employeeRequiredForMission);
      return;
    }
    const payload = {
      title: core.missionForm.title.trim(),
      description: core.missionForm.description.trim(),
      latitude: Number(core.missionForm.latitude),
      longitude: Number(core.missionForm.longitude),
      employee_id: Number(core.missionForm.employee_id),
      end_date: core.missionForm.end_date,
    };
    const response = core.missionEditingId
      ? await api.put(`/responsable/missions/${core.missionEditingId}`, payload)
      : await api.post('/responsable/missions', payload);
    const savedMission = response.data?.mission;
    if (savedMission) {
      core.setMissions((prev) => {
        if (core.missionEditingId) return prev.map((m) => (m.id === core.missionEditingId ? savedMission : m));
        return [savedMission, ...prev];
      });
    }
    core.setMissionPanelOpen(false);
    core.setMissionEditingId(null);
    core.setMissionForm(emptyMissionForm);
    core.setLocationPickerOpen(false);
    core.setPickerPosition(null);
    core.pushToast(core.t.missionSaved);
    void loadData();
  };

  const confirmDeleteMission = async () => {
    if (!core.missionDeleteTarget) return;
    try {
      await api.delete(`/responsable/missions/${core.missionDeleteTarget.id}`);
      core.setMissionDeleteTarget(null);
      core.pushToast(core.t.missionDeleted);
      await loadData();
    } catch {
      core.pushToast(core.t.errors.unexpectedError);
    }
  };

  // Admin-specific employee functions
  const saveEmployee = async (e) => {
    e.preventDefault();
    const payload = { nom: employeeForm.nom.trim(), prenom: employeeForm.prenom.trim(), email: employeeForm.email.trim() };
    if (!employeeEditingId || employeeForm.password.trim()) payload.password = employeeForm.password;
    if (employeeEditingId) await api.put(`/responsable/employees/${employeeEditingId}`, payload);
    else await api.post('/responsable/employees', payload);
    setEmployeeModalOpen(false);
    setEmployeeEditingId(null);
    setEmployeeForm(emptyEmployeeForm);
    core.pushToast(core.t.employeeSavedToast);
    await loadData();
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeDeleteTarget) return;
    await api.delete(`/responsable/employees/${employeeDeleteTarget.id}`);
    setEmployeeDeleteTarget(null);
    core.pushToast(core.t.employeeDeletedToast);
    await loadData();
  };

  const logout = () => core.dispatch(logoutUser()).finally(() => core.navigate('/login', { replace: true }));

  return {
    // All core functionality (shared state, derived state, shared handlers)
    ...core,

    // Admin-specific ONLY
    employees,
    setEmployees,
    employeeModalOpen,
    setEmployeeModalOpen,
    employeeDeleteTarget,
    setEmployeeDeleteTarget,
    employeeEditingId,
    setEmployeeEditingId,
    employeeForm,
    setEmployeeForm,
    saveMission,
    confirmDeleteMission,
    saveEmployee,
    confirmDeleteEmployee,
    loadData,
    logout,
  };
}
