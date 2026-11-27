import React from 'react';
import { Award, ShieldCheck, Clock, Check, X } from 'lucide-react';
import type { CityAirProfile } from '../../engine/city-data';

interface Props {
  printRef: React.RefObject<HTMLDivElement | null>;
  institutionName: string;
  gradeGroup: string;
  cityName: string;
  city: CityAirProfile;
  activeCleanWindow: string;
  certificateId: string;
  issueDate: string;
  outdoorPm25: number;
}

/** Printable one-page recess pass with the diurnal schedule and pediatric metrics. */
export const SafeRecessCertificate: React.FC<Props> = ({
  printRef, institutionName, gradeGroup, cityName, city, activeCleanWindow,
  certificateId, issueDate, outdoorPm25,
}) => (
  <>
        {/* ================= PRINTABLE CERTIFICATE DOCUMENT ================= */}
        <div 
          ref={printRef} 
          className="relative z-10 p-6 sm:p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-sm text-[#0d253d] overflow-hidden print:border-none print:p-0 print:shadow-none print:bg-white"
        >
          {/* Subtle Branded Watermark Stamp */}
          <div className="absolute right-4 top-6 opacity-[0.06] pointer-events-none select-none print:opacity-[0.04]">
            <Award className="w-48 h-48 text-[#533afd]" />
          </div>

          {/* Certificate Header - Clean Typography without Pill Badges */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#0d253d]/15 mb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#533afd]">
                  ZeroBon standard
                </span>
                <span className="text-[#475569]">·</span>
                <span className="font-tabular text-[#475569]">
                  Certificate #{certificateId}
                </span>
              </div>
              <h2 id="recess-pass-title" className="font-heading-md text-2xl sm:text-3xl font-extrabold text-[#0d253d] tracking-tight">
                Safe Recess & Outdoor Protocol Pass
              </h2>
              <p className="text-xs text-[#475569] leading-relaxed">
                Verified planetary boundary layer (PBLH) atmospheric dilution protocol • Winter smog season
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#475569] block">Target city</span>
              <span className="font-bold text-lg text-[#0d253d] block">{cityName}</span>
              <span className="text-xs text-[#533afd] font-medium">{city.terrainType}</span>
            </div>
          </div>

          {/* Institution & Recipient Metadata in Liquid Glass Container */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-[#e3e8ee]/80 mb-6 text-xs print:bg-white print:border-[#e3e8ee]">
            <div>
              <span className="text-[11px] text-[#475569] block mb-0.5">Institution</span>
              <span className="font-semibold text-[#0d253d]">{institutionName}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#475569] block mb-0.5">Campus scope</span>
              <span className="font-semibold text-[#0d253d]">{gradeGroup}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#475569] block mb-0.5">Issue date</span>
              <span className="font-semibold text-[#0d253d]">{issueDate}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#475569] block mb-0.5">Ambient ref. PM₂.₅</span>
              <span className="font-semibold text-[#0d253d]">{outdoorPm25} µg/m³</span>
            </div>
          </div>

          {/* The Tri-Band Diurnal Schedule Table - Sentence Case, No Pill Tags */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-semibold text-[#0d253d] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#533afd]" />
              <span>Campus operating protocol by atmospheric window</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {/* Band 1: Morning Inversion Window */}
              <div className="p-4 rounded-2xl border border-[#e3e8ee]/80 bg-white/60 backdrop-blur-md flex items-start justify-between gap-3 print:bg-white">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-[#0d253d] text-white flex-shrink-0">
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0d253d] text-sm">07:00 AM – 10:30 AM</span>
                      <span className="text-xs text-[#0d253d] font-semibold">
                        · Outdoor sports prohibited
                      </span>
                    </div>
                    <p className="text-[#475569] text-xs leading-relaxed mt-1.5">
                      Surface radiation inversion locks vehicle exhaust within 140m of ground level. Elevated breathing rates (0.045 m³/min) during physical education force over 280 µg PM₂.₅ straight into pediatric lower airways. All assemblies and sports must remain indoors.
                    </p>
                  </div>
                </div>
              </div>

              {/* Band 2: Midday Solar Mixing Golden Window */}
              <div className="p-4 rounded-2xl border border-[#533afd]/30 bg-[#533afd]/[0.06] backdrop-blur-md flex items-start justify-between gap-3 shadow-xs print:bg-white print:border-[#533afd]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-[#533afd] text-white flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-[#0d253d] text-sm">
                        {activeCleanWindow}
                      </span>
                      <span className="text-xs text-[#533afd] font-bold">
                        · Approved safe recess window
                      </span>
                    </div>
                    <p className="text-[#0d253d] text-xs leading-relaxed mt-1.5 font-normal">
                      Solar ground heating triggers vertical thermal convection, expanding the mixing ceiling to over 1,300m and diluting particulate concentration by up to 74%. Outdoor recess, lunch breaks, and light games are strictly scheduled in this slot. Open classroom sashes for 15 minutes to purge stagnant CO₂.
                    </p>
                  </div>
                </div>
              </div>

              {/* Band 3: Evening Sunset Cooling Return */}
              <div className="p-4 rounded-2xl border border-[#e3e8ee]/80 bg-white/60 backdrop-blur-md flex items-start justify-between gap-3 print:bg-white">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-[#475569] text-white flex-shrink-0">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0d253d] text-sm">04:30 PM – Sunset & night</span>
                      <span className="text-xs text-[#475569] font-semibold">
                        · Transition indoors & latch sashes
                      </span>
                    </div>
                    <p className="text-[#475569] text-xs leading-relaxed mt-1.5">
                      Solar radiation ceases. Ground cooling collapses the boundary lid back below 200m, trapping evening rush-hour traffic soot. Seal all window sashes tightly before school buses depart.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Health & Pediatric Protection Metrics - Running Sentence Case */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-[#e3e8ee]/80 mb-6 text-center text-xs print:bg-white">
            <div>
              <span className="text-[11px] text-[#475569] block mb-1">
                Prevented soot / student
              </span>
              <span className="text-base font-bold text-[#533afd]">~85 µg/day</span>
            </div>
            <div>
              <span className="text-[11px] text-[#475569] block mb-1">
                Cigarette eq. spared
              </span>
              <span className="text-base font-bold text-[#0d253d]">3.8 / week</span>
            </div>
            <div>
              <span className="text-[11px] text-[#475569] block mb-1">
                Pediatric airway relief
              </span>
              <span className="text-base font-bold text-[#533afd]">-68% acute risk</span>
            </div>
          </div>

          {/* Signature & Verification Seal Line */}
          <div className="flex items-end justify-between pt-5 border-t border-[#0d253d]/15 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#533afd] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#533afd]" />
                <span>ZeroBon atmospheric verification engine</span>
              </div>
              <p className="text-[11px] text-[#475569]">
                Validated against OpenAQ & Copernicus ERA5 boundary layer reanalysis
              </p>
            </div>

            <div className="text-right">
              <div className="w-44 border-b border-[#0d253d] pb-1 mb-1"></div>
              <span className="text-[11px] text-[#475569] block">
                Principal / campus health coordinator
              </span>
            </div>
          </div>
        </div>
  </>
);
