# ARIOME - AAB Build Instructions

## Pre-requisites

### 1. Accounts Needed
- **Expo Account** (FREE): https://expo.dev - Sign up
- **Google Play Developer Account** ($25 one-time): https://play.google.com/console

### 2. Software Required
- Node.js 18+ (https://nodejs.org)
- Git (https://git-scm.com)

---

## Step-by-Step AAB Build

### Step 1: Clone the Repository
```bash
# After saving to GitHub from Emergent
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/frontend
```

### Step 2: Install Dependencies
```bash
npm install -g eas-cli
npm install
```

### Step 3: Login to Expo
```bash
eas login
# Enter your Expo credentials
```

### Step 4: Configure the Project
```bash
eas build:configure
# Select 'All' or 'Android' when prompted
```

### Step 5: Build AAB (Production)
```bash
eas build --platform android --profile production
```

**What happens:**
- Build queued on Expo's cloud servers
- Takes ~15-20 minutes
- You'll receive a download link when complete

### Step 6: Download AAB
- Click the link provided in terminal
- Or visit: https://expo.dev → Your Project → Builds

---

## Upload to Google Play Store

### Step 1: Go to Google Play Console
https://play.google.com/console

### Step 2: Create New App
- Click "Create app"
- Enter app name: "ARIOME - Conscious Living"
- Select "App" (not game)
- Choose "Free" or "Paid"

### Step 3: Complete Store Listing
- **App name**: ARIOME - Conscious Living
- **Short description**: Copy from APP_DESCRIPTION.md
- **Full description**: Copy from APP_DESCRIPTION.md
- **Screenshots**: Upload from /playstore/screenshots/
- **Feature graphic**: Upload feature_graphic.png

### Step 4: Upload AAB
- Go to "Production" → "Create new release"
- Upload the .aab file
- Fill release notes

### Step 5: Content Rating
- Complete the questionnaire
- ARIOME should qualify for "Everyone"

### Step 6: Submit for Review
- Review all sections (green checkmarks)
- Click "Submit for review"
- Google review takes 1-3 days

---

## Play Store Assets Checklist

| Asset | Specification | Status |
|-------|---------------|--------|
| Feature Graphic | 1024 x 500 PNG | ✅ Generated |
| App Icon | 512 x 512 PNG | ✅ In assets |
| Phone Screenshots | 1080 x 1920 (min 2) | ✅ 5 captured |
| Short Description | 80 chars max | ✅ Written |
| Full Description | 4000 chars max | ✅ Written |

---

## Troubleshooting

### "Build failed" error
```bash
eas build --platform android --profile production --clear-cache
```

### "Not logged in" error
```bash
eas logout
eas login
```

### Need APK instead of AAB
```bash
eas build --platform android --profile preview
```

---

## Support
- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Google Play Help: https://support.google.com/googleplay/android-developer

