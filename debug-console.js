// Debug Console - Display console messages on the page for mobile debugging

class DebugConsole {
    constructor() {
        this.container = document.getElementById('debug-content');
        this.header = document.getElementById('debug-header');
        this.collapsed = false;
        this.maxLogs = 50; // Limit number of logs to prevent memory issues

        this.setupToggle();
        this.interceptConsole();
        this.catchErrors();

        this.log('Debug console initialized', 'info');
    }

    setupToggle() {
        this.header.addEventListener('click', () => {
            this.collapsed = !this.collapsed;
            if (this.collapsed) {
                this.container.classList.add('collapsed');
                this.header.textContent = 'Debug Console (tap to expand)';
            } else {
                this.container.classList.remove('collapsed');
                this.header.textContent = 'Debug Console (tap to collapse)';
            }
        });
    }

    log(message, type = 'log') {
        const logElement = document.createElement('div');
        logElement.className = `debug-log ${type}`;

        const timestamp = new Date().toLocaleTimeString();
        logElement.textContent = `[${timestamp}] ${message}`;

        this.container.appendChild(logElement);

        // Limit number of logs
        while (this.container.children.length > this.maxLogs) {
            this.container.removeChild(this.container.firstChild);
        }

        // Auto-scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
    }

    interceptConsole() {
        const self = this;

        // Save original console methods
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;

        // Intercept console.log
        console.log = function(...args) {
            originalLog.apply(console, args);
            self.log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '), 'log');
        };

        // Intercept console.warn
        console.warn = function(...args) {
            originalWarn.apply(console, args);
            self.log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '), 'warn');
        };

        // Intercept console.error
        console.error = function(...args) {
            originalError.apply(console, args);
            self.log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '), 'error');
        };

        // Intercept console.info
        console.info = function(...args) {
            originalInfo.apply(console, args);
            self.log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '), 'info');
        };
    }

    catchErrors() {
        // Catch uncaught errors
        window.addEventListener('error', (event) => {
            this.log(`ERROR: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, 'error');
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.log(`UNHANDLED PROMISE REJECTION: ${event.reason}`, 'error');
        });
    }
}

// Initialize debug console when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DebugConsole();
    });
} else {
    new DebugConsole();
}
