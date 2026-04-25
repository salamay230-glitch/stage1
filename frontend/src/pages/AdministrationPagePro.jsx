import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import LanguageSwitcher from '../components/auth/LanguageSwitcher';
import OcpMarkLogo from '../components/branding/OcpMarkLogo';
import { BellIcon, HamburgerIcon, IconLogout, IconMission, IconUsers } from '../components/dashboard/DashboardIcons';
import ConfirmDeleteDialog from '../components/common/ConfirmDeleteDialog';
import MissionDeleteDialog from '../components/dashboard/MissionDeleteDialog';
import { MapPlacePicker, MissionDetailStaticMap, MissionMapPopupBody, draftLocationIcon, markerIcon } from '../components/dashboard/MissionMapComponents';
import LocationPickerModal from '../components/maps/LocationPickerModal';
import StatTile from '../components/dashboard/StatTile';
import ToastStack from '../components/dashboard/ToastStack';
import MissionStatusBadge from '../components/missions/MissionStatusBadge';
import MissionDetailModal from '../components/missions/MissionDetailModal';
import { btn, glass, input } from '../constants/dashboardStyles';
import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AdminStatsSection from '../components/sections/AdminStatsSection';
import AdminEmployeesSection from '../components/sections/AdminEmployeesSection';
import AdminMissionsSection from '../components/sections/AdminMissionsSection';
import useAdministrationDashboard from '../hooks/useAdministrationDashboard';
import { formatDate, formatDateOnly } from '../utils/dashboardFormatters';

import { CARTO_DARK, CARTO_LABELS } from '../constants/appConstants';

const emptyEmployeeForm = { nom: '', prenom: '', email: '', password: '' };
const emptyMissionForm = {
  title: '',
  description: '',
  latitude: '',
  longitude: '',
  employee_id: '',
  end_date: '',
};

