import { Check } from 'lucide-react';
import {
  VEHICLE_COLOR_IMAGES,
  VEHICLE_COLOR_OPTIONS,
  VehicleColorKey,
  VehicleId,
} from '../data/vehicles';

interface VehicleColorShowcaseProps {
  vehicleId: VehicleId;
  vehicleName: string;
  selectedColor: VehicleColorKey;
  onSelectColor: (color: VehicleColorKey) => void;
}

export function VehicleColorShowcase({
  vehicleId,
  vehicleName,
  selectedColor,
  onSelectColor,
}: VehicleColorShowcaseProps) {
  const activeOption =
    VEHICLE_COLOR_OPTIONS.find((c) => c.key === selectedColor) ??
    VEHICLE_COLOR_OPTIONS[0];
  const colorImages = VEHICLE_COLOR_IMAGES[vehicleId];

  return (
    <div className="mb-4">
      <div
        className="vf3-stage"
        role="img"
        aria-label={`${vehicleName} in ${activeOption.name}`}
      >
        {VEHICLE_COLOR_OPTIONS.map((option) => {
          const isActive = option.key === selectedColor;
          return (
            <img
              key={option.key}
              src={colorImages[option.key]}
              alt={`${vehicleName} — ${option.name}`}
              referrerPolicy="no-referrer"
              className="vf3-stage-img"
              style={{
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 2 : 1,
              }}
            />
          );
        })}

        <div
          className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white/92 px-3 py-1.5 shadow-sm backdrop-blur-sm"
          data-testid="selected-color-badge"
        >
          <span
            className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0"
            style={{ backgroundColor: activeOption.hex }}
          />
          <span className="text-xs font-semibold text-[#0A1830]">
            {activeOption.name}
          </span>
          <span className="text-[11px] text-[#5B6B80]">
            ({activeOption.finish})
          </span>
        </div>
      </div>

      <div className="mt-3.5 rounded-xl border border-[#E2E7EF] bg-[#F8FAFC] p-3">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-[#0A1830] uppercase">
            Exterior Color
          </span>
          <span
            className="text-xs font-semibold text-[#0A1830]"
            data-testid="selected-color-label"
          >
            Selected: {activeOption.name}
          </span>
        </div>

        <div
          className="grid grid-cols-4 gap-2"
          role="radiogroup"
          aria-label={`Choose ${vehicleName} exterior color`}
        >
          {VEHICLE_COLOR_OPTIONS.map((option) => {
            const isSelected = option.key === selectedColor;
            return (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Select ${option.name}`}
                data-color={option.key}
                onClick={() => onSelectColor(option.key)}
                className={`vf3-swatch-btn flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2 text-center cursor-pointer ${
                  isSelected
                    ? 'border-[#1877f2] bg-white shadow-sm ring-2 ring-[#1877f2]/25'
                    : 'border-[#E2E7EF] bg-white/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full border shadow-inner"
                  style={{
                    backgroundColor: option.hex,
                    borderColor: isSelected ? '#1877f2' : option.borderHex,
                  }}
                >
                  {isSelected && (
                    <Check
                      size={15}
                      strokeWidth={3}
                      style={{ color: option.textOnSwatch }}
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span
                  className={`text-xs leading-none ${
                    isSelected
                      ? 'font-bold text-[#0A1830]'
                      : 'font-medium text-[#5B6B80]'
                  }`}
                >
                  {option.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
