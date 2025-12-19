#!/usr/bin/env python3
"""
ARIOME Backend API Testing Suite
Tests authentication, profile, journal, circles, and other backend APIs
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
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://mind-wellness-70.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
TEST_EMAIL = "subscriber@ariome-test.com"
TEST_PASSWORD = "test123"

class ARIOMEAPITester:
    def __init__(self):
        self.session = None
        self.access_token = None
        self.test_results = {
            'login_success': False,
            'profile_update_success': False,
            'notification_settings_success': False,
            'change_password_success': False,
            'journal_entries_success': False,
            'journal_stats_success': False,
            'circles_list_success': False,
            'circles_join_success': False,
            'api_errors': [],
            'auth_errors': [],
            'critical_failures': []
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
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
    
    async def test_login_api(self):
        """Test POST /api/auth/login with form data"""
        print("\n🔍 Testing Login API...")
        try:
            # Prepare form data as specified in review request
            form_data = aiohttp.FormData()
            form_data.add_field('username', TEST_EMAIL)
            form_data.add_field('password', TEST_PASSWORD)
            
            async with self.session.post(f"{API_BASE}/auth/login", data=form_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'access_token' in data:
                        self.access_token = data['access_token']
                        self.test_results['login_success'] = True
                        print(f"✅ Login successful - Token received")
                        return True
                    else:
                        error_msg = "Login response missing access_token"
                        self.test_results['auth_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Login failed with status {response.status}: {error_text}"
                    self.test_results['auth_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Login API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_profile_update_api(self):
        """Test PUT /api/auth/profile with JSON body"""
        print("\n🔍 Testing Profile Update API...")
        if not self.access_token:
            print("❌ Cannot test profile update - no access token")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            profile_data = {
                "name": "Test Name Updated",
                "bio": "Test bio updated via API"
            }
            
            async with self.session.put(f"{API_BASE}/auth/profile", 
                                      json=profile_data, 
                                      headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('name') == profile_data['name']:
                        self.test_results['profile_update_success'] = True
                        print("✅ Profile update successful")
                        return True
                    else:
                        error_msg = "Profile update response doesn't match sent data"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Profile update failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Profile update API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_notification_settings_api(self):
        """Test GET and PUT /api/auth/settings/notifications"""
        print("\n🔍 Testing Notification Settings API...")
        if not self.access_token:
            print("❌ Cannot test notification settings - no access token")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Test GET first
            async with self.session.get(f"{API_BASE}/auth/settings/notifications", 
                                      headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    error_msg = f"GET notification settings failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
                
                current_settings = await response.json()
                print(f"✅ GET notification settings successful")
            
            # Test PUT
            new_settings = {
                "email_notifications": True,
                "push_notifications": False,
                "marketing_emails": True
            }
            
            async with self.session.put(f"{API_BASE}/auth/settings/notifications", 
                                      json=new_settings, 
                                      headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.test_results['notification_settings_success'] = True
                    print("✅ PUT notification settings successful")
                    return True
                else:
                    error_text = await response.text()
                    error_msg = f"PUT notification settings failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Notification settings API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_change_password_api(self):
        """Test PUT /api/auth/change-password with JSON body"""
        print("\n🔍 Testing Change Password API...")
        if not self.access_token:
            print("❌ Cannot test change password - no access token")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            password_data = {
                "old_password": TEST_PASSWORD,
                "new_password": TEST_PASSWORD  # Keep same password for testing
            }
            
            async with self.session.put(f"{API_BASE}/auth/change-password", 
                                      json=password_data, 
                                      headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'message' in data:
                        self.test_results['change_password_success'] = True
                        print("✅ Change password successful")
                        return True
                    else:
                        error_msg = "Change password response missing message"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Change password failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Change password API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_journal_apis(self):
        """Test GET /api/journal/entries and GET /api/journal/stats"""
        print("\n🔍 Testing Journal APIs...")
        if not self.access_token:
            print("❌ Cannot test journal APIs - no access token")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}'
            }
            
            # Test GET /api/journal/entries
            async with self.session.get(f"{API_BASE}/journal/entries", 
                                      headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    error_msg = f"GET journal entries failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
                
                entries = await response.json()
                print(f"✅ GET journal entries successful - {len(entries)} entries")
            
            # Test GET /api/journal/stats
            async with self.session.get(f"{API_BASE}/journal/stats", 
                                      headers=headers) as response:
                if response.status == 200:
                    stats = await response.json()
                    if 'total_entries' in stats and 'total_reflections' in stats:
                        self.test_results['journal_entries_success'] = True
                        self.test_results['journal_stats_success'] = True
                        print(f"✅ GET journal stats successful - {stats}")
                        return True
                    else:
                        error_msg = "Journal stats response missing required fields"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"GET journal stats failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Journal APIs request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_circles_apis(self):
        """Test GET /api/circles and POST /api/circles/{id}/join"""
        print("\n🔍 Testing Circles APIs...")
        if not self.access_token:
            print("❌ Cannot test circles APIs - no access token")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}'
            }
            
            # Test GET /api/circles
            async with self.session.get(f"{API_BASE}/circles", 
                                      headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    error_msg = f"GET circles failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
                
                circles = await response.json()
                self.test_results['circles_list_success'] = True
                print(f"✅ GET circles successful - {len(circles)} circles")
                
                # Test POST /api/circles/{id}/join if circles exist
                if circles:
                    circle_id = circles[0].get('id')
                    if circle_id:
                        async with self.session.post(f"{API_BASE}/circles/{circle_id}/join", 
                                                   headers=headers) as join_response:
                            if join_response.status in [200, 400]:  # 400 might be "already a member"
                                join_data = await join_response.json()
                                self.test_results['circles_join_success'] = True
                                print(f"✅ POST circles join successful - {join_data.get('message', 'Joined')}")
                            else:
                                error_text = await join_response.text()
                                error_msg = f"POST circles join failed with status {join_response.status}: {error_text}"
                                self.test_results['api_errors'].append(error_msg)
                                print(f"❌ {error_msg}")
                    else:
                        print("⚠️ No circle ID found to test join functionality")
                else:
                    print("⚠️ No circles found to test join functionality")
                
                return True
        except Exception as e:
            error_msg = f"Circles APIs request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
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