import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { INITIAL_NEIGHBOR_DOMES, INITIAL_INCIDENT_BEACONS } from '../engine/tenancy';
import { H3NeighborDome, IncidentBeacon } from '../types';

interface H3CommunityBiomeProps {
  tenantId: string;
  onSelectDome?: (dome: H3NeighborDome) => void;
}

export const H3CommunityBiome: React.FC<H3CommunityBiomeProps> = ({ tenantId, onSelectDome }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedDome, setSelectedDome] = useState<H3NeighborDome>(INITIAL_NEIGHBOR_DOMES[0]!);
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'burning' | 'dust'>('all');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060609);
    scene.fog = new THREE.FogExp2(0x060609, 0.04);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 9.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 10, 6);
    scene.add(dirLight);

    const cyanLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    cyanLight.position.set(-6, 4, -4);
    scene.add(cyanLight);

    // H3 Hexagonal Grid generation
    const hexGroup = new THREE.Group();
    scene.add(hexGroup);

    const hexRadius = 1.15;
    const hexHeight = 0.15;
    const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6);

    // Create 19 H3 cells in rings
    const ringCoords: [number, number, number][] = [
      [0, 0, 0], // Center
      // Ring 1
      [1.8, 0, 1.05],
      [0, 0, 2.1],
      [-1.8, 0, 1.05],
      [-1.8, 0, -1.05],
      [0, 0, -2.1],
      [1.8, 0, -1.05],
      // Ring 2 outer
      [3.6, 0, 0],
      [3.6, 0, 2.1],
      [1.8, 0, 3.15],
      [0, 0, 4.2],
      [-1.8, 0, 3.15],
      [-3.6, 0, 2.1],
      [-3.6, 0, 0],
      [-3.6, 0, -2.1],
      [-1.8, 0, -3.15],
      [0, 0, -4.2],
      [1.8, 0, -3.15],
      [3.6, 0, -2.1],
    ];

    ringCoords.forEach((coord, idx) => {
      // Plume elevation simulation: center has lower smog, outer industrial has higher smog elevation
      const elevation = idx === 0 ? 0.05 : (Math.sin(idx * 1.3) * 0.12 + 0.1);
      const isClean = idx === 0 || idx === 1 || idx === 3;

      const hexMat = new THREE.MeshStandardMaterial({
        color: isClean ? 0x141a24 : 0x1e1e28,
        roughness: 0.35,
        metalness: 0.7,
      });

      const hexMesh = new THREE.Mesh(hexGeometry, hexMat);
      hexMesh.position.set(coord[0], elevation, coord[2]);
      hexMesh.rotation.y = Math.PI / 6;
      hexGroup.add(hexMesh);

      // Hex perimeter wire
      const edgeGeo = new THREE.EdgesGeometry(hexGeometry);
      const edgeMat = new THREE.LineBasicMaterial({
        color: isClean ? 0x38bdf8 : 0x475569,
        transparent: true,
        opacity: 0.35,
      });
      const wire = new THREE.LineSegments(edgeGeo, edgeMat);
      wire.position.copy(hexMesh.position);
      wire.rotation.copy(hexMesh.rotation);
      hexGroup.add(wire);
    });

    // Add Glowing Neighbor Domes on H3 cells
    INITIAL_NEIGHBOR_DOMES.forEach((dome) => {
      const domeSubGroup = new THREE.Group();
      domeSubGroup.position.set(dome.hexOffset[0], 0.25, dome.hexOffset[1]);
      scene.add(domeSubGroup);

      // Mini glass dome
      const miniDomeGeo = new THREE.SphereGeometry(0.32, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const miniDomeMat = new THREE.MeshPhysicalMaterial({
        color: dome.indoorPm25 < 25 ? 0x34d399 : dome.indoorPm25 < 60 ? 0x38bdf8 : 0xf87171,
        transmission: 0.85,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
      });
      const miniDome = new THREE.Mesh(miniDomeGeo, miniDomeMat);
      domeSubGroup.add(miniDome);

      // Center glowing marker
      const coreGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const coreMat = new THREE.MeshBasicMaterial({
        color: dome.indoorPm25 < 25 ? 0x34d399 : dome.indoorPm25 < 60 ? 0x38bdf8 : 0xf87171,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 0.12;
      domeSubGroup.add(core);

      // Halo ring
      const haloGeo = new THREE.RingGeometry(0.36, 0.42, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: dome.indoorPm25 < 25 ? 0x34d399 : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.02;
      domeSubGroup.add(halo);
    });

    // Add Incident Beacons (Flashing beacons for waste burning & construction dust)
    const beaconGroup = new THREE.Group();
    scene.add(beaconGroup);

    INITIAL_INCIDENT_BEACONS.forEach((beacon, i) => {
      const bGeo = new THREE.ConeGeometry(0.12, 0.35, 12);
      const bMat = new THREE.MeshBasicMaterial({
        color: beacon.type === 'waste_burning' ? 0xf87171 : 0xfbbf24,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.rotation.x = Math.PI;
      const x = i === 0 ? 1.4 : i === 1 ? -1.2 : 2.6;
      const z = i === 0 ? -1.5 : i === 1 ? 1.8 : 0.8;
      bMesh.position.set(x, 0.45, z);
      beaconGroup.add(bMesh);
    });

    // Smooth Orbit & Mouse Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let angleY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      angleY += dx * 0.005;
      hexGroup.rotation.y = angleY;
      beaconGroup.rotation.y = angleY;
    };
    const handleMouseUp = () => (isDragging = false);

    const el = renderer.domElement;
    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Subtle atmospheric wave float
      beaconGroup.children.forEach((b, idx) => {
        b.position.y = 0.45 + Math.sin(elapsed * 3 + idx) * 0.06;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden apple-glass-card">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header HUD */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto apple-glass px-4 py-2.5 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">H3 Resolution-7 Biome</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Grid Cell #87283082bffffff</span>
            <span className="text-xs text-emerald-400">5.16 km² Cluster</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <div className="apple-glass px-3 py-1.5 rounded-xl text-xs text-neutral-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>5 Active Household Domes</span>
          </div>
        </div>
      </div>

      {/* Bottom Tenant Cards & Incident Panel */}
      <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex flex-col md:flex-row items-end justify-between gap-4">
        {/* Selected Dome Details */}
        <div className="pointer-events-auto apple-glass p-4 rounded-2xl max-w-sm w-full">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white">{selectedDome.tenantName}</p>
            <span className="text-xs text-sky-400 font-medium">{selectedDome.indoorPm25} µg/m³ PM₂.₅</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">{selectedDome.activeHack}</p>
          <div className="mt-3 flex items-center gap-2">
            {INITIAL_NEIGHBOR_DOMES.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDome(d)}
                className={`text-[10px] px-2 py-1 rounded-lg transition-all ${
                  selectedDome.id === d.id
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                }`}
              >
                {d.tenantName.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Crowdsourced Incidents */}
        <div className="pointer-events-auto apple-glass p-3 rounded-2xl flex items-center gap-3">
          {INITIAL_INCIDENT_BEACONS.map((inc) => (
            <div key={inc.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04]">
              <span className={`w-2 h-2 rounded-full ${inc.type === 'waste_burning' ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <p className="text-[11px] font-medium text-white capitalize">{inc.type.replace('_', ' ')}</p>
                <p className="text-[10px] text-neutral-400">{inc.relativeDistanceKm} km away • {inc.verifiedCount} verified</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
