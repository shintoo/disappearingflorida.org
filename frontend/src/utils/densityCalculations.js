/**
 * Density calculation utilities
 * Migrated from backend/app/api/routes/density.py
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
