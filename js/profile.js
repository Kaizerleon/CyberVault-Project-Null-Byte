/**
 * CyberVault: Project Null Byte - Profile Controller (Live Backend API)
 */

async function renderProfilePage() {
  const profileName = document.getElementById("profile-name");
  const profileStats = document.getElementById("profile-stats");
  const badgesList = document.getElementById("badges-list");
  const profileActivity = document.getElementById("profile-activity");

  // Sync profile data from backend
  const res = await apiRequest("/user/profile");
  if (res.ok && res.data && res.data.user) {
    const u = res.data.user;
    AppState.name = u.callsign;
    AppState.email = u.email;
    AppState.studentId = u.studentId;
    AppState.score = u.score || 0;
    AppState.solved = u.solved || [];
    AppState.revealed = u.revealed || [];
    AppState.activity = u.activity || [];
    saveState();
  }

  if (profileName) profileName.textContent = AppState.name || "Operator";

  if (profileStats) {
    const statsData = [
      ["SOLVED", `${AppState.solved.length}/6`],
      ["POINTS", AppState.score],
      ["RANK", `#${getRank()}`],
      ["HINTS", AppState.revealed.length],
      ["FLAGS TRIED", AppState.attempts || 0]
    ];

    profileStats.innerHTML = statsData.map(([label, value]) => `
      <div class="panel p-4 flex flex-col justify-between">
        <p class="mono muted text-[10px] uppercase font-semibold">${label}</p>
        <p class="accent text-2xl font-bold mt-2">${value}</p>
      </div>
    `).join("");
  }

  if (badgesList) {
    badgesList.innerHTML = challenges.map((c, i) => {
      const isSolved = AppState.solved.includes(i);
      return `
        <span class="chip ${isSolved ? 'accent border-[#00ff9d55]' : 'muted'}">
          ${isSolved ? '✦' : '◇'} ${sanitizeHTML(c.stage)}
        </span>
      `;
    }).join("");
  }

  if (profileActivity) {
    if (AppState.activity.length === 0) {
      profileActivity.innerHTML = '<p class="muted text-sm">No activity recorded yet.</p>';
    } else {
      profileActivity.innerHTML = AppState.activity.map(a => `
        <div class="border-l-2 pl-3 py-1 space-y-1" style="border-color:var(--green)">
          <p class="text-sm text-slate-200">${sanitizeHTML(a.message)}</p>
          <span class="mono muted text-xs">${sanitizeHTML(a.time)}</span>
        </div>
      `).join("");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderProfilePage();

  const editProfileBtn = document.getElementById("edit-profile");
  const profileForm = document.getElementById("profile-form");
  const editCallsignInput = document.getElementById("edit-callsign");
  const cancelProfileBtn = document.getElementById("cancel-profile");

  if (editProfileBtn && profileForm && editCallsignInput) {
    editProfileBtn.addEventListener("click", () => {
      editCallsignInput.value = AppState.name;
      profileForm.classList.remove("hidden-force");
      editCallsignInput.focus();
    });
  }

  if (cancelProfileBtn && profileForm) {
    cancelProfileBtn.addEventListener("click", () => {
      profileForm.classList.add("hidden-force");
    });
  }

  if (profileForm && editCallsignInput) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newName = editCallsignInput.value.trim();
      if (!newName) return;

      // Update callsign through backend API
      const res = await apiRequest("/user/profile", {
        method: "PUT",
        body: JSON.stringify({ callsign: newName })
      });

      if (res.ok && res.data && res.data.success) {
        AppState.name = res.data.callsign;
        if (res.data.activity) AppState.activity = res.data.activity;
        showToast("Callsign updated in database.");
      } else {
        AppState.name = newName;
        logActivity(`Callsign updated to ${newName}`);
        showToast("Callsign updated locally.");
      }

      profileForm.classList.add("hidden-force");

      const headerName = document.getElementById("header-name");
      if (headerName) headerName.textContent = newName;

      saveState();
      renderProfilePage();
    });
  }
});
