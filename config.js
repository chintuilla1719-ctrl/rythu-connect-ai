// Dynamic API Base URL Configuration
// Automatically detects localhost vs production/Render deployment
// Works with browser globals and mobile browsers

const API_BASE_URL = (() => {
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|Opera Mini/.test(navigator.userAgent || '');
    
    if (typeof window !== 'undefined' && window.location) {
        const origin = window.location.origin;
        const hostname = window.location.hostname;
        const protocol = window.location.protocol || 'https:';
        const port = window.location.port;

        console.log('[CONFIG] Mobile detected:', isMobile);
        console.log('[CONFIG] Origin:', origin);
        console.log('[CONFIG] Hostname:', hostname);
        console.log('[CONFIG] Protocol:', protocol);

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            const url = 'http://localhost:5000/api';
            console.log('[CONFIG] Localhost detected, using local API:', url);
            return url;
        }

        if (hostname.includes('rythu-connect-ai.onrender.com') || origin.includes('rythu-connect-ai.onrender.com')) {
            const url = 'https://rythu-connect-ai.onrender.com/api';
            console.log('[CONFIG] Render deployment detected, using deployed API:', url);
            return url;
        }

        if (origin && origin !== 'null') {
            const url = `${origin}/api`;
            console.log('[CONFIG] Using location.origin, API:', url);
            return url;
        }

        const baseUrl = port
            ? `${protocol}//${hostname}:${port}`
            : `${protocol}//${hostname}`;
        const url = `${baseUrl}/api`;
        console.log('[CONFIG] Fallback production API:', url);
        return url;
    }

    console.log('[CONFIG] Server-side fallback, using deployed API');
    return 'https://rythu-connect-ai.onrender.com/api';
})();

// Expose globally for all browsers and inline scripts
if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
    window.API_URL = API_BASE_URL;
    window.apiConfig = window.apiConfig || {};
    window.apiConfig.API_BASE_URL = API_BASE_URL;
}

console.log('[CONFIG] Final API_BASE_URL:', API_BASE_URL);
console.log('[CONFIG] Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
console.log('[CONFIG] Protocol:', typeof window !== 'undefined' ? window.location.protocol : 'N/A');
console.log('[CONFIG] User Agent:', navigator.userAgent);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_BASE_URL };
}
