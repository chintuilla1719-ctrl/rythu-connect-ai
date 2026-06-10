// API Configuration - automatically detects localhost vs production
// Imported from config.js which handles dynamic URL resolution
// Uses api-utils.js for enhanced fetch with timeout/retry
const API_URL = API_BASE_URL;

console.log("[SCRIPT.JS] Loaded. API_URL:", API_URL);
console.log(
	"[SCRIPT.JS] API_BASE_URL:",
	typeof API_BASE_URL !== "undefined" ? API_BASE_URL : "UNDEFINED",
);
console.log("[SCRIPT.JS] apiFetch defined:", typeof apiFetch !== "undefined");

// ============ GLOBAL MESSAGE & UTILITY FUNCTIONS ============

/**
 * Show message to user with type indicator
 * Works in any context (main page or iframe)
 */
function showMessage(msg, type = "info") {
	console.log(`[MESSAGE] [${type.toUpperCase()}] ${msg}`);

	// Try multiple methods to show message
	try {
		// Method 1: Try to find message element in current document
		const messageElement =
			document.getElementById("message") || document.querySelector(".message");

		if (messageElement) {
			messageElement.textContent = msg;
			messageElement.className = `message ${type}`;
			setTimeout(() => (messageElement.className = "message"), 5000);
			return;
		}

		// Method 2: Try in parent window (for iframes)
		if (window.parent && window.parent !== window) {
			const parentMsg = window.parent.document.getElementById("message");
			if (parentMsg) {
				parentMsg.textContent = msg;
				parentMsg.className = `message ${type}`;
				setTimeout(() => (parentMsg.className = "message"), 5000);
				return;
			}
		}
	} catch (e) {
		console.log("[MESSAGE] Could not update DOM:", e.message);
	}

	// Fallback: Show as alert for critical errors
	if (type === "error") {
		alert(`❌ Error: ${msg}`);
	} else if (type === "success") {
		alert(`✅ ${msg}`);
	}
}

// ============ GLOBAL AUTH FUNCTIONS ============

function _showFarmerAuth() {
	document.getElementById("farmerAuthModal").classList.remove("hidden");
}

function closeFarmerAuth() {
	document.getElementById("farmerAuthModal").classList.add("hidden");
}

function _showBuyerAuth() {
	document.getElementById("buyerAuthModal").classList.remove("hidden");
}

function closeBuyerAuth() {
	document.getElementById("buyerAuthModal").classList.add("hidden");
}

function switchTab(role, tabType) {
	const loginTab = document.getElementById(`${role}LoginTab`);
	const registerTab = document.getElementById(`${role}RegisterTab`);
	const loginBtn = document.querySelector(
		`#${role}AuthModal .tab-btn:nth-child(1)`,
	);
	const registerBtn = document.querySelector(
		`#${role}AuthModal .tab-btn:nth-child(2)`,
	);

	if (tabType === "login") {
		loginTab.classList.remove("hidden");
		registerTab.classList.add("hidden");
		loginBtn.classList.add("active");
		registerBtn.classList.remove("active");
	} else {
		loginTab.classList.add("hidden");
		registerTab.classList.remove("hidden");
		loginBtn.classList.remove("active");
		registerBtn.classList.add("active");
	}
}

// ============ FARMER AUTH ============

function _farmerRegister() {
	const data = {
		fullName: document.getElementById("farmerName").value,
		email: document.getElementById("farmerEmail").value,
		password: document.getElementById("farmerPassword").value,
		phone: document.getElementById("farmerPhone").value,
		village: document.getElementById("farmerVillage").value,
		state: document.getElementById("farmerState").value,
		role: "farmer",
	};

	if (!data.fullName || !data.email || !data.password) {
		alert("Please fill all required fields");
		return;
	}

	apiPost(`${API_URL}/auth/register`, data)
		.then((res) => {
			if (res.error) {
				showMessage(`Registration failed: ${res.error}`, "error");
			} else {
				showMessage("Registration successful! Please login.", "success");
				switchTab("farmer", "login");
				document
					.getElementById("farmerRegisterTab")
					.querySelectorAll("input")
					.forEach((el) => {
						el.value = "";
					});
			}
		})
		.catch((err) => showMessage(getErrorMessage(err), "error"));
}

