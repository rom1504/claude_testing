# Penguin Website 🐧

An immersive penguin-themed website featuring 3D jumping penguins and dynamically loaded YouTube videos!

## Features

- **3D Scene**: Beautiful three.js animation with jumping penguins in a flower field
- **YouTube Videos**: 5 penguin videos that auto-refresh daily
- **Secure API Key Management**: Uses GitHub Actions + GitHub Secrets (API key never exposed!)
- **Auto-Verification**: Checks videos are embeddable before displaying
- **Fallback System**: Works even without GitHub Actions setup

## Setup Instructions

### Quick Start (Works Immediately!)

The site works right out of the box using a fallback pool of verified penguin videos. No setup required!

### Advanced: Enable Dynamic Video Fetching

To get fresh penguin videos from YouTube every day:

#### 1. Get a FREE YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **YouTube Data API v3**:
   - Go to APIs & Services → Library
   - Search for "YouTube Data API v3"
   - Click Enable
4. Create credentials:
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Copy your API key

**Free Tier**: 10,000 quota units/day = 100 searches/day (more than enough!)

#### 2. Add API Key to GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `YOUTUBE_API_KEY`
4. Value: Paste your API key
5. Click **Add secret**

#### 3. Enable GitHub Actions

1. Go to your repo → Actions tab
2. Click "I understand my workflows, go ahead and enable them"
3. The workflow will run automatically!

That's it! 🎉

## How It Works

### With GitHub Actions Enabled:

1. **Daily Refresh**: GitHub Actions workflow runs every day at midnight UTC
2. **Searches YouTube**: Uses your API key (from GitHub Secrets) to search for penguin videos
3. **Saves Results**: Creates/updates `penguin-videos.json` with fresh video IDs
4. **Auto-Commits**: Commits the file back to your repo
5. **Website Loads**: Your site loads videos from the JSON file

### Manual Trigger:

You can also manually trigger the workflow:
1. Go to Actions → "Fetch Penguin Videos"
2. Click "Run workflow"
3. Fresh videos in seconds!

### Without GitHub Actions:

- Uses fallback pool of 24 verified penguin videos
- Still checks availability before display
- Works perfectly, just without daily refreshes

## File Structure

```
.
├── index.html                           # Main website
├── styles.css                           # Styling with glass morphism effects
├── scene.js                             # Three.js 3D penguin scene
├── video-loader.js                      # Dynamic video loading system
├── penguin-videos.json                  # Auto-generated video list (created by workflow)
└── .github/workflows/
    └── fetch-penguin-videos.yml         # GitHub Actions workflow
```

## GitHub Actions Workflow

The workflow (`.github/workflows/fetch-penguin-videos.yml`):
- Runs daily at midnight UTC
- Can be triggered manually
- Searches YouTube for embeddable penguin videos
- Saves results with metadata (timestamp, search query)
- Commits changes only if video list changed

## Security

✅ **API Key is Safe**: Stored in GitHub Secrets, never exposed in code
✅ **Client-Side Safe**: Website only loads pre-fetched video IDs
✅ **Public Repo Safe**: No sensitive data committed to repository
✅ **Permissions**: Workflow only has write access to commit video list

## Troubleshooting

### Workflow Not Running?

- Check Actions tab is enabled in your repo settings
- Verify `YOUTUBE_API_KEY` secret is set correctly
- Check workflow run logs for errors

### Videos Not Loading?

- Check browser console for errors
- Verify `penguin-videos.json` exists in repo
- Fallback pool will work even if JSON missing

### API Quota Exceeded?

- Free tier allows 100 searches/day
- Workflow runs once daily = 1 search/day
- You're safe unless you manually trigger 100+ times!

## Console Messages

With GitHub Actions setup:
```
🐧 Initializing penguin video loader...
📥 Loading pre-fetched penguin videos...
✓ Loaded 50 videos from GitHub Actions
  Last updated: 2024-01-15T00:00:00Z
  Search query: "emperor penguins"
📦 Video pool initialized with 50 videos
✓ Video ABC123 is available: Amazing Emperor Penguins
✓ Loaded 5 penguin videos successfully!
```

## Local Development

```bash
# Clone the repo
git clone https://github.com/yourusername/your-repo.git

# Open index.html in browser
open index.html

# Or use a local server
python -m http.server 8000
# Visit http://localhost:8000
```

## Contributing

Feel free to submit issues and pull requests!

## License

Made with penguin love 🐧

---

**Note**: This approach keeps your API key completely secure in GitHub Secrets while still providing dynamic, fresh penguin videos to your website visitors!
