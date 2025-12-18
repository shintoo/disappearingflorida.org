from pydantic import BaseModel
from typing import Optional


class DevelopmentPattern(BaseModel):
    """Different development pattern configurations"""
    id: str
    name: str
    units_per_acre: float
    avg_unit_size_sqft: int
    description: str
    parking_spaces_per_unit: float
    road_width_feet: int
    typical_lot_coverage: float  # percentage


class DensityCalculation(BaseModel):
    """Input for density calculator"""
    population: int
    people_per_unit: float = 2.5
    pattern: DevelopmentPattern


class DensityResult(BaseModel):
    """Result from density calculation"""
    total_units_needed: int
    residential_acres: float
    infrastructure_acres: float  # roads, parking, utilities
    total_acres: float
    comparison_football_fields: float
    estimated_co2_tons_per_year: float
    vehicle_miles_per_year: float
    pattern_used: DevelopmentPattern
