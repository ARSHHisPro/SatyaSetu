# SatyaSetu - SDG-16 Civic Integrity Hub

SatyaSetu is a secure, transparent educational community integrity hub designed in alignment with Sustainable Development Goal 16 (Peace, Justice, and Strong Institutions).

## Project Structure (Flat Directory)

To maintain simplicity, ease of access, and offline capabilities, all files are located directly in the root directory:
- `index.html` — Landing page with features and stats preview.
- `report.html` — Complaint submission wizard.
- `dashboard.html` — Reports hub control dashboard showing stats and recent complaints.
- `analytics.html` — Graphic representation of charts and trend metrics.
- `complaints.html` — Complete searchable complaints list directory with paging filters.
- `complaint.html` — Individual complaint details page with action timeline tracking.
- `about.html` — About project developers and stack info.
- `privacy.html` — Security and anti-phishing guidelines.
- `settings.html` — Light/Dark theme toggles and language selects.
- `styles.css` — Combined layout stylesheets.
- `app.js` — Central coordinator script.
- `firebase.js` — Cloud Firestore database controller.
- `ai.js` — On-device natural language classification metrics.
- `charts.js` — Chart.js graphs renderer.
- `validation.js` — PII security auditors.
- `utils.js` — Exports, QR codes, and spambot checkers.
- `manifest.json` — PWA manifest configs.
- `service-worker.js` — Offline cache operations.

## Running Locally

Double-click `index.html` from the file explorer to run the application locally. It utilizes a global window namespace structure to load modules, resolving browser CORS restrictions under the `file://` protocol.
