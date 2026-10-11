const { hashFlag } = require('./flagValidator');

const initialChallenges = [
  {
    id: 0,
    title: "The Ghost Who Walked",
    domain: "OSINT, Digital Forensics, Git Forensics, Steganography",
    stage: "CTF-OSINT",
    difficulty: "Hard",
    points: 100,
    file: "DealIsDone.jpg",
    flag: "IE3132{gh0st_1n_th3_m4ch1n3}",
    allowedAliases: [
      "IE3132{gh0st_1n_th3_m4ch1n3}",
      "IE3132{osint_demo}",
      "IE3132{osint_ghost_breach_2026}"
    ],
    tools: "exiftool · Base64 · Git · GitHub Web UI · OSINT Tools · Web Browser",
    objective: "Apply advanced OSINT techniques (reverse image search, metadata analysis, social media reconnaissance) and Git forensics to recover hidden information from commit history.",
    task: "Follow the digital trail starting from DealIsDone.jpg: analyze metadata → decode Base64 clue → investigate Pastebin & Forum archive → trace developer GitHub profile → inspect commit history for secrets.txt to recover the flag.",
    story: "Tech Vanguard, a multinational technology conglomerate, has been rocked by a massive data breach. A whistleblower known only as \"NoOne\" has leaked internal documents proving the company illegally sold user data and manipulated financial records. Working as an independent cybersecurity investigator, you have been hired by journalists to track down \"NoOne\" and recover the full hidden evidence. Your only lead: DealIsDone.jpg released on an underground forum.",
    hints: [
      "The first clue is hidden in the image's metadata. Use exiftool to examine the file thoroughly.",
      "The Base64 string in the metadata points to a pastebin. Look for system logs and legacy references.",
      "TechVanguard was a forum from 2019. Search for archived profiles. The signature contains a URL link.",
      "Check the Git commit history. The flag was committed and then deleted. Look for secrets.txt."
    ],
    isEnabled: true
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
    allowedAliases: [
      "IE3132{gh0st_1n_th3_w0rkst4t10n}",
      "IE3132{forensics_demo}",
      "IE3132{forensics_workstation_recovered}"
    ],
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
    ],
    isEnabled: true
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
    ],
    isEnabled: true
  },
  {
    id: 3,
    title: "Hidden in Plain Sight",
    domain: "Steganography",
    stage: "CTF-S",
    difficulty: "Easy",
    points: 400,
    file: "evidence.jpg",
    flag: "IE3132{HIDDEN_IN_PLAIN_SIGHT}",
    allowedAliases: [
      "IE3132{HIDDEN_IN_PLAIN_SIGHT}",
      "IE3132{stego_demo}",
      "IE3132{stego_hidden_clue_extracted}"
    ],
    tools: "exiftool · steghide · CyberChef",
    objective: "Inspect JPEG metadata and recover the concealed confidential note containing the flag and next-stage keyword.",
    task: "Download evidence.jpg. Inspect its metadata, investigate whether data is concealed, and submit the flag found in the recovered note. Preserve the next-stage keyword.",
    story: "An incident response team recovered a suspicious photograph. Investigate its metadata and contents to find a hidden confidential note.",
    hints: [
      "Inspect the JPEG metadata before attempting extraction.",
      "An embedding/extraction utility such as steghide may help.",
      "Passphrases are case-sensitive. Try the project codename in lowercase immediately followed by the assignment year."
    ],
    isEnabled: true
  },
  {
    id: 4,
    title: "Broken Cipher",
    domain: "Cryptography",
    stage: "CTF-C",
    difficulty: "Moderate",
    points: 500,
    file: "intercept.txt",
    flag: "IE3132{BROKEN_CIPHER_SOLVED}",
    allowedAliases: [
      "IE3132{BROKEN_CIPHER_SOLVED}",
      "IE3132{cipher_demo}",
      "IE3132{vigenere_broken_cipher_recovered}"
    ],
    tools: "Base64 · CyberChef · Vigenère Decoder",
    objective: "Recognize the Base64 encoding layer, distinguish encoding from encryption, and apply Vigenère decryption using the previous-stage keyphrase.",
    task: "Download intercept.txt. Identify each layer of encoding or encryption and recover the original message. Use the keyword from Stage 02 (ORCHID) where needed, then submit the Stage 03 flag.",
    story: "Investigators recovered an intercepted message, but its contents were transformed in more than one way.",
    hints: [
      "Check whether the outer layer is an encoding rather than encryption.",
      "After decoding, consider a classical polyalphabetic cipher.",
      "Use the keyword recovered from the previous challenge as the Vigenere key."
    ],
    isEnabled: true
  },
  {
    id: 5,
    title: "Misconfigured Permissions",
    domain: "Linux / System Security",
    stage: "CTF-LSS",
    difficulty: "Moderate–Hard",
    points: 600,
    file: "connection_guide.txt",
    flag: "IE3132{MISCONFIGURED_PERMISSIONS}",
    allowedAliases: [
      "IE3132{MISCONFIGURED_PERMISSIONS}",
      "IE3132{linux_demo}",
      "IE3132{linux_priv_escalation_token_valid}"
    ],
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
    },
    isEnabled: true
  }
];

const sampleLeaderboard = [
  { name: "cipher_fox", solved: 6, score: 2020, time: "Today · 08:32" },
  { name: "root_orbit", solved: 5, score: 1560, time: "Today · 07:41" },
  { name: "packet_lily", solved: 4, score: 1180, time: "Yesterday · 19:06" },
  { name: "null_wisp", solved: 3, score: 670, time: "Oct 04 · 14:12" },
  { name: "byte_rover", solved: 2, score: 280, time: "Oct 02 · 10:28" }
];

module.exports = {
  initialChallenges,
  sampleLeaderboard
};
