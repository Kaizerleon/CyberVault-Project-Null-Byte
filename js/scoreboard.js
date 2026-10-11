/**
 * CyberVault: Project Null Byte - Scoreboard Controller (Live Backend API)
 */

async function renderScoreboard() {
  const tableBody = document.getElementById("score-rows");
  const searchInput = document.getElementById("score-search");
  if (!tableBody) return;

  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";

  // Query Backend Scoreboard API
  let rows = [];
  const res = await apiRequest("/scoreboard");

  if (res.ok && res.data && Array.isArray(res.data.data)) {
    rows = res.data.data.map(r => ({
      ...r,
      current: r.name.toLowerCase() === (AppState.name || "").toLowerCase()
    }));
  } else {
    // Fallback combined with local state
    rows = [
      ...sampleLeaderboard,
      {
        name: AppState.name || "Operator",
        solved: AppState.solved.length,
        score: AppState.score,
        time: AppState.activity[0] ? AppState.activity[0].time : "Just now",
        current: true
      }
    ];
  }

  // Ensure current user is present
  if (!rows.some(r => r.name.toLowerCase() === (AppState.name || "").toLowerCase())) {
    rows.push({
      name: AppState.name || "Operator",
      solved: AppState.solved.length,
      score: AppState.score,
      time: AppState.activity[0] ? AppState.activity[0].time : "Just now",
      current: true
    });
  }

  // Sort descending by score
  rows.sort((a, b) => b.score - a.score);

  // Assign ranks
  const rankedRows = rows.map((r, idx) => ({ ...r, rank: idx + 1 }));

  // Search filter
  const filtered = rankedRows.filter(r => r.name.toLowerCase().includes(searchQuery));

  if (filtered.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-6 muted">No matching callsigns found.</td></tr>';
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];

  tableBody.innerHTML = filtered.map(r => `
    <tr class="transition-colors" style="${r.current ? 'background: rgba(0, 255, 157, 0.08); font-weight: 600;' : ''}">
      <td class="mono ${r.rank <= 3 ? 'warning font-bold' : 'muted'}">
        ${r.rank <= 3 ? medals[r.rank - 1] : `#${r.rank}`}
      </td>
      <td class="${r.current ? 'accent font-bold' : ''}">
        ${sanitizeHTML(r.name)}${r.current ? ' <span class="chip accent text-[10px] ml-2">YOU</span>' : ''}
      </td>
      <td>
        <span class="mono">${r.solved}/6</span>
      </td>
      <td class="mono accent font-semibold">
        ${r.score}
      </td>
      <td class="muted text-xs">
        ${sanitizeHTML(r.time || 'Active')}
      </td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderScoreboard();

  const searchInput = document.getElementById("score-search");
  if (searchInput) {
    searchInput.addEventListener("input", renderScoreboard);
  }

  const periodButtons = document.querySelectorAll(".period");
  periodButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      AppState.period = btn.dataset.period || "all";
      periodButtons.forEach(b => b.classList.toggle("primary", b === btn));
      saveState();
      renderScoreboard();
    });
  });

  const teamToggle = document.getElementById("team-toggle");
  const indToggle = document.getElementById("individual-toggle");

  if (teamToggle) {
    teamToggle.addEventListener("click", () => {
      showToast("This lab environment uses individual evaluation; team mode is locked.");
    });
  }

  if (indToggle) {
    indToggle.addEventListener("click", () => {
      showToast("Individual evaluation mode is active.");
    });
  }
});
