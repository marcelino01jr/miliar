# Architecture & Design Blueprint: M=MILYARDERRRRR!!!! 💸🚀
**Track Money. Build Wealth. Become Milyarderrrrrr.**

This document outlines the full system architecture, database schema, UI wireframes, user flow, and API design for the personal wealth operating system.

---

## 1. System Architecture
We adopt a robust, unified full-stack architecture running inside a secure container:
- **Client (Frontend)**: React 19 SPA styled with Tailwind CSS (v4) and animated with Framer Motion (`motion/react`). Built using Vite.
- **Server (Backend)**: Node.js Express server (`server.ts`) which acts as both the API server for data endpoints and the asset server for the compiled React frontend.
- **Database / Storage**: Relational SQL-style file-based persistence engine (`/data/db.json`) reading and writing transactions, budgets, assets, liabilities, and goals asynchronously. This ensures durable enterprise-grade persistence, zero database cold start, and absolute portability.
- **AI Engine**: Server-side Google Gemini API (`@google/genai` using `gemini-3.5-flash`) loaded with structured financial context for accurate, full RAG-based personal advisory and smart predictions.

---

## 2. Directory & Folder Structure
```text
/
├── .env.example               # Environment variables template (GEMINI_API_KEY, APP_URL)
├── .gitignore                 # Exclusion configuration for build objects and logs
├── index.html                 # Main application skeleton
├── package.json               # Dependencies and runner scripts (Vite, Express, Tailwind, Motion, etc.)
├── tsconfig.json              # TypeScript compilation setup
├── vite.config.ts             # Vite bundle and alias setups
├── metadata.json              # Custom App metadata (Name, Description, Major Capabilities)
├── server.ts                  # Main Express Server running Vite middleware & APIs
│
└── src/                       # Frontend source directory
    ├── main.tsx               # Client entry point
    ├── index.css              # Tailwind styles and global font (Inter, JetBrains Mono)
    ├── App.tsx                # Central dashboard container & navigation-state controller
    ├── types.ts               # Unified TypeScript interfaces for Category, Transaction, etc.
    │
    ├── components/            # Extracted UI component files
    │   ├── BottomNav.tsx      # Sticky bottom mobile-UX navigation bar
    │   ├── StatsHero.tsx      # Premium Glassmorphism Stats card
    │   ├── QuickAdd.tsx       # 5-second Quick Add Transaction modal
    │   ├── HeatmapGrid.tsx    # GitHub-style daily volume visualization
    │   ├── WealthCharts.tsx   # Recharts area, bar, and donut visualizations
    │   └── AIChat.tsx         # AI Financial advisory interface
    │
    └── utils/                 # General helpers and initial seed states
        └── seed.ts            # 12-month realistic Indonesian cashflow seed data
```

---

## 3. Database Schema Design (JSON/TypeScript Entity Relations)
The relational schema comprises 6 primary collections with integrity keys:

### `User`
- `id`: `string` (UUID)
- `email`: `string`
- `created_at`: `string` (ISO Timestamp)

### `Category`
- `id`: `string`
- `name`: `string`
- `icon`: `string` (Lucide-react icon identifier)
- `color`: `string` (Hex color)
- `type`: `'INCOME' | 'EXPENSE' | 'INVESTMENT'`

### `Transaction`
- `id`: `string`
- `amount`: `number` (Rupiah/IDR format)
- `notes`: `string`
- `transaction_date`: `string` (YYYY-MM-DD)
- `type`: `'INCOME' | 'EXPENSE' | 'INVESTMENT'`
- `category_id`: `string`
- `is_recurring`: `boolean` (Monthly, Weekly, Yearly helper)
- `recurring_period`: `'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'`

### `Goal`
- `id`: `string`
- `title`: `string`
- `target_amount`: `number`
- `current_amount`: `number`
- `target_date`: `string` (YYYY-MM-DD)

### `Budget`
- `id`: `string`
- `category_id`: `string`
- `monthly_limit`: `number`

### `Asset`
- `id`: `string`
- `name`: `string`
- `asset_type`: `'CASH' | 'STOCK' | 'MUTUAL_FUND' | 'GOLD' | 'CRYPTO' | 'PROPERTY'`
- `value`: `number`

### `Liability`
- `id`: `string`
- `name`: `string`
- `amount`: `number`

---

## 4. UI Wireframe & App Layout
The application has a mobile-first premium **Dark Mode** canvas (`#09090B`) utilizing a sleek bottom navigation dock with a vibrant primary violet accent (`#7C3AED` as logo & highlights) and cyan accents (`#06B6D4` for secondary cues).

```text
+---------------------------------------------+
|  M=MILYARDERRRRR!!!! 💸🚀                   |
+---------------------------------------------+
|  [ PREMIUM HERO STATS - Glassmorphism Card] |
|   NET WORTH: Rp 245.500.000 (GROWTH: +8.4%) |
|   Income: Rp 20M  | Expense: Rp 8.5M        |
|   Investment: Rp 5M | Saving Rate: 57.5%    |
+---------------------------------------------+
|  [ HEATMAP GRID - GitHub Style Days ]       |
|  [-----------------------------------------]|
+---------------------------------------------+
|  [ TOP SPENDING & QUICK INSIGHT CARDS ]     |
+---------------------------------------------+
|                                             |
|                                             |
|         ( + QUICK ADD ACTION BUTTON )       |
|                                             |
+---------------------------------------------+
|  [🏠 Home] [💸 Trans] [📊 Charts] [🎯 Goal]  |
+---------------------------------------------+
```

---

## 5. User Journey & Flow
1. **Explore Home**: User opens the app, seeing their real-time Net Worth, active monthly velocity, and visual heatmap logs.
2. **5-Sec Log (Quick Add)**: Tap the floating purple `+` hub on any screen -> enter exact numeric value -> select Category -> Save. Modal vanishes, numbers refresh.
3. **Transaction Grid**: Browse logs chronologically, search notes, filter categories, alter values with interactive sheets, or delete stale logs.
4. **Budget Watch**: Highlight Category trackers relative to their progress (green, amber, or flashing red Alert if threshold is saturated).
5. **Goal-to-Rich Progression**: Review your wealth milestones (e.g., "S1 Emergency Fund", "New Laptop", "S2 Education", "Beli Rumah"). Track dynamic compounding estimations and expected unlock months.
6. **AI Agent Assistant**: Ask natural financial questions. The AI loads structural reports on largest spending, monthly rate projections, and alerts you to coffee anomalies.

---

## 6. API Services Design (Server Endpoints)
- `GET /api/v1/wealth` — Returns full current user data bundle (transactions, assets, liabilities, goals, budgets).
- `POST /api/v1/transactions` — Add or edit financial transaction.
- `DELETE /api/v1/transactions/:id` — Purge a transaction log.
- `POST /api/v1/budgets` — Set custom expenditure limits by metric category.
- `POST /api/v1/goals` — Post financial milestone goals or record additions.
- `POST /api/v1/assets` & `POST /api/v1/liabilities` — Modify asset and liability net-worth metrics.
- `POST /api/v1/ai/consult` — Run rich RAG queries against local logs using a systemic template with Gemini.
- `GET /api/v1/reports/pdf` — Retrieve aggregated structural printable invoice summaries.
