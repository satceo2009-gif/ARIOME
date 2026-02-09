#!/usr/bin/env python3
"""
AriOme Backend API Testing Suite
Tests authentication and circles API endpoints as specified in review request
"""

import asyncio
import aiohttp
import json
import os
from typing import Dict, Any

# API Base URL from review request
API_BASE = "https://theme-evolution.preview.emergentagent.com/api"

# Test credentials from review request
TEST_EMAIL = "test@ariome.com"
TEST_PASSWORD = "test1234"
NEW_USER_EMAIL = "newuser123@ariome.com"
NEW_USER_PASSWORD = "test1234"
NEW_USER_NAME = "New User"

class AriOmeAPITester:
    def __init__(self):
        self.session = None
        self.session_token = None
        self.test_results = {
            'registration_success': False,
            'login_success': False,
            'get_user_success': False,
            'circle_join_auth_success': False,
            'circle_leave_auth_success': False,
            'circle_join_no_auth_success': False,
            'public_circles_success': False,
            'api_errors': [],
            'critical_failures': []
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def test_registration(self):
        """Test 1: Registration - POST /api/auth/register"""
        print("🔍 Test 1: Registration API...")
        try:
            headers = {'Content-Type': 'application/json'}
            
            registration_data = {
                "email": NEW_USER_EMAIL,
                "password": NEW_USER_PASSWORD,
                "name": NEW_USER_NAME
            }
            
            async with self.session.post(f"{API_BASE}/auth/register", 
                                       json=registration_data, 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'user' in data and 'session_token' in data:
                        self.test_results['registration_success'] = True
                        print(f"✅ Registration successful - User: {data['user'].get('name')}, Token: {data['session_token'][:20]}...")
                        return True
                    else:
                        error_msg = "Registration response missing user object or session_token"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                elif response.status == 400:
                    # User might already exist
                    error_text = await response.text()
                    if "already registered" in error_text:
                        self.test_results['registration_success'] = True
                        print("✅ Registration API working - User already exists (expected)")
                        return True
                    else:
                        error_msg = f"Registration failed with unexpected 400: {error_text}"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Registration failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Registration API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_login(self):
        """Test 2: Login - POST /api/auth/login"""
        print("\n🔍 Test 2: Login API...")
        try:
            headers = {'Content-Type': 'application/json'}
            
            login_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
            
            async with self.session.post(f"{API_BASE}/auth/login", 
                                       json=login_data, 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'user' in data and 'session_token' in data:
                        self.session_token = data['session_token']
                        self.test_results['login_success'] = True
                        print(f"✅ Login successful - User: {data['user'].get('name')}, Token: {self.session_token[:20]}...")
                        return True
                    else:
                        error_msg = "Login response missing user object or session_token"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Login failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Login API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_get_user(self):
        """Test 3: Get User (with auth) - GET /api/auth/me"""
        print("\n🔍 Test 3: Get User API (with auth)...")
        if not self.session_token:
            print("❌ Cannot test get user - no session token")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.session_token}'
            }
            
            async with self.session.get(f"{API_BASE}/auth/me", 
                                      headers=headers) as response:
                if response.status == 200:
                    user_data = await response.json()
                    if 'user_id' in user_data and 'email' in user_data:
                        self.test_results['get_user_success'] = True
                        print(f"✅ Get user successful - User: {user_data.get('name')}, Email: {user_data.get('email')}")
                        return True
                    else:
                        error_msg = "Get user response missing required fields (user_id, email)"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Get user failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Get user API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_circle_join_with_auth(self):
        """Test 4: Circle Join (with auth) - POST /api/circles/circle_healing01/join"""
        print("\n🔍 Test 4: Circle Join API (with auth)...")
        if not self.session_token:
            print("❌ Cannot test circle join - no session token")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.session_token}'
            }
            
            async with self.session.post(f"{API_BASE}/circles/circle_healing01/join", 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'message' in data:
                        self.test_results['circle_join_auth_success'] = True
                        print(f"✅ Circle join successful - {data['message']}")
                        return True
                    else:
                        error_msg = "Circle join response missing message"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                elif response.status == 400:
                    # Already a member is acceptable
                    error_text = await response.text()
                    if "already a member" in error_text.lower():
                        self.test_results['circle_join_auth_success'] = True
                        print("✅ Circle join API working - Already a member (expected)")
                        return True
                    else:
                        error_msg = f"Circle join failed with unexpected 400: {error_text}"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Circle join failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Circle join API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_circle_leave_with_auth(self):
        """Test 5: Circle Leave (with auth) - POST /api/circles/circle_healing01/leave"""
        print("\n🔍 Test 5: Circle Leave API (with auth)...")
        if not self.session_token:
            print("❌ Cannot test circle leave - no session token")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.session_token}'
            }
            
            async with self.session.post(f"{API_BASE}/circles/circle_healing01/leave", 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'message' in data:
                        self.test_results['circle_leave_auth_success'] = True
                        print(f"✅ Circle leave successful - {data['message']}")
                        return True
                    else:
                        error_msg = "Circle leave response missing message"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                elif response.status == 400:
                    # Not a member is acceptable
                    error_text = await response.text()
                    if "not a member" in error_text.lower():
                        self.test_results['circle_leave_auth_success'] = True
                        print("✅ Circle leave API working - Not a member (expected)")
                        return True
                    else:
                        error_msg = f"Circle leave failed with unexpected 400: {error_text}"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Circle leave failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Circle leave API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_circle_join_without_auth(self):
        """Test 6: Circle Join without auth - POST /api/circles/circle_healing01/join (should fail)"""
        print("\n🔍 Test 6: Circle Join API (without auth - should fail)...")
        try:
            # Create a new session without any cookies or headers to ensure no auth
            async with aiohttp.ClientSession() as clean_session:
                async with clean_session.post(f"{API_BASE}/circles/circle_healing01/join") as response:
                    if response.status == 401:
                        self.test_results['circle_join_no_auth_success'] = True
                        print("✅ Circle join without auth properly rejected (401 Unauthorized)")
                        return True
                    else:
                        error_text = await response.text()
                        error_msg = f"Circle join without auth should return 401, got {response.status}: {error_text}"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
        except Exception as e:
            error_msg = f"Circle join without auth API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_public_circles(self):
        """Test 7: List Circles (public) - GET /api/circles/public"""
        print("\n🔍 Test 7: Public Circles API...")
        try:
            async with self.session.get(f"{API_BASE}/circles/public") as response:
                if response.status == 200:
                    circles = await response.json()
                    if isinstance(circles, list):
                        self.test_results['public_circles_success'] = True
                        print(f"✅ Public circles successful - {len(circles)} circles returned")
                        # Print some circle info for verification
                        for circle in circles[:3]:  # Show first 3 circles
                            print(f"   Circle: {circle.get('name', 'Unknown')} - {circle.get('description', 'No description')[:50]}...")
                        return True
                    else:
                        error_msg = f"Public circles response should be array, got {type(circles)}"
                        self.test_results['api_errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Public circles failed with status {response.status}: {error_text}"
                    self.test_results['api_errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Public circles API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def run_api_tests(self):
        """Run all API tests as specified in review request"""
        print("🚀 Starting AriOme Authentication and Circles API Testing\n")
        print(f"API Base URL: {API_BASE}\n")
        
        # Test 1: Registration
        await self.test_registration()
        
        # Test 2: Login
        if not await self.test_login():
            print("❌ Cannot proceed without login authentication")
            await self.print_final_report()
            return
        
        # Test 3: Get User (with auth)
        await self.test_get_user()
        
        # Test 4: Circle Join (with auth)
        await self.test_circle_join_with_auth()
        
        # Test 5: Circle Leave (with auth)
        await self.test_circle_leave_with_auth()
        
        # Test 6: Circle Join without auth (should fail)
        await self.test_circle_join_without_auth()
        
        # Test 7: List Circles (public)
        await self.test_public_circles()
        
        # Print final report
        await self.print_final_report()
    
    async def print_final_report(self):
        """Print API test report"""
        print("\n" + "="*60)
        print("📋 ARIOME API TEST REPORT")
        print("="*60)
        
        # Test Results Summary
        print(f"\n📊 TEST RESULTS SUMMARY:")
        print(f"Test 1 - Registration API: {'✅ PASS' if self.test_results['registration_success'] else '❌ FAIL'}")
        print(f"Test 2 - Login API: {'✅ PASS' if self.test_results['login_success'] else '❌ FAIL'}")
        print(f"Test 3 - Get User API (with auth): {'✅ PASS' if self.test_results['get_user_success'] else '❌ FAIL'}")
        print(f"Test 4 - Circle Join API (with auth): {'✅ PASS' if self.test_results['circle_join_auth_success'] else '❌ FAIL'}")
        print(f"Test 5 - Circle Leave API (with auth): {'✅ PASS' if self.test_results['circle_leave_auth_success'] else '❌ FAIL'}")
        print(f"Test 6 - Circle Join API (no auth): {'✅ PASS' if self.test_results['circle_join_no_auth_success'] else '❌ FAIL'}")
        print(f"Test 7 - Public Circles API: {'✅ PASS' if self.test_results['public_circles_success'] else '❌ FAIL'}")
        
        # Count successes
        total_tests = 7
        passed_tests = sum([
            self.test_results['registration_success'],
            self.test_results['login_success'],
            self.test_results['get_user_success'],
            self.test_results['circle_join_auth_success'],
            self.test_results['circle_leave_auth_success'],
            self.test_results['circle_join_no_auth_success'],
            self.test_results['public_circles_success']
        ])
        
        print(f"\n📈 OVERALL SCORE: {passed_tests}/{total_tests} tests passed ({(passed_tests/total_tests)*100:.1f}%)")
        
        # Errors and Issues
        if self.test_results['critical_failures']:
            print(f"\n🚨 CRITICAL FAILURES:")
            for error in self.test_results['critical_failures']:
                print(f"  • {error}")
        
        if self.test_results['api_errors']:
            print(f"\n❌ API ERRORS:")
            for error in self.test_results['api_errors']:
                print(f"  • {error}")
        
        # Final Recommendation
        print(f"\n🏁 FINAL RECOMMENDATION:")
        
        critical_issues = len(self.test_results['critical_failures'])
        api_issues = len(self.test_results['api_errors'])
        
        if critical_issues == 0 and passed_tests >= 5:
            print("✅ BACKEND APIs WORKING - Authentication and circles functionality operational")
        elif critical_issues > 0:
            print("❌ CRITICAL ISSUES FOUND - Core functionality broken")
        else:
            print("⚠️ PARTIAL FUNCTIONALITY - Some APIs working, others need attention")
        
        if critical_issues > 0:
            print(f"  • {critical_issues} critical system failures")
        if api_issues > 0:
            print(f"  • {api_issues} API functionality issues")

async def main():
    """Main test runner"""
    async with AriOmeAPITester() as tester:
        await tester.run_api_tests()

if __name__ == "__main__":
    asyncio.run(main())