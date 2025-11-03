# ARIOME Complete Testing Guide

## 📋 Test User Credentials

**All passwords: `test123`**

### 1. Explorer Role
- **Email:** explorer@ariome-test.com
- **Name:** Explorer User
- **Access:** Basic features, free content

### 2. Subscriber Role (Premium)
- **Email:** subscriber@ariome-test.com  
- **Name:** Subscriber Pro
- **Access:** Premium content, ad-free experience

### 3. Admin Role (Seenas)
- **Email:** admin@ariome-test.com
- **Name:** Seenas Admin
- **Access:** Full platform control, moderation

### 4. Creator Role
- **Email:** creator@ariome-test.com
- **Name:** Creator Artist
- **Access:** Content upload, analytics, earnings

### 5. Evaluator/Moderator Role
- **Email:** evaluator@ariome-test.com
- **Name:** Evaluator Mod
- **Access:** Content review, approval workflow

---

## 🧪 Testing Checklist by Role

### EXPLORER Testing
- [ ] Login with explorer@ariome-test.com
- [ ] Browse discover feed (49 stories available)
- [ ] Filter by intention (Healing, Resilience, Love, Mindfulness, Growth, Joy, Gratitude)
- [ ] Play video story (YouTube playback)
- [ ] Play audio story (Audio playback)
- [ ] Add resonance (like) to stories
- [ ] Create journal entry
- [ ] View journal stats
- [ ] Browse circles (3 test circles available)
- [ ] Join a circle
- [ ] View posts in circle
- [ ] Edit profile (name, bio, avatar)
- [ ] Change password
- [ ] View profile stats

### SUBSCRIBER Testing
- [ ] Login with subscriber@ariome-test.com
- [ ] Access premium content
- [ ] All Explorer features
- [ ] Ad-free experience
- [ ] Premium badge display
- [ ] Subscription status visible

### ADMIN Testing (Seenas)
- [ ] Login with admin@ariome-test.com
- [ ] View admin dashboard
- [ ] Moderate content
- [ ] Approve/reject creator uploads
- [ ] Manage users
- [ ] View platform analytics
- [ ] Access all circles and posts

### CREATOR Testing
- [ ] Login with creator@ariome-test.com
- [ ] View creator dashboard
- [ ] See analytics (plays, resonance, earnings)
- [ ] Upload new story
- [ ] View "My Stories" list
- [ ] Check story status (published/pending/rejected)
- [ ] Delete story
- [ ] View earnings
- [ ] Creator profile visible to others

### EVALUATOR Testing
- [ ] Login with evaluator@ariome-test.com
- [ ] View pending stories for review
- [ ] Approve story
- [ ] Reject story with reason
- [ ] View moderation queue
- [ ] Review circle posts
- [ ] Flag inappropriate content

---

## ✅ Database Status

- ✅ MongoDB connected and mounted properly
- ✅ 5 test users created (all roles)
- ✅ 49 stories seeded (7 per intention)
- ✅ 3 test circles created
- ✅ Sample journal entries added
- ✅ Creator profile configured
- ✅ All collections indexed

---

## 🔌 Backend API Status

All endpoints tested and working:
- ✅ Auth (login, signup, profile, password)
- ✅ Stories (list, get, resonance, recommendations)
- ✅ Journal (entries, reflections, stats)
- ✅ Circles (CRUD, join/leave, posts)
- ✅ Creator (upload, analytics, my-stories)

---

## 🎨 Logo Status

- ✅ SVG logo component created
- ✅ Used in welcome screen
- ✅ Used in onboarding
- ⚠️  May need PNG fallback for app icons
- ⚠️  Text rendering on mobile needs verification

---

## 🚀 Ready for Testing

**Services Running:**
- Backend: http://localhost:8001
- Frontend: http://localhost:3000
- MongoDB: Connected

**Test with provided credentials above**
