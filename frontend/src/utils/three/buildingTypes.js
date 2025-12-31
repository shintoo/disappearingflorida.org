/**
 * Building type definitions for 3D city visualization
 * Colors and dimensions for each density type
 */

export const buildingTypes = {
  'high-rise-urban': {
    id: 'high-rise-urban',
    name: 'High-Rise',
    color: 0x4a6fa5,           // Blue-gray
    heightRange: [12, 20],     // Units (visual height)
    footprint: { width: 5, depth: 5 },
    cornerRadius: 0.4,
    hasWindows: false,
    spacing: 5.5,                // Gap between buildings
    densityPerAcre: 120,
    unitsPerBuilding: 125      // Housing units per building (tuned for visualization)
  },
  'mixed-use-midrise': {
    id: 'mixed-use-midrise',
    name: 'Midrise',
    color: 0x8b5a2b,           // Brown/brick
    heightRange: [5, 8],
    footprint: { width: 4, depth: 4 },
    cornerRadius: 0.3,
    hasWindows: false,
    spacing: 4,
    densityPerAcre: 45,
    unitsPerBuilding: 25       // Housing units per building (tuned for visualization)
  },
  'townhomes': {
    id: 'townhomes',
    name: 'Townhomes',
    color: 0xa0522d,           // Terracotta
    heightRange: [3, 3],
    footprint: { width: 2, depth: 4 },
    cornerRadius: 0.2,
    hasWindows: false,
    spacing: 1,              // Attached, minimal gap
    rowBased: true,
    densityPerAcre: 8,
    unitsPerBuilding: 5        // Row of attached units (tuned for visualization)
  },
  'suburban-sprawl': {
    id: 'suburban-sprawl',
    name: 'Single-Family',
    color: 0xf5f5dc,           // Beige/cream
    heightRange: [1.5, 2],
    footprint: { width: 2, depth: 1.5 },
    cornerRadius: 0.15,
    hasWindows: false,
    spacing: 5,                // Large yards
    yardColor: 0x7cb342,       // Green yards
    densityPerAcre: 2.5,
    unitsPerBuilding: 1        // One unit per house
  }
};

// Order for visual priority (densest types rendered in center)
export const densityOrder = [
  'high-rise-urban',
  'mixed-use-midrise',
  'townhomes',
  'suburban-sprawl'
];

// Color palette for UI sliders
export const zoneColors = {
  'high-rise-urban': '#4a6fa5',
  'mixed-use-midrise': '#8b5a2b',
  'townhomes': '#a0522d',
  'suburban-sprawl': '#f5f5dc'
};
