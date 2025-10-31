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
    if not verify_password(form_data.password, user["password_hash"]):
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
