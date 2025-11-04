from fastapi import FastAPI, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import uvicorn
import logging

logger = logging.getLogger("uvicorn.error")

from database import (
    init_db, 
    users_collection, 
    stories_collection,
    reflections_collection,
    transactions_collection,
    creator_profiles_collection,
    circles_collection,
    journal_entries_collection
)
from models import (
    UserCreate, UserLogin, UserRole,
    StoryCreate, StoryStatus,
    ReflectionCreate,
    TransactionCreate,
    CreatorProfileCreate,
    VerificationStatus
)
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token
)

# Import routers
from routers import auth, admin, creator, subscription, circles, journal, stories

app = FastAPI(title="ARIOME API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(stories.router)
app.include_router(admin.router)
app.include_router(creator.router)
app.include_router(subscription.router)
app.include_router(circles.router)
app.include_router(journal.router)

# Helper functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc:
        doc["id"] = str(doc.pop("_id"))
        if "password_hash" in doc:
            del doc["password_hash"]
        return doc
    return None

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await users_collection.find_one({"_id": ObjectId(payload["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return serialize_doc(user)

# Startup event
@app.on_event("startup")
async def startup_event():
    await init_db()
    print("✅ ARIOME API Started")

# ============ AUTH ============

@app.post("/api/auth/signup")
async def signup(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict(exclude={"password"})
    user_dict["password_hash"] = get_password_hash(user.password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["is_verified"] = False
    
    result = await users_collection.insert_one(user_dict)
    token = create_access_token({"user_id": str(result.inserted_id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_doc(await users_collection.find_one({"_id": result.inserted_id}))
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"user_id": str(user["_id"])})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_doc(user)
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# ============ STORIES ============

@app.get("/api/stories")
async def get_stories(
    intention: Optional[str] = None,
    format: Optional[str] = None,
    limit: int = 50
):
    query = {"status": StoryStatus.PUBLISHED}
    if intention:
        query["intentions"] = intention
    if format:
        query["format"] = format
    
    cursor = stories_collection.find(query).sort("created_at", -1).limit(limit)
    stories = await cursor.to_list(length=limit)
    
    # Format stories with nested creator object for frontend
    formatted_stories = []
    for story in stories:
        formatted_story = serialize_doc(story)
        print(f"DEBUG: After serialize - category: {formatted_story.get('category')}, content_type: {formatted_story.get('content_type')}")
        
        # Transform snake_case to camelCase for frontend
        formatted_story["mediaUrl"] = formatted_story.pop("media_url", "")
        formatted_story["thumbnailUrl"] = formatted_story.pop("thumbnail_url", "")
        formatted_story["isPremium"] = formatted_story.pop("is_premium", False)
        formatted_story["reflectionPrompts"] = formatted_story.pop("reflection_prompts", {})
        formatted_story["resonanceCount"] = formatted_story.pop("resonance_count", 0)
        formatted_story["createdAt"] = formatted_story.pop("created_at", "")
        formatted_story["playCount"] = formatted_story.pop("play_count", 0)
        formatted_story["contentType"] = formatted_story.pop("content_type", None)
        # category stays as-is for frontend
        
        # Transform flat creator fields to nested object
        formatted_story["creator"] = {
            "id": formatted_story.pop("creator_id", ""),
            "name": formatted_story.pop("creator_name", "Unknown"),
            "avatar": formatted_story.pop("creator_avatar", "https://i.pravatar.cc/150?img=1"),
            "verified": formatted_story.pop("creator_verified", False),
            "bio": formatted_story.pop("creator_bio", "")
        }
        
        formatted_stories.append(formatted_story)
    
    return formatted_stories

@app.get("/api/stories/{story_id}")
async def get_story(story_id: str):
    try:
        story = await stories_collection.find_one({"_id": ObjectId(story_id)})
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        await stories_collection.update_one(
            {"_id": ObjectId(story_id)},
            {"$inc": {"play_count": 1}}
        )
        
        formatted_story = serialize_doc(story)
        
        # Transform snake_case to camelCase for frontend
        formatted_story["mediaUrl"] = formatted_story.pop("media_url", "")
        formatted_story["thumbnailUrl"] = formatted_story.pop("thumbnail_url", "")
        formatted_story["isPremium"] = formatted_story.pop("is_premium", False)
        formatted_story["reflectionPrompts"] = formatted_story.pop("reflection_prompts", {})
        formatted_story["resonanceCount"] = formatted_story.pop("resonance_count", 0)
        formatted_story["createdAt"] = formatted_story.pop("created_at", "")
        formatted_story["playCount"] = formatted_story.pop("play_count", 0)
        formatted_story["contentType"] = formatted_story.pop("content_type", None)
        # category stays as-is for frontend
        
        # Transform flat creator fields to nested object
        formatted_story["creator"] = {
            "id": formatted_story.pop("creator_id", ""),
            "name": formatted_story.pop("creator_name", "Unknown"),
            "avatar": formatted_story.pop("creator_avatar", "https://i.pravatar.cc/150?img=1"),
            "verified": formatted_story.pop("creator_verified", False),
            "bio": formatted_story.pop("creator_bio", "")
        }
            
        return formatted_story
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

@app.post("/api/stories/{story_id}/resonance")
async def add_resonance(story_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = await stories_collection.update_one(
            {"_id": ObjectId(story_id)},
            {"$inc": {"resonance_count": 1}}
        )
        return {"message": "Success"}
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

# ============ REFLECTIONS ============

@app.post("/api/reflections")
async def create_reflection(
    reflection: ReflectionCreate,
    current_user: dict = Depends(get_current_user)
):
    reflection_dict = reflection.dict()
    reflection_dict["user_id"] = current_user["id"]
    reflection_dict["created_at"] = datetime.utcnow()
    
    result = await reflections_collection.insert_one(reflection_dict)
    return serialize_doc(await reflections_collection.find_one({"_id": result.inserted_id}))

@app.get("/api/reflections/my-reflections")
async def get_my_reflections(current_user: dict = Depends(get_current_user)):
    cursor = reflections_collection.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(50)
    reflections = await cursor.to_list(length=50)
    return [serialize_doc(r) for r in reflections]

# ============ CREATOR ============

@app.post("/api/users/apply-creator")
async def apply_creator(profile: CreatorProfileCreate, current_user: dict = Depends(get_current_user)):
    profile_dict = profile.dict()
    profile_dict["user_id"] = current_user["id"]
    profile_dict["verification_status"] = VerificationStatus.PENDING
    profile_dict["created_at"] = datetime.utcnow()
    
    result = await creator_profiles_collection.insert_one(profile_dict)
    return {"message": "Application submitted"}

@app.post("/api/stories")
async def create_story(story: StoryCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in [UserRole.CREATOR, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    story_dict = story.dict()
    story_dict["creator_id"] = current_user["id"]
    story_dict["creator_name"] = current_user["name"]
    story_dict["creator_avatar"] = current_user.get("avatar", "")
    story_dict["creator_verified"] = True
    story_dict["status"] = StoryStatus.PENDING_REVIEW
    story_dict["resonance_count"] = 0
    story_dict["play_count"] = 0
    story_dict["created_at"] = datetime.utcnow()
    story_dict["updated_at"] = datetime.utcnow()
    
    result = await stories_collection.insert_one(story_dict)
    return serialize_doc(await stories_collection.find_one({"_id": result.inserted_id}))

# ============ ADMIN ============

@app.get("/api/admin/stories/pending")
async def get_pending(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin required")
    
    cursor = stories_collection.find({"status": StoryStatus.PENDING_REVIEW})
    stories = await cursor.to_list(length=100)
    return [serialize_doc(story) for story in stories]

@app.put("/api/admin/stories/{story_id}/approve")
async def approve_story(story_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin required")
    
    await stories_collection.update_one(
        {"_id": ObjectId(story_id)},
        {"$set": {"status": StoryStatus.PUBLISHED}}
    )
    return {"message": "Approved"}

# Health check
@app.get("/api/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
