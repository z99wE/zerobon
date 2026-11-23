import React, { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

export const ArchitectureBulb: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sleek Minimal Bulb Button in Navigation / Header */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="View architectural notes"
        className="p-2 rounded-full hover:bg-[#f6f9fc] text-[#64748d] hover:text-[#533afd] border border-transparent hover:border-[#e3e8ee] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#533afd]"
        title="System Architecture Insights"
      >
        <Lightbulb className="w-4 h-4 text-[#533afd]" />
      </button>

      {/* Clean Minimalist Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="arch-bulb-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d253d]/50 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 border border-[#e3e8ee] shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close architecture notes"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#64748d] hover:text-[#0d253d] flex items-center justify-center transition-all text-xs focus:ring-2 focus:ring-[#533afd]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#533afd]/10 flex items-center justify-center text-[#533afd]">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <h2 id="arch-bulb-title" className="font-heading-sm text-base text-[#0d253d] font-normal">
                Architecture Blueprint
              </h2>
            </div>

            <p className="font-body-md text-xs text-[#64748d] mb-4 leading-relaxed">
              Zerobon decouples deterministic mathematical physics from generative language models to guarantee zero hallucinations and instantaneous edge execution.
            </p>

            <div className="space-y-3 border-t border-[#e3e8ee] pt-4 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#533afd] mt-1.5 shrink-0" />
                <div>
                  <strong className="text-[#0d253d] font-medium">Deterministic Physics Engine (WASM)</strong>
                  <p className="text-[#64748d] mt-0.5 font-light">
                    Differential mass-balance solver calculating exact indoor PM2.5 infiltration and lung dose counterfactuals without LLM arithmetic.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#533afd] mt-1.5 shrink-0" />
                <div>
                  <strong className="text-[#0d253d] font-medium">5-Layer Anti-Hijacking Copilot</strong>
                  <p className="text-[#64748d] mt-0.5 font-light">
                    Cryptographic tag delimiters, input sanitization, strict Zod schema validation, and egress canary monitoring.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#533afd] mt-1.5 shrink-0" />
                <div>
                  <strong className="text-[#0d253d] font-medium">Multi-Tenant Partitioning</strong>
                  <p className="text-[#64748d] mt-0.5 font-light">
                    Strict boundary isolation across B2C families, schools, and enterprise campuses indexed by Uber H3 cells.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="button-primary-pill text-xs px-4 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
