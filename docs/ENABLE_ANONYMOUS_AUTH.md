# Enable Anonymous Authentication in Supabase

## Current Status
The app now works **without authentication** - you can use it immediately without any auth setup.

## If You Want to Enable Anonymous Auth (Optional)

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project
2. Go to **Authentication** → **Providers**

### Step 2: Enable Anonymous Sign-ins
1. Scroll down to find **Anonymous Sign-ins**
2. Toggle it **ON**
3. Click **Save**

### Step 3: Restart Your App
```bash
# Stop the dev server (Ctrl+C)
# Start it again
npm run dev
```

That's it! Anonymous auth will now work automatically.

## Why Anonymous Auth?

**Benefits:**
- Users can use the app without signing up
- Strategies are still tracked per-user
- Can upgrade to full auth later
- Better user experience (no signup friction)

**Without Anonymous Auth:**
- App still works perfectly
- Strategies are accessible to everyone
- Simpler for testing/development

## Current Behavior (Without Auth)

The app gracefully handles the disabled anonymous auth:
- Shows a warning in console (doesn't break the app)
- Continues loading normally
- All features work as expected
- Strategies are created without user_id

---

**Recommendation:** Keep it disabled for now, enable later when you need user-specific features.

