// Dynamic API Base URL Configuration
// Automatically detects localhost vs production/Render deployment
// Handles HTTPS redirects and mobile networks

const API_BASE_URL = (() => {
	if (typeof window !== "undefined" && window.location) {
		// Client-side (browser environment)
		const hostname = window.location.hostname;
		let protocol = window.location.protocol;
		const port = window.location.port;

		// Local development
		if (hostname === "localhost" || hostname === "127.0.0.1") {
			const url = "http://localhost:5000/api";
			console.log("[CONFIG] Localhost detected, API:", url);
			return url;
		}

		// Production/Render: Force HTTPS if not localhost
		if (
			protocol === "http:" &&
			hostname !== "localhost" &&
			hostname !== "127.0.0.1"
		) {
			protocol = "https:";
		}

		// Production or Render deployment
		const baseUrl = port
			? `${protocol}//${hostname}:${port}`
			: `${protocol}//${hostname}`;
		const url = `${baseUrl}/api`;
		console.log("[CONFIG] Production detected, API:", url);
		return url;
	}

	// Server-side fallback (Node.js)
	console.log("[CONFIG] Server-side, using localhost fallback");
	return "http://localhost:5000/api";
})();

// Log detection info
console.log(
	"[CONFIG] Hostname:",
	typeof window !== "undefined" ? window.location.hostname : "N/A",
);
console.log(
	"[CONFIG] Protocol:",
	typeof window !== "undefined" ? window.location.protocol : "N/A",
);
// Expose globally for browser pages
window.API_BASE_URL = API_BASE_URL;
// Export for use in modules (if needed)
if (typeof module !== "undefined" && module.exports) {
	module.exports = { API_BASE_URL };
}
