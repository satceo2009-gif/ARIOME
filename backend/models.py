from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    EXPLORER = "explorer"
    SUBSCRIBER = "subscriber"
    CREATOR = "creator"
    ADMIN = "admin"

class StoryStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    PUBLISHED = "published"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class TransactionType(str, Enum):
    TIP = "tip"
    SUBSCRIPTION = "subscription"
    BUNDLE = "bundle"

# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.EXPLORER
    intentions: List[str] = []
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_verified: bool = False
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Story Models
class ReflectionPrompts(BaseModel):
    before: str
    after: str

class StoryBase(BaseModel):
    title: str
    description: str
    intentions: List[str]
    format: str  # 'audio' or 'video'
    media_url: str
    thumbnail_url: str
    duration: int  # in seconds
    tags: List[str] = []
    reflection_prompts: ReflectionPrompts
    is_premium: bool = False
    price: Optional[float] = None

class StoryCreate(StoryBase):
    pass

class StoryResponse(StoryBase):
    id: str
    creator_id: str
    creator_name: str
    creator_avatar: str
    creator_verified: bool
    status: StoryStatus
    resonance_count: int = 0
    play_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Creator Profile Models
class CreatorProfileBase(BaseModel):
    bio: str
    website: Optional[str] = None
    social_links: dict = {}
    specialties: List[str] = []

class CreatorProfileCreate(CreatorProfileBase):
    pass

class CreatorProfileResponse(CreatorProfileBase):
    id: str
    user_id: str
    verification_status: VerificationStatus
    total_earnings: float = 0.0
    total_stories: int = 0
    total_followers: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True

# Subscription Models
class SubscriptionBase(BaseModel):
    creator_id: str
    plan_type: str  # 'monthly', 'yearly'
    amount: float

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionResponse(SubscriptionBase):
    id: str
    user_id: str
    status: str  # 'active', 'cancelled', 'expired'
    starts_at: datetime
    expires_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Transaction Models
class TransactionBase(BaseModel):
    type: TransactionType
    amount: float
    story_id: Optional[str] = None
    creator_id: str

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    status: str  # 'pending', 'completed', 'failed'
    stripe_payment_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Reflection Models
class ReflectionBase(BaseModel):
    story_id: str
    mood: str
    before_reflection: Optional[str] = None
    after_reflection: Optional[str] = None

class ReflectionCreate(ReflectionBase):
    pass

class ReflectionResponse(ReflectionBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Circle Models
class CircleBase(BaseModel):
    name: str
    description: str
    intention: str
    is_private: bool = False

class CircleCreate(CircleBase):
    pass

class CircleResponse(CircleBase):
    id: str
    created_by: str
    members: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True
