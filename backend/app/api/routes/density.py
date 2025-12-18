from fastapi import APIRouter
from typing import List
from app.models.density import DevelopmentPattern, DensityCalculation, DensityResult

router = APIRouter()

# Predefined development patterns
DEVELOPMENT_PATTERNS = [
    DevelopmentPattern(
        id="single-family-sprawl",
        name="Single-Family Suburban Sprawl",
        units_per_acre=2.5,
        avg_unit_size_sqft=2200,
        description="Typical low-density suburban development with large lots",
        parking_spaces_per_unit=2.5,
        road_width_feet=32,
        typical_lot_coverage=0.25
    ),
    DevelopmentPattern(
        id="townhomes",
        name="Townhomes",
        units_per_acre=8,
        avg_unit_size_sqft=1600,
        description="Medium-density attached housing",
        parking_spaces_per_unit=2.0,
        road_width_feet=28,
        typical_lot_coverage=0.45
    ),
    DevelopmentPattern(
        id="mixed-use-mid-rise",
        name="Mixed-Use Mid-Rise",
        units_per_acre=45,
        avg_unit_size_sqft=950,
        description="4-6 story buildings with retail on ground floor",
        parking_spaces_per_unit=1.2,
        road_width_feet=24,
        typical_lot_coverage=0.65
    ),
    DevelopmentPattern(
        id="high-rise",
        name="High-Rise Urban",
        units_per_acre=120,
        avg_unit_size_sqft=850,
        description="8+ story buildings in urban core",
        parking_spaces_per_unit=0.8,
        road_width_feet=24,
        typical_lot_coverage=0.70
    ),
]


@router.get("/patterns", response_model=List[DevelopmentPattern])
async def get_development_patterns():
    """Get all available development patterns"""
    return DEVELOPMENT_PATTERNS


@router.post("/calculate", response_model=DensityResult)
async def calculate_density(calculation: DensityCalculation):
    """Calculate land use and emissions for given population and density"""
    pattern = calculation.pattern

    # Calculate units needed
    total_units = int(calculation.population / calculation.people_per_unit)

    # Calculate residential acres
    residential_acres = total_units / pattern.units_per_acre

    # Estimate infrastructure (simplified - roads, parking, utilities)
    # This is a rough approximation
    parking_acres = (total_units * pattern.parking_spaces_per_unit * 300) / 43560  # 300 sq ft per space
    road_multiplier = 1.3 if pattern.units_per_acre < 5 else 1.15 if pattern.units_per_acre < 20 else 1.08
    infrastructure_acres = residential_acres * (road_multiplier - 1) + parking_acres

    total_acres = residential_acres + infrastructure_acres

    # Football field comparison (1 field = 1.32 acres including end zones)
    football_fields = total_acres / 1.32

    # Estimate vehicle miles and CO2 (very simplified)
    # Lower density = more driving
    avg_vmt_per_household_per_year = 25000 if pattern.units_per_acre < 5 else \
                                      18000 if pattern.units_per_acre < 20 else \
                                      10000 if pattern.units_per_acre < 50 else \
                                      6000

    total_vmt = total_units * avg_vmt_per_household_per_year

    # CO2 emissions (roughly 0.89 lbs CO2 per mile, convert to tons)
    co2_tons = (total_vmt * 0.89) / 2000

    return DensityResult(
        total_units_needed=total_units,
        residential_acres=round(residential_acres, 2),
        infrastructure_acres=round(infrastructure_acres, 2),
        total_acres=round(total_acres, 2),
        comparison_football_fields=round(football_fields, 1),
        estimated_co2_tons_per_year=round(co2_tons, 0),
        vehicle_miles_per_year=total_vmt,
        pattern_used=pattern
    )
