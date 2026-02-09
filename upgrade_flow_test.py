#!/usr/bin/env python3
"""
ARIOME Explorer to Subscriber Upgrade Flow Testing
Tests the specific upgrade flow requested in the review
"""

import asyncio
import aiohttp
import json
import os
import time
from typing import Dict, Any

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://theme-evolution.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials from review request
ALREADY_UPGRADED_EMAIL = "upgrade-test@example.com"
ALREADY_UPGRADED_PASSWORD = "newpass123"

class UpgradeFlowTester:
    def __init__(self):
        self.session = None
        self.test_results = {
            'explorer_creation_success': False,
            'upgrade_success': False,
            'login_after_upgrade_success': False,
            'duplicate_upgrade_blocked': False,
            'nonexistent_user_upgrade_blocked': False,
            'errors': [],
            'critical_failures': []
        }
        self.new_explorer_email = f"test-explorer-upgrade-{int(time.time())}@ariome.com"
        self.new_explorer_name = "Test Explorer User"
        self.new_explorer_password = "newpassword123"
    
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
    
    async def test_create_explorer(self):
        """Test 1: Create a new explorer using POST /api/auth/email-signup"""
        print("\n🔍 Test 1: Creating new explorer with email-only signup...")
        try:
            headers = {'Content-Type': 'application/json'}
            
            email_data = {
                "email": self.new_explorer_email
            }
            
            async with self.session.post(f"{API_BASE}/auth/email-signup", 
                                       json=email_data, 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'user_id' in data and 'message' in data:
                        self.test_results['explorer_creation_success'] = True
                        print(f"✅ Explorer created successfully: {data}")
                        return True
                    else:
                        error_msg = "Explorer creation response missing user_id or message"
                        self.test_results['errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Explorer creation failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Explorer creation API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_upgrade_explorer_to_subscriber(self):
        """Test 2: Upgrade the explorer to subscriber using POST /api/auth/upgrade-to-subscriber"""
        print("\n🔍 Test 2: Upgrading explorer to subscriber...")
        try:
            headers = {'Content-Type': 'application/json'}
            
            upgrade_data = {
                "email": self.new_explorer_email,
                "name": self.new_explorer_name,
                "password": self.new_explorer_password
            }
            
            async with self.session.post(f"{API_BASE}/auth/upgrade-to-subscriber", 
                                       json=upgrade_data, 
                                       headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'access_token' in data and data.get('user', {}).get('role') == 'subscriber':
                        self.test_results['upgrade_success'] = True
                        self.access_token = data['access_token']
                        print(f"✅ Upgrade successful: {data}")
                        return True
                    else:
                        error_msg = "Upgrade response missing access_token or user is not subscriber"
                        self.test_results['errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Upgrade failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Upgrade API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_login_after_upgrade(self):
        """Test 3: Verify the user can now login with the new password"""
        print("\n🔍 Test 3: Testing login with new password after upgrade...")
        try:
            # Prepare form data for login
            form_data = aiohttp.FormData()
            form_data.add_field('username', self.new_explorer_email)
            form_data.add_field('password', self.new_explorer_password)
            
            async with self.session.post(f"{API_BASE}/auth/login", data=form_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'access_token' in data and data.get('user', {}).get('role') == 'subscriber':
                        self.test_results['login_after_upgrade_success'] = True
                        print(f"✅ Login after upgrade successful: User is now a subscriber")
                        return True
                    else:
                        error_msg = "Login after upgrade response missing access_token or user is not subscriber"
                        self.test_results['errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Login after upgrade failed with status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Login after upgrade API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_duplicate_upgrade_blocked(self):
        """Test 4: Try upgrading the same user again - should fail with 'already has a password' error"""
        print("\n🔍 Test 4: Testing duplicate upgrade (should fail)...")
        try:
            headers = {'Content-Type': 'application/json'}
            
            upgrade_data = {
                "email": self.new_explorer_email,
                "name": "Another Name",
                "password": "anotherpassword123"
            }
            
            async with self.session.post(f"{API_BASE}/auth/upgrade-to-subscriber", 
                                       json=upgrade_data, 
                                       headers=headers) as response:
                if response.status == 400:
                    error_text = await response.text()
                    if "already has a password" in error_text or "login instead" in error_text:
                        self.test_results['duplicate_upgrade_blocked'] = True
                        print(f"✅ Duplicate upgrade correctly blocked: {error_text}")
                        return True
                    else:
                        error_msg = f"Duplicate upgrade blocked but with unexpected error: {error_text}"
                        self.test_results['errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Duplicate upgrade should have failed but got status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Duplicate upgrade test API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_nonexistent_user_upgrade_blocked(self):
        """Test 5: Try upgrading a non-existent user - should fail with 'not found' error"""
        print("\n🔍 Test 5: Testing upgrade of non-existent user (should fail)...")
        try:
            headers = {'Content-Type': 'application/json'}
            
            upgrade_data = {
                "email": "nonexistent-user@ariome.com",
                "name": "Non Existent",
                "password": "somepassword123"
            }
            
            async with self.session.post(f"{API_BASE}/auth/upgrade-to-subscriber", 
                                       json=upgrade_data, 
                                       headers=headers) as response:
                if response.status == 404:
                    error_text = await response.text()
                    if "not found" in error_text.lower() or "sign up first" in error_text.lower():
                        self.test_results['nonexistent_user_upgrade_blocked'] = True
                        print(f"✅ Non-existent user upgrade correctly blocked: {error_text}")
                        return True
                    else:
                        error_msg = f"Non-existent user upgrade blocked but with unexpected error: {error_text}"
                        self.test_results['errors'].append(error_msg)
                        print(f"❌ {error_msg}")
                        return False
                else:
                    error_text = await response.text()
                    error_msg = f"Non-existent user upgrade should have failed but got status {response.status}: {error_text}"
                    self.test_results['errors'].append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
        except Exception as e:
            error_msg = f"Non-existent user upgrade test API request failed: {e}"
            self.test_results['critical_failures'].append(error_msg)
            print(f"❌ {error_msg}")
            return False
    
    async def test_already_upgraded_user_login(self):
        """Bonus Test: Verify the already upgraded test user can login"""
        print("\n🔍 Bonus Test: Testing login with already upgraded test credentials...")
        try:
            # Prepare form data for login
            form_data = aiohttp.FormData()
            form_data.add_field('username', ALREADY_UPGRADED_EMAIL)
            form_data.add_field('password', ALREADY_UPGRADED_PASSWORD)
            
            async with self.session.post(f"{API_BASE}/auth/login", data=form_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'access_token' in data:
                        print(f"✅ Already upgraded user login successful: {data.get('user', {}).get('email')}")
                        return True
                    else:
                        print(f"⚠️ Already upgraded user login response missing access_token")
                        return False
                else:
                    error_text = await response.text()
                    print(f"⚠️ Already upgraded user login failed with status {response.status}: {error_text}")
                    return False
        except Exception as e:
            print(f"⚠️ Already upgraded user login test failed: {e}")
            return False
    
    async def run_upgrade_flow_tests(self):
        """Run all upgrade flow tests"""
        print("🚀 Starting ARIOME Explorer to Subscriber Upgrade Flow Testing\n")
        
        # Test backend health
        if not await self.test_health_endpoint():
            return
        
        # Test the upgrade flow
        print("\n" + "="*60)
        print("📋 EXPLORER TO SUBSCRIBER UPGRADE FLOW TESTS")
        print("="*60)
        
        # Test 1: Create explorer
        await self.test_create_explorer()
        
        # Test 2: Upgrade explorer to subscriber
        if self.test_results['explorer_creation_success']:
            await self.test_upgrade_explorer_to_subscriber()
        else:
            print("⚠️ Skipping upgrade test - explorer creation failed")
        
        # Test 3: Login after upgrade
        if self.test_results['upgrade_success']:
            await self.test_login_after_upgrade()
        else:
            print("⚠️ Skipping login test - upgrade failed")
        
        # Test 4: Try duplicate upgrade (should fail)
        if self.test_results['upgrade_success']:
            await self.test_duplicate_upgrade_blocked()
        else:
            print("⚠️ Skipping duplicate upgrade test - initial upgrade failed")
        
        # Test 5: Try upgrading non-existent user (should fail)
        await self.test_nonexistent_user_upgrade_blocked()
        
        # Bonus: Test already upgraded user
        await self.test_already_upgraded_user_login()
        
        # Print final report
        await self.print_final_report()
    
    async def print_final_report(self):
        """Print upgrade flow test report"""
        print("\n" + "="*60)
        print("📋 UPGRADE FLOW TEST REPORT")
        print("="*60)
        
        # Test Results Summary
        print(f"\n📊 TEST RESULTS SUMMARY:")
        print(f"1. Explorer Creation (Email Signup): {'✅ PASS' if self.test_results['explorer_creation_success'] else '❌ FAIL'}")
        print(f"2. Explorer to Subscriber Upgrade: {'✅ PASS' if self.test_results['upgrade_success'] else '❌ FAIL'}")
        print(f"3. Login After Upgrade: {'✅ PASS' if self.test_results['login_after_upgrade_success'] else '❌ FAIL'}")
        print(f"4. Duplicate Upgrade Blocked: {'✅ PASS' if self.test_results['duplicate_upgrade_blocked'] else '❌ FAIL'}")
        print(f"5. Non-existent User Upgrade Blocked: {'✅ PASS' if self.test_results['nonexistent_user_upgrade_blocked'] else '❌ FAIL'}")
        
        # Count successes
        total_tests = 5
        passed_tests = sum([
            self.test_results['explorer_creation_success'],
            self.test_results['upgrade_success'],
            self.test_results['login_after_upgrade_success'],
            self.test_results['duplicate_upgrade_blocked'],
            self.test_results['nonexistent_user_upgrade_blocked']
        ])
        
        print(f"\n📈 OVERALL SCORE: {passed_tests}/{total_tests} tests passed ({(passed_tests/total_tests)*100:.1f}%)")
        
        # Errors and Issues
        if self.test_results['critical_failures']:
            print(f"\n🚨 CRITICAL FAILURES:")
            for error in self.test_results['critical_failures']:
                print(f"  • {error}")
        
        if self.test_results['errors']:
            print(f"\n❌ API ERRORS:")
            for error in self.test_results['errors']:
                print(f"  • {error}")
        
        # Final Recommendation
        print(f"\n🏁 FINAL RECOMMENDATION:")
        
        critical_issues = len(self.test_results['critical_failures'])
        api_issues = len(self.test_results['errors'])
        
        if critical_issues == 0 and passed_tests >= 4:
            print("✅ UPGRADE FLOW WORKING - Explorer to Subscriber upgrade functionality operational")
        elif critical_issues > 0:
            print("❌ CRITICAL ISSUES FOUND - Upgrade flow has system failures")
        else:
            print("⚠️ PARTIAL FUNCTIONALITY - Some upgrade flow features working, others need attention")
        
        if critical_issues > 0:
            print(f"  • {critical_issues} critical system failures")
        if api_issues > 0:
            print(f"  • {api_issues} API functionality issues")

async def main():
    """Main test runner"""
    async with UpgradeFlowTester() as tester:
        await tester.run_upgrade_flow_tests()

if __name__ == "__main__":
    asyncio.run(main())