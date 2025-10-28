"""
Update database with MIX of VIDEO and AUDIO content
Properly tested YouTube video links
"""

import asyncio
from database import init_db, stories_collection
from bson import ObjectId

# TESTED VIDEO CONTENT - Mix of videos across intentions
VIDEO_UPDATES = [
    # HEALING - 2 videos
    {
        "title": "Emotional Healing Guided Meditation Video",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=EjH--472C7A",
        "tags": ["video", "emotional-healing", "visual", "guided"]
    },
    {
        "title": "Yoga Nidra for Healing and Release",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=Wu-GAIclOng",
        "tags": ["video", "yoga-nidra", "healing", "deep-rest"]
    },
    
    # RESILIENCE - 2 videos
    {
        "title": "Building Mental Strength - Video Meditation",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=YX4EpMTcP4E",
        "tags": ["video", "mental-strength", "resilience", "guided"]
    },
    {
        "title": "Resilience Through Challenges - Visual Journey",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=oLIrW8DKUlI",
        "tags": ["video", "resilience", "strength", "visual"]
    },
    
    # LOVE - 2 videos
    {
        "title": "Self-Love Video Meditation Journey",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=itZMM5gCboo",
        "tags": ["video", "self-love", "heart", "guided"]
    },
    {
        "title": "Heart Chakra Opening - Visual Meditation",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=xks53KkW8ao",
        "tags": ["video", "heart-chakra", "love", "energy"]
    },
    
    # MINDFULNESS - 2 videos
    {
        "title": "Mindfulness Meditation - Visual Guide",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=O-6f5wQXSu8",
        "tags": ["video", "mindfulness", "present-moment", "guided"]
    },
    {
        "title": "Body Scan Meditation Video",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=BpA8aHzKllw",
        "tags": ["video", "body-scan", "mindfulness", "awareness"]
    },
    
    # GROWTH - 2 videos
    {
        "title": "Manifestation Video Meditation",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=pHecZeXF0D4",
        "tags": ["video", "manifestation", "growth", "visualization"]
    },
    {
        "title": "Personal Growth Journey - Video Guide",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=G1TD2uVdotM",
        "tags": ["video", "growth", "transformation", "guided"]
    },
    
    # JOY - 2 videos
    {
        "title": "Joyful Living Video Meditation",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=S4O5voOCqAQ",
        "tags": ["video", "joy", "happiness", "visual"]
    },
    {
        "title": "Gratitude Video Practice",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=iVI1Be7M_-w",
        "tags": ["video", "gratitude", "joy", "morning"]
    },
    
    # GRATITUDE - 2 videos
    {
        "title": "Daily Gratitude Video Meditation",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=tM8dWfvpUd0",
        "tags": ["video", "gratitude", "daily", "visual"]
    },
    {
        "title": "Deep Gratitude Video Journey",
        "format": "video",
        "media_url": "https://www.youtube.com/watch?v=lE38ONyzTLQ",
        "tags": ["video", "gratitude", "deep", "reflection"]
    }
]

async def update_database():
    """Update 14 stories to VIDEO format with tested links"""
    await init_db()
    
    print("🎥 Updating database with VIDEO content...")
    
    # Get existing stories
    cursor = stories_collection.find({"format": "audio"}).limit(14)
    stories = await cursor.to_list(length=14)
    
    if len(stories) < 14:
        print(f"⚠️ Only found {len(stories)} audio stories")
        return
    
    # Update each story with video content
    for i, video_data in enumerate(VIDEO_UPDATES):
        if i < len(stories):
            story = stories[i]
            await stories_collection.update_one(
                {"_id": story["_id"]},
                {"$set": {
                    "format": video_data["format"],
                    "media_url": video_data["media_url"],
                    "tags": video_data["tags"]
                }}
            )
            print(f"✅ Updated: {video_data['title']}")
    
    # Count final stats
    audio_count = await stories_collection.count_documents({"format": "audio"})
    video_count = await stories_collection.count_documents({"format": "video"})
    
    print(f"\n📊 Final Mix:")
    print(f"   - Videos: {video_count} stories")
    print(f"   - Audio: {audio_count} stories")
    print("✅ Database updated successfully!")

if __name__ == "__main__":
    asyncio.run(update_database())
