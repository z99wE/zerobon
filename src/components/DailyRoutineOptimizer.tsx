import React, { useState } from 'react';
import { 
  Bus, 
  Sun, 
  Baby, 
  Flame, 
  Home, 
  Check, 
  Share2,
  RotateCw,
  Info,
  Car,
  Clock,
  Sparkles,
  Wind,
  Bike,
  Moon,
  Footprints,
  Droplets,
  Trees,
  ShoppingBag,
  Coffee,
  Shield,
  Activity,
  Layers,
  Dog,
  HeartPulse,
  BookOpen
} from 'lucide-react';
import { BreathReceipt } from '../types';
import { computeBreathReceipt } from '../engine/physics';
import { GradientBackground } from './ui/noisy-gradient-backgrounds';

interface RoutineSwapItem {
  id: string;
  title: string;
  category: string;
  description: string;
  actionDetails: string;
  humanReason: string;
  doseSavedUg: number;
  cigarettesSaved: number;
  co2eAvoidedGrams: number;
  noxAvoidedGrams: number;
  icon: React.ElementType;
  lifestyleMatch: string[];
  // D2C back face wisdom
  d2cTips: {
    quickAction: string;
    familyBenefit: string;
    proTip: string;
  };
}

const ROUTINE_SWAPS: RoutineSwapItem[] = [
  {
    id: 'metro-commute',
    title: 'Switch Commute to Electric Metro',
    category: 'Daily Commute',
    description: 'Switch from solo petrol/diesel drive to underground electric metro or electric bus.',
    actionDetails: 'Air-filtered underground transit cabin keeps exposure under 35 µg/m³ while removing a vehicle from congested roads.',
    humanReason: 'Morning cold air pools vehicle exhaust close to the road. Underground rail completely avoids traffic fumes.',
    doseSavedUg: 58,
    cigarettesSaved: 2.6,
    co2eAvoidedGrams: 1420,
    noxAvoidedGrams: 9.4,
    icon: Bus,
    lifestyleMatch: ['Commuters', 'All Families'],
    d2cTips: {
      quickAction: 'Leave your car at home 2 mornings a week and board the nearest air-conditioned metro train.',
      familyBenefit: 'Bypasses morning bumper-to-bumper smog plumes, lowering blood pressure and particulate inhalation.',
      proTip: 'Wear a comfortable cloth or N95 mask during walking connections between station doors and your office.',
    },
  },
  {
    id: 'midday-exercise',
    title: 'Shift Outdoor Run to Midday Hours',
    category: 'Fitness & Health',
    description: 'Move workouts from early morning cold smog to midday when rising warm air disperses the smoke.',
    actionDetails: 'Midday sunlight expands the vertical mixing layer by 4x, diluting surface pollution significantly.',
    humanReason: 'Heavy breathing during morning runs multiplies particulate intake by 10x. Midday air is far more dispersed.',
    doseSavedUg: 84,
    cigarettesSaved: 3.8,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Sun,
    lifestyleMatch: ['Fitness Enthusiasts', 'All Families'],
    d2cTips: {
      quickAction: 'Schedule your runs or brisk walks between 12:00 PM and 3:00 PM when solar warming dilutes smog.',
      familyBenefit: 'Spares your lungs from heavy morning diesel soot deposits while maintaining cardiovascular health.',
      proTip: 'Do morning mobility or yoga indoors, then take your cardio outside during lunchtime sunshine.',
    },
  },
  {
    id: 'school-walking-bus',
    title: 'Walking Pod with N95 Respiration',
    category: 'Family & School',
    description: 'Coordinate a neighborhood walking pod with certified N95 masks, bypassing idling car queues at school gates.',
    actionDetails: 'Eliminates dense micro-hotspots of diesel exhaust idling right where children assemble outside school gates.',
    humanReason: 'Car exhaust around school drop-off zones creates dangerous particulate spikes. Walking with masks protects children.',
    doseSavedUg: 62,
    cigarettesSaved: 2.8,
    co2eAvoidedGrams: 890,
    noxAvoidedGrams: 6.2,
    icon: Baby,
    lifestyleMatch: ['Families with Kids'],
    d2cTips: {
      quickAction: 'Team up with 2 neighboring parents to take turns walking kids to school on foot with sealed pediatric N95s.',
      familyBenefit: 'Kids avoid breathing the thick cloud of exhaust that pools from 50 idling SUVs at school gates.',
      proTip: 'Pack spare masks in school bags and ask administrators to keep school corridor doors shut during drop-offs.',
    },
  },
  {
    id: 'induction-cooking',
    title: 'Cook with Electric Induction & Sealed Lids',
    category: 'Home Habits',
    description: 'Prepare dinner on electric induction cooktop with lids sealed rather than open-flame gas or deep frying.',
    actionDetails: 'Prevents indoor ultrafine particle spikes and unburned hydrocarbons inside closed winter homes.',
    humanReason: 'Gas stoves produce nitrogen dioxide and fine soot. In winter, closed windows keep these fumes inside your home.',
    doseSavedUg: 46,
    cigarettesSaved: 2.1,
    co2eAvoidedGrams: 420,
    noxAvoidedGrams: 3.5,
    icon: Flame,
    lifestyleMatch: ['All Families', 'Apartment Residents'],
    d2cTips: {
      quickAction: 'Keep pan lids closed while simmering and turn on the range exhaust fan 2 minutes before igniting burners.',
      familyBenefit: 'Keeps kitchen NOx and burnt oil particulates from drafting into bedrooms where children sleep.',
      proTip: 'Switching to electric kettles and induction pans eliminates up to 60% of winter indoor particulate spikes.',
    },
  },
  {
    id: 'remote-work-smog-day',
    title: 'Remote Work on High-Smog Days',
    category: 'Work & Living',
    description: 'Work from your filtered home sanctuary on high-pollution days to avoid peak road exposure.',
    actionDetails: 'Completely bypasses 90+ minutes of dense road tunnel and bumper-to-bumper particulate inhalation.',
    humanReason: 'Eliminating the daily commute avoids breathing concentrated road exhaust during peak traffic jams.',
    doseSavedUg: 96,
    cigarettesSaved: 4.4,
    co2eAvoidedGrams: 3250,
    noxAvoidedGrams: 21.0,
    icon: Home,
    lifestyleMatch: ['Commuters', 'Apartment Residents'],
    d2cTips: {
      quickAction: 'Check morning AQI: if outdoor levels exceed 200 µg/m³, request a work-from-home focus day.',
      familyBenefit: 'Saves 2 hours of stressful road exposure while keeping your home air cleansed and peaceful.',
      proTip: 'Set up your desk in the bedroom or study that has active window draft seals and continuous air purification.',
    },
  },
  {
    id: 'cabin-recirculation',
    title: 'Engage In-Cabin Air Recirculation',
    category: 'Daily Commute',
    description: 'Set climate control to cabin recirculation with an activated carbon filter when driving in heavy traffic.',
    actionDetails: 'Blocks 85% of diesel soot and NOx from surrounding truck tailpipes from entering vehicle breathing zones.',
    humanReason: 'Fresh air intake on highway corridors pulls diesel exhaust directly from the tailpipe ahead of you.',
    doseSavedUg: 54,
    cigarettesSaved: 2.5,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 1.5,
    icon: Car,
    lifestyleMatch: ['Commuters', 'Families with Kids'],
    d2cTips: {
      quickAction: 'Press the recirculation button as soon as you enter arterial corridors or highway tunnels.',
      familyBenefit: 'Keeps dark diesel exhaust clouds out of children\'s seats in the back row.',
      proTip: 'Replace your car\'s cabin filter annually with an activated carbon + HEPA rated insert.',
    },
  },
  {
    id: 'staggered-commute',
    title: 'Shift Morning Commute to 10:30 AM',
    category: 'Daily Commute',
    description: 'Stagger work arrival by 90 minutes to avoid the 7:30–9:30 AM peak cold-inversion traffic gridlock.',
    actionDetails: 'The boundary layer begins expanding at 10:00 AM, lowering ground-level tailpipe soot concentration by 45%.',
    humanReason: 'Peak rush hour coincides precisely with the coldest, most stagnant layer of morning air.',
    doseSavedUg: 72,
    cigarettesSaved: 3.3,
    co2eAvoidedGrams: 1850,
    noxAvoidedGrams: 12.0,
    icon: Clock,
    lifestyleMatch: ['Commuters', 'Apartment Residents'],
    d2cTips: {
      quickAction: 'Negotiate flexible arrival times with your employer during peak winter smog months.',
      familyBenefit: 'Dramatically cuts time spent sitting in toxic, idling bumper-to-bumper traffic jams.',
      proTip: 'Use the early morning hours for quiet remote focus work before heading out on clearer roads.',
    },
  },
  {
    id: 'damp-microfiber-buffering',
    title: 'Damp-Microfiber Window Sill Buffering',
    category: 'Home Habits',
    description: 'Wipe window sills, thresholds, and balcony doors with damp microfiber cloths instead of dry brooms.',
    actionDetails: 'Damp wiping traps settled soot without re-suspending breathable particles into room air.',
    humanReason: 'Dry sweeping kicks settled particulate right back up into family breathing height where it floats for hours.',
    doseSavedUg: 38,
    cigarettesSaved: 1.7,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Sparkles,
    lifestyleMatch: ['Apartment Residents', 'Families with Kids'],
    d2cTips: {
      quickAction: 'Keep a dedicated damp microfiber cloth near windows and wipe horizontal sills every other evening.',
      familyBenefit: 'Stops fine black soot rings from transferring onto baby hands and crawling surfaces.',
      proTip: 'Rinse cloths in warm water; avoid dry vacuuming without HEPA exhaust filtration.',
    },
  },
  {
    id: 'indoor-gym-recess',
    title: 'Replace Morning Yard Play with Hall Games',
    category: 'Family & School',
    description: 'Coordinate with schools to move morning playground time into sealed indoor multipurpose halls.',
    actionDetails: 'Protects children from shallow 150m cold inversion lids that trap morning school bus exhaust.',
    humanReason: 'Children inhale 50% more air per pound of body weight than adults, multiplying toxic diesel intake.',
    doseSavedUg: 82,
    cigarettesSaved: 3.7,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Activity,
    lifestyleMatch: ['Families with Kids', 'Students'],
    d2cTips: {
      quickAction: 'Ask your PTA to enforce green-flag air quality thresholds for outdoor school sports.',
      familyBenefit: 'Prevents childhood asthma exacerbations, dry coughs, and morning wheezing episodes.',
      proTip: 'Equip indoor gymnasiums with 2 Corsi-Rosenthal boxes to ensure fresh circulation during dodgeball.',
    },
  },
  {
    id: 'green-corridor-cycling',
    title: 'Green Corridor Cycling with N95 Mask',
    category: 'Daily Commute',
    description: 'Reroute bike commutes through residential parkways rather than main arterial roads with an N95.',
    actionDetails: 'Parkway corridors carry 60% lower particulate concentrations than multilane arterial roads.',
    humanReason: 'Main road bike lanes place cyclists right next to truck exhaust pipes at elevated breathing rates.',
    doseSavedUg: 68,
    cigarettesSaved: 3.1,
    co2eAvoidedGrams: 2100,
    noxAvoidedGrams: 14.5,
    icon: Bike,
    lifestyleMatch: ['Commuters', 'Fitness Enthusiasts'],
    d2cTips: {
      quickAction: 'Pick quiet neighborhood streets even if it adds 5 minutes to your overall ride.',
      familyBenefit: 'Keeps cycling heart-healthy without deep diesel deposition in lung bronchioles.',
      proTip: 'A dual-strap valved N95 or KN95 provides low breathing resistance during moderate uphill pedaling.',
    },
  },
  {
    id: 'sunset-lockdown',
    title: 'Sunset Window Latch & Door Sweep',
    category: 'Home Habits',
    description: 'Firmly latch all windows and draw insulating curtains by 4:30 PM before sunset inversion collapses.',
    actionDetails: 'Ground surface temperatures plummet at sunset, creating a thermal lid trapping evening traffic soot.',
    humanReason: 'Leaving windows open into twilight hours sucks evening traffic smog directly into bedrooms.',
    doseSavedUg: 64,
    cigarettesSaved: 2.9,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Moon,
    lifestyleMatch: ['Apartment Residents', 'Families with Kids'],
    d2cTips: {
      quickAction: 'Set a daily phone alarm for 4:15 PM: "Close and latch all home windows."',
      familyBenefit: 'Keeps the clean air envelope you built during the midday window sealed tight all evening.',
      proTip: 'Heavy blackout or thermal curtains provide an additional passive barrier against cold air drafts.',
    },
  },
  {
    id: 'zero-incense-home',
    title: 'Switch to Flameless Diffusers & Beeswax',
    category: 'Home Habits',
    description: 'Eliminate commercial agarbatti, paraffin candles, and aerosol fresheners inside closed apartments.',
    actionDetails: 'Burning one stick of incense emits particulate equivalent to 2–3 burning cigarettes in sealed rooms.',
    humanReason: 'Winter homes are tightly shut, causing scented combustion products and benzene to accumulate.',
    doseSavedUg: 76,
    cigarettesSaved: 3.5,
    co2eAvoidedGrams: 80,
    noxAvoidedGrams: 0.8,
    icon: Flame,
    lifestyleMatch: ['Apartment Residents', 'Families with Kids'],
    d2cTips: {
      quickAction: 'Replace burning incense sticks with ultrasonic essential oil diffusers or pure beeswax tea lights.',
      familyBenefit: 'Removes a primary indoor trigger for chronic infant sneezing and nighttime respiratory irritation.',
      proTip: 'Look for 100% steam-distilled pure lavender or eucalyptus without synthetic hydrocarbon carriers.',
    },
  },
  {
    id: 'overnight-purifier-sanctuary',
    title: 'Overnight Box-Fan Purifier Sleep Mode',
    category: 'Home Habits',
    description: 'Run a DIY box fan filter on low directly beside the bed with bedroom doors closed overnight.',
    actionDetails: 'Maintains sleeping micro-zone PM2.5 below 15 µg/m³ for 8 continuous hours during peak nighttime smog.',
    humanReason: 'Humans spend one-third of their lives sleeping; clean night air lets alveolar lung tissues repair.',
    doseSavedUg: 92,
    cigarettesSaved: 4.2,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Shield,
    lifestyleMatch: ['All Families', 'Apartment Residents'],
    d2cTips: {
      quickAction: 'Place the purifier 3–5 feet from your pillows so the clean air plume directly covers your bed.',
      familyBenefit: 'Awaken with clear nasal passages, zero morning dry throat, and restorative deep sleep cycles.',
      proTip: 'Running a box fan on low consumes ~35 watts—costing under $0.05 per night in electricity.',
    },
  },
  {
    id: 'indoor-laundry-drying',
    title: 'Indoor Laundry Airing near Clean Air Plume',
    category: 'Home Habits',
    description: 'Dry freshly washed laundry inside near an air purifier rather than hanging clothes on smoggy balconies.',
    actionDetails: 'Outdoor winter soot and oily black carbon adhere strongly to damp cotton fabrics and stay on skin.',
    humanReason: 'Smoggy outdoor clotheslines turn clean towels and children\'s bedsheets into particulate dust traps.',
    doseSavedUg: 32,
    cigarettesSaved: 1.5,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Wind,
    lifestyleMatch: ['Apartment Residents', 'Families with Kids'],
    d2cTips: {
      quickAction: 'Set up a folding stainless steel drying rack in the hallway near your DIY fan filter.',
      familyBenefit: 'Prevents outdoor industrial soot from transferring to baby clothes and pillowcases.',
      proTip: 'A small desk fan aimed at the clothes rack cuts indoor drying time in half without heat.',
    },
  },
  {
    id: 'saline-nasal-rinse',
    title: 'Post-Commute Saline Nasal Mist & Hydration',
    category: 'Fitness & Health',
    description: 'Flush upper nasal passages with sterile saline spray after returning from transit or outdoor errands.',
    actionDetails: 'Hydrates upper respiratory mucosal cilia, accelerating natural clearance of trapped particles.',
    humanReason: 'Dry winter smog paralyzes nasal cilia. Gentle saline flushes trapped diesel soot out safely.',
    doseSavedUg: 42,
    cigarettesSaved: 1.9,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Droplets,
    lifestyleMatch: ['Fitness Enthusiasts', 'Commuters'],
    d2cTips: {
      quickAction: 'Keep a sterile isotonic sea-salt nasal spray by the bathroom mirror for a 5-second post-work mist.',
      familyBenefit: 'Significantly reduces chronic winter sinus congestion, inflammation, and recurring headache pressure.',
      proTip: 'Drink a glass of warm water or herbal tea right after to keep oral mucous membranes hydrated.',
    },
  },
  {
    id: 'urban-forest-outing',
    title: 'Midday Urban Forest Outing (1:00 PM)',
    category: 'Family & School',
    description: 'Plan weekend outdoor family visits to dense urban tree canopies between 1:00 PM and 3:30 PM.',
    actionDetails: 'Solar heating combines with tree canopies to enhance particulate deposition and vertical ventilation.',
    humanReason: 'Urban forests enjoy higher localized mixing depth and canopy filtration during solar peak hours.',
    doseSavedUg: 52,
    cigarettesSaved: 2.4,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Trees,
    lifestyleMatch: ['Families with Kids', 'Fitness Enthusiasts'],
    d2cTips: {
      quickAction: 'Pick botanical gardens, city arboretums, or heavily forested parks rather than concrete playgrounds.',
      familyBenefit: 'Gives children healthy sunshine and active outdoor play during the diurnal window with cleanest air.',
      proTip: 'Pack healthy snacks and return home by 3:45 PM before evening surface cooling begins.',
    },
  },
  {
    id: 'grocery-pooling',
    title: 'Consolidated Weekly Grocery Van Delivery',
    category: 'Work & Living',
    description: 'Pool neighborhood orders into single electric van delivery slots instead of individual store drives.',
    actionDetails: 'Replaces 6 individual fossil vehicle roundtrips with 1 optimized route, cutting cold-start idling.',
    humanReason: 'Cold engine starts in winter generate 5x higher tailpipe emissions per kilometer than warm cruising engines.',
    doseSavedUg: 48,
    cigarettesSaved: 2.2,
    co2eAvoidedGrams: 2400,
    noxAvoidedGrams: 16.0,
    icon: ShoppingBag,
    lifestyleMatch: ['Apartment Residents', 'Commuters'],
    d2cTips: {
      quickAction: 'Plan family meals once weekly and schedule weekend deliveries with neighbors in your building.',
      familyBenefit: 'Saves 2 hours of supermarket parking lot traffic and avoids congested market air.',
      proTip: 'Choose morning or midday delivery slots when drivers navigate less smog-congested routes.',
    },
  },
  {
    id: 'electric-kettle-switch',
    title: 'Electric Kettle Boiling over Open Stovetop',
    category: 'Home Habits',
    description: 'Boil drinking water and tea using an insulated electric kettle rather than open saucepan gas burners.',
    actionDetails: 'Avoids prolonged combustion of gas and prevents indoor humidity saturation that traps airborne soot.',
    humanReason: 'Open boiling gas flames inside closed winter kitchens elevate carbon monoxide and fine particles.',
    doseSavedUg: 28,
    cigarettesSaved: 1.3,
    co2eAvoidedGrams: 210,
    noxAvoidedGrams: 1.8,
    icon: Coffee,
    lifestyleMatch: ['All Families', 'Apartment Residents'],
    d2cTips: {
      quickAction: 'Keep an automatic shut-off stainless steel kettle on the kitchen counter for hot drinks and cooking prep.',
      familyBenefit: 'Keeps kitchen NOx levels low without having to leave drafty windows open in cold weather.',
      proTip: 'Electric kettles boil 50% faster than open gas burners while using less total energy.',
    },
  },
  {
    id: 'school-gate-buffer',
    title: 'School Gate 200m Vehicle-Free Drop Zone',
    category: 'Family & School',
    description: 'Park 200 meters away from school gates and walk the final block rather than idling in gate queues.',
    actionDetails: 'Cuts children\'s acute exposure to diesel idling emissions by up to 72% at morning drop-off times.',
    humanReason: 'Hundreds of idling cars at school gates create toxic hyper-local microclimates where children breathe.',
    doseSavedUg: 88,
    cigarettesSaved: 4.0,
    co2eAvoidedGrams: 1800,
    noxAvoidedGrams: 13.5,
    icon: Footprints,
    lifestyleMatch: ['Families with Kids', 'Students'],
    d2cTips: {
      quickAction: 'Drop kids off at an agreed side street 2 blocks away and let them walk the final 200m on sidewalks.',
      familyBenefit: 'Avoids the concentrated idling exhaust cloud that lingers outside primary school entrance gates.',
      proTip: 'Team up with other class parents to create a fun "walking train" for the final block.',
    },
  },
  {
    id: 'indoor-calisthenics',
    title: 'Indoor Cardio Sanctuary on Inversion Mornings',
    category: 'Fitness & Health',
    description: 'Swap morning roadside jogging for indoor jump rope, rowing, or treadmill cardio beside a running filter.',
    actionDetails: 'Deep ventilation during heavy outdoor exercise increases inhaled particulate dose by 800% under smog.',
    humanReason: 'Running 5km in 250 µg/m³ morning air deposits the particulate equivalent of smoking 6 cigarettes.',
    doseSavedUg: 110,
    cigarettesSaved: 5.0,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: HeartPulse,
    lifestyleMatch: ['Fitness Enthusiasts', 'Commuters'],
    d2cTips: {
      quickAction: 'Set up an exercise mat in your purified room and follow 30-minute HIIT or mobility routines.',
      familyBenefit: 'Keeps your VO2 max building and endorphins flowing without lung inflammation or coughing.',
      proTip: 'Save outdoor long runs for sunny weekend afternoons between 12:30 PM and 3:30 PM.',
    },
  },
  {
    id: 'magnetic-door-sweeper',
    title: 'Front Door Magnetic Draft Sweeper',
    category: 'Home Habits',
    description: 'Install heavy silicone or magnetic draft stoppers along bottom gaps of main apartment entrance doors.',
    actionDetails: 'Prevents stack-effect drafting where cold polluted stairwell air is pulled underneath doors by indoor heat.',
    humanReason: 'Stairwells in apartment complexes act as chimneys, drawing outdoor smog from parking basements.',
    doseSavedUg: 44,
    cigarettesSaved: 2.0,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Layers,
    lifestyleMatch: ['Apartment Residents', 'All Families'],
    d2cTips: {
      quickAction: 'Attach a silicone twin-draft blocker under your main front door in under 2 minutes.',
      familyBenefit: 'Blocks stairwell cigarette smoke, corridor elevator draft, and basement vehicle exhaust fumes.',
      proTip: 'Clean door bottoms with rubbing alcohol before applying adhesive sweeps for lifetime stickiness.',
    },
  },
  {
    id: 'pet-paws-wipe',
    title: 'Post-Walk Pet Coat & Paw Towel Wipe',
    category: 'Family & School',
    description: 'Wipe dogs\' coats and paws with a damp washcloth at the front doorway after evening bathroom walks.',
    actionDetails: 'Removes heavy street-grade tire dust, brake dust, and soot tracked indoors on animal fur.',
    humanReason: 'Pets walk right at exhaust pipe height; their fur acts as an electrostatically charged dust brush.',
    doseSavedUg: 26,
    cigarettesSaved: 1.2,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Dog,
    lifestyleMatch: ['Families with Kids', 'Apartment Residents'],
    d2cTips: {
      quickAction: 'Keep a towel and water spray bottle right inside your front entryway for a quick 30-second wipe-down.',
      familyBenefit: 'Stops outdoor road soot from transferring to rugs, sofas, and children\'s play areas.',
      proTip: 'Use pet-safe hypoallergenic wet wipes or a warm damp washcloth; no soap required.',
    },
  },
  {
    id: 'senior-midday-stroll',
    title: 'Senior Midday Sunlight Stroll (1:30 PM)',
    category: 'Fitness & Health',
    description: 'Encourage elderly family members to take daily walks between 1:00 PM and 3:00 PM instead of dawn walks.',
    actionDetails: 'Avoids cold morning vascular constrictions and maximum particulate stagnation, protecting heart health.',
    humanReason: 'Cardiovascular events and heart attacks in seniors spike sharply on cold, high-inversion winter mornings.',
    doseSavedUg: 78,
    cigarettesSaved: 3.5,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Sun,
    lifestyleMatch: ['All Families', 'Fitness Enthusiasts'],
    d2cTips: {
      quickAction: 'Plan senior neighbor walks right after lunch when ambient temperatures are peak and smog is diluted.',
      familyBenefit: 'Protects grandparents from freezing air that constricts coronary blood vessels and triggers chest tightness.',
      proTip: 'Encourage wearing a light scarf over nose and mouth if wind picks up.',
    },
  },
  {
    id: 'convection-air-fryer',
    title: 'Convection Air Fryer over Open Oil Frying',
    category: 'Home Habits',
    description: 'Use closed electric convection air fryers rather than open woks of sizzling oil for family snacks.',
    actionDetails: 'Reduces indoor oil-mist aerosol emissions by over 90% while keeping cooking soot locked in a closed chamber.',
    humanReason: 'Deep frying oil past smoke points releases acrolein, polycyclic aromatic hydrocarbons, and dense indoor haze.',
    doseSavedUg: 56,
    cigarettesSaved: 2.5,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Flame,
    lifestyleMatch: ['All Families', 'Apartment Residents'],
    d2cTips: {
      quickAction: 'Cook evening roasted snacks, potatoes, and proteins in an air fryer with the kitchen door closed.',
      familyBenefit: 'Keeps clothing and living room fabrics from absorbing rancid oil smells and invisible soot.',
      proTip: 'Wipe down the heating element monthly to prevent accumulated grease from smoking during use.',
    },
  },
  {
    id: 'garage-closer-inspection',
    title: 'Basement Parking Door Auto-Closer Check',
    category: 'Work & Living',
    description: 'Ensure basement garage fire doors have functional spring closers so car exhaust doesn\'t migrate upwards.',
    actionDetails: 'Eliminates the vertical stack effect that pulls subterranean cold-start vehicle exhaust into lobbies.',
    humanReason: 'Idling cars warming up in enclosed parking basements send concentrated benzene straight up into towers.',
    doseSavedUg: 65,
    cigarettesSaved: 3.0,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 4.2,
    icon: Home,
    lifestyleMatch: ['Apartment Residents', 'Commuters'],
    d2cTips: {
      quickAction: 'Report unlatched or propped-open garage stairwell doors to your building management committee.',
      familyBenefit: 'Keeps carbon monoxide and cold diesel engine fumes from rising into lower-floor residential flats.',
      proTip: 'A properly adjusted pneumatic door closer costs $15 and prevents thousands of liters of exhaust migration.',
    },
  },
  {
    id: 'campus-library-study',
    title: 'Study in Central Air-Filtered University Pods',
    category: 'Family & School',
    description: 'Move study sessions from roadside cafes to centrally filtered campus libraries with sealed double glazing.',
    actionDetails: 'Maintains cognitive concentration by keeping indoor CO2 below 800 ppm and PM2.5 below 20 µg/m³.',
    humanReason: 'Open-air coffee shops and street corners expose studying students to hours of continuous diesel particulate.',
    doseSavedUg: 70,
    cigarettesSaved: 3.2,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: BookOpen,
    lifestyleMatch: ['Students', 'Commuters'],
    d2cTips: {
      quickAction: 'Reserve a quiet study desk on the 3rd floor or higher of your institution\'s central library building.',
      familyBenefit: 'Prevents exam-season brain fog, fatigue, and headaches caused by prolonged smog inhalation.',
      proTip: 'Bring a refillable water bottle to stay hydrated during multi-hour revision blocks.',
    },
  },
];

