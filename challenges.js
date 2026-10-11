/**
 * CyberVault: Project Null Byte - Challenges Controller (Full Backend Integration & Seamless Next Challenge Navigation)
 */

let timerInterval;

function getActiveChallengeId() {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  if (idParam !== null && !isNaN(parseInt(idParam, 10))) {
    const idx = parseInt(idParam, 10);
    if (idx >= 0 && idx < challenges.length) {
      AppState.current = idx;
      saveState();
      return idx;
    }
  }
  return AppState.current || 0;
}

function switchChallenge(newIndex) {
  if (newIndex < 0 || newIndex >= challenges.length) return;
  if (!isAvailable(newIndex)) {
    showToast("Complete previous stages to unlock this challenge.");
    return;
  }
  AppState.current = newIndex;
  saveState();
  const newUrl = `${window.location.pathname}?id=${newIndex}`;
  window.history.pushState({ id: newIndex }, "", newUrl);
  
  const terminalOutput = document.getElementById("terminal-output");
  if (terminalOutput) {
    terminalOutput.dataset.initialized = "";
  }

  renderChallengeWorkspace();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderStageBar() {
  const stageBar = document.getElementById("challenge-stage-bar");
  if (!stageBar) return;

  const currentIdx = getActiveChallengeId();
  stageBar.innerHTML = "";

  challenges.forEach((c, idx) => {
    const isCurrent = idx === currentIdx;
    const isSolved = AppState.solved.includes(idx);
    const isOpen = isAvailable(idx);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all duration-200 ${
      isCurrent
        ? "bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400"
        : isSolved
        ? "bg-[#00ff9d10] border-[#00ff9d44] text-[#00ff9d] hover:bg-[#00ff9d20]"
        : isOpen
        ? "bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
        : "bg-slate-900/50 border-slate-800/80 text-slate-500 opacity-60 cursor-not-allowed"
    }`;

    let iconHtml = "";
    if (isSolved) {
      iconHtml = '<span class="text-[#00ff9d] font-bold">✓</span>';
    } else if (isOpen) {
      iconHtml = '<span class="w-2 h-2 rounded-full bg-blue-400"></span>';
    } else {
      iconHtml = '<span class="text-slate-500 text-[10px]">🔒</span>';
    }

    btn.innerHTML = `
      ${iconHtml}
      <span class="mono tracking-tight">${String(idx + 1).padStart(2, "0")} · ${c.stage}</span>
    `;

    if (isOpen) {
      btn.addEventListener("click", () => switchChallenge(idx));
    } else {
      btn.disabled = true;
    }

    stageBar.appendChild(btn);
  });
}

function renderChallengeWorkspace() {
  const i = getActiveChallengeId();
  const c = challenges[i];

  renderStageBar();

  // Update header stats
  const headerScore = document.getElementById("header-score");
  if (headerScore) headerScore.textContent = `${AppState.score} PTS`;

  const detailTitle = document.getElementById("detail-title");
  const detailBreadcrumb = document.getElementById("detail-breadcrumb");
  const detailStory = document.getElementById("detail-story");
  const detailObjective = document.getElementById("detail-objective");
  const detailTask = document.getElementById("detail-task");
  const resourceName = document.getElementById("resource-name");
  const detailTags = document.getElementById("detail-tags");
  const detailStatus = document.getElementById("detail-status");
  const detailPoints = document.getElementById("detail-points");
  const flagInput = document.getElementById("flag-input");
  const submitFlagBtn = document.getElementById("submit-flag-button");
  const solutionPanel = document.getElementById("solution-panel");
  const solutionTools = document.getElementById("solution-tools");
  const flagFeedback = document.getElementById("flag-feedback");
  const terminalOutput = document.getElementById("terminal-output");

  if (detailTitle) detailTitle.textContent = c.title;
  if (detailBreadcrumb) detailBreadcrumb.textContent = `DASHBOARD / CHALLENGES / ${c.stage} - ${c.title.toUpperCase()}`;
  if (detailStory) detailStory.textContent = c.story;
  if (detailObjective) detailObjective.textContent = c.objective;
  if (detailTask) detailTask.textContent = c.task;
  if (resourceName) resourceName.textContent = c.file;

  const isGameChallenge = c.id === 2 || c.stage === "CTF-RE" || (c.file && c.file.includes("ghost_runner"));
  const playGameBtn = document.getElementById("play-game-btn");
  const resourceDesc = document.getElementById("resource-desc");
  const downloadBtnText = document.getElementById("download-btn-text");

  if (playGameBtn) {
    if (isGameChallenge) {
      playGameBtn.classList.remove("hidden-force");
    } else {
      playGameBtn.classList.add("hidden-force");
    }
  }

  if (resourceDesc) {
    resourceDesc.textContent = isGameChallenge
      ? "Launch the interactive Ghost Runner sandbox in a new window, or download the client-side JavaScript source for offline inspection."
      : "Download the safe incident artifact for local inspection and offline analysis.";
  }

  if (downloadBtnText) {
    downloadBtnText.textContent = isGameChallenge ? "Download HTML Source" : "Download Evidence File";
  }

  const solved = AppState.solved.includes(i);
  const open = isAvailable(i);

  if (detailTags) {
    detailTags.innerHTML = `
      <span class="chip accent">${c.stage}</span>
      <span class="chip">${c.domain}</span>
      <span class="chip font-bold">${c.difficulty.toUpperCase()}</span>
      <span class="chip">${c.points} PTS</span>
    `;
  }

  if (detailStatus) {
    detailStatus.textContent = solved ? "✓ SOLVED" : open ? "● UNLOCKED" : "○ LOCKED";
    detailStatus.style.color = solved ? "var(--green)" : open ? "var(--blue)" : "var(--muted)";
  }

  const revealedForThis = AppState.revealed.filter(k => k.startsWith(`${i}-`)).length;
  const currentPts = Math.max(0, c.points - (revealedForThis * 20));
  if (detailPoints) {
    detailPoints.textContent = `${c.points} points · ${currentPts} remaining after hints`;
  }

  if (flagInput) {
    flagInput.disabled = solved || !open;
    flagInput.value = "";
    if (solved) {
      flagInput.placeholder = "Challenge completed";
    } else {
      flagInput.placeholder = "IE3132{...}";
    }
  }
  if (submitFlagBtn) {
    submitFlagBtn.disabled = solved || !open;
    submitFlagBtn.textContent = solved ? "✓ Solved" : "Submit Flag";
  }
  if (flagFeedback) {
    flagFeedback.textContent = "";
  }

  // Solved Next Challenge Banner & Sidebar Quick Actions
  const solvedBanner = document.getElementById("solved-next-banner");
  const solvedBannerDesc = document.getElementById("solved-banner-desc");
  const nextBannerBtn = document.getElementById("next-challenge-banner-btn");
  const nextBannerBtnText = document.getElementById("next-banner-btn-text");
  const solvedActionBox = document.getElementById("solved-action-box");
  const nextSidebarBtn = document.getElementById("next-challenge-sidebar-btn");
  const nextSidebarBtnText = document.getElementById("next-sidebar-btn-text");

  const hasNextStage = i < challenges.length - 1;
  const nextChallenge = hasNextStage ? challenges[i + 1] : null;

  if (solved) {
    if (solvedBanner) {
      solvedBanner.classList.remove("hidden-force");
      if (solvedBannerDesc) {
        solvedBannerDesc.textContent = hasNextStage
          ? `Module verified (+${c.points} pts). You can jump directly into Challenge ${i + 2}: ${nextChallenge.title}.`
          : "All 6 security modules successfully completed! View the final scoreboard.";
      }
    }
    if (nextBannerBtnText) {
      nextBannerBtnText.textContent = hasNextStage
        ? `Proceed to Challenge 0${i + 2}: ${nextChallenge.title}`
        : "View Final Scoreboard";
    }
    if (solvedActionBox) {
      solvedActionBox.classList.remove("hidden-force");
    }
    if (nextSidebarBtnText) {
      nextSidebarBtnText.textContent = hasNextStage
        ? `Next: ${nextChallenge.stage} ➔`
        : "View Scoreboard 🏆";
    }
  } else {
    if (solvedBanner) solvedBanner.classList.add("hidden-force");
    if (solvedActionBox) solvedActionBox.classList.add("hidden-force");
  }

  if (solutionPanel && solutionTools) {
    solutionPanel.classList.toggle("hidden-force", !solved);
    solutionTools.textContent = c.tools;
  }

  // Render Hints
  renderHints(i, c, open);

  // Reset simulated terminal greeting
  if (terminalOutput && !terminalOutput.dataset.initialized) {
    terminalOutput.textContent = `CyberVault secure shell · type 'help' for supported commands.\nEnvironment: Isolated Simulated Container (${c.stage} - ${c.title})\n`;
    terminalOutput.dataset.initialized = "true";
  }

  // Timer start
  if (!AppState.started[i]) {
    AppState.started[i] = Date.now();
    saveState();
  }
  updateTimer(i);

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

function handleNextChallengeClick() {
  const i = getActiveChallengeId();
  if (i < challenges.length - 1) {
    switchChallenge(i + 1);
  } else {
    window.location.href = "scoreboard.html";
  }
}

function renderHints(i, c, open) {
  const hintButtons = document.getElementById("hint-buttons");
  const revealedHints = document.getElementById("revealed-hints");

  if (!hintButtons || !revealedHints) return;

  hintButtons.innerHTML = "";
  revealedHints.innerHTML = "";

  c.hints.forEach((hintText, n) => {
    const key = `${i}-${n}`;
    const isRevealed = AppState.revealed.includes(key);

    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn w-full justify-between text-xs";
    b.textContent = isRevealed ? `✓ HINT ${n + 1} REVEALED` : `REVEAL HINT ${n + 1} · −20 PTS`;
    b.disabled = isRevealed || !open;

    b.addEventListener("click", () => {
      showModal({
        title: `Reveal Hint ${n + 1}?`,
        message: "This demonstration hint deducts 20 points from your total score. Continue?",
        confirmText: "Reveal Hint (−20 pts)",
        cancelText: "Cancel",
        onConfirm: async () => {
          if (!AppState.revealed.includes(key)) {
            // Call backend API for hint reveal
            const res = await apiRequest(`/challenges/${i}/hint`, {
              method: "POST",
              body: JSON.stringify({ hintIndex: n })
            });

            if (res.ok && res.data && res.data.success) {
              AppState.score = res.data.score;
              AppState.revealed = res.data.revealed;
              if (res.data.activity) AppState.activity = res.data.activity;
            } else {
              // Local fallback
              AppState.revealed.push(key);
              AppState.score = Math.max(0, AppState.score - 20);
              logActivity(`Hint ${n + 1} revealed for ${c.title}`);
            }

            saveState();
            renderChallengeWorkspace();
            showToast("Hint revealed · −20 points");
          }
        }
      });
    });

    hintButtons.appendChild(b);

    if (isRevealed) {
      const p = document.createElement("p");
      p.className = "raised rounded-lg p-3 mono text-xs accent border border-[#00ff9d33]";
      p.textContent = hintText;
      revealedHints.appendChild(p);
    }
  });
}

function updateTimer(i) {
  const elapsedEl = document.getElementById("elapsed");
  if (!elapsedEl) return;

  const startTime = AppState.started[i] || Date.now();
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  elapsedEl.textContent = `${mm}:${ss}`;
}

function downloadEvidence() {
  const i = getActiveChallengeId();
  const c = challenges[i];

  // Try downloading directly from backend API
  const downloadUrl = `/api/challenges/${i}/download`;
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = c.file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast(`Downloading evidence artifact: ${c.file}`);
}

async function handleTerminalCommand(e) {
  e.preventDefault();
  const input = document.getElementById("command-input");
  const out = document.getElementById("terminal-output");
  if (!input || !out) return;

  const cmd = input.value.trim();
  if (!cmd) return;

  if (cmd.toLowerCase() === "clear") {
    out.textContent = "";
    input.value = "";
    return;
  }

  // Query Backend Terminal Sandbox API
  const res = await apiRequest("/challenges/terminal/exec", {
    method: "POST",
    body: JSON.stringify({ command: cmd })
  });

  let terminalResponse = "";
  if (res.ok && res.data && res.data.output) {
    terminalResponse = res.data.output;
  } else {
    // Fallback response map
    const fallbackResponses = {
      "help": "SUPPORTED SAMPLE COMMANDS:\n  exiftool DealIsDone.jpg\n  git log --all\n  exiftool evidence.jpg\n  steghide extract -sf evidence.jpg\n  base64 -d intercept.txt\n  fls -r disk_image.dd\n  icat disk_image.dd 42\n  clear",
      "exiftool DealIsDone.jpg": "[SIMULATED] File: DealIsDone.jpg · XPComment: aHR0cHM6Ly9wYXN0ZWJpbi5jb20vNDZxeVBZekw=",
      "exiftool evidence.jpg": "[SIMULATED] File Type: JPEG · Comment: Inspect the sample evidence for the walkthrough flag.",
      "steghide extract -sf evidence.jpg": "[SIMULATED] Extracted harmless example.txt.",
      "base64 -d intercept.txt": `[SIMULATED] Decoded sample: ${challenges[4].flag}`,
      "git log --all": "[SIMULATED] commit a1b2c3 · initial leak notes",
      "fls -r disk_image.dd": "[SIMULATED] r/r 42: recovered_note.txt",
      "icat disk_image.dd 42": `[SIMULATED] Recovered sample: ${challenges[1].flag}`
    };
    terminalResponse = fallbackResponses[cmd] || "Command not found or unsupported in simulated sandbox. Type 'help'.";
  }

  out.textContent += `\n$ ${cmd}\n${terminalResponse}\n`;
  out.scrollTop = out.scrollHeight;
  input.value = "";
}

async function submitFlag(e) {
  e.preventDefault();
  const i = getActiveChallengeId();
  const c = challenges[i];
  const input = document.getElementById("flag-input");
  const feedback = document.getElementById("flag-feedback");
  const submitBtn = document.getElementById("submit-flag-button");

  if (!input || !isAvailable(i) || AppState.solved.includes(i)) return;

  const enteredFlag = input.value.trim();
  if (!enteredFlag) return;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Validating...";
  }

  try {
    // Validate flag through Backend Flag Validation API
    const res = await apiRequest(`/challenges/${i}/submit`, {
      method: "POST",
      body: JSON.stringify({ flag: enteredFlag })
    });

    AppState.attempts++;

    if (res.ok && res.data && res.data.isCorrect) {
      if (!AppState.solved.includes(i)) {
        AppState.solved.push(i);
        AppState.score = res.data.score !== undefined ? res.data.score : (AppState.score + c.points);
        if (res.data.activity) AppState.activity = res.data.activity;
        saveState();
      }

      if (feedback) {
        feedback.textContent = "Accepted.";
        feedback.style.color = "var(--green)";
      }

      const isAllComplete = AppState.solved.length === 6;
      const nextMsg = isAllComplete
        ? "All six security modules completed!"
        : `${challenges[Math.min(i + 1, 5)].stage}: ${challenges[Math.min(i + 1, 5)].title} unlocked!`;

      showModal({
        title: "Flag Accepted! 🎯",
        message: `+${c.points} points awarded. ${nextMsg}`,
        confirmText: isAllComplete ? "View Scoreboard" : "Next Challenge ➔",
        cancelText: "Stay on Page",
        isSuccess: true,
        extra: `MISSION ${String(i + 1).padStart(2, "0")} / 06 COMPLETE`,
        onConfirm: () => {
          if (isAllComplete) {
            window.location.href = "scoreboard.html";
          } else {
            switchChallenge(i + 1);
          }
        }
      });

      renderChallengeWorkspace();
    } else {
      // Failed verification
      if (feedback) {
        feedback.textContent = (res.data && res.data.message) || "Flag not accepted. Check evidence format IE3132{...}";
        feedback.style.color = "var(--red)";
      }
      logActivity(`Rejected flag attempt · ${c.title}`);
      saveState();
    }
  } catch (err) {
    if (feedback) {
      feedback.textContent = "Validation error. Please verify backend connection.";
      feedback.style.color = "var(--red)";
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = AppState.solved.includes(i);
      submitBtn.textContent = AppState.solved.includes(i) ? "✓ Solved" : "Submit Flag";
    }
  }
}

async function resetChallengeProgress() {
  const i = getActiveChallengeId();
  const c = challenges[i];

  showModal({
    title: `Reset ${c.title}?`,
    message: "This will reset your progress on this challenge and any subsequent unlocked stages in this database session.",
    confirmText: "Confirm Reset",
    cancelText: "Cancel",
    onConfirm: async () => {
      const res = await apiRequest(`/challenges/${i}/reset`, {
        method: "POST"
      });

      if (res.ok && res.data && res.data.success) {
        AppState.score = res.data.score;
        AppState.solved = res.data.solved;
        AppState.revealed = res.data.revealed;
        if (res.data.activity) AppState.activity = res.data.activity;
      } else {
        // Fallback local reset
        for (let idx = i; idx < challenges.length; idx++) {
          if (AppState.solved.includes(idx)) {
            AppState.solved = AppState.solved.filter(x => x !== idx);
            AppState.score = Math.max(0, AppState.score - challenges[idx].points);
          }
          const hintPrefix = `${idx}-`;
          const hintsForIdx = AppState.revealed.filter(k => k.startsWith(hintPrefix));
          AppState.revealed = AppState.revealed.filter(k => !k.startsWith(hintPrefix));
          AppState.score += hintsForIdx.length * 20;
          delete AppState.started[idx];
        }
        logActivity(`${c.title} and subsequent progress reset.`);
      }

      saveState();
      renderChallengeWorkspace();
      showToast("Challenge progress reset.");
    }
  });
}

// Support browser back/forward buttons
window.addEventListener("popstate", (e) => {
  renderChallengeWorkspace();
});

document.addEventListener("DOMContentLoaded", () => {
  renderChallengeWorkspace();

  const downloadBtn = document.getElementById("download-resource");
  const terminalForm = document.getElementById("terminal-form");
  const flagForm = document.getElementById("flag-form");
  const resetBtn = document.getElementById("reset-challenge");
  const nextBannerBtn = document.getElementById("next-challenge-banner-btn");
  const nextSidebarBtn = document.getElementById("next-challenge-sidebar-btn");

  if (downloadBtn) downloadBtn.addEventListener("click", downloadEvidence);
  if (terminalForm) terminalForm.addEventListener("submit", handleTerminalCommand);
  if (flagForm) flagForm.addEventListener("submit", submitFlag);
  if (resetBtn) resetBtn.addEventListener("click", resetChallengeProgress);
  if (nextBannerBtn) nextBannerBtn.addEventListener("click", handleNextChallengeClick);
  if (nextSidebarBtn) nextSidebarBtn.addEventListener("click", handleNextChallengeClick);

  timerInterval = setInterval(() => {
    updateTimer(getActiveChallengeId());
  }, 1000);
});
