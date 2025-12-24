from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AriOme API", description="Conscious Living Ecosystem API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ==================== PYDANTIC MODELS ====================

class UserBase(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "user"
    intentions: List[str] = []
    language: str = "en"
    created_at: datetime

class GuestCreate(BaseModel):
    intentions: List[str] = []
    language: str = "en"

class ReflectionCreate(BaseModel):
    content: str
    prompt_id: Optional[str] = None
    mood_before: Optional[str] = None
    mood_after: Optional[str] = None
    voice_url: Optional[str] = None
    image_urls: List[str] = []
    intent_tags: List[str] = []

class ReflectionResponse(BaseModel):
    id: str
    user_id: str
    content: str
    prompt_id: Optional[str] = None
    mood_before: Optional[str] = None
    mood_after: Optional[str] = None
    voice_url: Optional[str] = None
    image_urls: List[str] = []
    intent_tags: List[str] = []
    created_at: datetime

class PromptResponse(BaseModel):
    id: str
    title: str
    body: str
    intent_tags: List[str] = []
    language: str = "en"
    duration: Optional[str] = None
    time_of_day: Optional[str] = None  # morning, evening, anytime

class PracticeResponse(BaseModel):
    id: str
    title: str
    body: str
    intent_tags: List[str] = []
    language: str = "en"
    duration: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None  # audio, video, text
    category: str = "general"  # breathwork, gratitude, stillness, body

class WisdomResponse(BaseModel):
    id: str
    title: str
    body: str
    author: Optional[str] = None
    intent_tags: List[str] = []
    language: str = "en"
    duration: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None  # text, audio, video
    resonance_count: int = 0

class MoodResponse(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    description: str

class IntentionResponse(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    description: str

class ResonanceCreate(BaseModel):
    content_id: str
    content_type: str  # wisdom, practice, prompt

class TranscribeResponse(BaseModel):
    text: str
    success: bool

# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request) -> Optional[dict]:
    """Get current user from session token (cookie or header)"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return None
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user

async def require_user(request: Request) -> dict:
    """Require authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register")
async def register(user_data: UserCreate, response: Response):
    """Register with email/password"""
    import hashlib
    
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid4().hex[:12]}"
    password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
    
    user = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": password_hash,
        "picture": None,
        "role": "user",
        "intentions": [],
        "language": "en",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    # Create session
    session_token = f"sess_{uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    del user["password_hash"]
    return {"user": user, "session_token": session_token}

@app.post("/api/auth/login")
async def login(credentials: UserLogin, response: Response):
    """Login with email/password"""
    import hashlib
    
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    password_hash = hashlib.sha256(credentials.password.encode()).hexdigest()
    if user.get("password_hash") != password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session
    session_token = f"sess_{uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    return {"user": user_response, "session_token": session_token}

@app.post("/api/auth/guest")
async def create_guest(guest_data: GuestCreate, response: Response):
    """Create guest user for non-intrusive onboarding"""
    user_id = f"guest_{uuid4().hex[:12]}"
    
    user = {
        "user_id": user_id,
        "email": None,
        "name": "Explorer",
        "picture": None,
        "role": "guest",
        "intentions": guest_data.intentions,
        "language": guest_data.language,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    # Create session
    session_token = f"guest_{uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=30*24*60*60
    )
    
    return {"user": user, "session_token": session_token}

@app.get("/api/auth/session")
async def process_oauth_session(session_id: str, response: Response):
    """Process Google OAuth session_id from Emergent Auth"""
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            oauth_data = resp.json()
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"OAuth error: {str(e)}")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": oauth_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": oauth_data["name"], "picture": oauth_data["picture"]}}
        )
    else:
        user_id = f"user_{uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": oauth_data["email"],
            "name": oauth_data["name"],
            "picture": oauth_data.get("picture"),
            "role": "user",
            "intentions": [],
            "language": "en",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
    
    # Create session
    session_token = oauth_data.get("session_token", f"sess_{uuid4().hex}")
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    return {"user": user_response, "session_token": session_token}

