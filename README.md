# BRANDEX Ledger & Records (v0.1)

A **local-first** web app for:

- **Ledger System** (payments/transactions)
- **Application Record** (case/application tracking)
- **Dashboard & Reports** (KPIs and stage-wise charts)

Data is stored locally in the browser using **IndexedDB (Dexie)** for fast access. You can backup/restore via **JSON export/import** and export sheet-style **CSV**.

## Tech Stack

- React + TypeScript + Vite
- MUI (Material UI) for components and theming
- Dexie (IndexedDB)
- Recharts (charts)

## Features

- Application Record
  - Manual unique `Case ID`
  - Client prefix `X|A|B`
  - `Case No` enforced format: `###-###` (example `700-001`)
  - Auto `Folder No`: `X-700-001`
  - Type: Trademark/Copyright/NTN/Company
  - Trademark No, Class (1-45), Application Name
  - Stage 1-4 + Sub-stage
  - Notes + multi file upload (stored locally)
  - Case change history

- Ledger System
  - Payments linked to Case
  - Due / Received / Balance
  - Receipt image uploads (stored locally)
  - CSV export

- Backup
  - Export full DB to JSON
  - Import JSON (replace/merge)

## Local Setup

### Prerequisites

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run (dev)

```bash
npm run dev
```

Open the URL shown in your terminal (default: `http://127.0.0.1:5173`).

### Build

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

## Data & Privacy

- All data stays in your browser (IndexedDB) unless you export it.
- Backups are manual JSON downloads.

## Versioning

See `CHANGELOG.md`.
