# AriOme Application - Screen Documentation

## Overview
AriOme is a conscious-living mobile ecosystem designed for self-evolution and mindful reflection. This document provides an overview of all application screens.

---

## 1. Welcome Screen
**Route:** `/`

**Description:**
- Landing page introducing AriOme
- Features the AriOme logo with lotus/infinity symbol
- Tagline: "Your Path to Inner Peace"
- "Begin Your Journey" call-to-action button
- Dark, calming background with teal accent colors

**Purpose:** First impression and entry point to the application

---

## 2. Onboarding - Welcome Step
**Route:** `/onboarding`

**Description:**
- Warm welcome message: "Welcome to AriOme"
- Subtitle explaining the app's purpose
- Peaceful, minimalist design
- "Begin Your Journey" button to proceed

**Purpose:** Introduce users to the conscious living experience

---

## 3. Onboarding - Intention Selection
**Route:** `/onboarding` (Step 2)

**Description:**
- Header: "What brings you here?"
- 8 selectable intention chips:
  - 💗 Healing (Pink)
  - 🌱 Growth (Green)
  - 🙏 Gratitude (Amber)
  - 🧘 Presence (Purple)
  - 🤝 Trust (Blue)
  - 🎨 Creativity (Indigo)
  - 💞 Connection (Rose)
  - ☮️ Acceptance (Lime)
- Multi-select enabled with visual checkmarks
- "Continue to AriOme" button

**Purpose:** Personalize the user experience based on their intentions

---

## 4. Authentication - Login
**Route:** `/auth`

**Description:**
- Header with AriOme logo and back button
- "Welcome Back" title
- "Continue your inner journey" subtitle
- Google OAuth button: "Continue with Google"
- Divider with "or"
- Email input field
- Password input field
- "Sign In" button (teal)
- Toggle link: "Don't have an account? Sign up"

**Purpose:** Allow returning users to access their account

---

## 5. Authentication - Register
**Route:** `/auth` (Register mode)

**Description:**
- "Create Account" title
- "Begin your path to self-awareness" subtitle
- Google OAuth button
- Name input field
- Email input field
- Password input field
- "Create Account" button
- Toggle link: "Already have an account? Sign in"

**Purpose:** Enable new users to create an account

---

## 6. Reflect Screen (Self-AriOme)
**Route:** `/(tabs)/reflect`

**Description:**
- Personalized greeting: "Welcome, [User Name]"
- Date display
- **Mood Check-in Section:**
  - "How are you feeling?" prompt
  - 10 mood options in scrollable row:
    - Peaceful, Grateful, Hopeful, Reflective, Joyful
    - Anxious, Sad, Energized, Curious, Content
  - Each mood has icon and color coding
- **Today's Reflection:**
  - Daily reflection prompt card
  - Example: "What can you let go of from today to rest more peacefully?"
- **Your Journey Stats:**
  - Reflections count
  - Day Streak counter
- Bottom tab navigation

**Purpose:** Core daily reflection and emotional check-in hub

---

## 7. Practices Screen
**Route:** `/(tabs)/practices`

**Description:**
- Header with AriOme branding
- **Category Filters:** (horizontal scroll)
  - All, Breathwork, Stillness, Gratitude, Body
- **Practice Cards:**
  - Each card displays:
    - Practice title
    - Duration (e.g., "5 min")
    - Category tag
    - Description
  - Sample practices:
    - Box Breathing (Breathwork)
    - Morning Stillness (Stillness)
    - Gratitude Meditation (Gratitude)
    - Body Scan (Body)
    - 4-7-8 Breathing (Breathwork)
- Tap to open detailed practice view

**Purpose:** Access guided mindfulness and wellness practices

---

## 8. Wisdom Library Screen
**Route:** `/(tabs)/wisdom`

**Description:**
- Header with AriOme branding
- **Wisdom Cards:**
  - Quote/wisdom text
  - Author attribution
  - "Tap to reflect" prompt
  - Resonance counter (heart icon)
- **Sample Wisdom:**
  - "The only way to do great work..." - Steve Jobs
  - "In the middle of difficulty lies opportunity" - Albert Einstein
  - "Breathing in, I calm my body..." - Thich Nhat Hanh
  - "The present moment is all you have" - Eckhart Tolle
- **Reflect-after-consume flow:**
  - "This resonates" button
  - Reflection prompt after reading

**Purpose:** Curated wisdom and quotes for daily inspiration

---

## 9. Journal Screen
**Route:** `/(tabs)/journal`

**Description:**
- "Your Journal" header
- **For Authenticated Users:**
  - List of past reflections with dates
  - "+" floating action button to create new entry
  - **New Reflection Modal:**
    - Mood selection (Before/After)
    - Text input area
    - Voice recording button (microphone icon)
    - Uses OpenAI Whisper for transcription
- **For Unauthenticated Users:**
  - "Sign In" prompt
  - Message about private journaling

**Purpose:** Private space for written and voice reflections

---

## 10. Circles Screen (Community)
**Route:** `/(tabs)/circles`

**Description:**
- Header with AriOme branding
- **For Unauthenticated Users:**
  - "Sign up to join circles" notice banner
- **Intention Filter Chips:** (horizontal scroll)
  - All, Healing, Resilience, Love, Mindfulness, Growth, Joy, Gratitude
- **Circle Cards:**
  - Circle name and description
  - Intention badge with color coding
  - Member count
  - Post count
  - "Join" button (locked for guests, active for members)
- **Sample Circles:**
  - Healing Hearts (42 members, 128 posts)
  - Mindful Mornings (67 members, 256 posts)
  - Growth Mindset (89 members, 312 posts)
  - Gratitude Circle (54 members, 445 posts)
  - Joy Seekers (38 members, 167 posts)
  - Resilience Warriors (31 members, 94 posts)

**Purpose:** Community spaces for connecting with like-minded individuals

---

## 11. Profile Screen
**Route:** `/(tabs)/profile`

**Description:**
- User avatar/picture
- User name and email
- **Settings Options:**
  - Edit Profile
  - Intentions (update preferences)
  - Language settings
  - Notifications
  - Privacy settings
- Logout button
- App version info

**Purpose:** User account management and settings

---

## Design System

### Colors
- **Background Deep:** #0A0A0F (Near black)
- **Background Secondary:** #1A1A24 (Dark gray)
- **Primary Accent (Teal):** #14B8A6
- **Text Primary:** #FFFFFF
- **Text Muted:** #9CA3AF
- **Semantic Success:** #10B981
- **Semantic Error:** #EF4444

### Typography
- **Headings:** Light weight (300), large sizes
- **Body:** Regular weight, readable sizes
- **Accent:** Medium weight for buttons and links

### Spacing
- Consistent padding and margins
- Card-based layouts
- Generous whitespace for calm aesthetic

---

## Navigation Structure

```
App
├── / (Welcome)
├── /onboarding
├── /auth
└── /(tabs)/
    ├── reflect (Home)
    ├── practices
    ├── wisdom
    ├── journal
    ├── circles
    └── profile
```

---

## Technical Notes

- **Framework:** Expo (React Native for Web)
- **Navigation:** Expo Router with tab-based navigation
- **Styling:** StyleSheet API with theme constants
- **State Management:** React Context (AuthContext)
- **API:** Axios with AsyncStorage for token management

---

*Document generated: January 2025*
*AriOme - Your Path to Inner Peace*