function _farmerLogin() {
	const email = document.getElementById("farmerLoginEmail").value;
	const password = document.getElementById("farmerLoginPassword").value;

	console.log("[FARMER LOGIN] Starting with email:", email);
	console.log("[FARMER LOGIN] API_URL:", API_URL);
	console.log(
		"[FARMER LOGIN] Network online:",
		typeof isOnline !== "undefined" ? isOnline() : "N/A",
	);

	apiPost(`${API_URL}/auth/login`, { email, password })
		.then((res) => {
			console.log("[FARMER LOGIN] Response received:", res);
			if (res.error) {
				showMessage(`Login failed: ${res.error}`, "error");
			} else {
				console.log("[FARMER LOGIN] User data:", res.user);
				localStorage.setItem("userId", res.user._id);
				localStorage.setItem("userName", res.user.fullName);
				localStorage.setItem("userRole", "farmer");
				localStorage.setItem("userEmail", res.user.email);
				localStorage.setItem("userVillage", res.user.village || "");
				localStorage.setItem("userState", res.user.state || "");
				document.getElementById("authSection").classList.add("hidden");
				document.getElementById("dashboardSection").classList.remove("hidden");
				document.getElementById("farmerDashboard").classList.remove("hidden");
				closeFarmerAuth();
				const farmerFrame = document.getElementById("farmerFrame");
				if (farmerFrame?.contentWindow) {
					farmerFrame.contentWindow.location.reload();
				}
			}
		})
		.catch((err) => {
			console.error("[FARMER LOGIN] Error caught:", err);
			console.error("[FARMER LOGIN] Error message:", err.message);
			console.error("[FARMER LOGIN] Error stack:", err.stack);
			showMessage(getErrorMessage(err), "error");
		});
}

// ============ BUYER AUTH ============

function _buyerRegister() {
	const data = {
		fullName: document.getElementById("buyerName").value,
		email: document.getElementById("buyerEmail").value,
		password: document.getElementById("buyerPassword").value,
		phone: document.getElementById("buyerPhone").value,
		village: document.getElementById("buyerVillage").value,
		state: document.getElementById("buyerState").value,
		role: "buyer",
	};

	if (!data.fullName || !data.email || !data.password) {
		alert("Please fill all required fields");
		return;
	}

	apiPost(`${API_URL}/auth/register`, data)
		.then((res) => {
			if (res.error) {
				showMessage(`Registration failed: ${res.error}`, "error");
			} else {
				showMessage("Registration successful! Please login.", "success");
				switchTab("buyer", "login");
				document
					.getElementById("buyerRegisterTab")
					.querySelectorAll("input")
					.forEach((el) => {
						el.value = "";
					});
			}
		})
		.catch((err) => showMessage(getErrorMessage(err), "error"));
}

function _buyerLogin() {
	const email = document.getElementById("buyerLoginEmail").value;
	const password = document.getElementById("buyerLoginPassword").value;

	console.log("[BUYER LOGIN] Starting with email:", email);
	console.log("[BUYER LOGIN] API_URL:", API_URL);

	apiPost(`${API_URL}/auth/login`, { email, password })
		.then((res) => {
			console.log("[BUYER LOGIN] Response received:", res);
			if (res.error) {
				showMessage(`Login failed: ${res.error}`, "error");
			} else {
				const buyerName = res.user.fullName || res.user.email || "Buyer";
				localStorage.setItem("userId", res.user._id);
				localStorage.setItem("userName", buyerName);
				localStorage.setItem("userRole", "buyer");
				localStorage.setItem("userEmail", res.user.email);
				localStorage.setItem("userVillage", res.user.village || "");
				localStorage.setItem("userState", res.user.state || "");
				document.getElementById("authSection").classList.add("hidden");
				document.getElementById("dashboardSection").classList.remove("hidden");
				document.getElementById("buyerDashboard").classList.remove("hidden");
				closeBuyerAuth();
				const buyerFrame = document.getElementById("buyerFrame");
				if (buyerFrame?.contentWindow) {
					buyerFrame.contentWindow.location.reload();
				}
			}
		})
		.catch((err) => {
			console.error("[BUYER LOGIN] Error caught:", err);
			console.error("[BUYER LOGIN] Error message:", err.message);
			showMessage(getErrorMessage(err), "error");
		});
}

// ============ LOGOUT ============

function _logout() {
	if (confirm("Are you sure you want to logout?")) {
		localStorage.clear();
		location.reload();
	}
}

// ============ INITIALIZE ============

document.addEventListener("DOMContentLoaded", () => {
	const authSection = document.getElementById("authSection");
	const dashboardSection = document.getElementById("dashboardSection");

	// Only run on index.html
	if (!authSection || !dashboardSection) {
		return;
	}

	const userId = localStorage.getItem("userId");

	if (userId) {
		const role = localStorage.getItem("userRole");

		authSection.classList.add("hidden");
		dashboardSection.classList.remove("hidden");

		if (role === "farmer") {
			document.getElementById("farmerDashboard")?.classList.remove("hidden");
		} else {
			document.getElementById("buyerDashboard")?.classList.remove("hidden");
		}
	}
});
