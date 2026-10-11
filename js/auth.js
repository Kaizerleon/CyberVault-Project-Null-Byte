/**
 * CyberVault: Project Null Byte - Authentication Controller (Login & Registration)
 */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // ================= LOGIN HANDLER =================
  if (loginForm) {
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const authFeedback = document.getElementById("auth-feedback");
    const submitBtn = loginForm.querySelector("button[type='submit']");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
      }

      try {
        const authResult = await authenticateUserApi(email, password);

        if (authResult.success) {
          const user = authResult.user;
          const currentTheme = AppState.theme;
          AppState = getDefaultState();
          AppState.theme = currentTheme;
          AppState.name = user.callsign;
          AppState.email = user.email;
          AppState.role = user.role || "user";
          AppState.studentId = user.studentId || "";
          AppState.score = typeof user.score === "number" ? user.score : 0;
          AppState.solved = Array.isArray(user.solved) ? user.solved : [];
          AppState.revealed = Array.isArray(user.revealed) ? user.revealed : [];
          AppState.activity = Array.isArray(user.activity) ? user.activity : [];
          AppState.current = 0;

          logActivity(`Authenticated session: ${user.callsign} (${user.role.toUpperCase()})`);
          saveState();

          if (user.role === "admin") {
            showToast("Master Admin access granted. Redirecting to Admin Dashboard...");
            setTimeout(() => {
              window.location.href = "admin.html";
            }, 500);
          } else {
            showToast(`Welcome back, ${user.callsign}! Redirecting...`);
            setTimeout(() => {
              window.location.href = "dashboard.html";
            }, 500);
          }
        } else {
          if (authFeedback) {
            authFeedback.textContent = authResult.message || "Invalid credentials.";
            authFeedback.classList.remove("hidden-force");
          } else {
            showToast(authResult.message || "Invalid credentials.");
          }
        }
      } catch (err) {
        if (authFeedback) {
          authFeedback.textContent = "Authentication service error. Please try again.";
          authFeedback.classList.remove("hidden-force");
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = "1";
        }
      }
    });

    // Quick admin fill helper button if present
    const fillAdminBtn = document.getElementById("fill-admin-creds");
    if (fillAdminBtn) {
      fillAdminBtn.addEventListener("click", () => {
        emailInput.value = "admin@cybervault.com";
        passwordInput.value = "admin33";
        showToast("Admin credentials populated.");
      });
    }
  }

  // ================= REGISTRATION HANDLER =================
  if (registerForm) {
    const regCallsign = document.getElementById("reg-callsign");
    const regEmail = document.getElementById("reg-email");
    const regPassword = document.getElementById("reg-password");
    const regConfirmPassword = document.getElementById("reg-confirm-password");
    const regStudentId = document.getElementById("reg-studentid");
    const regFeedback = document.getElementById("reg-feedback");
    const submitRegBtn = registerForm.querySelector("button[type='submit']");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const callsign = regCallsign.value.trim();
      const email = regEmail.value.trim();
      const password = regPassword.value;
      const confirmPassword = regConfirmPassword.value;
      const studentId = regStudentId ? regStudentId.value.trim() : "";

      if (password !== confirmPassword) {
        if (regFeedback) {
          regFeedback.textContent = "Passwords do not match. Please re-enter.";
          regFeedback.classList.remove("hidden-force");
        }
        return;
      }

      if (password.length < 6) {
        if (regFeedback) {
          regFeedback.textContent = "Password must be at least 6 characters long.";
          regFeedback.classList.remove("hidden-force");
        }
        return;
      }

      if (submitRegBtn) {
        submitRegBtn.disabled = true;
        submitRegBtn.style.opacity = "0.7";
      }

      try {
        const regResult = await registerUserApi({
          email,
          password,
          callsign,
          studentId
        });

        if (regResult.success) {
          const user = regResult.user;
          AppState.name = user.callsign;
          AppState.email = user.email;
          AppState.role = "user";
          AppState.studentId = user.studentId;
          AppState.score = 0;
          AppState.solved = [];
          AppState.revealed = [];
          AppState.activity = user.activity || [];

          logActivity(`New operator registered: ${user.callsign}`);
          saveState();

          showToast("Registration successful! Redirecting to Dashboard...");
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 600);
        } else {
          if (regFeedback) {
            regFeedback.textContent = regResult.message || "Registration failed.";
            regFeedback.classList.remove("hidden-force");
          } else {
            showToast(regResult.message || "Registration failed.");
          }
        }
      } catch (err) {
        if (regFeedback) {
          regFeedback.textContent = "Registration service error. Please try again.";
          regFeedback.classList.remove("hidden-force");
        }
      } finally {
        if (submitRegBtn) {
          submitRegBtn.disabled = false;
          submitRegBtn.style.opacity = "1";
        }
      }
    });
  }
});
