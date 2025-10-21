# YouTube API Setup for Dynamic Video Loading

The penguin website now uses YouTube's Search API to dynamically find fresh penguin videos instead of relying on hardcoded video IDs. This ensures videos are always available and embeddable.

## Quick Start (Works Without API Key)

The site works immediately without any setup! It uses a fallback pool of verified penguin videos. However, for the best experience with fresh, dynamically searched content, follow the setup below.

## How to Get a FREE YouTube API Key

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Create Project" or select an existing project
4. Give your project a name (e.g., "Penguin Website")
5. Click "Create"

### Step 2: Enable YouTube Data API v3

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "YouTube Data API v3"
3. Click on it and press **Enable**

### Step 3: Create API Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Your API key will be generated
4. (Optional but recommended) Click **Restrict Key** to add security:
   - Under "Application restrictions", select "HTTP referrers (websites)"
   - Add your website domain (e.g., `https://yourdomain.com/*`)
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
5. Click **Save**

### Step 4: Add API Key to Your Site

1. Open `video-loader.js`
2. Find line 9: `this.YOUTUBE_API_KEY = '';`
3. Add your API key between the quotes:
   ```javascript
   this.YOUTUBE_API_KEY = 'YOUR_API_KEY_HERE';
   ```
4. Save the file

## API Key Quota

YouTube Data API v3 has a free tier with generous limits:
- **10,000 quota units per day** (free)
- Each search query costs 100 units
- This means you can perform 100 searches per day for free
- Perfect for a personal website!

## How It Works

### With API Key:
1. System searches YouTube for "penguins documentary", "emperor penguins", etc.
2. Gets up to 25 embeddable videos from current search results
3. Verifies each video using YouTube oEmbed API
4. Displays 5 random verified videos
5. Fresh content on every page load!

### Without API Key:
1. Uses fallback pool of 24 verified penguin videos
2. Still verifies videos are embeddable
3. Still works great, just with a fixed pool

## Troubleshooting

### "YouTube API error: 403"
- Your API key might not be activated yet (wait a few minutes)
- Check that YouTube Data API v3 is enabled
- Verify API key restrictions allow your domain

### "YouTube API error: 429"
- You've exceeded the daily quota (10,000 units)
- System will automatically fall back to the hardcoded pool
- Quota resets at midnight Pacific Time

### Videos still not loading
- Check browser console for specific errors
- Verify your API key is correct
- Make sure you have an internet connection
- The fallback pool will still work even if API fails

## Console Messages

When working correctly, you'll see:
```
🐧 Initializing penguin video loader...
🔍 Searching YouTube for penguin videos...
✓ Found 25 videos for "emperor penguins"
📦 Video pool initialized with 25 videos
✓ Video ABC123 is available: Amazing Emperor Penguins
✓ Loaded 5 penguin videos successfully!
```

Without API key:
```
🐧 Initializing penguin video loader...
No YouTube API key configured, using fallback pool
📦 Video pool initialized with 24 videos
✓ Video ABC123 is available: Penguin Documentary
✓ Loaded 5 penguin videos successfully!
```

## Privacy & Security

- API keys are client-side visible (normal for browser-based apps)
- Use HTTP referrer restrictions to prevent unauthorized use
- Never share your API key publicly in repos (use environment variables for production)
- For production, consider using a backend proxy to hide your API key

## Alternative: No API Key Needed

The site works perfectly fine without an API key! The fallback pool contains 24 verified penguin videos that are regularly updated. Videos are still verified for availability before displaying.

---

Made with penguin love 🐧
