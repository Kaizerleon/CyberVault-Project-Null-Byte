/**
 * CyberVault: Project Null Byte - Entry / Login Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  const entryForm = document.getElementById("entry-form");
  const callsignInput = document.getElementById("callsign");

  // Autofill with existing callsign if available
  if (AppState.name && callsignInput) {
    callsignInput.value = AppState.name;
  }

  if (entryForm) {
    entryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const callsign = callsignInput.value.trim();
      if (!callsign) return;

      AppState.name = callsign;
      logActivity(`Walkthrough entered by ${callsign}`);
      saveState();

      // Navigate to dashboard
      window.location.href = "dashboard.html";
    });
  }
});
