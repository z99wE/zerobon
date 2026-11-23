import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { INITIAL_NEIGHBOR_DOMES, INITIAL_INCIDENT_BEACONS } from '../engine/tenancy';
import { H3NeighborDome } from '../types';

interface H3CommunityBiomeProps {
  tenantId: string;
}

export const H3CommunityBiome: React.FC<H3CommunityBiomeProps> = ({ tenantId: _tenantId }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const defaultDome = INITIAL_NEIGHBOR_DOMES[0] ?? {
    id: 'dome-chen',
    tenantName: 'Chen Family (You)',
    hexOffset: [0, 0] as [number, number],
    indoorPm25: 18,
    petStatus: 'calm' as const,
    activeHack: 'Corsi-Rosenthal Box active',
  };
  const [selectedDome, setSelectedDome] = useState<H3NeighborDome>(defaultDome);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x13153d);
    scene.fog = new THREE.FogExp2(0x13153d, 0.04);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 10, 6);
    scene.add(dirLight);

    const indigoLight = new THREE.DirectionalLight(0x533afd, 1.5);
    indigoLight.position.set(-6, 4, -4);
    scene.add(indigoLight);

    // H3 Hexagonal Grid generation
    const hexGroup = new THREE.Group();
    scene.add(hexGroup);

    const hexRadius = 1.15;
    const hexHeight = 0.15;
    const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6);

    const ringCoords: [number, number, number][] = [
      [0, 0, 0],
      [1.8, 0, 1.05],
      [0, 0, 2.1],
      [-1.8, 0, 1.05],
      [-1.8, 0, -1.05],
      [0, 0, -2.1],
      [1.8, 0, -1.05],
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
      const elevation = idx === 0 ? 0.05 : (Math.sin(idx * 1.3) * 0.12 + 0.1);
      const isClean = idx === 0 || idx === 1 || idx === 3;

      const hexMat = new THREE.MeshStandardMaterial({
        color: isClean ? 0x1c1e54 : 0x16183d,
        roughness: 0.35,
        metalness: 0.7,
      });

      const hexMesh = new THREE.Mesh(hexGeometry, hexMat);
      hexMesh.position.set(coord[0], elevation, coord[2]);
      hexMesh.rotation.y = Math.PI / 6;
      hexGroup.add(hexMesh);

      const edgeGeo = new THREE.EdgesGeometry(hexGeometry);
      const edgeMat = new THREE.LineBasicMaterial({
        color: isClean ? 0x533afd : 0x2e3368,
        transparent: true,
        opacity: 0.6,
      });
      const wire = new THREE.LineSegments(edgeGeo, edgeMat);
      wire.position.copy(hexMesh.position);
      wire.rotation.copy(hexMesh.rotation);
      hexGroup.add(wire);
    });

    // Add Glowing Neighbor Domes
    INITIAL_NEIGHBOR_DOMES.forEach((dome) => {
      const domeSubGroup = new THREE.Group();
      domeSubGroup.position.set(dome.hexOffset[0], 0.25, dome.hexOffset[1]);
      scene.add(domeSubGroup);

      const miniDomeGeo = new THREE.SphereGeometry(0.32, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const miniDomeMat = new THREE.MeshPhysicalMaterial({
        color: dome.indoorPm25 < 25 ? 0x34d399 : dome.indoorPm25 < 60 ? 0x533afd : 0xea2261,
        transmission: 0.85,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
      });
      const miniDome = new THREE.Mesh(miniDomeGeo, miniDomeMat);
      domeSubGroup.add(miniDome);

      const coreGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const coreMat = new THREE.MeshBasicMaterial({
        color: dome.indoorPm25 < 25 ? 0x34d399 : dome.indoorPm25 < 60 ? 0x533afd : 0xea2261,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 0.12;
      domeSubGroup.add(core);
    });

    // Add Incident Beacons
    const beaconGroup = new THREE.Group();
    scene.add(beaconGroup);

    INITIAL_INCIDENT_BEACONS.forEach((beacon, i) => {
      const bGeo = new THREE.ConeGeometry(0.12, 0.35, 12);
      const bMat = new THREE.MeshBasicMaterial({
        color: beacon.type === 'waste_burning' ? 0xea2261 : 0x9b6829,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.rotation.x = Math.PI;
      const x = i === 0 ? 1.4 : i === 1 ? -1.2 : 2.6;
      const z = i === 0 ? -1.5 : i === 1 ? 1.8 : 0.8;
      bMesh.position.set(x, 0.45, z);
      beaconGroup.add(bMesh);
    });

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
    <div className="w-full card-dashboard-chrome overflow-hidden">
      {/* Chrome header */}
      <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between bg-[#141642]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ea2261]" />
            <div className="w-3 h-3 rounded-full bg-[#9b6829]" />
            <div className="w-3 h-3 rounded-full bg-[#34d399]" />
          </div>
          <span className="text-white/40 text-xs font-mono">|</span>
          <span className="text-white/80 font-tabular text-xs">
            mesh://h3-grid.cell#87283082bffffff
          </span>
        </div>
        <span className="pill-tag-soft">Uber H3 Res-7 Mesh</span>
      </div>

      <div className="relative w-full h-[500px]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Selected Dome Details Card */}
        <div className="absolute top-4 left-4 p-4 rounded-xl bg-[#1c1e54]/95 backdrop-blur-md border border-white/10 max-w-sm pointer-events-auto shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-light text-white">{selectedDome.tenantName}</span>
            <span className="font-tabular text-xs text-[#b9b9f9]">{selectedDome.indoorPm25} µg/m³</span>
          </div>
          <p className="text-xs text-white/70 font-light mt-1">{selectedDome.activeHack}</p>

          <div className="mt-3 flex items-center gap-1.5">
            {INITIAL_NEIGHBOR_DOMES.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDome(d)}
                className={`text-[11px] px-2.5 py-1 rounded-full transition-all ${
                  selectedDome.id === d.id
                    ? 'bg-[#533afd] text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {d.tenantName.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Beacons pill bar */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-end gap-2 pointer-events-none">
          {INITIAL_INCIDENT_BEACONS.map((inc) => (
            <div
              key={inc.id}
              className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1e54]/90 border border-white/10 text-xs text-white/90"
            >
              <span className={`w-2 h-2 rounded-full ${inc.type === 'waste_burning' ? 'bg-[#ea2261] animate-pulse' : 'bg-[#9b6829]'}`} />
              <span className="capitalize">{inc.type.replace('_', ' ')}</span>
              <span className="font-tabular text-white/50 text-[11px]">({inc.relativeDistanceKm} km away)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
