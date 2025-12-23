"""
Library API - Saved Stories and Play History
All data stored in MongoDB - fully database-driven
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
from bson import ObjectId
from routers.auth import get_current_user
from database import db

router = APIRouter(prefix="/api/library", tags=["Library"])


class SaveStoryRequest(BaseModel):
    story_id: str


class PlayHistoryRequest(BaseModel):
    story_id: str
    progress: float = 0  # Percentage 0-100


@router.post("/save")
async def save_story(request: SaveStoryRequest, current_user: dict = Depends(get_current_user)):
    """Save a story to user's library"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    
    # Check if already saved
    existing = await db.saved_stories.find_one({
        "user_id": user_id,
        "story_id": request.story_id
    })
    
    if existing:
        return {"status": "already_saved", "message": "Story already in your library"}
    
    # Save the story
    save_doc = {
        "user_id": user_id,
        "story_id": request.story_id,
        "saved_at": datetime.now(timezone.utc)
    }
    
    await db.saved_stories.insert_one(save_doc)
    
    return {"status": "success", "message": "Story saved to library"}


@router.delete("/save/{story_id}")
async def unsave_story(story_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a story from user's library"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    
    result = await db.saved_stories.delete_one({
        "user_id": user_id,
        "story_id": story_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found in library")
    
    return {"status": "success", "message": "Story removed from library"}


@router.get("/saved")
async def get_saved_stories(current_user: dict = Depends(get_current_user)):
    """Get all saved stories for current user"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    
    # Get saved story IDs
    saved = await db.saved_stories.find(
        {"user_id": user_id}
    ).sort("saved_at", -1).to_list(100)
    
    if not saved:
        return []
    
    # Get story details
    story_ids = [s["story_id"] for s in saved]
    stories = []
    
    for saved_item in saved:
        try:
            story = await db.stories.find_one({"_id": ObjectId(saved_item["story_id"])})
            if story:
                stories.append({
                    "id": str(story["_id"]),
                    "title": story.get("title"),
                    "description": story.get("description"),
                    "thumbnailUrl": story.get("thumbnail_url"),
                    "mediaUrl": story.get("media_url"),
                    "format": story.get("format"),
                    "duration": story.get("duration"),
                    "intentions": story.get("intentions", []),
                    "isPremium": story.get("is_premium", False),
                    "resonanceCount": story.get("resonance_count", 0),
                    "creator": {
                        "id": story.get("creator_id"),
                        "name": story.get("creator_name", "Unknown"),
                        "avatar": story.get("creator_avatar", "https://i.pravatar.cc/150?img=1"),
                        "verified": story.get("creator_verified", False)
                    },
                    "savedAt": saved_item["saved_at"].isoformat() if saved_item.get("saved_at") else None
                })
        except:
            continue
    
    return stories


@router.post("/history")
async def add_to_play_history(request: PlayHistoryRequest, current_user: dict = Depends(get_current_user)):
    """Add or update play history for a story"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    
    # Check if already in history
    existing = await db.play_history.find_one({
        "user_id": user_id,
        "story_id": request.story_id
    })
    
    if existing:
        # Update existing entry
        await db.play_history.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "progress": request.progress,
                    "played_at": datetime.now(timezone.utc)
                },
                "$inc": {"play_count": 1}
            }
        )
    else:
        # Create new entry
        history_doc = {
            "user_id": user_id,
            "story_id": request.story_id,
            "progress": request.progress,
            "play_count": 1,
            "played_at": datetime.now(timezone.utc)
        }
        await db.play_history.insert_one(history_doc)
    
    return {"status": "success", "message": "Play history updated"}


@router.get("/history")
async def get_play_history(limit: int = 50, current_user: dict = Depends(get_current_user)):
    """Get recently played stories for current user"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    
    # Get play history
    history = await db.play_history.find(
        {"user_id": user_id}
    ).sort("played_at", -1).limit(limit).to_list(limit)
    
    if not history:
        return []
    
    # Get story details
    stories = []
    
    for history_item in history:
        try:
            story = await db.stories.find_one({"_id": ObjectId(history_item["story_id"])})
            if story:
                stories.append({
                    "id": str(story["_id"]),
                    "title": story.get("title"),
                    "description": story.get("description"),
                    "thumbnailUrl": story.get("thumbnail_url"),
                    "mediaUrl": story.get("media_url"),
                    "format": story.get("format"),
                    "duration": story.get("duration"),
                    "intentions": story.get("intentions", []),
                    "isPremium": story.get("is_premium", False),
                    "resonanceCount": story.get("resonance_count", 0),
                    "creator": {
                        "id": story.get("creator_id"),
                        "name": story.get("creator_name", "Unknown"),
                        "avatar": story.get("creator_avatar", "https://i.pravatar.cc/150?img=1"),
                        "verified": story.get("creator_verified", False)
                    },
                    "playedAt": history_item["played_at"].isoformat() if history_item.get("played_at") else None,
                    "progress": history_item.get("progress", 0),
                    "playCount": history_item.get("play_count", 1)
                })
        except:
            continue
    
    return stories


@router.delete("/history/{story_id}")
async def remove_from_history(story_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a story from play history"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    
    result = await db.play_history.delete_one({
        "user_id": user_id,
        "story_id": story_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found in history")
    
    return {"status": "success", "message": "Removed from history"}


@router.delete("/history")
async def clear_play_history(current_user: dict = Depends(get_current_user)):
    """Clear all play history for current user"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    
    await db.play_history.delete_many({"user_id": user_id})
    
    return {"status": "success", "message": "Play history cleared"}


@router.get("/check-saved/{story_id}")
async def check_if_saved(story_id: str, current_user: dict = Depends(get_current_user)):
    """Check if a story is saved in user's library"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    
    existing = await db.saved_stories.find_one({
        "user_id": user_id,
        "story_id": story_id
    })
    
    return {"is_saved": existing is not None}
