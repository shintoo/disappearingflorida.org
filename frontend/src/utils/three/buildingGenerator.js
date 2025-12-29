/**
 * Building mesh generation utilities
 * Creates 3D building geometries with rounded corners
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { buildingTypes } from './buildingTypes.js';

/**
 * Create a single building mesh
 */
export function createBuilding(type, position, height = null) {
  const config = buildingTypes[type];
  if (!config) {
    console.warn(`Unknown building type: ${type}`);
    return null;
  }

  // Randomize height within range if not specified
  const buildingHeight = height ?? randomInRange(config.heightRange[0], config.heightRange[1]);

  // Create rounded box geometry
  const geometry = new RoundedBoxGeometry(
    config.footprint.width,
    buildingHeight,
    config.footprint.depth,
    4, // segments
    config.cornerRadius
  );

  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    roughness: 0.7,
    metalness: 0.1
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, buildingHeight / 2, position.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Store metadata for animations
  mesh.userData = {
    type,
    targetHeight: buildingHeight,
    originalHeight: buildingHeight,
    config
  };

  // Add windows for high-rise and midrise
  if (config.hasWindows) {
    addWindows(mesh, buildingHeight, config);
  }

  return mesh;
}

/**
 * Add window details to a building
 */
function addWindows(buildingMesh, height, config) {
  const windowGroup = new THREE.Group();
  const windowColor = 0x87ceeb; // Light blue
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: windowColor,
    roughness: 0.3,
    metalness: 0.5,
    emissive: windowColor,
    emissiveIntensity: 0.1
  });

  const windowWidth = 0.3;
  const windowHeight = 0.5;
  const windowDepth = 0.05;
  const windowSpacingY = 1.5;
  const windowSpacingX = 1;

  const startY = 1;
  const endY = height - 1;

  // Front and back faces
  for (let y = startY; y < endY; y += windowSpacingY) {
    const numWindowsX = Math.floor((config.footprint.width - 0.5) / windowSpacingX);
    const startX = -(numWindowsX - 1) * windowSpacingX / 2;

    for (let i = 0; i < numWindowsX; i++) {
      const x = startX + i * windowSpacingX;

      // Front
      const windowFront = createWindowPane(windowWidth, windowHeight, windowDepth, windowMaterial);
      windowFront.position.set(x, y - height / 2, config.footprint.depth / 2 + 0.01);
      windowGroup.add(windowFront);

      // Back
      const windowBack = createWindowPane(windowWidth, windowHeight, windowDepth, windowMaterial);
      windowBack.position.set(x, y - height / 2, -config.footprint.depth / 2 - 0.01);
      windowGroup.add(windowBack);
    }
  }

  // Left and right faces
  for (let y = startY; y < endY; y += windowSpacingY) {
    const numWindowsZ = Math.floor((config.footprint.depth - 0.5) / windowSpacingX);
    const startZ = -(numWindowsZ - 1) * windowSpacingX / 2;

    for (let i = 0; i < numWindowsZ; i++) {
      const z = startZ + i * windowSpacingX;

      // Left
      const windowLeft = createWindowPane(windowDepth, windowHeight, windowWidth, windowMaterial);
      windowLeft.position.set(-config.footprint.width / 2 - 0.01, y - height / 2, z);
      windowGroup.add(windowLeft);

      // Right
      const windowRight = createWindowPane(windowDepth, windowHeight, windowWidth, windowMaterial);
      windowRight.position.set(config.footprint.width / 2 + 0.01, y - height / 2, z);
      windowGroup.add(windowRight);
    }
  }

  buildingMesh.add(windowGroup);
  buildingMesh.userData.windowGroup = windowGroup;
}

/**
 * Create a single window pane geometry
 */
function createWindowPane(width, height, depth, material) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  return new THREE.Mesh(geometry, material);
}

/**
 * Create a group of buildings for a zone
 */
export function createBuildingCluster(type, positions) {
  const group = new THREE.Group();

  positions.forEach(pos => {
    const building = createBuilding(type, pos);
    if (building) {
      group.add(building);
    }
  });

  return group;
}

/**
 * Generate random number in range
 */
function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Animate building to new height
 */
export function animateBuildingHeight(building, targetHeight, duration = 500) {
  const startHeight = building.scale.y * building.userData.originalHeight;
  const startY = building.position.y;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);

    const currentHeight = startHeight + (targetHeight - startHeight) * eased;
    const scale = currentHeight / building.userData.originalHeight;

    building.scale.y = scale;
    building.position.y = currentHeight / 2;

    // Update windows if present
    if (building.userData.windowGroup) {
      building.userData.windowGroup.visible = currentHeight > 3;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      building.userData.targetHeight = targetHeight;
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Animate building position
 */
export function animateBuildingPosition(building, targetPos, duration = 500) {
  const startPos = building.position.clone();
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);

    building.position.x = startPos.x + (targetPos.x - startPos.x) * eased;
    building.position.z = startPos.z + (targetPos.z - startPos.z) * eased;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}
