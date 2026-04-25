import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import LanguageSwitcher from '../components/auth/LanguageSwitcher';
import OcpMarkLogo from '../components/branding/OcpMarkLogo';
import { BellIcon, HamburgerIcon, IconLogout, IconMission } from '../components/dashboard/DashboardIcons';
import MissionDeleteDialog from '../components/dashboard/MissionDeleteDialog';
import { MapPlacePicker, MissionDetailStaticMap, MissionMapPopupBody, draftLocationIcon, markerIcon } from '../components/dashboard/MissionMapComponents';
import LocationPickerModal from '../components/maps/LocationPickerModal';
import StatTile from '../components/dashboard/StatTile';
import ToastStack from '../components/dashboard/ToastStack';
import MissionStatusBadge from '../components/missions/MissionStatusBadge';
import MissionDetailModal from '../components/missions/MissionDetailModal';
import { btn, glass, input } from '../constants/dashboardStyles';
import FormSelect from '../components/common/FormSelect';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsSection from '../components/sections/StatsSection';
import MapSection from '../components/sections/MapSection';
import MissionsSection from '../components/sections/MissionsSection';
import useCollaborationDashboard from '../hooks/useCollaborationDashboard';
import { formatDate, formatDateOnly } from '../utils/dashboardFormatters';

import { CARTO_DARK, CARTO_LABELS } from '../constants/appConstants';

const emptyMissionForm = {
  title: '',
  description: '',
  latitude: '',
  longitude: '',
  employee_id: '',
  end_date: '',
};

export default function CollaborationPage() {
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
    notifications,
    toasts,
    missionDetail,
    setMissionDetail,
    missionDeleteTarget,
    setMissionDeleteTarget,
    locationPickerOpen,
    setLocationPickerOpen,
    pickerPosition,
    setPickerPosition,
    setMissionForm,
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
    monthOptions,
    yearOptions,
    filteredMissions,
    openNotifications,
    openMissionDetailPanel,
    focusMissionOnMainMap,
    openMissionEditor,
    confirmDeleteMission,
    updateMissionStatus,
    pushToast,
    loadData,
    logout,
    goMissions,
  } = useCollaborationDashboard({ emptyMissionForm });

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
          showUsersNav={false}
          showMissionNav={true}
          notifications={notifications}
        />

        <main className="mt-6 space-y-6 text-left">
          {section === 'missions' ? (
            <section className="space-y-4">
              <StatsSection stats={stats} t={t} />
              <MapSection
                t={t}
                glass={glass}
                missionMapSectionRef={missionMapSectionRef}
                mainMapRef={mainMapRef}
                missionsWithCoords={missionsWithCoords}
                center={center}
                openMissionDetailPanel={openMissionDetailPanel}
                CARTO_DARK={CARTO_DARK}
                CARTO_LABELS={CARTO_LABELS}
              />
              <MissionsSection
                t={t}
                isRTL={isRTL}
                glass={glass}
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
                missionDeleteTarget={missionDeleteTarget}
                setMissionDeleteTarget={setMissionDeleteTarget}
                updateMissionStatus={updateMissionStatus}
                pushToast={pushToast}
                loadData={loadData}
              />
            </section>
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

      

      
    </div>
  );
}
