/**
 * CyberVault: Project Null Byte - Data, API Client & State Store
 */

const challenges = [
  {
    id: 0,
    title: "The Ghost Who Walked",
    domain: "OSINT, Digital Forensics, Git Forensics, Steganography",
    stage: "CTF-OSINT",
    difficulty: "Hard",
    points: 100,
    file: "DealIsDone.jpg",
    flag: "IE3132{gh0st_1n_th3_m4ch1n3}",
    tools: "exiftool · Base64 · Git · GitHub Web UI · OSINT Tools · Web Browser",
    objective: "Apply advanced OSINT techniques (reverse image search, metadata analysis, social media reconnaissance) and Git forensics to recover hidden information from commit history.",
    task: "Follow the digital trail starting from DealIsDone.jpg: analyze metadata → decode Base64 clue → investigate Pastebin & Forum archive → trace developer GitHub profile → inspect commit history for secrets.txt to recover the flag.",
    story: "Tech Vanguard, a multinational technology conglomerate, has been rocked by a massive data breach. A whistleblower known only as \"NoOne\" has leaked internal documents proving the company illegally sold user data and manipulated financial records. Working as an independent cybersecurity investigator, you have been hired by journalists to track down \"NoOne\" and recover the full hidden evidence. Your only lead: DealIsDone.jpg released on an underground forum.",
    hints: [
      "The first clue is hidden in the image's metadata. Use exiftool to examine the file thoroughly.",
      "The Base64 string in the metadata points to a pastebin. Look for system logs and legacy references.",
      "TechVanguard was a forum from 2019. Search for archived profiles. The signature contains a URL link.",
      "Check the Git commit history. The flag was committed and then deleted. Look for secrets.txt."
    ]
  },
  {
    id: 1,
    title: "The Ghost's Workstation",
    domain: "Digital Forensics, Steganography, OSINT",
    stage: "CTF-DF",
    difficulty: "Hard",
    points: 200,
    file: "disk_image_IE3132.dd",
    flag: "IE3132{gh0st_1n_th3_w0rkst4t10n}",
    tools: "sleuthkit (fls, icat) · exiftool · base64 · steghide · unzip",
    objective: "Apply disk forensics techniques to recover deleted files from a FAT16 image, carve deleted data using fls/icat, inspect metadata, decode Base64 credentials, and extract steganographic flags.",
    task: "Recover deleted ZIP (backup_2024.zip) from FAT16 disk image → extract company_photo.jpg → analyze EXIF metadata for Base64 password → decode password → extract hidden flag.txt with steghide.",
    story: "Nexora Dynamics, a multinational defense contractor, has been rocked by allegations of illegal arms deals. A senior systems administrator disappeared after copying classified documents to an external drive. The company's internal security team seized his workstation but found nothing. The files had been deleted. A disk image named disk_image_IE3132.dd was made before the machine was wiped. As a freelance forensic investigator hired by Nexora's legal team, recover the deleted evidence and extract the final flag.",
    hints: [
      "The evidence was deleted, but disk forensics can recover it. Use fls -r -d disk_image_IE3132.dd to list deleted files. Look for a ZIP file and note its inode number.",
      "Use the inode number from the previous step to recover the deleted file. Try: INODE=$(fls -r -d disk_image_IE3132.dd | grep \"backup\" | awk '{print $3}' | tr -d ':') icat disk_image_IE3132.dd $INODE > recovered.zip",
      "The recovered file is a ZIP archive. Extract it with unzip. Inside, you'll find an image file.",
      "The image's metadata contains a Base64-encoded string. Use exiftool to read it, then decode it with base64. The result is a password you'll need later.",
      "Not all secrets are visible. Use steghide to check for hidden data in the image. The password from the previous step will unlock it. Extract the hidden file to get the flag."
    ]
  },
  {
    id: 2,
    title: "The Ghost's Game",
    domain: "Reverse Engineering, Client-Side Analysis, JavaScript Forensics",
    stage: "CTF-RE",
    difficulty: "Hard",
    points: 300,
    file: "ghost_runner.html",
    flag: "IE3132{gh0st_pl4ys_t0_w1n}",
    allowedAliases: [
      "IE3132{gh0st_pl4ys_t0_w1n}",
      "IE3132{reverse_demo}",
      "IE3132{silent_player_ghost_runner_win}"
    ],
    tools: "Web browser · DevTools (F12) · Text Editor",
    objective: "Apply client-side reverse engineering techniques to analyze JavaScript game logic, inspect runtime state, and bypass game restrictions.",
    task: "Analyze the game's source, find the win condition, and either (a) complete Level 4 legitimately or (b) force the win via DevTools Console.",
    story: "PulseForge Studios was on the verge of releasing their flagship game, Ghost Runner. A week before launch, their build server was breached by a rival company, Helix Interactive. The attacker, known only as \"SilentPlayer\", replaced the final build with a modified version containing an embedded flag.",
    hints: [
      "The game seems beatable, but maybe you don't need to play it at all. Open your browser's Developer Tools (F12) and explore JavaScript.",
      "There's a function in the code called _0xwin(). Find it. What two variables does it check?",
      "The win condition requires level > 4 and keysCollected === 3. Can you set these values from the Console tab?",
      "Try typing level = 5 and keysCollected = 3 in the Console, then call checkWin(). What happens?"
    ]
  },
  {
    id: 3,
    title: "Hidden in Plain Sight",
    domain: "Steganography",
    stage: "CTF-S",
    difficulty: "Easy",
    points: 400,
    file: "evidence.jpg",
    tools: "exiftool · steghide · CyberChef",
    objective: "Inspect JPEG metadata and recover the concealed confidential note containing the flag and next-stage keyword.",
    task: "Download evidence.jpg. Inspect its metadata, investigate whether data is concealed, and submit the flag found in the recovered note. Preserve the next-stage keyword.",
    story: "An incident response team recovered a suspicious photograph. Investigate its metadata and contents to find a hidden confidential note.",
    hints: [
      "Inspect the JPEG metadata before attempting extraction.",
      "An embedding/extraction utility such as steghide may help.",
      "Passphrases are case-sensitive. Try the project codename in lowercase immediately followed by the assignment year."
    ]
  },
  {
    id: 4,
    title: "Broken Cipher",
    domain: "Cryptography",
    stage: "CTF-C",
    difficulty: "Moderate",
    points: 500,
    file: "intercept.txt",
    tools: "Base64 · CyberChef · Vigenère Decoder",
    objective: "Recognize the Base64 encoding layer, distinguish encoding from encryption, and apply Vigenère decryption using the previous-stage keyphrase.",
    task: "Download intercept.txt. Identify each layer of encoding or encryption and recover the original message. Use the keyword from Stage 02 (ORCHID) where needed, then submit the Stage 03 flag.",
    story: "Investigators recovered an intercepted message, but its contents were transformed in more than one way.",
    hints: [
      "Check whether the outer layer is an encoding rather than encryption.",
      "After decoding, consider a classical polyalphabetic cipher.",
      "Use the keyword recovered from the previous challenge as the Vigenere key."
    ]
  },
  {
    id: 5,
    title: "Misconfigured Permissions",
    domain: "Linux / System Security",
    stage: "CTF-LSS",
    difficulty: "Moderate–Hard",
    points: 600,
    file: "connection_guide.txt",
    tools: "SSH · Bash · curl · Linux Permissions",
    objective: "Connect to the target Linux host via SSH, discover group read permissions on legacy backup configurations, extract the internal API token, and query the local vault endpoint.",
    task: "Connect to the authorized challenge box by SSH with the supplied credentials (port 2222, user 'analyst', password 'cipher2026'). Investigate your group memberships, accessible backup configuration, and local service access controls to recover the flag.",
    story: "A legacy backup configuration appears to have overly broad group-read permissions, while the actual vault flag is protected. Exploit group permissions to extract the token and query the local vault daemon.",
    hints: [
      "Use whoami and id to understand which account and groups you have.",
      "A configuration backup may be readable by a group that should not have access.",
      "The backup can contain details needed to authenticate to a localhost vault endpoint."
    ],
    connection: {
      protocol: "ssh",
      host: "127.0.0.1",
      port: 2222,
      username: "analyst",
      password: "cipher2026"
    }
  }
];

