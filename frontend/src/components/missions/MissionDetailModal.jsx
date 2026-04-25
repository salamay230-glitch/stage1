import MissionStatusBadge from './MissionStatusBadge';
import { MissionDetailStaticMap } from '../dashboard/MissionMapComponents';

const MissionDetailModal = ({
  missionDetail,
  setMissionDetail,
  t,
  btn,
  focusMissionOnMainMap,
  openMissionEditor,
}) => {
  if (!missionDetail) return null;

  return (
    <div
      className="ocp-mission-detail-backdrop fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-black/20 px-4 pb-8 pt-16 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-detail-title"
      onClick={() => setMissionDetail(null)}
    >
      <div
        className="ocp-mission-detail-panel ocp-glass-heavy ocp-glass-modal font-ocp not-italic relative mt-2 w-full max-w-4xl rounded-[18px] border border-white/[0.1] p-7 shadow-[0_32px_72px_-20px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="min-w-0 flex-1 text-left">
            <p id="mission-detail-title" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8aa3b8]">
              {t.missionDetailHeading}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-left text-[24px] font-semibold leading-tight tracking-[0.02em] text-white">{missionDetail.title}</h2>
              <MissionStatusBadge status={missionDetail.status} t={t} />
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-[10px] border border-white/12 bg-white/[0.05] px-3.5 py-2 text-left text-[13px] font-semibold text-[#e8eff7] transition hover:bg-white/[0.1]"
            onClick={() => setMissionDetail(null)}
          >
            {t.missionCloseDetail}
          </button>
        </div>

        <section className="mt-5 text-left">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{t.missionDetailDescriptionLabel}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#d7e2ef]">{missionDetail.description?.trim() || '—'}</p>
        </section>

        <dl className="mt-6 space-y-4 border-t border-white/[0.06] pt-6 text-left text-[14px]">
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{t.missionDetailAssigneeLabel}</dt>
            <dd className="text-[16px] font-medium text-[#f0f3f6]">
              {`${missionDetail.employee?.prenom ?? ''} ${missionDetail.employee?.nom ?? ''}`.trim() || '—'}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{t.missionDeadline}</dt>
            <dd className="text-[16px] font-medium text-[#f0f3f6]">{missionDetail.end_date}</dd>
          </div>
        </dl>

        <section className="mt-6 text-left">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">{t.missionDetailLocationPreview}</h3>
          <div className="mt-2 space-y-3">
            <MissionDetailStaticMap lat={missionDetail.latitude} lng={missionDetail.longitude} status={missionDetail.status} />
            <p className="text-[13px] text-[#9fb4cb]">
              {missionDetail.latitude != null && missionDetail.longitude != null
                ? `${Number(missionDetail.latitude).toFixed(5)}, ${Number(missionDetail.longitude).toFixed(5)}`
                : '—'}
            </p>
            <button
              type="button"
              className={`${btn} w-full max-w-xs border-[#4f95ff]/40 text-[#cfe8ff]`}
              onClick={() => {
                setMissionDetail(null);
                window.requestAnimationFrame(() => focusMissionOnMainMap(missionDetail));
              }}
            >
              {t.missionViewOnMainMap}
            </button>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/[0.06] pt-6">
          <button type="button" className={btn} onClick={() => openMissionEditor(missionDetail)}>
            {t.missionEditFromDetail}
          </button>
          <button type="button" className={btn} onClick={() => setMissionDetail(null)}>
            {t.missionCloseDetail}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionDetailModal;
