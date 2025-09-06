import logging
import re
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional

from google import genai
from google.genai import types
from PIL import Image


class PresentationSlideGenerator:
    def __init__(self, logger: logging.Logger, api_key: str):
        self.logger = logger
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)

    def parse_presentation_skeleton(
        self, markdown_content: str
    ) -> List[Dict[str, str]]:
        """Parse the presentation skeleton markdown into individual slides."""
        slides = []

        # Split by slide headers (## Slide X:)
        slide_pattern = r"## (Slide \d+): (.+?)(?=## |$)"
        matches = re.findall(slide_pattern, markdown_content, re.DOTALL)

        for i, (slide_number, content) in enumerate(matches, 1):
            # Extract slide title
            title = content.split("\n")[0].strip()

            # Extract bullet points (lines starting with -)
            bullet_points = []
            visual_suggestion = None

            for line in content.split("\n"):
                line = line.strip()
                if line.startswith("-") and not line.startswith(
                    "- **Visual suggestion:**"
                ):
                    bullet_points.append(line[1:].strip())
                elif line.startswith("- **Visual suggestion:**"):
                    visual_suggestion = line.replace(
                        "- **Visual suggestion:**", ""
                    ).strip()

            slides.append(
                {
                    "slide_number": i,
                    "title": title,
                    "bullet_points": bullet_points,
                    "visual_suggestion": visual_suggestion,
                }
            )

        return slides

    def generate_image_prompt(self, slide: Dict[str, str]) -> str:
        """Generate a detailed prompt for image generation based on slide content."""
        title = slide["title"]
        bullet_points = slide["bullet_points"]
        visual_suggestion = slide.get("visual_suggestion", "")

        # Create a narrative, descriptive prompt following Nano Banana best practices
        prompt_parts = [
            "Create a professional presentation slide with high-fidelity text rendering. The slide should be a clean, modern corporate presentation slide with a 16:9 aspect ratio.",
            "",
            f"The slide title is: '{title}'",
            "",
            "The slide contains the following bullet points:",
        ]

        for i, point in enumerate(bullet_points, 1):
            prompt_parts.append(f"{i}. {point}")

        if visual_suggestion:
            prompt_parts.extend(
                ["", f"Visual elements to include: {visual_suggestion}"]
            )

        prompt_parts.extend(
            [
                "",
                "Design specifications:",
                "- Use a professional color scheme with high contrast for readability",
                "- Ensure all text is clearly legible and properly positioned",
                "- Include appropriate visual elements that support the content",
                "- Use clean typography with good spacing between elements",
                "- Maintain a professional, corporate presentation aesthetic",
                "- Avoid cluttered layouts - keep it clean and focused",
                "- Ensure the slide title is prominently displayed at the top",
                "- Position bullet points clearly and logically",
                "- Use appropriate visual hierarchy with different text sizes",
                "- Include subtle background elements or graphics that enhance the message",
                "",
                "Text rendering requirements:",
                "- All text must be perfectly legible and accurately rendered",
                "- Use professional fonts suitable for presentations",
                "- Ensure proper contrast between text and background",
                "- Maintain consistent text alignment and spacing",
                "- Make sure the slide title stands out from the bullet points",
            ]
        )

        return "\n".join(prompt_parts)

    def generate_slide_image(
        self, slide: Dict[str, str], output_dir: Path
    ) -> Optional[Path]:
        """Generate an image for a single slide using Gemini."""
        try:
            prompt = self.generate_image_prompt(slide)
            self.logger.info(
                f"Starting image generation for slide {slide['slide_number']}: {slide['title']}"
            )

            # Generate image using Gemini client
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-image-preview",
                contents=[types.Part(text=prompt)],
            )

            # Create image filename with simple template: slide_<number>.png
            image_filename = f"slide_{slide['slide_number']:02d}.png"
            image_path = output_dir / image_filename

            # Process response and save image
            image_saved = False
            for part in response.candidates[0].content.parts:
                if part.text is not None:
                    self.logger.info(f"Text response: {part.text}")
                elif part.inline_data is not None:
                    # Save the generated image
                    image = Image.open(BytesIO(part.inline_data.data))
                    image.save(image_path)
                    image_saved = True
                    self.logger.info(f"Image saved: {image_path}")
                    break

            if not image_saved:
                self.logger.warning(
                    f"No image data found in response for slide {slide['slide_number']}"
                )
                # Create a placeholder file as fallback
                image_path.touch()

            self.logger.info(
                f"✅ Completed slide {slide['slide_number']}: {image_path.name}"
            )
            return image_path

        except Exception as e:
            self.logger.error(f"❌ Failed slide {slide['slide_number']}: {e}")
            return None

    def generate_all_slide_images(
        self, presentation_path: Path, output_dir: Path
    ) -> List[Path]:
        """Generate images for all slides in the presentation."""
        try:
            # Read the presentation markdown
            with open(presentation_path, "r", encoding="utf-8") as f:
                markdown_content = f.read()

            # Parse slides
            slides = self.parse_presentation_skeleton(markdown_content)
            self.logger.info(f"Found {len(slides)} slides to process")
            self.logger.info(f"Output directory: {output_dir}")

            # Create output directory if it doesn't exist
            output_dir.mkdir(parents=True, exist_ok=True)

            # Generate images for each slide
            generated_images = []
            total_slides = len(slides)

            for i, slide in enumerate(slides, 1):
                self.logger.info(f"Processing slide {i}/{total_slides}")
                image_path = self.generate_slide_image(slide, output_dir)
                if image_path:
                    generated_images.append(image_path)
                    self.logger.info(f"Progress: {i}/{total_slides} slides completed")
                else:
                    self.logger.warning(f"Slide {i} failed to generate")

            self.logger.info(
                f"✓ Slide generation complete: {len(generated_images)}/{total_slides} images generated successfully"
            )
            return generated_images

        except Exception as e:
            self.logger.error(f"Error generating slide images: {e}")
            return []

    def create_slides_summary(
        self,
        slides: List[Dict[str, str]],
        generated_images: List[Path],
        output_dir: Path,
    ) -> Path:
        """Create a summary file with slide information and generated images."""
        summary_path = output_dir / "slides_summary.md"

        with open(summary_path, "w", encoding="utf-8") as f:
            f.write("# Presentation Slides Summary\n\n")
            f.write(f"Total slides: {len(slides)}\n")
            f.write(f"Generated images: {len(generated_images)}\n\n")

            for i, slide in enumerate(slides, 1):
                f.write(f"## Slide {i}: {slide['title']}\n\n")

                for point in slide["bullet_points"]:
                    f.write(f"- {point}\n")

                if slide.get("visual_suggestion"):
                    f.write(f"\n**Visual suggestion:** {slide['visual_suggestion']}\n")

                # Find corresponding image
                image_path = None
                for img_path in generated_images:
                    if img_path.name == f"slide_{i:02d}.png":
                        image_path = img_path
                        break

                if image_path:
                    f.write(f"\n**Generated image:** {image_path.name}\n")

                f.write("\n---\n\n")

        return summary_path
