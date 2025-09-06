import logging
import os
from pathlib import Path
from typing import Union

from google import genai
from google.genai import types


class BaseConverter:
    """Base class for all content converters with common functionality."""

    def __init__(self, api_key: str = None, logger=None):
        """Initialize the converter with API key.

        Args:
            api_key: Google Gemini API key. If None, will try to get from environment variable GEMINI_KEY.
            logger: Logger object for logging messages.
        """
        self.api_key = api_key or os.getenv("GEMINI_KEY")
        if not self.api_key:
            raise ValueError(
                "API key is required. Set GEMINI_KEY environment variable or pass api_key parameter."
            )

        self.client = genai.Client(api_key=self.api_key)
        self.logger = logger or logging.getLogger(__name__)

    def save_markdown(self, markdown: str, output_path: Path) -> None:
        """Save markdown content to file.

        Args:
            markdown: Markdown content to save
            output_path: Path to save the markdown file
        """
        # Create output directory if it doesn't exist
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(markdown)
        self.logger.info(f"Markdown saved to: {output_path}")


class PDFToMarkdown(BaseConverter):
    """PDF to Markdown converter using Gemini AI."""

    def process_pdf(self, pdf_path: Path) -> str:
        """Process a PDF file and convert it to markdown using Gemini AI.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Converted markdown content
        """
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        self.logger.info(f"Starting PDF conversion for: {pdf_path}")

        # Read PDF file as bytes
        with open(pdf_path, "rb") as file:
            pdf_data = file.read()

        prompt = """Convert this PDF document into well-formatted markdown. 
        Preserve the structure, headings, lists, and formatting as much as possible.
        Add appropriate markdown headers, bullet points, and formatting.
        Maintain the original document structure and hierarchy.
        
        Ignore page footers, page numbers, and repetitive header/footer content that appears on multiple pages.
        Focus on the main content and body text.
        
        For any images found in the document, describe them in this exact format: {image: describe image here}
        Include the image descriptions at the appropriate locations in the markdown where the images appear."""

        self.logger.info("Sending PDF to Gemini for processing...")
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=pdf_data,
                    mime_type="application/pdf",
                ),
                prompt,
            ],
        )

        self.logger.info("PDF conversion completed successfully")
        return response.text

    def process_pdf_and_save(
        self, pdf_path: Path, output_dir: Path = None, output_path: Path = None
    ) -> str:
        """Process a PDF file, convert to markdown, and optionally save to file.

        Args:
            pdf_path: Path to the PDF file
            output_dir: Output directory for markdown file. If None, uses default outputs directory.
            output_path: Optional specific path to save the markdown file. If provided, overrides output_dir.

        Returns:
            Converted markdown content
        """
        if output_path is None:
            if output_dir is None:
                # Use default output directory relative to project root
                project_root = Path(__file__).parent.parent.parent
                outputs_dir = project_root / "outputs"
                folder_name = pdf_path.stem.replace(" ", "_")
                output_dir = outputs_dir / folder_name
            output_path = output_dir / f"{pdf_path.stem.replace(' ', '_')}.md"

        # Check if markdown file already exists
        if output_path.exists():
            self.logger.info(f"Markdown file already exists: {output_path}")
            self.logger.info("Skipping transcription process - done")
            with open(output_path, "r", encoding="utf-8") as f:
                return f.read()

        markdown = self.process_pdf(pdf_path)
        self.save_markdown(markdown, output_path)
        return markdown


