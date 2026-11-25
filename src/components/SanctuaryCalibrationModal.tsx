// src/components/SanctuaryCalibrationModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Home, 
  Layers, 
  Check, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Sliders
} from 'lucide-react';
import { 
  SanctuaryProfile, 
  BUILDING_DEFINITIONS, 
  FLOOR_DEFINITIONS, 
  ROOM_ZONE_DEFINITIONS, 
  saveSanctuaryProfile,
  BuildingType,
  FloorLevel,
  RoomZone
} from '../engine/sanctuary-engine';

interface SanctuaryCalibrationModalProps {
  currentProfile: SanctuaryProfile;
  outdoorPm25: number;
  onSave: (updated: SanctuaryProfile) => void;
  onClose: () => void;
}

export const SanctuaryCalibrationModal: React.FC<SanctuaryCalibrationModalProps> = ({
  currentProfile,
  outdoorPm25,
  onSave,
  onClose,
}) => {
  const [buildingType, setBuildingType] = useState<BuildingType>(currentProfile.buildingType);
  const [floorLevel, setFloorLevel] = useState<FloorLevel>(currentProfile.floorLevel);
  const [roomZone, setRoomZone] = useState<RoomZone>(currentProfile.roomZone);
  const [roomVolumeM3, setRoomVolumeM3] = useState<number>(currentProfile.roomVolumeM3);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelectZone = (zone: RoomZone) => {
    setRoomZone(zone);
    setRoomVolumeM3(ROOM_ZONE_DEFINITIONS[zone].defaultVolume);
  };

  const handleSave = () => {
    const updated: SanctuaryProfile = {
      buildingType,
      floorLevel,
      roomZone,
      roomVolumeM3,
      customZoneName: `${FLOOR_DEFINITIONS[floorLevel].title} ${ROOM_ZONE_DEFINITIONS[roomZone].title}`,
      isCustomized: true,
    };
    saveSanctuaryProfile(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Preview estimated indoor PM2.5 based on building parameters
  const bldg = BUILDING_DEFINITIONS[buildingType];
  const floor = FLOOR_DEFINITIONS[floorLevel];
  const effectiveOutdoor = Math.round(outdoorPm25 * floor.exposureMultiplier);
  const estimatedIndoorUnfiltered = Math.round(effectiveOutdoor * (bldg.penetration * 0.72));
  const estimatedIndoorWithCorsi = Math.max(12, Math.round(estimatedIndoorUnfiltered * 0.18));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sanctuary-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d253d]/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e3e8ee] p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#533afd]/10 flex items-center justify-center text-[#533afd]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#533afd]">
                  Retention Moat • Microclimate Personalization
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Saves to Device
                </span>
              </div>
              <h2 id="sanctuary-modal-title" className="font-heading-md text-xl sm:text-2xl text-[#0d253d] font-bold">
                Calibrate Your Home Sanctuary
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full hover:bg-[#f6f9fc] text-[#64748d] hover:text-[#0d253d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="font-body-md text-xs sm:text-sm text-[#475569] leading-relaxed mb-6">
          Generic weather apps only report ambient rooftop sensors 5 km away. ZeroBon personalizes your indoor exposure by calculating exact boundary-layer height, floor elevation, and envelope air infiltration.
        </p>

        {/* 1. Building Typology */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold text-[#0d253d] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#533afd]" />
            <span>1. Building Architecture & Window Envelope</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(BUILDING_DEFINITIONS) as BuildingType[]).map((key) => {
              const def = BUILDING_DEFINITIONS[key];
              const isSelected = buildingType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBuildingType(key)}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'border-[#533afd] bg-[#533afd]/5 ring-2 ring-[#533afd]/20 shadow-sm'
                      : 'border-[#e3e8ee] hover:border-[#b9b9f9] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#0d253d]">{def.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#533afd]" />}
                  </div>
                  <p className="text-[11px] text-[#64748d] leading-snug mb-2">{def.subtitle}</p>
                  <span className="text-[10px] text-[#533afd] font-medium block">
                    Penetration: {Math.round(def.penetration * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Floor Level Elevation */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold text-[#0d253d] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#533afd]" />
            <span>2. Floor Level & Inversion Lid Elevation</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(FLOOR_DEFINITIONS) as FloorLevel[]).map((key) => {
              const def = FLOOR_DEFINITIONS[key];
              const isSelected = floorLevel === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFloorLevel(key)}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'border-[#533afd] bg-[#533afd]/5 ring-2 ring-[#533afd]/20 shadow-sm'
                      : 'border-[#e3e8ee] hover:border-[#b9b9f9] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#0d253d]">{def.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#533afd]" />}
                  </div>
                  <p className="text-[11px] text-[#64748d] leading-snug mb-2">{def.subtitle}</p>
                  <span className={`text-[10px] font-medium block ${
                    def.exposureMultiplier > 1 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {def.note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Room Zone & Volume */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#0d253d] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#533afd]" />
              <span>3. Primary Sanctuary Zone</span>
            </label>
            <span className="text-xs font-tabular font-bold text-[#533afd]">
              {roomVolumeM3} m³ (~{Math.round(roomVolumeM3 / 2.7)} m²)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {(Object.keys(ROOM_ZONE_DEFINITIONS) as RoomZone[]).map((key) => {
              const def = ROOM_ZONE_DEFINITIONS[key];
              const isSelected = roomZone === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectZone(key)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    isSelected
                      ? 'border-[#533afd] bg-[#533afd] text-white shadow-sm'
                      : 'border-[#e3e8ee] text-[#475569] hover:bg-[#f6f9fc]'
                  }`}
                >
                  {def.title}
                </button>
              );
            })}
          </div>

          <div className="px-2">
            <input
              type="range"
              aria-label="Room volume in cubic meters"
              min="40"
              max="320"
              step="5"
              value={roomVolumeM3}
              onChange={(e) => setRoomVolumeM3(Number(e.target.value))}
              className="w-full accent-[#533afd] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#475569] mt-1">
              <span>Studio (40 m³)</span>
              <span>Standard (90 m³)</span>
              <span>Large Hall (320 m³)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Microclimate Prediction Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0] mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0d253d]">
              <Sparkles className="w-4 h-4 text-[#533afd]" />
              <span>Predicted Microclimate for Your Sanctuary</span>
            </div>
            <span className="text-[11px] text-[#64748d]">Outdoor: {outdoorPm25} µg/m³</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-white border border-[#e3e8ee] shadow-sm">
              <span className="text-[10px] text-[#64748d] uppercase tracking-wider block mb-0.5">
                Floor Exposure
              </span>
              <span className="text-sm font-bold text-[#0d253d]">
                {effectiveOutdoor} µg/m³
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#e3e8ee] shadow-sm">
              <span className="text-[10px] text-[#64748d] uppercase tracking-wider block mb-0.5">
                Unfiltered Air
              </span>
              <span className="text-sm font-bold text-amber-600">
                ~{estimatedIndoorUnfiltered} µg/m³
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
              <span className="text-[10px] text-emerald-800 uppercase tracking-wider block mb-0.5">
                With $35 Purifier
              </span>
              <span className="text-sm font-bold text-emerald-700">
                ~{estimatedIndoorWithCorsi} µg/m³
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e3e8ee]">
          <div className="flex items-center gap-1.5 text-xs text-[#64748d]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted locally in browser</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#e3e8ee] text-[#475569] text-xs font-semibold hover:bg-[#f6f9fc] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#533afd] hover:bg-[#432dd7] text-white text-xs font-bold transition-all shadow-md shadow-[#533afd]/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Sanctuary Calibrated!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Sanctuary Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
