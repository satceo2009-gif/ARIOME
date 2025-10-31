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
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://ariome-wellness.preview.emergentagent.com')
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
    
    def extract_youtube_id(self, url):
        """Extract YouTube video ID from URL"""
        if not url or 'youtube.com' not in url:
            return None
        
        # Parse URL and extract video ID
        parsed = urlparse(url)
        if parsed.hostname in ['www.youtube.com', 'youtube.com']:
            query_params = parse_qs(parsed.query)
            video_id = query_params.get('v', [None])[0]
            if video_id and len(video_id) == 11:
                return video_id
        
        return None
    
    def is_compatible_media_url(self, url, format_type):
        """Check if media URL is compatible with Android/iOS"""
        if not url:
            return False, "Empty URL"
        
        if format_type == "video":
            if "youtube.com" in url:
                youtube_id = self.extract_youtube_id(url)
                if youtube_id:
                    return True, f"YouTube compatible (ID: {youtube_id})"
                else:
                    return False, "Invalid YouTube URL format"
            elif url.endswith(('.mp4', '.mov', '.avi')):
                return True, "Direct video file"
            else:
                return False, "Unsupported video format"
        
        elif format_type == "audio":
            if "youtube.com" in url:
                youtube_id = self.extract_youtube_id(url)
                if youtube_id:
                    return True, f"YouTube audio compatible (ID: {youtube_id})"
                else:
                    return False, "Invalid YouTube URL format"
            elif url.endswith(('.mp3', '.wav', '.m4a', '.aac')):
                return True, "Direct audio file"
            else:
                return False, "Unsupported audio format"
        
        return False, "Unknown format"
    
    async def test_health_endpoint(self):
        """Test if backend is running"""
        print("🔍 Testing backend health...")
        try:
            async with self.session.get(f"{API_BASE}/health") as response:
                if response.status == 200:
                    print("✅ Backend is healthy")
                    return True
                else:
                    print(f"❌ Backend health check failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Backend connection failed: {e}")
            return False
    
    async def test_stories_api(self):
        """Test GET /api/stories endpoint"""
        print("\n🔍 Testing Stories API...")
        try:
            async with self.session.get(f"{API_BASE}/stories") as response:
                if response.status != 200:
                    error_msg = f"Stories API returned status {response.status}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return []
                
                stories = await response.json()
                print(f"✅ Stories API returned {len(stories)} stories")
                return stories
        
        except Exception as e:
            error_msg = f"Stories API request failed: {e}"
            self.test_results['api_errors'].append(error_msg)
            print(f"❌ {error_msg}")
            return []
    
    async def analyze_database_content(self, stories):
        """Analyze database content mix"""
        print("\n📊 Analyzing Database Content...")
        
        self.test_results['total_stories'] = len(stories)
        print(f"Total Stories: {len(stories)}")
        
        # Count by format
        video_count = sum(1 for story in stories if story.get('format') == 'video')
        audio_count = sum(1 for story in stories if story.get('format') == 'audio')
        
        self.test_results['video_stories'] = video_count
        self.test_results['audio_stories'] = audio_count
        
        print(f"Video Stories: {video_count}")
        print(f"Audio Stories: {audio_count}")
        
        # Count by intention
        intention_counter = Counter()
        for story in stories:
            intentions = story.get('intentions', [])
            for intention in intentions:
                intention_counter[intention] += 1
        
        self.test_results['intentions_count'] = dict(intention_counter)
        print(f"Stories by Intention: {dict(intention_counter)}")
        
        # Count premium vs free
        premium_count = sum(1 for story in stories if story.get('is_premium', False))
        free_count = len(stories) - premium_count
        
        self.test_results['premium_count'] = premium_count
        self.test_results['free_count'] = free_count
        
        print(f"Premium Stories: {premium_count}")
        print(f"Free Stories: {free_count}")
    
    async def test_youtube_extraction(self, stories):
        """Test YouTube ID extraction for video stories"""
        print("\n🎥 Testing YouTube Video ID Extraction...")
        
        video_stories = [s for s in stories if s.get('format') == 'video']
        
        for story in video_stories[:3]:  # Sample first 3 video stories
            media_url = story.get('media_url', '')
            youtube_id = self.extract_youtube_id(media_url)
            
            story_sample = {
                'title': story.get('title', 'Unknown'),
                'media_url': media_url,
                'youtube_id': youtube_id,
                'valid': youtube_id is not None and len(youtube_id) == 11
            }
            
            self.test_results['video_samples'].append(story_sample)
            
            if story_sample['valid']:
                print(f"✅ {story['title'][:50]}... - YouTube ID: {youtube_id}")
            else:
                print(f"❌ {story['title'][:50]}... - Invalid YouTube URL: {media_url}")
                self.test_results['youtube_id_errors'].append(f"Story '{story['title']}' has invalid YouTube URL")
    
    async def test_audio_samples(self, stories):
        """Sample audio stories"""
        print("\n🎵 Sampling Audio Stories...")
        
        audio_stories = [s for s in stories if s.get('format') == 'audio']
        
        for story in audio_stories[:3]:  # Sample first 3 audio stories
            media_url = story.get('media_url', '')
            is_compatible, reason = self.is_compatible_media_url(media_url, 'audio')
            
            story_sample = {
                'title': story.get('title', 'Unknown'),
                'media_url': media_url,
                'compatible': is_compatible,
                'reason': reason
            }
            
            self.test_results['audio_samples'].append(story_sample)
            
            if is_compatible:
                print(f"✅ {story['title'][:50]}... - {reason}")
            else:
                print(f"❌ {story['title'][:50]}... - {reason}")
    
    async def test_api_response_format(self, stories):
        """Test API response format for creator objects"""
        print("\n🔍 Testing API Response Format...")
        
        if not stories:
            print("❌ No stories to test response format")
            return
        
        sample_story = stories[0]
        
        # Check creator object structure
        creator = sample_story.get('creator', {})
        required_creator_fields = ['name', 'avatar', 'bio']
        
        missing_fields = []
        for field in required_creator_fields:
            if field not in creator:
                missing_fields.append(field)
        
        if missing_fields:
            error_msg = f"Creator object missing fields: {missing_fields}"
            self.test_results['api_errors'].append(error_msg)
            print(f"❌ {error_msg}")
        else:
            print("✅ Creator object has all required fields (name, avatar, bio)")
            self.test_results['creator_format_valid'] = True
        
        # Check media_url field
        if 'media_url' not in sample_story:
            error_msg = "Stories missing media_url field"
            self.test_results['api_errors'].append(error_msg)
            print(f"❌ {error_msg}")
        else:
            print("✅ Stories have media_url field")
        
        # Check format field
        if 'format' not in sample_story:
            error_msg = "Stories missing format field"
            self.test_results['api_errors'].append(error_msg)
            print(f"❌ {error_msg}")
        else:
            format_value = sample_story['format']
            if format_value in ['video', 'audio']:
                print(f"✅ Stories have valid format field: {format_value}")
            else:
                error_msg = f"Invalid format value: {format_value}"
                self.test_results['api_errors'].append(error_msg)
                print(f"❌ {error_msg}")
    
    async def test_content_quality(self, stories):
        """Test content quality - reflection prompts"""
        print("\n📝 Testing Content Quality...")
        
        stories_with_prompts = 0
        stories_without_prompts = 0
        
        for story in stories:
            reflection_prompts = story.get('reflection_prompts', {})
            if reflection_prompts and 'before' in reflection_prompts and 'after' in reflection_prompts:
                stories_with_prompts += 1
            else:
                stories_without_prompts += 1
        
        print(f"Stories with reflection prompts: {stories_with_prompts}")
        print(f"Stories without reflection prompts: {stories_without_prompts}")
        
        if stories_without_prompts == 0:
            self.test_results['reflection_prompts_valid'] = True
            print("✅ All stories have reflection prompts")
        else:
            self.test_results['api_errors'].append(f"{stories_without_prompts} stories missing reflection prompts")
    
    async def test_compatibility(self, stories):
        """Test Android/iOS compatibility"""
        print("\n📱 Testing Android/iOS Compatibility...")
        
        incompatible_count = 0
        
        for story in stories:
            media_url = story.get('media_url', '')
            format_type = story.get('format', '')
            is_compatible, reason = self.is_compatible_media_url(media_url, format_type)
            
            if not is_compatible:
                incompatible_count += 1
                self.test_results['broken_links'].append({
                    'title': story.get('title', 'Unknown'),
                    'url': media_url,
                    'format': format_type,
                    'issue': reason
                })
        
        compatible_count = len(stories) - incompatible_count
        print(f"Compatible media URLs: {compatible_count}")
        print(f"Incompatible media URLs: {incompatible_count}")
        
        if incompatible_count == 0:
            print("✅ All media URLs are Android/iOS compatible")
        else:
            print(f"❌ {incompatible_count} media URLs have compatibility issues")
    
    async def run_comprehensive_test(self):
        """Run all tests"""
        print("🚀 Starting ARIOME Backend Comprehensive Testing\n")
        
        # Test backend health
        if not await self.test_health_endpoint():
            return
        
        # Get stories from API
        stories = await self.test_stories_api()
        if not stories:
            print("❌ Cannot proceed without stories data")
            return
        
        # Run all analysis
        await self.analyze_database_content(stories)
        await self.test_youtube_extraction(stories)
        await self.test_audio_samples(stories)
        await self.test_api_response_format(stories)
        await self.test_content_quality(stories)
        await self.test_compatibility(stories)
        
        # Print final report
        await self.print_final_report()
    
    async def print_final_report(self):
        """Print comprehensive test report"""
        print("\n" + "="*60)
        print("📋 COMPREHENSIVE TEST REPORT")
        print("="*60)
        
        # Summary Stats
        print(f"\n📊 SUMMARY STATS:")
        print(f"Total Stories: {self.test_results['total_stories']}")
        print(f"Video Stories: {self.test_results['video_stories']}")
        print(f"Audio Stories: {self.test_results['audio_stories']}")
        print(f"Premium Stories: {self.test_results['premium_count']}")
        print(f"Free Stories: {self.test_results['free_count']}")
        
        # Expected vs Actual
        expected_total = 49
        expected_video = 14
        expected_audio = 35
        
        print(f"\n⚠️  EXPECTED vs ACTUAL:")
        print(f"Expected Total: {expected_total}, Actual: {self.test_results['total_stories']}")
        print(f"Expected Video: {expected_video}, Actual: {self.test_results['video_stories']}")
        print(f"Expected Audio: {expected_audio}, Actual: {self.test_results['audio_stories']}")
        
        # Video Samples
        if self.test_results['video_samples']:
            print(f"\n🎥 VIDEO SAMPLES:")
            for sample in self.test_results['video_samples']:
                status = "✅" if sample['valid'] else "❌"
                print(f"{status} {sample['title'][:40]}...")
                print(f"   URL: {sample['media_url']}")
                if sample['youtube_id']:
                    print(f"   YouTube ID: {sample['youtube_id']}")
        
        # Audio Samples
        if self.test_results['audio_samples']:
            print(f"\n🎵 AUDIO SAMPLES:")
            for sample in self.test_results['audio_samples']:
                status = "✅" if sample['compatible'] else "❌"
                print(f"{status} {sample['title'][:40]}...")
                print(f"   URL: {sample['media_url']}")
                print(f"   Status: {sample['reason']}")
        
        # Intentions Breakdown
        if self.test_results['intentions_count']:
            print(f"\n🎯 STORIES BY INTENTION:")
            for intention, count in self.test_results['intentions_count'].items():
                print(f"  {intention}: {count}")
        
        # Errors and Issues
        if self.test_results['api_errors']:
            print(f"\n❌ API ERRORS:")
            for error in self.test_results['api_errors']:
                print(f"  • {error}")
        
        if self.test_results['youtube_id_errors']:
            print(f"\n❌ YOUTUBE ID ERRORS:")
            for error in self.test_results['youtube_id_errors']:
                print(f"  • {error}")
        
        if self.test_results['broken_links']:
            print(f"\n❌ COMPATIBILITY ISSUES:")
            for issue in self.test_results['broken_links']:
                print(f"  • {issue['title'][:40]}... - {issue['issue']}")
        
        # Final Recommendation
        print(f"\n🏁 FINAL RECOMMENDATION:")
        
        critical_issues = len(self.test_results['api_errors']) + len(self.test_results['broken_links'])
        data_mismatch = abs(self.test_results['total_stories'] - expected_total) > 5
        
        if critical_issues == 0 and not data_mismatch:
            print("✅ READY - Backend is production ready")
        else:
            print("❌ NEEDS FIX - Critical issues found:")
            if data_mismatch:
                print(f"  • Data count mismatch (expected {expected_total}, got {self.test_results['total_stories']})")
            if critical_issues > 0:
                print(f"  • {critical_issues} critical API/compatibility issues")

async def main():
    """Main test runner"""
    async with ARIOMEComprehensiveTester() as tester:
        await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())