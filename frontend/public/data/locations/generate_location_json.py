#!/usr/bin/env python3
"""
Generate location JSON files for Disappearing Florida project.

This script scans a directory of satellite imagery with date-based filenames
(e.g., 2022-03-05.png) and generates a properly structured JSON file for the
location, following the format used in mtdora.json.

Usage:
    python generate_location_json.py <image_directory> [options]

Example:
    python generate_location_json.py /path/to/images --id debary --name "DeBary"
"""

import argparse
import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any


def parse_image_filename(filename: str) -> tuple[str, int, str] | None:
    """
    Parse image filename to extract date information.

    Expected formats:
    - YYYY-MM-DD.ext (e.g., 2022-03-05.png)
    - YYYY-MM-DD-name.ext (e.g., 2022-03-05-mtdora.png)

    Returns:
        tuple of (date_string, year, extension) or None if invalid
    """
    # Match date pattern: YYYY-MM-DD
    pattern = r'^(\d{4})-(\d{2})-(\d{2})(?:-[^.]+)?\.(png|jpg|jpeg|webp)$'
    match = re.match(pattern, filename, re.IGNORECASE)

    if match:
        year, month, day, ext = match.groups()
        date_str = f"{year}-{month}-{day}"

        # Validate date
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
            return (date_str, int(year), ext)
        except ValueError:
            return None

    return None


def get_sorted_images(directory: Path) -> List[tuple[str, str, int]]:
    """
    Get all valid images from directory sorted by date.

    Returns:
        List of tuples: (filename, date_string, year)
    """
    images = []

    for file in directory.iterdir():
        if file.is_file():
            parsed = parse_image_filename(file.name)
            if parsed:
                date_str, year, ext = parsed
                images.append((file.name, date_str, year))

    # Sort by date
    images.sort(key=lambda x: x[1])
    return images


def generate_time_points(images: List[tuple[str, str, int]],
                         location_id: str,
                         base_image_path: str) -> List[Dict[str, Any]]:
    """
    Generate time_points array for JSON.

    Args:
        images: List of (filename, date_string, year) tuples
        location_id: ID of the location for constructing paths
        base_image_path: Base path for images (e.g., "/images/timelines/location-name")

    Returns:
        List of time point dictionaries
    """
    time_points = []

    for filename, date_str, year in images:
        # Extract base filename without extension
        base_name = os.path.splitext(filename)[0]

        time_point = {
            "year": year,
            "date": date_str,
            "image_url": f"{base_image_path}/{filename}",
            "image_url_mobile": f"{base_image_path}/{base_name}-mobile.webp",
            "image_url_tablet": f"{base_image_path}/{base_name}-tablet.webp",
            "image_url_desktop": f"{base_image_path}/{base_name}-desktop.webp",
            "description": "Add description here"
        }

        time_points.append(time_point)

    return time_points


def generate_location_json(image_dir: Path,
                           location_id: str,
                           location_name: str,
                           county: str = "",
                           latitude: float = 0.0,
                           longitude: float = 0.0,
                           ecosystem_type: str = "",
                           base_image_path: str = None) -> Dict[str, Any]:
    """
    Generate complete location JSON structure.

    Args:
        image_dir: Path to directory containing images
        location_id: Unique identifier for location (e.g., "mtdora")
        location_name: Display name (e.g., "Mt Dora")
        county: County name(s)
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        ecosystem_type: Type of ecosystem (e.g., "Sandhill")
        base_image_path: Base path for images, defaults to /images/timelines/{location_id}

    Returns:
        Dictionary representing the location JSON
    """
    # Get and sort images
    images = get_sorted_images(image_dir)

    if not images:
        raise ValueError(f"No valid images found in {image_dir}")

    # Default base image path
    if base_image_path is None:
        base_image_path = f"/images/timelines/{location_id}"

    # Generate time points
    time_points = generate_time_points(images, location_id, base_image_path)

    # Use first image as thumbnail
    first_image = images[0][0]

    # Build location JSON
    location_json = {
        "id": location_id,
        "name": location_name,
        "county": county,
        "developers": [],
        "ecosystem_type": ecosystem_type,
        "latitude": latitude,
        "longitude": longitude,
        "thumbnail_url": f"{base_image_path}/{first_image}",
        "description_full": "Add full description here",
        "time_points": time_points,
        "impacted_species": [],
        "habitat_loss_acres": 0
    }

    return location_json


def main():
    parser = argparse.ArgumentParser(
        description='Generate location JSON from directory of dated satellite images',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage
  python generate_location_json.py /path/to/images --id debary --name "DeBary"

  # With all optional fields
  python generate_location_json.py /path/to/images \\
    --id debary \\
    --name "DeBary" \\
    --county "Volusia" \\
    --lat 28.8785 \\
    --lon -81.3248 \\
    --ecosystem "Scrub" \\
    --output debary.json
        """
    )

    parser.add_argument('image_directory', type=str,
                       help='Path to directory containing dated image files')
    parser.add_argument('--id', type=str, required=True,
                       help='Location ID (e.g., "mtdora", "debary")')
    parser.add_argument('--name', type=str, required=True,
                       help='Location display name (e.g., "Mt Dora")')
    parser.add_argument('--county', type=str, default='',
                       help='County name(s)')
    parser.add_argument('--lat', '--latitude', type=float, default=0.0,
                       dest='latitude',
                       help='Latitude coordinate')
    parser.add_argument('--lon', '--longitude', type=float, default=0.0,
                       dest='longitude',
                       help='Longitude coordinate')
    parser.add_argument('--ecosystem', type=str, default='',
                       help='Ecosystem type (e.g., "Sandhill", "Scrub")')
    parser.add_argument('--base-path', type=str, default=None,
                       help='Base path for images (default: /images/timelines/{id})')
    parser.add_argument('--output', '-o', type=str, default=None,
                       help='Output JSON filename (default: {id}.json in current directory)')

    args = parser.parse_args()

    # Validate image directory
    image_dir = Path(args.image_directory)
    if not image_dir.exists():
        print(f"Error: Directory not found: {image_dir}")
        return 1

    if not image_dir.is_dir():
        print(f"Error: Not a directory: {image_dir}")
        return 1

    try:
        # Generate JSON
        location_json = generate_location_json(
            image_dir=image_dir,
            location_id=args.id,
            location_name=args.name,
            county=args.county,
            latitude=args.latitude,
            longitude=args.longitude,
            ecosystem_type=args.ecosystem,
            base_image_path=args.base_path
        )

        # Determine output file
        if args.output:
            output_file = Path(args.output)
        else:
            # Save to current directory by default
            output_file = Path.cwd() / f"{args.id}.json"

        # Write JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(location_json, f, indent=2, ensure_ascii=False)

        print(f"✓ Generated {output_file}")
        print(f"  - Found {len(location_json['time_points'])} images")
        print(f"  - Date range: {location_json['time_points'][0]['date']} to {location_json['time_points'][-1]['date']}")
        print(f"\nNext steps:")
        print(f"  1. Edit {output_file} to add:")
        print(f"     - description_full")
        print(f"     - developers array")
        print(f"     - impacted_species array")
        print(f"     - habitat_loss_acres")
        print(f"     - descriptions for each time_point")
        print(f"  2. Generate responsive image versions (mobile/tablet/desktop .webp)")
        print(f"  3. Move {output_file} to frontend/public/data/locations/")

        return 0

    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == '__main__':
    exit(main())
