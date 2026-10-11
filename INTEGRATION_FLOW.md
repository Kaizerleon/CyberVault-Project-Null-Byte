# CyberVault: End-to-End User Flow & Integration

## 1. Overview
The CyberVault platform integrates multiple distinct challenge stages into a unified Node.js and MongoDB web application. Players interact through a centralized dashboard (`/dashboard.html`) to authenticate, track progress, and submit flags.

## 2. User Journey & Progression Steps
1. **Authentication:** 
   - Player navigates to the landing page or login view (`/login.html`).
   - Player submits credentials validated by the backend Express server and Mongoose database model.
2. **Dashboard & Navigation:**
   - Upon successful authentication, the user is redirected to the dashboard (`/dashboard.html`), where available challenges and scoreboard metrics are displayed.
3. **Challenge Stages Execution:**
   - Players work through the stages built by Members 2 and 3 (ranging from recon/information gathering to exploitation).
4. **Flag Submission & Validation:**
   - Captured flags are submitted via the platform's input interface. The backend validates the string and updates the user's score record dynamically.
