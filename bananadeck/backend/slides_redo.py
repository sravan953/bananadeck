import logging
import re
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

OUTPUT FORMAT:
## Slide X: [New Title]
- [Detailed point 1]
- [Detailed point 2]
- [Detailed point 3]
- **Visual suggestion:** [specific visual description]

## Slide Y: [New Title]
- [Detailed point 1]
- [Detailed point 2]
- [Detailed point 3]
- **Visual suggestion:** [specific visual description]

## Slide Z: [New Title]
- [Detailed point 1]
- [Detailed point 2]
- [Detailed point 3]
- **Visual suggestion:** [specific visual description]

IMPORTANT:
- Use the exact format above with "## Slide X:" headers
- Include visual suggestions using the exact format "- **Visual suggestion:**"
- Make each slide substantial and informative
- Draw additional details from the transcript content
- Maintain professional presentation standards"""

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
            )  # +2 because we added 2 new slides
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

        # Generate images only for the expanded slides
        expanded_slide_images = []
        slides_dir = output_dir / "slides"
        slides_dir.mkdir(parents=True, exist_ok=True)

        for i, expanded_slide in enumerate(expanded_slides):
            # Update slide number to match the new presentation
            expanded_slide["slide_number"] = slide_number + i

            image_path = self.slide_generator.generate_slide_image(
                expanded_slide, slides_dir
            )
            if image_path:
                expanded_slide_images.append(image_path)
                self.logger.info(
                    f"Generated image for expanded slide {expanded_slide['slide_number']}: {image_path}"
                )

        self.logger.info(
            f"Slide expansion completed. Generated {len(expanded_slide_images)} new images"
        )
        return new_presentation_path, expanded_slide_images


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

    # Create v1 output directory
    v1_output_dir = output_base_dir / "v1"
    v1_output_dir.mkdir(parents=True, exist_ok=True)

    # Initialize expander
    expander = SlideExpander(api_key=api_key, logger=logger)

    try:
        # Expand the slide
        new_presentation_path, new_images = expander.expand_slide(
            presentation_path, transcript_path, slide_number, v1_output_dir
        )

        logger.info(f"Slide expansion completed successfully!")
        logger.info(f"New presentation: {new_presentation_path}")
        logger.info(f"Generated {len(new_images)} new slide images")

    except Exception as e:
        logger.error(f"Error in slide expansion workflow: {e}")
        raise
