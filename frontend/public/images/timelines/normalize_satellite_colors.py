#!/usr/bin/env python3
"""
Normalize color grading across satellite imagery for consistent timelapse viewing.

This script processes a directory of satellite images (showing wilderness/development)
and applies color normalization to ensure consistent color grading across all images.
This creates a seamless visual experience when viewing images as a timelapse.

Usage:
    python normalize_satellite_colors.py <input_directory> [--output <output_directory>] [--method <method>]

Methods:
    - histogram: Histogram matching to a reference image (default)
    - mean_std: Match mean and standard deviation across images
    - clahe: Contrast Limited Adaptive Histogram Equalization
"""

import argparse
import os
import sys
from pathlib import Path
from typing import List, Tuple, Optional
import numpy as np
from PIL import Image
import cv2


def load_images(directory: Path) -> List[Tuple[str, np.ndarray]]:
    """Load all images from directory."""
    supported_formats = {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'}
    images = []

    for file_path in sorted(directory.glob('*')):
        if file_path.suffix.lower() in supported_formats:
            try:
                img = cv2.imread(str(file_path))
                if img is not None:
                    images.append((str(file_path), img))
                    print(f"Loaded: {file_path.name}")
                else:
                    print(f"Warning: Could not load {file_path.name}")
            except Exception as e:
                print(f"Error loading {file_path.name}: {e}")

    return images


def calculate_reference_stats(images: List[np.ndarray]) -> Tuple[np.ndarray, np.ndarray]:
    """Calculate mean and std across all images to use as reference."""
    all_means = []
    all_stds = []

    for img in images:
        all_means.append(cv2.mean(img)[:3])  # BGR channels
        all_stds.append(cv2.meanStdDev(img)[1].flatten()[:3])

    ref_mean = np.mean(all_means, axis=0)
    ref_std = np.mean(all_stds, axis=0)

    return ref_mean, ref_std


def normalize_mean_std(img: np.ndarray, ref_mean: np.ndarray, ref_std: np.ndarray) -> np.ndarray:
    """Normalize image to match reference mean and standard deviation."""
    img_float = img.astype(np.float32)

    # Process each channel
    normalized = np.zeros_like(img_float)
    for i in range(3):  # BGR channels
        channel = img_float[:, :, i]
        channel_mean = np.mean(channel)
        channel_std = np.std(channel)

        # Avoid division by zero
        if channel_std > 0:
            normalized[:, :, i] = ((channel - channel_mean) / channel_std) * ref_std[i] + ref_mean[i]
        else:
            normalized[:, :, i] = channel

    # Clip values to valid range
    normalized = np.clip(normalized, 0, 255)
    return normalized.astype(np.uint8)


def histogram_matching(source: np.ndarray, reference: np.ndarray) -> np.ndarray:
    """Match histogram of source image to reference image."""
    matched = np.zeros_like(source)

    for i in range(3):  # Process each BGR channel
        source_channel = source[:, :, i]
        reference_channel = reference[:, :, i]

        # Calculate histograms
        source_hist, _ = np.histogram(source_channel.flatten(), 256, [0, 256])
        reference_hist, _ = np.histogram(reference_channel.flatten(), 256, [0, 256])

        # Calculate CDFs
        source_cdf = source_hist.cumsum()
        reference_cdf = reference_hist.cumsum()

        # Normalize CDFs
        source_cdf = source_cdf / source_cdf[-1]
        reference_cdf = reference_cdf / reference_cdf[-1]

        # Create lookup table
        lookup_table = np.zeros(256, dtype=np.uint8)
        ref_idx = 0
        for src_idx in range(256):
            while ref_idx < 255 and reference_cdf[ref_idx] < source_cdf[src_idx]:
                ref_idx += 1
            lookup_table[src_idx] = ref_idx

        # Apply lookup table
        matched[:, :, i] = lookup_table[source_channel]

    return matched


def apply_clahe(img: np.ndarray, clip_limit: float = 2.0, tile_size: int = 8) -> np.ndarray:
    """Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)."""
    # Convert to LAB color space
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    # Apply CLAHE to L channel
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_size, tile_size))
    l_clahe = clahe.apply(l)

    # Merge channels and convert back to BGR
    lab_clahe = cv2.merge([l_clahe, a, b])
    result = cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)

    return result


