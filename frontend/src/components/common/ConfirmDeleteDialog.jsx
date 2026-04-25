export default function ConfirmDeleteDialog({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  glass,
  btn,
  cancelLabel,
  confirmLabel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md p-6 ${glass}`}>
        <h3 className="mb-3 text-xl font-bold text-[#f1f6fc]">
          {title}
        </h3>
        <p className="mb-6 text-[#c5d3e1]">
          {message}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={btn}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`${btn} border-[#dc2626] text-[#fca5a5] hover:bg-[#7f1d1d]/30`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}