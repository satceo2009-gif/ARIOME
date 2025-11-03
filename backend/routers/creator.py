from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId
from ..auth import get_current_user
from ..database import db

router = APIRouter(prefix="/creator", tags=["creator"])

class StoryUpload(BaseModel):
    title: str
    description: str
    intentions: List[str]
    format: str  # "video" or "audio"
    media_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None  # in seconds
    tags: Optional[List[str]] = []
    is_premium: bool = False
    price: Optional[float] = 0.0

@router.post("/upload")
async def upload_story(story: StoryUpload, current_user: dict = Depends(get_current_user)):
    """Upload a new story (creator only)"""
    if current_user.get("role") not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    story_doc = {
        **story.dict(),
        "creator_id": str(current_user["_id"]),
        "creator_name": current_user.get("name", "Unknown"),
        "creator_avatar": current_user.get("avatar", ""),
        "creator_bio": current_user.get("bio", ""),
        "creator_verified": current_user.get("verification_status") == "verified",
        "status": "pending_review",
        "play_count": 0,
        "resonance_count": 0,
        "reflection_prompts": {
            "before": "How are you feeling right now?",
            "after": "What resonated with you from this story?"
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.stories.insert_one(story_doc)
    
    return {
        "id": str(result.inserted_id),
        "message": "Story uploaded and submitted for review",
        "status": "pending_review"
    }

@router.get("/my-stories")
async def get_my_stories(current_user: dict = Depends(get_current_user)):
    """Get all stories by current creator"""
    if current_user.get("role") not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    stories = await db.stories.find(
        {"creator_id": str(current_user["_id"])}
    ).sort("created_at", -1).to_list(100)
    
    return [
        {
            "id": str(s["_id"]),
            "title": s.get("title"),
            "format": s.get("format"),
            "status": s.get("status"),
            "thumbnail_url": s.get("thumbnail_url"),
            "play_count": s.get("play_count", 0),
            "resonance_count": s.get("resonance_count", 0),
            "is_premium": s.get("is_premium", False),
            "created_at": s.get("created_at").isoformat() if s.get("created_at") else None,
            "rejection_reason": s.get("rejection_reason")
        }
        for s in stories
    ]

@router.get("/analytics")
async def get_creator_analytics(current_user: dict = Depends(get_current_user)):
    """Get creator analytics dashboard data"""
    if current_user.get("role") not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    # Get all creator stories
    stories = await db.stories.find(
        {"creator_id": str(current_user["_id"])}
    ).to_list(1000)
    
    # Calculate stats
    published_stories = len([s for s in stories if s.get("status") == "published"])
    pending_stories = len([s for s in stories if s.get("status") == "pending_review"])
    rejected_stories = len([s for s in stories if s.get("status") == "rejected"])
    
    total_plays = sum(s.get("play_count", 0) for s in stories)
    total_resonance = sum(s.get("resonance_count", 0) for s in stories)
    
    # Get earnings (placeholder for now)
    total_earnings = 0.0  # TODO: Calculate from transactions
    
    return {
        "published_stories": published_stories,
        "pending_stories": pending_stories,
        "rejected_stories": rejected_stories,
        "total_plays": total_plays,
        "total_resonance": total_resonance,
        "total_earnings": total_earnings,
        "verification_status": current_user.get("verification_status", "pending")
    }

@router.delete("/stories/{story_id}")
async def delete_story(story_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a story"""
    if current_user.get("role") not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator access required")
    
    try:
        story_oid = ObjectId(story_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid story ID")
    
    # Verify ownership
    story = await db.stories.find_one({"_id": story_oid})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    if story.get("creator_id") != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.stories.delete_one({"_id": story_oid})
    
    return {"message": "Story deleted successfully"}
