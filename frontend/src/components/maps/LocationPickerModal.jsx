import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { MapPlacePicker, draftLocationIcon } from '../dashboard/MissionMapComponents';

const LocationPickerModal = ({
  locationPickerOpen,
  setLocationPickerOpen,
  pickerPosition,
  setPickerPosition,
  center,
  setMissionForm,
  btn,
  t,
}) => {
  if (!locationPickerOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#031726]/70 px-4 py-6 backdrop-blur-sm">
      <div className="ocp-glass-modal mx-auto flex h-full w-full max-w-5xl flex-col rounded-[14px] border border-white/[0.12] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-left text-[22px] font-semibold text-[#f0f3f6]">Local Selection Map</h3>
          <div className="flex gap-2">
            <button type="button" className={btn} onClick={() => setLocationPickerOpen(false)}>
              {t.cancel}
            </button>
            <button
              type="button"
              className={btn}
              disabled={!pickerPosition}
              onClick={() => {
                if (!pickerPosition) return;
                setMissionForm((prev) => ({
                  ...prev,
                  latitude: pickerPosition[0].toFixed(6),
                  longitude: pickerPosition[1].toFixed(6),
                }));
                setLocationPickerOpen(false);
              }}
            >
              Confirmer
            </button>
          </div>
        </div>
        <p className="mb-3 text-left text-[13px] text-[#9fb4cb]">
          Cliquez sur la carte pour choisir l'emplacement
        </p>
        <div className="h-[500px] w-full overflow-hidden rounded-[12px] border border-white/[0.1]">
          <MapContainer
            center={pickerPosition ?? center}
            zoom={6}
            className="h-full w-full font-ocp not-italic"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer attribution="&copy; OpenStreetMap & CARTO" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <TileLayer attribution="" url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" opacity={0.22} />
            <MapPlacePicker enabled onPick={(lat, lng) => setPickerPosition([lat, lng])} />
            {pickerPosition ? (
              <Marker position={pickerPosition} icon={draftLocationIcon}>
                <Popup>
                  <div className="text-left text-[13px] font-ocp not-italic text-[#d7e2ef]">
                    {pickerPosition[0].toFixed(6)}, {pickerPosition[1].toFixed(6)}
                  </div>
                </Popup>
              </Marker>
            ) : null}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
