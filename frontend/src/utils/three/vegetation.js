/**
 * Vegetation generation for natural areas
 * Creates simple, performant trees to emphasize wild spaces
 */

import * as THREE from 'three';

/**
 * Create a simple low-poly tree
 * Uses cone geometry for foliage and cylinder for trunk
 */
export function createSimpleTree(scale = 1) {
  const tree = new THREE.Group();

  // Trunk
  const trunkHeight = 1.5 * scale;
  const trunkRadius = 0.15 * scale;
  const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 6);
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3728, // Brown bark
    roughness: 0.9,
    metalness: 0.0
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // Foliage - two stacked cones for more natural look
  const foliageColor = 0x2d5016; // Dark forest green
  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: foliageColor,
    roughness: 0.8,
    metalness: 0.0
  });

  // Lower foliage
  const lowerFoliageGeometry = new THREE.ConeGeometry(0.8 * scale, 1.8 * scale, 6);
  const lowerFoliage = new THREE.Mesh(lowerFoliageGeometry, foliageMaterial);
  lowerFoliage.position.y = trunkHeight + 0.6 * scale;
  lowerFoliage.castShadow = true;
  lowerFoliage.receiveShadow = true;
  tree.add(lowerFoliage);

  // Upper foliage
  const upperFoliageGeometry = new THREE.ConeGeometry(0.6 * scale, 1.4 * scale, 6);
  const upperFoliage = new THREE.Mesh(upperFoliageGeometry, foliageMaterial);
  upperFoliage.position.y = trunkHeight + 1.4 * scale;
  upperFoliage.castShadow = true;
  upperFoliage.receiveShadow = true;
  tree.add(upperFoliage);

  return tree;
}

/**
 * Create a bush/shrub for variety
 */
export function createBush(scale = 1) {
  const bush = new THREE.Group();

  // Simple sphere for bush shape
  const bushGeometry = new THREE.SphereGeometry(0.5 * scale, 6, 6);
  const bushMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a6b1f, // Medium green
    roughness: 0.85,
    metalness: 0.0
  });

  const bushMesh = new THREE.Mesh(bushGeometry, bushMaterial);
  bushMesh.position.y = 0.3 * scale;
  bushMesh.castShadow = true;
  bushMesh.receiveShadow = true;
  bushMesh.scale.set(1, 0.7, 1); // Flatten slightly
  bush.add(bushMesh);

  return bush;
}

/**
 * Create instanced vegetation for better performance
 * Uses InstancedMesh to render many trees efficiently
 */
export function createInstancedTrees(positions, scales) {
  if (positions.length === 0) return null;

  const group = new THREE.Group();

  // Create tree trunk instances
  const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.18, 1.5, 6);
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.9,
    metalness: 0.0
  });
  const trunkMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, positions.length);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;

  // Create foliage instances
  const foliageGeometry = new THREE.ConeGeometry(0.8, 1.8, 6);
  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5016,
    roughness: 0.8,
    metalness: 0.0
  });
  const foliageMesh = new THREE.InstancedMesh(foliageGeometry, foliageMaterial, positions.length);
  foliageMesh.castShadow = true;
  foliageMesh.receiveShadow = true;

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  positions.forEach((pos, i) => {
    const treeScale = scales?.[i] || 1;

    // Trunk instance
    position.set(pos.x, 0.75 * treeScale, pos.z);
    quaternion.set(0, 0, 0, 1);
    scale.set(treeScale, treeScale, treeScale);
    matrix.compose(position, quaternion, scale);
    trunkMesh.setMatrixAt(i, matrix);

    // Foliage instance
    position.set(pos.x, (1.5 + 0.9) * treeScale, pos.z);
    scale.set(treeScale, treeScale, treeScale);
    matrix.compose(position, quaternion, scale);
    foliageMesh.setMatrixAt(i, matrix);
  });

  group.add(trunkMesh);
  group.add(foliageMesh);

  return group;
}

/**
 * Generate vegetation positions avoiding buildings
 * @param {Array} occupiedPositions - Array of {x, z} positions where buildings are
 * @param {number} gridSize - Size of the grid
 * @param {number} density - Vegetation density (0-1)
 * @param {number} maxTrees - Maximum number of trees to generate
 * @returns {Array} Array of {x, z, scale} for tree positions
 */
export function generateVegetationPositions(occupiedPositions, gridSize = 100, density = 0.3, maxTrees = 200) {
  const positions = [];
  const scales = [];
  const halfGrid = gridSize / 2;

  // Create a set of occupied cells for quick lookup
  const occupiedSet = new Set();
  const cellSize = 2; // Grid cell size for collision detection

  occupiedPositions.forEach(pos => {
    const cellX = Math.floor(pos.x / cellSize);
    const cellZ = Math.floor(pos.z / cellSize);

    // Mark surrounding cells as occupied (larger radius for building clearance)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        occupiedSet.add(`${cellX + dx},${cellZ + dz}`);
      }
    }
  });

  // Generate tree positions using Poisson-disc-like sampling for natural distribution
  const minDistance = 2; // Minimum distance between trees
  const maxAttempts = 20; // Attempts per tree to find valid position

  let attempts = 0;
  while (positions.length < maxTrees && attempts < maxTrees * maxAttempts) {
    attempts++;

    // Random position
    const x = (Math.random() - 0.5) * gridSize;
    const z = (Math.random() - 0.5) * gridSize;

    // Check if position is within grid
    if (Math.abs(x) > halfGrid || Math.abs(z) > halfGrid) continue;

    // Check if cell is occupied by buildings
    const cellX = Math.floor(x / cellSize);
    const cellZ = Math.floor(z / cellSize);
    if (occupiedSet.has(`${cellX},${cellZ}`)) continue;

    // Check minimum distance from other trees
    let tooClose = false;
    for (const pos of positions) {
      const dx = pos.x - x;
      const dz = pos.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDistance) {
        tooClose = true;
        break;
      }
    }

    if (tooClose) continue;

    // Apply density probability
    if (Math.random() > density) continue;

    // Valid position found
    const treeScale = 0.7 + Math.random() * 0.6; // Vary tree sizes
    positions.push({ x, z });
    scales.push(treeScale);
  }

  return { positions, scales };
}

/**
 * Create a vegetation layer for the scene
 * @param {Array} buildingPositions - Positions occupied by buildings
 * @param {number} gridSize - Size of the visualization grid
 * @param {boolean} useLowDetail - Use lower detail for performance
 * @returns {THREE.Group} Group containing all vegetation
 */
export function createVegetationLayer(buildingPositions = [], gridSize = 100, useLowDetail = false) {
  const group = new THREE.Group();

  // Reduce tree count on mobile
  const maxTrees = useLowDetail ? 100 : 200;
  const density = useLowDetail ? 0.2 : 0.3;

  // Generate positions
  const { positions, scales } = generateVegetationPositions(
    buildingPositions,
    gridSize,
    density,
    maxTrees
  );

  if (positions.length === 0) return group;

  // Use instanced meshes for better performance
  const vegetationMesh = createInstancedTrees(positions, scales);
  if (vegetationMesh) {
    group.add(vegetationMesh);
  }

  return group;
}
