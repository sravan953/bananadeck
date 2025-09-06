import logging
import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from dotenv import load_dotenv

from bananadeck.backend.input2md import UniversalConverter
from bananadeck.backend.md2ppt_skeleton import MarkdownToPresentationSkeleton

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
        logging.FileHandler(log_file_path),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


# Example usage:
if __name__ == "__main__":
    input = r"C:\Users\sravan953\Downloads\OpenAI_Productivity-Note_Jul-2025.pdf"
    # input = "https://www.youtube.com/watch?v=GmGRDi1h6zs&pp=0gcJCcYJAYcqIYzv"

    converter = UniversalConverter(logger=logger, api_key=GEMINI_KEY)
    presentation_generator = MarkdownToPresentationSkeleton(
        logger=logger, api_key=GEMINI_KEY
    )

    try:
        # Determine output directory based on input type
        project_root = Path(__file__).parent.parent.parent
        outputs_dir = project_root / "outputs"

        if input.endswith(".pdf"):
            folder_name = Path(input).stem.replace(" ", "_")
            output_dir = outputs_dir / folder_name
        else:  # YouTube URL - let the converter handle folder naming
            output_dir = outputs_dir

        # Step 1: Convert input to markdown
        logger.info(f"Step 1: Converting input to markdown: {input}")
        markdown_content = converter.convert(input, output_dir)
        logger.info("Markdown conversion completed successfully")

        # Step 2: Generate presentation skeleton from markdown
        logger.info("Step 2: Generating presentation skeleton from markdown")

        # For PDF files, use the original folder name for presentation
        if input.endswith(".pdf"):
            presentation_path = output_dir / f"{folder_name}_presentation.md"
        else:
            # For YouTube videos, find the actual output directory that was created
            # by looking for the most recently created folder in outputs
            if outputs_dir.exists():
                folders = [f for f in outputs_dir.iterdir() if f.is_dir()]
                if folders:
                    # Get the most recently modified folder
                    latest_folder = max(folders, key=lambda f: f.stat().st_mtime)
                    presentation_path = (
                        latest_folder / f"{latest_folder.name}_presentation.md"
                    )
                else:
                    presentation_path = output_dir / "youtube_video_presentation.md"
            else:
                presentation_path = output_dir / "youtube_video_presentation.md"

        presentation_content = presentation_generator.generate_and_save_presentation(
            markdown_content, presentation_path
        )
        logger.info("Presentation skeleton generation completed successfully")

    except Exception as e:
        logger.error(f"Error processing input: {e}")
