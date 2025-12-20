#!/bin/bash
# Script to create responsive image variants for satellite imagery
# Requires ImageMagick or similar tool
#
# Usage: ./create-responsive-images.sh <directory-path>
# Example: ./create-responsive-images.sh ../frontend/public/images/timelines/mtdora

# Check if directory argument is provided
if [ -z "$1" ]; then
  echo "Error: No directory path provided"
  echo "Usage: $0 <directory-path>"
  echo "Example: $0 ../frontend/public/images/timelines/mtdora"
  exit 1
fi

# Directory containing original images
IMAGE_DIR="$1"

# Check if directory exists
if [ ! -d "$IMAGE_DIR" ]; then
  echo "Error: Directory '$IMAGE_DIR' does not exist"
  exit 1
fi

# Find all PNG files in the directory and store in array
# Using while loop instead of mapfile for compatibility
images=()
while IFS= read -r -d '' file; do
  images+=("$(basename "$file")")
done < <(find "$IMAGE_DIR" -maxdepth 1 -name "*.png" -type f -print0)

# Check if any PNG files were found
if [ ${#images[@]} -eq 0 ]; then
  echo "Error: No PNG files found in '$IMAGE_DIR'"
  exit 1
fi

echo "Creating responsive image variants..."
echo "Processing directory: $IMAGE_DIR"
echo "Found ${#images[@]} PNG file(s)"
echo ""

for img in "${images[@]}"; do
  filename="${img%.png}"
  echo "Processing: $img"

  # Mobile version (640px width, WebP format)
  echo "  → Creating mobile version (640w)..."
  convert "$IMAGE_DIR/$img" -resize 640x -quality 85 "$IMAGE_DIR/${filename}-mobile.webp"

  # Tablet version (1024px width, WebP format)
  echo "  → Creating tablet version (1024w)..."
  convert "$IMAGE_DIR/$img" -resize 1024x -quality 85 "$IMAGE_DIR/${filename}-tablet.webp"

  # Desktop version (1920px width, WebP format)
  echo "  → Creating desktop version (1920w)..."
  convert "$IMAGE_DIR/$img" -resize 1920x -quality 85 "$IMAGE_DIR/${filename}-desktop.webp"

  echo "  ✓ Done"
  echo ""
done

echo "All responsive images created!"
echo ""
echo "Expected file structure:"
echo "  - *-mobile.webp (640w) - ~100-200KB"
echo "  - *-tablet.webp (1024w) - ~200-400KB"
echo "  - *-desktop.webp (1920w) - ~500KB-1MB"
echo ""
echo "Original PNGs preserved for fallback."
