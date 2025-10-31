from fastapi import APIRouter, HTTPException, Depends
from database import reflections_collection, journal_entries_collection
from routers.auth import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/journal", tags=["Journal"])

@router.post("/entries")
async def create_journal_entry(entry_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a personal journal entry"""
    entry_doc = {
        "user_id": str(current_user["_id"]),
        "title": entry_data.get("title", "Untitled Entry"),
        "content": entry_data["content"],
        "mood": entry_data.get("mood"),
        "tags": entry_data.get("tags", []),
        "is_private": entry_data.get("is_private", True),
        "created_at": datetime.utcnow()
    }
    
    result = await journal_entries_collection.insert_one(entry_doc)
    return {"id": str(result.inserted_id), "message": "Journal entry created"}

@router.get("/entries")
async def get_journal_entries(current_user: dict = Depends(get_current_user)):
    """Get all journal entries for current user"""
    cursor = journal_entries_collection.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    entries = await cursor.to_list(length=100)
    
    result = []
    for entry in entries:
        result.append({
            "id": str(entry["_id"]),
            "title": entry.get("title", "Untitled"),
            "content": entry["content"],
            "mood": entry.get("mood"),
            "tags": entry.get("tags", []),
            "created_at": entry["created_at"]
        })
    
    return result

@router.get("/reflections")
async def get_my_reflections(current_user: dict = Depends(get_current_user)):
    """Get all story reflections for current user"""
    cursor = reflections_collection.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    reflections = await cursor.to_list(length=100)
    
    result = []
    for reflection in reflections:
        result.append({
            "id": str(reflection["_id"]),
            "story_id": reflection["story_id"],
            "mood": reflection["mood"],
            "before_reflection": reflection.get("before_reflection"),
            "after_reflection": reflection.get("after_reflection"),
            "created_at": reflection["created_at"]
        })
    
    return result

@router.get("/stats")
async def get_journal_stats(current_user: dict = Depends(get_current_user)):
    """Get journaling statistics"""
    entries_count = await journal_entries_collection.count_documents({"user_id": str(current_user["_id"])})
    reflections_count = await reflections_collection.count_documents({"user_id": str(current_user["_id"])})
    
    # Get mood distribution
    cursor = journal_entries_collection.find({"user_id": str(current_user["_id"])})
    entries = await cursor.to_list(length=1000)
    
    mood_counts = {}
    for entry in entries:
        mood = entry.get("mood")
        if mood:
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    return {
        "total_entries": entries_count,
        "total_reflections": reflections_count,
        "mood_distribution": mood_counts
    }
