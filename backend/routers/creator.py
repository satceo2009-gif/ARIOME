from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from database import stories_collection, creator_profiles_collection, transactions_collection
from models import StoryCreate, StoryStatus
from routers.auth import get_current_user, require_role
from bson import ObjectId
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/creator", tags=["Creator"])

@router.post("/stories")
async def create_story(story: StoryCreate, current_user: dict = Depends(get_current_user)):
    """Create a new story (requires approval)"""
    if current_user["role"] not in ["creator", "admin"]:
        raise HTTPException(status_code=403, detail="Creator or admin access required")
    
    # Get creator profile
    creator_profile = await creator_profiles_collection.find_one({"user_id": str(current_user["_id"])})
    
    story_doc = {
        "title": story.title,
        "description": story.description,
        "intentions": story.intentions,
        "format": story.format,
        "media_url": story.media_url,
        "thumbnail_url": story.thumbnail_url,
        "duration": story.duration,
        "tags": story.tags,
        "reflection_prompts": story.reflection_prompts.dict(),
        "is_premium": story.is_premium,
        "price": story.price,
        "creator_id": str(current_user["_id"]),
        "creator_name": current_user["name"],
        "creator_avatar": current_user["avatar"],
        "creator_bio": creator_profile.get("bio", "") if creator_profile else "",
        "creator_verified": creator_profile.get("verification_status", "pending") == "verified" if creator_profile else False,
        "status": StoryStatus.PENDING_REVIEW,
        "resonance_count": 0,
        "play_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await stories_collection.insert_one(story_doc)
    
    # Update creator story count
    if creator_profile:
        await creator_profiles_collection.update_one(
            {"_id": creator_profile["_id"]},
            {"$inc": {"total_stories": 1}}
        )
    
    return {
        "id": str(result.inserted_id),
        "message": "Story created and submitted for review",
        "status": StoryStatus.PENDING_REVIEW
    }

@router.get("/my-stories")
async def get_my_stories(current_user: dict = Depends(require_role(["creator", "admin"]))):
    """Get all stories by current creator"""
    cursor = stories_collection.find({"creator_id": str(current_user["_id"])}).sort("created_at", -1)
    stories = await cursor.to_list(length=100)
    
    result = []
    for story in stories:
        result.append({
            "id": str(story["_id"]),
            "title": story["title"],
            "format": story["format"],
            "status": story["status"],
            "thumbnail_url": story["thumbnail_url"],
            "play_count": story.get("play_count", 0),
            "resonance_count": story.get("resonance_count", 0),
            "is_premium": story.get("is_premium", False),
            "created_at": story["created_at"],
            "rejection_reason": story.get("rejection_reason")
        })
    
    return result

@router.put("/stories/{story_id}")
async def update_story(story_id: str, story_update: dict, current_user: dict = Depends(require_role(["creator", "admin"]))):
    """Update a story"""
    try:
        # Verify ownership
        story = await stories_collection.find_one({"_id": ObjectId(story_id)})
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        if str(story["creator_id"]) != str(current_user["_id"]) and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to edit this story")
        
        # Only allow certain fields to be updated
        allowed_fields = ["title", "description", "thumbnail_url", "tags", "is_premium", "price"]
        update_fields = {k: v for k, v in story_update.items() if k in allowed_fields}
        update_fields["updated_at"] = datetime.utcnow()
        update_fields["status"] = StoryStatus.PENDING_REVIEW  # Reset to pending after edit
        
        await stories_collection.update_one(
            {"_id": ObjectId(story_id)},
            {"$set": update_fields}
        )
        
        return {"message": "Story updated and resubmitted for review"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/stories/{story_id}")
async def delete_story(story_id: str, current_user: dict = Depends(require_role(["creator", "admin"]))):
    """Delete a story"""
    try:
        story = await stories_collection.find_one({"_id": ObjectId(story_id)})
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        if str(story["creator_id"]) != str(current_user["_id"]) and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to delete this story")
        
        await stories_collection.delete_one({"_id": ObjectId(story_id)})
        
        return {"message": "Story deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics")
async def get_creator_analytics(current_user: dict = Depends(require_role(["creator", "admin"]))):
    """Get creator analytics"""
    # Get creator profile
    creator_profile = await creator_profiles_collection.find_one({"user_id": str(current_user["_id"])})
    
    # Get story stats
    cursor = stories_collection.find({"creator_id": str(current_user["_id"])})
    stories = await cursor.to_list(length=1000)
    
    total_plays = sum(story.get("play_count", 0) for story in stories)
    total_resonance = sum(story.get("resonance_count", 0) for story in stories)
    
    # Get earnings
    transactions_cursor = transactions_collection.find({"creator_id": str(current_user["_id"]), "status": "completed"})
    transactions = await transactions_cursor.to_list(length=1000)
    total_earnings = sum(t.get("amount", 0) for t in transactions)
    
    return {
        "total_stories": len(stories),
        "published_stories": len([s for s in stories if s["status"] == StoryStatus.PUBLISHED]),
        "pending_stories": len([s for s in stories if s["status"] == StoryStatus.PENDING_REVIEW]),
        "rejected_stories": len([s for s in stories if s["status"] == StoryStatus.REJECTED]),
        "total_plays": total_plays,
        "total_resonance": total_resonance,
        "total_earnings": total_earnings,
        "total_followers": creator_profile.get("total_followers", 0) if creator_profile else 0,
        "verification_status": creator_profile.get("verification_status", "pending") if creator_profile else "pending"
    }

@router.put("/profile")
async def update_creator_profile(profile_update: dict, current_user: dict = Depends(require_role(["creator", "admin"]))):
    """Update creator profile"""
    creator_profile = await creator_profiles_collection.find_one({"user_id": str(current_user["_id"])})
    
    if not creator_profile:
        # Create profile if doesn't exist
        profile_doc = {
            "user_id": str(current_user["_id"]),
            "bio": profile_update.get("bio", ""),
            "website": profile_update.get("website"),
            "social_links": profile_update.get("social_links", {}),
            "specialties": profile_update.get("specialties", []),
            "verification_status": "pending",
            "total_earnings": 0.0,
            "total_stories": 0,
            "total_followers": 0,
            "created_at": datetime.utcnow()
        }
        await creator_profiles_collection.insert_one(profile_doc)
    else:
        # Update existing profile
        allowed_fields = ["bio", "website", "social_links", "specialties"]
        update_fields = {k: v for k, v in profile_update.items() if k in allowed_fields}
        
        await creator_profiles_collection.update_one(
            {"_id": creator_profile["_id"]},
            {"$set": update_fields}
        )
    
    return {"message": "Creator profile updated successfully"}
