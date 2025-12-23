from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId
from routers.auth import get_current_user
from database import db

router = APIRouter(prefix="/api/journal", tags=["journal"])

class JournalEntry(BaseModel):
    title: str
    content: str
    mood: Optional[str] = None
    tags: Optional[List[str]] = []

class StoryReflection(BaseModel):
    story_id: str
    mood: Optional[str] = None
    before_reflection: Optional[str] = None
    after_reflection: Optional[str] = None

@router.post("/entries")
async def create_entry(entry: JournalEntry, current_user: dict = Depends(get_current_user)):
    """Create a new journal entry"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    entry_doc = {
        "title": entry.title,
        "content": entry.content,
        "mood": entry.mood,
        "tags": entry.tags or [],
        "user_id": user_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.journal_entries.insert_one(entry_doc)
    
    return {
        "id": str(result.inserted_id),
        "title": entry_doc["title"],
        "content": entry_doc["content"],
        "mood": entry_doc["mood"],
        "tags": entry_doc["tags"],
        "created_at": entry_doc["created_at"].isoformat()
    }

@router.get("/entries")
async def get_entries(current_user: dict = Depends(get_current_user)):
    """Get all journal entries for current user"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    entries = await db.journal_entries.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(100)
    
    return [
        {
            "id": str(e["_id"]),
            "title": e.get("title"),
            "content": e.get("content"),
            "mood": e.get("mood"),
            "tags": e.get("tags", []),
            "created_at": e.get("created_at").isoformat() if e.get("created_at") else None
        }
        for e in entries
    ]

@router.post("/reflections")
async def create_reflection(reflection: StoryReflection, current_user: dict = Depends(get_current_user)):
    """Create a story reflection"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    reflection_doc = {
        "story_id": reflection.story_id,
        "mood": reflection.mood,
        "before_reflection": reflection.before_reflection,
        "after_reflection": reflection.after_reflection,
        "user_id": user_id,
        "created_at": datetime.utcnow()
    }
    result = await db.story_reflections.insert_one(reflection_doc)
    
    return {
        "id": str(result.inserted_id),
        "story_id": reflection_doc["story_id"],
        "mood": reflection_doc["mood"],
        "before_reflection": reflection_doc["before_reflection"],
        "after_reflection": reflection_doc["after_reflection"],
        "created_at": reflection_doc["created_at"].isoformat()
    }

@router.get("/reflections")
async def get_reflections(current_user: dict = Depends(get_current_user)):
    """Get all story reflections for current user"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    reflections = await db.story_reflections.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(100)
    
    return [
        {
            "id": str(r["_id"]),
            "story_id": r.get("story_id"),
            "mood": r.get("mood"),
            "before_reflection": r.get("before_reflection"),
            "after_reflection": r.get("after_reflection"),
            "created_at": r.get("created_at").isoformat() if r.get("created_at") else None
        }
        for r in reflections
    ]

@router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    """Get journal stats for current user"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    total_entries = await db.journal_entries.count_documents(
        {"user_id": user_id}
    )
    total_reflections = await db.story_reflections.count_documents(
        {"user_id": user_id}
    )
    
    return {
        "total_entries": total_entries,
        "total_reflections": total_reflections,
        "current_streak": 0  # TODO: Calculate streak
    }