const sampleLeaderboard = [
  { name: "cipher_fox", solved: 6, score: 2020, time: "Today · 08:32" },
  { name: "root_orbit", solved: 5, score: 1560, time: "Today · 07:41" },
  { name: "packet_lily", solved: 4, score: 1180, time: "Yesterday · 19:06" },
  { name: "null_wisp", solved: 3, score: 670, time: "Oct 04 · 14:12" },
  { name: "byte_rover", solved: 2, score: 280, time: "Oct 02 · 10:28" }
];

const STORAGE_KEY = "cybervault_state";
const USERS_KEY = "cybervault_users";
const TOKEN_KEY = "cybervault_jwt";

// Default admin account definition
const DEFAULT_ADMIN = {
  email: "admin@cybervault.com",
  password: "admin33",
  callsign: "SysAdmin",
  studentId: "ADM-001",
  role: "admin",
  createdAt: "System Default"
};

// ================= API CLIENT HELPERS =================
const API_BASE = "/api";

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.warn(`[CyberVault API Fallback] ${endpoint}:`, err.message);
    return { ok: false, status: 0, data: null, error: err.message };
  }
}

// ================= AUTH API CALLS =================
async function registerUserApi({ email, password, callsign, studentId }) {
  const res = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, callsign, studentId })
  });

  if (res.ok && res.data && res.data.success) {
    if (res.data.token) setAuthToken(res.data.token);
    return { success: true, user: res.data.user };
  }
  
  if (res.data && res.data.message) {
    return { success: false, message: res.data.message };
  }

  // Fallback to local
  return registerUserLocal({ email, password, callsign, studentId });
}

