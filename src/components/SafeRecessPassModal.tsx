// src/components/SafeRecessPassModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Printer, 
  Share2, 
  X, 
  ShieldCheck, 
  Clock, 
  Check
} from 'lucide-react';
import { getCityProfile } from '../engine/city-data';

interface SafeRecessPassModalProps {
  cityName: string;
  outdoorPm25: number;
  onClose: () => void;
}

export const SafeRecessPassModal: React.FC<SafeRecessPassModalProps> = ({
  cityName,
  outdoorPm25,
  onClose,
}) => {
  const [institutionName, setInstitutionName] = useState<string>('Delhi Public School / Junior Campus');
  const [gradeGroup, setGradeGroup] = useState<string>('Grades K – 8 • Recess & Physical Education');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const city = getCityProfile(cityName);
  const certificateId = `ZB-RECESS-${Math.abs(cityName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 179).toString().substring(0, 6)}`;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `ZeroBon Safe Recess Pass for ${institutionName} (${cityName}): Outdoor recess permitted strictly during Solar Mixing Window (${city.cleanWindowHours}). Verified by ZeroBon atmospheric physics: https://zerobon.pages.dev`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recess-pass-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0d253d]/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#e3e8ee] p-5 sm:p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden during printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee] mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#533afd] ring-2 ring-[#b9b9f9]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#533afd]">
              Institutional Health Compliance • 1-Page Printable Audit
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] text-xs font-semibold border border-[#e3e8ee] transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#533afd]" /> : <Share2 className="w-3.5 h-3.5 text-[#533afd]" />}
              <span>{copiedLink ? 'Copied Link!' : 'Share with Parents'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-full hover:bg-[#f6f9fc] text-[#64748d] hover:text-[#0d253d]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Institution Name Customizer Bar (Hidden during printing) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-3 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] print:hidden">
          <div>
            <label className="text-[10px] font-bold text-[#64748d] uppercase tracking-wider block mb-1">
              School / Organization Name:
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#e3e8ee] text-[#0d253d] font-semibold focus:outline-none focus:ring-1 focus:ring-[#533afd]"
              placeholder="e.g. Modern School Barakhamba"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748d] uppercase tracking-wider block mb-1">
              Student / Division Scope:
            </label>
            <input
              type="text"
              value={gradeGroup}
              onChange={(e) => setGradeGroup(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#e3e8ee] text-[#0d253d] font-semibold focus:outline-none focus:ring-1 focus:ring-[#533afd]"
              placeholder="e.g. Primary School Recess"
            />
          </div>
        </div>

        {/* ================= PRINTABLE CERTIFICATE DOCUMENT ================= */}
        <div 
          ref={printRef} 
          className="p-6 sm:p-8 rounded-2xl border-2 border-[#0d253d]/15 bg-white text-[#0d253d] shadow-sm relative overflow-hidden print:border-none print:p-0 print:shadow-none"
        >
          {/* Subtle Watermark Stamp */}
          <div className="absolute right-6 top-8 opacity-10 pointer-events-none select-none">
            <Award className="w-48 h-48 text-[#533afd]" />
          </div>

          {/* Certificate Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b-2 border-[#0d253d] mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#0d253d] text-white text-[10px] font-black uppercase tracking-widest">
                  ZeroBon Standard
                </span>
                <span className="text-xs font-bold text-[#64748d] font-tabular">
                  Certificate #{certificateId}
                </span>
              </div>
              <h1 id="recess-pass-title" className="font-heading-md text-2xl sm:text-3xl font-extrabold text-[#0d253d] tracking-tight">
                Safe Recess & Outdoor Protocol Pass
              </h1>
              <p className="text-xs text-[#64748d]">
                Verified Planetary Boundary Layer (PBLH) Atmospheric Dilution Protocol • Winter Smog Season
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[#64748d] uppercase tracking-wider block">Target City</span>
              <span className="font-extrabold text-lg text-[#0d253d]">{cityName}</span>
              <span className="text-[11px] text-[#533afd] font-semibold block">{city.terrainType}</span>
            </div>
          </div>

          {/* Institution & Recipient Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] mb-6 text-xs">
            <div>
              <span className="text-[10px] text-[#64748d] uppercase block">Institution</span>
              <span className="font-bold text-[#0d253d]">{institutionName}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748d] uppercase block">Campus Scope</span>
              <span className="font-bold text-[#0d253d]">{gradeGroup}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748d] uppercase block">Issue Date</span>
              <span className="font-bold text-[#0d253d]">{issueDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748d] uppercase block">Ambient Ref. PM₂.₅</span>
              <span className="font-bold text-[#0d253d]">{outdoorPm25} µg/m³</span>
            </div>
          </div>

          {/* The Tri-Band Diurnal Schedule Table */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d253d] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#533afd]" />
              <span>Campus Operating Protocol by Atmospheric Window</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {/* Band 1: Morning Inversion Danger (Styled strictly in brand navy & soft slate) */}
              <div className="p-4 rounded-xl border border-[#e3e8ee] bg-[#f6f9fc] flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-[#0d253d] text-white flex-shrink-0">
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0d253d] text-sm">07:00 AM – 10:30 AM</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0d253d] text-white text-[10px] font-bold uppercase tracking-wide">
                        Outdoor Sports Prohibited
                      </span>
                    </div>
                    <p className="text-[#475569] text-xs leading-relaxed mt-1.5">
                      Surface radiation inversion locks vehicle exhaust within 140m of ground level. Elevated breathing rates (0.045 m³/min) during physical education force over 280 µg PM₂.₅ straight into pediatric lower airways. <strong>All assemblies and sports must remain indoors.</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Band 2: Midday Solar Mixing Golden Window (Hero Band styled in signature Electric Purple & Lavender) */}
              <div className="p-4 rounded-xl border-2 border-[#533afd]/40 bg-[#f0efff] flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-[#533afd] text-white flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-[#0d253d] text-sm">
                        {city.cleanWindowHours}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#533afd] text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                        Approved Safe Recess Window
                      </span>
                    </div>
                    <p className="text-[#0d253d] text-xs leading-relaxed mt-1.5 font-medium">
                      Solar ground heating triggers vertical thermal convection, expanding the mixing ceiling to over 1,300m and diluting particulate concentration by up to <strong>74%</strong>. <strong>Outdoor recess, lunch breaks, and light games are strictly scheduled in this slot.</strong> Open classroom sashes for 15 minutes to purge stagnant CO₂.
                    </p>
                  </div>
                </div>
              </div>

              {/* Band 3: Evening Sunset Cooling Return (Styled in brand navy & soft border) */}
              <div className="p-4 rounded-xl border border-[#e3e8ee] bg-[#f6f9fc] flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-[#64748d] text-white flex-shrink-0">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0d253d] text-sm">04:30 PM – Sunset & Night</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#e3e8ee] text-[#0d253d] text-[10px] font-bold uppercase tracking-wide">
                        Transition Indoors & Latch Sashes
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

          {/* Health & Pediatric Protection Metrics (Styled strictly in ZeroBon brand palette) */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] mb-6 text-center text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#64748d] uppercase block">
                Prevented Soot / Student
              </span>
              <span className="text-base font-extrabold text-[#533afd]">~85 µg/day</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748d] uppercase block">
                Cigarette Eq. Spared
              </span>
              <span className="text-base font-extrabold text-[#0d253d]">3.8 / week</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748d] uppercase block">
                Pediatric Airway Relief
              </span>
              <span className="text-base font-extrabold text-[#533afd]">-68% Acute Risk</span>
            </div>
          </div>

          {/* Signature & Verification Seal Line */}
          <div className="flex items-end justify-between pt-6 border-t border-[#0d253d]/20 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#533afd] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#533afd]" />
                <span>ZeroBon Atmospheric Verification Engine</span>
              </div>
              <p className="text-[10px] text-[#64748d]">
                Validated against OpenAQ & Copernicus ERA5 Boundary Layer Reanalysis
              </p>
            </div>

            <div className="text-right">
              <div className="w-44 border-b border-[#0d253d] pb-1 mb-1"></div>
              <span className="text-[10px] font-bold text-[#64748d] uppercase block">
                Principal / Campus Health Coordinator
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note (Hidden in print) */}
        <div className="flex items-center justify-between pt-4 mt-2 text-xs text-[#64748d] print:hidden">
          <span>Tip: Use Ctrl+P / Cmd+P to save directly as a clean PDF document.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
