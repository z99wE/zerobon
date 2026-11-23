import { TenantConfig, IncidentBeacon, H3NeighborDome } from '../types';

export const DEMO_TENANTS: TenantConfig[] = [
  {
    id: 'tenant-family-chen',
    name: 'The Chen Household',
    type: 'family',
    h3Index: '87283082bffffff',
    subdomain: 'chen.zerobon.io',
    totalMembers: 4,
    activePledgesCount: 3,
    collectiveEmissionsSavedKg: 14.8,
  },
  {
    id: 'tenant-greenwood-school',
    name: 'Greenwood International School',
    type: 'school',
    h3Index: '87283082bffffff',
    subdomain: 'greenwood.zerobon.io',
    recessCancellationPM25Threshold: 150,
    totalMembers: 840,
    activePledgesCount: 420,
    collectiveEmissionsSavedKg: 1240.5,
  },
  {
    id: 'tenant-powai-rwa',
    name: 'Powai Lakeview Resident Welfare Association',
    type: 'rwa',
    h3Index: '87283082affffff',
    subdomain: 'powai-rwa.zerobon.io',
    wfhSmogAlertThreshold: 180,
    totalMembers: 320,
    activePledgesCount: 195,
    collectiveEmissionsSavedKg: 680.2,
  },
  {
    id: 'tenant-apex-campus',
    name: 'Apex Innovation Eco-Campus',
    type: 'corporate',
    h3Index: '872830828ffffff',
    subdomain: 'apex-campus.zerobon.io',
    wfhSmogAlertThreshold: 160,
    totalMembers: 1450,
    activePledgesCount: 680,
    collectiveEmissionsSavedKg: 3420.0,
  },
];

export const INITIAL_INCIDENT_BEACONS: IncidentBeacon[] = [
  {
    id: 'inc-101',
    type: 'waste_burning',
    h3Cell: '87283082bffffff',
    relativeDistanceKm: 0.8,
    reportedMinutesAgo: 18,
    verifiedCount: 7,
  },
  {
    id: 'inc-102',
    type: 'construction_dust',
    h3Cell: '87283082bffffff',
    relativeDistanceKm: 1.4,
    reportedMinutesAgo: 45,
    verifiedCount: 12,
  },
  {
    id: 'inc-103',
    type: 'diesel_gen',
    h3Cell: '87283082affffff',
    relativeDistanceKm: 2.1,
    reportedMinutesAgo: 70,
    verifiedCount: 4,
  },
];

export const INITIAL_NEIGHBOR_DOMES: H3NeighborDome[] = [
  {
    id: 'dome-chen',
    tenantName: 'Chen Family (You)',
    hexOffset: [0, 0],
    indoorPm25: 18,
    petStatus: 'calm',
    activeHack: 'Corsi-Rosenthal Box active',
  },
  {
    id: 'dome-sharma',
    tenantName: 'Sharma Household',
    hexOffset: [1.8, 1.0],
    indoorPm25: 24,
    petStatus: 'calm',
    activeHack: 'Draft stoppers applied',
  },
  {
    id: 'dome-greenwood',
    tenantName: 'Greenwood School Dome',
    hexOffset: [-1.8, 1.0],
    indoorPm25: 35,
    petStatus: 'ventilate',
    activeHack: 'HVAC MERV-13 purge',
  },
  {
    id: 'dome-powai',
    tenantName: 'RWA Clubhouse Pod',
    hexOffset: [0, -2.0],
    indoorPm25: 68,
    petStatus: 'alert_mask',
    activeHack: 'Recess relocated indoors',
  },
  {
    id: 'dome-verma',
    tenantName: 'Verma Residence',
    hexOffset: [-1.8, -1.0],
    indoorPm25: 14,
    petStatus: 'celebrate',
    activeHack: 'DIY Purifier + Induction swap',
  },
];

/**
 * Simulates Cloudflare D1 TenantScopedDB
 * Bound strictly to WHERE tenant_id = ?
 */
export class TenantScopedDB {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  getTenantId() {
    return this.tenantId;
  }

  getTenantConfig(): TenantConfig {
    const tenant = DEMO_TENANTS.find((t) => t.id === this.tenantId);
    return tenant ?? DEMO_TENANTS[0] ?? {
      id: 'tenant-family-chen',
      name: 'The Chen Household',
      type: 'family',
      h3Index: '87283082bffffff',
      subdomain: 'chen.zerobon.io',
      totalMembers: 4,
      activePledgesCount: 3,
      collectiveEmissionsSavedKg: 14.8,
    };
  }

  getTenantPledges() {
    return [
      { id: 'p1', title: 'Midday Recess Clean Air Shift', participants: 310, status: 'Active' },
      { id: 'p2', title: 'Carpool & Metro Commute Pledge', participants: 185, status: 'Active' },
      { id: 'p3', title: 'Zero Waste Burning Vigilance', participants: 94, status: 'Active' },
    ];
  }
}
