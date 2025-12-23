from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import os
import base64
from dotenv import load_dotenv

from database import db
from auth import get_password_hash, create_access_token
from routers.auth import get_current_user

load_dotenv()

router = APIRouter(prefix="/api/creator-application", tags=["Creator Application"])

# Email templates import
from routers.email_templates import send_creator_application_received, send_creator_approved, send_creator_rejected


class CreatorApplicationRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    bio: str
    description: str
    website: Optional[str] = None
    profile_image_url: Optional[str] = None
    social_media: Optional[dict] = {}  # {instagram: "", youtube: "", twitter: "", linkedin: "", tiktok: "", facebook: "", spotify: "", soundcloud: ""}


class ApplicationStatusUpdate(BaseModel):
    status: str  # approved, rejected
    rejection_reason: Optional[str] = None


@router.post("/apply")
async def apply_as_creator(application: CreatorApplicationRequest):
    """Submit a creator application"""
    
    # Check if email already exists as user
    existing_user = await db.users.find_one({"email": application.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered. Please login and apply from your profile.")
    
    # Check if application already exists
    existing_application = await db.creator_applications.find_one({
        "email": application.email,
        "status": {"$in": ["pending", "approved"]}
    })
    if existing_application:
        if existing_application["status"] == "pending":
            raise HTTPException(status_code=400, detail="You already have a pending application. Please wait for admin review.")
        elif existing_application["status"] == "approved":
            raise HTTPException(status_code=400, detail="Your application was already approved. Please login with your credentials.")
    
    # Create application document
    application_doc = {
        "name": application.name,
        "email": application.email,
        "password_hash": get_password_hash(application.password),
        "bio": application.bio,
        "description": application.description,
        "website": application.website,
        "profile_image_url": application.profile_image_url,
        "social_media": application.social_media or {},
        "status": "pending",  # pending, approved, rejected
        "rejection_reason": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "reviewed_at": None,
        "reviewed_by": None
    }
    
    result = await db.creator_applications.insert_one(application_doc)
    application_id = str(result.inserted_id)
    
    # Send confirmation email
    try:
        await send_creator_application_received(application.email, application.name)
    except Exception as e:
        print(f"Failed to send application email: {e}")
    
    return {
        "status": "success",
        "message": "Your creator application has been submitted successfully! You will receive an email once reviewed.",
        "application_id": application_id
    }


@router.get("/my-application")
async def get_my_application(email: str):
    """Check application status by email"""
    application = await db.creator_applications.find_one(
        {"email": email},
        {"_id": 0, "password_hash": 0}
    )
    
    if not application:
        return {"status": "not_found", "message": "No application found for this email"}
    
    return {
        "status": application.get("status"),
        "name": application.get("name"),
        "email": application.get("email"),
        "created_at": application.get("created_at").isoformat() if application.get("created_at") else None,
        "rejection_reason": application.get("rejection_reason")
    }


# Admin endpoints for managing applications
@router.get("/admin/pending")
async def get_pending_applications(current_user: dict = Depends(get_current_user)):
    """Get all pending creator applications (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    applications = await db.creator_applications.find(
        {"status": "pending"}
    ).sort("created_at", -1).to_list(100)
    
    return [
        {
            "id": str(app["_id"]),
            "name": app.get("name"),
            "email": app.get("email"),
            "bio": app.get("bio"),
            "description": app.get("description"),
            "website": app.get("website"),
            "profile_image_url": app.get("profile_image_url"),
            "social_media": app.get("social_media", {}),
            "created_at": app.get("created_at").isoformat() if app.get("created_at") else None
        }
        for app in applications
    ]


@router.get("/admin/all")
async def get_all_applications(current_user: dict = Depends(get_current_user)):
    """Get all creator applications (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    applications = await db.creator_applications.find({}).sort("created_at", -1).to_list(500)
    
    return [
        {
            "id": str(app["_id"]),
            "name": app.get("name"),
            "email": app.get("email"),
            "bio": app.get("bio"),
            "description": app.get("description"),
            "website": app.get("website"),
            "profile_image_url": app.get("profile_image_url"),
            "social_media": app.get("social_media", {}),
            "status": app.get("status"),
            "rejection_reason": app.get("rejection_reason"),
            "created_at": app.get("created_at").isoformat() if app.get("created_at") else None,
            "reviewed_at": app.get("reviewed_at").isoformat() if app.get("reviewed_at") else None
        }
        for app in applications
    ]


@router.put("/admin/{application_id}/approve")
async def approve_application(application_id: str, current_user: dict = Depends(get_current_user)):
    """Approve a creator application (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        app_oid = ObjectId(application_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid application ID")
    
    application = await db.creator_applications.find_one({"_id": app_oid})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Application is already {application['status']}")
    
    # Create user account
    user_doc = {
        "name": application["name"],
        "email": application["email"],
        "password_hash": application["password_hash"],
        "role": "creator",
        "avatar": application.get("profile_image_url") or f"https://i.pravatar.cc/150?u={application['email']}",
        "bio": application["bio"],
        "website": application.get("website"),
        "social_media": application.get("social_media", {}),
        "description": application.get("description"),
        "is_verified": True,
        "created_at": datetime.now(timezone.utc),
        "settings": {
            "email_notifications": True,
            "push_notifications": True,
            "marketing_emails": False
        }
    }
    
    # Check if user already exists (edge case)
    existing = await db.users.find_one({"email": application["email"]})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user_result = await db.users.insert_one(user_doc)
    user_id = str(user_result.inserted_id)
    
    # Update application status
    await db.creator_applications.update_one(
        {"_id": app_oid},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.now(timezone.utc),
                "reviewed_by": str(current_user.get("_id", current_user.get("id"))),
                "user_id": user_id
            }
        }
    )
    
    # Send approval email with credentials
    try:
        await send_creator_approved(application["email"], application["name"])
    except Exception as e:
        print(f"Failed to send approval email: {e}")
    
    return {
        "status": "success",
        "message": f"Creator application approved. User account created for {application['email']}",
        "user_id": user_id
    }


@router.put("/admin/{application_id}/reject")
async def reject_application(
    application_id: str,
    rejection_data: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Reject a creator application (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        app_oid = ObjectId(application_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid application ID")
    
    application = await db.creator_applications.find_one({"_id": app_oid})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Application is already {application['status']}")
    
    # Update application status
    await db.creator_applications.update_one(
        {"_id": app_oid},
        {
            "$set": {
                "status": "rejected",
                "rejection_reason": rejection_data.rejection_reason or "Your application did not meet our current requirements.",
                "reviewed_at": datetime.now(timezone.utc),
                "reviewed_by": str(current_user.get("_id", current_user.get("id")))
            }
        }
    )
    
    # Send rejection email
    try:
        await send_creator_rejected(
            application["email"],
            application["name"],
            rejection_data.rejection_reason or "Your application did not meet our current requirements."
        )
    except Exception as e:
        print(f"Failed to send rejection email: {e}")
    
    return {
        "status": "success",
        "message": f"Creator application rejected for {application['email']}"
    }


@router.get("/admin/stats")
async def get_application_stats(current_user: dict = Depends(get_current_user)):
    """Get creator application statistics (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total = await db.creator_applications.count_documents({})
    pending = await db.creator_applications.count_documents({"status": "pending"})
    approved = await db.creator_applications.count_documents({"status": "approved"})
    rejected = await db.creator_applications.count_documents({"status": "rejected"})
    
    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected
    }
