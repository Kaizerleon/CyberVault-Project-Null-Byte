# CyberVault: Testing Evidence & Quality Assurance

## 1. Test Cases Table

| Test Case ID | Component / Feature | Description / Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Authentication | Attempt login with valid user credentials | Successful redirect to dashboard | Redirected correctly to `/dashboard.html` | **PASS** |
| **TC-02** | Access Control | Attempt to access `/admin.html` without session token | Access denied, redirected to login | Blocked and redirected | **PASS** |
| **TC-03** | Flag Validation | Submit a correct flag format (`FLAG{...}`) | Flag accepted, score incremented | Score updated in database | **PASS** |
| **TC-04** | Flag Validation | Submit an invalid/fake flag string | Error message: "Incorrect flag" | Error message displayed cleanly | **PASS** |
| **TC-05** | Reset Mechanism | Execute box reset/cleanup script | Database wiped, state restored to default | State successfully restored to default | **PASS** |

## 2. Defect Tracking Log (Bugs Found & Fixed)
* **Defect 1:** CORS policy error when frontend static files tried communicating with backend API routes.
  * *Fix:* Updated Express middleware configuration in `server.js` to properly handle header sharing.
* **Defect 2:** Reset script failed to clear specific MongoDB collections fully during teardown.
  * *Fix:* Updated the database flush routine to drop collections safely before re-seeding default data.

## 3. Design Changes from Assignment 1
* **Port Configuration:** Adjusted from a fixed hardcoded port to an environment variable (`.env`) configuration to prevent local port conflicts during testing.
* **Input Validation:** Added rigorous Mongoose schema validations to prevent malformed requests and ensure application stability.
