# AriOme - Conscious Living Ecosystem

## Original Problem Statement
Build a self-evolution and conscious-living mobile ecosystem called AriOme. The app should provide rich media content (videos, audio) for mindfulness, feature mood-based content discovery, community circles, journaling, and role-based access (Explorer vs Subscriber).

## What's Been Implemented

### Core Features (DONE)
- ✅ UI/UX overhaul to "calm, zen, premium" aesthetic
- ✅ Authentication system (login, signup, Google Auth)
- ✅ Home/Reflect screen with mood selection and daily prompts
- ✅ **Explore screen with video/audio content** (Fixed Jan 29, 2026)
  - YouTube video embeds
  - Mood-based filtering (Peaceful, Grateful, Hopeful, Joyful, Reflective, Anxious)
  - Premium badges
  - Resonance/like counts
- ✅ Practices screen with guided content
- ✅ Journal screen with voice-to-text (OpenAI Whisper)
- ✅ Circles/Community feature (view, join, create circles)
- ✅ AriOme logo on all screens
- ✅ 5-tab navigation (Home, Explore, Practice, Journal, Circles)

### Backend APIs (DONE)
- `/api/wisdom` - Wisdom content with mood filtering
- `/api/practices` - Practice content with mood filtering
- `/api/circles` - Community circles CRUD
- `/api/circles/{id}/posts` - Circle post feed
- `/api/bookmarks` - User bookmarks
- `/api/reflections` - Journal entries
- `/api/auth/*` - Authentication endpoints
- `/api/admin/*` - Admin dashboard APIs
- `/api/creator/*` - Creator dashboard APIs

### Database Collections
- users, circles, circle_posts, bookmarks, wisdom, practices, reflections

## Bugs Fixed
- **Jan 29, 2026**: Fixed Explore screen blank/white issue
  - Root cause: Stale dist folder with hardcoded wrong URL
  - Fix: Rebuilt dist with correct URLs

## Prioritized Backlog

### P0 - Critical
- [ ] **Explorer vs Subscriber Preview System** - Limit non-subscribers to 15-20 second content previews

### P1 - High Priority
- [ ] Complete Circle Post Feed UI (`/app/frontend/app/circle/[id].tsx`)
- [ ] Privacy & Settings screen (data export, account deletion)

### P2 - Medium Priority
- [ ] Admin Dashboard UI (user management, stats visualization)
- [ ] Creator Dashboard UI (content upload functionality)

### P3 - Low Priority
- [ ] Light/Dark mode toggle
- [ ] Notification preferences
- [ ] Live Sessions & Events for Circles
- [ ] Moderation tools
- [ ] Subscription/commerce layer

## Technical Architecture
- **Frontend**: Expo (React Native Web), TypeScript, expo-router
- **Backend**: FastAPI (Python), Motor (async MongoDB)
- **Database**: MongoDB
- **Auth**: JWT + Google OAuth
- **Media**: YouTube embeds, Pixabay audio

## Key Files
- `/app/backend/server.py` - Monolithic backend (~900 lines, needs refactoring)
- `/app/frontend/app/(tabs)/explore.tsx` - Explore screen with video content
- `/app/frontend/constants/theme.ts` - Design system
- `/app/frontend/services/api.ts` - API client

## Test Credentials
- **User**: test@ariome.com / test1234
- **Admin**: admin@ariome.com / admin123
