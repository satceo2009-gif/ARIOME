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
    user.pop("_id", None)  # Remove MongoDB ObjectId
    
    # Create session
    session_token = f"sess_{uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
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
    user.pop("_id", None)  # Remove MongoDB ObjectId before returning
    
    # Create session
    session_token = f"guest_{uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
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

@app.get("/api/auth/export-data")
async def export_user_data(request: Request):
    """Export all user data (GDPR compliance)"""
    user = await require_user(request)
    
    # Collect all user data
    reflections = await db.reflections.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).to_list(1000)
    
    bookmarks = await db.bookmarks.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).to_list(1000)
    
    circle_memberships = await db.circle_members.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).to_list(100)
    
    resonances = await db.resonance.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).to_list(1000)
    
    user_data = await db.users.find_one(
        {"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0}
    )
    
    export_data = {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user_profile": user_data,
        "reflections": reflections,
        "bookmarks": bookmarks,
        "circle_memberships": circle_memberships,
        "resonances": resonances,
        "total_reflections": len(reflections),
        "total_bookmarks": len(bookmarks)
    }
    
    return export_data

@app.delete("/api/auth/account")
async def delete_user_account(request: Request):
    """Permanently delete user account and all data"""
    user = await require_user(request)
    user_id = user["user_id"]
    
    # Delete all user data
    await db.reflections.delete_many({"user_id": user_id})
    await db.bookmarks.delete_many({"user_id": user_id})
    await db.circle_members.delete_many({"user_id": user_id})
    await db.resonance.delete_many({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.users.delete_one({"user_id": user_id})
    
    return {"message": "Account and all data permanently deleted"}

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

@app.get("/api/practices")
async def get_practices(category: str = None, intent: str = None, mood: str = None, language: str = "en"):
    """Get practices and rituals"""
    query = {}
    if category:
        query["category"] = category
    if intent:
        query["intent_tags"] = intent
    if mood:
        query["mood"] = mood
    
    practices = await db.practices.find(query, {"_id": 0}).to_list(100)
    return practices

@app.get("/api/wisdom")
async def get_wisdom(intent: str = None, media_type: str = None, mood: str = None, language: str = "en"):
    """Get wisdom library content"""
    query = {}
    if intent:
        query["intent_tags"] = intent
    if media_type:
        query["media_type"] = media_type
    if mood:
        query["mood"] = mood
    
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
    if "_id" in reflection_doc:
        del reflection_doc["_id"]
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

@app.put("/api/reflections/{reflection_id}")
async def update_reflection(reflection_id: str, request: Request):
    """Update a reflection"""
    user = await require_user(request)
    body = await request.json()
    
    # Find the reflection
    reflection = await db.reflections.find_one({
        "id": reflection_id,
        "user_id": user["user_id"]
    })
    
    if not reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")
    
    # Update fields
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if "content" in body:
        update_data["content"] = body["content"]
    if "mood_before" in body:
        update_data["mood_before"] = body["mood_before"]
    if "mood_after" in body:
        update_data["mood_after"] = body["mood_after"]
    
    await db.reflections.update_one(
        {"id": reflection_id, "user_id": user["user_id"]},
        {"$set": update_data}
    )
    
    return {"status": "success", "message": "Reflection updated"}

@app.delete("/api/reflections/{reflection_id}")
async def delete_reflection(reflection_id: str, request: Request):
    """Delete a reflection"""
    user = await require_user(request)
    
    result = await db.reflections.delete_one({
        "id": reflection_id,
        "user_id": user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reflection not found")
    
    return {"status": "success", "message": "Reflection deleted"}

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

# ==================== BOOKMARKS ENDPOINTS ====================

class BookmarkRequest(BaseModel):
    content_id: str
    content_type: str  # wisdom, practice

@app.get("/api/bookmarks")
async def get_bookmarks(request: Request, content_type: str = None):
    """Get user's bookmarks"""
    user = await require_user(request)
    
    query = {"user_id": user["user_id"]}
    if content_type:
        query["content_type"] = content_type
    
    bookmarks = await db.bookmarks.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Fetch actual content for each bookmark
    result = []
    for bookmark in bookmarks:
        content = None
        if bookmark["content_type"] == "wisdom":
            content = await db.wisdom.find_one({"id": bookmark["content_id"]}, {"_id": 0})
        elif bookmark["content_type"] == "practice":
            content = await db.practices.find_one({"id": bookmark["content_id"]}, {"_id": 0})
        
        if content:
            result.append({**bookmark, "content": content})
    
    return result

@app.post("/api/bookmarks")
async def add_bookmark(bookmark: BookmarkRequest, request: Request):
    """Add a bookmark"""
    user = await require_user(request)
    
    # Check if already bookmarked
    existing = await db.bookmarks.find_one({
        "user_id": user["user_id"],
        "content_id": bookmark.content_id
    })
    
    if existing:
        return {"message": "Already bookmarked", "bookmarked": True}
    
    await db.bookmarks.insert_one({
        "id": f"bm_{uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "content_id": bookmark.content_id,
        "content_type": bookmark.content_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Bookmark added", "bookmarked": True}

@app.delete("/api/bookmarks/{content_id}")
async def remove_bookmark(content_id: str, request: Request):
    """Remove a bookmark"""
    user = await require_user(request)
    
    result = await db.bookmarks.delete_one({
        "user_id": user["user_id"],
        "content_id": content_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    return {"message": "Bookmark removed", "bookmarked": False}

@app.get("/api/bookmarks/check/{content_id}")
async def check_bookmark(content_id: str, request: Request):
    """Check if content is bookmarked"""
    user = await get_current_user(request)
    if not user:
        return {"bookmarked": False}
    
    bookmark = await db.bookmarks.find_one({
        "user_id": user["user_id"],
        "content_id": content_id
    })
    
    return {"bookmarked": bookmark is not None}

# ==================== JOURNAL TAGS & SEARCH ====================

@app.get("/api/reflections/search")
async def search_reflections(request: Request, q: str = None, tag: str = None, mood: str = None):
    """Search user's reflections"""
    user = await require_user(request)
    
    query = {"user_id": user["user_id"]}
    
    if q:
        query["content"] = {"$regex": q, "$options": "i"}
    if tag:
        query["tags"] = tag
    if mood:
        query["$or"] = [{"mood_before": mood}, {"mood_after": mood}]
    
    reflections = await db.reflections.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reflections

@app.get("/api/reflections/tags")
async def get_user_tags(request: Request):
    """Get all unique tags used by user"""
    user = await require_user(request)
    
    pipeline = [
        {"$match": {"user_id": user["user_id"], "tags": {"$exists": True, "$ne": []}}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    result = await db.reflections.aggregate(pipeline).to_list(50)
    return [{"tag": r["_id"], "count": r["count"]} for r in result]

@app.put("/api/reflections/{reflection_id}/tags")
async def update_reflection_tags(reflection_id: str, request: Request):
    """Update tags for a reflection"""
    user = await require_user(request)
    body = await request.json()
    tags = body.get("tags", [])
    
    result = await db.reflections.update_one(
        {"id": reflection_id, "user_id": user["user_id"]},
        {"$set": {"tags": tags}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reflection not found")
    
    return {"message": "Tags updated", "tags": tags}

# ==================== WEEKLY INSIGHTS ====================

@app.get("/api/insights/weekly")
async def get_weekly_insights(request: Request):
    """Get weekly mood trends and insights"""
    user = await require_user(request)
    
    # Get reflections from last 7 days
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    
    reflections = await db.reflections.find({
        "user_id": user["user_id"],
        "created_at": {"$gte": week_ago}
    }, {"_id": 0}).to_list(100)
    
    # Calculate mood trends
    mood_counts = {}
    for r in reflections:
        if r.get("mood_before"):
            mood_counts[r["mood_before"]] = mood_counts.get(r["mood_before"], 0) + 1
        if r.get("mood_after"):
            mood_counts[r["mood_after"]] = mood_counts.get(r["mood_after"], 0) + 1
    
    # Sort by count
    top_moods = sorted(mood_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Get streak
    streak = await calculate_streak(user["user_id"])
    
    return {
        "total_reflections": len(reflections),
        "top_moods": [{"mood": m[0], "count": m[1]} for m in top_moods],
        "streak": streak,
        "insights": generate_insights(reflections, mood_counts)
    }

async def calculate_streak(user_id: str) -> int:
    """Calculate consecutive days of reflection"""
    reflections = await db.reflections.find(
        {"user_id": user_id},
        {"_id": 0, "created_at": 1}
    ).sort("created_at", -1).to_list(365)
    
    if not reflections:
        return 0
    
    streak = 1
    today = datetime.now(timezone.utc).date()
    
    # Check if user reflected today
    last_date = datetime.fromisoformat(reflections[0]["created_at"].replace("Z", "+00:00")).date()
    if (today - last_date).days > 1:
        return 0
    
    for i in range(1, len(reflections)):
        curr_date = datetime.fromisoformat(reflections[i]["created_at"].replace("Z", "+00:00")).date()
        prev_date = datetime.fromisoformat(reflections[i-1]["created_at"].replace("Z", "+00:00")).date()
        
        if (prev_date - curr_date).days == 1:
            streak += 1
        elif (prev_date - curr_date).days > 1:
            break
    
    return streak

def generate_insights(reflections: list, mood_counts: dict) -> list:
    """Generate personalized insights"""
    insights = []
    
    if len(reflections) >= 7:
        insights.append("Great consistency this week! You've reflected regularly.")
    elif len(reflections) >= 3:
        insights.append("You're building a good reflection habit. Keep it up!")
    elif len(reflections) > 0:
        insights.append("Consider reflecting more often to deepen your self-awareness.")
    
    # Mood-based insights
    positive_moods = ["peaceful", "grateful", "hopeful", "joyful", "content"]
    negative_moods = ["anxious", "sad"]
    
    positive_count = sum(mood_counts.get(m, 0) for m in positive_moods)
    negative_count = sum(mood_counts.get(m, 0) for m in negative_moods)
    
    if positive_count > negative_count * 2:
        insights.append("Your mood has been predominantly positive. Wonderful!")
    elif negative_count > positive_count:
        insights.append("Consider exploring practices for emotional balance.")
    
    return insights

# ==================== CIRCLE POSTS ENDPOINTS ====================

class CirclePostCreate(BaseModel):
    content: str
    mood: Optional[str] = None

@app.get("/api/circles/{circle_id}")
async def get_circle_detail(circle_id: str, request: Request):
    """Get circle details with recent posts"""
    circle = await db.circles.find_one({"id": circle_id}, {"_id": 0})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    # Check if user is member
    user = await get_current_user(request)
    is_member = False
    if user:
        membership = await db.circle_members.find_one({
            "circle_id": circle_id,
            "user_id": user["user_id"]
        })
        is_member = membership is not None
    
    # Get recent posts
    posts = await db.circle_posts.find(
        {"circle_id": circle_id}, {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    # Add author info to posts
    for post in posts:
        author = await db.users.find_one(
            {"user_id": post["author_id"]},
            {"_id": 0, "name": 1, "picture": 1}
        )
        post["author_name"] = author.get("name", "Anonymous") if author else "Anonymous"
        post["author_picture"] = author.get("picture") if author else None
    
    return {
        **circle,
        "is_member": is_member,
        "posts": posts
    }

@app.get("/api/circles/{circle_id}/posts")
async def get_circle_posts(circle_id: str, page: int = 1, limit: int = 20):
    """Get paginated circle posts"""
    skip = (page - 1) * limit
    
    posts = await db.circle_posts.find(
        {"circle_id": circle_id}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Add author info
    for post in posts:
        author = await db.users.find_one(
            {"user_id": post["author_id"]},
            {"_id": 0, "name": 1, "picture": 1}
        )
        post["author_name"] = author.get("name", "Anonymous") if author else "Anonymous"
        post["author_picture"] = author.get("picture") if author else None
    
    total = await db.circle_posts.count_documents({"circle_id": circle_id})
    
    return {"posts": posts, "total": total, "page": page}

@app.post("/api/circles/{circle_id}/posts")
async def create_circle_post(circle_id: str, post_data: CirclePostCreate, request: Request):
    """Create a new post in a circle"""
    user = await require_user(request)
    
    # Verify membership
    membership = await db.circle_members.find_one({
        "circle_id": circle_id,
        "user_id": user["user_id"]
    })
    if not membership:
        raise HTTPException(status_code=403, detail="Must be a member to post")
    
    post_id = f"post_{uuid4().hex[:12]}"
    
    post = {
        "id": post_id,
        "circle_id": circle_id,
        "user_id": user["user_id"],
        "user_name": user.get("name", "Anonymous"),
        "author_id": user["user_id"],
        "content": post_data.content,
        "mood": post_data.mood,
        "likes": 0,
        "liked_by": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.circle_posts.insert_one(post)
    post.pop("_id", None)
    
    # Update circle post count
    await db.circles.update_one(
        {"id": circle_id},
        {"$inc": {"post_count": 1}}
    )
    
    return post

@app.post("/api/circles/{circle_id}/posts/{post_id}/like")
async def like_circle_post(circle_id: str, post_id: str, request: Request):
    """Like or unlike a circle post"""
    user = await require_user(request)
    
    post = await db.circle_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    liked_by = post.get("liked_by", [])
    
    if user["user_id"] in liked_by:
        # Unlike
        await db.circle_posts.update_one(
            {"id": post_id},
            {
                "$pull": {"liked_by": user["user_id"]},
                "$inc": {"likes": -1}
            }
        )
        return {"liked": False}
    else:
        # Like
        await db.circle_posts.update_one(
            {"id": post_id},
            {
                "$push": {"liked_by": user["user_id"]},
                "$inc": {"likes": 1}
            }
        )
        return {"liked": True}

@app.delete("/api/circles/{circle_id}/posts/{post_id}")
async def delete_circle_post(circle_id: str, post_id: str, request: Request):
    """Delete a circle post (author or admin only)"""
    user = await require_user(request)
    
    post = await db.circle_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check authorization
    if post["author_id"] != user["user_id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    await db.circle_posts.delete_one({"id": post_id})
    
    # Update circle post count
    await db.circles.update_one(
        {"id": circle_id},
        {"$inc": {"post_count": -1}}
    )
    
    return {"message": "Post deleted"}

# ==================== COMMENTS ENDPOINTS ====================

class CommentCreate(BaseModel):
    content: str

@app.get("/api/circles/{circle_id}/posts/{post_id}/comments")
async def get_post_comments(circle_id: str, post_id: str):
    """Get comments for a post"""
    comments = await db.post_comments.find(
        {"post_id": post_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return {"comments": comments, "total": len(comments)}

@app.post("/api/circles/{circle_id}/posts/{post_id}/comments")
async def create_comment(circle_id: str, post_id: str, comment_data: CommentCreate, request: Request):
    """Add a comment to a post"""
    user = await require_user(request)
    
    # Verify post exists
    post = await db.circle_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment_id = f"comment_{uuid4().hex[:12]}"
    
    comment = {
        "id": comment_id,
        "post_id": post_id,
        "circle_id": circle_id,
        "user_id": user["user_id"],
        "user_name": user.get("name", "Anonymous"),
        "content": comment_data.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.post_comments.insert_one(comment)
    comment.pop("_id", None)
    
    # Update comment count on post
    await db.circle_posts.update_one(
        {"id": post_id},
        {"$inc": {"comment_count": 1}}
    )
    
    return comment

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

# ==================== CREATOR DASHBOARD ENDPOINTS ====================

class ContentCreate(BaseModel):
    type: str  # wisdom, practice
    title: str
    body: str
    author: Optional[str] = None
    category: Optional[str] = None
    duration: Optional[int] = None
    intent_tags: List[str] = []
    media_url: Optional[str] = None
    media_type: Optional[str] = "text"

@app.get("/api/creator/stats")
async def get_creator_stats(request: Request):
    """Get creator's content statistics"""
    user = await require_user(request)
    
    if user.get("role") not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    # Get content counts
    wisdom_count = await db.wisdom.count_documents({"creator_id": user["user_id"]})
    practice_count = await db.practices.count_documents({"creator_id": user["user_id"]})
    
    # Get total resonances
    pipeline = [
        {"$match": {"creator_id": user["user_id"]}},
        {"$group": {"_id": None, "total": {"$sum": "$resonance_count"}}}
    ]
    wisdom_resonances = await db.wisdom.aggregate(pipeline).to_list(1)
    practice_resonances = await db.practices.aggregate(pipeline).to_list(1)
    
    total_resonances = (
        (wisdom_resonances[0]["total"] if wisdom_resonances else 0) +
        (practice_resonances[0]["total"] if practice_resonances else 0)
    )
    
    return {
        "wisdom_count": wisdom_count,
        "practice_count": practice_count,
        "total_content": wisdom_count + practice_count,
        "total_resonances": total_resonances
    }

@app.get("/api/creator/content")
async def get_creator_content(request: Request, content_type: str = None):
    """Get creator's content"""
    user = await require_user(request)
    
    if user.get("role") not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    result = {"wisdom": [], "practices": []}
    
    if not content_type or content_type == "wisdom":
        result["wisdom"] = await db.wisdom.find(
            {"creator_id": user["user_id"]}, {"_id": 0}
        ).sort("created_at", -1).to_list(100)
    
    if not content_type or content_type == "practice":
        result["practices"] = await db.practices.find(
            {"creator_id": user["user_id"]}, {"_id": 0}
        ).sort("created_at", -1).to_list(100)
    
    return result

@app.post("/api/creator/content")
async def create_content(content: ContentCreate, request: Request):
    """Create new content"""
    user = await require_user(request)
    
    if user.get("role") not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    content_id = f"{content.type}_{uuid4().hex[:8]}"
    
    doc = {
        "id": content_id,
        "title": content.title,
        "body": content.body,
        "creator_id": user["user_id"],
        "creator_name": user.get("name", "Unknown"),
        "intent_tags": content.intent_tags,
        "media_type": content.media_type,
        "media_url": content.media_url,
        "resonance_count": 0,
        "status": "pending",  # pending, approved, rejected
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    if content.type == "wisdom":
        doc["author"] = content.author
        await db.wisdom.insert_one(doc)
    elif content.type == "practice":
        doc["category"] = content.category
        doc["duration"] = content.duration
        await db.practices.insert_one(doc)
    else:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    doc.pop("_id", None)
    return {"message": "Content created", "content": doc}

@app.put("/api/creator/content/{content_id}")
async def update_content(content_id: str, request: Request):
    """Update content"""
    user = await require_user(request)
    body = await request.json()
    
    if user.get("role") not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    # Find content
    wisdom = await db.wisdom.find_one({"id": content_id, "creator_id": user["user_id"]})
    practice = await db.practices.find_one({"id": content_id, "creator_id": user["user_id"]})
    
    if not wisdom and not practice:
        raise HTTPException(status_code=404, detail="Content not found")
    
    update_fields = {}
    allowed_fields = ["title", "body", "author", "category", "duration", "intent_tags", "media_url"]
    for field in allowed_fields:
        if field in body:
            update_fields[field] = body[field]
    
    if wisdom:
        await db.wisdom.update_one({"id": content_id}, {"$set": update_fields})
    else:
        await db.practices.update_one({"id": content_id}, {"$set": update_fields})
    
    return {"message": "Content updated"}

@app.delete("/api/creator/content/{content_id}")
async def delete_content(content_id: str, request: Request):
    """Delete content"""
    user = await require_user(request)
    
    if user.get("role") not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    result = await db.wisdom.delete_one({"id": content_id, "creator_id": user["user_id"]})
    if result.deleted_count == 0:
        result = await db.practices.delete_one({"id": content_id, "creator_id": user["user_id"]})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {"message": "Content deleted"}

# ==================== ADMIN PANEL ENDPOINTS ====================

@app.get("/api/admin/users")
async def get_all_users(request: Request, role: str = None, page: int = 1, limit: int = 50):
    """Get all users (admin only)"""
    user = await require_user(request)
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if role:
        query["role"] = role
    
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {"users": users, "total": total, "page": page, "limit": limit}

@app.put("/api/admin/users/{user_id}/role")
async def update_user_role(user_id: str, request: Request):
    """Update user role (admin only)"""
    admin = await require_user(request)
    body = await request.json()
    
    if admin.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    new_role = body.get("role")
    if new_role not in ["user", "creator", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": new_role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User role updated to {new_role}"}

@app.get("/api/admin/content/pending")
async def get_pending_content(request: Request):
    """Get pending content for review (admin only)"""
    user = await require_user(request)
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    pending_wisdom = await db.wisdom.find({"status": "pending"}, {"_id": 0}).to_list(100)
    pending_practices = await db.practices.find({"status": "pending"}, {"_id": 0}).to_list(100)
    
    return {"wisdom": pending_wisdom, "practices": pending_practices}

@app.put("/api/admin/content/{content_id}/approve")
async def approve_content(content_id: str, request: Request):
    """Approve content (admin only)"""
    user = await require_user(request)
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.wisdom.update_one({"id": content_id}, {"$set": {"status": "approved"}})
    if result.matched_count == 0:
        result = await db.practices.update_one({"id": content_id}, {"$set": {"status": "approved"}})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {"message": "Content approved"}

@app.put("/api/admin/content/{content_id}/reject")
async def reject_content(content_id: str, request: Request):
    """Reject content (admin only)"""
    user = await require_user(request)
    body = await request.json()
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    reason = body.get("reason", "Content does not meet guidelines")
    
    result = await db.wisdom.update_one(
        {"id": content_id},
        {"$set": {"status": "rejected", "rejection_reason": reason}}
    )
    if result.matched_count == 0:
        result = await db.practices.update_one(
            {"id": content_id},
            {"$set": {"status": "rejected", "rejection_reason": reason}}
        )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {"message": "Content rejected"}

@app.get("/api/admin/stats")
async def get_admin_stats(request: Request):
    """Get platform statistics (admin only)"""
    user = await require_user(request)
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_reflections = await db.reflections.count_documents({})
    total_wisdom = await db.wisdom.count_documents({})
    total_practices = await db.practices.count_documents({})
    total_circles = await db.circles.count_documents({})
    
    # Users by role
    role_pipeline = [
        {"$group": {"_id": "$role", "count": {"$sum": 1}}}
    ]
    users_by_role = await db.users.aggregate(role_pipeline).to_list(10)
    
    # Recent activity (last 7 days)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    new_users = await db.users.count_documents({"created_at": {"$gte": week_ago}})
    new_reflections = await db.reflections.count_documents({"created_at": {"$gte": week_ago}})
    
    return {
        "total_users": total_users,
        "total_reflections": total_reflections,
        "total_wisdom": total_wisdom,
        "total_practices": total_practices,
        "total_circles": total_circles,
        "users_by_role": {r["_id"]: r["count"] for r in users_by_role},
        "weekly_stats": {
            "new_users": new_users,
            "new_reflections": new_reflections
        }
    }

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
    
    # Circles (sample community circles)
    circles = [
        {"id": "circle_healing01", "name": "Healing Hearts", "description": "A safe space for those on their healing journey. Share experiences, find support, and grow together.", "intention": "healing", "creator_id": "system", "creator_name": "AriOme", "member_count": 42, "post_count": 128, "is_private": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "circle_mindful01", "name": "Mindful Mornings", "description": "Start your day with intention. Daily mindfulness practices and morning reflections.", "intention": "mindfulness", "creator_id": "system", "creator_name": "AriOme", "member_count": 67, "post_count": 256, "is_private": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "circle_growth01", "name": "Growth Mindset", "description": "Embrace change and personal evolution. Share your growth journey and inspire others.", "intention": "growth", "creator_id": "system", "creator_name": "AriOme", "member_count": 89, "post_count": 312, "is_private": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "circle_gratitude01", "name": "Gratitude Circle", "description": "Daily gratitude practices and appreciation sharing. What are you grateful for today?", "intention": "gratitude", "creator_id": "system", "creator_name": "AriOme", "member_count": 54, "post_count": 445, "is_private": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "circle_joy01", "name": "Joy Seekers", "description": "Celebrate life's moments, big and small. A community dedicated to finding and sharing joy.", "intention": "joy", "creator_id": "system", "creator_name": "AriOme", "member_count": 38, "post_count": 167, "is_private": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "circle_resilience01", "name": "Resilience Warriors", "description": "Building strength together. Share stories of overcoming challenges and supporting each other.", "intention": "resilience", "creator_id": "system", "creator_name": "AriOme", "member_count": 31, "post_count": 94, "is_private": False, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    
    # Clear and insert
    await db.moods.delete_many({})
    await db.intentions.delete_many({})
    await db.prompts.delete_many({})
    await db.practices.delete_many({})
    await db.wisdom.delete_many({})
    await db.circles.delete_many({})
    
    await db.moods.insert_many(moods)
    await db.intentions.insert_many(intentions)
    await db.prompts.insert_many(prompts)
    await db.practices.insert_many(practices)
    await db.wisdom.insert_many(wisdom)
    await db.circles.insert_many(circles)
    
    return {
        "message": "Database seeded successfully",
        "counts": {
            "moods": len(moods),
            "intentions": len(intentions),
            "prompts": len(prompts),
            "practices": len(practices),
            "wisdom": len(wisdom),
            "circles": len(circles)
        }
    }

# ==================== CIRCLES ENDPOINTS ====================

class CircleCreate(BaseModel):
    name: str
    description: str
    intention: str
    is_private: bool = False

class CircleResponse(BaseModel):
    id: str
    name: str
    description: str
    intention: str
    creator_id: str
    creator_name: str
    member_count: int
    post_count: int
    is_private: bool
    created_at: str
    is_member: bool = False

@app.get("/api/circles")
async def get_circles(request: Request, intention: str = None):
    """Get all circles, optionally filtered by intention"""
    user = await get_current_user(request)
    
    query = {}
    if intention:
        query["intention"] = intention
    
    circles = await db.circles.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Add is_member flag if user is logged in
    if user:
        user_circles = await db.circle_members.find(
            {"user_id": user["user_id"]}, {"_id": 0, "circle_id": 1}
        ).to_list(100)
        user_circle_ids = {m["circle_id"] for m in user_circles}
        
        for circle in circles:
            circle["is_member"] = circle["id"] in user_circle_ids
    
    return circles

@app.get("/api/circles/public")
async def get_public_circles(intention: str = None):
    """Get public circles for unauthenticated users"""
    query = {"is_private": False}
    if intention:
        query["intention"] = intention
    
    circles = await db.circles.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return circles

@app.post("/api/circles")
async def create_circle(circle_data: CircleCreate, request: Request):
    """Create a new circle"""
    user = await require_user(request)
    
    # All authenticated users can create circles
    circle_id = f"circle_{uuid4().hex[:12]}"
    
    circle = {
        "id": circle_id,
        "name": circle_data.name,
        "description": circle_data.description,
        "intention": circle_data.intention,
        "creator_id": user["user_id"],
        "creator_name": user.get("name", "Anonymous"),
        "member_count": 1,  # Creator is first member
        "post_count": 0,
        "is_private": circle_data.is_private,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.circles.insert_one(circle)
    circle.pop("_id", None)
    
    # Add creator as member
    await db.circle_members.insert_one({
        "circle_id": circle_id,
        "user_id": user["user_id"],
        "role": "creator",
        "joined_at": datetime.now(timezone.utc).isoformat()
    })
    
    return circle

@app.post("/api/circles/{circle_id}/join")
async def join_circle(circle_id: str, request: Request):
    """Join a circle"""
    user = await require_user(request)
    
    # All authenticated users can join circles
    # Check if circle exists
    circle = await db.circles.find_one({"id": circle_id}, {"_id": 0})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    # Check if already member
    existing = await db.circle_members.find_one({
        "circle_id": circle_id,
        "user_id": user["user_id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already a member of this circle")
    
    # Add member
    await db.circle_members.insert_one({
        "circle_id": circle_id,
        "user_id": user["user_id"],
        "role": "member",
        "joined_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Update member count
    await db.circles.update_one(
        {"id": circle_id},
        {"$inc": {"member_count": 1}}
    )
    
    return {"message": "Joined circle successfully"}

@app.post("/api/circles/{circle_id}/leave")
async def leave_circle(circle_id: str, request: Request):
    """Leave a circle"""
    user = await require_user(request)
    
    # Check if member
    member = await db.circle_members.find_one({
        "circle_id": circle_id,
        "user_id": user["user_id"]
    })
    if not member:
        raise HTTPException(status_code=400, detail="Not a member of this circle")
    
    # Can't leave if creator
    if member.get("role") == "creator":
        raise HTTPException(status_code=400, detail="Circle creator cannot leave. Delete the circle instead.")
    
    # Remove member
    await db.circle_members.delete_one({
        "circle_id": circle_id,
        "user_id": user["user_id"]
    })
    
    # Update member count
    await db.circles.update_one(
        {"id": circle_id},
        {"$inc": {"member_count": -1}}
    )
    
    return {"message": "Left circle successfully"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}
