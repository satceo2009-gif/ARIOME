"""
Create test users for all roles in ARIOME
Run this to get login credentials for testing
"""

import asyncio
from datetime import datetime
from database import init_db, users_collection
from routers.auth import hash_password

# Test users for each role
TEST_USERS = [
    {
        "email": "admin@ariome.com",
        "name": "Admin User",
        "password": "admin123",
        "role": "admin",
        "intentions": ["healing", "mindfulness", "growth"],
    },
    {
        "email": "creator@ariome.com",
        "name": "Creator User",
        "password": "creator123",
        "role": "creator",
        "intentions": ["healing", "love", "joy"],
    },
    {
        "email": "subscriber@ariome.com",
        "name": "Subscriber User",
        "password": "subscriber123",
        "role": "subscriber",
        "intentions": ["resilience", "growth", "gratitude"],
    },
    {
        "email": "explorer@ariome.com",
        "name": "Explorer User",
        "password": "explorer123",
        "role": "explorer",
        "intentions": ["mindfulness", "joy", "healing"],
    },
]

async def create_test_users():
    """Create test users for all roles"""
    await init_db()
    
    print("🎭 Creating test users for ARIOME...\n")
    
    for user_data in TEST_USERS:
        # Check if user already exists
        existing = await users_collection.find_one({"email": user_data["email"]})
        
        if existing:
            print(f"⚠️  {user_data['role'].upper()} user already exists: {user_data['email']}")
            continue
        
        # Create user document
        user_doc = {
            "email": user_data["email"],
            "name": user_data["name"],
            "password_hash": hash_password(user_data["password"]),
            "role": user_data["role"],
            "intentions": user_data["intentions"],
            "avatar": f"https://i.pravatar.cc/150?u={user_data['email']}",
            "is_verified": True,
            "subscription_status": "active" if user_data["role"] == "subscriber" else "free",
            "subscription_expires_at": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await users_collection.insert_one(user_doc)
        print(f"✅ Created {user_data['role'].upper()} user: {user_data['email']}")
    
    print("\n" + "="*60)
    print("🎉 TEST USERS CREATED SUCCESSFULLY!")
    print("="*60)
    print("\n📋 LOGIN CREDENTIALS:\n")
    
    for user in TEST_USERS:
        print(f"🔐 {user['role'].upper()}")
        print(f"   Email: {user['email']}")
        print(f"   Password: {user['password']}")
        print()
    
    print("="*60)
    print("🌐 Open the app: https://wellness-hub-227.preview.emergentagent.com")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(create_test_users())
