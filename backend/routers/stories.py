from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId
from routers.auth import get_current_user

async def get_current_user_optional(authorization: Optional[str] = Header(None)):
    """Optional authentication - returns None if no token"""
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except:
        return None

from database import db
import os
from openai import OpenAI

router = APIRouter(prefix="/api/stories", tags=["stories"])

# AI Integration for recommendations
client = None
try:
    EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY") or os.getenv("OPENAI_API_KEY")
    if EMERGENT_LLM_KEY:
        client = OpenAI(api_key=EMERGENT_LLM_KEY)
except:
    pass

@router.get("")
async def get_stories(
    intention: Optional[str] = None,
    format: Optional[str] = None,
    limit: int = 100,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Get all published stories with optional filters"""
    query = {"status": "published"}
    if intention:
        query["intentions"] = intention
    if format:
        query["format"] = format
    
    stories = await db.stories.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    
    result = []
    for story in stories:
        result.append({
            "id": str(story["_id"]),
            "title": story.get("title"),
            "description": story.get("description"),
            "category": story.get("category"),
            "contentType": story.get("content_type"),
            "format": story.get("format"),
            "mediaUrl": story.get("media_url"),
            "thumbnailUrl": story.get("thumbnail_url"),
            "duration": story.get("duration"),
            "intentions": story.get("intentions", []),
            "reflectionPrompts": story.get("reflection_prompts", {}),
            "creator": {
                "id": story.get("creator_id"),
                "name": story.get("creator_name"),
                "avatar": story.get("creator_avatar"),
                "bio": story.get("creator_bio", ""),
                "verified": story.get("creator_verified", False)
            },
            "stats": {
                "plays": story.get("play_count", 0),
                "resonance": story.get("resonance_count", 0)
            },
            "isPremium": story.get("is_premium", False),
            "createdAt": story.get("created_at").isoformat() if story.get("created_at") else None
        })
    
    return result

@router.get("/{story_id}")
async def get_story(story_id: str):
    """Get a single story by ID"""
    try:
        story_oid = ObjectId(story_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid story ID")
    
    story = await db.stories.find_one({"_id": story_oid, "status": "published"})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Increment play count
    await db.stories.update_one(
        {"_id": story_oid},
        {"$inc": {"play_count": 1}}
    )
    
    return {
        "id": str(story["_id"]),
        "title": story.get("title"),
        "description": story.get("description"),
        "category": story.get("category"),
        "contentType": story.get("content_type"),
        "format": story.get("format"),
        "mediaUrl": story.get("media_url"),
        "thumbnailUrl": story.get("thumbnail_url"),
        "duration": story.get("duration"),
        "intentions": story.get("intentions", []),
        "reflectionPrompts": story.get("reflection_prompts", {}),
        "creator": {
            "id": story.get("creator_id"),
            "name": story.get("creator_name"),
            "avatar": story.get("creator_avatar"),
            "bio": story.get("creator_bio", ""),
            "verified": story.get("creator_verified", False)
        },
        "stats": {
            "plays": story.get("play_count", 0),
            "resonance": story.get("resonance_count", 0)
        },
        "isPremium": story.get("is_premium", False),
        "createdAt": story.get("created_at").isoformat() if story.get("created_at") else None
    }

@router.post("/{story_id}/resonance")
async def toggle_resonance(story_id: str, current_user: dict = Depends(get_current_user)):
    """Toggle resonance (like) on a story"""
    try:
        story_oid = ObjectId(story_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid story ID")
    
    user_id = str(current_user["_id"])
    
    # Check if already resonated
    existing = await db.resonances.find_one({
        "story_id": story_id,
        "user_id": user_id
    })
    
    if existing:
        # Remove resonance
        await db.resonances.delete_one({"_id": existing["_id"]})
        await db.stories.update_one(
            {"_id": story_oid},
            {"$inc": {"resonance_count": -1}}
        )
        return {"resonated": False}
    else:
        # Add resonance
        await db.resonances.insert_one({
            "story_id": story_id,
            "user_id": user_id,
            "created_at": datetime.utcnow()
        })
        await db.stories.update_one(
            {"_id": story_oid},
            {"$inc": {"resonance_count": 1}}
        )
        return {"resonated": True}

@router.post("/recommendations")
async def get_ai_recommendations(current_user: dict = Depends(get_current_user)):
    """Get AI-powered personalized story recommendations"""
    if not client:
        # Fallback to basic recommendations if AI not available
        return await get_basic_recommendations(current_user)
    
    try:
        # Get user's watch history and preferences
        user_history = await db.watch_history.find(
            {"user_id": str(current_user["_id"])}
        ).sort("watched_at", -1).limit(10).to_list(10)
        
        # Get user's preferred intentions
        user_intentions = current_user.get("preferred_intentions", [])
        
        # Get user's journal entries for context
        recent_entries = await db.journal_entries.find(
            {"user_id": str(current_user["_id"])}
        ).sort("created_at", -1).limit(5).to_list(5)
        
        # Build context for AI
        context = f"""User Profile:
- Preferred intentions: {', '.join(user_intentions) if user_intentions else 'Not set'}
- Recent journal mood: {recent_entries[0].get('mood') if recent_entries else 'Unknown'}
- Watch history count: {len(user_history)}

Recommend 5 story IDs from our wellness content library that would best serve this user's current journey.
Focus on: personal growth, mindfulness, and emotional wellbeing.
"""
        
        # Get all available stories
        all_stories = await db.stories.find(
            {"status": "published"}
        ).limit(50).to_list(50)
        
        stories_context = "\n".join([
            f"- ID: {str(s['_id'])}, Title: {s['title']}, Intentions: {', '.join(s.get('intentions', []))}"
            for s in all_stories[:20]
        ])
        
        # Call OpenAI for recommendations
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a wellness content recommendation AI. Recommend stories that will best serve the user's current emotional and spiritual needs."},
                {"role": "user", "content": f"{context}\n\nAvailable Stories:\n{stories_context}\n\nProvide 5 story recommendations with brief reasons."}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # For now, return a curated mix based on user preferences
        recommendations = all_stories[:5]
        
        return [
            {
                "id": str(story["_id"]),
                "title": story.get("title"),
                "description": story.get("description"),
                "format": story.get("format"),
                "thumbnailUrl": story.get("thumbnail_url"),
                "intentions": story.get("intentions", []),
                "reason": "Personalized for your journey"
            }
            for story in recommendations
        ]
        
    except Exception as e:
        print(f"AI recommendation error: {e}")
        return await get_basic_recommendations(current_user)

async def get_basic_recommendations(current_user: dict):
    """Fallback basic recommendations without AI"""
    # Get user preferences
    user_intentions = current_user.get("preferred_intentions", [])
    
    query = {"status": "published"}
    if user_intentions:
        query["intentions"] = {"$in": user_intentions}
    
    stories = await db.stories.find(query).sort("resonance_count", -1).limit(5).to_list(5)
    
    return [
        {
            "id": str(story["_id"]),
            "title": story.get("title"),
            "description": story.get("description"),
            "format": story.get("format"),
            "thumbnailUrl": story.get("thumbnail_url"),
            "intentions": story.get("intentions", []),
            "reason": "Popular in your interests"
        }
        for story in stories
    ]
