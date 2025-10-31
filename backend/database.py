from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ariome_db

# Collections
users_collection = db.users
stories_collection = db.stories
subscriptions_collection = db.subscriptions
circles_collection = db.circles
reflections_collection = db.reflections
transactions_collection = db.transactions
creator_profiles_collection = db.creator_profiles
admin_logs_collection = db.admin_logs
circle_posts_collection = db.circle_posts
journal_entries_collection = db.journal_entries

async def init_db():
    """Initialize database with indexes and constraints"""
    
    # Users collection indexes
    await users_collection.create_index([("email", ASCENDING)], unique=True)
    await users_collection.create_index([("role", ASCENDING)])
    await users_collection.create_index([("created_at", DESCENDING)])
    
    # Stories collection indexes
    await stories_collection.create_index([("creator_id", ASCENDING)])
    await stories_collection.create_index([("status", ASCENDING)])
    await stories_collection.create_index([("intentions", ASCENDING)])
    await stories_collection.create_index([("created_at", DESCENDING)])
    await stories_collection.create_index([("resonance_count", DESCENDING)])
    
    # Subscriptions collection indexes
    await subscriptions_collection.create_index([("user_id", ASCENDING)])
    await subscriptions_collection.create_index([("creator_id", ASCENDING)])
    await subscriptions_collection.create_index([("status", ASCENDING)])
    await subscriptions_collection.create_index([("expires_at", ASCENDING)])
    
    # Circles collection indexes
    await circles_collection.create_index([("members", ASCENDING)])
    await circles_collection.create_index([("created_at", DESCENDING)])
    
    # Reflections collection indexes
    await reflections_collection.create_index([("user_id", ASCENDING)])
    await reflections_collection.create_index([("story_id", ASCENDING)])
    await reflections_collection.create_index([("created_at", DESCENDING)])
    
    # Transactions collection indexes
    await transactions_collection.create_index([("user_id", ASCENDING)])
    await transactions_collection.create_index([("creator_id", ASCENDING)])
    await transactions_collection.create_index([("type", ASCENDING)])
    await transactions_collection.create_index([("created_at", DESCENDING)])
    
    # Creator profiles indexes
    await creator_profiles_collection.create_index([("user_id", ASCENDING)], unique=True)
    await creator_profiles_collection.create_index([("verification_status", ASCENDING)])
    
    # Circle posts indexes
    await circle_posts_collection.create_index([("circle_id", ASCENDING)])
    await circle_posts_collection.create_index([("created_at", DESCENDING)])
    
    # Journal entries indexes
    await journal_entries_collection.create_index([("user_id", ASCENDING)])
    await journal_entries_collection.create_index([("created_at", DESCENDING)])
    
    print("✅ Database indexes created successfully")

async def close_db():
    """Close database connection"""
    client.close()
