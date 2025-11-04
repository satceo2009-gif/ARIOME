#!/usr/bin/env python3
"""
Seed ARIOME database with real wellness content
Run: python3 seed_data.py
"""

import asyncio
from datetime import datetime
from database import (
    users_collection,
    stories_collection,
    init_db,
    close_db
)
from auth import get_password_hash
from models import UserRole, StoryStatus

# Real wellness content with YouTube URLs
SAMPLE_STORIES = [
    # HEALING & RECOVERY
    {
        "title": "Guided Meditation for Healing After Loss",
        "description": "A compassionate 15-minute guided meditation to support you through grief and loss. Find comfort and begin your healing journey.",
        "intentions": ["healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=4pLUleLdwY4",
        "thumbnail_url": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
        "duration": 900,
        "tags": ["grief", "healing", "loss", "meditation"],
        "reflection_prompts": {
            "before": "What emotions are you holding today?",
            "after": "What did you discover about your healing journey?"
        },
        "is_premium": False
    },
    {
        "title": "Deep Emotional Healing Meditation",
        "description": "Release emotional pain and find inner peace with this profound healing meditation. Let go of what no longer serves you.",
        "intentions": ["healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=aGVhir_UZqo",
        "thumbnail_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        "duration": 1200,
        "tags": ["emotional-healing", "release", "meditation"],
        "reflection_prompts": {
            "before": "What emotional weight are you ready to release?",
            "after": "How does your heart feel now?"
        },
        "is_premium": False
    },
    # RESILIENCE & STRENGTH
    {
        "title": "Building Resilience Through Mindfulness",
        "description": "A powerful 15-minute meditation to cultivate inner strength and resilience in challenging times.",
        "intentions": ["resilience"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=o0JqiLa8l_k",
        "thumbnail_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
        "duration": 900,
        "tags": ["resilience", "strength", "mindfulness"],
        "reflection_prompts": {
            "before": "What challenge are you facing?",
            "after": "What strength did you discover within?"
        },
        "is_premium": False
    },
    {
        "title": "Inner Strength Meditation - Find Your Power",
        "description": "Connect with your inner warrior. This meditation helps you tap into your innate strength and courage.",
        "intentions": ["resilience"],
        "format": "video",
        "media_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
        "duration": 540,
        "tags": ["inner-strength", "courage", "power"],
        "reflection_prompts": {
            "before": "Where do you need more strength?",
            "after": "How will you use this strength today?"
        },
        "is_premium": False
    },
    # LOVE & RELATIONSHIPS
    {
        "title": "Self-Love Meditation - Embrace Your Worth",
        "description": "Discover the power of self-love. This gentle meditation guides you to embrace your authentic self.",
        "intentions": ["love"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=itZMM5gCboo",
        "thumbnail_url": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800",
        "duration": 1020,
        "tags": ["self-love", "worth", "acceptance"],
        "reflection_prompts": {
            "before": "How do you show love to yourself?",
            "after": "What self-love practice resonated with you?"
        },
        "is_premium": False
    },
    {
        "title": "Heart Chakra Opening - Love & Compassion",
        "description": "Open your heart to give and receive love freely. A beautiful chakra meditation for emotional healing.",
        "intentions": ["love"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=z3OQTU8kRZA",
        "thumbnail_url": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800",
        "duration": 1200,
        "tags": ["heart-chakra", "love", "compassion"],
        "reflection_prompts": {
            "before": "What blocks your heart from opening?",
            "after": "How does your heart feel more open now?"
        },
        "is_premium": False
    },
    # MINDFULNESS & PEACE
    {
        "title": "10-Minute Mindfulness Meditation",
        "description": "A simple yet powerful mindfulness practice to bring you into the present moment and find peace.",
        "intentions": ["mindfulness"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=O-6f5wQXSu8",
        "thumbnail_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        "duration": 600,
        "tags": ["mindfulness", "peace", "present-moment"],
        "reflection_prompts": {
            "before": "How present do you feel right now?",
            "after": "What did you notice in the present moment?"
        },
        "is_premium": False
    },
    {
        "title": "Body Scan for Deep Relaxation",
        "description": "Release tension and find peace through this guided body scan meditation. Perfect for beginners.",
        "intentions": ["mindfulness"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=ihO02wUzgkc",
        "thumbnail_url": "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800",
        "duration": 1200,
        "tags": ["body-scan", "relaxation", "meditation"],
        "reflection_prompts": {
            "before": "Where do you hold tension in your body?",
            "after": "What areas feel more relaxed now?"
        },
        "is_premium": False
    },
    # GROWTH & TRANSFORMATION
    {
        "title": "Manifestation Meditation - Create Your Reality",
        "description": "Align with your highest potential. This meditation helps you manifest your dreams into reality.",
        "intentions": ["growth"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=pHecZeXF0D4",
        "thumbnail_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        "duration": 1320,
        "tags": ["manifestation", "growth", "transformation"],
        "reflection_prompts": {
            "before": "What do you want to manifest in your life?",
            "after": "What action will you take toward your vision?"
        },
        "is_premium": False
    },
    {
        "title": "Breaking Through Limiting Beliefs",
        "description": "Release the beliefs that hold you back. Transform your mindset and step into your power.",
        "intentions": ["growth"],
        "format": "video",
        "media_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "thumbnail_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
        "duration": 900,
        "tags": ["limiting-beliefs", "transformation", "mindset"],
        "reflection_prompts": {
            "before": "What belief is limiting you?",
            "after": "What new belief will you embrace?"
        },
        "is_premium": False
    },
    # JOY & GRATITUDE
    {
        "title": "Morning Gratitude Practice - Start Your Day Right",
        "description": "Begin your day with gratitude. This uplifting meditation sets a positive tone for your entire day.",
        "intentions": ["joy"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=iVI1Be7M_-w",
        "thumbnail_url": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800",
        "duration": 600,
        "tags": ["gratitude", "morning", "joy"],
        "reflection_prompts": {
            "before": "What are you grateful for today?",
            "after": "How did gratitude shift your perspective?"
        },
        "is_premium": False
    },
    {
        "title": "Cultivating Joy & Happiness",
        "description": "Tap into your inner joy. This meditation helps you reconnect with the happiness that is your birthright.",
        "intentions": ["joy"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=S4O5voOCqAQ",
        "thumbnail_url": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800",
        "duration": 900,
        "tags": ["joy", "happiness", "positive-energy"],
        "reflection_prompts": {
            "before": "When did you last feel truly joyful?",
            "after": "What brings joy to your heart?"
        },
        "is_premium": False
    },
]

async def seed_database():
    """Seed the database with sample data"""
    print("🌱 Starting database seeding...")
    
    await init_db()
    
    # Clear existing data
    await users_collection.delete_many({})
    await stories_collection.delete_many({})
    print("✅ Cleared existing data")
    
    # Create sample users
    users = [
        {
            "email": "explorer@ariome.app",
            "name": "Explorer User",
            "password_hash": get_password_hash("password123"),
            "role": UserRole.EXPLORER,
            "intentions": ["healing", "mindfulness"],
            "created_at": datetime.utcnow(),
            "is_verified": True
        },
        {
            "email": "creator@ariome.app",
            "name": "Dr. Sarah Williams",
            "password_hash": get_password_hash("password123"),
            "role": UserRole.CREATOR,
            "intentions": ["healing", "love"],
            "avatar": "https://i.pravatar.cc/150?img=1",
            "created_at": datetime.utcnow(),
            "is_verified": True
        },
        {
            "email": "admin@ariome.app",
            "name": "Admin User",
            "password_hash": get_password_hash("admin123"),
            "role": UserRole.ADMIN,
            "intentions": [],
            "created_at": datetime.utcnow(),
            "is_verified": True
        }
    ]
    
    user_ids = []
    for user in users:
        result = await users_collection.insert_one(user)
        user_ids.append(result.inserted_id)
    
    print(f"✅ Created {len(users)} users")
    
    # Create stories
    creator_id = str(user_ids[1])  # Creator user
    
    for story_data in SAMPLE_STORIES:
        story = {
            **story_data,
            "creator_id": creator_id,
            "creator_name": "Dr. Sarah Williams",
            "creator_avatar": "https://i.pravatar.cc/150?img=1",
            "creator_verified": True,
            "status": StoryStatus.PUBLISHED,
            "resonance_count": 0,
            "play_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await stories_collection.insert_one(story)
    
    print(f"✅ Created {len(SAMPLE_STORIES)} stories")
    
    # Print summary
    print("\n🎉 Database seeded successfully!")
    print("\n📊 Test Accounts:")
    print("  Explorer: explorer@ariome.app / password123")
    print("  Creator: creator@ariome.app / password123")
    print("  Admin: admin@ariome.app / admin123")
    print(f"\n📚 Stories: {len(SAMPLE_STORIES)} wellness meditations")
    print("\n✅ Backend ready at: http://localhost:8001")
    
    await close_db()

if __name__ == "__main__":
    asyncio.run(seed_database())
