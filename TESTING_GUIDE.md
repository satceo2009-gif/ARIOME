# 🧪 ARIOME COMPLETE TESTING GUIDE

## 🔗 Access the App
**Web URL:** https://ariome-wellness.preview.emergentagent.com

---

## 🔐 TEST CREDENTIALS

### 1. ADMIN ACCOUNT
- **Email:** admin@ariome.com
- **Password:** admin123
- **Features to Test:**
  - Admin Dashboard
  - Approve/reject stories
  - View platform statistics
  - User management

### 2. CREATOR ACCOUNT
- **Email:** creator@ariome.com
- **Password:** creator123
- **Features to Test:**
  - Creator Dashboard
  - View analytics (plays, earnings, resonance)
  - Upload stories (coming soon UI)
  - Manage own stories

### 3. SUBSCRIBER ACCOUNT
- **Email:** subscriber@ariome.com
- **Password:** subscriber123
- **Features to Test:**
  - Access premium content
  - Subscription management
  - All explorer features
  - Billing settings

### 4. EXPLORER ACCOUNT
- **Email:** explorer@ariome.com
- **Password:** explorer123
- **Features to Test:**
  - Browse stories
  - Join circles
  - Write journal entries
  - Save favorite stories
  - Upgrade to subscriber option

---

## 📱 STEP-BY-STEP TESTING GUIDE

### 🎯 TEST 1: ADMIN EXPERIENCE

1. **Login as Admin:**
   - Open app → Click "Sign In"
   - Email: admin@ariome.com
   - Password: admin123
   - Login ✅

2. **Check Admin Dashboard:**
   - Go to Profile tab (bottom right)
   - See "Admin" badge (red with shield icon)
   - Click "Admin Dashboard"
   - View platform statistics:
     - Total Users
     - Total Creators
     - Total Stories
     - Pending Reviews

3. **Test Content Approval:**
   - In Admin Dashboard → "Pending Stories" tab
   - See list of stories awaiting approval
   - Click "Approve" on a story
   - Click "Reject" on a story (enter reason)
   - Refresh to see updated list

4. **Explore Settings:**
   - Profile → Settings
   - Toggle notifications
   - View privacy options
   - Logout

---

### 🎨 TEST 2: CREATOR EXPERIENCE

1. **Login as Creator:**
   - Logout from admin
   - Login with creator@ariome.com / creator123

2. **Check Creator Dashboard:**
   - Profile tab → See "Creator" badge (purple)
   - Click "Creator Dashboard"
   - View Analytics:
     - Published Stories count
     - Total Plays
     - Total Resonances
     - Earnings ($0.00 initially)

3. **View My Stories:**
   - Creator Dashboard → "My Stories" tab
   - See your published/pending stories
   - View story status (published/pending/rejected)
   - Check play counts and resonances

4. **Upload Feature:**
   - Creator Dashboard → "Upload" tab
   - See "Coming Soon" placeholder
   - (Feature will be implemented next)

5. **Test Settings:**
   - Profile → Settings
   - See same options as other roles
   - Logout

---

### 💎 TEST 3: SUBSCRIBER EXPERIENCE

1. **Login as Subscriber:**
   - Login with subscriber@ariome.com / subscriber123

2. **Check Subscriber Badge:**
   - Profile tab → See "Subscriber" badge (gold/orange with crown)
   - No "Upgrade" button (already subscribed)

3. **Test Premium Content:**
   - Discover tab → Browse stories
   - Premium stories show crown icon
   - Click on premium story → Should play (no payment required)

4. **Billing Management:**
   - Profile → Settings
   - See "Billing & Subscription" section
   - View "Payment Methods" option
   - View "Billing History" option
   - See "Cancel Subscription" option (test prompt only)

5. **Test All Explorer Features:**
   - Browse discover feed
   - Join a circle
   - Write journal entry
   - Play videos/audio

---

### 🧭 TEST 4: EXPLORER EXPERIENCE

