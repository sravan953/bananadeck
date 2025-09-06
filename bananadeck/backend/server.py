import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from bananadeck.backend.main import process_input

load_dotenv()

# Configure logging
log_file_path = Path(__file__).parent / "server.log"
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

app = FastAPI(
    title="BananaDeck API",
    description="API for converting inputs to presentation slides",
    version="1.0.0",
)


class ProcessRequest(BaseModel):
    input_path: str


class ProcessResponse(BaseModel):
    success: bool
    message: str
    input_path: str


@app.post("/process", response_model=ProcessResponse)
async def process_input_endpoint(request: ProcessRequest) -> ProcessResponse:
    """
    Process input file or URL through the complete pipeline.

    - **input_path**: Path to PDF file or YouTube URL to process
    """
    try:
        logger.info(f"Processing request for input: {request.input_path}")
        process_input(request.input_path)

        return ProcessResponse(
            success=True,
            message="Input processed successfully",
            input_path=request.input_path,
        )
    except Exception as e:
        logger.error(f"Error processing input {request.input_path}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing input: {str(e)}")


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "bananadeck-api"}


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint with API information."""
    return {"message": "BananaDeck API", "version": "1.0.0", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
