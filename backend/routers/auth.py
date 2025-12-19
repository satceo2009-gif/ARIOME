from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from database import users_collection, creator_profiles_collection
from models import UserCreate, UserLogin, UserResponse, UserRole, CreatorProfileCreate
from bson import ObjectId
import os

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
        user = await users_collection.find_one({"email": email})
        if user is None:
            raise credentials_exception
        return user
    except jwt.PyJWTError:
        raise credentials_exception

async def require_role(required_roles: list):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {required_roles}"
            )
        return current_user
    return Depends(role_checker)

@router.post("/signup")
async def signup(user: UserCreate):
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Create user document
    user_doc = {
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "intentions": user.intentions,
        "avatar": user.avatar or f"https://i.pravatar.cc/150?u={user.email}",
        "password_hash": hashed_password,
        "is_verified": False,
        "subscription_status": "free",
        "subscription_expires_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_doc)
    
    # If creator role, create creator profile
    if user.role == UserRole.CREATOR:
        creator_profile = {
            "user_id": str(result.inserted_id),
            "bio": "",
            "website": None,
            "social_links": {},
            "specialties": [],
            "verification_status": "pending",
            "total_earnings": 0.0,
            "total_stories": 0,
            "total_followers": 0,
            "created_at": datetime.utcnow()
        }
        await creator_profiles_collection.insert_one(creator_profile)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(result.inserted_id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
        }
    }


@router.post("/email-signup")
async def email_signup(email: EmailStr):
    """Email-only signup for explorers (no password) - access to short clips only"""
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        return {"user_id": str(existing_user["_id"]), "message": "Email already registered"}
    
    # Create explorer user with email only (no password)
    user_data = {
        "email": email,
        "name": "Explorer",
        "role": "explorer",
        "verified": False,
        "subscription_status": "free",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_data)
    
    # TODO: Send verification email
    
    return {
        "user_id": str(result.inserted_id),
        "message": "Verification email sent. Check your inbox!"
    }

            "avatar": user_doc["avatar"]
        }
    }

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user
    user = await users_collection.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(form_data.password, user.get("password_hash") or user.get("password")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "avatar": user["avatar"],
            "subscription_status": user.get("subscription_status", "free")
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "avatar": current_user["avatar"],
        "intentions": current_user.get("intentions", []),
        "subscription_status": current_user.get("subscription_status", "free"),
        "subscription_expires_at": current_user.get("subscription_expires_at")
    }


@router.put("/profile")
async def update_profile(
    name: Optional[str] = None,
    bio: Optional[str] = None,
    avatar: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    update_fields = {}
    if name:
        update_fields["name"] = name
    if bio:
        update_fields["bio"] = bio
    if avatar:
        update_fields["avatar"] = avatar
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_fields["updated_at"] = datetime.utcnow()
    
    result = await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_fields}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Profile update failed")
    
    # Get updated user
    updated_user = await users_collection.find_one({"_id": current_user["_id"]})
    
    return {
        "id": str(updated_user["_id"]),
        "name": updated_user["name"],
        "email": updated_user["email"],
        "avatar": updated_user.get("avatar"),
        "bio": updated_user.get("bio", ""),
        "role": updated_user["role"]
    }

@router.put("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_user)
):
    """Change user password"""
    # Verify old password
    if not verify_password(old_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    # Hash new password
    new_hashed = hash_password(new_password)
    
    # Update password
    result = await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "password_hash": new_hashed,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Password change failed")
    
    return {"message": "Password changed successfully"}

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "avatar": current_user.get("avatar"),
        "bio": current_user.get("bio", ""),
        "preferred_intentions": current_user.get("preferred_intentions", []),
        "verification_status": current_user.get("verification_status", "pending"),
        "subscription_status": current_user.get("subscription_status", "free")
    }

@router.put("/me")
async def update_profile(update_data: dict, current_user: dict = Depends(get_current_user)):
    allowed_fields = ["name", "avatar", "intentions"]
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    update_fields["updated_at"] = datetime.utcnow()
    
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_fields}
    )
    
    return {"message": "Profile updated successfully"}


@router.put("/settings/notifications")
async def update_notification_settings(
    email_notifications: Optional[bool] = None,
    push_notifications: Optional[bool] = None,
    marketing_emails: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    """Update notification settings - stored in database"""
    settings = {}
    if email_notifications is not None:
        settings["email_notifications"] = email_notifications
    if push_notifications is not None:
        settings["push_notifications"] = push_notifications
    if marketing_emails is not None:
        settings["marketing_emails"] = marketing_emails
    
    if not settings:
        raise HTTPException(status_code=400, detail="No settings to update")
    
    settings["updated_at"] = datetime.utcnow()
    
    # Update in database
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"notification_settings": settings}}
    )
    
    return {"message": "Notification settings updated", "settings": settings}

@router.get("/settings/notifications")
async def get_notification_settings(current_user: dict = Depends(get_current_user)):
    """Get notification settings from database"""
    user = await users_collection.find_one({"_id": current_user["_id"]})
    settings = user.get("notification_settings", {
        "email_notifications": True,
        "push_notifications": True,
        "marketing_emails": False
    })
    return settings

