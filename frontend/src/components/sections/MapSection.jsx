import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { glass } from '../../constants/dashboardStyles';
import { MapPlacePicker, MissionDetailStaticMap, MissionMapPopupBody, draftLocationIcon, markerIcon } from '../dashboard/MissionMapComponents';

const MapSection = ({
  t,
  glass,
  missionMapSectionRef,
  mainMapRef,
  missionsWithCoords,
  center,
  openMissionDetailPanel,
  CARTO_DARK,
  CARTO_LABELS
}) => {
  return (
    <section ref={missionMapSectionRef} className={`${glass} w-full border border-white/[0.08]`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-left text-[24px] font-semibold tracking-[0.04em] text-[#f0f3f6]">{t.missionMapTitle}</h2>
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
  );
};

export default MapSection;
