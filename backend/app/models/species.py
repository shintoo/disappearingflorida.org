from pydantic import BaseModel
from typing import List, Optional


class PopulationDataPoint(BaseModel):
    """Population data for a specific year"""
    year: int
    population: Optional[int] = None
    population_range_min: Optional[int] = None
    population_range_max: Optional[int] = None
    source: Optional[str] = None


class SpeciesImpact(BaseModel):
    """Impact of development on a specific species at a location"""
    species_id: str
    location_id: str
    habitat_acres_lost: Optional[float] = None
    impact_description: str


class Species(BaseModel):
    """Wildlife species affected by habitat loss"""
    id: str
    common_name: str
    scientific_name: str
    conservation_status: str  # e.g., "Endangered", "Threatened", "Vulnerable"
    image_url: Optional[str] = None
    description: str
    habitat_requirements: str
    population_trend: str  # e.g., "Declining", "Stable", "Unknown"
    population_data: Optional[List[PopulationDataPoint]] = None
    range_map_url: Optional[str] = None
    affected_locations: Optional[List[str]] = None
