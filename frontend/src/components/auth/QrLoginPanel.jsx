import { useLocale } from '../../context/LocaleContext';

export default function QrLoginPanel() {
  const { t } = useLocale();

  return (
    <aside className="w-[170px] pt-3">
      <div className="mx-auto h-[136px] w-[106px] rounded-xl border border-white/20 bg-white/[0.96] p-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-center">
          <p className="text-[12px] leading-4 text-zinc-800">{t.qrExpired}</p>
          <button
            type="button"
            className="mt-1 text-[24px] leading-none text-zinc-700"
            aria-label="Refresh QR code"
          >
            ↻
          </button>
          <button type="button" className="mt-1 text-[12px] font-medium text-zinc-900">
            {t.refresh}
          </button>
        </div>
      </div>

      <h3 className="mt-5 text-center text-[24px] font-semibold leading-[30px] text-white">
        {t.qrTitle}
      </h3>
      <p className="mx-auto mt-2 max-w-[170px] text-center text-[17px] leading-[22px] text-white/80">
        {t.qrDescription}
      </p>
    </aside>
  );
}
