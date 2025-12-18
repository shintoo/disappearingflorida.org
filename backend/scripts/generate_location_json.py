#!/usr/bin/env python3
"""
Generate location JSON file from a directory of timeline images.

Usage:
    python generate_location_json.py <image_directory>

Example:
    python generate_location_json.py ../static/images/timelines/mtdora-southeast

Expected filename format: {location-id}-{YYYY-MM-DD}.png
Example: mtdora-southeast-2025-05-01.png
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any


def parse_filename(filename: str) -> tuple[str, str, str] | None:
    """
    Parse image filename to extract location ID and date.

    Expected format: {location-id}-{YYYY-MM-DD}.{ext}
    Example: mtdora-southeast-2025-05-01.png

    Returns (location_id, date_str, extension) or None if format doesn't match
    """
    # Match pattern: location-id (can have hyphens) followed by date
    pattern = r'^(.+?)-(\d{4}-\d{2}-\d{2})\.(png|jpg|jpeg|webp)$'
    match = re.match(pattern, filename)

    if match:
        location_id = match.group(1)
        date_str = match.group(2)
        extension = match.group(3)

        # Validate date format
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
            return location_id, date_str, extension
        except ValueError:
            return None

    return None


def generate_responsive_urls(base_path: str, location_id: str, date: str) -> Dict[str, str]:
    """Generate responsive image URLs for different device sizes."""
    base = f"{base_path}/{date}-{location_id}"
    return {
        "image_url": f"{base}.png",
        "image_url_mobile": f"{base}-mobile.webp",
        "image_url_tablet": f"{base}-tablet.webp",
        "image_url_desktop": f"{base}-desktop.webp"
    }


def create_time_point(base_path: str, location_id: str, date: str, description: str = "") -> Dict[str, Any]:
    """Create a time point entry for the JSON."""
    year = int(date.split('-')[0])

    time_point = {
        "year": year,
        "date": date,
        **generate_responsive_urls(base_path, location_id, date),
        "description": description
    }

    return time_point


def format_location_name(location_id: str) -> str:
    """Convert location ID to a human-readable name."""
    # Split on hyphens and capitalize each word
    words = location_id.split('-')
    return ' '.join(word.capitalize() for word in words)


def main():
    parser = argparse.ArgumentParser(
        description='Generate location JSON from directory of timeline images'
    )
    parser.add_argument(
        'directory',
        type=str,
        help='Directory containing timeline images (e.g., ../static/images/timelines/mtdora-southeast)'
    )
    parser.add_argument(
        '--output',
        type=str,
        help='Output JSON file path (default: auto-generated in current directory)'
    )
    parser.add_argument(
        '--county',
        type=str,
        default='',
        help='County name (optional)'
    )
    parser.add_argument(
        '--ecosystem',
        type=str,
        default='',
        help='Ecosystem type (optional)'
    )
    parser.add_argument(
        '--lat',
        type=float,
        help='Latitude (optional)'
    )
    parser.add_argument(
        '--lon',
        type=float,
        help='Longitude (optional)'
    )

    args = parser.parse_args()

    # Convert to Path object
    image_dir = Path(args.directory)

    if not image_dir.exists():
        print(f"Error: Directory '{image_dir}' does not exist", file=sys.stderr)
        sys.exit(1)

    if not image_dir.is_dir():
        print(f"Error: '{image_dir}' is not a directory", file=sys.stderr)
        sys.exit(1)

    # Find all image files
    image_extensions = ['.png', '.jpg', '.jpeg', '.webp']
    image_files = [
        f for f in image_dir.iterdir()
        if f.is_file() and f.suffix.lower() in image_extensions
        and not any(x in f.name for x in ['mobile', 'tablet', 'desktop'])  # Skip responsive versions
    ]

    if not image_files:
        print(f"Error: No image files found in '{image_dir}'", file=sys.stderr)
        sys.exit(1)

    # Parse filenames and collect time points
    time_points_data = []
    location_id = None

    for img_file in image_files:
        parsed = parse_filename(img_file.name)

        if not parsed:
            print(f"Warning: Skipping file with unexpected format: {img_file.name}", file=sys.stderr)
            continue

        file_location_id, date_str, ext = parsed

        # Verify all files have the same location ID
        if location_id is None:
            location_id = file_location_id
        elif location_id != file_location_id:
            print(f"Warning: Mixed location IDs found ('{location_id}' vs '{file_location_id}')", file=sys.stderr)
            print(f"Using first found location ID: '{location_id}'", file=sys.stderr)

        time_points_data.append((date_str, img_file.name))

    if not time_points_data:
        print("Error: No valid image files found matching expected format", file=sys.stderr)
        print("Expected format: {location-id}-YYYY-MM-DD.png", file=sys.stderr)
        sys.exit(1)

    # Sort by date
    time_points_data.sort(key=lambda x: x[0])

    # Determine base path for URLs
    # Extract the relative path from static/images onwards
    try:
        static_idx = image_dir.parts.index('static')
        relative_parts = image_dir.parts[static_idx:]
        base_path = '/' + '/'.join(relative_parts)
    except (ValueError, IndexError):
        # Fallback to generic path
        base_path = f"/static/images/timelines/{location_id}"

    # Create time points
    time_points = []
    for i, (date_str, filename) in enumerate(time_points_data):
        # Generate basic descriptions based on position in timeline
        if i == 0:
            description = "Before development - intact natural habitat"
        elif i == len(time_points_data) - 1:
            description = "Current state - development complete"
        else:
            description = f"Development in progress - {date_str}"

        time_point = create_time_point(base_path, location_id, date_str, description)
        time_points.append(time_point)

    # Use first image as thumbnail
    thumbnail_date = time_points_data[0][0]
    thumbnail_url = f"{base_path}/{thumbnail_date}-{location_id}.png"

    # Build the complete JSON structure
    location_data = {
        "id": location_id,
        "name": args.county + " - " + format_location_name(location_id) if args.county else format_location_name(location_id),
        "county": args.county,
        "ecosystem_type": args.ecosystem,
        "latitude": args.lat if args.lat is not None else 0.0,
        "longitude": args.lon if args.lon is not None else 0.0,
        "thumbnail_url": thumbnail_url,
        "description_short": f"Development site in {args.county or 'Florida'} showing habitat transformation.",
        "description_full": f"This area shows the transformation of natural ecosystems into suburban development. Images span from {time_points_data[0][0]} to {time_points_data[-1][0]}.",
        "time_points": time_points,
        "affected_species_ids": [],
        "habitat_loss_acres": 0
    }

    # Determine output file path
    if args.output:
        output_file = Path(args.output)
    else:
        output_file = Path(f"{location_id}.json")

    # Write JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(location_data, f, indent=2, ensure_ascii=False)

    print(f"✓ Generated location JSON: {output_file}")
    print(f"✓ Location ID: {location_id}")
    print(f"✓ Time points: {len(time_points)}")
    print(f"\nNext steps:")
    print(f"1. Edit {output_file} to add:")
    print(f"   - Accurate name, county, and ecosystem type")
    print(f"   - Latitude and longitude coordinates")
    print(f"   - Detailed descriptions for each time point")
    print(f"   - Accurate habitat_loss_acres estimate")
    print(f"2. Create responsive image versions (mobile/tablet/desktop .webp)")
    print(f"3. Move JSON to backend/app/data/locations/")


if __name__ == '__main__':
    main()
