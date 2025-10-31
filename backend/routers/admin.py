from fastapi import APIRouter, HTTPException, Depends, status
from database import stories_collection, users_collection, creator_profiles_collection
from models import StoryStatus, VerificationStatus
from routers.auth import get_current_user, require_role
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/pending-stories")
async def get_pending_stories(current_user: dict = Depends(get_current_user)):
    """Get all stories pending review"""
    if current_user["role"] not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    cursor = stories_collection.find({"status": StoryStatus.PENDING_REVIEW})
    stories = await cursor.to_list(length=100)
    
    result = []
    for story in stories:
        result.append({
            "id": str(story["_id"]),
            "title": story["title"],
            "creator_name": story["creator_name"],
            "format": story["format"],
            "thumbnail_url": story["thumbnail_url"],
            "created_at": story["created_at"],
            "status": story["status"]
        })
    
    return result

@router.post("/stories/{story_id}/approve")
async def approve_story(story_id: str, current_user: dict = Depends(get_current_user)):
    """Approve a story for publishing"""
    if current_user["role"] not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        result = await stories_collection.update_one(
            {"_id": ObjectId(story_id)},
            {"$set": {"status": StoryStatus.PUBLISHED, "updated_at": datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Story not found")
        
        return {"message": "Story approved and published"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/stories/{story_id}/reject")
async def reject_story(story_id: str, reason: str, current_user: dict = Depends(get_current_user)):
    """Reject a story"""
    if current_user["role"] not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        result = await stories_collection.update_one(
            {"_id": ObjectId(story_id)},
            {"$set": {
                "status": StoryStatus.REJECTED,
                "rejection_reason": reason,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Story not found")
        
        return {"message": "Story rejected"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    """Get platform statistics"""
    if current_user["role"] not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    total_users = await users_collection.count_documents({})
    total_creators = await users_collection.count_documents({"role": "creator"})
    total_subscribers = await users_collection.count_documents({"role": "subscriber"})
    total_stories = await stories_collection.count_documents({"status": StoryStatus.PUBLISHED})
    pending_stories = await stories_collection.count_documents({"status": StoryStatus.PENDING_REVIEW})
    
    return {
        "total_users": total_users,
        "total_creators": total_creators,
        "total_subscribers": total_subscribers,
        "total_stories": total_stories,
        "pending_reviews": pending_stories
    }

@router.get("/users")
async def get_all_users(skip: int = 0, limit: int = 50, current_user: dict = Depends(get_current_user)):
    """Get all users for admin management"""
    if current_user["role"] not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    cursor = users_collection.find({}).skip(skip).limit(limit).sort("created_at", -1)
    users = await cursor.to_list(length=limit)
    
    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "subscription_status": user.get("subscription_status", "free"),
            "created_at": user["created_at"]
        })
    
    return result

@router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, new_role: str, current_user: dict = Depends(get_current_user)):
    """Update a user's role"""
    if current_user["role"] not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": new_role, "updated_at": datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": f"User role updated to {new_role}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/creator-requests")
async def get_creator_verification_requests(current_user: dict = Depends(require_role(["admin"]))):
    """Get pending creator verification requests"""
    cursor = creator_profiles_collection.find({"verification_status": VerificationStatus.PENDING})
    profiles = await cursor.to_list(length=100)
    
    result = []
    for profile in profiles:
        user = await users_collection.find_one({"_id": ObjectId(profile["user_id"])})
        if user:
            result.append({
                "id": str(profile["_id"]),
                "user_id": profile["user_id"],
                "user_name": user["name"],
                "user_email": user["email"],
                "bio": profile.get("bio", ""),
                "specialties": profile.get("specialties", []),
                "total_stories": profile.get("total_stories", 0),
                "created_at": profile["created_at"]
            })
    
    return result

@router.post("/creators/{profile_id}/verify")
async def verify_creator(profile_id: str, current_user: dict = Depends(require_role(["admin"]))):
    """Verify a creator profile"""
    try:
        result = await creator_profiles_collection.update_one(
            {"_id": ObjectId(profile_id)},
            {"$set": {"verification_status": VerificationStatus.VERIFIED}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Creator profile not found")
        
        return {"message": "Creator verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
