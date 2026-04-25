import LanguageSwitcher from '../auth/LanguageSwitcher';
import OcpMarkLogo from '../branding/OcpMarkLogo';
import { BellIcon, HamburgerIcon, IconLogout, IconMission, IconUsers } from './DashboardIcons';
import NotificationDropdown from '../common/NotificationDropdown';
import ProfileMenu from '../common/ProfileMenu';

const DashboardHeader = ({
  t,
  isRTL,
  user,
  headerNavRef,
  profileOpen,
  setProfileOpen,
  notifOpen,
  setNotifOpen,
  unreadCount,
  openNotifications,
  pageSubtitle,
  onLogout,
  onGoMissions,
  onGoUsers,
  notifications,
  showUsersNav = true,
  showMissionNav = true,
  children
}) => {
  return (
    <header className="flex items-center justify-between border-b border-[#4d6f99]/20 pb-4">
      <div className="flex items-center gap-3">
        <OcpMarkLogo />
        <div className="text-left">
          <p className="text-[18px] font-semibold tracking-[0.04em] text-white">{t.brand}</p>
          <p className="mt-0.5 text-[15px] font-semibold tracking-[0.06em] text-[#d7e2ef]">{pageSubtitle}</p>
        </div>
      </div>

      <div ref={headerNavRef} className="relative flex items-center gap-2">
        <NotificationDropdown
          t={t}
          isRTL={isRTL}
          notifOpen={notifOpen}
          openNotifications={openNotifications}
          unreadCount={unreadCount}
          notifications={notifications}
        />

        <ProfileMenu
          t={t}
          isRTL={isRTL}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          setNotifOpen={setNotifOpen}
          onLogout={onLogout}
          onGoMissions={onGoMissions}
          onGoUsers={onGoUsers}
          showUsersNav={showUsersNav}
          showMissionNav={showMissionNav}
          user={user}
        />
      </div>

      {children}
    </header>
  );
};

// Helper function for date formatting (moved from utils to avoid circular dependencies)
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export default DashboardHeader;
