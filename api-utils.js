/**
 * Centralized fetch utilities with timeout, retry, and error handling
 * Works on both desktop and mobile browsers
 * Includes comprehensive error handling and debugging
 */

console.log('[API-UTILS] Loaded');

// Check if fetch is available
if (typeof fetch === 'undefined') {
    console.error('[API-UTILS] FATAL: fetch is not available!');
}

/**
 * Enhanced fetch with timeout, retry, and better error handling
 * Works on both desktop and mobile
 * @param {string} url - API endpoint
 * @param {object} options - fetch options
 * @param {number} timeout - milliseconds (default: 30000 = 30s for mobile networks)
 * @param {number} retries - number of retry attempts (default: 2) */
async function apiFetch(url, options = {}, timeout = 30000, retries = 2) {
    let lastError;
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|Opera Mini/.test(navigator.userAgent);
    
    console.log(`[apiFetch] URL: ${url}, Mobile: ${isMobile}, Online: ${navigator.onLine}`);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // For same-origin requests (public API), don't set credentials
            // Let browser handle it naturally
            if (!options.credentials && url.includes('/api/')) {
                // Don't set credentials for API calls since CORS is public
                options.credentials = undefined;
            }

            // Create abort controller for timeout (with fallback for older browsers)
            let timeoutId = null;
            let signal = undefined;
            
            if (typeof AbortController !== 'undefined') {
                const controller = new AbortController();
                signal = controller.signal;
                timeoutId = setTimeout(() => {
                    console.warn(`[apiFetch] Aborting request after ${timeout}ms timeout`);
                    controller.abort();
                }, timeout);
            } else {
                console.warn('[apiFetch] AbortController not supported - using no-timeout mode');
            }

            // Perform fetch
            const fetchOptions = {
                ...options,
                ...(signal && { signal })
            };
            
            console.log(`[apiFetch] Attempt ${attempt}/${retries} - Sending ${fetchOptions.method || 'GET'} to ${url}`);
            const response = await fetch(url, fetchOptions);

            if (timeoutId) clearTimeout(timeoutId);

            console.log(`[apiFetch] Response status: ${response.status}`);

            // Check if response is ok (status 200-299)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || 
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            console.log(`[apiFetch] Success on attempt ${attempt}`);
            return response;

        } catch (error) {
            lastError = error;
            console.error(`[apiFetch] Attempt ${attempt}/${retries} failed:`, error.name, error.message);

            // Don't retry on certain errors
            if (error.name === 'AbortError') {
                console.error(`[apiFetch] Request timeout after ${timeout}ms`);
                if (!isMobile) {
                    // Increase timeout for mobile networks
                    timeout = Math.min(timeout + 10000, 60000);
                }
            }

            // Wait before retry (exponential backoff: 1s, 2s, 4s)
            if (attempt < retries) {
                const waitTime = Math.pow(2, attempt - 1) * 1000;
                console.log(`[apiFetch] Retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    // All retries exhausted
    const errorMsg = `Network request failed after ${retries} attempts: ${lastError?.message}`;
    console.error(`[apiFetch] ${errorMsg}`);
    throw new Error(errorMsg);
}

/**
 * GET request with automatic parsing
 */
async function apiGet(url, timeout = 30000) {
    const response = await apiFetch(url, { method: 'GET' }, timeout);
    return response.json();
}

/**
 * POST request with automatic JSON serialization
 */
async function apiPost(url, data, timeout = 30000) {
    const response = await apiFetch(
        url,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        },
        timeout
    );
    return response.json();
}

/**
 * PUT request with automatic JSON serialization
 */
async function apiPut(url, data, timeout = 30000) {
    const response = await apiFetch(
        url,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        },
        timeout
    );
    return response.json();
}

/**
 * DELETE request
 */
async function apiDelete(url, timeout = 30000) {
    const response = await apiFetch(url, { method: 'DELETE' }, timeout);
    return response.json();
}

/**
 * POST with FormData (for file uploads)
 */
async function apiPostFormData(url, formData, timeout = 60000) {
    // Don't set Content-Type header - browser will set it automatically with boundary
    const response = await apiFetch(
        url,
        {
            method: 'POST',
            body: formData
            // Intentionally no headers - let browser set multipart/form-data
        },
        timeout,
        1 // No retry for file uploads
    );
    return response.json();
}

/**
 * PUT with FormData (for file uploads)
 */
async function apiPutFormData(url, formData, timeout = 60000) {
    const response = await apiFetch(
        url,
        {
            method: 'PUT',
            body: formData
            // Intentionally no headers - let browser set multipart/form-data
        },
        timeout,
        1 // No retry for file uploads
    );
    return response.json();
}

/**
 * Check if device is online
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Listen for network status changes
 */
function onlineStatusChanged(callback) {
    window.addEventListener('online', () => {
        console.log('Device is online');
        callback(true);
    });
    window.addEventListener('offline', () => {
        console.log('Device is offline');
        callback(false);
    });
}

/**
 * Format error message for user display
 */
function getErrorMessage(error) {
    if (!isOnline()) {
        return 'No internet connection. Please check your network.';
    }

    // Handle different error types
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        return 'Request took too long. Please try again.';
    }

    if (error.message?.includes('TypeError')) {
        return 'Network error. Please check your connection and try again.';
    }

    if (error.message?.includes('HTTP')) {
        return 'Server error: ' + error.message;
    }

    return error.message || 'An error occurred. Please try again.';
}
