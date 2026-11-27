// src/components/SafeRecessPassModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { Printer, Share2, X, Check } from 'lucide-react';
import { getCityProfile } from '../engine/city-data';
import { SafeRecessCertificate } from './safe-recess/SafeRecessCertificate';

interface SafeRecessPassModalProps {
  cityName: string;
  outdoorPm25: number;
  cleanWindowHours?: string;
  onClose: () => void;
}

export const SafeRecessPassModal: React.FC<SafeRecessPassModalProps> = ({
  cityName,
  outdoorPm25,
  cleanWindowHours,
  onClose,
}) => {
  const [institutionName, setInstitutionName] = useState<string>('Delhi Public School / Junior Campus');
  const [gradeGroup, setGradeGroup] = useState<string>('Grades K – 8 • Recess & physical education');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useAccessibleModal(true, onClose);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const city = getCityProfile(cityName);
  const activeCleanWindow = cleanWindowHours || city.cleanWindowHours;
  const certificateId = `ZB-RECESS-${Math.abs(cityName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 179).toString().substring(0, 6)}`;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `ZeroBon safe recess pass for ${institutionName} (${cityName}): Outdoor recess permitted strictly during solar mixing window (${activeCleanWindow}). Verified by ZeroBon atmospheric physics: https://zerobon.pages.dev`
    );
    setCopiedLink(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recess-pass-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0d253d]/70 backdrop-blur-xl animate-fadeIn overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Liquid Glassmorphism Container with Subtle Ambient Indigo Reflection */}
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(83,58,253,0.18)] p-5 sm:p-8 my-auto overflow-hidden text-[#0d253d]"
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
              type="button"
              aria-label="Share safe recess pass link with parents"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#0d253d] text-xs font-medium border border-[#e3e8ee] transition-all shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#533afd]" /> : <Share2 className="w-3.5 h-3.5 text-[#533afd]" />}
              <span>{copiedLink ? 'Copied link' : 'Share with parents'}</span>
            </button>

            <button
              type="button"
              aria-label="Print or save Safe Recess Pass as PDF"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-medium transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-full hover:bg-white/60 text-[#475569] hover:text-[#0d253d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Institution Name Customizer Bar (Hidden during printing) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-[#e3e8ee]/80 print:hidden">
          <div>
            <label htmlFor="recess-institution-input" className="text-[11px] font-medium text-[#475569] block mb-1">
              School or organization name
            </label>
            <input
              id="recess-institution-input"
              type="text"
              maxLength={100}
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/90 border border-[#e3e8ee] text-[#0d253d] font-medium focus:outline-none focus:ring-2 focus:ring-[#533afd]/30"
              placeholder="e.g. Modern School Barakhamba"
            />
          </div>
          <div>
            <label htmlFor="recess-scope-input" className="text-[11px] font-medium text-[#475569] block mb-1">
              Student or division scope
            </label>
            <input
              id="recess-scope-input"
              type="text"
              maxLength={100}
              value={gradeGroup}
              onChange={(e) => setGradeGroup(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/90 border border-[#e3e8ee] text-[#0d253d] font-medium focus:outline-none focus:ring-2 focus:ring-[#533afd]/30"
              placeholder="e.g. Primary School Recess"
            />
          </div>
        </div>

        <SafeRecessCertificate
          printRef={printRef}
          institutionName={institutionName}
          gradeGroup={gradeGroup}
          cityName={cityName}
          city={city}
          activeCleanWindow={activeCleanWindow}
          certificateId={certificateId}
          issueDate={issueDate}
          outdoorPm25={outdoorPm25}
        />

        {/* Footer Note (Hidden in print) */}
        <div className="relative z-10 flex items-center justify-between pt-4 mt-2 text-xs text-[#475569] print:hidden">
          <span>Tip: Use Ctrl+P or Cmd+P to export as a clean 1-page PDF document.</span>
          <button
            type="button"
            aria-label="Close certificate preview"
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
