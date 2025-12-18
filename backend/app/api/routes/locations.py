from fastapi import APIRouter, HTTPException
from typing import List
from pathlib import Path
import json
from app.models.location import Location, LocationDetail

router = APIRouter()

# Load location data from JSON files
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "locations"


def load_locations() -> List[dict]:
    """Load all location data from JSON files"""
    locations = []
    if not DATA_DIR.exists():
        return locations

    for json_file in DATA_DIR.glob("*.json"):
        try:
            with open(json_file, "r") as f:
                location_data = json.load(f)
                locations.append(location_data)
        except Exception as e:
            print(f"Error loading {json_file}: {e}")

    return locations


def load_location_by_id(location_id: str) -> dict:
    """Load a specific location by ID"""
    location_file = DATA_DIR / f"{location_id}.json"
    if not location_file.exists():
        return None

    try:
        with open(location_file, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {location_file}: {e}")
        return None


@router.get("/", response_model=List[Location])
async def get_locations():
    """Get all locations with basic information"""
    locations_data = load_locations()
    # Convert to Location model (basic info only)
    return [Location(**loc) for loc in locations_data]


@router.get("/{location_id}", response_model=LocationDetail)
async def get_location_detail(location_id: str):
    """Get detailed information for a specific location"""
    location_data = load_location_by_id(location_id)

    if not location_data:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")

    return LocationDetail(**location_data)
