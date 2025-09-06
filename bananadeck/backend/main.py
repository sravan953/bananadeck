import logging
import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from dotenv import load_dotenv

from bananadeck.backend.input2md import UniversalConverter
from bananadeck.backend.md2skeleton import MarkdownToPresentationSkeleton
from bananadeck.backend.skeleton2slides import PresentationSlideGenerator
from bananadeck.backend.slides_redo import expand_slide_workflow

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_KEY")

# Configure logging
log_file_path = Path(__file__).parent / "main.log"
if log_file_path.exists():
    log_file_path.unlink()  # Delete existing log file

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_file_path, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


def process_input(input_path: str) -> None:
    """Process input file or URL through the complete pipeline."""
    converter = UniversalConverter(logger=logger, api_key=GEMINI_KEY)
    presentation_generator = MarkdownToPresentationSkeleton(
        logger=logger, api_key=GEMINI_KEY
    )
    slide_generator = PresentationSlideGenerator(logger=logger, api_key=GEMINI_KEY)

    try:
        # Determine output directory based on input type
        project_root = Path(__file__).parent.parent.parent
        outputs_dir = project_root / "outputs"

        if input_path.endswith(".pdf"):
            folder_name = Path(input_path).stem.replace(" ", "_")
            base_output_dir = outputs_dir / folder_name
            v0_output_dir = base_output_dir / "v0"
        else:  # YouTube URL - let the converter handle folder naming
            # For YouTube, we'll let the converter create the folder, then create v0 inside it
            base_output_dir = outputs_dir  # Will be updated after conversion
            v0_output_dir = None  # Will be set after we know the actual folder name

        # Step 1: Convert input to markdown
        logger.info(f"Step 1: Converting input to markdown: {input_path}")
        if input_path.endswith(".pdf"):
            # For PDF, convert directly to base output directory (not v0)
            markdown_content = converter.convert(input_path, base_output_dir)
        else:
            # For YouTube, convert to base outputs directory
            markdown_content = converter.convert(input_path, outputs_dir)
            # Then find the created folder and set up v0 structure
            if outputs_dir.exists():
                folders = [f for f in outputs_dir.iterdir() if f.is_dir()]
                if folders:
                    # Get the most recently modified folder
                    base_output_dir = max(folders, key=lambda f: f.stat().st_mtime)
                    v0_output_dir = base_output_dir / "v0"
                    # Create v0 directory for skeleton and slides (transcript stays in main folder)
                    v0_output_dir.mkdir(parents=True, exist_ok=True)
                    logger.info(f"Created v0 directory: {v0_output_dir}")
        logger.info("Markdown conversion completed successfully")

        # Step 2: Generate presentation skeleton from markdown
        logger.info("Step 2: Generating presentation skeleton from markdown")

        # Create presentation path in v0 directory
        if input_path.endswith(".pdf"):
            presentation_path = v0_output_dir / f"{folder_name}_presentation.md"
        else:
            # For YouTube videos, use the base folder name
            presentation_path = (
                v0_output_dir / f"{base_output_dir.name}_presentation.md"
            )

        presentation_content = presentation_generator.generate_and_save_presentation(
            markdown_content, presentation_path
        )
        logger.info("Presentation skeleton generation completed successfully")

        # Step 3: Generate slide images from presentation skeleton
        logger.info("Step 3: Generating slide images from presentation skeleton")

        # Create slides directory in v0
        slides_output_dir = v0_output_dir / "slides"

        generated_images = slide_generator.generate_all_slide_images(
            presentation_path, slides_output_dir
        )
        logger.info(
            f"Slide image generation completed successfully. Generated {len(generated_images)} images"
        )

    except Exception as e:
        logger.error(f"Error processing input: {e}")


def expand_slide(input_path: str, slide_number: int) -> None:
    """Expand a specific slide by splitting it into 3 slides and regenerating images."""
    try:
        # Determine the project structure
        project_root = Path(__file__).parent.parent.parent
        outputs_dir = project_root / "outputs"

        # Find the most recent output folder
        if not outputs_dir.exists():
            raise ValueError(
                "No outputs directory found. Please run the main process first."
            )

        folders = [f for f in outputs_dir.iterdir() if f.is_dir()]
        if not folders:
            raise ValueError(
                "No output folders found. Please run the main process first."
            )

        # Get the most recently modified folder
        latest_folder = max(folders, key=lambda f: f.stat().st_mtime)
        logger.info(f"Using output folder: {latest_folder}")

        # Look for presentation files in v0 directory, transcript in main directory
        v0_dir = latest_folder / "v0"
        if v0_dir.exists():
            # Presentation files are in v0 directory
            presentation_files = list(v0_dir.glob("*_presentation.md"))
        else:
            # Fallback: look in main directory (for backward compatibility)
            presentation_files = list(latest_folder.glob("*_presentation.md"))

        # Transcript files are always in the main directory (not v0)
        transcript_files = list(latest_folder.glob("*.md"))
        # Remove presentation files from transcript files
        transcript_files = [f for f in transcript_files if f not in presentation_files]

        if not presentation_files:
            raise ValueError(
                f"No presentation file found in {latest_folder} (checked v0/ and main directory)"
            )
        if not transcript_files:
            raise ValueError(
                f"No transcript file found in {latest_folder} (checked v0/ and main directory)"
            )

        presentation_path = presentation_files[0]
        transcript_path = transcript_files[0]

        logger.info(f"Presentation file: {presentation_path}")
        logger.info(f"Transcript file: {transcript_path}")
        logger.info(f"Expanding slide {slide_number}")

        # Run the expansion workflow
        expand_slide_workflow(
            presentation_path=str(presentation_path),
            transcript_path=str(transcript_path),
            slide_number=slide_number,
            output_base_dir=str(latest_folder),
            api_key=GEMINI_KEY,
        )

        logger.info("Slide expansion completed successfully!")

    except Exception as e:
        logger.error(f"Error expanding slide: {e}")
        raise


if __name__ == "__main__":
    # Example 1: Process input (run this first to create the initial presentation)
    # input = r"C:\Users\sravan953\Downloads\OpenAI_Productivity-Note_Jul-2025.pdf"
    # input = "https://www.youtube.com/watch?v=GmGRDi1h6zs&pp=0gcJCcYJAYcqIYzv"
    # process_input(input)

    # Example 2: Expand a specific slide (uncomment and modify as needed)
    expand_slide(input, slide_number=2)
