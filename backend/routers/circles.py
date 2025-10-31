from fastapi import APIRouter, HTTPException, Depends
from database import circles_collection, circle_posts_collection, users_collection
from routers.auth import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/circles", tags=["Circles"])

@router.post("/")
async def create_circle(circle_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new community circle"""
    circle_doc = {
        "name": circle_data["name"],
        "description": circle_data["description"],
        "intention": circle_data["intention"],
        "is_private": circle_data.get("is_private", False),
        "created_by": str(current_user["_id"]),
        "creator_name": current_user["name"],
        "creator_avatar": current_user["avatar"],
        "members": [str(current_user["_id"])],
        "member_count": 1,
        "post_count": 0,
        "created_at": datetime.utcnow()
    }
    
    result = await circles_collection.insert_one(circle_doc)
    return {"id": str(result.inserted_id), "message": "Circle created successfully"}

@router.get("/")
async def get_circles(intention: str = None, current_user: dict = Depends(get_current_user)):
    """Get all circles (filtered by intention if provided)"""
    query = {}
    if intention:
        query["intention"] = intention
    
    cursor = circles_collection.find(query).sort("created_at", -1)
    circles = await cursor.to_list(length=100)
    
    result = []
    for circle in circles:
        result.append({
            "id": str(circle["_id"]),
            "name": circle["name"],
            "description": circle["description"],
            "intention": circle["intention"],
            "creator_name": circle["creator_name"],
            "creator_avatar": circle["creator_avatar"],
            "member_count": circle.get("member_count", len(circle.get("members", []))),
            "post_count": circle.get("post_count", 0),
            "is_member": str(current_user["_id"]) in circle.get("members", []),
            "created_at": circle["created_at"]
        })
    
    return result

@router.post("/{circle_id}/join")
async def join_circle(circle_id: str, current_user: dict = Depends(get_current_user)):
    """Join a circle"""
    circle = await circles_collection.find_one({"_id": ObjectId(circle_id)})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    if str(current_user["_id"]) in circle.get("members", []):
        raise HTTPException(status_code=400, detail="Already a member")
    
    await circles_collection.update_one(
        {"_id": ObjectId(circle_id)},
        {"$push": {"members": str(current_user["_id"])},
         "$inc": {"member_count": 1}}
    )
    
    return {"message": "Joined circle successfully"}

@router.post("/{circle_id}/leave")
async def leave_circle(circle_id: str, current_user: dict = Depends(get_current_user)):
    """Leave a circle"""
    await circles_collection.update_one(
        {"_id": ObjectId(circle_id)},
        {"$pull": {"members": str(current_user["_id"])},
         "$inc": {"member_count": -1}}
    )
    
    return {"message": "Left circle successfully"}

@router.post("/{circle_id}/posts")
async def create_post(circle_id: str, post_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a post in a circle"""
    circle = await circles_collection.find_one({"_id": ObjectId(circle_id)})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    if str(current_user["_id"]) not in circle.get("members", []):
        raise HTTPException(status_code=403, detail="Must be a member to post")
    
    post_doc = {
        "circle_id": circle_id,
        "user_id": str(current_user["_id"]),
        "user_name": current_user["name"],
        "user_avatar": current_user["avatar"],
        "content": post_data["content"],
        "likes": [],
        "like_count": 0,
        "comment_count": 0,
        "created_at": datetime.utcnow()
    }
    
    result = await circle_posts_collection.insert_one(post_doc)
    
    # Update circle post count
    await circles_collection.update_one(
        {"_id": ObjectId(circle_id)},
        {"$inc": {"post_count": 1}}
    )
    
    return {"id": str(result.inserted_id), "message": "Post created successfully"}

@router.get("/{circle_id}/posts")
async def get_circle_posts(circle_id: str, current_user: dict = Depends(get_current_user)):
    """Get all posts in a circle"""
    cursor = circle_posts_collection.find({"circle_id": circle_id}).sort("created_at", -1)
    posts = await cursor.to_list(length=100)
    
    result = []
    for post in posts:
        result.append({
            "id": str(post["_id"]),
            "user_name": post["user_name"],
            "user_avatar": post["user_avatar"],
            "content": post["content"],
            "like_count": post.get("like_count", 0),
            "comment_count": post.get("comment_count", 0),
            "is_liked": str(current_user["_id"]) in post.get("likes", []),
            "created_at": post["created_at"]
        })
    
    return result

@router.post("/posts/{post_id}/like")
async def like_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Like a post"""
    post = await circle_posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if str(current_user["_id"]) in post.get("likes", []):
        # Unlike
        await circle_posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$pull": {"likes": str(current_user["_id"])},
             "$inc": {"like_count": -1}}
        )
        return {"message": "Post unliked"}
    else:
        # Like
        await circle_posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$push": {"likes": str(current_user["_id"])},
             "$inc": {"like_count": 1}}
        )
        return {"message": "Post liked"}
