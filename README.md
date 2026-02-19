# ◉ NeoTrace

<div align="center">

![Version](https://img.shields.io/badge/version-3.0.0-0A84FF?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-64D2FF?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-FF453A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-30D158?style=for-the-badge)

**Cybersecurity Intelligence & Education Platform**

[English](#english) | [中文](#中文)

</div>

---

## <a name="english"></a> English

### Overview

NeoTrace is a cybersecurity intelligence and education platform combining interactive learning with real-world threat detection tools. It features an Apple-inspired minimalist design with frosted glass UI, bilingual support (EN/中文), live cybersecurity news, and a suite of forensic analysis tools.

### Key Features

| Feature | Description |
|---------|-------------|
| **Global Threat Dashboard** | Interactive heatmap, top 10 scam chart, yearly trend line across 195 countries |
| **Cybersecurity News Feed** | 10 latest articles scraped from The Hacker News RSS with auto-summaries |
| **Calendar Widget** | Home page calendar for tracking cybersecurity events |
| **Story-Based Learning** | 4 interactive chapters following Alex through realistic scam scenarios |
| **Gamified Training** | 5 difficulty tiers, 15+ scenarios, global leaderboard with streak multipliers |
| **Image Forensics** | AI generation detection, EXIF metadata analysis, compression artifact scanning |
| **URL Threat Scanner** | Domain reputation check, SSL evaluation, phishing pattern detection |
| **Content Verifier** | Sentiment analysis, clickbait detection, credibility scoring |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js ≥18 |
| **Backend** | Express.js 4.21+ |
| **Frontend** | Vanilla JS ES6+, Bootstrap 5.3, Chart.js 4.4, Leaflet 1.9 |
| **Design** | Apple-style monochrome, frosted glass (backdrop-filter), SF Pro / Inter |
| **NLP** | sentiment (English), pattern-based analysis |
| **Image** | exifr (EXIF parsing), compression heuristics |
| **DNS** | dns2 for domain resolution |
| **News** | RSS feed scraping (The Hacker News) with 15-min cache |
| **i18n** | Custom EN/ZH translation system |

### Quick Start

```bash
git clone https://github.com/yourusername/NeoTrace.git
cd NeoTrace
npm install
npm start
# Open http://localhost:3000
```

### Project Structure

```
NeoTrace/
├── server.js                 # Express backend + News API
├── package.json
├── public/
│   ├── index.html            # Dashboard (heatmap, charts, news, calendar)
│   ├── story.html            # Story-based learning
│   ├── game.html             # Gamified training
│   ├── image-forensics.html  # Image forensics tool
│   ├── url-threat-scanner.html # URL analysis tool
│   ├── content-verifier.html # Text verification tool
│   ├── css/
│   │   └── style.css         # Apple-style design system
│   └── js/
│       ├── dashboard.js      # Charts + news loading
│       ├── main.js           # Nav, counters, calendar, scroll reveal
│       ├── i18n.js           # EN/ZH translations
│       ├── story.js          # Story mode logic
│       ├── game.js           # Training game engine
│       ├── image-inspector.js # Image analysis
│       ├── url-analyzer.js   # URL threat scanning
│       └── text-verifier.js  # Content verification
└── README.md
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/news` | Returns 10 latest cybersecurity news items (15-min cache) |
| `GET` | `/api/leaderboard` | Returns top 50 players |
| `POST` | `/api/leaderboard` | Submit score `{ name, score, rank, badge }` |
| `POST` | `/api/analyze-url` | Analyze URL security `{ url }` |
| `POST` | `/api/analyze-image` | Analyze uploaded image (multipart) |
| `POST` | `/api/verify-text` | Verify text credibility `{ text }` |

### Design System

- **Colors**: Monochrome `#000 → #1a1a1a`, accent `#0A84FF`
- **Glass**: `backdrop-filter: saturate(180%) blur(20px)`, `rgba(255,255,255,0.03)` background
- **Typography**: `-apple-system, SF Pro Display, Inter`
- **Spacing**: 90% whitespace, subtle animations
- **Cards**: `border-radius: 16px`, glass borders `rgba(255,255,255,0.08)`

---

## <a name="中文"></a> 中文

### 概述

NeoTrace 是一個網絡安全情報與教育平台，結合互動學習和真實威脅檢測工具。採用 Apple 風格極簡設計，支持中英雙語，提供實時網絡安全新聞和一整套數字取證分析工具。

### 主要功能

- **全球威脅儀表板** — 互動式熱力圖、十大騙案圖表、年度趨勢線
- **網絡安全新聞** — 10 篇最新文章，自動摘要
- **日曆組件** — 追蹤網絡安全事件
- **故事式學習** — 4 個互動章節
- **遊戲化訓練** — 5 個難度等級，15+ 場景，全球排行榜
- **圖像鑑證** — AI 生成檢測、EXIF 分析
- **網址掃描** — 域名信譽檢查、釣魚模式檢測
- **內容驗證** — 情感分析、可信度評分

### 快速開始

```bash
git clone https://github.com/yourusername/NeoTrace.git
cd NeoTrace
npm install
npm start
# 打開 http://localhost:3000
```

---

## License

MIT License © 2026 NeoTrace Team
