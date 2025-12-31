/**
 * City layout algorithm
 * Generates building positions on a rectangular grid based on zone percentages
 */

import { buildingTypes, densityOrder } from './buildingTypes.js';

/**
 * Generate city layout based on zone percentages and total housing units
 * All buildings are placed on a rectangular grid, with denser buildings in the center
 * @param {Array} zones - Array of { type, percentage }
 * @param {number} gridSize - Visual grid size (default 80)
 * @param {number} totalUnits - Total housing units to accommodate (default 250)
 * @returns {Object} - { buildings: [{ type, position }], totalBuildings }
 */
export function generateCityLayout(zones, gridSize = 80, totalUnits = 250) {
  const buildings = [];

  // Filter out zones with 0%
  const activeZones = zones.filter(z => z.percentage > 0);
  if (activeZones.length === 0) return { buildings, totalBuildings: 0 };

  // Sort by density (densest in center)
  activeZones.sort((a, b) => {
    const orderA = densityOrder.indexOf(a.type);
    const orderB = densityOrder.indexOf(b.type);
    return orderA - orderB;
  });

  // Calculate building counts based on units needed for each zone
  const buildingCounts = {};

  activeZones.forEach(zone => {
    const config = buildingTypes[zone.type];
    if (!config) return;

    // Calculate how many units this zone needs to house
    const zoneUnits = Math.round(totalUnits * (zone.percentage / 100));

    // Calculate how many buildings needed based on units per building
    // Use Math.ceil to ensure we have enough capacity
    const buildingsNeeded = Math.max(1, Math.ceil(zoneUnits / config.unitsPerBuilding));

    buildingCounts[zone.type] = buildingsNeeded;
  });

  // Generate all grid cells, sorted by distance from center
  const halfGrid = gridSize / 2;
  const allCells = [];

  // Create a fine grid for placing buildings
  const cellSize = 1; // Base cell size
  for (let x = -halfGrid; x < halfGrid; x += cellSize) {
    for (let z = -halfGrid; z < halfGrid; z += cellSize) {
      const distFromCenter = Math.sqrt(x * x + z * z);
      allCells.push({ x, z, dist: distFromCenter });
    }
  }

  // Sort cells by distance from center (closest first)
  allCells.sort((a, b) => a.dist - b.dist);

  // Track which cells are occupied
  const occupiedCells = new Set();
  let cellIndex = 0;

  // Place buildings for each zone, starting from center
  activeZones.forEach(zone => {
    const config = buildingTypes[zone.type];
    if (!config) return;

    // Get the pre-calculated number of buildings for this zone
    const zoneBuildings = buildingCounts[zone.type] || 0;

    if (zoneBuildings === 0) return;

    // Calculate how many units this zone needs to house
    const zoneUnits = Math.round(totalUnits * (zone.percentage / 100));

    // Distribute units sequentially: fill buildings to max capacity before moving to next
    const maxUnitsPerBuilding = config.unitsPerBuilding;
    let remainingUnits = zoneUnits;
    const buildingUnitCounts = [];

    for (let i = 0; i < zoneBuildings; i++) {
      if (remainingUnits >= maxUnitsPerBuilding) {
        // Fill this building to capacity
        buildingUnitCounts.push(maxUnitsPerBuilding);
        remainingUnits -= maxUnitsPerBuilding;
      } else {
        // Last building gets remaining units
        buildingUnitCounts.push(remainingUnits);
        remainingUnits = 0;
      }
    }

    // Reduce spacing to make buildings closer - use 40% of original spacing
    const spacing = config.spacing * 0.4;

    // Calculate how many grid cells each building occupies (based on spacing)
    const cellsPerBuilding = Math.max(1, Math.ceil(spacing / cellSize));

    let placedCount = 0;

    while (placedCount < zoneBuildings && cellIndex < allCells.length) {
      const cell = allCells[cellIndex];
      const cellKey = `${Math.round(cell.x)},${Math.round(cell.z)}`;

      // Check if this cell and surrounding cells are available
      if (!isCellOccupied(occupiedCells, cell.x, cell.z, cellsPerBuilding, cellSize)) {
        // Mark cells as occupied
        markCellsOccupied(occupiedCells, cell.x, cell.z, cellsPerBuilding, cellSize);

        // Place building at grid position with sequential unit count
        buildings.push({
          type: zone.type,
          position: { x: cell.x, z: cell.z },
          units: buildingUnitCounts[placedCount]
        });

        placedCount++;
      }

      cellIndex++;
    }
  });

  return { buildings, totalBuildings: buildings.length };
}

/**
 * Check if a cell area is occupied
 */
function isCellOccupied(occupiedCells, x, z, radius, cellSize) {
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const checkX = Math.round(x + dx * cellSize);
      const checkZ = Math.round(z + dz * cellSize);
      const key = `${checkX},${checkZ}`;
      if (occupiedCells.has(key)) return true;
    }
  }
  return false;
}

/**
 * Mark cells as occupied
 */
function markCellsOccupied(occupiedCells, x, z, radius, cellSize) {
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const markX = Math.round(x + dx * cellSize);
      const markZ = Math.round(z + dz * cellSize);
      const key = `${markX},${markZ}`;
      occupiedCells.add(key);
    }
  }
}

/**
 * Calculate optimal grid size based on land area
 */
export function calculateGridSize(landAcres) {
  // Scale grid size with land area (with limits)
  const base = Math.sqrt(landAcres) * 8;
  return Math.min(120, Math.max(40, base));
}

/**
 * Interpolate between two layouts for animation
 */
export function interpolateLayouts(oldBuildings, newBuildings) {
  const result = [];

  // Match buildings by index and type where possible
  const maxLen = Math.max(oldBuildings.length, newBuildings.length);

  for (let i = 0; i < maxLen; i++) {
    const oldB = oldBuildings[i];
    const newB = newBuildings[i];

    if (newB) {
      result.push({
        type: newB.type,
        position: newB.position,
        fromPosition: oldB?.position || newB.position,
        isNew: !oldB
      });
    }
  }

  return result;
}
