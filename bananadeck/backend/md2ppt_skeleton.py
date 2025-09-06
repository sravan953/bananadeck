import logging
from pathlib import Path
from typing import Union

from google import genai
from google.genai import types


class MarkdownToPresentationSkeleton:
    """Converts markdown content to presentation skeleton using Gemini AI."""

    def __init__(self, api_key: str = None, logger=None):
        """Initialize the presentation generator.

        Args:
            api_key: Google Gemini API key. If None, will try to get from environment variable GEMINI_KEY.
            logger: Logger object for logging messages.
        """
        self.api_key = api_key
        self.client = genai.Client(api_key=self.api_key)
        self.logger = logger or logging.getLogger(__name__)

    def generate_presentation_skeleton(self, markdown_content: str) -> str:
        """Generate a presentation skeleton from markdown content using Gemini AI.

        Args:
            markdown_content: The markdown content to convert to presentation

        Returns:
            Presentation skeleton in markdown format
        """
        self.logger.info("Generating presentation skeleton from markdown content...")

        prompt = """You are a professional presentation designer. Please analyze the provided markdown content and create a comprehensive presentation skeleton that effectively communicates the key information.

Create a presentation structure with the following format:

# [Presentation Title]

## Slide 1: [Title/Introduction]
- [Key point 1]
- [Key point 2]
- [Key point 3]

## Slide 2: [Section Title]
- [Main point with brief explanation]
- [Supporting detail]
- **Visual suggestion:** [describe what visual would help - be specific about charts, images, diagrams, etc.]

## Slide 3: [Next Section]
- [Content point]
- [Another point]
- [Call to action or summary]

[Continue with additional slides as needed...]

## Final Slide: [Conclusion/Summary]
- [Key takeaway 1]
- [Key takeaway 2]
- [Next steps or call to action]

IMPORTANT FORMATTING RULES:
- For visual suggestions, ALWAYS use the exact format: "- **Visual suggestion:** [description]"
- Do NOT use formats like "- Visual:" or "- Visual suggestion:" 
- The visual suggestion should describe specific visual elements like charts, graphs, images, diagrams, or infographics
- Be descriptive about what type of visual would best support the content

Guidelines:
1. Create 8-15 slides maximum for optimal presentation length
2. Each slide should have a clear, descriptive title
3. Use bullet points for easy reading
4. Include visual suggestions where appropriate using the exact format specified above
5. Maintain logical flow and narrative structure
6. Focus on the most important and actionable information
7. Make it engaging and audience-appropriate
8. Include a strong opening and memorable conclusion

Transform the markdown content into a compelling presentation that someone could use to present the material effectively."""

        self.logger.info("Sending markdown to Gemini for presentation generation...")
        response = self.client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[
                types.Part(text=prompt),
                types.Part(text=markdown_content),
            ],
        )

        self.logger.info("Presentation skeleton generation completed successfully")
        return response.text

    def save_presentation(self, presentation: str, output_path: Path) -> None:
        """Save presentation skeleton to file.

        Args:
            presentation: Presentation skeleton content to save
            output_path: Path to save the presentation file
        """
        # Create output directory if it doesn't exist
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(presentation)
        self.logger.info(f"Presentation skeleton saved to: {output_path}")

    def generate_and_save_presentation(
        self, markdown_content: str, output_path: Path
    ) -> str:
        """Generate presentation skeleton and save to file.

        Args:
            markdown_content: The markdown content to convert to presentation
            output_path: Path to save the presentation file

        Returns:
            Generated presentation skeleton content
        """
        # Check if presentation file already exists
        if output_path.exists():
            self.logger.info(f"Presentation file already exists: {output_path}")
            self.logger.info("Skipping presentation generation - done")
            with open(output_path, "r", encoding="utf-8") as f:
                return f.read()

        presentation = self.generate_presentation_skeleton(markdown_content)
        self.save_presentation(presentation, output_path)
        return presentation
