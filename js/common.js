/**
 * CyberVault: Project Null Byte - Shared Layout & UI Scripts
 */

let toastTimer;

function showToast(message) {
  let toastEl = document.getElementById("toast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "toast";
    toastEl.className = "toast hidden-force";
    toastEl.setAttribute("role", "status");
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.remove("hidden-force");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("hidden-force");
  }, 4000);
}

// Global modal handling
let activeModalCallback = null;

function showModal({ title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, isSuccess = false, extra = "" }) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMsg = document.getElementById("modal-message");
  const modalExtra = document.getElementById("modal-extra");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel = document.getElementById("modal-cancel");

  if (!modal) return;

  activeModalCallback = onConfirm || null;
  if (modalTitle) modalTitle.textContent = title;
  if (modalMsg) modalMsg.textContent = message;

  if (modalExtra) {
    modalExtra.textContent = extra;
    modalExtra.classList.toggle("hidden-force", !extra);
  }

  if (modalConfirm) {
    modalConfirm.textContent = confirmText;
  }

  if (modalCancel) {
    modalCancel.textContent = cancelText;
    modalCancel.classList.toggle("hidden-force", isSuccess);
  }

  modal.classList.remove("hidden-force");
  if (modalConfirm) modalConfirm.focus();
}

function hideModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.add("hidden-force");
  activeModalCallback = null;
}

// Sync current authenticated user state with the backend
async function syncUserStateWithBackend() {
  if (!getAuthToken()) return false;
  try {
    const res = await apiRequest("/user/profile");
    if (res.ok && res.data && res.data.user) {
      const u = res.data.user;
      AppState.name = u.callsign || AppState.name;
      AppState.email = u.email || AppState.email;
      AppState.studentId = u.studentId || AppState.studentId;
      AppState.role = u.role || AppState.role || "user";
      AppState.score = typeof u.score === "number" ? u.score : 0;
      AppState.solved = Array.isArray(u.solved) ? u.solved : [];
      AppState.revealed = Array.isArray(u.revealed) ? u.revealed : [];
      AppState.activity = Array.isArray(u.activity) ? u.activity : [];
      saveState();

      // Update header elements if present
      const headerScore = document.getElementById("header-score");
      const headerName = document.getElementById("header-name");
      const headerRole = document.getElementById("header-role");
      if (headerScore) headerScore.textContent = `${AppState.score} PTS`;
      if (headerName) headerName.textContent = AppState.name || "GUEST";
      if (headerRole) {
        headerRole.textContent = AppState.role === "admin" ? "ADMIN" : "OPERATOR";
        headerRole.className = AppState.role === "admin" ? "chip warning text-[10px]" : "chip accent text-[10px]";
      }
      return true;
    }
  } catch (err) {
    console.warn("Backend sync error:", err);
  }
  return false;
}

// Common initialization for all protected pages
document.addEventListener("DOMContentLoaded", async () => {
  // Apply saved theme
  if (AppState.theme === "light") {
    document.body.classList.add("light");
  }

  // Check login status on protected pages
  const isAuthPage = window.location.pathname.endsWith("index.html") || 
                     window.location.pathname.endsWith("login.html") || 
                     window.location.pathname.endsWith("register.html") || 
                     window.location.pathname.endsWith("/") || 
                     window.location.pathname === "";

  if (!isAuthPage && !AppState.name && !getAuthToken()) {
    // If not logged in, redirect to login page
    window.location.href = "index.html";
    return;
  }

  // Synchronize state with backend
  if (!isAuthPage) {
    await syncUserStateWithBackend();
  }

  // Admin page guard
  const isAdminPage = window.location.pathname.endsWith("admin.html");
  if (isAdminPage && AppState.role !== "admin") {
    showToast("Access Restricted: Master Administrator privileges required.");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);
    return;
  }

  // Hide admin navigation links for non-admin users
  if (AppState.role !== "admin") {
    const adminLinks = document.querySelectorAll('a[href="admin.html"]');
    adminLinks.forEach(link => {
      link.style.display = "none";
    });
  }

  // Bind Header Controls
  const headerScore = document.getElementById("header-score");
  const headerName = document.getElementById("header-name");
  const headerRole = document.getElementById("header-role");
  const themeToggle = document.getElementById("theme-toggle");
  const notificationToggle = document.getElementById("notification-toggle");
  const notificationMenu = document.getElementById("notification-menu");
  const exitButton = document.getElementById("exit-button");

  if (headerScore) headerScore.textContent = `${AppState.score} PTS`;
  if (headerName) {
    headerName.textContent = AppState.name || "GUEST";
  }
  if (headerRole) {
    headerRole.textContent = AppState.role === "admin" ? "ADMIN" : "OPERATOR";
    headerRole.className = AppState.role === "admin" ? "chip warning text-[10px]" : "chip accent text-[10px]";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light");
      AppState.theme = isLight ? "light" : "dark";
      saveState();
    });
  }

  if (notificationToggle && notificationMenu) {
    notificationToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = notificationMenu.classList.toggle("hidden-force");
      notificationToggle.setAttribute("aria-expanded", String(!isHidden));
    });

    document.addEventListener("click", (e) => {
      if (!notificationMenu.contains(e.target) && e.target !== notificationToggle) {
        notificationMenu.classList.add("hidden-force");
        notificationToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (exitButton) {
    exitButton.addEventListener("click", () => {
      showModal({
        title: "Log Out of CyberVault?",
        message: "Are you sure you want to end your current session and return to the login screen?",
        confirmText: "Log Out",
        cancelText: "Stay",
        onConfirm: async () => {
          try {
            await apiRequest("/auth/logout", { method: "POST" });
          } catch (e) {}
          setAuthToken("");
          AppState = getDefaultState();
          saveState();
          window.location.href = "index.html";
        }
      });
    });
  }

  // Modal actions
  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel = document.getElementById("modal-cancel");

  if (modalConfirm) {
    modalConfirm.addEventListener("click", () => {
      const cb = activeModalCallback;
      hideModal();
      if (typeof cb === "function") cb();
    });
  }

  if (modalCancel) {
    modalCancel.addEventListener("click", hideModal);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("modal");
      if (modal && !modal.classList.contains("hidden-force")) {
        hideModal();
      }
    }
  });

  // Initialize Lucide icons
  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
});
