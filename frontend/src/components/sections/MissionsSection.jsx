import { glass } from '../../constants/dashboardStyles';
import FormSelect from '../common/FormSelect';
import MissionStatusBadge from '../missions/MissionStatusBadge';
import MissionDeleteDialog from '../dashboard/MissionDeleteDialog';

const MissionsSection = ({
  t,
  isRTL,
  glass,
  statusFilter,
  setStatusFilter,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  monthOptions,
  yearOptions,
  filteredMissions,
  openMissionDetailPanel,
  missionDeleteTarget,
  setMissionDeleteTarget,
  updateMissionStatus,
  pushToast,
  loadData
}) => {
  return (
    <section className={`${glass} border border-white/[0.08]`}>
      <h3 className="mb-4 text-left text-[22px] font-semibold tracking-[0.04em] text-[#f0f3f6]">{t.missionListTitle}</h3>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <FormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
          <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
          <option value="in_progress">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</option>
          <option value="completed">{isRTL ? 'مكتملة' : 'Completed'}</option>
        </FormSelect>
        <FormSelect value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="all">{isRTL ? 'كل الشهور' : 'All Months'}</option>
          {monthOptions.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </FormSelect>
        <FormSelect value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="all">{isRTL ? 'كل السنوات' : 'All Years'}</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </FormSelect>
      </div>
      <div className="overflow-x-auto rounded-[12px] border border-white/[0.06] bg-[#061f33]/40 backdrop-blur-md">
        <div className="min-w-[720px] divide-y divide-white/[0.08]">
          <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,0.95fr)_auto] gap-3 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8aa3b8]">
            <span>{t.title}</span>
            <span>{t.missionAssignedTo}</span>
            <span>{t.missionStatus}</span>
            <span className="text-right">{t.missionActions}</span>
          </div>
          {filteredMissions.length === 0 ? (
            <p className="px-4 py-8 text-left text-[14px] text-[#9fb4cb]">{t.missionListEmpty}</p>
          ) : (
            filteredMissions.map((m) => (
              <div
                key={m.id}
                role="button"
                tabIndex={0}
                onClick={() => openMissionDetailPanel(m)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openMissionDetailPanel(m);
                  }
                }}
                className="grid cursor-pointer grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,0.95fr)_auto] items-center gap-3 px-4 py-3.5 text-left text-[#d7e2ef] outline-none transition hover:bg-white/[0.055] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_22px_-10px_rgba(0,0,0,0.35)] focus-visible:ring-2 focus-visible:ring-[#4f95ff]/40"
              >
                <div className="min-w-0 pointer-events-none">
                  <p className="truncate text-[15px] font-semibold tracking-[0.02em] text-[#f0f3f6]">{m.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[12px] leading-snug text-[#8aa3b8]">{m.description}</p>
                </div>
                <p className="truncate text-[14px] tracking-[0.01em] pointer-events-none">
                  {`${m.employee?.prenom ?? ''} ${m.employee?.nom ?? ''}`.trim() || '—'}
                </p>
                <div className="min-w-0 pointer-events-none">
                  <MissionStatusBadge status={m.status} t={t} />
                </div>
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <FormSelect
                    variant="status"
                    value={m.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      try {
                        await updateMissionStatus(m.id, newStatus);
                        pushToast('Statut mis à jour !');
                        loadData();
                      } catch {
                        pushToast('Erreur lors de la mise à jour du statut.');
                      }
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </FormSelect>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default MissionsSection;
