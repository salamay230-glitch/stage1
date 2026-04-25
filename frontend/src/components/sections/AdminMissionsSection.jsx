import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { btn, glass } from '../../constants/dashboardStyles';
import FormSelect from '../common/FormSelect';
import MissionStatusBadge from '../missions/MissionStatusBadge';
import { MapPlacePicker, MissionDetailStaticMap, MissionMapPopupBody, draftLocationIcon, markerIcon } from '../dashboard/MissionMapComponents';
import MissionDeleteDialog from '../dashboard/MissionDeleteDialog';
import FormInput from '../common/FormInput';

const AdminMissionsSection = ({
  t,
  isRTL,
  glass,
  btn,
  missionMapSectionRef,
  mainMapRef,
  missionsWithCoords,
  center,
  openMissionEditor,
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
  missionDetail,
  setMissionDetail,
  missionDeleteTarget,
  setMissionDeleteTarget,
  missionPanelOpen,
  missionEditingId,
  missionForm,
  setMissionForm,
  locationPickerOpen,
  setLocationPickerOpen,
  pickerPosition,
  setPickerPosition,
  saveMission,
  employees,
  tomorrowDate,
  CARTO_DARK,
  CARTO_LABELS
}) => {
  return (
    <section className="space-y-4">
      {/* Mission Map */}
      <section ref={missionMapSectionRef} className={`${glass} w-full border border-white/[0.08]`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-left text-[24px] font-semibold tracking-[0.04em] text-[#f0f3f6]">{t.missionMapTitle}</h2>
          <button type="button" className={btn} onClick={() => openMissionEditor(null)}>
            {t.addMission}
          </button>
        </div>
        <div className="h-[500px] w-full overflow-hidden rounded-[12px] border border-white/[0.1]">
          <MapContainer
            key={`map-${missionsWithCoords.length}-${missionsWithCoords[0]?.id ?? 'none'}`}
            center={center}
            zoom={6}
            whenReady={(event) => {
              mainMapRef.current = event.target;
            }}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer attribution="&copy; OpenStreetMap & CARTO" url={CARTO_DARK} />
            <TileLayer attribution="" url={CARTO_LABELS} opacity={0.22} />
            <MarkerClusterGroup chunkedLoading>
              {missionsWithCoords.map((m) => (
                <Marker key={m.id} position={[Number(m.latitude), Number(m.longitude)]} icon={markerIcon(m.status)}>
                  <Popup>
                    <MissionMapPopupBody mission={m} t={t} onViewFullDetails={() => openMissionDetailPanel(m)} />
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </section>

      {/* Mission List */}
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
                  className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,0.95fr)_auto] gap-3 px-4 py-3 text-left transition hover:bg-white/[0.05] focus:bg-white/[0.05] focus:outline-none"
                >
                  <div>
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
                    <button
                      type="button"
                      className={btn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openMissionDetailPanel(m);
                      }}
                    >
                      {t.missionEdit}
                    </button>
                    <button
                      type="button"
                      className={btn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMissionDeleteTarget(m);
                      }}
                    >
                      {t.missionDelete}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </section>
  );
};

export default AdminMissionsSection;
