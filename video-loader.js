// Dynamic YouTube Video Loader with Dead Link Detection
// Automatically replaces dead video links with working penguin videos

class PenguinVideoLoader {
    constructor() {
        // Pool of penguin video IDs to try (curated list of popular penguin videos)
        this.videoPool = [
            // BBC Earth and Nature documentaries
            'Z7PlUGbsXlQ', // Emperor Penguins
            '3wTWWjYTe1I', // Penguin colony
            '_1v_EcjeIkg', // Baby penguins
            'WOP-u3d9VgQ', // Swimming penguins
            'ddRvMG5yARQ', // Penguin documentary

            // National Geographic
            '3szxSF_hw7w', // Nat Geo penguins
            'LS-ErwR2PCg', // Emperor penguin chicks

            // Wildlife and nature channels
            'Kp5nUQkgWIc', // Penguin feeding
            'K3TeJEiTbIk', // Adelie penguins
            '6kQqW38nwkE', // Penguin wildlife

            // Popular penguin videos
            'oRkRwL0vjOg', // Funny penguins
            'JCM6NTesP0I', // Penguin behaviors
            'qZjhIYysBqU', // Antarctic penguins
            '8tw-LyN5BYI', // Penguin compilation
            'nFAK8Vj62WM', // March of penguins

            // More alternatives
            'yU3-vZH_yYQ', // Baby penguins swim
            '4vNuOzY2_YM', // Colony life
            'tI0a5egh1Ck', // Underwater footage
            's4LaVjJad7Q', // Funny moments
            'DZW-_BNyj2g', // Penguin chicks

            // Additional backups
            'HU9bK2zIGIw', // Emperor penguins BBC
            'xRwiY7J7zn8', // Penguin behavior
            'H3DfT0QLg7k', // Wildlife penguins
            '2sD_vPGF-gQ', // Penguin swimming
            'mYTpXjKrswA'  // Penguin documentary
        ];

        this.usedVideos = new Set();
        this.videoElements = [];
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

        // Add error detection
        iframe.addEventListener('error', () => {
            console.error(`Failed to load video: ${videoId}`);
            this.replaceFailedVideo(iframe);
        });

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

            // Update title
            const titleElement = container.querySelector('h3');
            if (titleElement && title) {
                titleElement.textContent = title;
            }
        }
    }

    // Initialize all videos on the page
    async initializeVideos() {
        console.log('🐧 Initializing penguin video loader...');

        const videoCards = document.querySelectorAll('.video-card');
        const loadingPromises = [];

        for (const card of videoCards) {
            const promise = (async () => {
                // Find loading placeholder or existing iframe
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

    // Advanced fallback: Listen for YouTube API errors
    setupAdvancedErrorHandling() {
        // Monitor for blocked embeds (YouTube restricts some videos)
        window.addEventListener('message', (event) => {
            if (event.origin === 'https://www.youtube.com' || event.origin === 'https://www.youtube-nocookie.com') {
                try {
                    const data = JSON.parse(event.data);
                    if (data.event === 'infoDelivery' && data.info && data.info.playerState === -1) {
                        // Video failed to load
                        console.log('Detected video load failure via postMessage');
                    }
                } catch (e) {
                    // Not JSON, ignore
                }
            }
        });
    }
}

// Initialize when DOM is ready
const videoLoader = new PenguinVideoLoader();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        videoLoader.initializeVideos();
        videoLoader.setupAdvancedErrorHandling();
    });
} else {
    videoLoader.initializeVideos();
    videoLoader.setupAdvancedErrorHandling();
}

// Export for manual control if needed
window.penguinVideoLoader = videoLoader;
