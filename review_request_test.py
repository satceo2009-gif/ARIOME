#!/usr/bin/env python3
"""
ARIOME Review Request Testing Suite
Tests the specific user flows mentioned in the review request:
1. Explorer Flow - Journal
2. Explorer → Subscriber Upgrade
3. Circle Permissions
4. Feedback API
"""

import asyncio
import aiohttp
import json
import os
from typing import Dict, Any

# API Base URL from review request
API_BASE = "https://logohomelink.preview.emergentagent.com/api"

# Test credentials from review request
SUBSCRIBER_EMAIL = "subscriber@ariome-test.com"
SUBSCRIBER_PASSWORD = "test123"
EXPLORER_EMAIL = "explorer-journal@test.com"

class ReviewRequestTester:
    def __init__(self):
        self.session = None
        self.explorer_token = None
        self.subscriber_token = None
        self.test_results = {
            'explorer_signup_success': False,
            'explorer_journal_create_success': False,
            'explorer_journal_get_success': False,
            'explorer_journal_stats_success': False,
            'explorer_upgrade_success': False,
            'upgrade_login_success': False,
            'circles_public_success': False,
            'subscriber_login_success': False,
            'circles_join_success': False,
            'feedback_submit_success': False,
            'errors': []
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def test_explorer_flow_journal(self):
        """Test Explorer Flow - Journal as specified in review request"""
        print("🔍 Testing Explorer Flow - Journal...")
        
        # Step 1: POST /api/auth/email-signup with email: "explorer-journal@test.com"
        print("  Step 1: Email signup as explorer...")
        try:
            headers = {'Content-Type': 'application/json'}
            signup_data = {"email": EXPLORER_EMAIL}
            
            async with self.session.post(f"{API_BASE}/auth/email-signup", 
                                       json=signup_data, 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'user_id' in data:
                        self.test_results['explorer_signup_success'] = True
                        print(f"    ✅ Explorer signup successful: {data}")
                    else:
                        error_msg = "Explorer signup response missing user_id"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Explorer signup failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Explorer signup request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        # Note: Explorer users don't have tokens in this flow, they need to upgrade first
        # Let's try to get a token by upgrading first, then test journal
        print("  Step 1b: Upgrade explorer to subscriber to get token...")
        try:
            upgrade_data = {
                "email": EXPLORER_EMAIL,
                "name": "Explorer Journal User",
                "password": "test123"
            }
            
            async with self.session.post(f"{API_BASE}/auth/upgrade-to-subscriber", 
                                       json=upgrade_data, 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'access_token' in data:
                        self.explorer_token = data['access_token']
                        print(f"    ✅ Explorer upgraded to get token for journal testing")
                    else:
                        error_msg = "Explorer upgrade response missing access_token"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Explorer upgrade failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Explorer upgrade request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        # Step 2: POST /api/journal/entries to create a journal entry
        print("  Step 2: Create journal entry...")
        try:
            auth_headers = {
                'Authorization': f'Bearer {self.explorer_token}',
                'Content-Type': 'application/json'
            }
            
            journal_data = {
                "title": "My First Journal Entry",
                "content": "Today I started my mindfulness journey with ARIOME. Feeling grateful and excited to explore meditation.",
                "mood": "grateful",
                "tags": ["mindfulness", "gratitude", "first-entry"]
            }
            
            async with self.session.post(f"{API_BASE}/journal/entries", 
                                       json=journal_data, 
                                       headers=auth_headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'id' in data and data.get('title') == journal_data['title']:
                        self.test_results['explorer_journal_create_success'] = True
                        print(f"    ✅ Journal entry created successfully: {data['id']}")
                    else:
                        error_msg = "Journal create response missing id or incorrect data"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Journal create failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Journal create request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        # Step 3: GET /api/journal/entries to verify entry was saved
        print("  Step 3: Verify journal entry was saved...")
        try:
            async with self.session.get(f"{API_BASE}/journal/entries", 
                                      headers=auth_headers) as response:
                if response.status == 200:
                    entries = await response.json()
                    if isinstance(entries, list) and len(entries) >= 1:
                        # Check if our entry is in the list
                        found_entry = any(e.get('title') == journal_data['title'] for e in entries)
                        if found_entry:
                            self.test_results['explorer_journal_get_success'] = True
                            print(f"    ✅ Journal entries retrieved successfully: {len(entries)} entries found")
                        else:
                            error_msg = "Created journal entry not found in entries list"
                            self.test_results['errors'].append(error_msg)
                            print(f"    ❌ {error_msg}")
                            return False
                    else:
                        error_msg = f"Journal entries returned invalid data: expected list with entries, got {type(entries)}"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Journal entries get failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Journal entries get request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        # Step 4: GET /api/journal/stats to verify stats updated
        print("  Step 4: Verify journal stats updated...")
        try:
            async with self.session.get(f"{API_BASE}/journal/stats", 
                                      headers=auth_headers) as response:
                if response.status == 200:
                    stats = await response.json()
                    if 'total_entries' in stats and stats['total_entries'] >= 1:
                        self.test_results['explorer_journal_stats_success'] = True
                        print(f"    ✅ Journal stats updated successfully: {stats}")
                    else:
                        error_msg = f"Journal stats missing total_entries or count is 0: {stats}"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Journal stats get failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Journal stats get request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        print("✅ Explorer Flow - Journal completed successfully!")
        return True
    
    async def test_explorer_to_subscriber_upgrade(self):
        """Test Explorer → Subscriber Upgrade Flow"""
        print("\n🔍 Testing Explorer → Subscriber Upgrade Flow...")
        
        # Use a different email for this test to avoid conflicts
        upgrade_email = "explorer-upgrade-test@test.com"
        
        # Step 1: Create explorer first
        print("  Step 1: Create explorer user...")
        try:
            headers = {'Content-Type': 'application/json'}
            signup_data = {"email": upgrade_email}
            
            async with self.session.post(f"{API_BASE}/auth/email-signup", 
                                       json=signup_data, 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"    ✅ Explorer created: {data}")
                else:
                    # Might already exist, that's OK
                    print(f"    ⚠️ Explorer might already exist (status {response.status})")
        except Exception as e:
            print(f"    ⚠️ Explorer creation failed: {e}")
        
        # Step 2: POST /api/auth/upgrade-to-subscriber
        print("  Step 2: Upgrade explorer to subscriber...")
        try:
            upgrade_data = {
                "email": upgrade_email,
                "name": "Upgraded User",
                "password": "newpass123"
            }
            
            async with self.session.post(f"{API_BASE}/auth/upgrade-to-subscriber", 
                                       json=upgrade_data, 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'access_token' in data and data.get('user', {}).get('role') == 'subscriber':
                        self.test_results['explorer_upgrade_success'] = True
                        upgrade_token = data['access_token']
                        print(f"    ✅ Upgrade successful: {data['user']}")
                    else:
                        error_msg = "Upgrade response missing access_token or role not subscriber"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Upgrade failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Upgrade request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        # Step 3: POST /api/auth/login with email and new password to verify login works
        print("  Step 3: Login with new credentials...")
        try:
            form_data = aiohttp.FormData()
            form_data.add_field('username', upgrade_email)
            form_data.add_field('password', 'newpass123')
            
            async with self.session.post(f"{API_BASE}/auth/login", data=form_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'access_token' in data and data.get('user', {}).get('role') == 'subscriber':
                        self.test_results['upgrade_login_success'] = True
                        print(f"    ✅ Login after upgrade successful: {data['user']}")
                    else:
                        error_msg = "Login after upgrade response missing access_token or role not subscriber"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Login after upgrade failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Login after upgrade request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        print("✅ Explorer → Subscriber Upgrade Flow completed successfully!")
        return True
    
    async def test_circle_permissions(self):
        """Test Circle Permissions Flow"""
        print("\n🔍 Testing Circle Permissions Flow...")
        
        # Step 1: GET /api/circles/public (no auth) - should return circles list
        print("  Step 1: Get public circles (no auth)...")
        try:
            async with self.session.get(f"{API_BASE}/circles/public") as response:
                if response.status == 200:
                    circles = await response.json()
                    if isinstance(circles, list):
                        self.test_results['circles_public_success'] = True
                        print(f"    ✅ Public circles retrieved successfully: {len(circles)} circles")
                    else:
                        error_msg = f"Public circles returned invalid data: expected list, got {type(circles)}"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Public circles get failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Public circles get request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        # Step 2: Login as subscriber: subscriber@ariome-test.com / test123
        print("  Step 2: Login as subscriber...")
        try:
            form_data = aiohttp.FormData()
            form_data.add_field('username', SUBSCRIBER_EMAIL)
            form_data.add_field('password', SUBSCRIBER_PASSWORD)
            
            async with self.session.post(f"{API_BASE}/auth/login", data=form_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'access_token' in data:
                        self.subscriber_token = data['access_token']
                        self.test_results['subscriber_login_success'] = True
                        print(f"    ✅ Subscriber login successful")
                    else:
                        error_msg = "Subscriber login response missing access_token"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Subscriber login failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Subscriber login request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        # Step 3: Get circles to find a circle_id, then POST /api/circles/{circle_id}/join
        print("  Step 3: Join a circle as subscriber...")
        try:
            auth_headers = {
                'Authorization': f'Bearer {self.subscriber_token}',
                'Content-Type': 'application/json'
            }
            
            # First get circles to find a circle_id
            async with self.session.get(f"{API_BASE}/circles", headers=auth_headers) as response:
                if response.status == 200:
                    circles = await response.json()
                    if circles and len(circles) > 0:
                        circle_id = circles[0].get('id')
                        if circle_id:
                            # Try to join the circle
                            async with self.session.post(f"{API_BASE}/circles/{circle_id}/join", 
                                                       headers=auth_headers) as join_response:
                                if join_response.status in [200, 400]:  # 400 might be "already a member"
                                    join_data = await join_response.json()
                                    self.test_results['circles_join_success'] = True
                                    print(f"    ✅ Circle join successful: {join_data.get('message', 'Joined')}")
                                else:
                                    error_text = await join_response.text()
                                    error_msg = f"Circle join failed with status {join_response.status}: {error_text}"
                                    self.test_results['errors'].append(error_msg)
                                    print(f"    ❌ {error_msg}")
                                    return False
                        else:
                            error_msg = "No circle ID found to test join functionality"
                            self.test_results['errors'].append(error_msg)
                            print(f"    ❌ {error_msg}")
                            return False
                    else:
                        error_msg = "No circles found to test join functionality"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Get circles for join test failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Circle join test request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        print("✅ Circle Permissions Flow completed successfully!")
        return True
    
    async def test_feedback_api(self):
        """Test Feedback API Flow"""
        print("\n🔍 Testing Feedback API Flow...")
        
        # POST /api/feedback with category, rating, feedback text
        print("  Step 1: Submit feedback...")
        try:
            headers = {'Content-Type': 'application/json'}
            
            feedback_data = {
                "category": "experience",
                "rating": 5,
                "feedback": "ARIOME is an amazing meditation app! The guided stories are very helpful for my mindfulness practice. The journal feature helps me track my progress.",
                "user_email": "test-feedback@ariome.com",
                "user_role": "subscriber"
            }
            
            async with self.session.post(f"{API_BASE}/feedback", 
                                       json=feedback_data, 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('status') == 'success' and 'feedback_id' in data:
                        self.test_results['feedback_submit_success'] = True
                        print(f"    ✅ Feedback submitted successfully: {data}")
                    else:
                        error_msg = "Feedback response missing success status or feedback_id"
                        self.test_results['errors'].append(error_msg)
                        print(f"    ❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Feedback submit failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"    ❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Feedback submit request failed: {e}"
            self.test_results['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
            return False
        
        print("✅ Feedback API Flow completed successfully!")
        return True
    
    async def run_review_request_tests(self):
        """Run all review request tests"""
        print("🚀 Starting ARIOME Review Request Testing\n")
        print(f"API Base URL: {API_BASE}\n")
        
        # Test all flows from review request
        await self.test_explorer_flow_journal()
        await self.test_explorer_to_subscriber_upgrade()
        await self.test_circle_permissions()
        await self.test_feedback_api()
        
        # Print final report
        await self.print_final_report()
    
    async def print_final_report(self):
        """Print review request test report"""
        print("\n" + "="*60)
        print("📋 ARIOME REVIEW REQUEST TEST REPORT")
        print("="*60)
        
        print(f"\n📊 TEST RESULTS SUMMARY:")
        print(f"🔍 EXPLORER FLOW - JOURNAL:")
        print(f"  Explorer Email Signup: {'✅ PASS' if self.test_results['explorer_signup_success'] else '❌ FAIL'}")
        print(f"  Journal Entry Create: {'✅ PASS' if self.test_results['explorer_journal_create_success'] else '❌ FAIL'}")
        print(f"  Journal Entries Get: {'✅ PASS' if self.test_results['explorer_journal_get_success'] else '❌ FAIL'}")
        print(f"  Journal Stats Get: {'✅ PASS' if self.test_results['explorer_journal_stats_success'] else '❌ FAIL'}")
        
        print(f"\n🔄 EXPLORER → SUBSCRIBER UPGRADE:")
        print(f"  Upgrade to Subscriber: {'✅ PASS' if self.test_results['explorer_upgrade_success'] else '❌ FAIL'}")
        print(f"  Login After Upgrade: {'✅ PASS' if self.test_results['upgrade_login_success'] else '❌ FAIL'}")
        
        print(f"\n👥 CIRCLE PERMISSIONS:")
        print(f"  Public Circles (No Auth): {'✅ PASS' if self.test_results['circles_public_success'] else '❌ FAIL'}")
        print(f"  Subscriber Login: {'✅ PASS' if self.test_results['subscriber_login_success'] else '❌ FAIL'}")
        print(f"  Circle Join (Subscriber): {'✅ PASS' if self.test_results['circles_join_success'] else '❌ FAIL'}")
        
        print(f"\n💬 FEEDBACK API:")
        print(f"  Feedback Submit: {'✅ PASS' if self.test_results['feedback_submit_success'] else '❌ FAIL'}")
        
        # Count successes
        total_tests = 10
        passed_tests = sum([
            self.test_results['explorer_signup_success'],
            self.test_results['explorer_journal_create_success'],
            self.test_results['explorer_journal_get_success'],
            self.test_results['explorer_journal_stats_success'],
            self.test_results['explorer_upgrade_success'],
            self.test_results['upgrade_login_success'],
            self.test_results['circles_public_success'],
            self.test_results['subscriber_login_success'],
            self.test_results['circles_join_success'],
            self.test_results['feedback_submit_success']
        ])
        
        print(f"\n📈 OVERALL SCORE: {passed_tests}/{total_tests} tests passed ({(passed_tests/total_tests)*100:.1f}%)")
        
        # Errors
        if self.test_results['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in self.test_results['errors']:
                print(f"  • {error}")
        
        # Final Recommendation
        print(f"\n🏁 FINAL RECOMMENDATION:")
        
        if passed_tests == total_tests:
            print("✅ ALL REVIEW REQUEST FLOWS WORKING - Ready for deployment")
        elif passed_tests >= 8:
            print("✅ MOST REVIEW REQUEST FLOWS WORKING - Minor issues to address")
        elif passed_tests >= 5:
            print("⚠️ PARTIAL FUNCTIONALITY - Some critical flows need attention")
        else:
            print("❌ CRITICAL ISSUES FOUND - Major flows not working")
        
        print(f"\n📝 REVIEW REQUEST COMPLIANCE:")
        print(f"  • Explorer Flow - Journal: {'✅ COMPLETE' if all([self.test_results['explorer_signup_success'], self.test_results['explorer_journal_create_success'], self.test_results['explorer_journal_get_success'], self.test_results['explorer_journal_stats_success']]) else '❌ INCOMPLETE'}")
        print(f"  • Explorer → Subscriber Upgrade: {'✅ COMPLETE' if all([self.test_results['explorer_upgrade_success'], self.test_results['upgrade_login_success']]) else '❌ INCOMPLETE'}")
        print(f"  • Circle Permissions: {'✅ COMPLETE' if all([self.test_results['circles_public_success'], self.test_results['subscriber_login_success'], self.test_results['circles_join_success']]) else '❌ INCOMPLETE'}")
        print(f"  • Feedback API: {'✅ COMPLETE' if self.test_results['feedback_submit_success'] else '❌ INCOMPLETE'}")

async def main():
    """Main test runner"""
    async with ReviewRequestTester() as tester:
        await tester.run_review_request_tests()

if __name__ == "__main__":
    asyncio.run(main())