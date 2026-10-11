# 🛡️ CyberVault: Project Null Byte - Complete Local Setup & Deployment Guide

> **Module:** IE3132 - Penetration Testing CTF Play Box  
> **Platform:** Full-stack CTF Challenge Platform with Sandboxed Linux Labs  
> **Target Audience:** Anyone setting up and running CyberVault on a local machine from scratch with zero prior configuration.

---

## 📌 Table of Contents
1. [Project Overview & Architecture](#-1-project-overview--architecture)
2. [Required Software Checklist](#-2-required-software-checklist)
3. [Quick Start (3-Minute Setup)](#-3-quick-start-3-minute-setup)
4. [Environment Configuration (.env)](#-4-environment-configuration-env)
5. [Frontend & Backend Details](#-5-frontend--backend-details)
6. [Why We Use Docker & How to Set It Up](#-6-why-we-use-docker--how-to-set-it-up)
7. [Default Accounts & Credentials](#-7-default-accounts--credentials)
8. [Challenge Overview & Walkthrough Reference](#-8-challenge-overview--walkthrough-reference)
9. [Troubleshooting & Common Issues](#-9-troubleshooting--common-issues)

---

## 🏗️ 1. Project Overview & Architecture

CyberVault is a cybersecurity CTF (Capture The Flag) training platform containing 6 progressive security challenges:
- **Frontend:** Responsive cyber-themed single page web application built with HTML5, CSS3, and modern Vanilla JavaScript (no complex build tools or React compilers needed).
- **Backend:** Node.js + Express API server running on port `3000`. It serves both the static web application and the REST API endpoints for authentication, scoring, challenges, and dynamic downloads.
- **Database:** MongoDB (cloud MongoDB Atlas or local MongoDB), storing users, flags, solves, real-time scoreboards, and binary challenge evidence files.
- **Sandboxed Lab (Docker):** A lightweight Ubuntu container emulating a realistic Linux target machine for privilege escalation and network service exploitation (Challenge 6).

```
                      +-----------------------------------+
                      |   Browser (http://localhost:3000)  |
                      +-----------------+-----------------+
                                        | (HTTP / REST API)
                                        v
                      +-----------------------------------+
                      |    Node.js / Express Server       |
                      |          (Port 3000)              |
                      +--------+-----------------+--------+
                               |                 |
                   (Mongoose)  |                 | (Evidence / SSH info)
                               v                 v
                 +-------------------+    +-------------------------------+
                 |   MongoDB Atlas   |    | Docker Container (Ubuntu)    |
                 | (Users / Scores / |    | Port 2222 -> Port 22 (SSH)    |
                 |  Flags / Files)   |    | Port 9090 (Vault Service)     |
                 +-------------------+    +-------------------------------+
```

---

## 💻 2. Required Software Checklist

Before running the project on your friend's computer, ensure the following software is installed:

| Software | Version | Purpose | Download Link |
| :--- | :--- | :--- | :--- |
| **Node.js** | v18.x or v20.x+ (LTS) | Runs the backend server and serves the web pages | [nodejs.org](https://nodejs.org/) |
| **Git** *(Optional)* | Any recent version | For cloning repository files (or you can just copy the folder) | [git-scm.com](https://git-scm.com/) |
| **Docker Desktop** | Latest | Runs the isolated Linux challenge environment for Challenge 6 | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Modern Web Browser** | Chrome / Edge / Firefox | Interacting with the CTF interface | Pre-installed / Any |
| **Terminal / PowerShell** | Built-in | Running commands and SSH client | Pre-installed |

> **Note for Windows Users:** When installing **Docker Desktop**, make sure to enable the **WSL 2 backend** (Windows Subsystem for Linux) during setup.

---

## 🚀 3. Quick Start (3-Minute Setup)

Follow these exact steps to start the platform:

### Step 1: Open the Project Directory
Open your terminal (PowerShell, Command Prompt, or bash) and navigate to the `cybervault` folder:
```bash
cd "path/to/cybervault"
```

### Step 2: Install Node.js Dependencies
Install all required Node.js packages (Express, Mongoose, bcryptjs, jsonwebtoken, etc.):
```bash
npm install
```

### Step 3: Verify the Environment File
Ensure a `.env` file exists in the root folder with the MongoDB connection string (see [Section 4](#-4-environment-configuration-env)).

### Step 4: Start the Server
Launch the backend server:
```bash
npm start
```

You should see this startup output:
```text
[CyberVault DB] MongoDB Connected: ac-tczkz64-shard-00-00.my95erc.mongodb.net
[CyberVault Seed] CTF challenges successfully synced in database.
=======================================================
  🛡️  CyberVault: Project Null Byte - Backend Online
  🔗 Platform URL: http://localhost:3000
  📚 Module: IE3132 - Penetration Testing CTF Play Box
  🗄️ Database: MongoDB
=======================================================
```

### Step 5: Open in Your Browser
Open your browser and visit:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ 4. Environment Configuration (.env)

The root folder has an environment configuration file named `.env`.

If `.env` does not exist, create a file named `.env` in the root folder and add:
```env
PORT=3000
MONGODB_URI=mongodb+srv://it24102481_db_user:QOAQkqAHFBbvQa2J@cybervault.my95erc.mongodb.net/cybervault?retryWrites=true&w=majority&appName=cybervault
JWT_SECRET=cybervault_super_secret_jwt_key_2026
NODE_ENV=development
```

- **`PORT`**: Port number for the application server (default: `3000`).
- **`MONGODB_URI`**: The connection string pointing to the MongoDB Atlas database. The database is pre-configured with the challenges and evidence assets.
- **`JWT_SECRET`**: Key used to cryptographically sign authentication session tokens.

---

## 🌐 5. Frontend & Backend Details

### Frontend
- **Technology:** Pure HTML5 + CSS3 + Vanilla JavaScript.
- **Why no heavy frontend build step?** We do not use React, Next.js, or Vite build steps here so that **anyone can clone and run it instantly** without dealing with complex node package compilation errors, Webpack issues, or long build times.
- **Serving:** Static assets (`dashboard.html`, `challenges.html`, `scoreboard.html`, `js/`, `css/`) are automatically served by the Express server from root.

### Backend
- **Framework:** Express 5.x on Node.js.
- **Security:**
  - Password hashing using `bcryptjs`.
  - Stateless JSON Web Tokens (`jsonwebtoken`) with expiration.
  - Role-based authorization (`user` vs `admin`).
  - Flag validation normalization (trims whitespace and ignores case discrepancies).
  - In-browser simulated terminal execution for users without local command tools.

---

## 🐳 6. Why We Use Docker & How to Set It Up

### Why Docker is Needed for CTF Challenges
1. **Host Safety & Sandboxing:** Challenge 6 requires an authentic Linux target with deliberate security flaws (an over-permissive group permission and an unauthenticated localhost daemon). Running these security misconfigurations directly on a host machine could expose your actual computer to risks.
2. **True Operating System Emulation:** A user on Windows or macOS cannot natively provide an Ubuntu Linux file system with realistic file permissions (`chmod 640`), background daemon daemons, and SSH servers. Docker creates an identical, lightweight Linux sandbox regardless of host OS.
3. **Instant Reset:** If a student accidentally breaks, deletes, or modifies files in the target, restarting the Docker container instantly restores the original challenge environment.

---

### Step-by-Step: Setting Up Docker for Challenge 6

#### 1. Start Docker Desktop
Open the **Docker Desktop** application on your machine and wait until the status indicator turns green (**"Engine running"**).

#### 2. Open a New Terminal Window
Navigate to the `operations/stage04` directory:
```bash
cd "path/to/cybervault/operations/stage04"
```

#### 3. Build the Docker Image
Build the challenge target image:
```bash
docker build -t cybervault-stage4 .
```
*(This downloads a lightweight Ubuntu image, creates the `analyst` user, prepares the files, and installs the services. This only takes 1–2 minutes.)*

#### 4. Run the Challenge Container
Start the container in the background, mapping host port `2222` to the container's SSH port `22`:
```bash
docker run -d -p 2222:22 --name cybervault-stage4-container cybervault-stage4
```

#### 5. Verify the Container is Running
Check running containers:
```bash
docker ps
```
You will see `cybervault-stage4-container` active with port `0.0.0.0:2222->22/tcp`.

---

### Connecting to the Target Machine

Your friend can now solve Challenge 6 using their standard terminal or PowerShell:

```bash
ssh analyst@localhost -p 2222
```
- **Password:** `cipher2026`

#### Managing the Docker Container
- **Stop container:** `docker stop cybervault-stage4-container`
- **Restart container:** `docker restart cybervault-stage4-container`
- **Reset to clean state:**
  ```bash
  docker rm -f cybervault-stage4-container
  docker run -d -p 2222:22 --name cybervault-stage4-container cybervault-stage4
  ```

---

## 🔑 7. Default Accounts & Credentials

### 1. Master Administrator
- **Login URL:** [http://localhost:3000/index.html](http://localhost:3000/index.html)
- **Email:** `admin@cybervault.com`
- **Password:** `admin33`
- **Capabilities:**
  - View all registered players and real-time scores
  - Monitor audit logs and flag submission history
  - Trigger challenge resets and system-wide synchronization
  - The Admin navigation tab is only visible to this account

### 2. Regular Player / Operator
- You can register any new player from the **Create Identity** tab on the login page:
  - Any email (e.g., `student@cybervault.com`)
  - Any password (minimum 6 characters)
  - Custom Callsign (e.g., `ShadowCipher`)
  - Student ID

---

## 🎯 8. Challenge Overview & Walkthrough Reference

| ID | Challenge Title | Category | Solved By | Flag |
| :---: | :--- | :--- | :--- | :--- |
| **0** | **Stage 01: Initial Foothold** | Steganography | Steghide / Hex extract | `IE3132{WELCOME_AGENT_2026}` |
| **1** | **Stage 02: Corrupted Evidence** | Forensics | Raw disk image carving | `IE3132{FORENSIC_MASTER_DECRYPTED}` |
| **2** | **Stage 03: The Ghost Runner** | Web / JS Reverse | Logic inspection / Minigame | `IE3132{WEB_DECODE_SUCCESS_9918}` |
| **3** | **Stage 04: Hidden in Plain Sight** | Steganography | Image metadata & string analysis | `IE3132{METADATA_EXTRACTED_SUCCESS}` |
| **4** | **Stage 05: Broken Cipher** | Cryptography | Vigenère cipher frequency analysis | `IE3132{VIGENERE_DECRYPTED_SUCCESS}` |
| **5** | **Stage 06: Misconfigured Permissions** | Linux Privilege Escalation | SSH + Group perm leak + Local REST API | `IE3132{MISCONFIGURED_PERMISSIONS}` |

> **Note:** The web platform also features a **Simulated Interactive Terminal** on each challenge page. If the user doesn't have local tools installed (e.g. `curl`, `steghide`, or Python), they can run commands directly inside the in-browser terminal!

---

## 🛠️ 9. Troubleshooting & Common Issues

### Issue 1: `Port 3000 is already in use` (EADDRINUSE)
- **Cause:** Another instance of Node or another program is already listening on port 3000.
- **Solution (Windows PowerShell):**
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```
- Or change `PORT=3001` inside your `.env` file and restart.

### Issue 2: `Docker: command not found` or Docker Daemon not running
- **Cause:** Docker Desktop is not installed or not launched.
- **Solution:** Launch Docker Desktop from the Start menu and wait until the status displays **"Docker Desktop running"**.

### Issue 3: `ssh: connect to host localhost port 2222: Connection refused`
- **Cause:** The Docker container for Challenge 6 is not running.
- **Solution:**
  ```bash
  cd operations/stage04
  docker run -d -p 2222:22 --name cybervault-stage4-container cybervault-stage4
  ```

### Issue 4: `MongoServerError: bad auth / IP not whitelisted`
- **Cause:** The MongoDB Atlas cluster is rejecting the connection IP address.
- **Solution:** Ensure the database user credentials in `.env` are accurate. The current Atlas cluster is configured with network access from anywhere (`0.0.0.0/0`), so it works out-of-the-box on any internet connection.

---

### 🌟 Summary Checklist for Your Friend
1. Install **Node.js** and **Docker Desktop**.
2. Open terminal in the `cybervault` folder.
3. Run `npm install` followed by `npm start`.
4. Open [http://localhost:3000](http://localhost:3000) in the browser.
5. In another terminal, go to `operations/stage04` and run:
   ```bash
   docker build -t cybervault-stage4 .
   docker run -d -p 2222:22 --name cybervault-stage4-container cybervault-stage4
   ```
6. Log in and start capturing flags!
