# AriOme - Conscious Living Ecosystem

## Original Problem Statement
Build a self-evolution and conscious-living mobile ecosystem called AriOme. The app should provide rich media content (videos, audio) for mindfulness, feature mood-based content discovery, community circles, journaling, and role-based access (Explorer vs Subscriber).

## User Roles
1. **Explorer** - Free user, can view/preview content (15-20 seconds)
2. **Subscriber** - Paid user, full access to all content
3. **Creator** - Can upload content + subscriber features
4. **Admin** - Full access + user management

## What's Been Implemented

### Core Features (DONE) ✅
- UI/UX overhaul to "calm, zen, premium" aesthetic
- Authentication system (login, signup, Google Auth)
- Home/Reflect screen with mood selection and daily prompts
- **Explore screen with 46 video/audio content items** (Fixed Jan 29, 2026)
  - YouTube video embeds playing IN-APP via iframe
  - HTML5 audio player for audio content
  - Mood-based filtering (7 moods)
  - Premium badges and resonance counts
- Practices screen with guided content
- Journal screen with voice-to-text (OpenAI Whisper)
- Circles/Community feature (6 circles with intention filters)
- **Subscription page** with Monthly ($9.99) and Yearly ($79.99) plans
- AriOme logo on all screens
- 5-tab navigation (Home, Explore, Practice, Journal, Circles)

### Content Count
- **Wisdom items:** 24
- **Practice items:** 22
- **Total:** 46 rich media items

### Backend APIs (DONE) ✅
- `/api/wisdom` - Wisdom content with mood filtering
- `/api/practices` - Practice content with mood filtering
- `/api/circles` - Community circles CRUD
- `/api/circles/{id}/posts` - Circle post feed
- `/api/bookmarks` - User bookmarks
- `/api/reflections` - Journal entries
- `/api/auth/*` - Authentication endpoints
- `/api/admin/*` - Admin dashboard APIs
- `/api/creator/*` - Creator dashboard APIs

## Bugs Fixed (Jan 29, 2026)
1. ✅ Video player now uses iframe (was opening YouTube in new tab)
2. ✅ Subscription page created (was 404)
3. ✅ Circles page fixed (`userRole` undefined error)
4. ✅ Added 25 more content items (total 46)
5. ✅ Explore screen blank issue fixed (stale dist build)

## Prioritized Backlog

### P0 - Critical
- [ ] **Explorer vs Subscriber Preview System** - Auto-pause after 15-20 seconds for non-subscribers

### P1 - High Priority
- [ ] Complete Circle Post Feed UI (`/app/frontend/app/circle/[id].tsx`)
- [ ] Privacy & Settings screen (data export, account deletion)

### P2 - Medium Priority
- [ ] Admin Dashboard UI (user management, stats visualization)
- [ ] Creator Dashboard UI (content upload functionality)

### P3 - Low Priority
- [ ] Light/Dark mode toggle
- [ ] Notification preferences
- [ ] Subscription payment integration (Stripe/Razorpay)

## Technical Architecture
- **Frontend**: Expo (React Native Web), TypeScript, expo-router
- **Backend**: FastAPI (Python), Motor (async MongoDB)
- **Database**: MongoDB
- **Auth**: JWT + Google OAuth
- **Media**: YouTube embeds (iframe), HTML5 audio

## Key Files
- `/app/backend/server.py` - Monolithic backend (~900 lines)
- `/app/frontend/app/(tabs)/explore.tsx` - Explore screen with video/audio player
- `/app/frontend/app/subscription.tsx` - Subscription plans page
- `/app/frontend/app/(tabs)/circles.tsx` - Circles screen (fixed)
- `/app/frontend/constants/theme.ts` - Design system

## Test Credentials
- **User**: test@ariome.com / test1234
- **Admin**: admin@ariome.com / admin123

## Last Test Report
- **Date**: Jan 29, 2026
- **Success Rate**: 95%
- **Report**: `/app/test_reports/iteration_1.json`
