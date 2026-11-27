import React from 'react';
import { GradientMesh } from '../GradientMesh';
import GhostFibers from '../ui/GhostFibers';

/** Decorative ambient background layer; hidden from assistive technology. */
export const AppBackground: React.FC = () => (
<>
      {/* Atmospheric Gradient Mesh Upper Third */}
      <GradientMesh />

      {/* Ambient Branded Morphism GhostFibers Skin in Negative Space (Reduced opacity by 15% for soft brand subtlety) */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-10 group-hover/skin:opacity-45 transition-opacity duration-700 ease-out"
      >
        <GhostFibers
          glowColor="#533afd"
          lineColor="#b9b9f9"
          secondaryColor="#432ec9"
          layers={3}
          twist={1.2}
          threads={64}
          fiberStyle="dots"
          depthOfField={0.8}
          hoverEffect="focus"
          intro={true}
          mouseInteraction={true}
          lightMode={true}
          brightness={0.72}
          glow={0.5}
          speed={0.35}
          className="w-full h-full"
        />
      </div>

      {/* Subtle Negative Space Glassmorphism Glow Highlights in Brand Colors */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(83,58,253,0.04),rgba(185,185,249,0.02),transparent_70%)] group-hover/skin:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(83,58,253,0.06),rgba(185,185,249,0.03),transparent_70%)] transition-all duration-700"
      />

</>
);

/** WCAG 4.1.3 live status message for the current atmospheric context. */
export const StatusAnnouncer: React.FC<{
  selectedCity: string;
  outdoorPm25: number;
  indoorPm25: number;
}> = ({ selectedCity, outdoorPm25, indoorPm25 }) => (
  <>
      {/* Accessibility Status Announcer for Screen Readers (WCAG 4.1.3 Status Messages) */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {`ZeroBon platform active. Current city is ${selectedCity}. Outdoor PM2.5 is ${outdoorPm25} micrograms. Estimated indoor air is ${Math.round(indoorPm25)} micrograms.`}
      </div>
  </>
);
