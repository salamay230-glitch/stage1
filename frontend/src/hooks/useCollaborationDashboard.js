import { useCallback, useEffect } from 'react';
import api from '../api/axios';
import { logoutUser } from '../features/auth/authSlice';
import useDashboardCore from './useDashboardCore';

export default function useCollaborationDashboard({ emptyMissionForm }) {
  const core = useDashboardCore({ emptyMissionForm });

  // Collaboration-specific logic ONLY
  const updateMissionStatus = async (missionId, newStatus) => {
    const res = await api.put(`/employee/missions/${missionId}/status`, { status: newStatus });
    core.setMissions((prev) => prev.map((x) => (x.id === missionId ? res.data.mission : x)));
  };

  // Collaboration-specific API calls - ONLY employee endpoints
  const loadData = useCallback(async () => {
    const [m, n] = await Promise.allSettled([
      api.get('/employee/missions'),
      api.get('/employee/notifications'),
    ]);
    if (m.status === 'rejected') {
      core.pushToast(core.t.dataLoadFailed);
    }
    if (m.status === 'fulfilled') {
      const missionsData = m.value.data?.missions ?? [];
      core.setMissions(missionsData);
      // Calculate stats locally ONLY from missions
      core.setStats({
        total_missions: missionsData.length,
        ongoing_missions: missionsData.filter((x) => x.status === 'in_progress').length,
        completed_missions: missionsData.filter((x) => x.status === 'completed').length,
        not_started_missions: missionsData.filter((x) => x.status === 'pending').length,
      });
    }
    if (n.status === 'fulfilled') core.setNotifications(n.value.data?.notifications ?? []);
  }, [core.pushToast, core.t.dataLoadFailed]);

  const logout = () => core.dispatch(logoutUser()).finally(() => core.navigate('/login', { replace: true }));

  // Auto-load data on mount
  useEffect(() => {
    const token = localStorage.getItem('axys_token') || sessionStorage.getItem('axys_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    void loadData();
  }, [loadData]);

  return {
    // All core functionality (shared state, derived state, shared handlers)
    ...core,

    // Collaboration-specific ONLY
    updateMissionStatus,
    loadData,
    logout,
  };
}
