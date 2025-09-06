#!/usr/bin/env python3
"""
Example script showing how to expand a specific slide.

Usage:
    python expand_slide_example.py <slide_number>

Example:
    python expand_slide_example.py 3
"""

import sys
from pathlib import Path

# Add the project root to the path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from bananadeck.backend.main import expand_slide

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python expand_slide_example.py <slide_number>")
        print("Example: python expand_slide_example.py 3")
        sys.exit(1)

    try:
        slide_number = int(sys.argv[1])
        print(f"Expanding slide {slide_number}...")

        # The input_path parameter is not used in the expand_slide function
        # but we need to provide it for the function signature
        expand_slide("", slide_number)

        print("Slide expansion completed successfully!")
        print("Check the v1/ directory in your latest output folder for the results.")
        print("Note: The original files are in v0/ and the expanded files are in v1/")

    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)
