import React from 'react';

export const GradientMesh: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 right-0 h-[580px] overflow-hidden pointer-events-none select-none z-0">
      {/* Dynamic blurred mesh layers */}
      <div className="stripe-mesh-gradient" />

      {/* Organic SVG mesh curves for high-fidelity Stripe aesthetic */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-multiply"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g filter="url(#stripe-blur)">
          <path
            d="M-100 240C200 120 480 320 720 180C960 40 1240 280 1540 160V-100H-100V240Z"
            fill="url(#stripe-grad-1)"
          />
          <path
            d="M-50 360C260 220 540 380 840 260C1140 140 1380 360 1600 280V-80H-50V360Z"
            fill="url(#stripe-grad-2)"
            opacity="0.75"
          />
        </g>
        <defs>
          <filter id="stripe-blur" x="-200" y="-200" width="1900" height="900" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="70" />
          </filter>
          <linearGradient id="stripe-grad-1" x1="-100" y1="50" x2="1540" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5e9d4" />
            <stop offset="25%" stopColor="#9b6829" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#533afd" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#f96bee" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ea2261" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="stripe-grad-2" x1="1600" y1="200" x2="-50" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#533afd" />
            <stop offset="40%" stopColor="#b9b9f9" />
            <stop offset="70%" stopColor="#f5e9d4" />
            <stop offset="100%" stopColor="#ea2261" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