class YouTubeToMarkdown(BaseConverter):
    """YouTube to Markdown converter using Gemini AI."""

    def process_youtube_video(self, youtube_url: str) -> str:
        """Process a YouTube video and convert to enhanced markdown using Gemini's native video analysis.

        Args:
            youtube_url: YouTube video URL

        Returns:
            Enhanced markdown content with transcript and visual descriptions
        """
        self.logger.info(f"Starting YouTube video processing for: {youtube_url}")

        prompt = """You are a professional content creator. Please analyze this YouTube video and create a comprehensive, well-structured markdown document that includes:

1. **Video Title and Overview**: Extract the video title and provide a brief overview
2. **Enhanced Transcript**: Create a clean, well-formatted transcript with proper headings and organization
3. **Visual Descriptions**: Describe what viewers are seeing on screen throughout the video, including:
   - Visual elements, graphics, and text overlays
   - Speaker appearances and expressions
   - Screen recordings, demonstrations, or presentations
   - Any charts, diagrams, or visual aids shown
4. **Key Points and Takeaways**: Extract and highlight the main points, insights, and actionable items
5. **Timestamps**: Include relevant timestamps for major sections
6. **Structure**: Organize everything into a clear, readable format with appropriate markdown formatting

IMPORTANT: At the very beginning of your response, include the video title in this exact format:
VIDEO_TITLE: [exact video title here]

Then continue with the rest of the markdown document that someone could read and get the full value of the video even without watching it."""

        self.logger.info("Sending YouTube video to Gemini for analysis...")
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=types.Content(
                parts=[
                    types.Part(file_data=types.FileData(file_uri=youtube_url)),
                    types.Part(text=prompt),
                ]
            ),
        )

        self.logger.info("YouTube video processing completed successfully")

        # Extract video title from response
        response_text = response.text
        video_title = "youtube_video"  # default fallback

        if "VIDEO_TITLE:" in response_text:
            try:
                title_line = (
                    response_text.split("VIDEO_TITLE:")[1].split("\n")[0].strip()
                )
                video_title = title_line
            except (IndexError, AttributeError):
                self.logger.warning("Could not extract video title, using default")

        return response_text, video_title

    def extract_video_id(self, youtube_url: str) -> str:
        """Extract video ID from YouTube URL.

        Args:
            youtube_url: YouTube video URL

        Returns:
            Video ID string
        """
        if "v=" in youtube_url:
            return youtube_url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in youtube_url:
            return youtube_url.split("youtu.be/")[1].split("?")[0]
        else:
            return "youtube_video"

    def find_existing_video_folder(self, video_id: str, base_output_dir: Path) -> Path:
        """Find existing folder for video ID.

        Args:
            video_id: YouTube video ID
            base_output_dir: Base output directory to search in

        Returns:
            Path to existing folder if found, None otherwise
        """
        if not base_output_dir.exists():
            return None

        for folder in base_output_dir.iterdir():
            if folder.is_dir() and video_id in folder.name:
                return folder
        return None

    def process_youtube_and_save(
        self, youtube_url: str, output_dir: Path = None, output_path: Path = None
    ) -> str:
        """Process a YouTube video, convert to markdown, and optionally save to file.

        Args:
            youtube_url: YouTube video URL
            output_dir: Output directory for markdown file. If None, uses default outputs directory.
            output_path: Optional specific path to save the markdown file. If provided, overrides output_dir.

        Returns:
            Enhanced markdown content
        """
        # Extract video ID first
        video_id = self.extract_video_id(youtube_url)

        # If output_path is not provided, we need to determine it
        if output_path is None:
            if output_dir is None:
                # Use default output directory relative to project root
                project_root = Path(__file__).parent.parent.parent
                base_output_dir = project_root / "outputs"

                # Check if folder with this video ID already exists
                existing_folder = self.find_existing_video_folder(
                    video_id, base_output_dir
                )
                if existing_folder:
                    # Find the markdown file in the existing folder
                    for file in existing_folder.iterdir():
                        if file.suffix.lower() == ".md":
                            output_path = file
                            break

                    if output_path and output_path.exists():
                        self.logger.info(f"Found existing markdown file: {output_path}")
                        self.logger.info("Skipping transcription process - done")
                        with open(output_path, "r", encoding="utf-8") as f:
                            return f.read()

                # If no existing folder found, we need to process the video to get the title
                markdown, video_title = self.process_youtube_video(youtube_url)

                # Create folder with format: <videoID_title>
                safe_title = (
                    video_title.replace(" ", "_").replace("/", "_").replace("\\", "_")
                )
                safe_title = "".join(c for c in safe_title if c.isalnum() or c in "_-")
                if not safe_title:  # fallback if title is empty or invalid
                    safe_title = "video"

                folder_name = f"{video_id}_{safe_title}"
                output_dir = base_output_dir / folder_name
            else:
                # Use provided output_dir, but first check if folder with video ID already exists
                existing_folder = self.find_existing_video_folder(video_id, output_dir)
                if existing_folder:
                    # Find the markdown file in the existing folder
                    for file in existing_folder.iterdir():
                        if file.suffix.lower() == ".md":
                            output_path = file
                            break

                    if output_path and output_path.exists():
                        self.logger.info(f"Found existing markdown file: {output_path}")
                        self.logger.info("Skipping transcription process - done")
                        with open(output_path, "r", encoding="utf-8") as f:
                            return f.read()

                # If no existing folder found, we need to process the video to get the title
                markdown, video_title = self.process_youtube_video(youtube_url)

                # Create folder with format: <videoID_title> within the provided output_dir
                safe_title = (
                    video_title.replace(" ", "_").replace("/", "_").replace("\\", "_")
                )
                safe_title = "".join(c for c in safe_title if c.isalnum() or c in "_-")
                if not safe_title:  # fallback if title is empty or invalid
                    safe_title = "video"

                folder_name = f"{video_id}_{safe_title}"
                output_dir = output_dir / folder_name

            # Use video title for filename
            filename = (
                video_title.replace(" ", "_").replace("/", "_").replace("\\", "_")
            )
            filename = "".join(c for c in filename if c.isalnum() or c in "_-")
            if not filename:  # fallback if title is empty or invalid
                filename = f"youtube_{video_id}"

            output_path = output_dir / f"{filename}.md"

        # Check if markdown file already exists
        if output_path.exists():
            self.logger.info(f"Markdown file already exists: {output_path}")
            self.logger.info("Skipping transcription process - done")
            with open(output_path, "r", encoding="utf-8") as f:
                return f.read()

        # If we haven't processed the video yet (when output_path was provided), do it now
        if "markdown" not in locals():
            markdown, video_title = self.process_youtube_video(youtube_url)

        self.save_markdown(markdown, output_path)
        return markdown


