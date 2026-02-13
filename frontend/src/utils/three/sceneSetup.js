/**
 * Three.js scene setup utilities
 * Handles camera, lighting, renderer, and controls
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Create and configure the Three.js scene
 */
export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  return scene;
}

/**
 * Create perspective camera with isometric-style view
 */
export function createCamera(aspect) {
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(60, 50, 60);
  camera.lookAt(0, 0, 0);
  return camera;
}

/**
 * Create WebGL renderer with performance optimizations
 */
export function createRenderer(canvas, width, height, isMobile = false) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return renderer;
}

/**
 * Setup scene lighting
 */
export function createLighting(scene, isMobile = false) {
  // Ambient light for base illumination
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  // Directional light for shadows and depth
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(50, 100, 50);

  if (!isMobile) {
    directional.castShadow = true;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    directional.shadow.camera.near = 0.5;
    directional.shadow.camera.far = 500;
    directional.shadow.camera.left = -100;
    directional.shadow.camera.right = 100;
    directional.shadow.camera.top = 100;
    directional.shadow.camera.bottom = -100;
  }

  scene.add(directional);

  // Hemisphere light for natural outdoor feel
  const hemisphere = new THREE.HemisphereLight(0x87ceeb, 0x556041, 0.3);
  scene.add(hemisphere);

  return { ambient, directional, hemisphere };
}

/**
 * Create orbit controls for camera interaction
 */
export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 30;
  controls.maxDistance = 150;
  controls.maxPolarAngle = Math.PI / 2.2; // Prevent going below ground
  controls.minPolarAngle = 0.2; // Prevent going directly overhead
  controls.enablePan = true;
  controls.panSpeed = 0.5;

  // Touch settings
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  };

  return controls;
}

/**
 * Create ground plane with grass color
 */
export function createGround(scene, size = 100) {
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshStandardMaterial({
    color: 0x7cb342, // Grass green
    roughness: 0.9,
    metalness: 0.0
  });

  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;

  scene.add(ground);
  return ground;
}

/**
 * Create street grid
 */
export function createStreets(scene, size = 100, spacing = 50) {
  const streetGroup = new THREE.Group();
  const streetWidth = 2;
  const streetColor = 0xeaeaea;

  const material = new THREE.MeshStandardMaterial({
    color: streetColor,
    roughness: 0.8,
    metalness: 0.1
  });

  const halfSize = size / 2;

  // Horizontal streets
  for (let z = -halfSize + spacing; z < halfSize; z += spacing) {
    const geometry = new THREE.PlaneGeometry(size, streetWidth);
    const street = new THREE.Mesh(geometry, material);
    street.rotation.x = -Math.PI / 2;
    street.position.set(0, 0.02, z);
    street.receiveShadow = true;
    streetGroup.add(street);
  }

  // Vertical streets
  for (let x = -halfSize + spacing; x < halfSize; x += spacing) {
    const geometry = new THREE.PlaneGeometry(streetWidth, size);
    const street = new THREE.Mesh(geometry, material);
    street.rotation.x = -Math.PI / 2;
    street.position.set(x, 0.02, 0);
    street.receiveShadow = true;
    streetGroup.add(street);
  }

  scene.add(streetGroup);
  return streetGroup;
}

/**
 * Check WebGL support
 */
export function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}
