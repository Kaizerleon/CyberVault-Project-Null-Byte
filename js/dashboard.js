/**
 * CyberVault: Project Null Byte - Dashboard Controller
 */

async function renderDashboard() {
  // Sync profile data from backend if logged in
  if (getAuthToken()) {
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
  }

  const welcomeName = document.getElementById("welcome-name");
  const heroRank = document.getElementById("hero-rank");
  const heroScore = document.getElementById("hero-score");
  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const hintCount = document.getElementById("hint-count");

  if (welcomeName) welcomeName.textContent = AppState.name;
  if (heroRank) heroRank.textContent = `#${getRank()}`;
  if (heroScore) heroScore.textContent = AppState.score;
  if (progressText) progressText.textContent = `${AppState.solved.length}/6 CHALLENGES COMPLETED`;
  if (progressFill) progressFill.style.width = `${(AppState.solved.length / 6) * 100}%`;
  if (hintCount) hintCount.textContent = AppState.revealed.length;

  renderDashboardCards();
  renderLeaderPreview();
  renderRecentActivity();
}

function renderDashboardCards() {
  const grid = document.getElementById("challenge-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const iconMap = {
    "CTF-OSINT": "search",
    "CTF-DF": "hard-drive",
    "CTF-RE": "gamepad-2",
    "CTF-S": "scan-eye",
    "CTF-C": "lock-keyhole",
    "CTF-LSS": "terminal"
  };

  const badgeClassMap = {
    "Easy": "badge-easy",
    "Moderate": "badge-moderate",
    "Hard": "badge-hard",
    "Expert": "badge-expert"
  };

  challenges.forEach((c, i) => {
    const isSolved = AppState.solved.includes(i);
    const open = isAvailable(i);
    const isDisabled = AppState.disabled.includes(i);

    const card = document.createElement("article");
    card.className = "challenge-card panel p-5 flex flex-col justify-between";
    card.style.opacity = open ? "1" : "0.65";

    let btnText = "Locked";
    let btnClass = "btn w-full";
    if (isDisabled) {
      btnText = "MODULE DISABLED";
    } else if (isSolved) {
      btnText = "✓ SOLVED · REVIEW";
      btnClass = "btn w-full";
    } else if (open) {
      btnText = "Start challenge";
      btnClass = "btn primary w-full";
    }

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="mono accent text-xs">${String(i + 1).padStart(2, "0")} / ${c.stage}</span>
          <i data-lucide="${iconMap[c.stage] || 'shield'}" class="w-5 h-5 blue"></i>
        </div>
        <h3 class="font-bold text-base mt-4 mb-2 text-white">${c.title}</h3>
        <p class="muted text-xs mb-5 leading-relaxed">${c.objective}</p>
      </div>
      <div>
        <div class="flex justify-between items-center mb-4">
          <span class="${badgeClassMap[c.difficulty] || 'badge-easy'} mono text-xs font-bold">${c.difficulty.toUpperCase()}</span>
          <span class="mono text-xs font-semibold">${c.points} PTS</span>
        </div>
        <button class="${btnClass}" ${(!open || isDisabled) ? "disabled" : ""} type="button" data-challenge-id="${i}">
          ${btnText}
        </button>
      </div>
    `;

    const actionBtn = card.querySelector("button");
    actionBtn.addEventListener("click", () => {
      if (open && !isDisabled) {
        AppState.current = i;
        saveState();
        window.location.href = `challenges.html?id=${i}`;
      } else {
        showToast("Complete the preceding module to unlock this challenge.");
      }
    });

    grid.appendChild(card);
  });

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

async function renderLeaderPreview() {
  const preview = document.getElementById("leader-preview");
  if (!preview) return;

  let rows = [];
  const res = await apiRequest("/scoreboard");
  if (res.ok && res.data && Array.isArray(res.data.data)) {
    rows = res.data.data.slice(0, 5);
  } else {
    rows = sampleLeaderboard.slice(0, 5);
  }

  preview.innerHTML = rows.map((x, i) => `
    <div class="flex justify-between items-center gap-2 py-1">
      <span class="truncate text-sm flex items-center gap-2">
        <span class="warning mono text-xs">0${i + 1}</span>
        <span>${sanitizeHTML(x.name)}</span>
      </span>
      <span class="mono accent text-xs font-semibold">${x.score} PTS</span>
    </div>
  `).join("");
}

function renderRecentActivity() {
  const container = document.getElementById("dashboard-activity");
  if (!container) return;

  if (AppState.activity.length === 0) {
    container.innerHTML = '<p class="muted text-xs">No activity yet. Start a challenge to begin.</p>';
    return;
  }

  const html = AppState.activity.slice(0, 5).map(a => `
    <div class="border-l-2 pl-3 py-1 space-y-1" style="border-color:var(--green)">
      <p class="text-xs text-slate-200">${sanitizeHTML(a.message)}</p>
      <span class="mono muted text-[10px]">${sanitizeHTML(a.time)}</span>
    </div>
  `).join("");

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
});
