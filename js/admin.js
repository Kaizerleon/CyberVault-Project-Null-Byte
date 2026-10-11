/**
 * CyberVault: Project Null Byte - Admin Dashboard Controller (Backend API)
 */

async function renderAdminPanel() {
  const adminUsers = document.getElementById("admin-users");
  const adminModules = document.getElementById("admin-modules");
  const adminLogs = document.getElementById("admin-logs");
  const adminCount = document.getElementById("admin-user-count");

  // Query Backend Admin API for Users
  let registeredUsers = [];
  const usersRes = await apiRequest("/admin/users");
  if (usersRes.ok && usersRes.data && Array.isArray(usersRes.data.users)) {
    registeredUsers = usersRes.data.users;
  } else {
    registeredUsers = getRegisteredUsers();
  }

  if (adminCount) {
    adminCount.textContent = `${registeredUsers.length} ENROLLED`;
  }

  if (adminUsers) {
    adminUsers.innerHTML = `
      <div class="scroll-table">
        <table>
          <thead>
            <tr>
              <th>Callsign / Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Role</th>
              <th>Enrolled</th>
            </tr>
          </thead>
          <tbody>
            ${registeredUsers.map(u => `
              <tr class="${u.role === 'admin' ? 'bg-amber-950/20' : ''}">
                <td>
                  <span class="font-bold text-white">${sanitizeHTML(u.callsign)}</span>
                  ${u.email === AppState.email ? '<span class="chip accent text-[9px] ml-1">YOU</span>' : ''}
                </td>
                <td class="mono text-xs text-slate-300">${sanitizeHTML(u.email)}</td>
                <td class="mono text-xs text-slate-400">${sanitizeHTML(u.studentId || 'N/A')}</td>
                <td>
                  <span class="chip ${u.role === 'admin' ? 'warning' : 'accent'} text-[10px] uppercase font-bold">
                    ${sanitizeHTML(u.role || 'user')}
                  </span>
                </td>
                <td class="text-xs muted">${sanitizeHTML(u.createdAt || 'Standard')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (adminModules) {
    adminModules.innerHTML = "";
    challenges.forEach((c, i) => {
      const isDisabled = AppState.disabled.includes(i);
      const row = document.createElement("div");
      row.className = "flex items-center justify-between gap-3 raised rounded-lg p-3 text-xs border border-slate-800";

      row.innerHTML = `
        <div class="flex items-center gap-2 truncate">
          <span class="dot ${isDisabled ? '!bg-red-500 !shadow-none' : ''}"></span>
          <span class="truncate font-semibold text-slate-200">${c.stage} · ${c.title}</span>
        </div>
        <button type="button" class="btn !px-3 !py-1 shrink-0 !text-xs ${isDisabled ? 'primary' : 'danger'}">
          ${isDisabled ? 'Enable Module' : 'Disable Module'}
        </button>
      `;

      const toggleBtn = row.querySelector("button");
      toggleBtn.addEventListener("click", async () => {
        const nextState = AppState.disabled.includes(i); // if disabled, we enable it (true)
        const res = await apiRequest("/admin/modules/toggle", {
          method: "POST",
          body: JSON.stringify({ challengeId: i, isEnabled: nextState })
        });

        if (AppState.disabled.includes(i)) {
          AppState.disabled = AppState.disabled.filter(x => x !== i);
          logActivity(`${c.stage} module enabled by Admin.`);
          showToast(`${c.stage} enabled.`);
        } else {
          AppState.disabled.push(i);
          logActivity(`${c.stage} module disabled by Admin.`);
          showToast(`${c.stage} disabled.`);
        }
        saveState();
        renderAdminPanel();
      });

      adminModules.appendChild(row);
    });
  }

  // Fetch Activity Logs
  const logsRes = await apiRequest("/admin/logs");
  if (adminLogs) {
    if (logsRes.ok && logsRes.data && Array.isArray(logsRes.data.logs) && logsRes.data.logs.length > 0) {
      adminLogs.textContent = logsRes.data.logs.join("\n");
    } else if (AppState.activity.length === 0) {
      adminLogs.textContent = "No system logs recorded yet.";
    } else {
      adminLogs.textContent = AppState.activity.map(a => `[${a.time}] ${a.message}`).join("\n");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderAdminPanel();

  const resetAllBtn = document.getElementById("reset-all");
  if (resetAllBtn) {
    resetAllBtn.addEventListener("click", () => {
      showModal({
        title: "Reset ALL Platform Progress?",
        message: "This will reset all solved flags, scores, hints, and activity history for all students across the database.",
        confirmText: "Execute Full Reset",
        cancelText: "Cancel",
        onConfirm: async () => {
          const res = await apiRequest("/admin/reset-all", {
            method: "POST"
          });

          if (res.ok && res.data && res.data.success) {
            resetAllState();
            logActivity("Global platform reset executed by Master Administrator.");
            renderAdminPanel();
            showToast("All database platform progress has been successfully reset.");
          } else {
            showToast((res.data && res.data.message) || "Failed to reset platform progress.");
          }
        }
      });
    });
  }
});
