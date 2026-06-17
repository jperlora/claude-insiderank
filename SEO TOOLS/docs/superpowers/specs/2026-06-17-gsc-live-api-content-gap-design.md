# Design: GSC Live API + Content Gap — Inside Rank

**Date:** 2026-06-17  
**Tool:** Inside Rank (`index.html`) deployed at https://insiderank.netlify.app  
**Status:** Approved for implementation

---

## Overview

Add two features to the existing Inside Rank tool:

1. **Live GSC API pull** — connect directly to Google Search Console via OAuth 2.0 instead of uploading CSV exports manually. Pulled data is saved as a snapshot in the existing format so all current views (Keywords, Pages, SERP Tracker, etc.) work without changes.

2. **Content Gap view** — show queries getting impressions in GSC that have no associated landing page URL in the data, meaning no dedicated content exists for those queries yet.

---

## Architecture

Single HTML file, no backend. All API calls are made from the browser using a short-lived OAuth access token. No new dependencies beyond the Google Identity Services (GIS) library added via CDN.

---

## Google Cloud Setup (one-time, user-managed)

User must complete this before using the feature:

1. Create a Google Cloud project at console.cloud.google.com
2. Enable the **Google Search Console API**
3. Configure OAuth consent screen (External, Testing mode, add team emails as test users)
4. Create an OAuth 2.0 Client ID (Web application type)
5. Add `https://insiderank.netlify.app` and `http://localhost` as Authorized JavaScript origins
6. Copy the Client ID (format: `xxxxx.apps.googleusercontent.com`)
7. Paste into Inside Rank → Settings → GSC API card

Step-by-step instructions are embedded in the tool's Help tab and shown as an onboarding panel the first time the user opens the GSC Live view without a Client ID configured.

---

## Settings Tab Changes

Add a new card: **"Google Search Console API"**

- Text input: **OAuth Client ID** — saved to `localStorage` key `gsc_client_id`
- Save button
- Status indicator: shows "Not connected" / "Connected as [email]" once authorized
- Link to setup instructions (scrolls to Help section)

---

## New Navigation Item: GSC Live

Added to the sidebar between existing nav items. Shows a green dot badge when connected.

### GSC Live View — States

**State 1: No Client ID**
- Onboarding panel with numbered setup instructions
- "I have my Client ID → go to Settings" button

**State 2: Client ID set, not yet authorized**
- "Connect Google Search Console" button (triggers GIS OAuth popup)
- Brief explanation of what permission is being requested (read-only access to Search Console data)

**State 3: Authorized**
- Property selector dropdown (lists all GSC properties the user has access to)
- Date range picker: Last 28 days / Last 3 months / Last 6 months / Custom
- "Pull data" button
- Pull history: list of previously pulled snapshots with label, date range, row count

### Pull Flow

On "Pull data" click:
1. Show progress indicator
2. Call GSC Search Analytics API — Request 1: `dimensions: ["query", "page"]`, up to 25,000 rows
3. Call GSC Search Analytics API — Request 2: `dimensions: ["query"]`, up to 25,000 rows
4. Merge into a snapshot object matching the existing CSV-import format
5. Save snapshot to `localStorage` with label `GSC Live — [date range]`
6. Show success toast: "Snapshot saved — [N] queries pulled"
7. Snapshot is immediately available in the Period A / Period B picker in the top bar

### API Request Details

Endpoint: `POST https://searchconsole.googleapis.com/webmasters/v3/sites/{encodedSiteUrl}/searchAnalytics/query`

Headers: `Authorization: Bearer {accessToken}`

Request 1 body:
```json
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "dimensions": ["query", "page"],
  "rowLimit": 25000,
  "startRow": 0
}
```

Request 2 body:
```json
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "dimensions": ["query"],
  "rowLimit": 25000,
  "startRow": 0
}
```

Metrics returned per row: `clicks`, `impressions`, `ctr`, `position`

### Token Handling

- Use Google Identity Services (GIS) `google.accounts.oauth2.initTokenClient`
- Scope: `https://www.googleapis.com/auth/webmasters.readonly`
- Token stored in memory only (`let gscAccessToken = null`) — never written to localStorage or Supabase
- Token TTL: 1 hour. On expiry, re-authorization is triggered silently if the browser session is active; otherwise a new popup appears
- On sign-out (Settings), token is cleared from memory

---

## Content Gap View

A tab within the GSC Live view (appears after first successful pull).

### Content Gap Detection Logic

A query is flagged as a content gap when:
- It appears in Request 2 (queries-only) **AND**
- It has **no matching entry** in Request 1 (query+page), meaning GSC has no landing page associated with it

Additionally, queries from Request 1 where `page` equals the root domain (`/` or bare domain) are also included — these indicate the homepage is ranking for a query that should have a dedicated page.

### Content Gap Table

Columns:
| Column | Description |
|---|---|
| Query | The search query |
| Impressions | Total impressions in the period |
| Avg Position | Average ranking position |
| Clicks | Total clicks |
| CTR | Click-through rate |
| Opportunity | Color-coded score: High (pos ≤ 20, impr ≥ 100) / Medium / Low |

### Filters

- **Min impressions** — number input, default 10 (hides noise)
- **Position range** — e.g. 1–10, 11–20, 21–50, 51–100
- **Search** — text filter on query
- **Opportunity** — filter by High / Medium / Low

### Sorting

Sortable by any column. Default sort: Impressions descending.

### Export

"Export CSV" button — exports all visible rows (respects active filters).

### Empty State

If no content gaps are found: "No content gaps detected — every query in this period has an associated landing page."

---

## Help Tab Additions

New section: **"GSC Live — setup & FAQ"**

Covers:
- Full Google Cloud setup walkthrough (same steps as provided to user)
- FAQ: token expiry, what "25,000 row limit" means, how to add team members as test users, what to do if the OAuth popup is blocked

---

## What Does NOT Change

- Existing CSV/ZIP import flow — unchanged, still fully functional
- All existing views (Keywords, Pages, SERP Tracker, Page Performance, URL Tracker) — unchanged
- Supabase team sync — GSC Live snapshots can optionally be synced via the existing sync mechanism (no new code needed — they use the same snapshot format)

---

## Out of Scope

- Automatic scheduled pulls (no backend)
- Writing data back to GSC
- Google Analytics / GA4 live pull (separate feature)
- Pagination beyond 25,000 rows (covers the vast majority of sites)