class UniversalConverter:
    """Universal converter that routes to appropriate converter based on input type."""

    def __init__(self, api_key: str = None, logger=None):
        """Initialize the universal converter.

        Args:
            api_key: Google Gemini API key. If None, will try to get from environment variable GEMINI_KEY.
            logger: Logger object for logging messages.
        """
        self.logger = logger or logging.getLogger(__name__)
        self.pdf_converter = PDFToMarkdown(api_key, self.logger)
        self.yt_converter = YouTubeToMarkdown(api_key, self.logger)

    def is_youtube_url(self, input_str: str) -> bool:
        """Check if input is a YouTube URL.

        Args:
            input_str: Input string to check

        Returns:
            True if input is a YouTube URL, False otherwise
        """
        return "youtube.com" in input_str or "youtu.be" in input_str

    def is_pdf_file(self, input_path: Union[str, Path]) -> bool:
        """Check if input is a PDF file.

        Args:
            input_path: Input path to check

        Returns:
            True if input is a PDF file, False otherwise
        """
        path = Path(input_path)
        return path.exists() and path.suffix.lower() == ".pdf"

    def convert(
        self,
        input_data: Union[str, Path],
        output_dir: Path = None,
        output_path: Path = None,
    ) -> str:
        """Convert input to markdown based on input type.

        Args:
            input_data: Input data (PDF file path or YouTube URL)
            output_dir: Output directory for markdown file. If None, uses default outputs directory.
            output_path: Optional specific output path for markdown file. If provided, overrides output_dir.

        Returns:
            Converted markdown content

        Raises:
            ValueError: If input type is not supported
        """
        input_str = str(input_data)

        if self.is_youtube_url(input_str):
            self.logger.info("Detected YouTube URL, using YouTube converter")
            return self.yt_converter.process_youtube_and_save(
                input_str, output_dir, output_path
            )
        elif self.is_pdf_file(input_data):
            self.logger.info("Detected PDF file, using PDF converter")
            return self.pdf_converter.process_pdf_and_save(
                Path(input_data), output_dir, output_path
            )
        else:
            raise ValueError(
                f"Unsupported input type: {input_data}. Supported types: PDF files and YouTube URLs"
            )
