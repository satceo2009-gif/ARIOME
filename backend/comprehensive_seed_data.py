"""
Comprehensive ARIOME Database Seeding Script
Creates 49 high-quality wellness stories (7 per intention × 7 intentions)
with real, resonating, non-copyright content
"""

import asyncio
from datetime import datetime
from database import init_db, stories_collection, users_collection
from bson import ObjectId

# Sample creator profiles
CREATORS = [
    {
        "_id": ObjectId(),
        "name": "Dr. Sarah Williams",
        "avatar": "https://i.pravatar.cc/150?img=1",
        "bio": "Grief counselor and mindfulness teacher with 15 years of experience",
        "verified": True
    },
    {
        "_id": ObjectId(),
        "name": "Marcus Chen",
        "avatar": "https://i.pravatar.cc/150?img=12",
        "bio": "Former athlete turned life coach, specializing in mental strength",
        "verified": True
    },
    {
        "_id": ObjectId(),
        "name": "Amara Patel",
        "avatar": "https://i.pravatar.cc/150?img=5",
        "bio": "Zen meditation teacher and consciousness explorer",
        "verified": True
    },
    {
        "_id": ObjectId(),
        "name": "Isabella Rodriguez",
        "avatar": "https://i.pravatar.cc/150?img=9",
        "bio": "Self-love advocate and relationship coach",
        "verified": True
    },
    {
        "_id": ObjectId(),
        "name": "David Thompson",
        "avatar": "https://i.pravatar.cc/150?img=14",
        "bio": "Positive psychology researcher and gratitude expert",
        "verified": True
    },
    {
        "_id": ObjectId(),
        "name": "Maya Johnson",
        "avatar": "https://i.pravatar.cc/150?img=10",
        "bio": "Life transformation coach and bestselling author",
        "verified": True
    },
    {
        "_id": ObjectId(),
        "name": "Dr. James Foster",
        "avatar": "https://i.pravatar.cc/150?img=8",
        "bio": "Clinical psychologist specializing in resilience and growth",
        "verified": True
    }
]

