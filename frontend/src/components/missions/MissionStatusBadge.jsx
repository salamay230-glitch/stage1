/**
 * Mission status: colored dot + label (i18n via `t`).
 * Palette: non démarrée — soft amber / gray; en cours — OCP cyan; terminée — emerald.
 */
export default function MissionStatusBadge({ status, t }) {
  const key = status === 'completed' ? 'completed' : status === 'in_progress' ? 'in_progress' : 'pending';
  const label =
    key === 'completed'
      ? t.missionStatusCompleted
      : key === 'in_progress'
        ? t.missionStatusInProgress
        : t.missionStatusPending;
  const dot =
    key === 'completed'
      ? 'bg-emerald-400/90 shadow-[0_0_0_1px_rgba(52,211,153,0.4)]'
      : key === 'in_progress'
        ? 'bg-[#0ea5e9]/95 shadow-[0_0_0_1px_rgba(14,165,233,0.38)]'
        : 'bg-[#d4a574]/90 shadow-[0_0_0_1px_rgba(212,165,116,0.35)]';
  const text =
    key === 'completed'
      ? 'text-emerald-100/80'
      : key === 'in_progress'
        ? 'text-[#bae6fd]/90'
        : 'text-[#e7d5bc]/90';
  return (
    <span className="inline-flex items-center gap-2.5 text-left">
      <span className={`h-[6px] w-[6px] shrink-0 rounded-full ${dot}`} aria-hidden />
      <span className={`text-[13px] font-medium not-italic tracking-[0.02em] ${text}`}>{label}</span>
    </span>
  );
}
