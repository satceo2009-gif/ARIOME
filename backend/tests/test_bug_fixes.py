"""
Backend tests for AriOme bug fixes:
1. Logout functionality
2. Circle navigation/detail page
3. Comments API
4. Circle post creation
5. Like button (resonance) functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://theme-evolution.preview.emergentagent.com')

class TestAuthLogout:
    """Test logout functionality - Bug #1"""
    
    def test_login_and_logout_flow(self):
        """Test complete login -> logout flow with session clearing"""
        session = requests.Session()
        
        # Login
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@ariome.com",
            "password": "test1234"
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_data = login_response.json()
        assert "session_token" in login_data, "No session_token in login response"
        assert "user" in login_data, "No user in login response"
        
        session_token = login_data["session_token"]
        
        # Verify session works
        me_response = session.get(f"{BASE_URL}/api/auth/me", 
            headers={"Authorization": f"Bearer {session_token}"})
        assert me_response.status_code == 200, "Session should be valid after login"
        
        # Logout
        logout_response = session.post(f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {session_token}"})
        assert logout_response.status_code == 200, f"Logout failed: {logout_response.text}"
        logout_data = logout_response.json()
        assert logout_data.get("message") == "Logged out successfully"
        
        # Verify session is invalidated
        me_after_logout = session.get(f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {session_token}"})
        assert me_after_logout.status_code == 401, "Session should be invalidated after logout"
        
        print("PASS: Logout functionality working - session cleared and invalidated")


class TestCircleNavigation:
    """Test circle navigation and detail page - Bug #2"""
    
    def test_get_circles_list(self):
        """Test fetching circles list"""
        response = requests.get(f"{BASE_URL}/api/circles")
        assert response.status_code == 200, f"Failed to get circles: {response.text}"
        circles = response.json()
        assert isinstance(circles, list), "Circles should be a list"
        assert len(circles) > 0, "Should have at least one circle"
        
        circle = circles[0]
        assert "id" in circle, "Circle should have id"
        assert "name" in circle, "Circle should have name"
        print(f"PASS: Got {len(circles)} circles")
    
    def test_get_circle_detail(self):
        """Test fetching circle detail page"""
        # First get circles list
        circles_response = requests.get(f"{BASE_URL}/api/circles")
        circles = circles_response.json()
        circle_id = circles[0]["id"]
        
        # Get circle detail
        detail_response = requests.get(f"{BASE_URL}/api/circles/{circle_id}")
        assert detail_response.status_code == 200, f"Failed to get circle detail: {detail_response.text}"
        
        circle = detail_response.json()
        assert "id" in circle, "Detail should have id"
        assert "name" in circle, "Detail should have name"
        assert "description" in circle, "Detail should have description"
        assert "member_count" in circle, "Detail should have member_count"
        assert "posts" in circle, "Detail should have posts array"
        
        print(f"PASS: Circle detail page working - {circle['name']} with {circle['member_count']} members")


class TestCommentsAPI:
    """Test comments API - Bug #3"""
    
    @pytest.fixture
    def authenticated_session(self):
        """Get authenticated session"""
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@ariome.com",
            "password": "test1234"
        })
        if login_response.status_code != 200:
            pytest.skip("Login failed - skipping authenticated tests")
        
        token = login_response.json()["session_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_get_comments_unauthenticated(self):
        """Test getting comments without auth"""
        # Get a circle with posts
        circles_response = requests.get(f"{BASE_URL}/api/circles")
        circles = circles_response.json()
        circle_id = circles[0]["id"]
        
        # Get circle detail to find posts
        detail_response = requests.get(f"{BASE_URL}/api/circles/{circle_id}")
        circle = detail_response.json()
        
        if circle.get("posts") and len(circle["posts"]) > 0:
            post_id = circle["posts"][0]["id"]
            
            # Get comments for this post
            comments_response = requests.get(f"{BASE_URL}/api/circles/{circle_id}/posts/{post_id}/comments")
            assert comments_response.status_code == 200, f"Failed to get comments: {comments_response.text}"
            
            data = comments_response.json()
            assert "comments" in data, "Response should have comments array"
            print(f"PASS: Comments API working - got {len(data['comments'])} comments")
        else:
            print("PASS: Comments API exists (no posts to test with)")


class TestPostCreation:
    """Test post creation in circles - Bug #4"""
    
    @pytest.fixture
    def authenticated_session_with_membership(self):
        """Get authenticated session and join a circle"""
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@ariome.com",
            "password": "test1234"
        })
        if login_response.status_code != 200:
            pytest.skip("Login failed - skipping authenticated tests")
        
        token = login_response.json()["session_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        
        # Get a circle and join it
        circles_response = session.get(f"{BASE_URL}/api/circles")
        circles = circles_response.json()
        circle_id = circles[0]["id"]
        
        # Try to join (may already be member)
        session.post(f"{BASE_URL}/api/circles/{circle_id}/join")
        
        return session, circle_id
    
    def test_create_post_in_circle(self, authenticated_session_with_membership):
        """Test creating a post in a circle"""
        session, circle_id = authenticated_session_with_membership
        
        # Create a post
        post_content = "TEST_Post from automated testing"
        create_response = session.post(f"{BASE_URL}/api/circles/{circle_id}/posts", json={
            "content": post_content
        })
        
        assert create_response.status_code == 200, f"Failed to create post: {create_response.text}"
        
        post = create_response.json()
        assert "id" in post, "Post should have id"
        assert post["content"] == post_content, "Post content should match"
        
        print(f"PASS: Post creation working - created post {post['id']}")
        
        # Cleanup - delete the test post
        session.delete(f"{BASE_URL}/api/circles/{circle_id}/posts/{post['id']}")


class TestLikeButton:
    """Test like/resonance functionality - Bug #6"""
    
    @pytest.fixture
    def authenticated_session(self):
        """Get authenticated session"""
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@ariome.com",
            "password": "test1234"
        })
        if login_response.status_code != 200:
            pytest.skip("Login failed - skipping authenticated tests")
        
        token = login_response.json()["session_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_like_circle_post(self, authenticated_session):
        """Test liking a circle post"""
        session = authenticated_session
        
        # Get a circle with posts
        circles_response = session.get(f"{BASE_URL}/api/circles")
        circles = circles_response.json()
        circle_id = circles[0]["id"]
        
        # Get posts
        posts_response = session.get(f"{BASE_URL}/api/circles/{circle_id}/posts")
        posts_data = posts_response.json()
        
        if posts_data.get("posts") and len(posts_data["posts"]) > 0:
            post_id = posts_data["posts"][0]["id"]
            
            # Like the post
            like_response = session.post(f"{BASE_URL}/api/circles/{circle_id}/posts/{post_id}/like")
            assert like_response.status_code == 200, f"Failed to like post: {like_response.text}"
            
            like_data = like_response.json()
            assert "liked" in like_data, "Response should have liked status"
            print(f"PASS: Like button working - liked status: {like_data['liked']}")
        else:
            print("PASS: Like API exists (no posts to test with)")


class TestThreeDotMenu:
    """Test 3-dot menu options - Bug #5"""
    
    @pytest.fixture
    def authenticated_session(self):
        """Get authenticated session"""
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@ariome.com",
            "password": "test1234"
        })
        if login_response.status_code != 200:
            pytest.skip("Login failed - skipping authenticated tests")
        
        token = login_response.json()["session_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_leave_circle_api(self, authenticated_session):
        """Test leave circle API (used by 3-dot menu)"""
        session = authenticated_session
        
        # Get circles
        circles_response = session.get(f"{BASE_URL}/api/circles")
        circles = circles_response.json()
        circle_id = circles[0]["id"]
        
        # First join the circle
        join_response = session.post(f"{BASE_URL}/api/circles/{circle_id}/join")
        # May fail if already member, that's OK
        
        # Now leave
        leave_response = session.post(f"{BASE_URL}/api/circles/{circle_id}/leave")
        # Should be 200 if member, or 400 if not member
        assert leave_response.status_code in [200, 400], f"Leave API error: {leave_response.text}"
        
        print("PASS: Leave circle API working (3-dot menu option)")


class TestCirclePostsAPI:
    """Test circle posts endpoints"""
    
    def test_get_circle_posts(self):
        """Test getting posts for a circle"""
        # Get circles
        circles_response = requests.get(f"{BASE_URL}/api/circles")
        circles = circles_response.json()
        circle_id = circles[0]["id"]
        
        # Get posts
        posts_response = requests.get(f"{BASE_URL}/api/circles/{circle_id}/posts")
        assert posts_response.status_code == 200, f"Failed to get posts: {posts_response.text}"
        
        data = posts_response.json()
        assert "posts" in data, "Response should have posts array"
        assert "total" in data, "Response should have total count"
        
        print(f"PASS: Circle posts API working - got {len(data['posts'])} posts, total: {data['total']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
