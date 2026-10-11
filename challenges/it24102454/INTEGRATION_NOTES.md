# Integration notes — public, spoiler-free

This file documents boundaries and handover responsibilities; it intentionally contains no real flags, participant SSH credentials, encryption passwords, extracted notes, private challenge images, or solutions.

## Participant-facing requirements

| Web stage | Presentation | Challenge download/access | Planned points (adjust as a team) | Dependencies |
|---|---|---|---:|---|
| STG-02 | Steganography — Easy | JPEG provided by challenge hosting system at release | 100 | Confirm unlock in team flow |
| STG-03 | Cryptography — Moderate | Intercept text provided by challenge hosting system at release | 200 | Stage 02 supplies a required keyword |
| STG-06 | Linux / System Security — Moderate–Hard | SSH challenge instance; platform presents assigned host/port/credentials | 300 | Confirm location and unlock in team flow |

## Important boundaries

- `participant` challenge files still contain solvable content; even when they do not visibly contain a plaintext flag, **do not commit them to public GitHub before the event**.
- Internal Docker configuration, backup, flags, source scripts, and solution/test outputs must stay in private storage. `.gitignore` is a safeguard, **not** a secrecy guarantee.
- The website should keep challenge answers and scoring enforcement server-side, not in downloadable JSON or client JavaScript.
- SSH service should be reachable through an authorized isolated network, with separate participant instances or an agreed safe reset mechanism. Avoid exposing the container to the public Internet by default.
- The original local Docker mapping used loopback-only SSH; the website team must design a new restricted connection path for remote participants.
- Stage IDs are intentionally mapped from the original author folders to the team's README convention; validate them with all members.

## Acceptance tests for integrator

- Participant cannot browse secret/solution/source files.
- Stage 02 and STG-03 artifacts are correctly served when the challenge is released.
- STG-03 is solvable from STG-02's recovered information.
- Stage 06 SSH service starts, stays isolated, accepts assigned participant login, and supports intended challenge path.
- Wrong flags receive rejection; correct flags are recorded once per participant, without duplicated points.
- Progress and stage unlocking survive logout/login; reset/recovery are documented.
- Final testing occurs using a fresh non-admin account and does not rely on author test outputs.

## Working with team Git

Develop this contribution on a feature branch from up-to-date `main`. Stage only this `challenges/it24102454/` directory. Open a pull request; do not push directly to `main`. If the branch lacks write access, ask the owner for collaborator access or follow the team's fork-and-pull-request policy.
