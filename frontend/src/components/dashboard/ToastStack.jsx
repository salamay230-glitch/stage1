export default function ToastStack({ toasts }) {
  return (
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
  );
}
