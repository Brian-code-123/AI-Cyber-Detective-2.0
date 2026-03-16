# NeoTrace

NeoTrace is a cybersecurity intelligence and learning platform built with Node.js, Express, and vanilla JavaScript.

This version includes a competition-ready intelligence dashboard with:
- Multi-source news fusion (official feeds, RSS, social snapshot, GDELT snapshot)
- Event normalization into GeoJSON
- Interactive threat map (marker layer, marker clustering, heatmap, density layer)
- Timeline filtering and playback
- Confidence scoring and credibility badges
- Data quality and provenance tracking
- CSV / GeoJSON export

## Table of Contents

1. Overview
2. Core Features
3. Architecture
4. Data Model
5. API Endpoints
6. Local Development
7. Deployment Notes
8. Competition Demo Flow
9. Limitations and Next Improvements

## 1. Overview

NeoTrace combines cybersecurity tooling, educational pages, and an intelligence dashboard focused on clear threat visualization and source-aware reporting.

The dashboard integrates:
- Threat events on a world map
- Source-attributed cybersecurity news
- Confidence and corroboration signals
- Exportable and filterable data views

## 2. Core Features

### 2.1 Map Intelligence

- Zoom and pan with keyboard support
- Layer toggles:
  - Raw markers
  - Marker clustering
  - Heatmap
  - Density layer
- Filters:
  - Time window (6h / 24h / 72h / 7d / 30d)
  - Category
  - Minimum confidence
- Event detail side panel:
  - Source
  - Timestamp
  - Confidence
  - Category
  - Provenance parser and source URL
- Timeline playback slider for time-series narrative
- Export options:
  - GeoJSON
  - CSV

### 2.2 News Intelligence

- Multi-source ingestion pipeline
- Unified article cards with:
  - Source type label (official / rss / social / gdelt)
  - Confidence badge
  - Corroboration count
  - Short summary
- Source filter chips and sorting controls
- News-to-map linking: click “Show on map” to focus the geographic context

### 2.3 Data Quality and Traceability

- Event normalization with required fields validation
- ETL checks for:
  - Missing required fields
  - Invalid coordinates
  - Timestamp normalization
  - Duplicate-rate measurement
- Per-record provenance metadata:
  - Source URL
  - Fetch timestamp
  - Parser method
- Data quality metrics generated in API metadata

## 3. Architecture

### Frontend

- `public/index.html`
  - Dashboard layout (news, map, charts, controls)
- `public/js/dashboard.js`
  - Chart rendering
  - News loading and filtering
  - Map rendering and layer management
  - Playback control
  - Event stream heartbeat handling
- `public/css/style.css`
  - Dashboard UI styles for map/news/data panels

### Backend

- `server.js`
  - News fusion and enrichment pipeline
  - Event normalization pipeline
  - Confidence score generation
  - Export and stream endpoints

## 4. Data Model

### 4.1 Standard Event Schema

Each event is normalized to:
- `id`
- `lat`
- `lng`
- `timestamp` (ISO-8601)
- `source`
- `confidence` (0-100)
- `category`
- `title`
- `severity`
- `provenance`
  - `sourceUrl`
  - `fetchedAt`
  - `parser`

### 4.2 News Enrichment Fields

News records include:
- `sourceType`
- `clusterId`
- `corroborationCount`
- `confidence`
- `confidenceBadge`
- `entities` (locations / organizations / persons)
- optional geo linkage (`lat`, `lng`, `location`)

## 5. API Endpoints

### News

- `GET /api/news?includeMeta=1&limit=36`
  - Returns fused news data
  - `includeMeta=1` returns `{ items, meta }`
- `GET /api/news/metrics`
  - Returns source distribution and confidence summary

### Events

- `GET /api/events`
  - Default returns GeoJSON FeatureCollection
- `GET /api/events?format=json`
  - Returns normalized JSON events with metadata
- `GET /api/events?format=csv`
  - Returns CSV export
- `GET /api/events/export?format=geojson|csv`
  - Download-ready export endpoint
- `GET /api/events/stream`
  - Server-Sent Events stream for live heartbeat snapshots

### Existing Platform APIs

NeoTrace also includes existing APIs such as:
- `/api/analyze-url`
- `/api/analyze-image`
- `/api/verify-text`
- `/api/phone/check`
- `/api/stats`
- `/api/chatbot`
- `/api/leaderboard`

## 6. Local Development

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

### Optional environment variables

Create `.env` in project root:

```bash
ASI_API_KEY=your_api_key_here
ASI_MODEL=asi1-mini
NUMVERIFY_KEY=your_numverify_key_here
```

If `ASI_API_KEY` is not set, the dashboard still works with deterministic fallback logic.

## 7. Deployment Notes

- The project is designed to run on Vercel and standard Node hosting.
- In production on Vercel, environment variables should be configured in project settings.
- SSE endpoint (`/api/events/stream`) is used for lightweight live status updates.

## 8. Competition Demo Flow

Recommended 3-minute presentation sequence:

1. Show source fusion in the News panel (official + rss + social + gdelt)
2. Open a news item and jump to map context
3. Toggle map layers (cluster, heatmap, density)
4. Apply filters (category, confidence, time)
5. Run timeline playback
6. Export GeoJSON and CSV
7. Highlight provenance and quality metrics from API metadata

## 9. Limitations and Next Improvements

Current implementation is production-ready for demos and competition judging, with room for extension:

- Add real-time websocket or Kafka ingestion adapter
- Replace snapshots with direct GDELT query ingestion
- Add full NER model and geocoding service for higher location precision
- Add PostGIS or Elasticsearch persistence for large-scale querying
- Add full benchmark dashboard (precision/recall/FPR/query latency trend)

---

Built for practical cybersecurity education and intelligence storytelling.
