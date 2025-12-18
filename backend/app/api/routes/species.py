from fastapi import APIRouter, HTTPException
from typing import List
from app.models.species import Species, SpeciesImpact

router = APIRouter()

# Placeholder data
SPECIES_DATA = []


@router.get("/", response_model=List[Species])
async def get_species():
    """Get all species information"""
    # TODO: Load from database or JSON file
    return SPECIES_DATA


@router.get("/{species_id}", response_model=Species)
async def get_species_detail(species_id: str):
    """Get detailed information for a specific species"""
    # TODO: Load from database or JSON file
    species = next((s for s in SPECIES_DATA if s.get("id") == species_id), None)

    if not species:
        raise HTTPException(status_code=404, detail=f"Species {species_id} not found")

    return species


@router.get("/location/{location_id}", response_model=List[Species])
async def get_species_by_location(location_id: str):
    """Get all species affected at a specific location"""
    # TODO: Implement filtering logic
    return []
