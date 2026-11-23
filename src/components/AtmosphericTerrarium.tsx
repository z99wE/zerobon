import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  createStudioLighting,
  createTerrariumBaseAndDome,
  createAtmosphericFamiliar,
  createParticulateCloud,
  createAirflowStreamlines,
  PetMeshCollection,
} from '../engine/three-builders';

interface AtmosphericTerrariumProps {
  indoorPm25: number;
  outdoorPm25: number;
  activeHacks: {
    corsiRosenthal: boolean;
    kitchenExhaust: boolean;
    draftSealing: boolean;
    windowOpen: boolean;
  };
  onTriggerHackToggle: (key: 'corsiRosenthal' | 'kitchenExhaust' | 'draftSealing' | 'windowOpen') => void;
  onOpenReceipt: () => void;
}

export const AtmosphericTerrarium: React.FC<AtmosphericTerrariumProps> = ({
  indoorPm25,
  outdoorPm25: _outdoorPm25,
  activeHacks,
  onTriggerHackToggle,
  onOpenReceipt,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isScrubbingAirflow, setIsScrubbingAirflow] = useState(false);

  // References to Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const petRef = useRef<PetMeshCollection | null>(null);
  const domeMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const streamLinesRef = useRef<THREE.Group | null>(null);
  const bloomLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    if (activeHacks.corsiRosenthal || activeHacks.kitchenExhaust || activeHacks.windowOpen) {
      setIsScrubbingAirflow(true);
      const timer = setTimeout(() => setIsScrubbingAirflow(false), 3200);
      return () => clearTimeout(timer);
    }
  }, [activeHacks.corsiRosenthal, activeHacks.kitchenExhaust, activeHacks.windowOpen]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene with Stripe deep navy #13153d atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x13153d);
    scene.fog = new THREE.FogExp2(0x13153d, 0.035);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio Lighting
    bloomLightRef.current = createStudioLighting(scene);

    // Pedestal Base & Glass Dome
    const { domeMesh } = createTerrariumBaseAndDome(scene);
    domeMeshRef.current = domeMesh;

    // Atmospheric Familiar
    const petMeshes = createAtmosphericFamiliar(scene);
    petRef.current = petMeshes;

    // Particulate Cloud
    const particleCount = 450;
    const { particles, velocities } = createParticulateCloud(scene, particleCount);
    particlesRef.current = particles;

    // Airflow Vortex Streamlines
    const streamLines = createAirflowStreamlines(scene);
    streamLinesRef.current = streamLines;

    // Orbit controls manual damping variables
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let sphericalTheta = 0;
    let sphericalPhi = 1.15;
    const radius = 5.2;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      sphericalTheta -= deltaX * 0.006;
      sphericalPhi = Math.max(0.65, Math.min(1.45, sphericalPhi - deltaY * 0.005));

      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0.6, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Atmospheric Familiar Idle Harmonics
      if (petRef.current) {
        const { petGroup, tailGroup, earL, earR } = petRef.current;
        // Breathing pulse
        const breath = Math.sin(time * 2.2) * 0.035;
        petGroup.scale.set(1 + breath, 1 + breath * 1.15, 1 + breath * 0.85);

        // Subtle floating bobbing
        petGroup.position.y = 0.5 + Math.sin(time * 1.6) * 0.04;

        // Tail harmonic waving
        tailGroup.children.forEach((seg, idx) => {
          seg.rotation.x = Math.sin(time * 2.8 + idx * 0.4) * 0.12;
          seg.rotation.y = Math.cos(time * 2.1 + idx * 0.5) * 0.08;
        });

        // Ear alert twitches
        earL.rotation.z = 0.25 + Math.sin(time * 3.5) * 0.03;
        earR.rotation.z = -0.25 - Math.sin(time * 3.5) * 0.03;
      }

      // Volumetric Smog Particulate Movement
      if (particles) {
        const positions = particles.geometry.attributes.position;
        if (positions) {
          const arr = positions.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            arr[i * 3] = (arr[i * 3] ?? 0) + (velocities[i * 3] ?? 0);
            arr[i * 3 + 1] = (arr[i * 3 + 1] ?? 0) + (velocities[i * 3 + 1] ?? 0);
            arr[i * 3 + 2] = (arr[i * 3 + 2] ?? 0) + (velocities[i * 3 + 2] ?? 0);

            const x = arr[i * 3] ?? 0;
            const y = arr[i * 3 + 1] ?? 0;
            const z = arr[i * 3 + 2] ?? 0;
            const dist = Math.sqrt(x ** 2 + z ** 2);
            if (dist > 1.35 || y > 1.38 || y < 0.08) {
              arr[i * 3] = (Math.random() - 0.5) * 1.1;
              arr[i * 3 + 1] = Math.random() * 0.9 + 0.15;
              arr[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
            }
          }
          positions.needsUpdate = true;
        }
      }

      // Streamlines rotation when active
      if (streamLines && streamLines.visible) {
        streamLines.rotation.y += 0.045;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Visual State from Mass-Balance Physics and Active Interventions
  useEffect(() => {
    // 1. Update N95 Mask Visibility
    if (petRef.current) {
      petRef.current.n95Mask.visible = indoorPm25 > 90;
    }

    // 2. Volumetric Particle Density and Smog Color
    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      const targetOpacity = Math.min(0.85, Math.max(0.04, (indoorPm25 / 280) * 0.85));
      mat.opacity = targetOpacity;

      const colors = particlesRef.current.geometry.attributes.color;
      if (colors) {
        const arr = colors.array as Float32Array;
        const rVal = indoorPm25 > 120 ? 0.72 : indoorPm25 > 45 ? 0.60 : 0.45;
        const gVal = indoorPm25 > 120 ? 0.38 : indoorPm25 > 45 ? 0.52 : 0.65;
        const bVal = indoorPm25 > 120 ? 0.28 : indoorPm25 > 45 ? 0.60 : 0.92;

        for (let i = 0; i < arr.length; i += 3) {
          arr[i] = rVal;
          arr[i + 1] = gVal;
          arr[i + 2] = bVal;
        }
        colors.needsUpdate = true;
      }
    }

    // 3. Airflow Streamlines Vortex
    if (streamLinesRef.current) {
      streamLinesRef.current.visible = isScrubbingAirflow;
      streamLinesRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = isScrubbingAirflow ? 0.65 : 0.0;
        mat.color.set(activeHacks.windowOpen ? 0x34d399 : 0x533afd);
      });
    }

    // 4. Glow light reflecting health
    if (bloomLightRef.current) {
      if (indoorPm25 < 25) {
        bloomLightRef.current.color.set(0x34d399); // Emerald calm
        bloomLightRef.current.intensity = 2.4;
      } else if (indoorPm25 < 85) {
        bloomLightRef.current.color.set(0x533afd); // Electric indigo
        bloomLightRef.current.intensity = 2.0;
      } else {
        bloomLightRef.current.color.set(0xe11d48); // Ruby warning
        bloomLightRef.current.intensity = 2.8;
      }
    }
  }, [indoorPm25, isScrubbingAirflow, activeHacks.windowOpen]);

  return (
    <div className="w-full card-dashboard-chrome relative rounded-2xl overflow-hidden shadow-2xl">
      {/* Dashboard Top Header Bar (Deep Navy Chrome #1c1e54) */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16183d]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ea2261]" />
            <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
            <div className="w-3 h-3 rounded-full bg-[#34d399]" />
          </div>
          <span className="text-white/40 text-xs font-mono">|</span>
          <span className="text-white/80 font-tabular text-xs font-normal">
            zerobon-core://terrarium.wasm.rs
          </span>
        </div>

        {/* Tabular Telemetry Header Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                indoorPm25 < 25 ? 'bg-[#34d399]' : indoorPm25 < 100 ? 'bg-[#854d0e]' : 'bg-[#e11d48] animate-ping'
              }`}
            />
            <span className="font-tabular text-xs text-white/90">
              Indoor: <strong className="text-white font-medium">{Math.round(indoorPm25)} µg/m³</strong>
            </span>
          </div>

          <button
            onClick={onOpenReceipt}
            className="text-xs font-light text-[#b9b9f9] hover:text-white transition-colors"
          >
            Deterministic Receipt →
          </button>
        </div>
      </div>

      {/* 3D Viewport with Overlay Controls */}
      <div className="relative w-full h-[520px]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Bio-Indicator Telemetry Card */}
        <div className="absolute top-4 left-4 p-4 rounded-xl bg-[#1c1e54]/90 backdrop-blur-md border border-white/10 max-w-xs pointer-events-auto shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white font-normal">Atmospheric Familiar: Lumi</span>
            {indoorPm25 > 90 && (
              <span className="text-[10px] text-[#e11d48] px-1.5 py-0.5 rounded bg-[#e11d48]/20 font-mono">
                N95 Deployed
              </span>
            )}
          </div>
          <p className="text-xs text-white/70 font-light leading-relaxed">
            {indoorPm25 < 15
              ? 'Pristine indoor boundary layer. Tail crystal humming at 1.8 Hz.'
              : indoorPm25 < 60
              ? 'Moderate penetration. Habit loop prompt: schedule midday airing.'
              : 'Severe winter smog infiltration. N95 shield active; engage Corsi-Rosenthal unit.'}
          </p>
        </div>

        {/* Interactive IAQ Switchboard */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto flex flex-wrap gap-2" role="group" aria-label="Indoor air quality interventions">
            <button
              onClick={() => onTriggerHackToggle('corsiRosenthal')}
              aria-pressed={activeHacks.corsiRosenthal}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
                activeHacks.corsiRosenthal
                  ? 'bg-[#533afd] text-white shadow-md shadow-[#533afd]/40'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Corsi-Rosenthal Box (+350 CADR)
            </button>

            <button
              onClick={() => onTriggerHackToggle('kitchenExhaust')}
              aria-pressed={activeHacks.kitchenExhaust}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
                activeHacks.kitchenExhaust
                  ? 'bg-[#533afd] text-white shadow-md shadow-[#533afd]/40'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Kitchen Exhaust Purge
            </button>

            <button
              onClick={() => onTriggerHackToggle('draftSealing')}
              aria-pressed={activeHacks.draftSealing}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
                activeHacks.draftSealing
                  ? 'bg-[#533afd] text-white shadow-md shadow-[#533afd]/40'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Draft Sash Seal (P: 0.38)
            </button>

            <button
              onClick={() => onTriggerHackToggle('windowOpen')}
              aria-pressed={activeHacks.windowOpen}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#34d399] ${
                activeHacks.windowOpen
                  ? 'bg-[#34d399] text-[#0d253d] font-medium shadow-md shadow-[#34d399]/40'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {activeHacks.windowOpen ? 'Window Airing Active' : 'Window Closed'}
            </button>
          </div>

          <div className="pointer-events-auto">
            <button
              onClick={onOpenReceipt}
              className="button-primary-pill"
              aria-label="Generate Deterministic Breath Receipt"
            >
              Generate Breath Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
