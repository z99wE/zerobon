import React from 'react';
import type { DIYHackDetail } from '../../data/indoor-hacks';

interface Props {
  hack: DIYHackDetail;
  dialogRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

/** Focus-trapped DIY assembly instructions dialog. */
export const DiyBuildModal: React.FC<Props> = ({ hack, dialogRef, onClose }) => (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="diy-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d253d]/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              autoFocus
              onClick={() => onClose()}
              aria-label="Close DIY Guide (or press Escape)"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#475569] flex items-center justify-center text-xs focus:outline-none focus:ring-2 focus:ring-[#533afd]"
            >
              ✕
            </button>

            <span className="text-xs font-semibold text-[#533afd] block mb-1">DIY Assembly Blueprint</span>

            <h3 id="diy-modal-title" className="font-heading-lg text-xl text-[#0d253d] mb-1">
              {hack.title}
            </h3>
            <p className="text-xs text-[#475569] mb-4">
              Estimated Cost: {hack.costEst} • Performance: {hack.effectLabel}
            </p>

            {/* Materials List */}
            <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] mb-4">
              <span className="text-xs font-bold text-[#0d253d] block mb-2">Materials & Supplies:</span>
              <ul className="space-y-1.5 text-xs text-[#475569]">
                {hack.materials.map((m, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#533afd]" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Assembly Steps */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-bold text-[#0d253d] block">Step-by-Step Instructions:</span>
              {hack.steps.map((st, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#273951]">
                  <span className="w-5 h-5 rounded-full bg-[#533afd]/10 text-[#533afd] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <p className="pt-0.5">{st}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Close DIY assembly guide"
                onClick={() => onClose()}
                className="px-5 py-2.5 rounded-full bg-[#533afd] text-white text-xs font-medium hover:bg-[#432ec9] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
);