interface DailyRoutineOptimizerProps {
  outdoorPm25: number;
  selectedCity: string;
  cleanWindowHours: string;
  onCommitReceipt: (receipt: BreathReceipt) => void;
  onTriggerShare: () => void;
}

export const DailyRoutineOptimizer: React.FC<DailyRoutineOptimizerProps> = ({
  outdoorPm25,
  selectedCity,
  onCommitReceipt,
  onTriggerShare,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [committedSwaps, setCommittedSwaps] = useState<Record<string, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const filterOptions = ['All', 'Families with Kids', 'Commuters', 'Fitness Enthusiasts', 'Apartment Residents', 'Students'];

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSwaps = ROUTINE_SWAPS.filter((item) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Families with Kids') {
      return item.lifestyleMatch.some((m) => m === 'Families with Kids' || m === 'All Families');
    }
    return item.lifestyleMatch.includes(selectedFilter);
  });

  const handleCommit = (swap: RoutineSwapItem) => {
    setCommittedSwaps((prev) => ({ ...prev, [swap.id]: true }));

    const receipt = computeBreathReceipt(
      selectedCity,
      swap.title,
      {
        concentration_ug_m3: 35,
        duration_minutes: 120,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      {
        concentration_ug_m3: outdoorPm25,
        duration_minutes: 120,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      'metro_transit'
    );

    const enrichedReceipt: BreathReceipt = {
      ...receipt,
      actionTitle: swap.title,
      doseSavedUg: swap.doseSavedUg,
      cigaretteEquivalentsSaved: swap.cigarettesSaved,
      co2eAvoidedGrams: swap.co2eAvoidedGrams,
      noxAvoidedGrams: swap.noxAvoidedGrams,
    };

    onCommitReceipt(enrichedReceipt);
  };

  // Cumulative impact
  const totalCommitted = Object.values(committedSwaps).filter(Boolean).length;
  const cumulativeCigarettes = ROUTINE_SWAPS.reduce((acc, curr) => {
    return committedSwaps[curr.id] ? acc + curr.cigarettesSaved : acc;
  }, 0);
  const cumulativeDose = ROUTINE_SWAPS.reduce((acc, curr) => {
    return committedSwaps[curr.id] ? acc + curr.doseSavedUg : acc;
  }, 0);
  const cumulativeCo2Kg = ROUTINE_SWAPS.reduce((acc, curr) => {
    return committedSwaps[curr.id] ? acc + (curr.co2eAvoidedGrams / 1000) : acc;
  }, 0);

  return (
    <section 
      aria-labelledby="routines-heading"
      className="w-full space-y-6"
    >
      {/* Section Header - De-slopped, Pure Brand Aesthetic */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e3e8ee]">
          <div>
            <h2 id="routines-heading" className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d]">
              Daily Routine Optimizer
            </h2>
            <p className="font-body-md text-sm text-[#475569] mt-1 max-w-2xl">
              Shift high-exposure activities away from morning stagnation traps. Choose routines that cut pollution and protect your family in {selectedCity}.
            </p>
          </div>

          <button
            onClick={onTriggerShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#533afd] text-xs font-semibold border border-[#e3e8ee] transition-all self-start md:self-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share My Progress</span>
          </button>
        </div>

        {/* Live Impact Tally Bar - Brand Monochromatic Palette */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#64748d] block mb-1">
              Active Habits
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">{totalCommitted}</span>
              <span className="text-xs text-[#64748d]">/ {ROUTINE_SWAPS.length} completed</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#64748d] block mb-1">
              Lung Dose Prevented
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#533afd]">
                {cumulativeDose}
              </span>
              <span className="text-xs text-[#64748d]">µg PM₂.₅</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#64748d] block mb-1">
              Cigarettes Saved
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cumulativeCigarettes.toFixed(1)}
              </span>
              <span className="text-xs text-[#64748d]">cigs avoided</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#64748d] block mb-1">
              Emissions Avoided
            </span>
            <span className="font-tabular text-2xl font-bold text-[#0d253d]">
              {cumulativeCo2Kg.toFixed(1)} kg CO₂
            </span>
          </div>
        </div>
      </div>

      {/* Lifestyle Filter Tabs - High-Fidelity Capsule (Never Squished) */}
      <div 
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 px-1 bg-[#f6f9fc] rounded-full border border-[#e3e8ee] w-fit max-w-full" 
        role="tablist" 
        aria-label="Lifestyle Filters"
      >
        {filterOptions.map((opt) => (
          <button
            key={opt}
            role="tab"
            aria-selected={selectedFilter === opt}
            onClick={() => setSelectedFilter(opt)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
              selectedFilter === opt
                ? 'bg-[#533afd] text-white font-bold shadow-sm'
                : 'text-[#475569] hover:text-[#0d253d] hover:bg-white/60 font-medium'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSwaps.map((swap) => {
          const Icon = swap.icon;
          const isDone = !!committedSwaps[swap.id];
          const isFlipped = !!flippedCards[swap.id];

          return (
            <div
              key={swap.id}
              tabIndex={0}
              role="region"
              aria-label={`${swap.title}. Press Enter or Space to flip card.`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                  e.preventDefault();
                  toggleFlip(swap.id);
                }
              }}
              className="relative min-h-[530px] sm:min-h-[510px] rounded-3xl transition-all perspective-1000 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-2"
              onClick={(e) => {
                // If user clicks a button inside card, let button handler deal with it
                if ((e.target as HTMLElement).closest('button')) return;
                toggleFlip(swap.id);
              }}
            >
              <div
                className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT FACE */}
                <div
                  className={`w-full h-full rounded-3xl p-5 sm:p-6 bg-white border flex flex-col justify-between transition-all backface-hidden ${
                    isDone
                      ? 'border-[#533afd] shadow-md ring-1 ring-[#533afd]/30'
                      : 'border-[#e3e8ee] hover:border-[#533afd]/50 hover:shadow-lg shadow-sm'
                  }`}
                >
                  <div>
                    {/* Card Category & Badge & Flip Button */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] flex items-center justify-center text-[#533afd]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#0d253d] block">
                            {swap.category}
                          </span>
                          <span className="text-[11px] text-[#64748d]">
                            {swap.lifestyleMatch.join(' • ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDone && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f6f9fc] border border-[#e3e8ee] text-[#533afd] text-xs font-medium">
                            <Check className="w-3.5 h-3.5" />
                            <span>Adopted</span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(swap.id);
                          }}
                          aria-label={`Flip card to see lifestyle tips for ${swap.title}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f9fc] hover:bg-[#533afd] text-[#0d253d] hover:text-white text-xs font-semibold border border-[#e3e8ee] transition-all shadow-sm"
                          title="Click to flip card"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Flip Card</span>
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-heading-md text-base sm:text-lg text-[#0d253d] mb-1">
                      {swap.title}
                    </h3>
                    <p className="font-body-md text-xs text-[#475569] leading-relaxed mb-3">
                      {swap.description}
                    </p>

                    {/* Plain Human Reason Box */}
                    <div className="p-3 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] mb-3 text-xs text-[#273951]">
                      <span className="font-medium text-[#0d253d] block mb-0.5">Why this works:</span>
                      <p className="text-[11px] text-[#475569] leading-relaxed">
                        {swap.humanReason}
                      </p>
                    </div>

                    {/* Impact Metrics Row - Brand Styled */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-b border-[#e3e8ee] mb-3">
                      <div className="text-left">
                        <span className="text-[10px] text-[#64748d] block">Dose Protected</span>
                        <span className="font-tabular text-sm font-semibold text-[#533afd]">
                          +{swap.doseSavedUg} µg
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-[#64748d] block">Cigarettes Saved</span>
                        <span className="font-tabular text-sm font-semibold text-[#0d253d]">
                          {swap.cigarettesSaved} cigs
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-[#64748d] block">Carbon Cut</span>
                        <span className="font-tabular text-sm font-semibold text-[#0d253d]">
                          {swap.co2eAvoidedGrams > 0 ? `${(swap.co2eAvoidedGrams / 1000).toFixed(1)}kg CO₂` : 'Zero Fuel'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => handleCommit(swap)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-medium transition-all focus:ring-2 focus:ring-[#533afd] ${
                        isDone
                          ? 'bg-[#f6f9fc] text-[#0d253d] border border-[#e3e8ee] hover:bg-[#e3e8ee]'
                          : 'bg-[#533afd] hover:bg-[#432ec9] text-white shadow-sm'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Update Receipt' : 'Adopt Routine Swap'}</span>
                    </button>

                    {isDone && (
                      <button
                        onClick={onTriggerShare}
                        aria-label={`Share ${swap.title} on Social Media`}
                        className="p-2.5 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#533afd] border border-[#e3e8ee] transition-all focus:ring-2 focus:ring-[#533afd]"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* BACK FACE (Styled with Noisy Gradient Background - Unclipped) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden border border-[#533afd]/40 shadow-xl backface-hidden rotate-y-180"
                >
                  <GradientBackground
                    className="w-full h-full p-5 sm:p-6 text-white flex flex-col justify-between"
                    gradientType="linear-gradient"
                    gradientOrigin="top-left"
                    noiseIntensity={0.5}
                    noisePatternAlpha={25}
                    noisePatternSize={80}
                    noisePatternRefreshInterval={2}
                  >
                    <div>
                      {/* Back Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-white/15 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#533afd] ring-2 ring-white/60 animate-pulse" />
                          <span className="text-xs font-semibold tracking-wide uppercase text-white/95">
                            Practical Living Wisdom
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(swap.id);
                          }}
                          aria-label="Flip back to front face"
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#0d253d] text-xs font-semibold border border-white/30 transition-all backdrop-blur-sm shadow-sm"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Flip Back</span>
                        </button>
                      </div>

                      <h4 className="font-heading-md text-base sm:text-lg text-white font-bold mb-2">
                        {swap.title}
                      </h4>

                      {/* Actionable Non-Technical D2C Insights */}
                      <div className="space-y-2 text-xs leading-relaxed">
                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
                          <span className="font-semibold text-white/90 block mb-0.5">Quick Action:</span>
                          <p className="text-white/80">{swap.d2cTips.quickAction}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
                          <span className="font-semibold text-white/90 block mb-0.5">Family & Health Benefit:</span>
                          <p className="text-white/80">{swap.d2cTips.familyBenefit}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
                          <span className="font-semibold text-white/90 block mb-0.5">Smart Pro Tip:</span>
                          <p className="text-white/80">{swap.d2cTips.proTip}</p>
                        </div>
                      </div>
                    </div>

                    {/* Back Bottom Button - Elevated & Never Clipped */}
                    <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                        <Info className="w-3.5 h-3.5 text-white/90" />
                        <span>Actionable daily routine wisdom</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleCommit(swap);
                          toggleFlip(swap.id);
                        }}
                        className="px-4 py-2 rounded-full bg-white text-[#0d253d] font-semibold text-xs hover:bg-white/90 transition-all shadow-sm"
                      >
                        Adopt & Flip
                      </button>
                    </div>
                  </GradientBackground>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