# 49 High-Quality Wellness Stories (7 per intention)
STORIES = [
    # ========== HEALING (7 stories) ==========
    {
        "title": "Guided Meditation for Healing After Loss",
        "description": "A compassionate 15-minute guided meditation to support you through grief and loss. Release emotional pain and find inner peace.",
        "intentions": ["healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=mLrEOdOoo6o",
        "thumbnail_url": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
        "duration": 900,
        "tags": ["grief", "healing", "loss", "emotional-healing"],
        "reflection_prompts": {
            "before": "What emotions are you holding today?",
            "after": "What did you discover about your healing journey?"
        },
        "is_premium": False,
        "creator_idx": 0
    },
    {
        "title": "Deep Healing Meditation for Letting Go",
        "description": "Gentle guided hypnosis to validate grief, reset your nervous system with compassion, and release emotional tension.",
        "intentions": ["healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=E-YYtWAzDiI",
        "thumbnail_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        "duration": 1200,
        "tags": ["healing", "letting-go", "grief", "hypnosis"],
        "reflection_prompts": {
            "before": "What are you ready to release?",
            "after": "How do you feel after letting go?"
        },
        "is_premium": False,
        "creator_idx": 0
    },
    {
        "title": "Emotional Healing Guided Meditation",
        "description": "Care for your heart with this meditation that guides you inward to a place of compassion, release, and renewal.",
        "intentions": ["healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=EjH--472C7A",
        "thumbnail_url": "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800",
        "duration": 1080,
        "tags": ["emotional-healing", "compassion", "renewal"],
        "reflection_prompts": {
            "before": "What part of your heart needs healing?",
            "after": "What shifted within you during this practice?"
        },
        "is_premium": False,
        "creator_idx": 1
    },
    {
        "title": "Healing Through Forgiveness Meditation",
        "description": "Release resentment and anger through the power of forgiveness. Find freedom and peace in your heart.",
        "intentions": ["healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=inpok4MKVLM",
        "thumbnail_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
        "duration": 960,
        "tags": ["forgiveness", "healing", "release", "peace"],
        "reflection_prompts": {
            "before": "Who or what do you need to forgive?",
            "after": "How does forgiveness feel in your body?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Inner Child Healing Meditation",
        "description": "Connect with and heal your inner child. Nurture the wounded parts of yourself with love and compassion.",
        "intentions": ["healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=lE38ONyzTLQ",
        "thumbnail_url": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800",
        "duration": 1140,
        "tags": ["inner-child", "healing", "compassion", "self-love"],
        "reflection_prompts": {
            "before": "What message does your inner child need to hear?",
            "after": "What did your inner child reveal to you?"
        },
        "is_premium": False,
        "creator_idx": 3
    },
    {
        "title": "Healing Trauma with Body Scan Meditation",
        "description": "Gentle body scan to release stored trauma and tension. Reconnect with your body in a safe, compassionate way.",
        "intentions": ["healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=BpA8aHzKllw",
        "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
        "duration": 1380,
        "tags": ["trauma", "body-scan", "healing", "safety"],
        "reflection_prompts": {
            "before": "Where do you feel tension in your body?",
            "after": "What sensations did you notice during the scan?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Healing Sleep Meditation - Let Go of the Day",
        "description": "Drift into deep, restorative sleep while releasing the day's burdens. Heal your mind and body as you rest.",
        "intentions": ["healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=CUIuS1xGKfU",
        "thumbnail_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800",
        "duration": 1800,
        "tags": ["sleep", "healing", "rest", "restoration"],
        "reflection_prompts": {
            "before": "What do you need to let go of before sleep?",
            "after": "How rested do you feel upon waking?"
        },
        "is_premium": True,
        "price": 2.99,
        "creator_idx": 5
    },

    # ========== RESILIENCE (7 stories) ==========
    {
        "title": "Build Resilience - 15 Minute Guided Meditation",
        "description": "Cultivate strength and flexibility to navigate life's challenges, bounce back from setbacks, and adapt to change.",
        "intentions": ["resilience"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=YX4EpMTcP4E",
        "thumbnail_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
        "duration": 927,
        "tags": ["resilience", "adaptability", "strength", "flexibility"],
        "reflection_prompts": {
            "before": "What challenge are you currently facing?",
            "after": "What strength did you discover within yourself?"
        },
        "is_premium": False,
        "creator_idx": 1
    },
    {
        "title": "You are Strong, You are Brave",
        "description": "Find courage, overcome fear, and recognize your inner strength. Affirmations and visualization to reinforce resilience.",
        "intentions": ["resilience"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=btaHbhUum1E",
        "thumbnail_url": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800",
        "duration": 840,
        "tags": ["courage", "strength", "resilience", "affirmations"],
        "reflection_prompts": {
            "before": "What makes you feel brave?",
            "after": "How can you carry this courage forward?"
        },
        "is_premium": False,
        "creator_idx": 6
    },
    {
        "title": "Meditation for Strength, Courage and Resilience",
        "description": "15-minute affirmation-based meditation to build inner strength, courage, and resilience for daily practice.",
        "intentions": ["resilience"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=oLIrW8DKUlI",
        "thumbnail_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        "duration": 901,
        "tags": ["strength", "courage", "resilience", "affirmations"],
        "reflection_prompts": {
            "before": "Where do you need more strength in your life?",
            "after": "What affirmation resonated most with you?"
        },
        "is_premium": False,
        "creator_idx": 6
    },
    {
        "title": "10 Minute Meditation for Resilience",
        "description": "Quick reset for building mental resilience, ideal for busy schedules. Focus on affirmations and grounding techniques.",
        "intentions": ["resilience"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=_v8MC8gT0ko",
        "thumbnail_url": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800",
        "duration": 600,
        "tags": ["resilience", "quick", "grounding", "reset"],
        "reflection_prompts": {
            "before": "What do you need to reset right now?",
            "after": "How do you feel after this quick reset?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Overcoming Adversity Through Mindfulness",
        "description": "Learn to meet challenges with mindful awareness. Build emotional flexibility and the ability to bounce back stronger.",
        "intentions": ["resilience"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=EWEg6n1mnrA",
        "thumbnail_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "duration": 1020,
        "tags": ["adversity", "mindfulness", "resilience", "flexibility"],
        "reflection_prompts": {
            "before": "What adversity are you currently facing?",
            "after": "What new perspective did you gain?"
        },
        "is_premium": False,
        "creator_idx": 1
    },
    {
        "title": "The Mountain of Strength - Grounding Meditation",
        "description": "Use the metaphor of a mountain to cultivate steadiness and calm amidst life's turbulence. Feel grounded and empowered.",
        "intentions": ["resilience"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=N3dXK4isU9U",
        "thumbnail_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "duration": 1080,
        "tags": ["grounding", "strength", "stability", "mountain"],
        "reflection_prompts": {
            "before": "When do you feel most grounded?",
            "after": "How can you embody mountain-like stability?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Building Mental Toughness - Warrior Meditation",
        "description": "Channel your inner warrior. Develop mental toughness and the resilience to face any challenge with confidence.",
        "intentions": ["resilience", "growth"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=3r0YscOXAlI",
        "thumbnail_url": "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800",
        "duration": 960,
        "tags": ["warrior", "mental-toughness", "resilience", "confidence"],
        "reflection_prompts": {
            "before": "What battle are you fighting within yourself?",
            "after": "What warrior qualities did you discover?"
        },
        "is_premium": True,
        "price": 3.99,
        "creator_idx": 1
    },

    # ========== LOVE (7 stories) ==========
    {
        "title": "Self-Love Meditation - Embrace Your Worth",
        "description": "Discover the power of self-love with this gentle 17-minute meditation. Cultivate deep acceptance and appreciation for yourself.",
        "intentions": ["love"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=itZMM5gCboo",
        "thumbnail_url": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800",
        "duration": 1020,
        "tags": ["self-love", "worth", "acceptance", "appreciation"],
        "reflection_prompts": {
            "before": "How do you currently show love to yourself?",
            "after": "What self-love practice will you commit to?"
        },
        "is_premium": False,
        "creator_idx": 3
    },
    {
        "title": "Loving-Kindness Meditation (Metta)",
        "description": "Traditional Buddhist practice of sending love and kindness to yourself and others. Open your heart to unconditional love.",
        "intentions": ["love"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=sz7cpV7ERsM",
        "thumbnail_url": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800",
        "duration": 1200,
        "tags": ["loving-kindness", "metta", "compassion", "love"],
        "reflection_prompts": {
            "before": "Who needs your loving-kindness today?",
            "after": "How did it feel to send love to others?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Heart Chakra Healing - Open to Love",
        "description": "Heal and open your heart chakra. Release blocks to giving and receiving love. Connect with your heart's wisdom.",
        "intentions": ["love", "healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=xks53KkW8ao",
        "thumbnail_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        "duration": 1140,
        "tags": ["heart-chakra", "love", "healing", "chakra"],
        "reflection_prompts": {
            "before": "What blocks your heart from fully opening?",
            "after": "What did your heart reveal to you?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Meditation for Attracting Love",
        "description": "Align your energy to attract the love you desire. Cultivate self-love and prepare your heart for a beautiful relationship.",
        "intentions": ["love"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=VpHz8Mb13_Y",
        "thumbnail_url": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800",
        "duration": 900,
        "tags": ["attract-love", "manifestation", "love", "relationships"],
        "reflection_prompts": {
            "before": "What qualities do you seek in a partner?",
            "after": "How can you embody the love you want to attract?"
        },
        "is_premium": False,
        "creator_idx": 3
    },
    {
        "title": "Compassion Meditation - Love for All Beings",
        "description": "Expand your capacity for compassion and love. Send healing energy to all beings, including yourself.",
        "intentions": ["love"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=tNDJKITApEI",
        "thumbnail_url": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800",
        "duration": 1020,
        "tags": ["compassion", "universal-love", "healing", "metta"],
        "reflection_prompts": {
            "before": "Who challenges your capacity for compassion?",
            "after": "How did extending compassion change your perspective?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Forgiving and Loving Your Past Self",
        "description": "Make peace with your past. Forgive yourself for past mistakes and embrace your journey with love and compassion.",
        "intentions": ["love", "healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=G1TD2uVdotM",
        "thumbnail_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
        "duration": 960,
        "tags": ["self-forgiveness", "love", "healing", "past"],
        "reflection_prompts": {
            "before": "What past version of yourself needs forgiveness?",
            "after": "What did you learn from forgiving yourself?"
        },
        "is_premium": False,
        "creator_idx": 3
    },
    {
        "title": "Twin Flame Love Meditation",
        "description": "Connect with your divine counterpart, whether present or yet to come. Heal and prepare for sacred union.",
        "intentions": ["love"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=y8KSid0WFwY",
        "thumbnail_url": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800",
        "duration": 1260,
        "tags": ["twin-flame", "soulmate", "love", "divine-union"],
        "reflection_prompts": {
            "before": "What does sacred partnership mean to you?",
            "after": "What message did you receive about love?"
        },
        "is_premium": True,
        "price": 4.99,
        "creator_idx": 5
    },

    # ========== MINDFULNESS (7 stories) ==========
    {
        "title": "10-Minute Mindfulness Meditation",
        "description": "A simple yet powerful mindfulness practice to bring you into the present moment. Perfect for beginners and daily practice.",
        "intentions": ["mindfulness"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=O-6f5wQXSu8",
        "thumbnail_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        "duration": 600,
        "tags": ["mindfulness", "present-moment", "beginner", "daily-practice"],
        "reflection_prompts": {
            "before": "How present do you feel right now?",
            "after": "What did you notice in the present moment?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Breath Awareness - Anchor to the Present",
        "description": "Use your breath as an anchor to the present moment. Develop deeper awareness and inner calm through breath meditation.",
        "intentions": ["mindfulness"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=lw8VgqHL8_8",
        "thumbnail_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "duration": 720,
        "tags": ["breath", "mindfulness", "awareness", "present"],
        "reflection_prompts": {
            "before": "How is your breath right now?",
            "after": "What changed when you focused on your breath?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Mindful Eating Meditation",
        "description": "Transform your relationship with food. Eat with full awareness, gratitude, and enjoyment. Nourish body and soul.",
        "intentions": ["mindfulness"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=tM8dWfvpUd0",
        "thumbnail_url": "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800",
        "duration": 840,
        "tags": ["mindful-eating", "awareness", "gratitude", "nourishment"],
        "reflection_prompts": {
            "before": "How do you typically eat your meals?",
            "after": "What did you notice about your food and body?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Body Scan for Deep Presence",
        "description": "Systematic journey through your body to develop mindful awareness. Notice sensations without judgment.",
        "intentions": ["mindfulness"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=BpA8aHzKllw",
        "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
        "duration": 1200,
        "tags": ["body-scan", "mindfulness", "awareness", "presence"],
        "reflection_prompts": {
            "before": "Where is your attention drawn in your body?",
            "after": "What sensations surprised you?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Mindful Walking Meditation",
        "description": "Transform ordinary walking into a powerful mindfulness practice. Connect with each step and the earth beneath you.",
        "intentions": ["mindfulness"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=uTN29kj7e-w",
        "thumbnail_url": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800",
        "duration": 900,
        "tags": ["walking", "mindfulness", "movement", "nature"],
        "reflection_prompts": {
            "before": "How do you typically walk?",
            "after": "What did you notice about your walking?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Mindfulness of Thoughts - Observing the Mind",
        "description": "Watch your thoughts like clouds passing by. Develop non-reactive awareness and mental spaciousness.",
        "intentions": ["mindfulness"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=mZxcw2rPWxU",
        "thumbnail_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        "duration": 1080,
        "tags": ["thoughts", "mindfulness", "observation", "awareness"],
        "reflection_prompts": {
            "before": "What's the quality of your thoughts right now?",
            "after": "What did you learn about your thinking patterns?"
        },
        "is_premium": False,
        "creator_idx": 2
    },
    {
        "title": "Advanced Vipassana - Insight Meditation",
        "description": "Deep insight meditation to see the true nature of reality. Develop profound wisdom through sustained mindfulness.",
        "intentions": ["mindfulness", "growth"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=z3DkpMdlJUU",
        "thumbnail_url": "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800",
        "duration": 1800,
        "tags": ["vipassana", "insight", "advanced", "wisdom"],
        "reflection_prompts": {
            "before": "What truth are you seeking?",
            "after": "What insight arose during your practice?"
        },
        "is_premium": True,
        "price": 5.99,
        "creator_idx": 2
    },

    # ========== GROWTH (7 stories) ==========
    {
        "title": "Manifestation Meditation - Create Your Reality",
        "description": "Align with your highest potential and manifest your dreams into reality. Powerful visualization and affirmation practice.",
        "intentions": ["growth"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=pHecZeXF0D4",
        "thumbnail_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        "duration": 1320,
        "tags": ["manifestation", "growth", "transformation", "visualization"],
        "reflection_prompts": {
            "before": "What do you want to manifest in your life?",
            "after": "What action will you take toward your vision?"
        },
        "is_premium": False,
        "creator_idx": 5
    },
    {
        "title": "Releasing Limiting Beliefs",
        "description": "Identify and release the beliefs that hold you back. Step into your power and embrace unlimited possibilities.",
        "intentions": ["growth"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=xks53KkW8ao",
        "thumbnail_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
        "duration": 1080,
        "tags": ["limiting-beliefs", "growth", "empowerment", "transformation"],
        "reflection_prompts": {
            "before": "What belief is limiting you?",
            "after": "What new belief will you adopt?"
        },
        "is_premium": False,
        "creator_idx": 5
    },
    {
        "title": "Abundance Mindset Meditation",
        "description": "Shift from scarcity to abundance. Open yourself to receive all the prosperity and opportunities life has to offer.",
        "intentions": ["growth"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=gF8uzDcbXj4",
        "thumbnail_url": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
        "duration": 960,
        "tags": ["abundance", "prosperity", "growth", "mindset"],
        "reflection_prompts": {
            "before": "Where do you feel scarcity in your life?",
            "after": "What abundance did you become aware of?"
        },
        "is_premium": False,
        "creator_idx": 5
    },
    {
        "title": "Embracing Change and Transformation",
        "description": "Navigate life transitions with grace. Embrace change as an opportunity for growth and evolution.",
        "intentions": ["growth", "resilience"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=izlfIt5O6hM",
        "thumbnail_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "duration": 1140,
        "tags": ["change", "transformation", "growth", "transition"],
        "reflection_prompts": {
            "before": "What change are you resisting?",
            "after": "How can you embrace this change as growth?"
        },
        "is_premium": False,
        "creator_idx": 6
    },
    {
        "title": "Discovering Your Life Purpose",
        "description": "Connect with your deeper purpose and calling. Gain clarity on your unique path and contribution to the world.",
        "intentions": ["growth"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=yXDr8NJ2THs",
        "thumbnail_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        "duration": 1260,
        "tags": ["purpose", "calling", "growth", "clarity"],
        "reflection_prompts": {
            "before": "What gives your life meaning?",
            "after": "What step toward your purpose will you take?"
        },
        "is_premium": False,
        "creator_idx": 5
    },
    {
        "title": "Quantum Leap Meditation - Breakthrough",
        "description": "Make a quantum leap in your personal evolution. Break through old patterns and step into a new version of yourself.",
        "intentions": ["growth"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=G1TD2uVdotM",
        "thumbnail_url": "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800",
        "duration": 1380,
        "tags": ["quantum-leap", "breakthrough", "transformation", "growth"],
        "reflection_prompts": {
            "before": "What old pattern are you ready to release?",
            "after": "What new version of yourself did you glimpse?"
        },
        "is_premium": True,
        "price": 6.99,
        "creator_idx": 5
    },
    {
        "title": "Shadow Work - Integrating Your Whole Self",
        "description": "Explore your shadow self with compassion. Integrate disowned parts of yourself for wholeness and authentic power.",
        "intentions": ["growth", "healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=lE38ONyzTLQ",
        "thumbnail_url": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800",
        "duration": 1500,
        "tags": ["shadow-work", "integration", "growth", "authenticity"],
        "reflection_prompts": {
            "before": "What part of yourself do you reject?",
            "after": "What gift did your shadow reveal?"
        },
        "is_premium": True,
        "price": 4.99,
        "creator_idx": 6
    },

    # ========== JOY (7 stories) ==========
    {
        "title": "Morning Gratitude Practice - Start Your Day Right",
        "description": "Begin your day with gratitude. This uplifting meditation sets a positive tone for your entire day.",
        "intentions": ["joy"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=iVI1Be7M_-w",
        "thumbnail_url": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800",
        "duration": 600,
        "tags": ["gratitude", "morning", "joy", "positivity"],
        "reflection_prompts": {
            "before": "What are you grateful for today?",
            "after": "How did gratitude shift your perspective?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Cultivating Joy & Happiness",
        "description": "Tap into your inner joy. This meditation helps you reconnect with the happiness that is your birthright.",
        "intentions": ["joy"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=S4O5voOCqAQ",
        "thumbnail_url": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800",
        "duration": 900,
        "tags": ["joy", "happiness", "positive-energy", "uplift"],
        "reflection_prompts": {
            "before": "When did you last feel truly joyful?",
            "after": "What brings joy to your heart?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Laughter Meditation - Joyful Playfulness",
        "description": "Release stress through laughter. Reconnect with your inner child and the simple joy of being alive.",
        "intentions": ["joy"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=inpok4MKVLM",
        "thumbnail_url": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800",
        "duration": 780,
        "tags": ["laughter", "playfulness", "joy", "stress-relief"],
        "reflection_prompts": {
            "before": "When was the last time you laughed freely?",
            "after": "How does your body feel after laughing?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Appreciation Meditation - Counting Your Blessings",
        "description": "Count your blessings one by one. Cultivate deep appreciation for all that you have and all that you are.",
        "intentions": ["joy", "gratitude"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=tM8dWfvpUd0",
        "thumbnail_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
        "duration": 840,
        "tags": ["appreciation", "blessings", "gratitude", "joy"],
        "reflection_prompts": {
            "before": "What blessings do you take for granted?",
            "after": "What blessing touched your heart most?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Dancing Energy Meditation",
        "description": "Move your body, free your spirit. Experience joy through movement and let your energy flow freely.",
        "intentions": ["joy"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=VpHz8Mb13_Y",
        "thumbnail_url": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800",
        "duration": 1020,
        "tags": ["dancing", "movement", "joy", "energy"],
        "reflection_prompts": {
            "before": "How does your body want to move?",
            "after": "What did you discover through movement?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Sunset Gratitude - Ending the Day with Joy",
        "description": "Reflect on your day with gratitude. Release what no longer serves and end your day with peace and joy.",
        "intentions": ["joy", "gratitude"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=CUIuS1xGKfU",
        "thumbnail_url": "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800",
        "duration": 900,
        "tags": ["sunset", "gratitude", "joy", "reflection"],
        "reflection_prompts": {
            "before": "What brought you joy today?",
            "after": "What will you carry into tomorrow?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Bliss Meditation - Pure Ecstatic Joy",
        "description": "Experience states of bliss and ecstasy. Connect with the pure joy that exists beyond circumstances.",
        "intentions": ["joy"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=G1TD2uVdotM",
        "thumbnail_url": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
        "duration": 1440,
        "tags": ["bliss", "ecstasy", "joy", "transcendence"],
        "reflection_prompts": {
            "before": "What is your highest vision of joy?",
            "after": "What glimpse of bliss did you experience?"
        },
        "is_premium": True,
        "price": 7.99,
        "creator_idx": 4
    },

    # ========== GRATITUDE (7 stories) ==========
    {
        "title": "Simple Gratitude Practice - 5 Minutes",
        "description": "Quick, powerful gratitude practice for busy lives. Transform your mindset in just 5 minutes.",
        "intentions": ["gratitude"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=inpok4MKVLM",
        "thumbnail_url": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800",
        "duration": 300,
        "tags": ["gratitude", "quick", "simple", "daily"],
        "reflection_prompts": {
            "before": "What's one thing you're grateful for right now?",
            "after": "How did gratitude change your mood?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Gratitude for Your Body",
        "description": "Appreciate your miraculous body. Thank each part for its service and care for yourself with gratitude.",
        "intentions": ["gratitude"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=BpA8aHzKllw",
        "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
        "duration": 720,
        "tags": ["gratitude", "body", "appreciation", "self-care"],
        "reflection_prompts": {
            "before": "How do you feel about your body?",
            "after": "What part of your body deserves more gratitude?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Gratitude for Challenges - Finding the Gift",
        "description": "Discover gratitude even in difficult times. Find the hidden gifts in your challenges and grow through adversity.",
        "intentions": ["gratitude", "growth"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=izlfIt5O6hM",
        "thumbnail_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "duration": 960,
        "tags": ["gratitude", "challenges", "growth", "perspective"],
        "reflection_prompts": {
            "before": "What challenge can you find gratitude for?",
            "after": "What gift did you discover in your challenge?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Gratitude for Relationships",
        "description": "Honor the people in your life. Express gratitude for the love, lessons, and connections you've been given.",
        "intentions": ["gratitude", "love"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=tM8dWfvpUd0",
        "thumbnail_url": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800",
        "duration": 900,
        "tags": ["gratitude", "relationships", "love", "connection"],
        "reflection_prompts": {
            "before": "Who are you most grateful for?",
            "after": "How will you express your gratitude to them?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Nature Gratitude Meditation",
        "description": "Connect with the Earth and express gratitude for nature's gifts. Feel your belonging to the web of life.",
        "intentions": ["gratitude"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=uTN29kj7e-w",
        "thumbnail_url": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800",
        "duration": 1080,
        "tags": ["gratitude", "nature", "earth", "connection"],
        "reflection_prompts": {
            "before": "How do you feel about nature?",
            "after": "What gift from nature touched you most?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Gratitude Journal Meditation",
        "description": "Combine meditation with journaling. Deepen your gratitude practice through reflection and writing.",
        "intentions": ["gratitude"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=S4O5voOCqAQ",
        "thumbnail_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
        "duration": 1200,
        "tags": ["gratitude", "journaling", "reflection", "writing"],
        "reflection_prompts": {
            "before": "What will you write in your gratitude journal?",
            "after": "What pattern of blessings did you notice?"
        },
        "is_premium": False,
        "creator_idx": 4
    },
    {
        "title": "Deep Gratitude - Life Review Meditation",
        "description": "Review your entire life with gratitude. See the perfection in your journey and thank every moment.",
        "intentions": ["gratitude", "healing"],
        "format": "audio",
        "media_url": "https://www.youtube.com/watch?v=lE38ONyzTLQ",
        "thumbnail_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
        "duration": 1680,
        "tags": ["gratitude", "life-review", "healing", "reflection"],
        "reflection_prompts": {
            "before": "What chapter of your life needs gratitude?",
            "after": "What did you learn from reviewing your life?"
        },
        "is_premium": True,
        "price": 3.99,
        "creator_idx": 4
    },
]


async def seed_database():
    """Seed database with high-quality wellness content"""
    await init_db()
    
    print("🌱 Starting comprehensive database seeding...")
    
    # Clear existing stories
    await stories_collection.delete_many({})
    print("✅ Cleared existing stories")
    
    # Create stories
    for story_data in STORIES:
        creator = CREATORS[story_data.pop("creator_idx")]
        
        story_doc = {
            **story_data,
            "creator_id": str(creator["_id"]),
            "creator_name": creator["name"],
            "creator_avatar": creator["avatar"],
            "creator_bio": creator["bio"],
            "creator_verified": creator["verified"],
            "status": "published",
            "resonance_count": 0,
            "play_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await stories_collection.insert_one(story_doc)
    
    print(f"✅ Created {len(STORIES)} high-quality stories")
    print(f"   - Healing: 7 stories")
    print(f"   - Resilience: 7 stories")
    print(f"   - Love: 7 stories")
    print(f"   - Mindfulness: 7 stories")
    print(f"   - Growth: 7 stories")
    print(f"   - Joy: 7 stories")
    print(f"   - Gratitude: 7 stories")
    print("✅ Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_database())