@app.get("/api/auth/me")
async def get_me(request: Request):
    """Get current user info"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    return user_response

@app.post("/api/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@app.put("/api/auth/profile")
async def update_profile(request: Request, intentions: List[str] = None, language: str = None):
    """Update user profile (intentions, language)"""
    user = await require_user(request)
    update_data = {}
    if intentions is not None:
        update_data["intentions"] = intentions
    if language is not None:
        update_data["language"] = language
    
    if update_data:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {k: v for k, v in updated_user.items() if k != "password_hash"}

# ==================== CONTENT ENDPOINTS ====================

@app.get("/api/prompts", response_model=List[PromptResponse])
async def get_prompts(intent: str = None, time_of_day: str = None, language: str = "en"):
    """Get reflection prompts"""
    query = {"language": language}
    if intent:
        query["intent_tags"] = intent
    if time_of_day:
        query["time_of_day"] = time_of_day
    
    prompts = await db.prompts.find(query, {"_id": 0}).to_list(100)
    return prompts

@app.get("/api/prompts/daily")
async def get_daily_prompt(request: Request):
    """Get today's daily prompt based on user intentions"""
    user = await get_current_user(request)
    language = user.get("language", "en") if user else "en"
    intentions = user.get("intentions", []) if user else []
    
    # Get prompt matching user intentions or random
    query = {"language": language}
    if intentions:
        query["intent_tags"] = {"$in": intentions}
    
    prompts = await db.prompts.find(query, {"_id": 0}).to_list(50)
    if not prompts:
        prompts = await db.prompts.find({"language": language}, {"_id": 0}).to_list(50)
    
    if prompts:
        import random
        # Use day of year as seed for consistent daily prompt
        day_of_year = datetime.now().timetuple().tm_yday
        random.seed(day_of_year)
        return random.choice(prompts)
    
    return {"id": "default", "title": "Morning Intention", "body": "What quality do you want to bring into your day today?", "intent_tags": ["presence"], "language": "en", "duration": "2 min"}

@app.get("/api/practices", response_model=List[PracticeResponse])
async def get_practices(category: str = None, intent: str = None, language: str = "en"):
    """Get practices and rituals"""
    query = {"language": language}
    if category:
        query["category"] = category
    if intent:
        query["intent_tags"] = intent
    
    practices = await db.practices.find(query, {"_id": 0}).to_list(100)
    return practices

@app.get("/api/wisdom", response_model=List[WisdomResponse])
async def get_wisdom(intent: str = None, media_type: str = None, language: str = "en"):
    """Get wisdom library content"""
    query = {"language": language}
    if intent:
        query["intent_tags"] = intent
    if media_type:
        query["media_type"] = media_type
    
    wisdom = await db.wisdom.find(query, {"_id": 0}).sort("resonance_count", -1).to_list(100)
    return wisdom

@app.get("/api/moods", response_model=List[MoodResponse])
async def get_moods():
    """Get available moods for check-ins"""
    moods = await db.moods.find({}, {"_id": 0}).to_list(50)
    return moods

@app.get("/api/intentions", response_model=List[IntentionResponse])
async def get_intentions():
    """Get available intentions for profile"""
    intentions = await db.intentions.find({}, {"_id": 0}).to_list(50)
    return intentions

# ==================== REFLECTION ENDPOINTS ====================

