// src/components/SanctuaryCalibrationModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import {
  SanctuaryProfile,
  BUILDING_DEFINITIONS,
  FLOOR_DEFINITIONS,
  ROOM_ZONE_DEFINITIONS,
  saveSanctuaryProfile,
  BuildingType,
  FloorLevel,
  RoomZone,
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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useAccessibleModal(true, onClose);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

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
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 600);
  };

  const bldg = BUILDING_DEFINITIONS[buildingType];
  const floor = FLOOR_DEFINITIONS[floorLevel];
  const effectiveOutdoor = Math.round(outdoorPm25 * floor.exposureMultiplier);
  const estimatedIndoorUnfiltered = Math.round(effectiveOutdoor * (bldg.penetration * 0.72));
  const estimatedIndoorWithCorsi = Math.max(12, Math.round(estimatedIndoorUnfiltered * 0.18));

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sanctuary-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d253d]/70 backdrop-blur-xl animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(83,58,253,0.18)] border border-white/80 p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-[#0d253d]">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[#e3e8ee] mb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#533afd] block">
              ZeroBon home calibration
            </span>
            <h2
              id="sanctuary-modal-title"
              className="font-heading-md text-2xl text-[#0d253d] font-bold tracking-tight"
            >
              Calibrate your home sanctuary
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="px-3 py-1.5 rounded-lg hover:bg-[#f6f9fc] text-[#475569] hover:text-[#0d253d] text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

        <p className="font-body-md text-xs sm:text-sm text-[#475569] leading-relaxed mb-7">
          Ambient weather stations sit kilometers from your bedroom. Calibrate your building envelope, floor elevation, and room volume so ZeroBon calculates your actual indoor exposure.
        </p>

        {/* Building Architecture */}
        <div className="space-y-3 mb-7">
          <span className="text-xs font-semibold text-[#0d253d] block">
            Building architecture and window envelope
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(BUILDING_DEFINITIONS) as BuildingType[]).map((key) => {
              const def = BUILDING_DEFINITIONS[key];
              const isSelected = buildingType === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`Select ${def.title} building type`}
                  onClick={() => setBuildingType(key)}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#533afd] bg-[#533afd]/[0.05] ring-2 ring-[#533afd]/20 shadow-xs'
                      : 'border-[#e3e8ee] hover:border-[#b9b9f9] bg-white'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-[#0d253d] block mb-1">
                      {def.title}
                    </span>
                    <p className="text-[11px] text-[#475569] leading-snug mb-3">
                      {def.subtitle}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#533afd] font-semibold font-tabular block">
                    Penetration: {Math.round(def.penetration * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floor Level Elevation */}
        <div className="space-y-3 mb-7">
          <span className="text-xs font-semibold text-[#0d253d] block">
            Floor level and inversion elevation
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(FLOOR_DEFINITIONS) as FloorLevel[]).map((key) => {
              const def = FLOOR_DEFINITIONS[key];
              const isSelected = floorLevel === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`Select ${def.title} floor elevation`}
                  onClick={() => setFloorLevel(key)}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#533afd] bg-[#533afd]/[0.05] ring-2 ring-[#533afd]/20 shadow-xs'
                      : 'border-[#e3e8ee] hover:border-[#b9b9f9] bg-white'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-[#0d253d] block mb-1">
                      {def.title}
                    </span>
                    <p className="text-[11px] text-[#475569] leading-snug mb-3">
                      {def.subtitle}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-[#533afd] block leading-snug">
                    {def.note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Sanctuary Zone & Volume */}
        <div className="space-y-3 mb-7">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0d253d]">
              Primary sanctuary zone
            </span>
            <span className="text-xs font-tabular font-bold text-[#533afd]">
              {roomVolumeM3} m³ · ~{Math.round(roomVolumeM3 / 2.7)} m²
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
                  aria-label={`Select ${def.title} room zone`}
                  onClick={() => handleSelectZone(key)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                    isSelected
                      ? 'border-[#533afd] bg-[#533afd] text-white shadow-xs'
                      : 'border-[#e3e8ee] text-[#475569] hover:bg-[#f6f9fc] hover:text-[#0d253d]'
                  }`}
                >
                  {def.title}
                </button>
              );
            })}
          </div>

          <div className="px-1">
            <input
              type="range"
              aria-label="Room volume in cubic meters"
              aria-valuemin={40}
              aria-valuemax={320}
              aria-valuenow={roomVolumeM3}
              aria-valuetext={`${roomVolumeM3} cubic meters, approximately ${Math.round(roomVolumeM3 / 2.7)} square meters`}
              min="40"
              max="320"
              step="5"
              value={roomVolumeM3}
              onChange={(e) => setRoomVolumeM3(Number(e.target.value))}
              className="w-full accent-[#533afd] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#475569] mt-1">
              <span>Studio (40 m³)</span>
              <span>Standard (90 m³)</span>
              <span>Large hall (320 m³)</span>
            </div>
          </div>
        </div>

        {/* Predicted Indoor Microclimate */}
        <div className="p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] mb-6">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-[#0d253d]">
              Predicted indoor microclimate
            </span>
            <span className="text-xs font-tabular text-[#475569]">
              Outdoor reference: {outdoorPm25} µg/m³
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#e3e8ee]">
              <span className="text-[11px] text-[#475569] block mb-1">
                Floor exposure
              </span>
              <span className="text-base font-bold font-tabular text-[#0d253d]">
                {effectiveOutdoor} µg/m³
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#e3e8ee]">
              <span className="text-[11px] text-[#475569] block mb-1">
                Unfiltered indoor air
              </span>
              <span className="text-base font-bold font-tabular text-[#0d253d]">
                ~{estimatedIndoorUnfiltered} µg/m³
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#533afd]/[0.06] border border-[#533afd]/30">
              <span className="text-[11px] text-[#533afd] font-semibold block mb-1">
                With $35 purifier
              </span>
              <span className="text-base font-bold font-tabular text-[#0d253d]">
                ~{estimatedIndoorWithCorsi} µg/m³
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e3e8ee]">
          <span className="text-xs text-[#475569]">
            Saved locally on this device
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Cancel sanctuary calibration"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#e3e8ee] text-[#475569] text-xs font-semibold hover:bg-[#f6f9fc] hover:text-[#0d253d] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              aria-label="Save sanctuary profile to browser"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-semibold transition-all shadow-sm"
            >
              {savedSuccess ? 'Saved to device' : 'Save sanctuary profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
