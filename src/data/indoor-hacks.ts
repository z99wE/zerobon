export interface DIYHackDetail {
  id: 'corsiRosenthal' | 'draftSealing' | 'kitchenExhaust' | 'windowOpen';
  title: string;
  categoryLabel: string;
  effectLabel: string;
  costEst: string;
  description: string;
  humanExplanation: string;
  materials: string[];
  steps: string[];
}

export const HACK_DETAILS: DIYHackDetail[] = [
  {
    id: 'corsiRosenthal',
    title: '$35 Box Fan Purifier (Corsi-Rosenthal Box)',
    categoryLabel: 'DIY Home Purifier',
    effectLabel: 'Cleans 85% of smoke in 20 mins',
    costEst: '$35 (saves $350 vs commercial purifiers)',
    description:
      'Tape 4 standard home furnace filters around a standard 20-inch box fan. It cleans bedroom air as fast as a $400 store unit at a fraction of the price.',
    humanExplanation:
      'Four large filters trap smoke, soot, and dust without straining the fan motor. Runs quietly overnight while using less power than a lightbulb.',
    materials: [
      '1x Standard 20-inch box fan ($20)',
      '4x MERV-13 furnace filters (20"x20") ($15–$20 total)',
      '1x Cardboard square for the bottom base',
      '1x Roll of duct tape or packing tape',
    ],
    steps: [
      'Stand the 4 filters in a square cube with the arrow marks pointing inward toward the center.',
      'Tape the vertical edges together firmly with duct tape.',
      'Tape the cardboard square to seal the bottom of the cube completely.',
      'Place the box fan on top, blowing clean air upward toward the ceiling.',
      'Tape all remaining seams tightly so air only enters through the filters. Plug in and run on low or medium.',
    ],
  },
  {
    id: 'draftSealing',
    title: 'Seal Window & Door Cracks',
    categoryLabel: 'Leak Prevention',
    effectLabel: 'Blocks 54% of outdoor smoke leaks',
    costEst: '$10 weather tape',
    description:
      'Stick peel-and-stick foam tape along rattling window seams and slide a draft stopper under exterior doors to block dirty winter drafts.',
    humanExplanation:
      'Over half of outdoor smog sneaks into living rooms through hairline cracks around windows and doors. Sealing them locks clean air inside.',
    materials: [
      'Peel-and-stick foam weatherstrip tape',
      'Door-bottom draft sweep or fabric roll',
      'Cloth to wipe frames before applying',
    ],
    steps: [
      'Wipe window frames and sills dry with a cloth to remove dust.',
      'Press self-adhesive foam tape along every gap where window panels meet.',
      'Slide or stick the draft stopper along the bottom edge of your front door.',
      "Check for leaks on a breezy evening—you shouldn't feel cool air drafts whistling in.",
    ],
  },
  {
    id: 'kitchenExhaust',
    title: 'Kitchen Exhaust & Stove Venting',
    categoryLabel: 'Cooking Soot Control',
    effectLabel: 'Clears cooking smoke in 10 mins',
    costEst: '$0 (Free)',
    description:
      "Turn your stove exhaust fan on high before turning on burners or heating oil, and keep bedroom doors shut so frying smoke doesn't drift.",
    humanExplanation:
      'Cooking oil fumes and gas flames release massive invisible spikes of fine soot. Venting them outdoors immediately protects family lungs.',
    materials: [
      'Kitchen exhaust fan or window vent',
      'Cooking pot and pan lids',
      'Bedroom doors kept shut while cooking',
    ],
    steps: [
      'Switch on the kitchen exhaust fan 2 minutes before you start cooking.',
      'Keep kitchen and bedroom doors closed to isolate cooking smoke.',
      'Always cover sizzling pans with lids to trap oil mist.',
      'Keep the fan running for 10 minutes after turning off the stove.',
    ],
  },
  {
    id: 'windowOpen',
    title: 'Midday 15-Minute Air Flush',
    categoryLabel: 'Fresh Air Timing',
    effectLabel: 'Brings fresh oxygen without smog flood',
    costEst: '$0 (Free timing trick)',
    description:
      'Only open windows between 12:00 PM and 3:00 PM. Sunlight warms the ground and pushes the smog layer high into the sky, making it safe to air out your home.',
    humanExplanation:
      'Never open windows in early morning or late evening when cold air traps car exhaust at ground level. Midday sun naturally dilutes pollution by up to 75%.',
    materials: [
      'Windows or balcony doors on opposite sides of home',
      'Phone alarm set for 1:00 PM',
    ],
    steps: [
      "Check your city's clean window (typically 12:00 PM – 3:00 PM).",
      'Open windows on two sides of the home for 15 minutes to create a fresh cross-breeze.',
      'Close and lock all windows tightly by 3:30 PM before sunset cooling starts.',
      'Turn on your DIY box fan purifier to quickly clean the fresh indoor air.',
    ],
  },
];
