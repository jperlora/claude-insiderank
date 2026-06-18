# Design: GA4 Live API — Page Performance Tab

**Date:** 2026-06-18
**Tool:** Inside Rank (`index.html`) deployed at https://insiderank.netlify.app
**Status:** Approved for implementation

---

## Overview

Replace the 4-CSV manual upload flow in the Page Performance tab with a one-click GA4 Live API pull. When the user clicks "Pull GA4 data", the tool reads the active Period A and Period B GSC snapshot date ranges, calls the GA4 Data API for those exact dates, and populates the Page Performance table automatically.

CSV upload zones remain as a fallback but are hidden once live data is loaded.

---

## Architecture

Single HTML file, no backend. Same browser-only OAuth 2.0 pattern as GSC Live.

- **Library:** Google Identity Services (GIS) — already loaded via CDN
- **New OAuth scope:** `https://www.googleapis.com/auth/analytics.readonly`
- **Separate token client** from GSC — user authorizes GA4 independently; GSC connection is unaffected
- **Same Google Cloud project** as GSC — no new Cloud project needed, just enable one additional API

---

## Google Cloud Setup (one-time addition)

User must do this once in the same Cloud project they set up for GSC:

1. Go to **APIs & Services → Library**
2. Search for and enable **Google Analytics Data API**
3. No new OAuth client needed — same Client ID, same authorized origins

---

## Settings Tab Changes

Add one new field to the existing **Google Search Console API** settings card:

- **GA4 Property ID** — numeric input (e.g. `123456789`)
  - Found in GA4 → Admin → Property Settings → Property ID
  - Saved to `localStorage` key `ga4_property_id`
  - Save button (inline, same row as input)
  - Helper text: "Your GA4 Property ID — a number found in GA4 → Admin → Property Settings"

---

## Page Performance Tab Changes

### New GA4 Live panel (replaces upload instructions)

Shown at the top of the Page Performance tab, above the upload zones.

**State 1 — GA4 not connected:**
```
[ Connect Google Analytics ]  button
"Connects to the same Google account as GSC — read-only access to your GA4 data"
```

**State 2 — Connected, no GSC periods set:**
```
Connected as user@example.com  ✓
[ Pull GA4 data ]  (disabled, tooltip: "Set GSC snapshots as Period A and B first")
```

**State 3 — Connected, periods available:**
```
Connected as user@example.com  ✓
Pulling for:
  Baseline: [Period A label]  2025-01-01 → 2025-03-31
  Current:  [Period B label]  2025-04-01 → 2025-06-30
[ Pull GA4 data ]  (enabled)
```

**State 4 — Data loaded:**
```
✓ GA4 data loaded  · 847 pages · Pulled just now
  Baseline: Jan–Mar 2025  ·  Current: Apr–Jun 2025
[ Re-pull ]  [ Disconnect ]
```

### CSV upload zones

- Remain in the DOM, unchanged
- When live GA4 data is present for a period: upload zone for that period is hidden
- If user manually uploads a CSV it overwrites the live data for that period (existing behaviour)
- A small "Switch to manual upload" toggle can re-show the upload zones

---

## API Details

### Endpoint

```
POST https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport
Authorization: Bearer {ga4AccessToken}
Content-Type: application/json
```

### Request body

```json
{
  "dateRanges": [{ "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }],
  "dimensions": [{ "name": "pagePath" }],
  "metrics": [
    { "name": "sessions" },
    { "name": "screenPageViews" },
    { "name": "averageSessionDuration" },
    { "name": "bounceRate" }
  ],
  "limit": 10000
}
```

### Response mapping

Each row in the GA4 response maps to the existing `GA4[period].rows` format:

| GA4 metric | `GA4` row field | Notes |
|---|---|---|
| `pagePath` | `url` | prefixed with site domain for matching |
| `sessions` | `visitors` | |
| `screenPageViews` | `views` | sets `hasViews: true` |
| `averageSessionDuration` | `timeOnPage` | seconds (float) |
| `bounceRate` | `bounceRate` | float 0–1 (GA4 returns 0–1) |

`hasBounce: true`, `newUsers: 0` (not pulled — not needed by renderer), `active: 0`, `keyEvents: 0`.

`dateRange` field: `"YYYY-MM-DD → YYYY-MM-DD"` (the snapshot's start/end).

### Pagination

GA4 Data API supports `offset` + `limit`. Loop until response `rowCount <= offset + limit`. Default limit 10,000 per call; most sites fit in one call.

---

## New JS Functions

### `initGa4TokenClient()`
- Initialises a separate GIS token client for scope `analytics.readonly`
- Reuses the same `gscClientId` from Settings (same Google Cloud project, same Client ID)
- Stores token in `let ga4AccessToken = null` / `let ga4TokenExpiry = 0`

### `connectGa4()`
- Calls `ga4TokenClient.requestAccessToken()`
- On success: saves token, fetches GA4 account/property list to verify connection, shows "Connected as [email]"

### `ga4FetchReport(propertyId, sd, ed)`
- Calls the runReport endpoint for the given date range
- Paginates if needed
- Returns array of raw GA4 rows

### `ga4MapRows(rawRows, sd, ed)`
- Maps raw GA4 API response to the `GA4[period]` format
- Returns `{ rows, dateRange, hasViews: true, hasBounce: true, filename: 'GA4 Live API' }`

### `pullGa4Live()`
- Reads `snapA()` and `snapB()` for their `start`/`end` dates
- Calls `ga4FetchReport` for each period
- Maps with `ga4MapRows`
- Sets `GA4.A` and `GA4.B` (and clears `GA4.PS` / `GA4.PSA` — pages & screens data is now part of the same pull)
- Saves to localStorage via existing `sv()` helper
- Calls `pushGa4ToSupabase()` for each period (reuses existing function)
- Calls `renderPerfView()` (no changes needed)

### `refreshGa4State()`
- Updates the GA4 panel UI based on connection state + loaded data
- Called on page load, after connect, after pull

---

## Token Handling

- `ga4AccessToken` stored in memory only — never written to localStorage
- 1-hour TTL (same as GSC)
- On expiry, re-auth triggered on next pull attempt
- On disconnect: token cleared, `GA4.A` and `GA4.B` kept in memory (data persists until page reload)

---

## Data Storage

Reuses existing `insiderank_ga4` Supabase table and `pushGa4ToSupabase()` / `pullGa4FromSupabase()` functions unchanged. The only difference: `filename` field in the stored payload will read `'GA4 Live API'` instead of an uploaded filename.

---

## What Does NOT Change

- `renderPerfView()` — reads `GA4.A` / `GA4.B` / `GA4.PS` / `GA4.PSA` exactly as before
- `GA4` object structure — same `{rows, dateRange, hasViews, hasBounce}` shape
- `pushGa4ToSupabase()` / `pullGa4FromSupabase()` — unchanged
- `parseGA4()` — unchanged (CSV fallback still works)
- All existing CSV upload handlers — unchanged

---

## Out of Scope

- GA4 real-time API (last 30 min active users) — different endpoint, limited metrics, not useful for SEO analysis
- GA4 event-level data — not needed for Page Performance
- GA4 property auto-discovery — user enters Property ID manually (simpler, no extra API call needed for account list)
- Automatic re-pull on period change — user clicks "Pull GA4 data" manually