1. **Login as Explorer:**
   - Login with explorer@ariome.com / explorer123

2. **Check Explorer Badge:**
   - Profile tab → See "Explorer" badge (teal with compass)
   - See "Upgrade to Subscriber" button

3. **Test Discover Feed:**
   - Discover tab → Browse stories
   - Filter by intention (top filters)
   - See VIDEO (red) and AUDIO (purple) badges
   - Click on a story → Play media
   - Like/resonate with story

4. **Test Community Circles:**
   - Circles tab (bottom navigation)
   - Filter circles by intention
   - See circle details:
     - Member count
     - Post count
   - Click "Join" on a circle
   - See "Joined" status update

5. **Test Journal:**
   - Journal tab (bottom navigation)
   - View "My Entries" tab
   - View "Story Reflections" tab
   - See stats (total entries, reflections)
   - Click "+" to create new entry (if implemented)

6. **Test Library:**
   - Library tab → See saved stories
   - View by intention filters

7. **Settings & Profile:**
   - Profile tab → View profile info
   - Click Settings → Toggle options
   - View Help & Support
   - View About ARIOME

---

## 🎬 TESTING SCENARIOS

### Scenario A: Admin Approving Content
1. Login as Creator
2. Upload story (or assume one is pending)
3. Logout
4. Login as Admin
5. Admin Dashboard → Approve the story
6. Logout
7. Login as Explorer
8. Discover feed → See the newly approved story ✅

### Scenario B: Explorer Upgrading to Subscriber
1. Login as Explorer
2. Profile → Click "Upgrade to Subscriber"
3. Choose plan (Monthly/Yearly)
4. Complete upgrade
5. See badge change to "Subscriber"
6. Access premium content ✅

### Scenario C: Social Interaction
1. Login as Explorer 1
2. Join "Mindfulness Circle"
3. Post a message
4. Logout
5. Login as Explorer 2
6. Join same circle
7. See Explorer 1's post
8. Like the post ✅

---

## ✅ WHAT TO VERIFY

### For Each Role:
- ✅ Login works
- ✅ Correct badge displays
- ✅ Role-specific menu items appear
- ✅ Role-specific dashboards accessible
- ✅ Settings work correctly
- ✅ Logout works

### For Content:
- ✅ 49 stories load (14 video, 35 audio)
- ✅ Format badges display correctly
- ✅ Media plays on click
- ✅ Reflection prompts show
- ✅ Like/resonance works

### For Social Features:
- ✅ Circles load
- ✅ Join/leave works
- ✅ Posts visible
- ✅ Like posts works

### For Admin:
- ✅ Pending stories list
- ✅ Approve functionality
- ✅ Reject functionality
- ✅ Stats display correctly

### For Creator:
- ✅ Analytics display
- ✅ Story list with status
- ✅ Play counts accurate
- ✅ Verification status shown

---

## 🐛 KNOWN ISSUES / COMING SOON

- Story upload UI (coming soon - placeholder shown)
- Circle post creation UI (placeholder)
- Journal entry creation UI (placeholder)
- Payment integration (mocked)
- Email notifications (not yet implemented)
- Push notifications (not yet implemented)

---

## 🆘 TROUBLESHOOTING

### If Login Fails:
- Clear browser cache
- Try incognito mode
- Check credentials are exactly as above
- Verify backend is running

### If No Stories Show:
- Check network tab for API errors
- Backend might be restarting
- Wait 10 seconds and refresh

### If Video Doesn't Play:
- Check YouTube video availability
- Try different story
- Check browser console for errors

---

## 🎉 SUCCESS CRITERIA

You should be able to:
✅ Login with all 4 roles
✅ See different UI for each role
✅ Access role-specific dashboards
✅ Browse and play 49 stories
✅ Join circles
✅ View journal entries
✅ Manage settings
✅ Admin can approve/reject content
✅ Creator can see analytics

---

**ENJOY TESTING! 🚀**
