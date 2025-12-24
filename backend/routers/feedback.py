"""
Feedback API - User feedback storage (database-driven)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from database import db

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


class FeedbackRequest(BaseModel):
    category: str  # experience, content, feature, bug, other
    rating: int  # 1-5
    feedback: str
    user_email: Optional[str] = None
    user_role: Optional[str] = None


@router.post("")
async def submit_feedback(data: FeedbackRequest):
    """Submit user feedback - stored in database"""
    feedback_doc = {
        "category": data.category,
        "rating": data.rating,
        "feedback": data.feedback,
        "user_email": data.user_email or "anonymous",
        "user_role": data.user_role or "explorer",
        "created_at": datetime.now(timezone.utc),
        "status": "new"  # new, reviewed, addressed
    }
    
    result = await db.feedback.insert_one(feedback_doc)
    
    return {
        "status": "success",
        "message": "Thank you for your feedback!",
        "feedback_id": str(result.inserted_id)
    }


@router.get("/admin/all")
async def get_all_feedback(status: str = None, limit: int = 100):
    """Get all feedback (admin only)"""
    query = {}
    if status:
        query["status"] = status
    
    feedbacks = await db.feedback.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    
    return [
        {
            "id": str(f["_id"]),
            "category": f.get("category"),
            "rating": f.get("rating"),
            "feedback": f.get("feedback"),
            "user_email": f.get("user_email"),
            "user_role": f.get("user_role"),
            "status": f.get("status"),
            "created_at": f.get("created_at").isoformat() if f.get("created_at") else None
        }
        for f in feedbacks
    ]


@router.get("/admin/stats")
async def get_feedback_stats():
    """Get feedback statistics"""
    total = await db.feedback.count_documents({})
    new_count = await db.feedback.count_documents({"status": "new"})
    
    # Average rating
    pipeline = [
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}}
    ]
    result = await db.feedback.aggregate(pipeline).to_list(1)
    avg_rating = result[0]["avg_rating"] if result else 0
    
    # By category
    category_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    categories = await db.feedback.aggregate(category_pipeline).to_list(10)
    
    return {
        "total": total,
        "new": new_count,
        "average_rating": round(avg_rating, 1) if avg_rating else 0,
        "by_category": {c["_id"]: c["count"] for c in categories if c["_id"]}
    }
