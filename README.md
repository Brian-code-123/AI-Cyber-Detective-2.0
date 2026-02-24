# NeoTrace — All-in-One Cybersecurity Learning Hub

NeoTrace is a lightweight web platform that helps students, professionals, and everyday users learn practical cybersecurity skills and inspect digital content safely. The site combines clear learning paths with simple, privacy-minded tools for threat detection and analysis.
## Overview

NeoTrace's goal is to make cybersecurity accessible. Inspired by the idea of revealing hidden threats, the project aims to empower people to recognize phishing, deepfakes, scams, and other digital risks. The platform curates learning resources and bundled tools so users can progress from basics to more advanced topics without hunting through scattered content.
## Key Features

- URL Threat Scanner — quick checks for suspicious links
- Image Forensics — local analysis to help detect manipulated images
- Content Verifier — verify text and detect likely misinformation
- Phone Inspector — inspect phone-related metadata and risks
- Password Checker — basic password strength and reuse guidance
- WiFi Scanner & QR Scanner — simple checks for common risks
- Training Game & Story Mode — hands-on exercises for learning
## Mission & Audience

NeoTrace is built for learners and everyday citizens who want to browse and interact with the web more confidently. The project emphasizes clarity over jargon, practical tools over marketing claims, and local-first processing when possible to protect user privacy.
## Technology

The platform uses modern web technologies focused on performance and scalability. Notable components used in the project:
- Node.js and Express.js (backend)
- Client-side processing and tools (runs locally in the browser where feasible)
- Chart.js, Leaflet.js for visualizations
- Bootstrap 5 for layout and UI
- Deployed on Vercel; source hosted on GitHub
## Quick Start (Local)

Prerequisites: Node.js >= 18
1. Install dependencies:

```bash
npm install
```
2. Start the server:

```bash
npm start
# or
node server.js
```
3. Open http://localhost:3000 (or the port shown in the console).

Note: The project is intentionally lightweight and primarily client-focused; many analysis tools run locally in the browser to preserve privacy.
## Contributing

Contributions are welcome. If you find a bug or want to suggest an improvement, please open an issue or submit a pull request on the repository.
- Report bugs or suggest features via the GitHub repository: https://github.com/Brian-code-123/NeoTrace
- Use the site's feedback button or chatbot for quick notes.
## License & Contact

This repository includes the site source and tooling. See the repository for the full license and contributor guidelines. For questions, feedback, or collaboration, use the feedback options on the site or open an issue on GitHub.
---

This README is intentionally concise and factual, and it reflects the project's About page mission: to make cybersecurity learning approachable and practical for everyone.
NeoTrace
<p align="center">
  <strong>Open-Source Digital Forensics & Threat Intelligence Platform</strong>
</p>
<p align="center">
  <a href="#features">Features</a> •
  <a href="#use-cases">Use Cases</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API</a>
</p>
Overview
NeoTrace is a web-based platform that brings practical digital forensics and threat intelligence tools to students, security professionals, and IT teams. It packages essential forensic capabilities into an accessible interface—making cybersecurity skills easier to learn and apply without requiring enterprise-grade infrastructure.
The platform integrates real-time security monitoring, multimedia analysis, and automated threat detection through modular, extensible components.
Features
Threat Intelligence Dashboard
Real-time visualization of security events using Chart.js and Leaflet maps
Configurable risk scoring based on asset priority and threat indicators
Drill-down investigation workflows from summary metrics to detailed logs
Forensic Analysis Tools
| Tool                | Capability                                                                       | Input                       |
| ------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| **Phone Analyzer**  | Carrier lookup, line type detection, fraud indicators                            | Phone number (E.164 format) |
| **URL Inspector**   | Phishing pattern detection, domain reputation, SSL analysis                      | URL or domain               |
| **Image Forensics** | Metadata extraction, manipulation detection, AI-generated content identification | Image file (JPG, PNG, WebP) |
I Integration (Optional)
NeoTrace supports external AI services via the ASI API for enhanced analysis:
Content credibility assessment
Deepfake detection assistance
Automated threat classification
AI features require an ASI_API_KEY in your environment configuration. The AI backend can be replaced with alternative providers by updating the endpoint settings.
Learning & Training
Interactive cybersecurity lessons
Gamified training modules for threat recognition
Simulated incident response scenarios
Quick Start
Requirements
Node.js 18+
npm or yarn
(Optional) ASI API key for AI features
Installation
git clone https://github.com/Brian-code-123/NeoTrace.git
cd NeoTrace
npm install

# Copy and edit environment variables
cp .env.example .env
# Add ASI_API_KEY if using AI features

npm run dev
# Open http://localhost:3000
Production
npm run build
npm start
Configuration
Environment Variables
| Variable       | Required | Description                                             |
| -------------- | -------- | ------------------------------------------------------- |
| `ASI_API_KEY`  | No       | API key for AI analysis services                        |
| `ASI_ENDPOINT` | No       | Custom AI service endpoint (defaults to standard ASI)   |
| `JWT_SECRET`   | Yes      | Secret for authentication tokens                        |
| `DB_PATH`      | No       | SQLite database path (defaults to `./data/neotrace.db`) |

Use Cases
Security Teams
Quick triage of suspicious phone numbers, URLs, or attachments
Lightweight forensics for preliminary incident assessment
Standardized reporting for documentation
Education
Hands-on digital forensics labs
Training environments for cybersecurity courses
CTF competition preparation
Enterprise IT
Employee phishing awareness tools
Vendor and link verification
Basic threat monitoring for small-to-medium deployments
Individual Users
Personal phone number and URL safety checks
Image authenticity verification for social media content
Learning fundamental cybersecurity practices
API Reference
NeoTrace provides RESTful endpoints for automation and integration.
Core Endpoints
| Endpoint                 | Method | Description                             | Auth         |
| ------------------------ | ------ | --------------------------------------- | ------------ |
| `/api/v1/analyze/phone`  | POST   | Phone number analysis                   | Bearer token |
| `/api/v1/analyze/url`    | POST   | URL inspection and risk scoring         | Bearer token |
| `/api/v1/analyze/image`  | POST   | Image forensics analysis                | Bearer token |
| `/api/v1/threats/stream` | GET    | Server-sent events for real-time alerts | Bearer token |

curl -X POST http://localhost:3000/api/v1/analyze/url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
  Full documentation available at /docs in development mode.
Architecture