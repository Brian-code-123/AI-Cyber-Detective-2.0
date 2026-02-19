#  NeoTrace

<div align="center">

<img src="public/images/logo.jpeg" alt="NeoTrace Logo" width="120" style="border-radius:20px; margin-bottom:12px;" />

![Version](https://img.shields.io/badge/version-4.0.0-0A84FF?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-64D2FF?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-FF453A?style=for-the-badge)
![React](https://img.shields.io/badge/react-18.3.1-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/vite-6-646CFF?style=for-the-badge&logo=vite)
![Status](https://img.shields.io/badge/status-active-30D158?style=for-the-badge)
![Vercel](https://img.shields.io/badge/deployed-Vercel-black?style=for-the-badge&logo=vercel)

**Cybersecurity Intelligence & Education Platform — v4.0 (React + AI Agent)**

🌐 **Live Demo**: [ai-cyber-detective-2-0.vercel.app](https://ai-cyber-detective-2-0.vercel.app)

[English](#english) | [中文](#中文)

</div>

---

## <a name="english"></a> English

### Overview

NeoTrace is a cybersecurity intelligence and education platform combining interactive learning with real-world threat detection tools. v4.0 introduces a full **React 18 + Vite 6** frontend with **20+ reusable components**, three React Contexts for global state, an upgraded **ASI-1 AI Agent** capable of answering any cybersecurity question, and **Jest unit tests** covering all key components.

### What's New in v4.0

| Change | Details |
|--------|---------|
| **⚛️ React 18 Frontend** | Full migration from HTML/JS to React + Vite with lazy-loaded routes |
| **🤖 AI Agent Upgrade** | ChatGPT/ASI-1 now answers ANY cybersecurity question with multi-turn conversation context |
| **🧩 20+ Components** | KPICard, RiskBar, StrengthBar, AuthBadge, FlagList, Chatbot, Navbar, UploadArea, and more |
| **🗂 React Contexts** | ThemeContext (dark/light), I18nContext (EN/ZH), ChatbotContext (chat state + retries) |
| **🔐 4 New Tools** | Password Checker, Email Analyzer, Wi-Fi Scanner, QR Code Scanner |
| **🧪 Jest Tests** | 12 test files — UI components, contexts, i18n, chatbot offline fallback |
| **⚡ Retry Logic** | Chatbot: 2 retries with exponential backoff, graceful offline fallback |

### Key Features

| Feature | Description |
|---------|-------------|
| **🌍 Global Threat Dashboard** | Interactive heatmap (28 countries), top 10 scam chart, yearly trend line |
| **📱 Phone Inspector** | Phone number intelligence — fraud score, carrier, line type (VOIP/Mobile/Landline), KPI cards, risk radar chart |
| **🔗 URL Threat Scanner** | Domain reputation check, SSL evaluation, phishing pattern detection |
| **🖼️ Image Forensics** | AI generation detection, EXIF metadata analysis, compression artifact scanning |
| **📰 Content Verifier** | Credibility scoring, clickbait detection, sentiment analysis, fact-check flagging |
| **🔑 Password Checker** | Local entropy/crack-time calculation, strength bar, criteria grid, secure generator |
| **📧 Email Analyzer** | SPF/DKIM/DMARC authentication badges, flag analysis, header inspection |
| **📶 Wi-Fi Scanner** | Security protocol analysis (WEP/WPA/WPA2/WPA3), frequency, vendor lookup |
| **📷 QR Code Scanner** | Upload QR image, decode URL, risk analysis via ASI-1 |
| **📖 Story-Based Learning** | 4 interactive chapters following Alex through realistic scam scenarios |
| **🎮 Gamified Training** | 5 difficulty tiers (11+ scenarios), local leaderboard with streak multipliers |
| **💬 NeoTrace AI Chatbot** | Full cybersecurity expert — threat intelligence, certifications, CVEs, careers, how-to guides |

### Architecture

```
AI-Cyber-Detective-2.0/
├── server.js              # Express backend (Node.js, port 3000)
├── src/                   # React frontend (Vite)
│   ├── main.jsx           # App entry point
│   ├── App.jsx            # Router (11 lazy-loaded routes)
│   ├── index.css          # Design tokens (dark/light themes)
│   ├── contexts/
│   │   ├── ThemeContext.jsx    # Dark/light + localStorage
│   │   ├── I18nContext.jsx     # EN/ZH translations (60+ keys)
│   │   └── ChatbotContext.jsx  # Chat state, retries, offline fallback
│   ├── hooks/
│   │   └── useApi.js          # Generic fetch hook (JSON + FormData)
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, MatrixBackground, PageWrapper
│   │   └── ui/                # 20 reusable components
│   ├── pages/                 # 11 page components (Dashboard → GameMode)
│   └── __tests__/             # 12 Jest test files
├── public/                # Legacy static HTML (still served)
├── vite.config.mjs        # Vite config (proxy /api → :3000)
├── jest.config.js         # Jest (jsdom, babel-jest, CSS modules mock)
└── babel.config.js        # Babel (@babel/preset-env + react)
```

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/LouisLouis19/AI-Cyber-Detective-2.0.git
cd AI-Cyber-Detective-2.0

# 2. Install dependencies
npm install

# 3. Set environment variable
echo "ASI_API_KEY=your_key_here" > .env

# 4. Run both servers concurrently (Express :3000 + Vite :5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) for the React app, or [http://localhost:3000](http://localhost:3000) for the legacy HTML.

### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `concurrently "node server.js" "vite"` | Run both servers |
| `npm run dev:server` | `node server.js` | Express backend only |
| `npm run dev:client` | `vite` | Vite frontend only |
| `npm run build` | `vite build` | Production build → `dist/` |
| `npm run preview` | `vite preview` | Preview production build |
| `npm test` | `jest` | Run all tests |
| `npm run test:watch` | `jest --watch` | Watch mode |

### Production Build

```bash
npm run build         # builds React to dist/
NODE_ENV=production node server.js  # serves dist/ + /api routes
```

### Testing

```bash
npm test              # Run all 12 test suites
npm run test:watch    # Watch mode for TDD
```

Test coverage includes:
- **UI Components**: KPICard, RiskBar, NeonButton, StrengthBar, CriteriaCheck, FlagItem, HeroBadge, AuthBadge, DetailTable
- **Contexts**: ThemeContext (toggle + localStorage), I18nContext (t() function + language switching), ChatbotContext (sendMessage, clearHistory, offline fallback)

### AI Chatbot Capabilities

The NeoTrace AI (powered by ASI-1) now handles:
- **Any cybersecurity question** — not just platform-related topics
- **Multi-turn conversation** — remembers the last 12 messages for context
- **Expert domains**: Threat intelligence, malware, phishing, network security, cloud security, certifications (OSCP, CEH, CISSP), careers, CVEs, legal/compliance, privacy, practical how-to guides
- **Retry logic**: 2 automatic retries with exponential backoff. Falls back to an offline curated answer if all retries fail.

---

## <a name="中文"></a> 中文

### 概述

NeoTrace 是一個網絡安全情報與教育平台，v4.0 全面升級為 **React 18 + Vite 6** 架構，配備 **20+ 可複用組件**、三個 React Context 全局狀態管理、升級版 **ASI-1 AI Agent**（可回答任何網絡安全問題）、以及 **Jest 單元測試**。

### v4.0 新特性

| 功能 | 詳情 |
|------|------|
| **⚛️ React 18 前端** | 全面從 HTML/JS 遷移至 React + Vite，支持懶加載路由 |
| **🤖 AI Agent 升級** | ASI-1 現可回答任何網絡安全問題，支持多輪對話上下文 |
| **🧩 20+ 組件** | KPICard、RiskBar、StrengthBar、AuthBadge、FlagList、Chatbot 等 |
| **🗂 React Contexts** | ThemeContext（深色/淺色）、I18nContext（中英文）、ChatbotContext |
| **🔐 4 個新工具** | 密碼檢測器、電郵分析器、Wi-Fi 掃描器、QR 碼掃描器 |
| **🧪 Jest 測試** | 12 個測試文件，覆蓋 UI 組件、Contexts、聊天機器人離線回退 |

### 安裝與運行

```bash
git clone https://github.com/LouisLouis19/AI-Cyber-Detective-2.0.git
cd AI-Cyber-Detective-2.0
npm install
echo "ASI_API_KEY=你的密鑰" > .env
npm run dev           # 同時啟動 Express :3000 和 Vite :5173
```

---

## License

MIT © 2025 NeoTrace. Built with ASI-1 AI.

| **📝 Content Verifier** | Sentiment analysis, clickbait detection, credibility scoring |
| **🌐 Bilingual** | Full EN / 中文 (Traditional Chinese) support throughout |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js ≥18 |
| **Backend** | Express.js 4.21+ |
| **Frontend** | Vanilla JS ES6+, Bootstrap 5.3, Chart.js 4.4 (UMD), Leaflet 1.9 |
| **Design** | Apple-style monochrome, frosted glass (`backdrop-filter`), Inter font |
| **NLP** | `sentiment` (English), pattern-based analysis |
| **Image** | `exifr` (EXIF parsing), compression heuristics |
| **DNS** | `dns2` for domain resolution |
| **News** | RSS feed scraping (The Hacker News) with 15-min cache |
| **i18n** | Custom EN/ZH translation system (~800 keys) |
| **Deploy** | Vercel (serverless Node.js via `@vercel/node`) |

### Quick Start

```bash
git clone https://github.com/Brian-code-123/NeoTrace.git
cd NeoTrace
npm install
npm start
# Open http://localhost:3000
```

### Project Structure

```
NeoTrace/
├── server.js                    # Express backend + all API endpoints
├── package.json
├── vercel.json                  # Vercel deployment config
├── public/
│   ├── index.html               # Dashboard (heatmap, charts, news, calendar, tools)
│   ├── phone-inspector.html     # Phone number intelligence tool
│   ├── story.html               # Story-based learning (4 chapters)
│   ├── game.html                # Gamified training game
│   ├── image-forensics.html     # Image forensics tool
│   ├── url-threat-scanner.html  # URL analysis tool
│   ├── content-verifier.html    # Text verification tool
│   ├── css/
│   │   └── style.css            # Apple-style design system (760+ lines)
│   └── js/
│       ├── dashboard.js         # 3 charts (heatmap, bar, line) + news loading
│       ├── main.js              # Nav, counters, calendar, scroll reveal
│       ├── i18n.js              # EN/ZH translations (~800 keys)
│       ├── phone-inspector.js   # Phone scanning: KPI cards + radar chart
│       ├── story.js             # Story mode logic
│       ├── game.js              # Training game engine
│       ├── image-inspector.js   # Image analysis frontend
│       ├── url-analyzer.js      # URL threat scanning frontend
│       └── text-verifier.js     # Content verification frontend
└── README.md
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/news` | Latest cybersecurity news (15-min cache) |
| `GET` | `/api/leaderboard` | Top 50 training game players |
| `POST` | `/api/leaderboard` | Submit score `{ name, score, rank, badge }` |
| `POST` | `/api/analyze-url` | URL security analysis `{ url }` |
| `POST` | `/api/analyze-image` | Image authenticity analysis (multipart) |
| `POST` | `/api/verify-text` | Text credibility scoring `{ text }` |
| `POST` | `/api/phone/check` | Phone intelligence `{ phone }` — returns fraud_score, carrier, line_type, country, blacklist_hits, risk radar data |

### Phone Inspector Demo Numbers

| Number | Result |
|--------|--------|
| `+852 9123 4567` | HKT Mobile — Low risk (score: 12) |
| `+852 5300 1234` | VOIP scammer — High risk (score: 88, 7 blacklist hits) |
| `+852 6123 4567` | China Mobile HK — Medium risk (score: 45) |
| `+852 3123 4567` | HKBN VOIP — Suspicious (score: 62) |
| `+1 555 123 4567` | AT&T Mobile US — Low risk |
| `+44 7911 123456` | O2 Mobile UK — Clean |
| `+86 139 1234 5678` | China Unicom — High risk (score: 82) |
| Any other number | Dynamic generation based on country dial code |

### Design System

- **Colors**: Monochrome `#000 → #1a1a1a`, accent `#0A84FF` (Apple Blue)
- **Glass**: `backdrop-filter: saturate(180%) blur(20px)`, `rgba(255,255,255,0.03)` background
- **Typography**: `-apple-system, SF Pro Display, Inter`
- **Spacing**: 90% whitespace, subtle animations
- **Cards**: `border-radius: 16px`, glass borders `rgba(255,255,255,0.08)`
- **Status colors**: `#30D158` green, `#FF453A` red, `#FF9F0A` orange, `#BF5AF2` purple

### Deployment (Vercel)

The project uses `vercel.json` to route all API requests to the Express server and static files from `public/`:

```json
{
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [
    { "src": "/api/(.*)", "dest": "server.js" },
    { "src": "/(.*\\.(html|css|js|png|jpg|svg|ico|woff|woff2))", "dest": "/public/$1" },
    { "src": "/(.*)", "dest": "server.js" }
  ]
}
```

---

## <a name="中文"></a> 中文

### 概述

NeoTrace 是一個網絡安全情報與教育平台，結合互動學習和真實威脅檢測工具。採用 Apple 風格極簡設計，支持中英雙語，提供實時網絡安全新聞和一整套數字取證分析工具，包括全新的電話號碼情報分析功能。

### 主要功能

| 功能 | 說明 |
|------|------|
| **🌍 全球威脅儀表板** | 28 個國家互動式熱力圖、十大騙案圖表、年度趨勢線 |
| **📱 電話查驗器** | 電話號碼情報分析 — 欺詐評分、電信商識別、線路類型（VOIP/移動/固話）、KPI 卡片、風險雷達圖 |
| **📰 網絡安全新聞** | 10 篇最新文章，自動摘要，15 分鐘緩存 |
| **📅 日曆組件** | 追蹤網絡安全事件的日曆 |
| **📖 故事式學習** | 跟隨 Alex 偵探的 4 個互動章節，學習識破真實騙局 |
| **🎮 遊戲化訓練** | 5 個難度等級，15+ 場景，全球排行榜，連勝倍數 |
| **🖼️ 圖像鑑證** | AI 生成圖像檢測、EXIF 元數據分析 |
| **🔗 網址掃描** | 域名信譽檢查、SSL 評估、釣魚模式檢測 |
| **📝 內容驗證** | 情感分析、標題黨檢測、可信度評分 |
| **🌐 中英雙語** | 全站支持繁體中文與英文即時切換 |

### 快速開始

```bash
git clone https://github.com/Brian-code-123/NeoTrace.git
cd NeoTrace
npm install
npm start
# 打開 http://localhost:3000
```

### 電話查驗器示例號碼

| 號碼 | 結果 |
|------|------|
| `+852 9123 4567` | HKT 移動 — 低風險（評分：12）|
| `+852 5300 1234` | VOIP — 高風險詐騙（評分：88，已列入黑名單 7 次）|
| `+852 6123 4567` | 中國移動香港 — 中等風險（評分：45）|
| `+852 3123 4567` | 香港寬頻 VOIP — 可疑（評分：62）|
| `+1 555 xxx xxxx` | AT&T 美國 — 低風險 |
| `+86 139 xxxx xxxx` | 中國聯通 — 高風險（評分：82）|
| 其他號碼 | 根據國際區號動態生成結果 |

### API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/api/news` | 最新網絡安全新聞（15 分鐘緩存）|
| `GET` | `/api/leaderboard` | 前 50 名玩家排行榜 |
| `POST` | `/api/leaderboard` | 提交分數 |
| `POST` | `/api/analyze-url` | URL 安全分析 |
| `POST` | `/api/analyze-image` | 圖像真實性分析 |
| `POST` | `/api/verify-text` | 文字可信度評分 |
| `POST` | `/api/phone/check` | 電話號碼情報分析 |

---

## License

MIT License © 2026 NeoTrace Team
