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
  const [cameraMode, setCameraMode] = useState<'orbit' | 'front' | 'top'>('orbit');
  const [isScrubbingAirflow, setIsScrubbingAirflow] = useState(false);

  // References to Three.js objects for live updates
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

  // Airflow trigger effect
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

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050507);
    scene.fog = new THREE.FogExp2(0x050507, 0.035);

    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.2);
    cameraRef.current = camera;

    // Renderer with Apple-grade power scaling
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
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(3.5, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const warmFillLight = new THREE.DirectionalLight(0xfef08a, 0.6);
    warmFillLight.position.set(0, -2, 3);
    scene.add(warmFillLight);

    // Glowing pet heart/bloom light
    const bloomLight = new THREE.PointLight(0x38bdf8, 2.0, 4);
    bloomLight.position.set(0, 0.6, 0);
    scene.add(bloomLight);
    bloomLightRef.current = bloomLight;

    // Pedestal Base (Apple-style polished titanium cylinder with etched rings)
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const baseGeo = new THREE.CylinderGeometry(1.65, 1.75, 0.14, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x16161c,
      roughness: 0.25,
      metalness: 0.85,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.07;
    baseMesh.receiveShadow = true;
    baseGroup.add(baseMesh);

    // Precision etched ring on base
    const ringGeo = new THREE.TorusGeometry(1.58, 0.008, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.005;
    baseGroup.add(ringMesh);

    // Inner Terrarium Soil/Moss disc
    const soilGeo = new THREE.CylinderGeometry(1.52, 1.52, 0.04, 48);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x111612,
      roughness: 0.9,
      metalness: 0.1,
    });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = 0.01;
    soilMesh.receiveShadow = true;
    baseGroup.add(soilMesh);

    // Glass Dome (Physics-inspired dome with physical refraction, Fresnel and transparency)
    const domeGeo = new THREE.SphereGeometry(1.5, 48, 36, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      opacity: 0.35,
      transparent: true,
      roughness: 0.08,
      metalness: 0.1,
      ior: 1.48, // crown glass
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
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

    // Pet Body (Floating soft pearl/cloud ellipsoid)
    const bodyGeo = new THREE.SphereGeometry(0.38, 32, 24);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.45,
      metalness: 0.15,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    petGroup.add(bodyMesh);

    // Fox Ears
    const earGeo = new THREE.ConeGeometry(0.11, 0.24, 16);
    const earMat = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
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

    // Eyes (Two dark obsidian reflective spheres)
    const eyeGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x050507,
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
    const glintMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const glintL = new THREE.Mesh(glintGeo, glintMat);
    glintL.position.set(-0.10, 0.09, 0.375);
    petGroup.add(glintL);

    const glintR = new THREE.Mesh(glintGeo, glintMat);
    glintR.position.set(0.12, 0.09, 0.375);
    petGroup.add(glintR);

    // Fox Snout
    const snoutGeo = new THREE.ConeGeometry(0.07, 0.14, 16);
    const snoutMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.02, 0.4);
    petGroup.add(snout);

    // Little Nose
    const noseGeo = new THREE.SphereGeometry(0.022, 12, 12);
    const noseMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.02, 0.47);
    petGroup.add(nose);

    // Crystalline C-Curved Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.05, -0.32);
    petGroup.add(tailGroup);
    tailRef.current = tailGroup;

    for (let i = 0; i < 5; i++) {
      const segGeo = new THREE.SphereGeometry(0.16 - i * 0.022, 16, 16);
      const segMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.7,
        roughness: 0.15,
        opacity: 0.85,
        transparent: true,
      });
      const seg = new THREE.Mesh(segGeo, segMat);
      seg.position.set(0, i * 0.11, -i * 0.08);
      tailGroup.add(seg);
    }

    // N95 Miniature Shield (Holographic mask visible when indoor PM2.5 > 100)
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

    // Volumetric Smog Particles inside dome
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
      blending: THREE.NormalBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Airflow Streamlines (Scrubbing Vortex)
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
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.0,
      });
      const tube = new THREE.Mesh(lineGeo, lineMat);
      streamGroup.add(tube);
    }

    // Interaction Drag Controls (Smooth Apple-style orbital inertia)
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

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0]!.clientX;
        prevMouseY = e.touches[0]!.clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0]!.clientX - prevMouseX;
      const deltaY = e.touches[0]!.clientY - prevMouseY;
      prevMouseX = e.touches[0]!.clientX;
      prevMouseY = e.touches[0]!.clientY;
      targetRotationY += deltaX * 0.006;
      targetRotationX = Math.max(-0.2, Math.min(0.6, targetRotationX + deltaY * 0.005));
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;

      const radius = 5.2;
      camera.position.x = Math.sin(currentRotationY) * radius * Math.cos(currentRotationX);
      camera.position.z = Math.cos(currentRotationY) * radius * Math.cos(currentRotationX);
      camera.position.y = 2.2 + Math.sin(currentRotationX) * 2.0;
      camera.lookAt(0, 0.65, 0);

      // Pet breathing & floating physics
      if (petGroupRef.current) {
        // Floating sinusoidal levitation
        petGroupRef.current.position.y = 0.52 + Math.sin(elapsed * 1.8) * 0.04;
        petGroupRef.current.rotation.y = Math.sin(elapsed * 0.6) * 0.15;
      }

      // Tail swish
      if (tailRef.current) {
        tailRef.current.rotation.y = Math.sin(elapsed * 2.4) * 0.28;
        tailRef.current.rotation.z = Math.cos(elapsed * 1.6) * 0.14;
      }

      // Ear twitch
      if (earLRef.current && earRRef.current) {
        earLRef.current.rotation.z = 0.25 + Math.sin(elapsed * 3.5) * 0.05;
        earRRef.current.rotation.z = -0.25 - Math.sin(elapsed * 3.5) * 0.05;
      }

      // Particle circulation inside dome
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position;
        if (posAttr) {
          const arr = posAttr.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            arr[i * 3] += velocities[i * 3]!;
            arr[i * 3 + 1] += velocities[i * 3 + 1]!;
            arr[i * 3 + 2] += velocities[i * 3 + 2]!;

            // Clamp inside dome radius
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

      // Streamline rotation
      if (streamLinesRef.current) {
        streamLinesRef.current.rotation.y = elapsed * 0.7;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
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
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update dynamic atmospheric shaders and pet visual state based on indoor PM2.5 & airflow
  useEffect(() => {
    // 1. Particle density and color
    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      if (indoorPm25 < 15) {
        // Clean air
        mat.opacity = 0.06;
        mat.color.setHex(0x38bdf8);
      } else if (indoorPm25 < 60) {
        // Moderate
        mat.opacity = 0.28;
        mat.color.setHex(0xfbbf24);
      } else {
        // Severe smog
        mat.opacity = Math.min(0.85, 0.35 + (indoorPm25 / 300) * 0.5);
        mat.color.setHex(0x94a3b8);
      }
    }

    // 2. Dome glass haze tint
    if (domeMeshRef.current) {
      const domeMat = domeMeshRef.current.material as THREE.MeshPhysicalMaterial;
      if (indoorPm25 < 15) {
        domeMat.color.setHex(0xffffff);
        domeMat.transmission = 0.92;
        domeMat.roughness = 0.05;
      } else if (indoorPm25 < 60) {
        domeMat.color.setHex(0xfef3c7);
        domeMat.transmission = 0.85;
        domeMat.roughness = 0.12;
      } else {
        domeMat.color.setHex(0xd1d5db);
        domeMat.transmission = 0.65;
        domeMat.roughness = 0.28;
      }
    }

    // 3. Pet N95 mask state
    if (n95MaskMeshRef.current) {
      const maskMat = n95MaskMeshRef.current.material as THREE.MeshPhysicalMaterial;
      if (indoorPm25 > 90) {
        maskMat.opacity = THREE.MathUtils.lerp(maskMat.opacity, 0.92, 0.1);
      } else {
        maskMat.opacity = THREE.MathUtils.lerp(maskMat.opacity, 0.0, 0.15);
      }
    }

    // 4. Pet heart bloom light
    if (bloomLightRef.current) {
      if (indoorPm25 < 15) {
        bloomLightRef.current.color.setHex(0x38bdf8); // Cyan pure
        bloomLightRef.current.intensity = 2.4;
      } else if (indoorPm25 < 60) {
        bloomLightRef.current.color.setHex(0xfbbf24); // Warm amber
        bloomLightRef.current.intensity = 1.8;
      } else {
        bloomLightRef.current.color.setHex(0xf87171); // Alert rose
        bloomLightRef.current.intensity = 1.2;
      }
    }

    // 5. Airflow scrubbing streamline visibility
    if (streamLinesRef.current) {
      streamLinesRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const lineMat = mesh.material as THREE.MeshBasicMaterial;
        lineMat.opacity = isScrubbingAirflow ? 0.65 : 0.0;
      });
    }
  }, [indoorPm25, isScrubbingAirflow]);

  // Status metrics
  const getAirQualityLabel = (pm: number) => {
    if (pm < 15) return { label: 'Pristine Air', color: 'text-emerald-400' };
    if (pm < 35) return { label: 'Good', color: 'text-emerald-300' };
    if (pm < 75) return { label: 'Moderate Haze', color: 'text-amber-300' };
    if (pm < 150) return { label: 'Unhealthy Smog', color: 'text-orange-400' };
    return { label: 'Hazardous Inversion', color: 'text-rose-400' };
  };

  const indoorStatus = getAirQualityLabel(indoorPm25);

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden apple-glass-card">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Telemetry Bar (Minimalist Apple precision style) */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
          <div className="apple-glass px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${indoorPm25 < 25 ? 'bg-emerald-400 animate-pulse' : indoorPm25 < 100 ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`} />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Indoor Atmospheric Twin</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold tracking-tight text-white">{Math.round(indoorPm25)}</span>
                <span className="text-xs text-neutral-400">µg/m³ PM₂.₅</span>
                <span className={`text-xs font-medium ml-1 ${indoorStatus.color}`}>{indoorStatus.label}</span>
              </div>
            </div>
          </div>

          <div className="apple-glass px-3.5 py-2.5 rounded-2xl hidden md:flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Outdoor Dispersion</p>
            <p className="text-sm font-medium text-neutral-300">{Math.round(outdoorPm25)} µg/m³ Ambient</p>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onOpenReceipt}
            className="apple-glass px-4 py-2 rounded-2xl text-xs font-medium text-white hover:bg-white/10 transition-all active:scale-95 shadow-md flex items-center gap-2"
          >
            <span>Breath Receipt</span>
          </button>
        </div>
      </div>

      {/* Live Bio-Indicator Habit Loops & Sandbox Controls (Apple-style frosted dock) */}
      <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Bio-Indicator Status Banner */}
        <div className="pointer-events-auto apple-glass px-4 py-3 rounded-2xl max-w-sm">
          <p className="text-[11px] font-semibold text-white flex items-center gap-2">
            <span>Atmospheric Familiar: Lumi</span>
            {indoorPm25 > 90 && <span className="text-[10px] text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/20">N95 Shield Deployed</span>}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
            {indoorPm25 < 15
              ? 'Lumi is relaxed and breathing pure air. Habit streak: 6 Clean Air Dewdrops.'
              : indoorPm25 < 60
              ? 'Moderate particulate detected. Lumi nudges window indicator for scheduled clean air airing.'
              : 'Dense winter smog penetrated the envelope. Lumi has donned an N95 shield. Activate IAQ hacks to scrub.'}
          </p>
        </div>

        {/* Interactive 3D IAQ Hack Switchboard */}
        <div className="pointer-events-auto apple-glass px-3 py-2 rounded-2xl flex flex-wrap items-center gap-2">
          <button
            onClick={() => onTriggerHackToggle('corsiRosenthal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeHacks.corsiRosenthal
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                : 'text-neutral-300 hover:bg-white/10'
            }`}
          >
            DIY Corsi-Rosenthal (+350 CADR)
          </button>

          <button
            onClick={() => onTriggerHackToggle('kitchenExhaust')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeHacks.kitchenExhaust
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                : 'text-neutral-300 hover:bg-white/10'
            }`}
          >
            Kitchen Exhaust Purge
          </button>

          <button
            onClick={() => onTriggerHackToggle('draftSealing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeHacks.draftSealing
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                : 'text-neutral-300 hover:bg-white/10'
            }`}
          >
            Draft Sash Seal (P: 0.40)
          </button>

          <button
            onClick={() => onTriggerHackToggle('windowOpen')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeHacks.windowOpen
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-neutral-300 hover:bg-white/10'
            }`}
          >
            {activeHacks.windowOpen ? 'Window Airing (Open)' : 'Window (Closed)'}
          </button>
        </div>
      </div>
    </div>
  );
};
