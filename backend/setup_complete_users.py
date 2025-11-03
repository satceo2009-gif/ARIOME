"""
Create comprehensive test users for all roles with proper database connections
"""
import asyncio
from database import db
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_test_users():
    print("🔧 Creating test users for all roles...")
    
    # Clear existing test users
    await db.users.delete_many({"email": {"$regex": "@ariome-test.com"}})
    
    # Password hash for all test users (password: "test123")
    hashed_password = pwd_context.hash("test123")
    
    test_users = [
        {
            "name": "Explorer User",
            "email": "explorer@ariome-test.com",
            "password": hashed_password,
            "role": "explorer",
            "avatar": "https://i.pravatar.cc/150?img=1",
            "bio": "I'm exploring wellness content",
            "preferred_intentions": ["healing", "mindfulness"],
            "onboarded": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Subscriber Pro",
            "email": "subscriber@ariome-test.com",
            "password": hashed_password,
            "role": "subscriber",
            "avatar": "https://i.pravatar.cc/150?img=2",
            "bio": "Premium subscriber enjoying exclusive content",
            "preferred_intentions": ["growth", "joy"],
            "subscription_status": "active",
            "subscription_tier": "premium",
            "onboarded": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Seenas Admin",
            "email": "admin@ariome-test.com",
            "password": hashed_password,
            "role": "admin",
            "avatar": "https://i.pravatar.cc/150?img=3",
            "bio": "Platform administrator",
            "preferred_intentions": ["love", "gratitude"],
            "onboarded": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Creator Artist",
            "email": "creator@ariome-test.com",
            "password": hashed_password,
            "role": "creator",
            "avatar": "https://i.pravatar.cc/150?img=4",
            "bio": "Content creator sharing wellness stories",
            "preferred_intentions": ["resilience", "mindfulness"],
            "verification_status": "verified",
            "onboarded": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Evaluator Mod",
            "email": "evaluator@ariome-test.com",
            "password": hashed_password,
            "role": "evaluator",
            "avatar": "https://i.pravatar.cc/150?img=5",
            "bio": "Content moderator and evaluator",
            "preferred_intentions": ["healing", "joy"],
            "onboarded": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Insert users
    result = await db.users.insert_many(test_users)
    print(f"✅ Created {len(result.inserted_ids)} test users")
    
    # Create creator profile for creator user
    creator_id = result.inserted_ids[3]  # Creator is 4th user
    creator_profile = {
        "user_id": str(creator_id),
        "bio": "Professional wellness content creator",
        "website": "https://wellness-creator.com",
        "social_links": {
            "instagram": "@wellness_creator",
            "youtube": "WellnessChannel"
        },
        "specialties": ["meditation", "mindfulness", "healing"],
        "verification_status": "verified",
        "total_earnings": 150.00,
        "total_stories": 5,
        "total_followers": 234,
        "created_at": datetime.utcnow()
    }
    await db.creator_profiles.insert_one(creator_profile)
    print("✅ Created creator profile")
    
    # Create some test circles
    circles = [
        {
            "name": "Mindfulness Warriors",
            "description": "Daily mindfulness practice and support",
            "intention": "mindfulness",
            "creator_id": str(creator_id),
            "creator_name": "Creator Artist",
            "members": [str(creator_id), str(result.inserted_ids[0])],
            "member_count": 2,
            "post_count": 5,
            "is_private": False,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Healing Together",
            "description": "Community for healing and growth",
            "intention": "healing",
            "creator_id": str(result.inserted_ids[0]),
            "creator_name": "Explorer User",
            "members": [str(result.inserted_ids[0])],
            "member_count": 1,
            "post_count": 2,
            "is_private": False,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Gratitude Circle",
            "description": "Share daily gratitude and positive vibes",
            "intention": "gratitude",
            "creator_id": str(result.inserted_ids[1]),
            "creator_name": "Subscriber Pro",
            "members": [str(result.inserted_ids[1]), str(result.inserted_ids[2])],
            "member_count": 2,
            "post_count": 8,
            "is_private": False,
            "created_at": datetime.utcnow()
        }
    ]
    await db.circles.insert_many(circles)
    print("✅ Created 3 test circles")
    
    # Create test journal entries
    journal_entries = [
        {
            "user_id": str(result.inserted_ids[0]),
            "title": "My First Meditation",
            "content": "Today I tried meditation for the first time. It was challenging but peaceful.",
            "mood": "calm",
            "tags": ["meditation", "first-time", "peaceful"],
            "created_at": datetime.utcnow()
        },
        {
            "user_id": str(result.inserted_ids[1]),
            "title": "Feeling Grateful",
            "content": "So many things to be grateful for today. The sunrise was beautiful.",
            "mood": "grateful",
            "tags": ["gratitude", "morning", "nature"],
            "created_at": datetime.utcnow()
        }
    ]
    await db.journal_entries.insert_many(journal_entries)
    print("✅ Created test journal entries")
    
    # Print login credentials
    print("\n" + "="*60)
    print("🔑 TEST USER CREDENTIALS (All passwords: 'test123')")
    print("="*60)
    for user in test_users:
        print(f"\n{user['role'].upper()}:")
        print(f"  Email: {user['email']}")
        print(f"  Name: {user['name']}")
    print("\n" + "="*60)
    
    return True

if __name__ == "__main__":
    asyncio.run(create_test_users())