export default function AdministrationPagePro() {
  const {
    t,
    isRTL,
    user,
    headerNavRef,
    missionMapSectionRef,
    mainMapRef,
    section,
    profileOpen,
    setProfileOpen,
    notifOpen,
    setNotifOpen,
    stats,
    employees,
    missions,
    notifications,
    toasts,
    missionDetail,
    setMissionDetail,
    missionDeleteTarget,
    setMissionDeleteTarget,
    employeeModalOpen,
    setEmployeeModalOpen,
    employeeDeleteTarget,
    setEmployeeDeleteTarget,
    employeeEditingId,
    setEmployeeEditingId,
    employeeForm,
    setEmployeeForm,
    missionPanelOpen,
    missionEditingId,
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
    openNotifications,
    openMissionDetailPanel,
    focusMissionOnMainMap,
    openMissionEditor,
    openLocationPicker,
    saveMission,
    confirmDeleteMission,
    saveEmployee,
    confirmDeleteEmployee,
    logout,
    goMissions,
    goUsers,
  } = useAdministrationDashboard({ emptyEmployeeForm, emptyMissionForm });
  const isSidebarOpen = missionPanelOpen;

  return (
    <div className="relative min-h-screen bg-[#031726]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,#0b3b34_0%,#052033_33%,#031726_70%)]" />
      <div dir={isRTL ? 'rtl' : undefined} className="relative flex min-h-screen flex-col px-4 pb-20 pt-4 font-ocp not-italic sm:px-8 lg:px-14">
        <DashboardHeader
          t={t}
          isRTL={isRTL}
          user={user}
          headerNavRef={headerNavRef}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          unreadCount={unreadCount}
          openNotifications={openNotifications}
          pageSubtitle={pageSubtitle}
          onLogout={logout}
          onGoMissions={goMissions}
          onGoUsers={goUsers}
          notifications={notifications}
        />

        <main className="mt-6 space-y-6 text-left">
          {section === 'missions' ? (
            <section className="space-y-4">
              <AdminStatsSection stats={stats} t={t} />
              <AdminMissionsSection
                t={t}
                isRTL={isRTL}
                glass={glass}
                btn={btn}
                missionMapSectionRef={missionMapSectionRef}
                mainMapRef={mainMapRef}
                missionsWithCoords={missionsWithCoords}
                center={center}
                openMissionEditor={openMissionEditor}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                monthFilter={monthFilter}
                setMonthFilter={setMonthFilter}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                monthOptions={monthOptions}
                yearOptions={yearOptions}
                filteredMissions={filteredMissions}
                openMissionDetailPanel={openMissionDetailPanel}
                missionDetail={missionDetail}
                setMissionDetail={setMissionDetail}
                missionDeleteTarget={missionDeleteTarget}
                setMissionDeleteTarget={setMissionDeleteTarget}
                missionPanelOpen={missionPanelOpen}
                missionEditingId={missionEditingId}
                missionForm={missionForm}
                setMissionForm={setMissionForm}
                locationPickerOpen={locationPickerOpen}
                setLocationPickerOpen={setLocationPickerOpen}
                pickerPosition={pickerPosition}
                setPickerPosition={setPickerPosition}
                saveMission={saveMission}
                employees={employees}
                tomorrowDate={tomorrowDate}
                CARTO_DARK={CARTO_DARK}
                CARTO_LABELS={CARTO_LABELS}
              />
            </section>
          ) : null}

          {section === 'users' ? (
            <AdminEmployeesSection
              employees={employees}
              t={t}
              btn={btn}
              setEmployeeModalOpen={setEmployeeModalOpen}
              setEmployeeEditingId={setEmployeeEditingId}
              setEmployeeForm={setEmployeeForm}
              setEmployeeDeleteTarget={setEmployeeDeleteTarget}
              emptyEmployeeForm={emptyEmployeeForm}
            />
          ) : null}

        </main>

        <LanguageSwitcher />

        <ToastStack toasts={toasts} />
      </div>

      <MissionDetailModal
        missionDetail={missionDetail}
        setMissionDetail={setMissionDetail}
        t={t}
        btn={btn}
        focusMissionOnMainMap={focusMissionOnMainMap}
        openMissionEditor={openMissionEditor}
      />

      <MissionDeleteDialog
        missionDeleteTarget={missionDeleteTarget}
        t={t}
        glass={glass}
        btn={btn}
        onCancel={() => setMissionDeleteTarget(null)}
        onConfirm={() => void confirmDeleteMission()}
      />

      <ConfirmDeleteDialog
        isOpen={!!employeeDeleteTarget}
        title={t.confirmDeleteEmployee}
        message={`${t.deleteEmployee} "${employeeDeleteTarget?.prenom} ${employeeDeleteTarget?.nom}"`}
        onCancel={() => setEmployeeDeleteTarget(null)}
        onConfirm={() => void confirmDeleteEmployee()}
        glass={glass}
        btn={btn}
        cancelLabel={t.cancel}
        confirmLabel={t.confirm}
      />

      <div
        className={`fixed inset-0 z-[9999] bg-[#031726]/65 backdrop-blur-sm transition-opacity duration-300 ${
          isSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
          <div
            className={`ocp-glass-modal fixed top-0 z-[9999] h-full w-full max-w-[620px] bg-[#0d1928] border-white/[0.1] p-5 shadow-[-12px_0_40px_rgba(0,0,0,0.35)] transition-transform duration-300 ${
              isRTL
                ? (isSidebarOpen ? 'translate-x-0' : 'translate-x-full')
                : (isSidebarOpen ? 'translate-x-0' : '-translate-x-full')
            }`}
            style={{ left: isRTL ? 'auto' : '0', right: isRTL ? '0' : 'auto' }}
            dir={isRTL ? 'rtl' : undefined}
          >
            <h3 className={`${isRTL ? 'text-right' : 'text-left'} text-[24px] font-semibold text-[#f0f3f6]`}>
              {missionEditingId ? t.editMission : t.addMission}
            </h3>
            <form onSubmit={saveMission} className="mt-5 space-y-3">
              <FormInput
                placeholder={t.title}
                value={missionForm.title}
                onChange={(e) => setMissionForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
              <FormInput
                isTextarea
                placeholder={t.description}
                value={missionForm.description}
                onChange={(e) => setMissionForm((p) => ({ ...p, description: e.target.value }))}
                required
              />
              <div className="relative">
                <p className={`${isRTL ? 'text-right' : 'text-left'} mb-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-[#8aa3b8]`}>
                  {t.responsableAssignMission}
                </p>
                <FormSelect
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
                </FormSelect>
              </div>
              <div>
                <p className={`${isRTL ? 'text-right' : 'text-left'} mb-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-[#8aa3b8]`}>
                  Cliquez sur la carte pour choisir l'emplacement
                </p>
                <button
                  type="button"
                  className="w-full rounded-[10px] border border-emerald-500/50 bg-emerald-500/20 px-4 py-2.5 text-[15px] font-semibold tracking-wide text-emerald-50 transition hover:bg-emerald-500/30 text-center flex justify-center items-center gap-2"
                  onClick={openLocationPicker}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  Ajouter place
                </button>
              </div>
              <FormInput
                placeholder="Location (Lat, Lng)"
                value={missionForm.latitude && missionForm.longitude ? `${missionForm.latitude}, ${missionForm.longitude}` : ''}
                readOnly
                required
                onClick={openLocationPicker}
              />
              <FormInput
                type="date"
                min={tomorrowDate}
                value={missionForm.end_date}
                onChange={(e) => setMissionForm((p) => ({ ...p, end_date: e.target.value }))}
                required
                ariaLabel={isRTL ? 'تاريخ النهاية' : "Date d'échéance"}
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

      <LocationPickerModal
        locationPickerOpen={locationPickerOpen}
        setLocationPickerOpen={setLocationPickerOpen}
        pickerPosition={pickerPosition}
        setPickerPosition={setPickerPosition}
        center={center}
        setMissionForm={setMissionForm}
        btn={btn}
        t={t}
      />

      {employeeModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#031726]/70 px-4 backdrop-blur-sm">
          <div className={`${glass} ocp-glass-heavy w-full max-w-[520px] border border-white/[0.1]`}>
            <h3 className="text-left text-[24px] font-semibold text-[#f0f3f6]">{employeeEditingId ? t.editEmployee : t.addEmployee}</h3>
            <form onSubmit={saveEmployee} className="mt-4 space-y-3">
              <FormInput placeholder={t.employeeName} value={employeeForm.nom} onChange={(e) => setEmployeeForm((p) => ({ ...p, nom: e.target.value }))} required />
              <FormInput placeholder={t.employeeSurname} value={employeeForm.prenom} onChange={(e) => setEmployeeForm((p) => ({ ...p, prenom: e.target.value }))} required />
              <FormInput type="email" placeholder={t.employeeEmail} value={employeeForm.email} onChange={(e) => setEmployeeForm((p) => ({ ...p, email: e.target.value }))} required />
              <FormInput
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
    </div>
  );
}