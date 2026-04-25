import { HamburgerIcon, IconLogout, IconMission, IconUsers } from '../dashboard/DashboardIcons';

const ProfileMenu = ({
  t,
  isRTL,
  profileOpen,
  setProfileOpen,
  setNotifOpen,
  onLogout,
  onGoMissions,
  onGoUsers,
  showUsersNav = true,
  showMissionNav = true,
  user
}) => {
  return (
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
          dir={isRTL ? 'rtl' : undefined}
          className={`ocp-floating-nav-enter ocp-floating-nav-panel ocp-glass-heavy absolute top-[calc(100%+8px)] z-[9999] min-w-[272px] rounded-[14px] border border-white/[0.1] p-1 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] ${
            isRTL
              ? '!left-4 !right-auto translate-x-0 origin-top-left'
              : '!right-4 !left-auto origin-top-right'
          }`}
        >
          <div className="border-b border-white/10 px-3 pb-3 pt-2 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8aa3b8]">{t.responsableProfileTrigger}</p>
            <p className="mt-1 truncate text-[16px] font-semibold tracking-[0.02em] text-white">{user?.name ?? '—'}</p>
            {user?.email ? <p className="mt-0.5 truncate text-[12px] text-[#9fb4cb]">{user.email}</p> : null}
          </div>
          <div className="py-1">
            {showMissionNav && (
              <button
                type="button"
                role="menuitem"
                className="ocp-nav-item-flat flex w-full items-center gap-3 rounded-[8px] px-3 py-3.5 text-left text-[16px] font-semibold tracking-[0.02em] text-[#eef4fb]"
                onClick={onGoMissions}
              >
                <IconMission />
                <span>{t.missionControl}</span>
              </button>
            )}
            {showUsersNav && (
              <button
                type="button"
                role="menuitem"
                className="ocp-nav-item-flat flex w-full items-center gap-3 rounded-[8px] px-3 py-3.5 text-left text-[16px] font-semibold tracking-[0.02em] text-[#eef4fb]"
                onClick={onGoUsers}
              >
                <IconUsers />
                <span>{t.responsableNavUsers}</span>
              </button>
            )}
            <div className="mx-2 my-1 h-px bg-white/10" />
            <button
              type="button"
              role="menuitem"
              className="ocp-nav-item-flat flex w-full items-center gap-3 rounded-[8px] px-3 py-3.5 text-left text-[16px] font-semibold tracking-[0.02em] text-[#f0e0e0]"
              onClick={onLogout}
            >
              <IconLogout />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileMenu;
