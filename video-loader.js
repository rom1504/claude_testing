// Dynamic YouTube Video Loader with YouTube Search API
// Automatically finds and verifies working penguin videos

class PenguinVideoLoader {
    constructor() {
        // OPTIONAL: Add your YouTube Data API v3 key here for dynamic video search
        // Get a FREE key at: https://console.cloud.google.com/apis/credentials
        // Enable YouTube Data API v3 in your project
        this.YOUTUBE_API_KEY = ''; // Leave empty to use fallback pool

        // Fallback pool of penguin video IDs (used if no API key or search fails)
        this.fallbackPool = [
            'Z7PlUGbsXlQ', '3wTWWjYTe1I', '_1v_EcjeIkg', 'WOP-u3d9VgQ',
            'ddRvMG5yARQ', '3szxSF_hw7w', 'LS-ErwR2PCg', 'Kp5nUQkgWIc',
            'K3TeJEiTbIk', '6kQqW38nwkE', 'oRkRwL0vjOg', 'JCM6NTesP0I',
            'qZjhIYysBqU', '8tw-LyN5BYI', 'nFAK8Vj62WM', 'yU3-vZH_yYQ',
            '4vNuOzY2_YM', 'tI0a5egh1Ck', 's4LaVjJad7Q', 'DZW-_BNyj2g',
            'HU9bK2zIGIw', 'xRwiY7J7zn8', 'H3DfT0QLg7k', '2sD_vPGF-gQ'
        ];

        this.videoPool = [];
        this.usedVideos = new Set();
        this.videoElements = [];
        this.searchQueries = [
            'penguins documentary',
            'emperor penguins',
            'baby penguins',
            'penguins swimming',
            'funny penguins',
            'penguin colony',
            'antarctic penguins wildlife',
            'cute penguins'
        ];
    }

    // Search YouTube for penguin videos using YouTube Data API v3
    async searchPenguinVideos(maxResults = 25) {
        if (!this.YOUTUBE_API_KEY) {
            console.log('No YouTube API key configured, using fallback pool');
            return this.fallbackPool.slice();
        }

        console.log('🔍 Searching YouTube for penguin videos...');
        const allVideoIds = [];

        try {
            // Use multiple search queries to get variety
            const randomQuery = this.searchQueries[Math.floor(Math.random() * this.searchQueries.length)];

            const params = new URLSearchParams({
                part: 'snippet',
                q: randomQuery,
                type: 'video',
                videoEmbeddable: 'true',
                videoDuration: 'any',
                maxResults: Math.min(maxResults, 50), // API limit is 50
                order: 'relevance',
                key: this.YOUTUBE_API_KEY
            });

            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?${params}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const videoIds = data.items
                    .map(item => item.id.videoId)
                    .filter(id => id); // Remove any undefined

                allVideoIds.push(...videoIds);
                console.log(`✓ Found ${videoIds.length} videos for "${randomQuery}"`);
            }

        } catch (error) {
            console.error('YouTube search failed:', error.message);
            console.log('Falling back to hardcoded pool');
            return this.fallbackPool.slice();
        }

        // If we got videos, return them; otherwise use fallback
        if (allVideoIds.length > 0) {
            // Shuffle for variety
            return allVideoIds.sort(() => Math.random() - 0.5);
        } else {
            return this.fallbackPool.slice();
        }
    }

    // Initialize video pool (from search or fallback)
    async initializePool() {
        this.videoPool = await this.searchPenguinVideos();
        console.log(`📦 Video pool initialized with ${this.videoPool.length} videos`);
    }

    // Check if a video is embeddable using YouTube oEmbed API
    async checkVideoAvailability(videoId) {
        try {
            const response = await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
                { method: 'GET' }
            );

            if (response.ok) {
                const data = await response.json();
                console.log(`✓ Video ${videoId} is available:`, data.title);
                return { available: true, title: data.title };
            }
            return { available: false };
        } catch (error) {
            console.log(`✗ Video ${videoId} failed:`, error.message);
            return { available: false };
        }
    }

    // Get a random unused video from the pool
    getRandomVideo() {
        const availableVideos = this.videoPool.filter(id => !this.usedVideos.has(id));

        if (availableVideos.length === 0) {
            console.warn('All videos used, resetting pool');
            this.usedVideos.clear();
            return this.videoPool[Math.floor(Math.random() * this.videoPool.length)];
        }

        const randomIndex = Math.floor(Math.random() * availableVideos.length);
        const videoId = availableVideos[randomIndex];
        this.usedVideos.add(videoId);
        return videoId;
    }

    // Find a working video from the pool
    async findWorkingVideo(maxAttempts = 5) {
        for (let i = 0; i < maxAttempts; i++) {
            const videoId = this.getRandomVideo();
            const result = await this.checkVideoAvailability(videoId);

            if (result.available) {
                return { videoId, title: result.title };
            }
        }

        // Fallback to a random video if all checks fail
        console.warn('Could not verify videos, using random from pool');
        return {
            videoId: this.getRandomVideo(),
            title: 'Penguin Video'
        };
    }

    // Create iframe element for video
    createVideoIframe(videoId, title) {
        const iframe = document.createElement('iframe');
        iframe.width = '560';
        iframe.height = '315';
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = title || 'Penguin Video';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;

        return iframe;
    }

    // Replace a failed video with a new one
    async replaceFailedVideo(iframeElement) {
        console.log('Attempting to replace failed video...');
        const container = iframeElement.parentElement;

        if (container) {
            const { videoId, title } = await this.findWorkingVideo();
            const newIframe = this.createVideoIframe(videoId, title);
            container.replaceChild(newIframe, iframeElement);

            const titleElement = container.querySelector('h3');
            if (titleElement && title) {
                titleElement.textContent = title;
            }
        }
    }

    // Initialize all videos on the page
    async initializeVideos() {
        console.log('🐧 Initializing penguin video loader...');

        // First, initialize the video pool
        await this.initializePool();

        const videoCards = document.querySelectorAll('.video-card');
        const loadingPromises = [];

        for (const card of videoCards) {
            const promise = (async () => {
                const loadingDiv = card.querySelector('.video-loading');
                const existingIframe = card.querySelector('iframe');

                // Get a working video
                const { videoId, title } = await this.findWorkingVideo();

                // Create new iframe
                const newIframe = this.createVideoIframe(videoId, title);

                // Replace loading div or existing iframe
                if (loadingDiv) {
                    card.replaceChild(newIframe, loadingDiv);
                } else if (existingIframe) {
                    card.replaceChild(newIframe, existingIframe);
                } else {
                    card.insertBefore(newIframe, card.firstChild);
                }

                // Update title
                const titleElement = card.querySelector('h3');
                if (titleElement && title) {
                    titleElement.textContent = title;
                }

                this.videoElements.push(newIframe);
            })();

            loadingPromises.push(promise);
        }

        await Promise.all(loadingPromises);
        console.log(`✓ Loaded ${this.videoElements.length} penguin videos successfully!`);
    }
}

// Initialize when DOM is ready
const videoLoader = new PenguinVideoLoader();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        videoLoader.initializeVideos();
    });
} else {
    videoLoader.initializeVideos();
}

// Export for manual control if needed
window.penguinVideoLoader = videoLoader;

