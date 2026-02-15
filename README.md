# 🔍 AI Cyber Detective 2.0

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-00ff41?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00d4ff?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-ff0055?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-00ff41?style=for-the-badge)

**Your Intelligent Companion for Cybersecurity Education, Threat Detection, and Digital Forensics**

[English](#english) | [中文](#中文)

</div>

---

## <a name="english"></a>📋 English Documentation

### 🎯 Overview

AI Cyber Detective 2.0 is a comprehensive cybersecurity education and analysis platform that combines interactive learning with real-world threat detection tools. It features a visually stunning cybersecurity-themed interface with bilingual support (English/中文).

### ✨ Key Features

#### 📊 **Global Threat Intelligence Dashboard**
- **Real-time Analytics**: Visualize cyber threat data across 195 countries
- **Interactive Heatmap**: Leaflet-powered world map showing fraud risk levels by country
- **Multi-year Trends**: Track cyber crime evolution from 2018-2026
- **Top Scam Rankings**: Analyze the 10 most prevalent cyber fraud types globally
- **Threat Sophistication Radar**: Compare attack complexity across 3 years (2024-2026)

#### 🎓 **Story-Based Learning Mode**
- **4 Interactive Chapters**: Follow Alex the Cyber Detective through realistic scenarios
- **Real Message Examples**: Learn to identify phishing, scams, and social engineering
- **Cyber Detective Code**: 5 essential rules for digital safety
- **Progressive Difficulty**: From basic awareness to advanced threat recognition

#### 🎮 **Gamified Training System**
- **5 Difficulty Tiers**: Easy → Medium → Hard → Expert → Ultimate
- **15+ Scenarios**: Covering phishing, deepfakes, BEC, crypto scams, and more
- **Ranking System**: Earn badges from 🥉 Trainee to 👑 Elite Detective
- **Global Leaderboard**: Compete with players worldwide
- **Streak Multipliers**: Bonus points for consecutive correct answers

#### 🖼️ **AI Image Forensics Tool**
- **AI Generation Detection**: Identify AI-generated or manipulated images
- **EXIF Metadata Analysis**: Extract camera, GPS, and software information
- **Compression Forensics**: Detect re-compression artifacts
- **Pixel Uniformity Analysis**: Identify digital creation patterns
- **File Signature Verification**: Validate image authenticity

#### 🔗 **URL Threat Scanner Tool**
- **Phishing Detection**: Identify suspicious URLs and domain impersonation
- **SSL/HTTPS Verification**: Check encryption status
- **TLD Risk Assessment**: Flag dangerous top-level domains
- **DNS Lookup**: Verify domain resolution and IP addresses
- **Homograph Attack Detection**: Identify Unicode domain tricks
- **Risk Scoring**: 0-100 threat assessment with detailed findings

#### 📝 **Content Verifier Tool**
- **Sentiment Analysis**: Powered by NLP sentiment library
- **Misinformation Detection**: Identify clickbait and conspiracy patterns
- **Credibility Scoring**: Assess source citations and statistical claims
- **Emotional Manipulation Detection**: Flag excessive caps, exclamations, urgency tactics
- **Content Analysis**: Word count, sentence structure, URL detection

### 🛠️ Technology Stack

#### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **File Upload**: Multer (multipart/form-data)
- **EXIF Parsing**: exifr
- **Sentiment Analysis**: sentiment
- **DNS Resolution**: dns2

#### Frontend
- **Core**: Vanilla JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3.0 (responsive design)
- **Styling**: Custom CSS3 with cybersecurity theme + Bootstrap integration
- **Charts**: Chart.js v4.4.0
- **Maps**: Leaflet.js v1.9.4
- **Fonts**: Google Fonts (Orbitron, Rajdhani, Share Tech Mono)

#### Design System
- **Framework**: Bootstrap 5.3.0 with custom CSS overrides
- **Responsive Design**: Mobile-first approach (single column on mobile, multi-column on desktop)
- **Theme**: Dark mode with neon accents
- **Colors**: 
  - Primary Green: `#00ff41`
  - Accent Cyan: `#00d4ff`
  - Alert Red: `#ff0055`
  - Warning Orange: `#ff8c00`
- **Effects**: Matrix rain animation, glassmorphism, scanline overlay
- **Layout**: Bootstrap grid + custom CSS for responsive mobile support

### 📂 Project Structure

```
AI-Cyber-Detective-2.0/
├── server.js                 # Express backend with API endpoints
├── package.json              # Dependencies and scripts
├── .gitignore               # Git ignore rules
├── README.md                # This file
│
└── public/                  # Frontend static files
    ├── index.html           # Dashboard homepage
    ├── story.html           # Story mode page
    ├── game.html            # Training game page
    ├── image-forensics.html # AI Image Forensics tool
    ├── url-threat-scanner.html # URL Threat Scanner
    ├── content-verifier.html # Content Verifier tool
    │
    ├── css/
    │   └── style.css        # Complete stylesheet (~1300 lines)
    │
    └── js/
        ├── main.js          # Shared utilities (matrix rain, nav, animations)
        ├── i18n.js          # Bilingual translation system
        ├── dashboard.js     # Chart.js & Leaflet visualizations
        ├── story.js         # Story mode interactions
        ├── game.js          # Game logic & scenarios
        ├── image-inspector.js  # Image upload & results
        ├── url-analyzer.js     # URL analysis display
        └── text-verifier.js    # Text verification UI
```

### 🚀 Installation & Setup

#### Prerequisites
- Node.js v14.0.0 or higher
- npm v6.0.0 or higher

#### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AI-Cyber-Detective-2.0.git
   cd AI-Cyber-Detective-2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### 📡 API Endpoints

#### Leaderboard
- **GET** `/api/leaderboard` - Retrieve top 50 players
- **POST** `/api/leaderboard` - Submit new score
  ```json
  {
    "name": "CyberNinja",
    "score": 2850,
    "rank": "Elite Detective",
    "badge": "👑"
  }
  ```

#### URL Threat Scanner
- **POST** `/api/analyze-url`
  ```json
  {
    "targetUrl": "https://example.com"
  }
  ```
  **Response**: Risk score (0-100), findings array, domain details

#### AI Image Forensics
- **POST** `/api/analyze-image`
  - Content-Type: `multipart/form-data`
  - Field: `image` (max 20MB)
  
  **Response**: AI detection score, EXIF data, compression findings, forensic analysis

#### Content Verifier
- **POST** `/api/verify-text`
  ```json
  {
    "text": "Sample text to analyze..."
  }
  ```
  **Response**: Credibility score, sentiment analysis, misinformation findings

### 🎨 Design Features

- **Matrix Rain Effect**: Dynamic canvas animation on background
- **Glassmorphism**: Translucent panels with backdrop blur
- **Scanline Overlay**: Retro CRT monitor effect
- **Neon Glow**: Pulsing accent elements
- **Smooth Animations**: CSS transitions and JavaScript scroll reveals
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 480px

### 🌍 Internationalization (i18n)

- **Supported Languages**: English, 中文 (Traditional Chinese)
- **Implementation**: Custom JS translation system using `data-i18n` attributes
- **Storage**: Language preference saved in `localStorage`
- **Toggle**: Live switching without page reload

### 📊 Data Visualization

#### Global Cyber Threat Data (2026)
- **Total Reports**: 1,280,000+
- **Countries Affected**: 195
- **Financial Loss**: $19.8 Billion USD
- **Users Protected**: 50,000+

#### Top 10 Global Scam Types
1. Phishing/Spoofing - 324K reports
2. Investment Fraud - 267K reports
3. Romance Scams - 215K reports
4. Tech Support Scams - 186K reports
5. Online Shopping Fraud - 158K reports
6. Identity Theft - 142K reports
7. Business Email Compromise - 125K reports
8. Cryptocurrency Fraud - 108K reports
9. Prize/Lottery Scams - 84K reports
10. Social Media Scams - 73K reports

### 🔒 Security Considerations

- **File Upload Limits**: 20MB max for image uploads
- **Request Body Limits**: 50MB max for JSON payloads
- **In-Memory Storage**: Leaderboard data stored in memory (use database in production)
- **CORS Enabled**: Configure restrictions for production deployment
- **Input Validation**: Basic validation on all API endpoints

### 🚧 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication & profiles
- [ ] Email report generation
- [ ] Machine learning model integration for image detection
- [ ] Real-time threat alerts
- [ ] API rate limiting
- [ ] Admin dashboard
- [ ] Export analysis reports (PDF/JSON)

### 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License. See `LICENSE` file for details.

### 👥 Authors

- **AI Cyber Detective Team** - *Initial work* - 2026-02-16

### 🙏 Acknowledgments

- Chart.js for beautiful data visualizations
- Leaflet.js for interactive maps
- exifr for EXIF metadata parsing
- sentiment library for NLP analysis
- Google Fonts for typography

---

## <a name="中文"></a>📋 中文文檔

### 🎯 概述

AI 網絡偵探 2.0 是一個綜合性的網絡安全教育和分析平台，將互動學習與實用的威脅檢測工具相結合。它採用視覺震撼的網絡安全主題界面，支持雙語（英文/中文）。

### ✨ 核心功能

#### 📊 **全球威脅情報儀表板**
- **實時分析**：可視化展示195個國家的網絡威脅數據
- **互動式熱力圖**：基於 Leaflet 的世界地圖，顯示各國詐騙風險等級
- **多年趨勢**：追蹤 2018-2026 年網絡犯罪演變
- **詐騙類型排名**：分析全球十大網絡詐騙類型
- **威脅複雜度雷達圖**：比較 3 年間（2024-2026）的攻擊複雜性

#### 🎓 **故事學習模式**
- **4個互動章節**：跟隨網絡偵探 Alex 經歷真實場景
- **真實案例**：學習識別釣魚、詐騙和社會工程學
- **網絡偵探守則**：5條數字安全基本規則
- **漸進難度**：從基礎認知到高級威脅識別

#### 🎮 **遊戲化訓練系統**
- **5個難度級別**：簡單 → 中等 → 困難 → 專家 → 終極
- **15+場景**：涵蓋釣魚、深偽、BEC、加密貨幣詐騙等
- **排名系統**：從 🥉 實習生晉升至 👑 精英偵探
- **全球排行榜**：與全球玩家競技
- **連擊獎勵**：連續答對獲得加分

#### 🖼️ **圖片檢測工具**
- **AI生成檢測**：識別 AI 生成或篡改的圖像
- **EXIF 元數據分析**：提取相機、GPS 和軟件信息
- **壓縮取證**：檢測重複壓縮痕跡
- **像素均勻度分析**：識別數字創建模式
- **文件簽名驗證**：驗證圖像真實性

#### 🔗 **網址分析工具**
- **釣魚檢測**：識別可疑網址和域名仿冒
- **SSL/HTTPS 驗證**：檢查加密狀態
- **TLD 風險評估**：標記危險的頂級域名
- **DNS 查詢**：驗證域名解析和 IP 地址
- **同形異義字攻擊檢測**：識別 Unicode 域名欺詐
- **風險評分**：0-100 威脅評估及詳細發現

#### 📝 **文本驗證工具**
- **情感分析**：基於 NLP 情感庫
- **假信息檢測**：識別標題黨和陰謀論模式
- **可信度評分**：評估來源引用和統計聲稱
- **情緒操縱檢測**：標記過度大寫、感嘆號、緊迫戰術
- **內容分析**：字數統計、句子結構、網址檢測

### 🛠️ 技術棧

#### 後端
- **運行時**：Node.js (v14+)
- **框架**：Express.js
- **文件上傳**：Multer
- **EXIF 解析**：exifr
- **情感分析**：sentiment
- **DNS 解析**：dns2

#### 前端
- **核心**：原生 JavaScript (ES6+)
- **樣式**：自定義 CSS3 網絡安全主題
- **圖表**：Chart.js v4.4.0
- **地圖**：Leaflet.js v1.9.4
- **字體**：Google Fonts (Orbitron, Rajdhani, Share Tech Mono)

### 🚀 安裝和設置

#### 環境要求
- Node.js v14.0.0 或更高版本
- npm v6.0.0 或更高版本

#### 快速開始

1. **克隆倉庫**
   ```bash
   git clone https://github.com/yourusername/AI-Cyber-Detective-2.0.git
   cd AI-Cyber-Detective-2.0
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動服務器**
   ```bash
   npm start
   ```

4. **在瀏覽器中打開**
   ```
   http://localhost:3000
   ```

### 📂 項目結構

```
AI-Cyber-Detective-2.0/
├── server.js                 # Express 後端及 API 端點
├── package.json              # 依賴項和腳本
├── .gitignore               # Git 忽略規則
├── README.md                # 本文件
│
└── public/                  # 前端靜態文件
    ├── index.html           # 儀表板主頁
    ├── story.html           # 故事模式頁面
    ├── game.html            # 訓練遊戲頁面
    ├── image-inspector.html # 圖像分析工具
    ├── url-analyzer.html    # 網址威脅分析器
    ├── text-verifier.html   # 文本可信度檢查器
    │
    ├── css/
    │   └── style.css        # 完整樣式表 (~1300 行)
    │
    └── js/
        ├── main.js          # 共享工具 (矩陣雨, 導航, 動畫)
        ├── i18n.js          # 雙語翻譯系統
        ├── dashboard.js     # Chart.js & Leaflet 可視化
        ├── story.js         # 故事模式交互
        ├── game.js          # 遊戲邏輯和場景
        ├── image-inspector.js  # 圖像上傳和結果
        ├── url-analyzer.js     # 網址分析顯示
        └── text-verifier.js    # 文本驗證界面
```

### 📊 數據可視化

#### 全球網絡威脅數據 (2026)
- **總報告數**：1,280,000+
- **受影響國家**：195
- **經濟損失**：$198 億美元
- **受保護用戶**：50,000+

### 📄 許可證

本項目採用 MIT 許可證。詳見 `LICENSE` 文件。

### 👥 作者

- **AI 網絡偵探團隊** - *初始工作* - 2026-02-16

---

<div align="center">

**Made with 💚 for a Safer Digital World**

</div>
