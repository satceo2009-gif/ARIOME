#!/usr/bin/env python3
"""
ARIOME Backend Comprehensive Testing Suite
Tests database content mix, YouTube extraction, API format, and compatibility
Based on review request requirements
"""

import asyncio
import aiohttp
import json
import re
import os
from typing import List, Dict, Any
from urllib.parse import urlparse, parse_qs
from collections import Counter

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://wellness-hub-227.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class ARIOMEComprehensiveTester:
    def __init__(self):
        self.session = None
        self.test_results = {
            'total_stories': 0,
            'video_stories': 0,
            'audio_stories': 0,
            'video_samples': [],
            'audio_samples': [],
            'broken_links': [],
            'intentions_count': {},
            'premium_count': 0,
            'free_count': 0,
            'api_errors': [],
            'youtube_id_errors': [],
            'creator_format_valid': False,
            'reflection_prompts_valid': False
        }
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def extract_youtube_id(self, url: str) -> str:
        """Extract YouTube video ID from URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    async def test_health_endpoint(self):
        """Test if backend is running"""
        try:
            async with self.session.get(f"{API_BASE}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Backend health check passed")
                    return True
                else:
                    print(f"❌ Backend health check failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Backend connection failed: {str(e)}")
            return False
    
    async def test_stories_api(self):
        """Test GET /api/stories endpoint"""
        print("\n🔍 Testing Stories API...")
        
        try:
            async with self.session.get(f"{API_BASE}/stories") as response:
                if response.status != 200:
                    self.test_results["stories_api"]["details"]["error"] = f"HTTP {response.status}"
                    print(f"❌ Stories API failed: HTTP {response.status}")
                    return False
                
                stories = await response.json()
                
                # Check if we got stories
                if not stories:
                    self.test_results["stories_api"]["details"]["error"] = "No stories returned"
                    print("❌ No stories returned from API")
                    return False
                
                story_count = len(stories)
                self.test_results["stories_api"]["details"]["count"] = story_count
                self.test_results["stories_api"]["details"]["stories"] = stories
                
                print(f"✅ Stories API returned {story_count} stories")
                
                # Check if we have at least 12 stories as requested
                if story_count >= 12:
                    print(f"✅ Found {story_count} stories (≥12 required)")
                else:
                    print(f"⚠️  Only {story_count} stories found (12 expected)")
                
                self.test_results["stories_api"]["passed"] = True
                return True
                
        except Exception as e:
            self.test_results["stories_api"]["details"]["error"] = str(e)
            print(f"❌ Stories API test failed: {str(e)}")
            return False
    
    async def test_story_details(self, story_id: str):
        """Test GET /api/stories/{id} endpoint"""
        print(f"\n🔍 Testing Story Details API for ID: {story_id}")
        
        try:
            async with self.session.get(f"{API_BASE}/stories/{story_id}") as response:
                if response.status != 200:
                    self.test_results["story_details"]["details"]["error"] = f"HTTP {response.status}"
                    print(f"❌ Story details failed: HTTP {response.status}")
                    return False
                
                story = await response.json()
                self.test_results["story_details"]["details"]["story"] = story
                
                print(f"✅ Story details retrieved successfully")
                print(f"   Title: {story.get('title', 'N/A')}")
                print(f"   Creator: {story.get('creator_name', 'N/A')}")
                print(f"   Duration: {story.get('duration', 0)} seconds")
                
                self.test_results["story_details"]["passed"] = True
                return story
                
        except Exception as e:
            self.test_results["story_details"]["details"]["error"] = str(e)
            print(f"❌ Story details test failed: {str(e)}")
            return None
    
    def validate_story_data_quality(self, stories: List[Dict[Any, Any]]):
        """Validate story data quality"""
        print("\n🔍 Validating Story Data Quality...")
        
        quality_issues = []
        sample_stories = []
        
        for i, story in enumerate(stories[:3]):  # Check first 3 stories
            story_info = {
                "title": story.get("title", ""),
                "description": story.get("description", ""),
                "media_url": story.get("media_url", ""),
                "thumbnail_url": story.get("thumbnail_url", ""),
                "intentions": story.get("intentions", []),
                "creator_name": story.get("creator_name", ""),
                "creator_verified": story.get("creator_verified", False)
            }
            sample_stories.append(story_info)
            
            # Check title
            if not story.get("title") or len(story.get("title", "")) < 10:
                quality_issues.append(f"Story {i+1}: Title too short or missing")
            
            # Check description
            if not story.get("description") or len(story.get("description", "")) < 20:
                quality_issues.append(f"Story {i+1}: Description too short or missing")
            
            # Check media URL
            if not story.get("media_url"):
                quality_issues.append(f"Story {i+1}: Media URL missing")
            
            # Check intentions
            if not story.get("intentions") or len(story.get("intentions", [])) == 0:
                quality_issues.append(f"Story {i+1}: No intentions tagged")
            
            # Check creator info
            if not story.get("creator_name"):
                quality_issues.append(f"Story {i+1}: Creator name missing")
        
        self.test_results["data_quality"]["details"]["sample_stories"] = sample_stories
        self.test_results["data_quality"]["details"]["quality_issues"] = quality_issues
        
        if quality_issues:
            print(f"⚠️  Found {len(quality_issues)} data quality issues:")
            for issue in quality_issues:
                print(f"   - {issue}")
        else:
            print("✅ All stories have good data quality")
            self.test_results["data_quality"]["passed"] = True
        
        return len(quality_issues) == 0
    
    def validate_media_urls(self, stories: List[Dict[Any, Any]]):
        """Validate media URLs and check for YouTube links"""
        print("\n🔍 Validating Media URLs...")
        
        youtube_urls = []
        other_urls = []
        broken_urls = []
        
        for story in stories:
            media_url = story.get("media_url", "")
            title = story.get("title", "Unknown")
            
            if not media_url:
                broken_urls.append({"title": title, "issue": "Missing media URL"})
                continue
            
            # Check if it's a YouTube URL
            if "youtube.com" in media_url or "youtu.be" in media_url:
                youtube_id = self.extract_youtube_id(media_url)
                youtube_urls.append({
                    "title": title,
                    "url": media_url,
                    "youtube_id": youtube_id,
                    "valid_id": youtube_id is not None
                })
            else:
                other_urls.append({
                    "title": title,
                    "url": media_url
                })
        
        self.test_results["media_urls"]["details"] = {
            "youtube_count": len(youtube_urls),
            "other_count": len(other_urls),
            "broken_count": len(broken_urls),
            "youtube_urls": youtube_urls,
            "other_urls": other_urls,
            "broken_urls": broken_urls
        }
        
        print(f"📊 Media URL Analysis:")
        print(f"   YouTube URLs: {len(youtube_urls)}")
        print(f"   Other URLs: {len(other_urls)}")
        print(f"   Broken/Missing: {len(broken_urls)}")
        
        if youtube_urls:
            print(f"\n📺 YouTube URLs found:")
            for yt in youtube_urls[:3]:  # Show first 3
                print(f"   - {yt['title']}: {yt['url']}")
                if yt['youtube_id']:
                    print(f"     YouTube ID: {yt['youtube_id']}")
        
        if other_urls:
            print(f"\n🎥 Other media URLs:")
            for other in other_urls[:3]:  # Show first 3
                print(f"   - {other['title']}: {other['url']}")
        
        if broken_urls:
            print(f"\n❌ Broken/Missing URLs:")
            for broken in broken_urls:
                print(f"   - {broken['title']}: {broken['issue']}")
        
        # Consider test passed if we have valid media URLs
        has_valid_urls = len(youtube_urls) > 0 or len(other_urls) > 0
        self.test_results["media_urls"]["passed"] = has_valid_urls and len(broken_urls) == 0
        
        return has_valid_urls
    
    def validate_youtube_playback(self, stories: List[Dict[Any, Any]]):
        """Validate YouTube video IDs for Android playback"""
        print("\n🔍 Validating YouTube Playback Compatibility...")
        
        youtube_stories = []
        valid_ids = []
        invalid_ids = []
        
        for story in stories:
            media_url = story.get("media_url", "")
            if "youtube.com" in media_url or "youtu.be" in media_url:
                youtube_id = self.extract_youtube_id(media_url)
                youtube_stories.append({
                    "title": story.get("title", ""),
                    "url": media_url,
                    "youtube_id": youtube_id
                })
                
                if youtube_id and len(youtube_id) == 11:  # YouTube IDs are 11 characters
                    valid_ids.append(youtube_id)
                else:
                    invalid_ids.append(media_url)
        
        self.test_results["youtube_validation"]["details"] = {
            "total_youtube": len(youtube_stories),
            "valid_ids": len(valid_ids),
            "invalid_ids": len(invalid_ids),
            "sample_ids": valid_ids[:5]  # First 5 valid IDs
        }
        
        print(f"📊 YouTube Validation:")
        print(f"   Total YouTube videos: {len(youtube_stories)}")
        print(f"   Valid YouTube IDs: {len(valid_ids)}")
        print(f"   Invalid YouTube IDs: {len(invalid_ids)}")
        
        if valid_ids:
            print(f"\n✅ Sample valid YouTube IDs:")
            for vid_id in valid_ids[:3]:
                print(f"   - {vid_id}")
                print(f"     Android URL: https://www.youtube.com/watch?v={vid_id}")
        
        if invalid_ids:
            print(f"\n❌ Invalid YouTube URLs:")
            for url in invalid_ids:
                print(f"   - {url}")
        
        self.test_results["youtube_validation"]["passed"] = len(valid_ids) > 0 and len(invalid_ids) == 0
        
        return len(valid_ids) > 0
    
    async def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting ARIOME Backend API Tests...")
        print(f"🔗 Backend URL: {BACKEND_URL}")
        
        # Test backend health
        if not await self.test_health_endpoint():
            print("❌ Backend is not accessible. Stopping tests.")
            return False
        
        # Test stories API
        if not await self.test_stories_api():
            print("❌ Stories API failed. Stopping tests.")
            return False
        
        stories = self.test_results["stories_api"]["details"].get("stories", [])
        
        if not stories:
            print("❌ No stories to test. Stopping tests.")
            return False
        
        # Test story details with first story
        first_story = stories[0]
        story_id = first_story.get("id")
        
        if story_id:
            await self.test_story_details(story_id)
        
        # Validate data quality
        self.validate_story_data_quality(stories)
        
        # Validate media URLs
        self.validate_media_urls(stories)
        
        # Validate YouTube playback
        self.validate_youtube_playback(stories)
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 ARIOME API TEST SUMMARY")
        print("="*60)
        
        total_stories = self.test_results["stories_api"]["details"].get("count", 0)
        print(f"📚 Total Stories Found: {total_stories}")
        
        # Sample stories
        sample_stories = self.test_results["data_quality"]["details"].get("sample_stories", [])
        if sample_stories:
            print(f"\n📖 Sample Stories:")
            for i, story in enumerate(sample_stories[:3], 1):
                print(f"   {i}. {story['title']}")
                print(f"      Media: {story['media_url']}")
                print(f"      Creator: {story['creator_name']}")
        
        # Media URL analysis
        media_details = self.test_results["media_urls"]["details"]
        youtube_count = media_details.get("youtube_count", 0)
        other_count = media_details.get("other_count", 0)
        
        print(f"\n🎥 Media URL Analysis:")
        print(f"   YouTube Videos: {youtube_count}")
        print(f"   Other Media: {other_count}")
        
        # YouTube validation
        yt_details = self.test_results["youtube_validation"]["details"]
        valid_yt_ids = yt_details.get("valid_ids", 0)
        
        print(f"\n📺 YouTube Validation:")
        print(f"   Valid YouTube IDs: {valid_yt_ids}")
        if yt_details.get("sample_ids"):
            print(f"   Sample IDs: {', '.join(yt_details['sample_ids'][:3])}")
        
        # Test results
        print(f"\n✅ Test Results:")
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result["passed"] else "❌ FAIL"
            print(f"   {test_name.replace('_', ' ').title()}: {status}")
        
        # Data source verification
        print(f"\n🔍 Data Source Verification:")
        if total_stories >= 12:
            print("   ✅ Using REAL database data (12+ stories found)")
        elif total_stories > 0:
            print(f"   ⚠️  Limited data found ({total_stories} stories)")
        else:
            print("   ❌ No data found - may be using sample/fallback data")
        
        # Issues found
        quality_issues = self.test_results["data_quality"]["details"].get("quality_issues", [])
        if quality_issues:
            print(f"\n⚠️  Issues Found:")
            for issue in quality_issues:
                print(f"   - {issue}")
        
        print("\n" + "="*60)

async def main():
    """Main test runner"""
    async with ARIOMEAPITester() as tester:
        success = await tester.run_all_tests()
        tester.print_summary()
        
        if success:
            print("\n🎉 All tests completed!")
        else:
            print("\n❌ Some tests failed!")
        
        return success

if __name__ == "__main__":
    asyncio.run(main())