@app.post("/api/reflections")
async def create_reflection(reflection: ReflectionCreate, request: Request):
    """Create a new reflection/journal entry"""
    user = await require_user(request)
    
    reflection_doc = {
        "id": f"ref_{uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "content": reflection.content,
        "prompt_id": reflection.prompt_id,
        "mood_before": reflection.mood_before,
        "mood_after": reflection.mood_after,
        "voice_url": reflection.voice_url,
        "image_urls": reflection.image_urls,
        "intent_tags": reflection.intent_tags,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reflections.insert_one(reflection_doc)
    del reflection_doc["_id"] if "_id" in reflection_doc else None
    return reflection_doc

@app.get("/api/reflections", response_model=List[ReflectionResponse])
async def get_reflections(request: Request, limit: int = 50, skip: int = 0):
    """Get user's reflections"""
    user = await require_user(request)
    
    reflections = await db.reflections.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return reflections

@app.get("/api/reflections/stats")
async def get_reflection_stats(request: Request):
    """Get reflection statistics for user"""
    user = await require_user(request)
    
    total = await db.reflections.count_documents({"user_id": user["user_id"]})
    
    # Calculate streak (consecutive days)
    reflections = await db.reflections.find(
        {"user_id": user["user_id"]},
        {"_id": 0, "created_at": 1}
    ).sort("created_at", -1).to_list(365)
    
    streak = 0
    if reflections:
        today = datetime.now(timezone.utc).date()
        for i, ref in enumerate(reflections):
            ref_date = datetime.fromisoformat(ref["created_at"].replace("Z", "+00:00")).date()
            expected_date = today - timedelta(days=i)
            if ref_date == expected_date:
                streak += 1
            else:
                break
    
    # Get mood patterns
    moods = await db.reflections.aggregate([
        {"$match": {"user_id": user["user_id"], "mood_after": {"$ne": None}}},
        {"$group": {"_id": "$mood_after", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]).to_list(5)
    
    return {
        "total_reflections": total,
        "current_streak": streak,
        "top_moods": [{"mood": m["_id"], "count": m["count"]} for m in moods]
    }

# ==================== RESONANCE ENDPOINTS ====================

@app.post("/api/resonance")
async def add_resonance(resonance: ResonanceCreate, request: Request):
    """Add resonance (instead of like) to content"""
    user = await require_user(request)
    
    # Check if already resonated
    existing = await db.resonances.find_one({
        "user_id": user["user_id"],
        "content_id": resonance.content_id,
        "content_type": resonance.content_type
    })
    
    if existing:
        return {"message": "Already resonated", "resonated": True}
    
    # Add resonance
    await db.resonances.insert_one({
        "id": f"res_{uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "content_id": resonance.content_id,
        "content_type": resonance.content_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Update content resonance count
    collection_map = {"wisdom": "wisdom", "practice": "practices", "prompt": "prompts"}
    collection = collection_map.get(resonance.content_type)
    if collection:
        await db[collection].update_one(
            {"id": resonance.content_id},
            {"$inc": {"resonance_count": 1}}
        )
    
    return {"message": "Resonance added", "resonated": True}

# ==================== SPEECH-TO-TEXT ENDPOINT ====================

@app.post("/api/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe voice recording using OpenAI Whisper"""
    from emergentintegrations.llm.openai import OpenAISpeechToText
    
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Speech-to-text not configured")
    
    try:
        stt = OpenAISpeechToText(api_key=api_key)
        
        # Read file content
        content = await file.read()
        
        # Create a temporary file-like object
        import io
        audio_file = io.BytesIO(content)
        audio_file.name = file.filename or "audio.webm"
        
        response = await stt.transcribe(
            file=audio_file,
            model="whisper-1",
            response_format="json",
            language="en"
        )
        
        return {"text": response.text, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

# ==================== SEED DATA ENDPOINT ====================

@app.post("/api/admin/seed")
async def seed_database():
    """Seed database with initial content"""
    
    # Moods
    moods = [
        {"id": "peaceful", "name": "Peaceful", "icon": "leaf", "color": "#86EFAC", "description": "Calm and serene"},
        {"id": "grateful", "name": "Grateful", "icon": "hand-heart", "color": "#FBBF24", "description": "Appreciating what is"},
        {"id": "hopeful", "name": "Hopeful", "icon": "star-outline", "color": "#7DD3FC", "description": "Looking forward with optimism"},
        {"id": "reflective", "name": "Reflective", "icon": "thought-bubble-outline", "color": "#A78BFA", "description": "Contemplating deeply"},
        {"id": "joyful", "name": "Joyful", "icon": "emoticon-happy-outline", "color": "#FCD34D", "description": "Celebrating life"},
        {"id": "anxious", "name": "Anxious", "icon": "alert-circle-outline", "color": "#F87171", "description": "Feeling worried or restless"},
        {"id": "sad", "name": "Sad", "icon": "emoticon-sad-outline", "color": "#94A3B8", "description": "Experiencing grief or melancholy"},
        {"id": "energized", "name": "Energized", "icon": "flash-outline", "color": "#FB923C", "description": "Full of vitality"},
        {"id": "curious", "name": "Curious", "icon": "magnify", "color": "#38BDF8", "description": "Seeking to understand"},
        {"id": "content", "name": "Content", "icon": "check-circle-outline", "color": "#34D399", "description": "At ease with what is"},
    ]
    
    # Intentions
    intentions = [
        {"id": "healing", "name": "Healing", "icon": "heart-plus-outline", "color": "#EC4899", "description": "Finding comfort and recovery"},
        {"id": "growth", "name": "Growth", "icon": "sprout-outline", "color": "#10B981", "description": "Embracing personal evolution"},
        {"id": "gratitude", "name": "Gratitude", "icon": "hand-heart", "color": "#F59E0B", "description": "Cultivating thankfulness"},
        {"id": "presence", "name": "Presence", "icon": "meditation", "color": "#8B5CF6", "description": "Being fully here now"},
        {"id": "trust", "name": "Trust", "icon": "shield-check-outline", "color": "#06B6D4", "description": "Building confidence in life"},
        {"id": "creativity", "name": "Creativity", "icon": "palette-outline", "color": "#F472B6", "description": "Expressing your inner world"},
        {"id": "connection", "name": "Connection", "icon": "account-heart-outline", "color": "#14B8A6", "description": "Deepening relationships"},
        {"id": "acceptance", "name": "Acceptance", "icon": "hand-peace", "color": "#A3E635", "description": "Embracing what is"},
    ]
    
    # Prompts (from user's JSON + additional)
    prompts = [
        {"id": "prompt_1", "title": "Morning Intention", "body": "What quality do you want to bring into your day today?", "intent_tags": ["presence", "gratitude"], "language": "en", "duration": "2 min", "time_of_day": "morning"},
        {"id": "prompt_2", "title": "Reflection on Trust", "body": "Recall a moment when you trusted someone deeply. How did that feel?", "intent_tags": ["trust", "connection"], "language": "en", "duration": "3 min", "time_of_day": "anytime"},
        {"id": "prompt_3", "title": "Evening Release", "body": "What can you let go of from today to rest more peacefully?", "intent_tags": ["acceptance", "healing"], "language": "en", "duration": "2 min", "time_of_day": "evening"},
        {"id": "prompt_4", "title": "Gratitude Inventory", "body": "Name three things that brought you even a small moment of joy today.", "intent_tags": ["gratitude"], "language": "en", "duration": "2 min", "time_of_day": "evening"},
        {"id": "prompt_5", "title": "Inner Wisdom", "body": "If your wisest self could speak to you right now, what would they say?", "intent_tags": ["growth", "presence"], "language": "en", "duration": "3 min", "time_of_day": "anytime"},
        {"id": "prompt_6", "title": "Relationship Reflection", "body": "Who in your life needs your compassion today? How might you offer it?", "intent_tags": ["connection", "healing"], "language": "en", "duration": "3 min", "time_of_day": "anytime"},
    ]
    
    # Practices (from user's JSON + additional)
    practices = [
        {"id": "practice_1", "title": "3-Minute Breathing", "body": "A short guided breathing exercise to ground yourself. Sit comfortably, inhale for four counts, hold for four counts, exhale for four counts, hold for four counts. Repeat for three minutes.", "intent_tags": ["presence", "healing"], "language": "en", "duration": "3 min", "media_url": None, "media_type": "text", "category": "breathwork"},
        {"id": "practice_2", "title": "Gratitude Pause", "body": "Take one minute to list three things you are grateful for right now. Feel the sensations that arise as you acknowledge each one.", "intent_tags": ["gratitude"], "language": "en", "duration": "1 min", "media_url": None, "media_type": "text", "category": "gratitude"},
        {"id": "practice_3", "title": "Body Scan", "body": "Lie down or sit comfortably. Bring attention slowly from your toes up to the crown of your head, noticing sensations without judgement.", "intent_tags": ["presence", "healing"], "language": "en", "duration": "5 min", "media_url": None, "media_type": "text", "category": "body"},
        {"id": "practice_4", "title": "Stillness Moment", "body": "Find a quiet spot. Close your eyes. Simply be. There is nothing to do, nothing to fix, nothing to achieve. Just exist for these few minutes.", "intent_tags": ["presence", "acceptance"], "language": "en", "duration": "5 min", "media_url": None, "media_type": "text", "category": "stillness"},
        {"id": "practice_5", "title": "Heart Opening", "body": "Place your hand on your heart. Feel its rhythm. Send gratitude to this organ that has served you every moment of your life without you asking.", "intent_tags": ["gratitude", "healing"], "language": "en", "duration": "3 min", "media_url": None, "media_type": "text", "category": "body"},
    ]
    
    # Wisdom (from user's JSON + additional)
    wisdom = [
        {"id": "wisdom_1", "title": "On Letting Go", "body": "Letting go gives us freedom, and freedom is the only condition for happiness.", "author": "Thich Nhat Hanh", "intent_tags": ["acceptance", "healing"], "language": "en", "duration": None, "media_url": None, "media_type": "text", "resonance_count": 0},
        {"id": "wisdom_2", "title": "The Space Between", "body": "Between stimulus and response there is a space. In that space is our power to choose our response.", "author": "Viktor Frankl", "intent_tags": ["presence", "growth"], "language": "en", "duration": None, "media_url": None, "media_type": "text", "resonance_count": 0},
        {"id": "wisdom_3", "title": "Breathing Peace", "body": "Breathing in, I calm my body. Breathing out, I smile. Dwelling in the present moment, I know this is a wonderful moment.", "author": "Thich Nhat Hanh", "intent_tags": ["presence", "gratitude"], "language": "en", "duration": None, "media_url": None, "media_type": "text", "resonance_count": 0},
        {"id": "wisdom_4", "title": "The Present Moment", "body": "Realize deeply that the present moment is all you have. Make the NOW the primary focus of your life.", "author": "Eckhart Tolle", "intent_tags": ["presence"], "language": "en", "duration": None, "media_url": None, "media_type": "text", "resonance_count": 0},
        {"id": "wisdom_5", "title": "On Self-Compassion", "body": "You yourself, as much as anybody in the entire universe, deserve your love and affection.", "author": "Buddha", "intent_tags": ["healing", "growth"], "language": "en", "duration": None, "media_url": None, "media_type": "text", "resonance_count": 0},
        {"id": "wisdom_6", "title": "Inner Peace", "body": "Do not let the behavior of others destroy your inner peace.", "author": "Dalai Lama", "intent_tags": ["acceptance", "presence"], "language": "en", "duration": None, "media_url": None, "media_type": "text", "resonance_count": 0},
    ]
    
    # Clear and insert
    await db.moods.delete_many({})
    await db.intentions.delete_many({})
    await db.prompts.delete_many({})
    await db.practices.delete_many({})
    await db.wisdom.delete_many({})
    
    await db.moods.insert_many(moods)
    await db.intentions.insert_many(intentions)
    await db.prompts.insert_many(prompts)
    await db.practices.insert_many(practices)
    await db.wisdom.insert_many(wisdom)
    
    return {
        "message": "Database seeded successfully",
        "counts": {
            "moods": len(moods),
            "intentions": len(intentions),
            "prompts": len(prompts),
            "practices": len(practices),
            "wisdom": len(wisdom)
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}
