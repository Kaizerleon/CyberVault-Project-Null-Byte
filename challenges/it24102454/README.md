# IE3132 CTF — Challenge contribution (IT24102454)

**Project:** CyberVault: Project Null Byte
**Status:** All three challenge modules were tested locally by the author; integration into the CyberVault web platform remains pending.
**Repository visibility:** PUBLIC — **no challenge payloads, answer keys, passwords, internal service code, or solvable challenge artifacts belong here before release**.

## Challenge overview

| CyberVault stage | Original author folder | Challenge | Domain | Participant interaction | Locally verified |
|---|---|---|---|---|---|
| STG-02 | `stage02` | Hidden in Plain Sight | Steganography | Download an evidence image; analyze image metadata and concealed content | Yes |
| STG-03 | `stage03` | Broken Cipher | Cryptography | Download an intercepted text file; unravel multiple transformations using information gained in STG-02 | Yes |
| STG-06 (proposed mapping) | `stage04` | Misconfigured Permissions | Linux / System Security | Connect to a deliberately restricted SSH-based Linux challenge box | Yes |

**ID mapping:** The author package calls the Linux challenge `stage04`, but the team's existing project README assigns **STG-04 to Digital Forensics** and **STG-06 to Linux/System Security**. The website integrator should confirm this mapping before publishing the challenge cards. Do not overwrite another member's STG-04.

## What the author finished

- Stage 02: confirmed that the supplied JPEG metadata can be inspected, that its embedded note can be extracted with the intended passphrase, and that the recovered note matches the original test hash.
- Stage 03: confirmed Base64 decoding and Vigenère decryption of the supplied intercept, recovering the intended result.
- Linux challenge: built and started the Docker container, verified SSH login as the challenge user, denied direct flag access, allowed the intentionally misconfigured backup-read path, and confirmed HTTP authorization behavior at the internal service.

These tests do **not** mean the group website, remote SSH networking, scoreboard, participant accounts, stage unlocks, or backend submission checks have been tested.

## Website teammate — integration contract

1. Obtain the **private author handover package** from the challenge author through a restricted channel. The author package is intentionally **not** in this public repository.
2. Add STG-02 and STG-03 download artifacts only to the access-controlled challenge delivery system at the approved release time. Public GitHub files are permanently accessible; do not push playable files early.
3. Run the Linux challenge in an isolated container/VM accessible only to authorized participants; provide SSH host, port and participant credentials through the CTF application at the appropriate stage.
4. Implement flag verification **only on the backend**, with progress tracking, stage unlocking, rate limiting, and scoring. Never include actual flags in frontend JavaScript, public JSON, GitHub Actions logs or Git commit history.
5. Preserve the dependency: STG-03 depends on information recovered while solving STG-02. Decide how to position the Linux stage within the team's six-stage flow.
6. Test all stages as a new participant, including downloads, SSH connectivity, reset behavior, incorrect flag rejection and correct flag acceptance.

See [`INTEGRATION_NOTES.md`](INTEGRATION_NOTES.md) and [`integration-manifest.example.json`](integration-manifest.example.json).

## Private handover (not stored here)

The private package includes unpublished participant artifacts, Docker source/configuration, solution notes, actual flags, and developer handover documentation. Access must be restricted to team members responsible for challenge hosting and integration.

**Do not copy** `IE3132_CTF_GitHub_Repo.zip`, `IE3132_Final_CTF.zip`, `IE3132_CTF_Admin_Integration.zip`, the participant release ZIP, or any full challenge source directory into this public repository prior to release.