async function authenticateUserApi(email, password) {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  if (res.ok && res.data && res.data.success) {
    if (res.data.token) setAuthToken(res.data.token);
    return { success: true, user: res.data.user };
  }

  if (res.data && res.data.message) {
    return { success: false, message: res.data.message };
  }

  // Fallback to local
  return authenticateUserLocal(email, password);
}

// Local Auth Fallbacks
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const initialUsers = [DEFAULT_ADMIN];
      localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    const users = JSON.parse(raw);
    if (!users.some(u => u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase())) {
      users.unshift(DEFAULT_ADMIN);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return users;
  } catch (e) {
    return [DEFAULT_ADMIN];
  }
}

function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users:", e);
  }
}

function registerUserLocal({ email, password, callsign, studentId }) {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: "An account with this email address already exists." };
  }
  if (users.some(u => u.callsign.toLowerCase() === callsign.trim().toLowerCase())) {
    return { success: false, message: "This operator callsign is already taken." };
  }

  const newUser = {
    email: normalizedEmail,
    password: password,
    callsign: callsign.trim(),
    studentId: studentId.trim() || "IT2410" + Math.floor(1000 + Math.random() * 9000),
    role: "user",
    createdAt: new Date().toLocaleDateString()
  };

  users.push(newUser);
  saveRegisteredUsers(users);
  return { success: true, user: newUser };
}

function authenticateUserLocal(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (normalizedEmail === "admin@cybervault.com" && trimmedPassword === "admin33") {
    return {
      success: true,
      user: {
        email: "admin@cybervault.com",
        callsign: "Master Administrator",
        studentId: "ADM-ROOT",
        role: "admin"
      }
    };
  }

  const users = getRegisteredUsers();
  const found = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === trimmedPassword);

  if (found) {
    return {
      success: true,
      user: {
        email: found.email,
        callsign: found.callsign,
        studentId: found.studentId,
        role: found.role || "user",
        score: found.score || 0,
        solved: Array.isArray(found.solved) ? found.solved : [],
        revealed: Array.isArray(found.revealed) ? found.revealed : [],
        activity: Array.isArray(found.activity) ? found.activity : []
      }
    };
  }

  return { success: false, message: "Invalid email or password. Please try again or register." };
}

// Backward compatible sync wrappers
function registerUser(args) { return registerUserLocal(args); }
function authenticateUser(email, pass) { return authenticateUserLocal(email, pass); }

// ================= STATE MANAGEMENT =================
function getDefaultState() {
  return {
    name: "",
    email: "",
    role: "user",
    studentId: "",
    solved: [],
    revealed: [],
    disabled: [],
    score: 0,
    attempts: 0,
    activity: [],
    current: 0,
    started: {},
    period: "all",
    theme: "dark"
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultState(),
      ...parsed,
      solved: Array.isArray(parsed.solved) ? parsed.solved : [],
      revealed: Array.isArray(parsed.revealed) ? parsed.revealed : [],
      disabled: Array.isArray(parsed.disabled) ? parsed.disabled : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
      started: parsed.started || {}
    };
  } catch (e) {
    console.error("Failed to parse state from localStorage:", e);
    return getDefaultState();
  }
}

let AppState = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
  }
}

function resetAllState() {
  const currentUser = {
    name: AppState.name,
    email: AppState.email,
    role: AppState.role,
    studentId: AppState.studentId
  };
  AppState = getDefaultState();
  AppState.name = currentUser.name;
  AppState.email = currentUser.email;
  AppState.role = currentUser.role;
  AppState.studentId = currentUser.studentId;
  saveState();
}

function getRank() {
  return Math.max(1, 6 - AppState.solved.length);
}

function isAvailable(index) {
  if (AppState.disabled.includes(index)) return false;
  return index === 0 || AppState.solved.includes(index - 1) || AppState.solved.includes(index);
}

function getTimestamp() {
  return new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function logActivity(message) {
  AppState.activity.unshift({
    message,
    time: getTimestamp()
  });
  if (AppState.activity.length > 20) {
    AppState.activity.length = 20;
  }
  saveState();
}

function sanitizeHTML(str) {
  return String(str || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}
