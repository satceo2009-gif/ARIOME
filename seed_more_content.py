from pymongo import MongoClient
import os

client = MongoClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
db = client['test_database']

# Additional Wisdom content - 30 more items
additional_wisdom = [
    # Peaceful
    {"id": "wisdom_peaceful_2", "title": "Forest Meditation", "body": "Let the sounds of the forest guide you to inner peace. Nature's symphony awaits.", "author": "AriOme", "mood": "peaceful", "intent_tags": ["peaceful", "nature"], "media_type": "video", "media_url": "https://www.youtube.com/embed/eKFTSSKCzWA", "thumbnail": "https://img.youtube.com/vi/eKFTSSKCzWA/maxresdefault.jpg", "duration": 1800, "preview_duration": 20, "resonance_count": 156, "is_premium": True, "language": "en"},
    {"id": "wisdom_peaceful_3", "title": "Mountain Serenity", "body": "Find stillness at the peak. The mountain teaches patience and strength.", "author": "Eckhart Tolle", "mood": "peaceful", "intent_tags": ["peaceful", "stillness"], "media_type": "video", "media_url": "https://www.youtube.com/embed/FjHGZj2IjBk", "thumbnail": "https://img.youtube.com/vi/FjHGZj2IjBk/maxresdefault.jpg", "duration": 900, "preview_duration": 15, "resonance_count": 203, "is_premium": True, "language": "en"},
    {"id": "wisdom_peaceful_4", "title": "Gentle Rain Sounds", "body": "Let the rain wash away your worries. Each drop brings renewal.", "author": "AriOme", "mood": "peaceful", "intent_tags": ["peaceful", "rain"], "media_type": "audio", "media_url": "https://cdn.pixabay.com/audio/2022/03/09/audio_c9a30d1e47.mp3", "thumbnail": "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=800", "duration": 3600, "preview_duration": 30, "resonance_count": 445, "is_premium": False, "language": "en"},
    
    # Grateful
    {"id": "wisdom_grateful_3", "title": "Gratitude Meditation", "body": "Open your heart to the abundance that surrounds you.", "author": "Louise Hay", "mood": "grateful", "intent_tags": ["grateful", "abundance"], "media_type": "video", "media_url": "https://www.youtube.com/embed/T1l2gwNHG4s", "thumbnail": "https://img.youtube.com/vi/T1l2gwNHG4s/maxresdefault.jpg", "duration": 720, "preview_duration": 20, "resonance_count": 189, "is_premium": True, "language": "en"},
    {"id": "wisdom_grateful_4", "title": "Thank You Universe", "body": "Every moment is a gift waiting to be unwrapped with gratitude.", "author": "Deepak Chopra", "mood": "grateful", "intent_tags": ["grateful", "universe"], "media_type": "audio", "media_url": "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3", "thumbnail": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", "duration": 480, "preview_duration": 15, "resonance_count": 267, "is_premium": False, "language": "en"},
    
    # Hopeful
    {"id": "wisdom_hopeful_2", "title": "New Beginnings", "body": "Every sunrise brings the promise of a fresh start. Embrace the new day.", "author": "AriOme", "mood": "hopeful", "intent_tags": ["hopeful", "beginnings"], "media_type": "video", "media_url": "https://www.youtube.com/embed/lAIGb1lfpBw", "thumbnail": "https://img.youtube.com/vi/lAIGb1lfpBw/maxresdefault.jpg", "duration": 540, "preview_duration": 15, "resonance_count": 312, "is_premium": True, "language": "en"},
    {"id": "wisdom_hopeful_3", "title": "Light in Darkness", "body": "Even the darkest night will end. The dawn is always coming.", "author": "Thich Nhat Hanh", "mood": "hopeful", "intent_tags": ["hopeful", "light"], "media_type": "audio", "media_url": "https://cdn.pixabay.com/audio/2021/08/09/audio_dc39bde808.mp3", "thumbnail": "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800", "duration": 600, "preview_duration": 20, "resonance_count": 178, "is_premium": False, "language": "en"},
    {"id": "wisdom_hopeful_4", "title": "Wings of Tomorrow", "body": "Your dreams are seeds. Water them with hope and watch them bloom.", "author": "AriOme", "mood": "hopeful", "intent_tags": ["hopeful", "dreams"], "media_type": "video", "media_url": "https://www.youtube.com/embed/8ZcmTl_1ER8", "thumbnail": "https://img.youtube.com/vi/8ZcmTl_1ER8/maxresdefault.jpg", "duration": 780, "preview_duration": 20, "resonance_count": 234, "is_premium": True, "language": "en"},
    
    # Joyful
    {"id": "wisdom_joyful_3", "title": "Inner Child Dance", "body": "Remember the pure joy of childhood. That child still lives within you.", "author": "AriOme", "mood": "joyful", "intent_tags": ["joyful", "inner child"], "media_type": "video", "media_url": "https://www.youtube.com/embed/kPa7bsKwL-c", "thumbnail": "https://img.youtube.com/vi/kPa7bsKwL-c/maxresdefault.jpg", "duration": 420, "preview_duration": 15, "resonance_count": 289, "is_premium": False, "language": "en"},
    {"id": "wisdom_joyful_4", "title": "Celebration of Life", "body": "Every heartbeat is a celebration. Dance to the rhythm of your existence.", "author": "Sadhguru", "mood": "joyful", "intent_tags": ["joyful", "celebration"], "media_type": "audio", "media_url": "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3", "thumbnail": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800", "duration": 360, "preview_duration": 15, "resonance_count": 156, "is_premium": False, "language": "en"},
    
    # Reflective
    {"id": "wisdom_reflective_2", "title": "Mirror of the Soul", "body": "Look within and discover the infinite universe that resides in you.", "author": "Rumi", "mood": "reflective", "intent_tags": ["reflective", "soul"], "media_type": "video", "media_url": "https://www.youtube.com/embed/0swkaB0E_lA", "thumbnail": "https://img.youtube.com/vi/0swkaB0E_lA/maxresdefault.jpg", "duration": 660, "preview_duration": 20, "resonance_count": 378, "is_premium": True, "language": "en"},
    {"id": "wisdom_reflective_3", "title": "Wisdom of Silence", "body": "In silence, we hear the whispers of wisdom that noise drowns out.", "author": "AriOme", "mood": "reflective", "intent_tags": ["reflective", "silence"], "media_type": "audio", "media_url": "https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3", "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", "duration": 900, "preview_duration": 20, "resonance_count": 234, "is_premium": True, "language": "en"},
    {"id": "wisdom_reflective_4", "title": "Journey Inward", "body": "The longest journey is from head to heart. Take the first step today.", "author": "Thich Nhat Hanh", "mood": "reflective", "intent_tags": ["reflective", "journey"], "media_type": "video", "media_url": "https://www.youtube.com/embed/3nwwKbM_vJc", "thumbnail": "https://img.youtube.com/vi/3nwwKbM_vJc/maxresdefault.jpg", "duration": 720, "preview_duration": 20, "resonance_count": 445, "is_premium": True, "language": "en"},
    
    # Anxious (calming content)
    {"id": "wisdom_anxious_3", "title": "Safe Haven", "body": "Create a sanctuary within yourself. You are always safe in the present moment.", "author": "AriOme", "mood": "anxious", "intent_tags": ["anxious", "safety"], "media_type": "video", "media_url": "https://www.youtube.com/embed/lE6RYpe9IT0", "thumbnail": "https://img.youtube.com/vi/lE6RYpe9IT0/maxresdefault.jpg", "duration": 600, "preview_duration": 20, "resonance_count": 523, "is_premium": True, "language": "en"},
    {"id": "wisdom_anxious_4", "title": "Grounding Exercise", "body": "Feel your feet on the earth. You are supported by the ground beneath you.", "author": "AriOme", "mood": "anxious", "intent_tags": ["anxious", "grounding"], "media_type": "audio", "media_url": "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3", "thumbnail": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", "duration": 480, "preview_duration": 15, "resonance_count": 312, "is_premium": False, "language": "en"},
]

# Additional Practices - 20 more items
additional_practices = [
    # Breathwork
    {"id": "practice_breath_4", "title": "Alternate Nostril Breathing", "body": "Balance your energy channels with this ancient pranayama technique.", "category": "breathwork", "mood": "peaceful", "intent_tags": ["balance", "pranayama"], "media_type": "video", "media_url": "https://www.youtube.com/embed/8VwufJrUhic", "thumbnail": "https://img.youtube.com/vi/8VwufJrUhic/maxresdefault.jpg", "duration": 600, "preview_duration": 20, "is_premium": True, "language": "en"},
    {"id": "practice_breath_5", "title": "Breath of Fire", "body": "Energize your body and clear your mind with this powerful kundalini breath.", "category": "breathwork", "mood": "joyful", "intent_tags": ["energy", "kundalini"], "media_type": "video", "media_url": "https://www.youtube.com/embed/Z0jRVKBj6ks", "thumbnail": "https://img.youtube.com/vi/Z0jRVKBj6ks/maxresdefault.jpg", "duration": 480, "preview_duration": 15, "is_premium": True, "language": "en"},
    
    # Meditation
    {"id": "practice_meditation_3", "title": "Loving-Kindness Meditation", "body": "Cultivate compassion for yourself and all beings with metta meditation.", "category": "meditation", "mood": "grateful", "intent_tags": ["compassion", "metta"], "media_type": "video", "media_url": "https://www.youtube.com/embed/sz7cpV7ERsM", "thumbnail": "https://img.youtube.com/vi/sz7cpV7ERsM/maxresdefault.jpg", "duration": 900, "preview_duration": 20, "is_premium": True, "language": "en"},
    {"id": "practice_meditation_4", "title": "Walking Meditation", "body": "Transform ordinary walking into a profound mindfulness practice.", "category": "meditation", "mood": "peaceful", "intent_tags": ["walking", "mindfulness"], "media_type": "video", "media_url": "https://www.youtube.com/embed/HbvXwJU6BbE", "thumbnail": "https://img.youtube.com/vi/HbvXwJU6BbE/maxresdefault.jpg", "duration": 720, "preview_duration": 15, "is_premium": False, "language": "en"},
    {"id": "practice_meditation_5", "title": "Chakra Balancing", "body": "Align and balance your seven energy centers for optimal wellbeing.", "category": "meditation", "mood": "hopeful", "intent_tags": ["chakra", "energy"], "media_type": "video", "media_url": "https://www.youtube.com/embed/H2zGdOGDGHc", "thumbnail": "https://img.youtube.com/vi/H2zGdOGDGHc/maxresdefault.jpg", "duration": 1200, "preview_duration": 20, "is_premium": True, "language": "en"},
    
    # Yoga
    {"id": "practice_yoga_1", "title": "Morning Sun Salutation", "body": "Greet the day with this energizing sequence of yoga poses.", "category": "yoga", "mood": "hopeful", "intent_tags": ["morning", "surya namaskar"], "media_type": "video", "media_url": "https://www.youtube.com/embed/EC7RGJ975iM", "thumbnail": "https://img.youtube.com/vi/EC7RGJ975iM/maxresdefault.jpg", "duration": 900, "preview_duration": 20, "is_premium": True, "language": "en"},
    {"id": "practice_yoga_2", "title": "Evening Wind Down", "body": "Release the day's tension with these gentle restorative poses.", "category": "yoga", "mood": "peaceful", "intent_tags": ["evening", "restorative"], "media_type": "video", "media_url": "https://www.youtube.com/embed/v7AYKMP6rOE", "thumbnail": "https://img.youtube.com/vi/v7AYKMP6rOE/maxresdefault.jpg", "duration": 1200, "preview_duration": 20, "is_premium": True, "language": "en"},
    {"id": "practice_yoga_3", "title": "Yoga Nidra Sleep", "body": "Experience the deepest relaxation with yogic sleep meditation.", "category": "yoga", "mood": "anxious", "intent_tags": ["sleep", "nidra"], "media_type": "audio", "media_url": "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3", "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800", "duration": 2700, "preview_duration": 30, "is_premium": True, "language": "en"},
    
    # Sound Healing
    {"id": "practice_sound_1", "title": "Singing Bowl Healing", "body": "Let the harmonic vibrations of Tibetan bowls restore your balance.", "category": "sound healing", "mood": "peaceful", "intent_tags": ["singing bowls", "vibration"], "media_type": "audio", "media_url": "https://cdn.pixabay.com/audio/2022/04/27/audio_67236b5e80.mp3", "thumbnail": "https://images.unsplash.com/photo-1598618443855-232ee0f819f6?w=800", "duration": 1800, "preview_duration": 30, "is_premium": True, "language": "en"},
    {"id": "practice_sound_2", "title": "432Hz Healing Frequency", "body": "Tune into the frequency of the universe for deep cellular healing.", "category": "sound healing", "mood": "anxious", "intent_tags": ["frequency", "432hz"], "media_type": "audio", "media_url": "https://cdn.pixabay.com/audio/2022/09/07/audio_3a9cde0d87.mp3", "thumbnail": "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800", "duration": 3600, "preview_duration": 30, "is_premium": False, "language": "en"},
    {"id": "practice_sound_3", "title": "Om Chanting", "body": "Connect with the primordial sound of creation through sacred chanting.", "category": "sound healing", "mood": "reflective", "intent_tags": ["om", "chanting"], "media_type": "video", "media_url": "https://www.youtube.com/embed/IYyqTCKkTsE", "thumbnail": "https://img.youtube.com/vi/IYyqTCKkTsE/maxresdefault.jpg", "duration": 600, "preview_duration": 20, "is_premium": False, "language": "en"},
    
    # Journaling
    {"id": "practice_journal_1", "title": "Gratitude Journaling", "body": "A guided session to cultivate gratitude through reflective writing.", "category": "journaling", "mood": "grateful", "intent_tags": ["gratitude", "writing"], "media_type": "video", "media_url": "https://www.youtube.com/embed/JMd1CcGZYwU", "thumbnail": "https://img.youtube.com/vi/JMd1CcGZYwU/maxresdefault.jpg", "duration": 900, "preview_duration": 20, "is_premium": True, "language": "en"},
    {"id": "practice_journal_2", "title": "Shadow Work Prompts", "body": "Explore your hidden aspects with these powerful journaling prompts.", "category": "journaling", "mood": "reflective", "intent_tags": ["shadow work", "prompts"], "media_type": "video", "media_url": "https://www.youtube.com/embed/6PKW5u6J9Io", "thumbnail": "https://img.youtube.com/vi/6PKW5u6J9Io/maxresdefault.jpg", "duration": 720, "preview_duration": 15, "is_premium": True, "language": "en"},
]

# Insert wisdom
for item in additional_wisdom:
    db.wisdom.update_one({"id": item["id"]}, {"$set": item}, upsert=True)
    print(f"Added wisdom: {item['title']}")

# Insert practices  
for item in additional_practices:
    db.practices.update_one({"id": item["id"]}, {"$set": item}, upsert=True)
    print(f"Added practice: {item['title']}")

# Print totals
print(f"\nTotal Wisdom: {db.wisdom.count_documents({})}")
print(f"Total Practices: {db.practices.count_documents({})}")
print(f"Total Content: {db.wisdom.count_documents({}) + db.practices.count_documents({})}")