def create_average_reference(images: List[np.ndarray]) -> np.ndarray:
    """Create an average reference image from all images."""
    print("Creating average reference image...")

    # Ensure all images are the same size
    sizes = [img.shape[:2] for img in images]
    if len(set(sizes)) > 1:
        print("Warning: Images have different sizes. Using median size.")
        heights, widths = zip(*sizes)
        target_height = int(np.median(heights))
        target_width = int(np.median(widths))

        resized_images = []
        for img in images:
            if img.shape[:2] != (target_height, target_width):
                resized = cv2.resize(img, (target_width, target_height))
                resized_images.append(resized)
            else:
                resized_images.append(img)
        images = resized_images

    # Calculate average
    avg_img = np.mean(images, axis=0).astype(np.uint8)
    return avg_img


def process_images(
    input_dir: Path,
    output_dir: Path,
    method: str = 'histogram',
    reference_image: Optional[str] = None
) -> None:
    """Process all images in directory with chosen normalization method."""

    # Load images
    print(f"\nLoading images from: {input_dir}")
    image_data = load_images(input_dir)

    if not image_data:
        print("Error: No images found in directory!")
        sys.exit(1)

    print(f"Found {len(image_data)} images\n")

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Extract images (without filenames)
    images = [img for _, img in image_data]

    # Process based on method
    if method == 'histogram':
        # Use specified reference or create average reference
        if reference_image and Path(reference_image).exists():
            print(f"Using reference image: {reference_image}")
            ref_img = cv2.imread(reference_image)
        else:
            ref_img = create_average_reference(images)
            # Save reference image
            ref_path = output_dir / '_reference.jpg'
            cv2.imwrite(str(ref_path), ref_img)
            print(f"Saved reference image to: {ref_path}")

        print("\nApplying histogram matching...\n")
        for file_path, img in image_data:
            matched = histogram_matching(img, ref_img)
            output_path = output_dir / Path(file_path).name
            cv2.imwrite(str(output_path), matched)
            print(f"Processed: {Path(file_path).name} -> {output_path.name}")

    elif method == 'mean_std':
        print("\nCalculating reference statistics...")
        ref_mean, ref_std = calculate_reference_stats(images)
        print(f"Reference mean: {ref_mean}")
        print(f"Reference std: {ref_std}\n")

        print("Normalizing images...\n")
        for file_path, img in image_data:
            normalized = normalize_mean_std(img, ref_mean, ref_std)
            output_path = output_dir / Path(file_path).name
            cv2.imwrite(str(output_path), normalized)
            print(f"Processed: {Path(file_path).name} -> {output_path.name}")

    elif method == 'clahe':
        print("\nApplying CLAHE...\n")
        for file_path, img in image_data:
            enhanced = apply_clahe(img)
            output_path = output_dir / Path(file_path).name
            cv2.imwrite(str(output_path), enhanced)
            print(f"Processed: {Path(file_path).name} -> {output_path.name}")

    print(f"\nComplete! Processed images saved to: {output_dir}")


def main():
    parser = argparse.ArgumentParser(
        description='Normalize color grading across satellite images for consistent timelapse viewing.'
    )
    parser.add_argument(
        'input_dir',
        type=str,
        help='Directory containing satellite images to process'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        help='Output directory (default: <input_dir>_normalized)'
    )
    parser.add_argument(
        '--method', '-m',
        choices=['histogram', 'mean_std', 'clahe'],
        default='histogram',
        help='Normalization method (default: histogram)'
    )
    parser.add_argument(
        '--reference', '-r',
        type=str,
        help='Path to reference image for histogram matching (optional)'
    )

    args = parser.parse_args()

    # Validate input directory
    input_path = Path(args.input_dir)
    if not input_path.exists():
        print(f"Error: Input directory does not exist: {input_path}")
        sys.exit(1)

    if not input_path.is_dir():
        print(f"Error: Input path is not a directory: {input_path}")
        sys.exit(1)

    # Set output directory
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = input_path.parent / f"{input_path.name}_normalized"

    print("=" * 60)
    print("Satellite Image Color Normalization")
    print("=" * 60)
    print(f"Input directory: {input_path}")
    print(f"Output directory: {output_path}")
    print(f"Method: {args.method}")
    print("=" * 60)

    # Process images
    process_images(input_path, output_path, args.method, args.reference)


if __name__ == '__main__':
    main()
