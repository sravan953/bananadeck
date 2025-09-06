import logging
import re
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from google import genai
from google.genai import types

from .md2skeleton import MarkdownToPresentationSkeleton
from .skeleton2slides import PresentationSlideGenerator


class SlideExpander:
    """Handles expansion of individual slides by splitting them into multiple slides."""

    def __init__(self, api_key: str, logger: logging.Logger):
        self.api_key = api_key
        self.logger = logger
        self.client = genai.Client(api_key=api_key)
        self.presentation_generator = MarkdownToPresentationSkeleton(
            api_key=api_key, logger=logger
        )
        self.slide_generator = PresentationSlideGenerator(
            logger=logger, api_key=api_key
        )

    def find_slide_in_skeleton(
        self, presentation_content: str, slide_number: int
    ) -> Optional[Dict[str, str]]:
        """Find a specific slide in the presentation skeleton and extract its content."""
        slides = self.slide_generator.parse_presentation_skeleton(presentation_content)

        for slide in slides:
            if slide["slide_number"] == slide_number:
                return slide

        return None

    def find_transcript_content_for_slide(
        self, slide: Dict[str, str], transcript_content: str
    ) -> str:
        """Find the relevant transcript content that corresponds to a slide."""
        # Extract key terms from the slide to search in transcript
        search_terms = []

        # Add title words
        title_words = slide["title"].lower().split()
        search_terms.extend([word for word in title_words if len(word) > 3])

        # Add bullet point words
        for bullet in slide["bullet_points"]:
            bullet_words = bullet.lower().split()
            search_terms.extend([word for word in bullet_words if len(word) > 3])

        # Remove common words and duplicates
        common_words = {
            "the",
            "and",
            "for",
            "are",
            "but",
            "not",
            "you",
            "all",
            "can",
            "had",
            "her",
            "was",
            "one",
            "our",
            "out",
            "day",
            "get",
            "has",
            "him",
            "his",
            "how",
            "its",
            "may",
            "new",
            "now",
            "old",
            "see",
            "two",
            "way",
            "who",
            "boy",
            "did",
            "man",
            "men",
            "put",
            "say",
            "she",
            "too",
            "use",
        }
        search_terms = list(
            set([term for term in search_terms if term not in common_words])
        )

        # Find the most relevant section in transcript
        transcript_lower = transcript_content.lower()
        best_match = ""
        max_matches = 0

        # Split transcript into paragraphs/sections
        sections = transcript_content.split("\n\n")

        for section in sections:
            if len(section.strip()) < 50:  # Skip very short sections
                continue

            section_lower = section.lower()
            matches = sum(1 for term in search_terms if term in section_lower)

            if matches > max_matches:
                max_matches = matches
                best_match = section

        return (
            best_match if best_match else transcript_content[:1000]
        )  # Fallback to first 1000 chars

    def expand_slide_content(
        self, slide: Dict[str, str], transcript_content: str
    ) -> List[Dict[str, str]]:
        """Expand a single slide into 3 slides using AI."""
        self.logger.info(f"Expanding slide {slide['slide_number']}: {slide['title']}")

        # Find relevant transcript content
        relevant_transcript = self.find_transcript_content_for_slide(
            slide, transcript_content
        )

        prompt = f"""You are a professional presentation designer. I need you to expand a single slide into 3 separate slides that provide more detailed coverage of the content.

ORIGINAL SLIDE:
Title: {slide['title']}
Content:
{chr(10).join(f"- {point}" for point in slide['bullet_points'])}

RELEVANT TRANSCRIPT CONTENT:
{relevant_transcript}

TASK: Create 3 new slides that expand on this content. The slides should:
1. Provide more detailed coverage of the topic
2. Include additional context from the transcript
3. Maintain logical flow and progression
4. Each slide should be substantial and meaningful
5. **CRITICAL: When creating visual suggestions, ensure they match the theming and style of the original slide image**

OUTPUT FORMAT:
## Slide X: [New Title]
- [Detailed point 1]
- [Detailed point 2]
- [Detailed point 3]
- **Visual suggestion:** [specific visual description that matches the original slide's theming, color scheme, and visual style]

## Slide Y: [New Title]
- [Detailed point 1]
- [Detailed point 2]
- [Detailed point 3]
- **Visual suggestion:** [specific visual description that matches the original slide's theming, color scheme, and visual style]

## Slide Z: [New Title]
- [Detailed point 1]
- [Detailed point 2]
- [Detailed point 3]
- **Visual suggestion:** [specific visual description that matches the original slide's theming, color scheme, and visual style]

IMPORTANT:
- Use the exact format above with "## Slide X:" headers
- Include visual suggestions using the exact format "- **Visual suggestion:**"
- Make each slide substantial and informative
- Draw additional details from the transcript content
- Maintain professional presentation standards
- **THEMING REQUIREMENT: All visual suggestions must maintain consistency with the original slide's design theme, color palette, and visual style to ensure a cohesive presentation experience**"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=[types.Part(text=prompt)],
            )

            # Parse the response to extract the 3 slides
            expanded_content = response.text
            expanded_slides = self.slide_generator.parse_presentation_skeleton(
                expanded_content
            )

            # Ensure we have exactly 3 slides
            if len(expanded_slides) != 3:
                self.logger.warning(
                    f"Expected 3 slides, got {len(expanded_slides)}. Adjusting..."
                )
                # If we don't have exactly 3, take the first 3 or pad with the original
                if len(expanded_slides) > 3:
                    expanded_slides = expanded_slides[:3]
                else:
                    # Pad with modified versions of the original slide
                    while len(expanded_slides) < 3:
                        original_copy = slide.copy()
                        original_copy["title"] = (
                            f"{slide['title']} (Part {len(expanded_slides) + 1})"
                        )
                        expanded_slides.append(original_copy)

            self.logger.info(
                f"Successfully expanded slide into {len(expanded_slides)} slides"
            )
            return expanded_slides

        except Exception as e:
            self.logger.error(f"Error expanding slide: {e}")
            # Fallback: create 3 simple variations of the original slide
            fallback_slides = []
            for i in range(3):
                fallback_slide = slide.copy()
                fallback_slide["title"] = f"{slide['title']} (Part {i + 1})"
                fallback_slides.append(fallback_slide)
            return fallback_slides

    def create_expanded_presentation(
        self,
        original_presentation: str,
        slide_number: int,
        expanded_slides: List[Dict[str, str]],
    ) -> str:
        """Create a new presentation with the expanded slides replacing the original."""
        # Parse the original presentation
        original_slides = self.slide_generator.parse_presentation_skeleton(
            original_presentation
        )

        # Find the slide to replace
        target_slide_index = None
        for i, slide in enumerate(original_slides):
            if slide["slide_number"] == slide_number:
                target_slide_index = i
                break

        if target_slide_index is None:
            raise ValueError(f"Slide {slide_number} not found in presentation")

        # Create new slides list with expanded content
        new_slides = []

        # Add slides before the target
        for i in range(target_slide_index):
            new_slides.append(original_slides[i])

        # Add the 3 expanded slides
        for i, expanded_slide in enumerate(expanded_slides):
            new_slide = expanded_slide.copy()
            new_slide["slide_number"] = target_slide_index + i + 1
            new_slides.append(new_slide)

        # Add remaining slides with updated numbers
        for i in range(target_slide_index + 1, len(original_slides)):
            remaining_slide = original_slides[i].copy()
            remaining_slide["slide_number"] = (
                remaining_slide["slide_number"] + 2
            )  # +2 because we replaced 1 slide with 3 slides (net +2)
            new_slides.append(remaining_slide)

        # Convert back to markdown format
        return self._slides_to_markdown(new_slides)

    def _slides_to_markdown(self, slides: List[Dict[str, str]]) -> str:
        """Convert slides back to markdown presentation format."""
        markdown_parts = ["# Expanded Presentation\n"]

        for slide in slides:
            markdown_parts.append(f"## Slide {slide['slide_number']}: {slide['title']}")

            for point in slide["bullet_points"]:
                markdown_parts.append(f"- {point}")

            if slide.get("visual_suggestion"):
                markdown_parts.append(
                    f"- **Visual suggestion:** {slide['visual_suggestion']}"
                )

            markdown_parts.append("")  # Empty line between slides

        return "\n".join(markdown_parts)

    def expand_slide(
        self,
        presentation_path: Path,
        transcript_path: Path,
        slide_number: int,
        output_dir: Path,
    ) -> Tuple[Path, List[Path]]:
        """Main method to expand a slide and generate new images."""
        self.logger.info(f"Starting slide expansion for slide {slide_number}")

        # Read the original presentation
        with open(presentation_path, "r", encoding="utf-8") as f:
            original_presentation = f.read()

        # Read the transcript
        with open(transcript_path, "r", encoding="utf-8") as f:
            transcript_content = f.read()

        # Find the target slide
        target_slide = self.find_slide_in_skeleton(original_presentation, slide_number)
        if not target_slide:
            raise ValueError(f"Slide {slide_number} not found in presentation")

        # Expand the slide
        expanded_slides = self.expand_slide_content(target_slide, transcript_content)

        # Create new presentation with expanded slides
        new_presentation = self.create_expanded_presentation(
            original_presentation, slide_number, expanded_slides
        )

        # Save the new presentation
        new_presentation_path = output_dir / f"{presentation_path.stem}_expanded.md"
        with open(new_presentation_path, "w", encoding="utf-8") as f:
            f.write(new_presentation)

        self.logger.info(f"Expanded presentation saved to: {new_presentation_path}")

        # Find the original slide image for theming
        original_slide_image_path = None
        try:
            # Look for the original slide image in v0/slides directory
            v0_slides_dir = presentation_path.parent / "slides"
            if v0_slides_dir.exists():
                original_image_filename = f"slide_{slide_number:02d}.png"
                original_slide_image_path = v0_slides_dir / original_image_filename
                if not original_slide_image_path.exists():
                    self.logger.warning(
                        f"Original slide image not found: {original_slide_image_path}"
                    )
                    original_slide_image_path = None
                else:
                    self.logger.info(
                        f"Found original slide image for theming: {original_slide_image_path}"
                    )
            else:
                self.logger.warning(
                    f"Original slides directory not found: {v0_slides_dir}"
                )
        except Exception as e:
            self.logger.warning(f"Error finding original slide image: {e}")

        # Handle images for the expanded presentation
        all_slide_images = []
        slides_dir = output_dir / "slides"
        slides_dir.mkdir(parents=True, exist_ok=True)

        # Parse the new presentation to get all slides with correct numbering
        with open(new_presentation_path, "r", encoding="utf-8") as f:
            new_presentation_content = f.read()

        all_slides = self.slide_generator.parse_presentation_skeleton(
            new_presentation_content
        )

        self.logger.info(
            f"Processing images for {len(all_slides)} slides in expanded presentation"
        )

        # Find the original slides directory
        original_slides_dir = presentation_path.parent / "slides"

        for slide in all_slides:
            slide_num = slide["slide_number"]

            # Determine if this is one of the expanded slides (need generation) or a remaining slide (copy)
            is_expanded_slide = (
                slide_num >= slide_number
                and slide_num < slide_number + len(expanded_slides)
            )

            if is_expanded_slide:
                # Generate new image for expanded slide with theming
                image_path = self.slide_generator.generate_slide_image(
                    slide, slides_dir, original_slide_image_path
                )
                if image_path:
                    all_slide_images.append(image_path)
                    self.logger.info(
                        f"Generated image for expanded slide {slide_num}: {image_path}"
                    )
            else:
                # Copy existing image and rename to match new numbering
                if slide_num < slide_number:
                    # Slides before the expanded section: copy as-is
                    original_image_name = f"slide_{slide_num:02d}.png"
                else:
                    # Slides after the expanded section: copy from original numbering (subtract 2)
                    original_slide_num = slide_num - 2
                    original_image_name = f"slide_{original_slide_num:02d}.png"

                original_image_path = original_slides_dir / original_image_name
                new_image_path = slides_dir / f"slide_{slide_num:02d}.png"

                if original_image_path.exists():
                    # Copy the image
                    shutil.copy2(original_image_path, new_image_path)
                    all_slide_images.append(new_image_path)
                    self.logger.info(
                        f"Copied image for slide {slide_num}: {original_image_name} -> slide_{slide_num:02d}.png"
                    )
                else:
                    self.logger.warning(
                        f"Original image not found for slide {slide_num}: {original_image_path}"
                    )

        self.logger.info(
            f"Slide expansion completed. Processed {len(all_slide_images)} total images"
        )
        return new_presentation_path, all_slide_images


def expand_slide_workflow(
    presentation_path: str,
    transcript_path: str,
    slide_number: int,
    output_base_dir: str,
    api_key: str,
) -> None:
    """Complete workflow for expanding a slide."""
    # Setup logging
    logger = logging.getLogger(__name__)

    # Convert paths to Path objects
    presentation_path = Path(presentation_path)
    transcript_path = Path(transcript_path)
    output_base_dir = Path(output_base_dir)

    # Find the next available version directory
    version_num = 1
    while True:
        version_dir = output_base_dir / f"v{version_num}"
        if not version_dir.exists():
            break
        version_num += 1

    output_dir = output_base_dir / f"v{version_num}"
    output_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Creating new version directory: {output_dir}")

    # Initialize expander
    expander = SlideExpander(api_key=api_key, logger=logger)

    try:
        # Expand the slide
        new_presentation_path, new_images = expander.expand_slide(
            presentation_path, transcript_path, slide_number, output_dir
        )

        logger.info(f"Slide expansion completed successfully!")
        logger.info(f"New presentation: {new_presentation_path}")
        logger.info(f"Generated {len(new_images)} new slide images")

    except Exception as e:
        logger.error(f"Error in slide expansion workflow: {e}")
        raise
