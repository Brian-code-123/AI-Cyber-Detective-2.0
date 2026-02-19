# Changelog

All notable changes to NeoTrace are documented in this file.

## [3.0.0] - 2026-02-19

### Major Changes
✨ **Complete Redesign**: Apple-style minimalist interface with frosted glass effects
- Transitioned from cyberpunk green to monochrome Apple-inspired design
- Replaced custom fonts with SF Pro / Inter system fonts
- Removed matrix rain animation, neon glows, and scanlines
- Implemented 90% whitespace with subtle animations

### Added
- 🌐 **Live Cybersecurity News Feed**: Displays 10 latest articles from The Hacker News with 15-minute caching
- 📅 **Calendar Widget**: Monthly calendar on dashboard sidebar with today highlighting
- 📊 **Enhanced Analytics**: Three optimized charts (Heatmap, Top 10 Bar, Trend Line)
- 🔔 **News API**: `GET /api/news` endpoint with RSS feed scraping and fallback demo data
- 📱 **Responsive Design**: Optimized for desktop and tablet views
- 🌍 **Dual-language Support**: Full EN/ZH translations for new components

### Improved
- Chart rendering performance with Apple color palette
- Code organization with separated concerns (dashboard/main/i18n)
- Mobile navigation with smooth transitions
- Loading states and skeleton screens for async content

### Removed
- Doughnut (distribution) chart
- Radar (sophistication) chart
- Matrix rain animation
- Scanline effects and neon glow styling

### Changed
- Project name: "AI Cyber Detective 2.0" → "NeoTrace"
- Package name: "ai-cyber-detective-2.0" → "neotrace"
- Logo icon: 🔍 → ◉ (minimalist circle)
- Node.js minimum: ≥14 → ≥18
- Express.js: ^4.18.2 → ^4.21.0

### Fixed
- Port binding issues with graceful error handling
- CSS specificity conflicts
- i18n key consistency across all pages

---

## [2.0.0] - 2026-02-16

### Initial Release
- Cyberpunk-themed cybersecurity education platform
- 5 interactive charts (Heatmap, Bar, Doughnut, Line, Radar)
- Story-based learning with 4 chapters
- Gamified training system with leaderboard
- Image forensics tool
- URL threat scanner
- Text verification tool
- Bilingual support (EN/ZH)

---

## Format

This changelog follows [Keep a Changelog](https://keepachangelog.com) conventions.
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Now removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes
