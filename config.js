// Dynamic API Base URL Configuration
// Automatically detects localhost vs production/Render deployment

const API_BASE_URL = (() => {
    if (typeof window !== 'undefined' && window.location) {
        // Client-side (browser environment)
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }

        // Production or Render deployment
        // Use the same host/protocol as the current page
        const baseUrl = port 
            ? `${protocol}//${hostname}:${port}` 
            : `${protocol}//${hostname}`;
        return `${baseUrl}/api`;
    }

    // Server-side fallback (Node.js)
    return 'http://localhost:5000/api';
})();

// Export for use in modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_BASE_URL };
}
