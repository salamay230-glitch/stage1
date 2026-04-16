export default function AuthErrorAlert({ message, isRTL = false }) {
  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-8 z-50 w-[min(92vw,600px)] -translate-x-1/2 px-3">
      <div
        className={`flex items-start gap-3 rounded-2xl border border-white/10 bg-[#3f4048] px-6 py-4 text-white shadow-[0_14px_26px_rgba(0,0,0,0.35)] ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
        role="alert"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 16.5h.01" />
        </svg>
        <p className="text-base font-medium leading-7 text-white">{message}</p>
      </div>
    </div>
  );
}
