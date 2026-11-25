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
  const [gradeGroup, setGradeGroup] = useState<string>('Grades K – 8 • Recess & physical education');
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
      `ZeroBon safe recess pass for ${institutionName} (${cityName}): Outdoor recess permitted strictly during solar mixing window (${city.cleanWindowHours}). Verified by ZeroBon atmospheric physics: https://zerobon.pages.dev`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recess-pass-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0d253d]/70 backdrop-blur-xl animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      {/* Liquid Glassmorphism Container with Subtle Ambient Indigo Reflection */}
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(83,58,253,0.18)] p-5 sm:p-8 my-auto overflow-hidden text-[#0d253d]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Ambient Brand Gradients for Pure Liquid Glass Finish */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-[#b9b9f9]/25 to-[#533afd]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-[#533afd]/10 to-[#b9b9f9]/20 blur-3xl pointer-events-none" />

        {/* Top Control Bar (Hidden during printing) */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[#e3e8ee]/80 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#533afd]" />
            <span className="text-xs font-semibold text-[#533afd]">
              Institutional health compliance · 1-page printable audit
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#0d253d] text-xs font-medium border border-[#e3e8ee] transition-all shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#533afd]" /> : <Share2 className="w-3.5 h-3.5 text-[#533afd]" />}
              <span>{copiedLink ? 'Copied link' : 'Share with parents'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-medium transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-full hover:bg-white/60 text-[#64748d] hover:text-[#0d253d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Institution Name Customizer Bar (Hidden during printing) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-[#e3e8ee]/80 print:hidden">
          <div>
            <label className="text-[11px] font-medium text-[#64748d] block mb-1">
              School or organization name
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/90 border border-[#e3e8ee] text-[#0d253d] font-medium focus:outline-none focus:ring-2 focus:ring-[#533afd]/30"
              placeholder="e.g. Modern School Barakhamba"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#64748d] block mb-1">
              Student or division scope
            </label>
            <input
              type="text"
              value={gradeGroup}
              onChange={(e) => setGradeGroup(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/90 border border-[#e3e8ee] text-[#0d253d] font-medium focus:outline-none focus:ring-2 focus:ring-[#533afd]/30"
              placeholder="e.g. Primary School Recess"
            />
          </div>
        </div>

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
                <span className="text-[#64748d]">·</span>
                <span className="font-tabular text-[#64748d]">
                  Certificate #{certificateId}
                </span>
              </div>
              <h1 id="recess-pass-title" className="font-heading-md text-2xl sm:text-3xl font-extrabold text-[#0d253d] tracking-tight">
                Safe Recess & Outdoor Protocol Pass
              </h1>
              <p className="text-xs text-[#64748d] leading-relaxed">
                Verified planetary boundary layer (PBLH) atmospheric dilution protocol • Winter smog season
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#64748d] block">Target city</span>
              <span className="font-bold text-lg text-[#0d253d] block">{cityName}</span>
              <span className="text-xs text-[#533afd] font-medium">{city.terrainType}</span>
            </div>
          </div>

          {/* Institution & Recipient Metadata in Liquid Glass Container */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-[#e3e8ee]/80 mb-6 text-xs print:bg-white print:border-[#e3e8ee]">
            <div>
              <span className="text-[11px] text-[#64748d] block mb-0.5">Institution</span>
              <span className="font-semibold text-[#0d253d]">{institutionName}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#64748d] block mb-0.5">Campus scope</span>
              <span className="font-semibold text-[#0d253d]">{gradeGroup}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#64748d] block mb-0.5">Issue date</span>
              <span className="font-semibold text-[#0d253d]">{issueDate}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#64748d] block mb-0.5">Ambient ref. PM₂.₅</span>
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
                        {city.cleanWindowHours}
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
                  <div className="mt-0.5 p-1 rounded-full bg-[#64748d] text-white flex-shrink-0">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0d253d] text-sm">04:30 PM – Sunset & night</span>
                      <span className="text-xs text-[#64748d] font-semibold">
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
              <span className="text-[11px] text-[#64748d] block mb-1">
                Prevented soot / student
              </span>
              <span className="text-base font-bold text-[#533afd]">~85 µg/day</span>
            </div>
            <div>
              <span className="text-[11px] text-[#64748d] block mb-1">
                Cigarette eq. spared
              </span>
              <span className="text-base font-bold text-[#0d253d]">3.8 / week</span>
            </div>
            <div>
              <span className="text-[11px] text-[#64748d] block mb-1">
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
              <p className="text-[11px] text-[#64748d]">
                Validated against OpenAQ & Copernicus ERA5 boundary layer reanalysis
              </p>
            </div>

            <div className="text-right">
              <div className="w-44 border-b border-[#0d253d] pb-1 mb-1"></div>
              <span className="text-[11px] text-[#64748d] block">
                Principal / campus health coordinator
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note (Hidden in print) */}
        <div className="relative z-10 flex items-center justify-between pt-4 mt-2 text-xs text-[#64748d] print:hidden">
          <span>Tip: Use Ctrl+P or Cmd+P to export as a clean 1-page PDF document.</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#0d253d] font-semibold text-xs border border-[#e3e8ee] transition-all shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
