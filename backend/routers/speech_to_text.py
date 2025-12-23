"""
Speech-to-Text API using OpenAI Whisper
Provides voice transcription with grammar correction
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from emergentintegrations.llm.openai import OpenAISpeechToText
import os
import tempfile
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/speech", tags=["Speech-to-Text"])

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = "en"
):
    """
    Transcribe audio to text using OpenAI Whisper
    Supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
    Max file size: 25MB
    """
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="Speech-to-text service not configured")
    
    # Validate file type
    allowed_types = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/x-m4a', 'video/mp4', 'video/webm']
    allowed_extensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm']
    
    file_ext = os.path.splitext(audio.filename)[1].lower() if audio.filename else ''
    
    if audio.content_type not in allowed_types and file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm"
        )
    
    # Check file size (25MB limit)
    content = await audio.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 25MB.")
    
    try:
        # Initialize Whisper
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        
        # Create temp file for the audio
        suffix = file_ext or '.mp3'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        
        try:
            # Transcribe with Whisper
            with open(temp_path, "rb") as audio_file:
                response = await stt.transcribe(
                    file=audio_file,
                    model="whisper-1",
                    response_format="json",
                    language=language,
                    prompt="This is a professional bio description for a wellness content creator. Please transcribe clearly with proper grammar and punctuation.",
                    temperature=0.0
                )
            
            transcribed_text = response.text if hasattr(response, 'text') else str(response)
            
            return {
                "status": "success",
                "text": transcribed_text,
                "language": language
            }
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/transcribe-base64")
async def transcribe_audio_base64(data: dict):
    """
    Transcribe base64 encoded audio to text
    Useful for mobile apps that capture audio as base64
    
    Expected body:
    {
        "audio_base64": "base64_encoded_audio_string",
        "file_type": "mp3",  // mp3, wav, webm, m4a
        "language": "en"  // optional, defaults to en
    }
    """
    import base64
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="Speech-to-text service not configured")
    
    audio_base64 = data.get("audio_base64")
    file_type = data.get("file_type", "mp3")
    language = data.get("language", "en")
    
    if not audio_base64:
        raise HTTPException(status_code=400, detail="audio_base64 is required")
    
    allowed_types = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
    if file_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Supported: {', '.join(allowed_types)}")
    
    try:
        # Decode base64
        audio_content = base64.b64decode(audio_base64)
        
        # Check file size
        if len(audio_content) > 25 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Audio too large. Maximum size is 25MB.")
        
        # Initialize Whisper
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        
        # Create temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_type}') as temp_file:
            temp_file.write(audio_content)
            temp_path = temp_file.name
        
        try:
            with open(temp_path, "rb") as audio_file:
                response = await stt.transcribe(
                    file=audio_file,
                    model="whisper-1",
                    response_format="json",
                    language=language,
                    prompt="This is a professional bio description for a wellness content creator. Please transcribe clearly with proper grammar and punctuation.",
                    temperature=0.0
                )
            
            transcribed_text = response.text if hasattr(response, 'text') else str(response)
            
            return {
                "status": "success",
                "text": transcribed_text,
                "language": language
            }
            
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
