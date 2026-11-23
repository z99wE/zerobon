import * as THREE from 'three';

export interface PetMeshCollection {
  petGroup: THREE.Group;
  tailGroup: THREE.Group;
  earL: THREE.Mesh;
  earR: THREE.Mesh;
  n95Mask: THREE.Mesh;
}

export interface TerrariumEnvironmentCollection {
  baseGroup: THREE.Group;
  domeMesh: THREE.Mesh;
  bloomLight: THREE.PointLight;
  particles: THREE.Points;
  particleVelocities: Float32Array;
  streamLines: THREE.Group;
}

/**
 * Builds the studio lighting rig with Stripe brand tones
 */
export function createStudioLighting(scene: THREE.Scene): THREE.PointLight {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(3.5, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x533afd, 2.0);
  rimLight.position.set(-4, 3, -3);
  scene.add(rimLight);

  const warmFillLight = new THREE.DirectionalLight(0xf5e9d4, 0.6);
  warmFillLight.position.set(0, -2, 3);
  scene.add(warmFillLight);

  const bloomLight = new THREE.PointLight(0x533afd, 2.2, 4);
  bloomLight.position.set(0, 0.6, 0);
  scene.add(bloomLight);

  return bloomLight;
}

/**
 * Builds the physical glass dome and pedestal base
 */
export function createTerrariumBaseAndDome(scene: THREE.Scene): { baseGroup: THREE.Group; domeMesh: THREE.Mesh } {
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

  const ringGeo = new THREE.TorusGeometry(1.58, 0.008, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x533afd, transparent: true, opacity: 0.5 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0.005;
  baseGroup.add(ringMesh);

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

  return { baseGroup, domeMesh };
}

/**
 * Builds the Atmospheric Familiar: "Lumi the Cloud Fox"
 */
export function createAtmosphericFamiliar(scene: THREE.Scene): PetMeshCollection {
  const petGroup = new THREE.Group();
  petGroup.position.set(0, 0.5, 0);
  scene.add(petGroup);

  const bodyGeo = new THREE.SphereGeometry(0.38, 32, 24);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.45,
    metalness: 0.15,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  petGroup.add(bodyMesh);

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

  const earR = new THREE.Mesh(earGeo, earMat);
  earR.position.set(0.16, 0.38, 0.02);
  earR.rotation.z = -0.25;
  earR.rotation.x = -0.1;
  earR.castShadow = true;
  petGroup.add(earR);

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

  const glintGeo = new THREE.SphereGeometry(0.015, 8, 8);
  const glintMat = new THREE.MeshBasicMaterial({ color: 0x533afd });
  const glintL = new THREE.Mesh(glintGeo, glintMat);
  glintL.position.set(-0.10, 0.09, 0.375);
  petGroup.add(glintL);

  const glintR = new THREE.Mesh(glintGeo, glintMat);
  glintR.position.set(0.12, 0.09, 0.375);
  petGroup.add(glintR);

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

  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, -0.05, -0.32);
  petGroup.add(tailGroup);

  for (let i = 0; i < 5; i++) {
    const segGeo = new THREE.SphereGeometry(0.16 - i * 0.022, 16, 16);
    const segMat = new THREE.MeshPhysicalMaterial({
      color: 0x533afd,
      transmission: 0.7,
      roughness: 0.2,
      ior: 1.4,
      transparent: true,
      opacity: 0.85,
    });
    const seg = new THREE.Mesh(segGeo, segMat);
    seg.position.set(0, (i * 0.11) + 0.05, -(i * 0.09));
    tailGroup.add(seg);
  }

  const maskGeo = new THREE.SphereGeometry(0.18, 24, 16, 0, Math.PI, 0, Math.PI * 0.65);
  const maskMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });
  const n95Mask = new THREE.Mesh(maskGeo, maskMat);
  n95Mask.rotation.x = Math.PI * 0.45;
  n95Mask.position.set(0, 0.03, 0.33);
  n95Mask.visible = false;
  petGroup.add(n95Mask);

  return {
    petGroup,
    tailGroup,
    earL,
    earR,
    n95Mask,
  };
}

/**
 * Builds the Volumetric Smog Particulate Cloud inside the Terrarium
 */
export function createParticulateCloud(
  scene: THREE.Scene,
  particleCount = 450
): { particles: THREE.Points; velocities: Float32Array } {
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * 1.32;

    const sinPhi = Math.sin(phi);
    const x = r * sinPhi * Math.cos(theta);
    const y = Math.abs(r * Math.cos(phi)) * 0.9 + 0.1;
    const z = r * sinPhi * Math.sin(theta);

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particleVelocities[i * 3] = (Math.random() - 0.5) * 0.003;
    particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
    particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;

    particleColors[i * 3] = 0.55;
    particleColors[i * 3 + 1] = 0.48;
    particleColors[i * 3 + 2] = 0.42;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.038,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  return { particles, velocities: particleVelocities };
}

/**
 * Builds the 3D Airflow Scrubbing Vortex Streamlines
 */
export function createAirflowStreamlines(scene: THREE.Scene, streamCount = 14): THREE.Group {
  const streamLines = new THREE.Group();
  scene.add(streamLines);

  for (let s = 0; s < streamCount; s++) {
    const points: THREE.Vector3[] = [];
    const radius = 0.45 + (s / streamCount) * 0.85;
    const startAngle = (s / streamCount) * Math.PI * 2;

    for (let p = 0; p < 18; p++) {
      const angle = startAngle + (p / 18) * Math.PI * 1.8;
      const height = (p / 18) * 1.25 + 0.05;
      const currentRadius = radius * (1 - (p / 18) * 0.4);
      points.push(new THREE.Vector3(Math.cos(angle) * currentRadius, height, Math.sin(angle) * currentRadius));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.012, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x533afd,
      transparent: true,
      opacity: 0.0,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    streamLines.add(tubeMesh);
  }

  return streamLines;
}
