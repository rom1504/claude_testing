// Dynamic YouTube Video Loader
// Uses pre-fetched videos from GitHub Actions (penguin-videos.json)
// API key stays secure in GitHub Secrets, never exposed in browser!

class PenguinVideoLoader {
    constructor() {
        // Fallback pool (used if penguin-videos.json doesn't exist yet)
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
    }

    // Load videos from pre-fetched JSON file (created by GitHub Actions)
    async loadPreFetchedVideos() {
        console.log('📥 Loading pre-fetched penguin videos...');

        try {
            const response = await fetch('penguin-videos.json');

            if (!response.ok) {
                throw new Error(`Failed to load penguin-videos.json: ${response.status}`);
            }

            const data = await response.json();

            if (data.videoIds && Array.isArray(data.videoIds) && data.videoIds.length > 0) {
                console.log(`✓ Loaded ${data.videoIds.length} videos from GitHub Actions`);
                if (data.lastUpdated) {
                    console.log(`  Last updated: ${data.lastUpdated}`);
                }
                if (data.query) {
                    console.log(`  Search query: "${data.query}"`);
                }
                return data.videoIds;
            } else {
                throw new Error('No video IDs in penguin-videos.json');
            }

        } catch (error) {
            console.warn('Could not load pre-fetched videos:', error.message);
            console.log('Using fallback pool instead');
            return this.fallbackPool.slice();
        }
    }

    // Initialize video pool (from pre-fetched JSON or fallback)
    async initializePool() {
        this.videoPool = await this.loadPreFetchedVideos();
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

        // First, initialize the video pool from pre-fetched JSON
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
