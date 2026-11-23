import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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
  outdoorPm25,
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
  const petGroupRef = useRef<THREE.Group | null>(null);
  const tailRef = useRef<THREE.Group | null>(null);
  const earLRef = useRef<THREE.Mesh | null>(null);
  const earRRef = useRef<THREE.Mesh | null>(null);
  const domeMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const streamLinesRef = useRef<THREE.Group | null>(null);
  const n95MaskMeshRef = useRef<THREE.Mesh | null>(null);
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

    // Scene with Stripe deep navy #1c1e54 atmosphere
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3.5, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Stripe electric indigo rim light
    const rimLight = new THREE.DirectionalLight(0x533afd, 2.0);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Warm fill light
    const warmFillLight = new THREE.DirectionalLight(0xf5e9d4, 0.6);
    warmFillLight.position.set(0, -2, 3);
    scene.add(warmFillLight);

    // Glowing pet heart/bloom light
    const bloomLight = new THREE.PointLight(0x533afd, 2.2, 4);
    bloomLight.position.set(0, 0.6, 0);
    scene.add(bloomLight);
    bloomLightRef.current = bloomLight;

    // Pedestal Base (Stripe deep navy cylinder with precision etched ring)
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const baseGeo = new THREE.CylinderGeometry(1.65, 1.75, 0.14, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1c1e54,
      roughness: 0.3,
      metalness: 0.8,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.07;
    baseMesh.receiveShadow = true;
    baseGroup.add(baseMesh);

    // Precision etched ring on base in electric indigo
    const ringGeo = new THREE.TorusGeometry(1.58, 0.008, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x533afd, transparent: true, opacity: 0.5 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.005;
    baseGroup.add(ringMesh);

    // Inner Terrarium Soil disc
    const soilGeo = new THREE.CylinderGeometry(1.52, 1.52, 0.04, 48);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x0f112e,
      roughness: 0.9,
      metalness: 0.1,
    });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = 0.01;
    soilMesh.receiveShadow = true;
    baseGroup.add(soilMesh);

    // Glass Dome (Physics-inspired dome)
    const domeGeo = new THREE.SphereGeometry(1.5, 48, 36, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      opacity: 0.35,
      transparent: true,
      roughness: 0.08,
      metalness: 0.1,
      ior: 1.48,
      specularIntensity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.y = 0.02;
    scene.add(domeMesh);
    domeMeshRef.current = domeMesh;

    // Atmospheric Familiar: "Lumi the Cloud Fox"
    const petGroup = new THREE.Group();
    petGroup.position.set(0, 0.5, 0);
    scene.add(petGroup);
    petGroupRef.current = petGroup;

    // Fox Body (Pearl/Cloud ellipsoid)
    const bodyGeo = new THREE.SphereGeometry(0.38, 32, 24);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.45,
      metalness: 0.15,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    petGroup.add(bodyMesh);

    // Fox Ears
    const earGeo = new THREE.ConeGeometry(0.11, 0.24, 16);
    const earMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.5,
    });

    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(-0.16, 0.38, 0.02);
    earL.rotation.z = 0.25;
    earL.rotation.x = -0.1;
    earL.castShadow = true;
    petGroup.add(earL);
    earLRef.current = earL;

    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(0.16, 0.38, 0.02);
    earR.rotation.z = -0.25;
    earR.rotation.x = -0.1;
    earR.castShadow = true;
    petGroup.add(earR);
    earRRef.current = earR;

    // Eyes (Deep navy ink spheres)
    const eyeGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x0d253d,
      roughness: 0.1,
      metalness: 0.9,
    });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.11, 0.08, 0.34);
    petGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.11, 0.08, 0.34);
    petGroup.add(eyeR);

    // Glowing pupil glints
    const glintGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0x533afd });
    const glintL = new THREE.Mesh(glintGeo, glintMat);
    glintL.position.set(-0.10, 0.09, 0.375);
    petGroup.add(glintL);

    const glintR = new THREE.Mesh(glintGeo, glintMat);
    glintR.position.set(0.12, 0.09, 0.375);
    petGroup.add(glintR);

    // Snout & Nose
    const snoutGeo = new THREE.ConeGeometry(0.07, 0.14, 16);
    const snoutMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.02, 0.4);
    petGroup.add(snout);

    const noseGeo = new THREE.SphereGeometry(0.022, 12, 12);
    const noseMat = new THREE.MeshBasicMaterial({ color: 0x0d253d });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.02, 0.47);
    petGroup.add(nose);

    // Crystalline Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.05, -0.32);
    petGroup.add(tailGroup);
    tailRef.current = tailGroup;

    for (let i = 0; i < 5; i++) {
      const segGeo = new THREE.SphereGeometry(0.16 - i * 0.022, 16, 16);
      const segMat = new THREE.MeshPhysicalMaterial({
        color: 0x533afd,
        transmission: 0.7,
        roughness: 0.15,
        opacity: 0.85,
        transparent: true,
      });
      const seg = new THREE.Mesh(segGeo, segMat);
      seg.position.set(0, i * 0.11, -i * 0.08);
      tailGroup.add(seg);
    }

    // N95 Miniature Shield
    const n95Geo = new THREE.CylinderGeometry(0.15, 0.11, 0.12, 24, 1, true, 0, Math.PI);
    const n95Mat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
    });
    const n95Mask = new THREE.Mesh(n95Geo, n95Mat);
    n95Mask.rotation.x = Math.PI * 0.45;
    n95Mask.position.set(0, 0.03, 0.38);
    petGroup.add(n95Mask);
    n95MaskMeshRef.current = n95Mask;

    // Volumetric Smog Particles
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 1.35;
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 1.3;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y + 0.1;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      velocities[i * 3] = (Math.random() - 0.5) * 0.004;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.045,
      transparent: true,
      opacity: 0.25,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Airflow Streamlines
    const streamGroup = new THREE.Group();
    scene.add(streamGroup);
    streamLinesRef.current = streamGroup;

    for (let i = 0; i < 8; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.2, 0.2 + i * 0.14, -0.6),
        new THREE.Vector3(-0.4, 0.7 + i * 0.08, 0.5),
        new THREE.Vector3(0.5, 0.9 - i * 0.05, 0.3),
        new THREE.Vector3(1.2, 0.3 + i * 0.1, -0.4),
      ]);
      const lineGeo = new THREE.TubeGeometry(curve, 32, 0.012, 8, false);
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0x533afd,
        transparent: true,
        opacity: 0.0,
      });
      const tube = new THREE.Mesh(lineGeo, lineMat);
      streamGroup.add(tube);
    }

    // Interaction Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0.3;
    let currentRotationY = 0.3;
    let targetRotationX = 0.15;
    let currentRotationX = 0.15;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      targetRotationY += deltaX * 0.006;
      targetRotationX = Math.max(-0.2, Math.min(0.6, targetRotationX + deltaY * 0.005));
    };
    const onMouseUp = () => (isDragging = false);

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;

      const radius = 5.2;
      camera.position.x = Math.sin(currentRotationY) * radius * Math.cos(currentRotationX);
      camera.position.z = Math.cos(currentRotationY) * radius * Math.cos(currentRotationX);
      camera.position.y = 2.2 + Math.sin(currentRotationX) * 2.0;
      camera.lookAt(0, 0.65, 0);

      if (petGroupRef.current) {
        petGroupRef.current.position.y = 0.52 + Math.sin(elapsed * 1.8) * 0.04;
        petGroupRef.current.rotation.y = Math.sin(elapsed * 0.6) * 0.15;
      }
      if (tailRef.current) {
        tailRef.current.rotation.y = Math.sin(elapsed * 2.4) * 0.28;
        tailRef.current.rotation.z = Math.cos(elapsed * 1.6) * 0.14;
      }
      if (earLRef.current && earRRef.current) {
        earLRef.current.rotation.z = 0.25 + Math.sin(elapsed * 3.5) * 0.05;
        earRRef.current.rotation.z = -0.25 - Math.sin(elapsed * 3.5) * 0.05;
      }

      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position;
        if (posAttr) {
          const arr = posAttr.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            arr[i * 3] += velocities[i * 3]!;
            arr[i * 3 + 1] += velocities[i * 3 + 1]!;
            arr[i * 3 + 2] += velocities[i * 3 + 2]!;
            const dist = Math.sqrt(arr[i * 3]! ** 2 + arr[i * 3 + 2]! ** 2);
            if (dist > 1.35 || arr[i * 3 + 1]! > 1.38 || arr[i * 3 + 1]! < 0.08) {
              arr[i * 3] = (Math.random() - 0.5) * 1.2;
              arr[i * 3 + 1] = 0.2 + Math.random() * 0.8;
              arr[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      if (streamLinesRef.current) {
        streamLinesRef.current.rotation.y = elapsed * 0.7;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update dynamic atmospheric shaders based on indoor PM2.5
  useEffect(() => {
    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      if (indoorPm25 < 15) {
        mat.opacity = 0.06;
        mat.color.setHex(0x533afd); // Electric Indigo
      } else if (indoorPm25 < 60) {
        mat.opacity = 0.28;
        mat.color.setHex(0x9b6829); // Sherbet Lemon/Amber
      } else {
        mat.opacity = Math.min(0.85, 0.35 + (indoorPm25 / 300) * 0.5);
        mat.color.setHex(0x64748d); // Ink Mute
      }
    }

    if (domeMeshRef.current) {
      const domeMat = domeMeshRef.current.material as THREE.MeshPhysicalMaterial;
      if (indoorPm25 < 15) {
        domeMat.color.setHex(0xffffff);
        domeMat.transmission = 0.92;
      } else if (indoorPm25 < 60) {
        domeMat.color.setHex(0xf5e9d4); // Canvas Cream
        domeMat.transmission = 0.85;
      } else {
        domeMat.color.setHex(0xd1d5db);
        domeMat.transmission = 0.65;
      }
    }

    if (n95MaskMeshRef.current) {
      const maskMat = n95MaskMeshRef.current.material as THREE.MeshPhysicalMaterial;
      if (indoorPm25 > 90) {
        maskMat.opacity = THREE.MathUtils.lerp(maskMat.opacity, 0.92, 0.1);
      } else {
        maskMat.opacity = THREE.MathUtils.lerp(maskMat.opacity, 0.0, 0.15);
      }
    }

    if (bloomLightRef.current) {
      if (indoorPm25 < 15) {
        bloomLightRef.current.color.setHex(0x533afd); // Electric Indigo
        bloomLightRef.current.intensity = 2.4;
      } else if (indoorPm25 < 60) {
        bloomLightRef.current.color.setHex(0x9b6829); // Lemon
        bloomLightRef.current.intensity = 1.8;
      } else {
        bloomLightRef.current.color.setHex(0xea2261); // Ruby
        bloomLightRef.current.intensity = 1.4;
      }
    }

    if (streamLinesRef.current) {
      streamLinesRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const lineMat = mesh.material as THREE.MeshBasicMaterial;
        lineMat.opacity = isScrubbingAirflow ? 0.75 : 0.0;
      });
    }
  }, [indoorPm25, isScrubbingAirflow]);

  return (
    <div className="w-full card-dashboard-chrome overflow-hidden">
      {/* Stripe Dark-App Faux IDE / Window Header Bar */}
      <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between bg-[#141642]">
        <div className="flex items-center gap-3">
          {/* Faux Window Controls: Ruby, Lemon, Emerald */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ea2261]" />
            <div className="w-3 h-3 rounded-full bg-[#9b6829]" />
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
            <span className={`w-1.5 h-1.5 rounded-full ${indoorPm25 < 25 ? 'bg-[#34d399]' : indoorPm25 < 100 ? 'bg-[#9b6829]' : 'bg-[#ea2261] animate-ping'}`} />
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

        {/* Floating Bio-Indicator Telemetry Card (Deep navy composite) */}
        <div className="absolute top-4 left-4 p-4 rounded-xl bg-[#1c1e54]/90 backdrop-blur-md border border-white/10 max-w-xs pointer-events-auto shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white font-normal">Atmospheric Familiar: Lumi</span>
            {indoorPm25 > 90 && (
              <span className="text-[10px] text-[#ea2261] px-1.5 py-0.5 rounded bg-[#ea2261]/20 font-mono">
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

        {/* Interactive IAQ Switchboard (Pill-shaped buttons inside dark shell) */}
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
