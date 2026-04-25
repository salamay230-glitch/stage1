import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import MissionStatusBadge from '../missions/MissionStatusBadge';
import { CARTO_DARK } from '../../constants/appConstants';

export const markerIcon = (s) =>
  L.divIcon({
    className: 'custom-mission-marker',
    html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:${
      s === 'completed' ? '#10b981' : s === 'in_progress' ? '#0ea5e9' : '#d4a574'
    };border:2px solid rgba(241,246,252,.85);box-shadow:0 0 0 3px rgba(8,20,35,.45)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

export const draftLocationIcon = L.divIcon({
  className: 'custom-draft-marker',
  html: '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#ef4444;border:2px solid #fee2e2;box-shadow:0 0 0 4px rgba(127,29,29,.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MissionStatusIcon({ status }) {
  const tone =
    status === 'completed'
      ? 'bg-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]'
      : status === 'in_progress'
        ? 'bg-[#0ea5e9] shadow-[0_0_0_2px_rgba(14,165,233,0.28)]'
        : 'bg-[#d4a574] shadow-[0_0_0_2px_rgba(212,165,116,0.28)]';
  return <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone}`} aria-hidden />;
}

export function MissionMapPopupBody({ mission, t, onViewFullDetails }) {
  const employeeLabel = `${mission.employee?.prenom ?? ''} ${mission.employee?.nom ?? ''}`.trim() || '—';
  return (
    <div className="font-ocp not-italic">
      <div className="flex items-start gap-3 p-4">
        <MissionStatusIcon status={mission.status} />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[16px] font-semibold leading-snug tracking-[0.02em] text-white">{mission.title}</p>
          <p className="mt-1.5 text-[12px] text-[#9fb4cb]">
            {t.missionAssignedTo}: <span className="text-[#d7e2ef]">{employeeLabel}</span>
          </p>
          <div className="mt-2">
            <MissionStatusBadge status={mission.status} t={t} />
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.08] px-4 py-3">
        <button
          type="button"
          onClick={onViewFullDetails}
          className="text-left text-[13px] font-semibold tracking-[0.02em] text-[#7ec8ff] underline decoration-[#7ec8ff]/35 underline-offset-4 transition hover:text-[#a8dbff]"
        >
          {t.missionViewFullDetails}
        </button>
      </div>
    </div>
  );
}

export function MissionDetailStaticMap({ lat, lng, status }) {
  const latN = Number(lat);
  const lngN = Number(lng);
  if (lat == null || lng == null || Number.isNaN(latN) || Number.isNaN(lngN)) {
    return <p className="text-left text-[14px] text-[#9fb4cb]">—</p>;
  }
  const position = [latN, lngN];
  return (
    <div className="h-[200px] w-full overflow-hidden rounded-[12px] border border-white/[0.1] bg-[#031726]">
      <MapContainer
        key={`detail-map-${latN}-${lngN}`}
        center={position}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
        className="z-0 h-full w-full font-ocp not-italic"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer attribution="&copy; OpenStreetMap & CARTO" url={CARTO_DARK} />
        <Marker position={position} icon={markerIcon(status)} />
      </MapContainer>
    </div>
  );
}

export function MapPlacePicker({ enabled, onPick }) {
  useMapEvents({
    click(event) {
      if (!enabled) return;
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}
