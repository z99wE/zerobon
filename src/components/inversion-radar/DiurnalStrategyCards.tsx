import React from 'react';

/** Static educational cards explaining the three diurnal atmospheric regimes. */
export const DiurnalStrategyCards: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    <div className="p-6 rounded-3xl bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 shadow-sm transition-all space-y-3 flex flex-col justify-between">
      <div className="space-y-2">
        <h4 className="font-heading-sm text-base font-bold text-[#0d253d]">
          Morning Inversion Peak (7:00 – 10:00 AM)
        </h4>
        <p className="font-body-md text-xs text-[#475569] leading-relaxed">
          Nocturnal surface radiation leaves ground air colder than upper air, trapping diesel exhaust under a shallow 140m lid.
        </p>
      </div>
      <div className="pt-3 border-t border-[#e3e8ee] text-xs font-semibold text-[#533afd]">
        Shift runs indoors • Ride air-filtered underground metro
      </div>
    </div>

    <div className="p-6 rounded-3xl bg-white border-2 border-[#533afd]/30 shadow-md transition-all space-y-3 flex flex-col justify-between">
      <div className="space-y-2">
        <h4 className="font-heading-sm text-base font-bold text-[#0d253d]">
          Midday Clean Air Window (11:30 AM – 3:30 PM)
        </h4>
        <p className="font-body-md text-xs text-[#475569] leading-relaxed">
          Solar ground heating triggers vertical thermal convection, expanding the mixing ceiling to 1,350m and naturally diluting pollution by up to 75%.
        </p>
      </div>
      <div className="pt-3 border-t border-[#e3e8ee] text-xs font-bold text-[#533afd]">
        Open windows for 15 mins • Ideal for recess &amp; workouts
      </div>
    </div>

    <div className="p-6 rounded-3xl bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 shadow-sm transition-all space-y-3 flex flex-col justify-between">
      <div className="space-y-2">
        <h4 className="font-heading-sm text-base font-bold text-[#0d253d]">
          Evening Inversion Return (5:00 – 10:00 PM)
        </h4>
        <p className="font-body-md text-xs text-[#475569] leading-relaxed">
          As the sun sets, ground temperatures drop rapidly, collapsing the boundary layer and trapping evening traffic smoke at surface height.
        </p>
      </div>
      <div className="pt-3 border-t border-[#e3e8ee] text-xs font-semibold text-[#0d253d]">
        Close window sashes before sunset • Engage Corsi-Rosenthal box
      </div>
    </div>
  </div>
);
