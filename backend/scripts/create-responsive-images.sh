#!/bin/bash
# Script to create responsive image variants for satellite imagery
# Requires ImageMagick or similar tool

# Directory containing original images
IMAGE_DIR="./static/images/timelines/mtdora"

# Image files to process
images=(
  "mtdora-2004-12-31.png"
  "mtdora-2005-01-19.png"
  "mtdora-2005-11-23.png"
  "mtdora-2011-11-13.png"
  "mtdora-2018-12-18.png"
  "mtdora-2019-11-27.png"
  "mtdora-2021-01-10.png"
  "mtdora-2022-04-16.png"
  "mtdora-2024-04-17.png"
  "mtdora-2025-05-17.png"
)

echo "Creating responsive image variants..."
echo "Original image sizes: 3.8MB - 4.6MB PNG"
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
