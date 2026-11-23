import { describe, it, expect } from 'vitest';
import { DEMO_TENANTS, INITIAL_NEIGHBOR_DOMES, INITIAL_INCIDENT_BEACONS } from '../tenancy';

describe('Multi-Tenant Household & H3 Community Mesh', () => {
  it('correctly provides isolated configurations for B2C and institutional tenants', () => {
    expect(DEMO_TENANTS.length).toBeGreaterThanOrEqual(4);
    
    const chenFamily = DEMO_TENANTS.find((t) => t.id === 'tenant-family-chen');
    expect(chenFamily).toBeDefined();
    expect(chenFamily?.type).toBe('family');
    expect(chenFamily?.h3Index).toBe('87283082bffffff');

    const greenwoodSchool = DEMO_TENANTS.find((t) => t.id === 'tenant-greenwood-school');
    expect(greenwoodSchool).toBeDefined();
    expect(greenwoodSchool?.type).toBe('school');
    expect(greenwoodSchool?.recessCancellationPM25Threshold).toBe(150);
  });

  it('aggregates neighborhood domes and incident beacons deterministically', () => {
    expect(INITIAL_NEIGHBOR_DOMES.length).toBeGreaterThan(0);
    const avgIndoorPm25 = INITIAL_NEIGHBOR_DOMES.reduce((acc, d) => acc + d.indoorPm25, 0) / INITIAL_NEIGHBOR_DOMES.length;
    expect(avgIndoorPm25).toBeGreaterThan(10);
    expect(avgIndoorPm25).toBeLessThan(100);

    expect(INITIAL_INCIDENT_BEACONS.length).toBeGreaterThan(0);
    const fireBeacons = INITIAL_INCIDENT_BEACONS.filter((b) => b.type === 'waste_burning');
    expect(fireBeacons.length).toBeGreaterThan(0);
  });
});
