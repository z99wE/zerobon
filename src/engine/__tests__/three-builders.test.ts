import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createStudioLighting,
  createTerrariumBaseAndDome,
  createAtmosphericFamiliar,
  createParticulateCloud,
  createAirflowStreamlines,
} from '../three-builders';

describe('Three.js Procedural Atmospheric Builders', () => {
  it('constructs studio lighting rig with central bloom point light', () => {
    const scene = new THREE.Scene();
    const bloomLight = createStudioLighting(scene);
    expect(bloomLight).toBeInstanceOf(THREE.PointLight);
    expect(scene.children.length).toBeGreaterThanOrEqual(4);
  });

  it('builds pedestal base and double-sided glass dome with physical materials', () => {
    const scene = new THREE.Scene();
    const { baseGroup, domeMesh } = createTerrariumBaseAndDome(scene);
    expect(baseGroup.children.length).toBeGreaterThanOrEqual(3);
    expect(domeMesh.material).toBeInstanceOf(THREE.MeshPhysicalMaterial);
  });

  it('builds living bio-indicator Lumi with tail segments and N95 shield', () => {
    const scene = new THREE.Scene();
    const pet = createAtmosphericFamiliar(scene);
    expect(pet.petGroup).toBeDefined();
    expect(pet.tailGroup.children.length).toBe(5);
    expect(pet.n95Mask.visible).toBe(false);
  });

  it('allocates typed particulate buffer cloud without NaNs', () => {
    const scene = new THREE.Scene();
    const { particles, velocities } = createParticulateCloud(scene, 100);
    expect(particles.geometry.attributes.position.count).toBe(100);
    expect(velocities.length).toBe(300);
    for (let i = 0; i < velocities.length; i++) {
      expect(Number.isNaN(velocities[i])).toBe(false);
    }
  });

  it('generates airflow vortex tube streamlines', () => {
    const scene = new THREE.Scene();
    const streams = createAirflowStreamlines(scene, 8);
    expect(streams.children.length).toBe(8);
  });
});
