# NeoTrace

<p align="center">
  <strong>All-in-One Cybersecurity Learning Hub</strong>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

NeoTrace is a lightweight, open-source web platform that makes cybersecurity education accessible to students, professionals, and everyday users. It combines practical learning paths with privacy-focused tools for threat detection and digital content analysis.

The platform emphasizes **local-first processing** to protect user privacy while providing essential forensic capabilities through an intuitive, browser-based interface.

## Key Features

### Security Analysis Tools

| Tool | Capability | Input | Privacy |
|------|-----------|-------|---------|
| **URL Threat Scanner** | Phishing detection, domain reputation, SSL validation | URL or domain | Local analysis |
| **Phone Inspector** | Carrier lookup, line type detection, fraud risk scoring | Phone number (E.164) | Local analysis |
| **Image Forensics** | Metadata extraction, manipulation detection | JPG, PNG, WebP | Client-side |
| **Content Verifier** | Text credibility scoring, misinformation patterns | Text content | Local processing |
| **Password Checker** | Strength analysis, breach database comparison | Password (hashed) | Secure hashing |
| **WiFi & QR Scanner** | Network security assessment, malicious link detection | SSID or QR code | Local scan |

### Learning & Training

## NeoTrace — Cybersecurity Learning Hub

NeoTrace is a lightweight web platform that helps learners and everyday users spot online threats and learn practical cybersecurity skills. The site combines clear learning paths with simple, privacy-minded tools for inspecting links, images, text, and more.

## Overview

NeoTrace focuses on accessibility and privacy. It provides hands-on tools and curated resources to help people identify phishing, deepfakes, scams, and other common digital risks. Where possible, analysis runs locally in the browser to minimize data exposure.

## Features

- URL Threat Scanner — quick checks for suspicious links and domains
- Image Forensics — metadata and basic manipulation indicators
- Content Verifier — local text checks for likely misinformation patterns
- Phone Inspector — number lookups and basic risk signals
- Password Checker — basic strength and reuse guidance
- WiFi & QR Scanner — simple checks for common risks
- Training Game & Story Mode — interactive exercises to build skills

## Mission

Make cybersecurity practical and understandable. NeoTrace prefers plain language over jargon, tools that work in the browser when feasible, and straightforward learning paths from beginner to more advanced topics.

## Tech (high level)

- Node.js + Express.js (backend)
- Vanilla JS and Bootstrap 5 (frontend)
- Chart.js, Leaflet.js for visualizations
- Optional AI integrations via configurable API keys
- Deployed on Vercel; source on GitHub

## Quick start (local)

Prerequisites: Node.js >= 18

```bash
git clone https://github.com/Brian-code-123/NeoTrace.git
cd NeoTrace
npm install
npm start
# then open http://localhost:3000
```

Optional: copy `.env.example` to `.env` and add an `ASI_API_KEY` to enable AI features.

## Contributing

Contributions are welcome. Fork the repository, make changes on a branch, and open a pull request. Report bugs or suggest features via GitHub Issues or use the site's feedback button.

## License & Contact

This project is available under the MIT License. Source and issues: https://github.com/Brian-code-123/NeoTrace

---

This README is written to be factual and approachable, reflecting the project's About page: practical tools, local-first privacy, and clear learning paths.