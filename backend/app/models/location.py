from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TimePoint(BaseModel):
    """Satellite imagery time point"""
    year: int
    date: str
    image_url: str
    # Responsive image variants
    image_url_mobile: Optional[str] = None  # 640w
    image_url_tablet: Optional[str] = None  # 1024w
    image_url_desktop: Optional[str] = None  # 1920w
    description: Optional[str] = None


class Location(BaseModel):
    """Basic location information for listing"""
    id: str
    name: str
    county: str
    ecosystem_type: str
    latitude: float
    longitude: float
    thumbnail_url: Optional[str] = None
    description_short: str


class LocationDetail(Location):
    """Detailed location information with time-series data"""
    description_full: str
    time_points: List[TimePoint]
    affected_species_ids: List[str]
    density_data: Optional[dict] = None
    habitat_loss_acres: Optional[float] = None
    habitat_loss_percentage: Optional[float] = None
