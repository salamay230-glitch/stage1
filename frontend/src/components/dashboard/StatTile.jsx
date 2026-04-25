export default function StatTile({ label, value, variant }) {
  const accent =
    variant === 'total'
      ? 'bg-[#94a3b8] shadow-[0_0_14px_-2px_rgba(148,163,184,0.45)]'
      : variant === 'notStarted'
        ? 'bg-[#c4a574] shadow-[0_0_14px_-2px_rgba(196,165,116,0.45)]'
        : variant === 'ongoing'
          ? 'bg-[#0ea5e9] shadow-[0_0_16px_-2px_rgba(14,165,233,0.5)]'
          : 'bg-[#10b981] shadow-[0_0_16px_-2px_rgba(16,185,129,0.45)]';
  const hoverGlow =
    variant === 'total'
      ? 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_-12px_rgba(148,163,184,0.18)]'
      : variant === 'notStarted'
        ? 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_-12px_rgba(196,165,116,0.2)]'
        : variant === 'ongoing'
          ? 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_-12px_rgba(14,165,233,0.22)]'
          : 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_-12px_rgba(16,185,129,0.2)]';
  return (
    <div
      className={`relative flex min-h-[132px] flex-col overflow-hidden rounded-[12px] border border-[#2a4a6a]/55 bg-[#030d15]/92 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition ${hoverGlow}`}
    >
      <div className={`absolute left-0 top-0 h-full w-[3px] ${accent}`} aria-hidden />
      <div className="flex min-h-[132px] flex-1 flex-col px-5 pb-4 pt-3.5 pl-[22px]">
        <span className="text-left text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{label}</span>
        <p className="mt-auto pt-4 text-left text-[34px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-[#f0f3f6]">{value}</p>
      </div>
    </div>
  );
}
