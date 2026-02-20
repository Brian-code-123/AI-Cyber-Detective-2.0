# NeoTrace

NeoTrace is a simple, user-friendly web platform that brings practical cybersecurity and digital forensics tools to students, professionals, and beginners.

## Mission
Make cybersecurity knowledge accessible. We provide intuitive tools and clear learning resources so users can spot scams, verify content, and improve everyday online safety.

## What We Offer
- Real-time threat dashboard and concise analytics
- Tools for phone, URL, and image analysis
- Interactive learning and gamified training modules
- Simple APIs for integration and automation

## Why This Project Exists
Security tools are often fragmented and aimed at experts. NeoTrace packages essential capabilities into easy-to-use tools and lessons so more people can protect themselves and their communities.

## Quick Start
```bash
git clone https://github.com/Brian-code-123/NeoTrace.git
cd NeoTrace
npm install
npm run dev
# Open http://localhost:3000
```

## Technical Details
- Runtime: Node.js + Express server
- Frontend: Static HTML/CSS/JavaScript (Chart.js, Leaflet for maps)
- AI integrations: configured via `ASI_API_KEY` in your `.env`
	- The ASI key enables calls to the project's AI service endpoint used for model inference (text analysis, image forensics, phone/URL classification and threat scoring).
	- AI tasks performed via ASI include: content credibility scoring, deepfake/AI-image detection, phishing pattern detection, and risk-scoring for phone numbers and URLs.
	- You can swap the ASI backend for another provider by updating the API endpoint and credentials in server configuration.

## Use Cases & Applications
- **Security Professionals:** quick threat checks, incident triage, and lightweight forensics for triage and reporting.
- **Educational Institutions:** interactive lessons and gamified modules for teaching practical cybersecurity skills.
- **Business & IT Teams:** employee phishing simulations, URL and attachment scanning, and simple integration via APIs.
- **Individual Users:** personal phone/URL checks, image authenticity inspection, and password/security hygiene tools.
- **Developers & Researchers:** extendable API endpoints for prototyping threat detection or integrating NeoTrace checks into other systems.

## License
MIT
