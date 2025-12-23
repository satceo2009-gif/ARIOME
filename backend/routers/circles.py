from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId
from routers.auth import get_current_user
from database import db

router = APIRouter(prefix="/api/circles", tags=["circles"])

class CreateCircle(BaseModel):
    name: str
    description: str
    intention: Optional[str] = None
    is_private: bool = False

class CreatePost(BaseModel):
    content: str
    post_type: str = "text"  # text, reflection, question

@router.post("")
async def create_circle(circle: CreateCircle, current_user: dict = Depends(get_current_user)):
    """Create a new circle"""
    user_id = str(current_user.get("_id", current_user.get("id")))
    circle_doc = {
        **circle.dict(),
        "creator_id": user_id,
        "creator_name": current_user.get("name", "Unknown"),
        "members": [user_id],
        "member_count": 1,
        "post_count": 0,
        "created_at": datetime.utcnow()
    }
    result = await db.circles.insert_one(circle_doc)
    circle_doc["id"] = str(result.inserted_id)
    return circle_doc

@router.get("")
async def get_circles(
    intention: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all circles (optionally filtered by intention)"""
    query = {}
    if intention:
        query["intention"] = intention
    
    circles = await db.circles.find(query).sort("created_at", -1).to_list(100)
    user_id = str(current_user.get("_id", current_user.get("id")))
    
    return [
        {
            "id": str(c["_id"]),
            "name": c.get("name"),
            "description": c.get("description"),
            "intention": c.get("intention"),
            "creator_name": c.get("creator_name"),
            "member_count": c.get("member_count", 0),
            "post_count": c.get("post_count", 0),
            "is_member": user_id in c.get("members", []),
            "is_private": c.get("is_private", False)
        }
        for c in circles
    ]

@router.post("/{circle_id}/join")
async def join_circle(circle_id: str, current_user: dict = Depends(get_current_user)):
    """Join a circle"""
    try:
        circle_oid = ObjectId(circle_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid circle ID")
    
    circle = await db.circles.find_one({"_id": circle_oid})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    user_id = str(current_user.get("_id", current_user.get("id")))
    if user_id in circle.get("members", []):
        raise HTTPException(status_code=400, detail="Already a member")
    
    await db.circles.update_one(
        {"_id": circle_oid},
        {
            "$push": {"members": user_id},
            "$inc": {"member_count": 1}
        }
    )
    
    return {"message": "Joined circle successfully"}

@router.post("/{circle_id}/leave")
async def leave_circle(circle_id: str, current_user: dict = Depends(get_current_user)):
    """Leave a circle"""
    try:
        circle_oid = ObjectId(circle_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid circle ID")
    
    user_id = str(current_user.get("_id", current_user.get("id")))
    await db.circles.update_one(
        {"_id": circle_oid},
        {
            "$pull": {"members": user_id},
            "$inc": {"member_count": -1}
        }
    )
    
    return {"message": "Left circle successfully"}

@router.get("/{circle_id}/posts")
async def get_circle_posts(circle_id: str, current_user: dict = Depends(get_current_user)):
    """Get posts in a circle"""
    try:
        circle_oid = ObjectId(circle_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid circle ID")
    
    # Check if user is a member
    circle = await db.circles.find_one({"_id": circle_oid})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    user_id = str(current_user["_id"])
    if user_id not in circle.get("members", []):
        raise HTTPException(status_code=403, detail="Not a member of this circle")
    
    posts = await db.circle_posts.find(
        {"circle_id": circle_id}
    ).sort("created_at", -1).to_list(100)
    
    return [
        {
            "id": str(p["_id"]),
            "content": p.get("content"),
            "post_type": p.get("post_type"),
            "author_name": p.get("author_name"),
            "created_at": p.get("created_at").isoformat() if p.get("created_at") else None
        }
        for p in posts
    ]

@router.post("/{circle_id}/posts")
async def create_post(circle_id: str, post: CreatePost, current_user: dict = Depends(get_current_user)):
    """Create a post in a circle"""
    try:
        circle_oid = ObjectId(circle_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid circle ID")
    
    # Check if user is a member
    circle = await db.circles.find_one({"_id": circle_oid})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    user_id = str(current_user["_id"])
    if user_id not in circle.get("members", []):
        raise HTTPException(status_code=403, detail="Not a member of this circle")
    
    post_doc = {
        **post.dict(),
        "circle_id": circle_id,
        "author_id": user_id,
        "author_name": current_user.get("name", "Unknown"),
        "created_at": datetime.utcnow()
    }
    
    result = await db.circle_posts.insert_one(post_doc)
    
    # Update circle post count
    await db.circles.update_one(
        {"_id": circle_oid},
        {"$inc": {"post_count": 1}}
    )
    
    post_doc["id"] = str(result.inserted_id)
    return post_doc
