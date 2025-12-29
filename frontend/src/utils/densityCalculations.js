/**
 * Density calculation utilities
 * Migrated from backend/app/api/routes/density.py
 * Enhanced with per-zone aggregation for the 3D calculator
 */

export function calculateDensityImpact(population, peoplePerUnit, pattern) {
  // Calculate total units needed
  const totalUnits = Math.ceil(population / peoplePerUnit);

  // Calculate residential acres
  const residentialAcres = totalUnits / pattern.density_per_acre;

  // Estimate infrastructure (roads, parks, utilities)
  // Lower density = more infrastructure needed
  const infrastructureMultiplier = pattern.density_per_acre < 10 ? 0.4 :
                                   pattern.density_per_acre < 50 ? 0.25 : 0.15;
  const infrastructureAcres = residentialAcres * infrastructureMultiplier;

  // Total land use
  const totalAcres = residentialAcres + infrastructureAcres;

  // Convert to football fields (1 acre = 0.75 football fields approximately)
  const footballFields = Math.round(totalAcres * 0.75);

  // Calculate CO2 emissions (tons per year)
  // Based on vehicle miles traveled - sprawl = more driving
  const avgVMTPerUnit = pattern.density_per_acre < 10 ? 25000 :
                        pattern.density_per_acre < 50 ? 15000 : 8000;
  const totalVMT = totalUnits * avgVMTPerUnit;
  const co2TonsPerYear = Math.round(totalVMT * 0.000411); // EPA conversion factor

  return {
    total_units: totalUnits,
    residential_acres: Math.round(residentialAcres * 10) / 10,
    infrastructure_acres: Math.round(infrastructureAcres * 10) / 10,
    total_acres: Math.round(totalAcres * 10) / 10,
    football_fields: footballFields,
    co2_tons_per_year: co2TonsPerYear,
    avg_vmt_per_unit: avgVMTPerUnit,
    total_vmt: totalVMT,
    pattern_name: pattern.name,
    density_per_acre: pattern.density_per_acre
  };
}

/**
 * Calculate aggregated impact across multiple zones
 * @param {number} population - Total population to house
 * @param {number} peoplePerUnit - Average people per housing unit
 * @param {Array} zones - Array of { type, percentage }
 * @param {Array} patterns - Array of density pattern definitions
 * @returns {Object} - Aggregated results with per-zone breakdown
 */
export function calculateZonedDensityImpact(population, peoplePerUnit, zones, patterns) {
  const breakdown = [];
  let totalUnits = 0;
  let totalAcres = 0;
  let totalCO2 = 0;
  let totalVMT = 0;
  let totalFootballFields = 0;

  // Calculate for each zone based on percentage of population
  zones.forEach(zone => {
    if (zone.percentage === 0) return;

    const pattern = patterns.find(p => p.id === zone.type);
    if (!pattern) return;

    // This zone handles this percentage of the population
    const zonePopulation = Math.round(population * (zone.percentage / 100));
    if (zonePopulation === 0) return;

    const result = calculateDensityImpact(zonePopulation, peoplePerUnit, pattern);

    breakdown.push({
      ...result,
      zone_type: zone.type,
      zone_percentage: zone.percentage
    });

    totalUnits += result.total_units;
    totalAcres += result.total_acres;
    totalCO2 += result.co2_tons_per_year;
    totalVMT += result.total_vmt;
    totalFootballFields += result.football_fields;
  });

  return {
    total_units: totalUnits,
    total_acres: Math.round(totalAcres * 10) / 10,
    football_fields: totalFootballFields,
    co2_tons_per_year: totalCO2,
    total_vmt: totalVMT,
    breakdown,
    zone_count: breakdown.length
  };
}

/**
 * Density pattern definitions matching the JSON data structure
 * Used as fallback if JSON loading fails
 */
export const defaultPatterns = [
  {
    id: 'suburban-sprawl',
    name: 'Single-Family Suburban Sprawl',
    density_per_acre: 2.5,
    unit_size_sqft: 2200,
    parking_spaces_per_unit: 2,
    description: 'Traditional suburban development with large lots'
  },
  {
    id: 'townhomes',
    name: 'Townhomes',
    density_per_acre: 8,
    unit_size_sqft: 1600,
    parking_spaces_per_unit: 2,
    description: 'Attached housing with shared walls'
  },
  {
    id: 'mixed-use-midrise',
    name: 'Mixed-Use Mid-Rise',
    density_per_acre: 45,
    unit_size_sqft: 950,
    parking_spaces_per_unit: 1,
    description: '4-6 story buildings with retail and apartments'
  },
  {
    id: 'high-rise-urban',
    name: 'High-Rise Urban',
    density_per_acre: 120,
    unit_size_sqft: 850,
    parking_spaces_per_unit: 0.5,
    description: 'Dense urban development with transit access'
  }
];
