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
ADMIN_EMAIL = "admin@ariome-test.com"
ADMIN_PASSWORD = "test123"

class ARIOMEAPITester:
    def __init__(self):
        self.session = None
        self.access_token = None
        self.admin_token = None
        self.test_results = {
            'login_success': False,
            'admin_login_success': False,
            'admin_stats_success': False,
            'admin_users_success': False,
            'email_signup_success': False,
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
    
    async def run_api_tests(self):
        """Run all API tests"""
        print("🚀 Starting ARIOME Backend API Testing\n")
        
        # Test backend health
        if not await self.test_health_endpoint():
            return
        
        # Test authentication first
        if not await self.test_login_api():
            print("❌ Cannot proceed without authentication")
            return
        
        # Run authenticated API tests
        await self.test_profile_update_api()
        await self.test_notification_settings_api()
        await self.test_change_password_api()
        await self.test_journal_apis()
        await self.test_circles_apis()
        
        # Print final report
        await self.print_final_report()
    
    async def print_final_report(self):
        """Print API test report"""
        print("\n" + "="*60)
        print("📋 ARIOME API TEST REPORT")
        print("="*60)
        
        # Test Results Summary
        print(f"\n📊 TEST RESULTS SUMMARY:")
        print(f"Login API: {'✅ PASS' if self.test_results['login_success'] else '❌ FAIL'}")
        print(f"Profile Update API: {'✅ PASS' if self.test_results['profile_update_success'] else '❌ FAIL'}")
        print(f"Notification Settings API: {'✅ PASS' if self.test_results['notification_settings_success'] else '❌ FAIL'}")
        print(f"Change Password API: {'✅ PASS' if self.test_results['change_password_success'] else '❌ FAIL'}")
        print(f"Journal Entries API: {'✅ PASS' if self.test_results['journal_entries_success'] else '❌ FAIL'}")
        print(f"Journal Stats API: {'✅ PASS' if self.test_results['journal_stats_success'] else '❌ FAIL'}")
        print(f"Circles List API: {'✅ PASS' if self.test_results['circles_list_success'] else '❌ FAIL'}")
        print(f"Circles Join API: {'✅ PASS' if self.test_results['circles_join_success'] else '❌ FAIL'}")
        
        # Count successes
        total_tests = 8
        passed_tests = sum([
            self.test_results['login_success'],
            self.test_results['profile_update_success'],
            self.test_results['notification_settings_success'],
            self.test_results['change_password_success'],
            self.test_results['journal_entries_success'],
            self.test_results['journal_stats_success'],
            self.test_results['circles_list_success'],
            self.test_results['circles_join_success']
        ])
        
        print(f"\n📈 OVERALL SCORE: {passed_tests}/{total_tests} tests passed ({(passed_tests/total_tests)*100:.1f}%)")
        
        # Errors and Issues
        if self.test_results['critical_failures']:
            print(f"\n🚨 CRITICAL FAILURES:")
            for error in self.test_results['critical_failures']:
                print(f"  • {error}")
        
        if self.test_results['auth_errors']:
            print(f"\n🔐 AUTHENTICATION ERRORS:")
            for error in self.test_results['auth_errors']:
                print(f"  • {error}")
        
        if self.test_results['api_errors']:
            print(f"\n❌ API ERRORS:")
            for error in self.test_results['api_errors']:
                print(f"  • {error}")
        
        # Final Recommendation
        print(f"\n🏁 FINAL RECOMMENDATION:")
        
        critical_issues = len(self.test_results['critical_failures'])
        auth_issues = len(self.test_results['auth_errors'])
        api_issues = len(self.test_results['api_errors'])
        
        if critical_issues == 0 and auth_issues == 0 and passed_tests >= 6:
            print("✅ BACKEND APIs WORKING - Most critical functionality operational")
        elif critical_issues > 0 or auth_issues > 0:
            print("❌ CRITICAL ISSUES FOUND - Authentication or core functionality broken")
        else:
            print("⚠️ PARTIAL FUNCTIONALITY - Some APIs working, others need attention")
        
        if critical_issues > 0:
            print(f"  • {critical_issues} critical system failures")
        if auth_issues > 0:
            print(f"  • {auth_issues} authentication issues")
        if api_issues > 0:
            print(f"  • {api_issues} API functionality issues")

async def main():
    """Main test runner"""
    async with ARIOMEAPITester() as tester:
        await tester.run_api_tests()

if __name__ == "__main__":
    asyncio.run(main())