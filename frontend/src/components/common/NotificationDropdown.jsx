import { BellIcon } from '../dashboard/DashboardIcons';

const NotificationDropdown = ({
  t,
  isRTL,
  notifOpen,
  openNotifications,
  unreadCount,
  notifications
}) => {
  return (
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
          className={`pointer-events-none absolute top-2 h-2.5 w-2.5 rounded-full bg-[#4f95ff] ring-2 ring-[#0d1928] transition-all duration-500 ease-out ${
            isRTL ? 'left-2 right-auto' : 'right-2 left-auto'
          } ${
            unreadCount > 0 ? 'ocp-notif-dot-enter scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        />
      </button>

      {notifOpen ? (
        <div
          dir={isRTL ? 'rtl' : undefined}
          className={`ocp-floating-nav-enter ocp-floating-nav-panel ocp-glass-heavy absolute top-[calc(100%+8px)] z-[9999] w-[min(360px,calc(100vw-2rem))] rounded-[14px] border border-white/[0.1] p-3 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] ${
            isRTL
              ? '!left-4 !right-auto translate-x-0 origin-top-left'
              : '!right-4 !left-auto origin-top-right'
          }`}
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

export default NotificationDropdown;
