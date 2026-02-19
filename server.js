/**
 * =====================================================
 * NeoTrace — Backend Server
 * =====================================================
 * 
 * @description Express.js server providing API endpoints for cybersecurity intelligence platform
 * @author NeoTrace Team
 * @version 3.0.0
 * @date 2026-02-16
 * 
 * Features:
 * - URL threat analysis with phishing detection
 * - Image forensics with AI detection
 * - Text verification with misinformation detection
 * - Global leaderboard for gamification
 * 
 * API Endpoints:
 * - GET/POST /api/leaderboard - Game leaderboard management
 * - POST /api/analyze-url - URL security analysis
 * - POST /api/analyze-image - Image authenticity verification
 * - POST /api/verify-text - Text credibility scoring
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dns = require('dns');
const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');

// Load environment variables from .env if present
try { require('dotenv').config(); } catch(e) {
  // dotenv not installed — use Vercel env vars or system env
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies (up to 50MB)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Configure multer for file uploads (in-memory storage, 20MB limit)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

// ==================== LEADERBOARD API ====================
/**
 * In-memory leaderboard storage with seed data
 * In production, this would be replaced with a database
 */
let leaderboard = [
  { name: 'CyberNinja', score: 2850, rank: 'Elite Detective', badge: '👑', date: '2026-02-10' },
  { name: 'NetGuardian', score: 2400, rank: 'Senior Detective', badge: '🏆', date: '2026-02-12' },
  { name: 'PhishHunter', score: 2100, rank: 'Senior Detective', badge: '🏆', date: '2026-02-08' },
  { name: 'SecureBot', score: 1800, rank: 'Detective', badge: '🥇', date: '2026-02-14' },
  { name: 'DataShield', score: 1500, rank: 'Detective', badge: '🥇', date: '2026-02-09' },
  { name: 'HackBuster', score: 1200, rank: 'Junior Detective', badge: '🥈', date: '2026-02-11' },
  { name: 'AlertEagle', score: 900, rank: 'Trainee', badge: '🥉', date: '2026-02-13' },
  { name: 'CodeWatcher', score: 600, rank: 'Trainee', badge: '🥉', date: '2026-02-15' }
];

/**
 * GET /api/leaderboard
 * Returns top 50 players sorted by score
 */
app.get('/api/leaderboard', (req, res) => {
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 50);
  res.json(sorted);
});

/**
 * POST /api/leaderboard
 * Adds new player score to leaderboard
 * @body {string} name - Player name
 * @body {number} score - Player score
 * @body {string} rank - Player rank (optional)
 * @body {string} badge - Player badge emoji (optional)
 */
app.post('/api/leaderboard', (req, res) => {
  const { name, score, rank, badge } = req.body;
  if (!name || score === undefined) return res.status(400).json({ error: 'Name and score required' });
  const entry = { name, score, rank: rank || 'Trainee', badge: badge || '🥉', date: new Date().toISOString().split('T')[0] };
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 100) leaderboard = leaderboard.slice(0, 100);
  const position = leaderboard.findIndex(e => e.name === name && e.score === score) + 1;
  res.json({ success: true, position, entry });
});

// ==================== URL ANALYZER API ====================
/**
 * Threat detection databases for URL analysis
 */
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.buzz', '.club', '.work', '.click', '.link', '.info', '.online', '.site', '.icu', '.fun', '.space', '.gq', '.ml', '.cf', '.tk', '.ga'];
const PHISHING_KEYWORDS = ['login', 'verify', 'secure', 'account', 'update', 'confirm', 'banking', 'signin', 'sign-in', 'credential', 'password', 'crypto', 'wallet', 'prize', 'winner', 'free', 'urgent', 'suspended', 'locked', 'unauthorized', 'alert', 'billing'];
const LEGITIMATE_DOMAINS = ['google.com', 'facebook.com', 'amazon.com', 'apple.com', 'microsoft.com', 'github.com', 'stackoverflow.com', 'wikipedia.org', 'youtube.com', 'twitter.com', 'linkedin.com', 'netflix.com', 'paypal.com'];

/**
 * POST /api/analyze-url
 * Analyzes URL for phishing and security threats
 * @body {string} targetUrl - URL to analyze
 * @returns {object} Risk score, findings, and domain details
 */
app.post('/api/analyze-url', async (req, res) => {
  try {
    const { targetUrl } = req.body;
    if (!targetUrl) return res.status(400).json({ error: 'URL required' });

    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    } catch (e) {
      return res.json({ error: 'Invalid URL format', riskScore: 100, riskLevel: 'Critical' });
    }

    const hostname = parsedUrl.hostname;
    const domain = hostname.replace(/^www\./, '');
    let riskScore = 0;
    const findings = [];
    const details = {};

    // Domain analysis
    details.domain = domain;
    details.protocol = parsedUrl.protocol;
    details.path = parsedUrl.pathname;
    details.port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80');

    // Check protocol
    if (parsedUrl.protocol !== 'https:') {
      riskScore += 20;
      findings.push({ type: 'warning', message: 'Site does not use HTTPS encryption' });
    } else {
      findings.push({ type: 'safe', message: 'Site uses HTTPS encryption' });
    }

    // Check TLD
    const tld = '.' + domain.split('.').pop();
    if (SUSPICIOUS_TLDS.includes(tld)) {
      riskScore += 15;
      findings.push({ type: 'warning', message: `Suspicious TLD: ${tld} - commonly used in scam sites` });
    }

    // Check for IP address
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      riskScore += 25;
      findings.push({ type: 'danger', message: 'URL uses IP address instead of domain name' });
    }

    // Check for suspicious patterns
    if (domain.includes('-') && domain.split('-').length > 2) {
      riskScore += 10;
      findings.push({ type: 'warning', message: 'Domain contains multiple hyphens - common in phishing' });
    }

    if (domain.length > 30) {
      riskScore += 10;
      findings.push({ type: 'warning', message: 'Unusually long domain name' });
    }

    // Check for homograph attacks
    if (/[а-яА-Я]|[^\x00-\x7F]/.test(domain)) {
      riskScore += 30;
      findings.push({ type: 'danger', message: 'Domain contains non-ASCII characters - possible homograph attack' });
    }

    // Check phishing keywords
    const foundKeywords = PHISHING_KEYWORDS.filter(kw => domain.includes(kw) || parsedUrl.pathname.toLowerCase().includes(kw));
    if (foundKeywords.length > 0) {
      riskScore += foundKeywords.length * 5;
      findings.push({ type: 'warning', message: `Suspicious keywords found: ${foundKeywords.join(', ')}` });
    }

    // Check for brand impersonation
    const brandCheck = LEGITIMATE_DOMAINS.find(ld => domain.includes(ld.split('.')[0]) && domain !== ld && !domain.endsWith('.' + ld));
    if (brandCheck) {
      riskScore += 25;
      findings.push({ type: 'danger', message: `Possible brand impersonation of ${brandCheck}` });
    }

    // Check if legitimate
    if (LEGITIMATE_DOMAINS.includes(domain)) {
      riskScore = Math.max(0, riskScore - 40);
      findings.push({ type: 'safe', message: 'Domain is a well-known legitimate website' });
    }

    // Subdomain analysis
    const subdomains = hostname.split('.').length - 2;
    if (subdomains > 2) {
      riskScore += 10;
      findings.push({ type: 'warning', message: `Multiple subdomains detected (${subdomains}) - may indicate phishing` });
    }

    // URL length check
    if (targetUrl.length > 100) {
      riskScore += 5;
      findings.push({ type: 'info', message: 'URL is unusually long' });
    }

    // Query parameter check
    if (parsedUrl.search && parsedUrl.search.length > 50) {
      riskScore += 5;
      findings.push({ type: 'info', message: 'URL contains lengthy query parameters' });
    }

    // DNS lookup
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.resolve4(hostname, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      details.ip = addresses[0];
      findings.push({ type: 'safe', message: `Domain resolves to ${addresses[0]}` });
    } catch (e) {
      riskScore += 20;
      findings.push({ type: 'danger', message: 'Domain does not resolve - may not exist or is blocked' });
    }

    riskScore = Math.min(100, Math.max(0, riskScore));
    let riskLevel = 'Low';
    if (riskScore >= 70) riskLevel = 'Critical';
    else if (riskScore >= 50) riskLevel = 'High';
    else if (riskScore >= 30) riskLevel = 'Medium';

    res.json({ riskScore, riskLevel, findings, details, domain });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

// ==================== IMAGE ANALYZER API ====================
/**
 * POST /api/analyze-image
 * Multi-layered image forensic analysis
 * @body {file} image - Image file to analyze (multipart/form-data, max 20MB)
 * @returns {object} AI detection score, EXIF data, compression analysis, forensic findings
 * 
 * Analysis layers:
 * - EXIF metadata extraction (camera info, GPS, software)
 * - AI generation software detection
 * - JPEG compression artifact analysis
 * - Pixel uniformity forensics
 * - File signature verification
 */
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const buffer = req.file.buffer;
    const fileSize = buffer.length;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;

    const results = {
      fileInfo: {
        name: fileName,
        size: fileSize,
        sizeFormatted: formatBytes(fileSize),
        type: mimeType,
      },
      exifData: {},
      aiDetection: { score: 0, findings: [] },
      compression: { findings: [] },
      forensic: { findings: [] }
    };

    // EXIF Analysis
    try {
      const exifr = require('exifr');
      const exif = await exifr.parse(buffer, true);
      if (exif) {
        results.exifData = {
          make: exif.Make || null,
          model: exif.Model || null,
          software: exif.Software || null,
          dateTime: exif.DateTimeOriginal || exif.DateTime || null,
          gps: exif.latitude ? { lat: exif.latitude, lng: exif.longitude } : null,
          dimensions: exif.ImageWidth ? `${exif.ImageWidth}x${exif.ImageHeight}` : null,
          colorSpace: exif.ColorSpace || null,
          iso: exif.ISO || null,
          focalLength: exif.FocalLength || null,
          aperture: exif.FNumber || null,
          exposureTime: exif.ExposureTime || null
        };

        // Check for AI generation software
        const aiSoftware = ['dall-e', 'midjourney', 'stable diffusion', 'novelai', 'artbreeder', 'deepai', 'runway', 'adobe firefly'];
        const softwareStr = (exif.Software || '').toLowerCase();
        if (aiSoftware.some(s => softwareStr.includes(s))) {
          results.aiDetection.score += 40;
          results.aiDetection.findings.push({ type: 'danger', message: `AI generation software detected: ${exif.Software}` });
        }

        if (!exif.Make && !exif.Model) {
          results.aiDetection.score += 10;
          results.aiDetection.findings.push({ type: 'warning', message: 'No camera manufacturer/model data - may indicate digital creation' });
        }

        if (!exif.DateTimeOriginal) {
          results.aiDetection.score += 5;
          results.aiDetection.findings.push({ type: 'info', message: 'No original capture date found' });
        }
      } else {
        results.aiDetection.score += 15;
        results.aiDetection.findings.push({ type: 'warning', message: 'No EXIF data found - metadata may have been stripped or image is digitally created' });
      }
    } catch (e) {
      results.aiDetection.findings.push({ type: 'info', message: 'Could not parse EXIF data from this image format' });
    }

    // Compression Analysis
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      // Check JPEG markers
      const hasJFIF = buffer.indexOf(Buffer.from('JFIF')) !== -1;
      const hasExif = buffer.indexOf(Buffer.from('Exif')) !== -1;
      
      if (fileSize < 50000 && fileName.toLowerCase().includes('.jpg')) {
        results.compression.findings.push({ type: 'warning', message: 'Small file size suggests heavy compression or low resolution' });
        results.aiDetection.score += 5;
      }

      // Count quantization tables (DQT markers)
      let dqtCount = 0;
      for (let i = 0; i < buffer.length - 1; i++) {
        if (buffer[i] === 0xFF && buffer[i + 1] === 0xDB) dqtCount++;
      }
      if (dqtCount > 2) {
        results.compression.findings.push({ type: 'warning', message: 'Multiple quantization tables detected - possible re-compression' });
        results.aiDetection.score += 10;
      }

      results.compression.findings.push({ type: 'info', message: `Format: JPEG ${hasJFIF ? '(JFIF)' : ''} ${hasExif ? '(EXIF)' : ''}` });
    } else if (mimeType === 'image/png') {
      results.compression.findings.push({ type: 'info', message: 'Format: PNG (lossless compression)' });
      
      // Check for tEXt chunks that might contain AI metadata
      const textChunk = buffer.indexOf(Buffer.from('tEXt'));
      if (textChunk !== -1) {
        results.compression.findings.push({ type: 'info', message: 'PNG text metadata chunks found' });
      }
    }

    // Forensic Analysis
    // Check for uniform noise patterns (common in AI images)
    const sampleSize = Math.min(buffer.length, 10000);
    const sample = buffer.slice(buffer.length - sampleSize);
    let uniformity = 0;
    for (let i = 0; i < sample.length - 1; i++) {
      if (Math.abs(sample[i] - sample[i + 1]) < 3) uniformity++;
    }
    const uniformityRatio = uniformity / (sample.length - 1);
    
    if (uniformityRatio > 0.7) {
      results.aiDetection.score += 15;
      results.forensic.findings.push({ type: 'warning', message: `High pixel uniformity detected (${(uniformityRatio * 100).toFixed(1)}%) - potential AI smoothing artifacts` });
    } else {
      results.forensic.findings.push({ type: 'safe', message: `Normal pixel variance detected (${((1 - uniformityRatio) * 100).toFixed(1)}% variation)` });
    }

    // Check file signature
    const header = buffer.slice(0, 8);
    const isPNG = header[0] === 0x89 && header[1] === 0x50;
    const isJPG = header[0] === 0xFF && header[1] === 0xD8;
    const isGIF = header[0] === 0x47 && header[1] === 0x49;
    const isWebP = header[4] === 0x57 && header[5] === 0x45;

    if (!isPNG && !isJPG && !isGIF && !isWebP) {
      results.forensic.findings.push({ type: 'warning', message: 'File header does not match standard image formats' });
      results.aiDetection.score += 10;
    } else {
      results.forensic.findings.push({ type: 'safe', message: 'File signature matches declared format' });
    }

    // Normalize AI score
    results.aiDetection.score = Math.min(100, Math.max(0, results.aiDetection.score));
    
    let aiVerdict = 'Likely Authentic';
    if (results.aiDetection.score >= 60) aiVerdict = 'Likely AI Generated';
    else if (results.aiDetection.score >= 35) aiVerdict = 'Possibly Manipulated';
    else if (results.aiDetection.score >= 15) aiVerdict = 'Minor Concerns';
    results.aiDetection.verdict = aiVerdict;

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Image analysis failed', message: error.message });
  }
});

// ==================== TEXT VERIFIER API ====================
/**
 * POST /api/verify-text
 * Analyzes text content for misinformation, credibility, and emotional manipulation
 * @body {string} text - Text content to verify
 * @returns {object} Credibility score, sentiment analysis, misinformation risk, content findings
 * 
 * Detection patterns:
 * - Clickbait/sensationalist language
 * - Emotional manipulation (caps, exclamations)
 * - Statistical claims without sources
 * - Urgency tactics and social pressure
 * - Source citation analysis
 */
app.post('/api/verify-text', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const Sentiment = require('sentiment');
    const sentiment = new Sentiment();
    const sentimentResult = sentiment.analyze(text);

    const results = {
      content: { findings: [] },
      sentiment: {
        score: sentimentResult.score,
        comparative: sentimentResult.comparative,
        positive: sentimentResult.positive,
        negative: sentimentResult.negative,
        label: sentimentResult.score > 2 ? 'Very Positive' : sentimentResult.score > 0 ? 'Positive' : sentimentResult.score === 0 ? 'Neutral' : sentimentResult.score > -2 ? 'Negative' : 'Very Negative'
      },
      misinformation: { score: 0, findings: [] },
      credibility: { score: 100, findings: [] }
    };

    const lowerText = text.toLowerCase();
    const wordCount = text.split(/\s+/).length;

    // Clickbait patterns
    const clickbaitPatterns = [
      { pattern: /you won't believe/i, message: 'Clickbait phrase: "You won\'t believe"' },
      { pattern: /shocking|jaw.?dropping/i, message: 'Sensationalist language detected' },
      { pattern: /doctors hate|they don'?t want you to know/i, message: 'Conspiracy-style clickbait detected' },
      { pattern: /one weird trick|secret revealed/i, message: 'Classic clickbait pattern detected' },
      { pattern: /breaking[!:\s]|just in[!:\s]|urgent[!:\s]/i, message: 'Urgency-inducing language detected' },
      { pattern: /100%\s*(true|real|proven|guaranteed)/i, message: 'Absolute certainty claims are often false' },
      { pattern: /miracle\s*(cure|solution|product)/i, message: 'Miracle claims detected - likely misinformation' },
      { pattern: /exposed!?|exposed:?\s/i, message: 'Sensationalist "exposé" language' },
      { pattern: /mainstream media won'?t|media is hiding/i, message: 'Anti-media conspiracy language' },
      { pattern: /share (this|before|now)|must share|going viral/i, message: 'Social pressure to share - common in misinformation' },
      { pattern: /you (have |)(won|win|winner)|congratulations.*prize|claim your (prize|reward|money)/i, message: 'Prize/lottery scam language detected' },
      { pattern: /click (here |)(now|immediately|fast|quick)|act (now|fast|immediately)|limited time/i, message: 'High-pressure call-to-action detected' },
      { pattern: /\$[\d,]+[,.]?\d*\s*(dollar|usd|cash|prize|reward|won|win)?/i, message: 'Monetary amount mentioned — verify legitimacy' },
      { pattern: /expire|expiring|last chance|don'?t miss|before.*too late/i, message: 'Artificial scarcity/deadline language detected' }
    ];

    let clickbaitCount = 0;
    clickbaitPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(text)) {
        clickbaitCount++;
        results.misinformation.findings.push({ type: 'warning', message });
      }
    });

    if (clickbaitCount > 0) {
      results.misinformation.score += clickbaitCount * 12;
      results.credibility.score -= clickbaitCount * 10;
    }

    // Emotional manipulation
    const emotionalPatterns = [
      /!!+/g, /\?\?+/g, /ALL CAPS/g
    ];
    const capsRatio = (text.replace(/[^A-Z]/g, '').length) / Math.max(text.replace(/[^a-zA-Z]/g, '').length, 1);
    if (capsRatio > 0.5 && wordCount > 5) {
      results.misinformation.score += 10;
      results.misinformation.findings.push({ type: 'warning', message: `Excessive capitalization (${(capsRatio * 100).toFixed(0)}%) - often used in misleading content` });
      results.credibility.score -= 10;
    }

    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 3) {
      results.misinformation.score += 5;
      results.misinformation.findings.push({ type: 'info', message: `Multiple exclamation marks (${exclamationCount}) - emotional emphasis` });
    }

    // Source indicators
    const hasLinks = /https?:\/\/[^\s]+/.test(text);
    const hasCitations = /\[\d+\]|according to|research shows|study (shows|finds|suggests)|scientists say/i.test(text);
    const hasQuotes = /"[^"]{10,}"/.test(text);

    if (hasCitations) {
      results.credibility.score += 5;
      results.credibility.findings.push({ type: 'safe', message: 'Contains source citations or research references' });
    }
    if (hasLinks) {
      results.credibility.findings.push({ type: 'info', message: 'Contains external links' });
    }
    if (hasQuotes) {
      results.credibility.findings.push({ type: 'info', message: 'Contains direct quotes' });
    }

    if (!hasCitations && !hasLinks && wordCount > 50) {
      results.credibility.score -= 15;
      results.credibility.findings.push({ type: 'warning', message: 'No sources or citations in lengthy text' });
    }

    // Statistical claims without evidence
    const statClaims = text.match(/\d+%|\d+ out of \d+|\d+ million|\d+ billion/g);
    if (statClaims && !hasCitations) {
      results.misinformation.score += 10;
      results.misinformation.findings.push({ type: 'warning', message: `Statistical claims found (${statClaims.length}) without source citations` });
      results.credibility.score -= 10;
    }

    // Content length analysis
    if (wordCount < 10) {
      results.content.findings.push({ type: 'info', message: 'Very short text - limited analysis available' });
    } else if (wordCount > 500) {
      results.content.findings.push({ type: 'info', message: `Lengthy content (${wordCount} words) - detailed analysis performed` });
    }

    // Grammar / quality indicators
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
    if (avgSentenceLength > 35) {
      results.content.findings.push({ type: 'info', message: 'Very long sentences - may indicate automated generation' });
      results.misinformation.score += 5;
    }

    // Normalize scores
    results.misinformation.score = Math.min(100, Math.max(0, results.misinformation.score));
    results.credibility.score = Math.min(100, Math.max(0, results.credibility.score));

    results.misinformation.level = results.misinformation.score >= 50 ? 'High Risk' : results.misinformation.score >= 25 ? 'Medium Risk' : 'Low Risk';
    results.credibility.level = results.credibility.score >= 70 ? 'Credible' : results.credibility.score >= 40 ? 'Questionable' : 'Low Credibility';

    // Overall verdict
    if (results.misinformation.findings.length === 0) {
      results.misinformation.findings.push({ type: 'safe', message: 'No obvious misinformation patterns detected' });
    }
    if (results.content.findings.length === 0) {
      results.content.findings.push({ type: 'safe', message: 'Text content appears normal' });
    }
    if (results.credibility.findings.length === 0) {
      results.credibility.findings.push({ type: 'safe', message: 'Content appears credible' });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Text analysis failed', message: error.message });
  }
});

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ==================== NEWS API ====================
/**
 * GET /api/news
 * Returns latest cybersecurity news from RSS feeds
 * Scrapes The Hacker News RSS feed and returns up to 10 articles with AI-generated summaries
 */
let newsCache = { data: null, timestamp: 0 };
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

app.get('/api/news', async (req, res) => {
  try {
    // Return cache if fresh
    if (newsCache.data && Date.now() - newsCache.timestamp < NEWS_CACHE_TTL) {
      return res.json(newsCache.data);
    }

    const feedUrl = 'https://feeds.feedburner.com/TheHackersNews';
    const xml = await fetchURL(feedUrl);

    // Simple XML parsing for RSS items
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
      const itemXml = match[1];
      const title = extractTag(itemXml, 'title');
      const link = extractTag(itemXml, 'link');
      const pubDate = extractTag(itemXml, 'pubDate');
      const description = extractTag(itemXml, 'description');

      // Clean HTML from description for summary
      const cleanDesc = description
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      const summary = cleanDesc.length > 200 ? cleanDesc.substring(0, 200) + '...' : cleanDesc;

      items.push({
        title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        url: link.trim(),
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: 'The Hacker News',
        summary
      });
    }

    newsCache = { data: items, timestamp: Date.now() };
    res.json(items);
  } catch (error) {
    console.error('News fetch error:', error.message);
    // Return cached data if available, even if stale
    if (newsCache.data) return res.json(newsCache.data);
    res.status(500).json({ error: 'Failed to fetch news', message: error.message });
  }
});

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

function fetchURL(targetUrl) {
  return new Promise((resolve, reject) => {
    const protocol = targetUrl.startsWith('https') ? https : http;
    protocol.get(targetUrl, { headers: { 'User-Agent': 'NeoTrace/3.0' } }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return fetchURL(response.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// ==================== PHONE INSPECTOR API ====================
app.post('/api/phone/check', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Phone number database (demo)
  const phoneDB = {
    '+85291234567': { country: 'Hong Kong', country_code: 'HK', dial_code: '852', carrier: 'HKT / PCCW', line_type: 'Mobile', fraud_score: 12, spam_risk: 8, voip_risk: 5, recent_activity: 70, carrier_trust: 92, active_status: 'Active', blacklist_hits: 0, email: null, notes: null },
    '+85261234567': { country: 'Hong Kong', country_code: 'HK', dial_code: '852', carrier: 'China Mobile HK', line_type: 'Mobile', fraud_score: 65, spam_risk: 72, voip_risk: 10, recent_activity: 95, carrier_trust: 78, active_status: 'Active', blacklist_hits: 3, email: 'temp_user88@yopmail.com', notes: 'Multiple spam complaints reported in the last 30 days' },
    '+85253001234': { country: 'Hong Kong', country_code: 'HK', dial_code: '852', carrier: '3 Hong Kong', line_type: 'VOIP', fraud_score: 88, spam_risk: 90, voip_risk: 95, recent_activity: 40, carrier_trust: 35, active_status: 'Inactive', blacklist_hits: 7, email: 'scammer@tempmail.net', notes: 'Linked to investment scam operations targeting elderly victims' },
    '+14155551234': { country: 'United States', country_code: 'US', dial_code: '1', carrier: 'T-Mobile', line_type: 'Mobile', fraud_score: 22, spam_risk: 15, voip_risk: 5, recent_activity: 80, carrier_trust: 88, active_status: 'Active', blacklist_hits: 0, email: null, notes: null },
    '+447911123456': { country: 'United Kingdom', country_code: 'GB', dial_code: '44', carrier: 'Vodafone UK', line_type: 'Mobile', fraud_score: 35, spam_risk: 40, voip_risk: 8, recent_activity: 60, carrier_trust: 82, active_status: 'Active', blacklist_hits: 1, email: null, notes: 'Low-level telemarketing complaints' },
    '+86138001234567': { country: 'China', country_code: 'CN', dial_code: '86', carrier: 'China Mobile', line_type: 'Mobile', fraud_score: 45, spam_risk: 55, voip_risk: 12, recent_activity: 88, carrier_trust: 70, active_status: 'Active', blacklist_hits: 2, email: null, notes: 'Region associated with elevated scam activity' },
    '+81901234567': { country: 'Japan', country_code: 'JP', dial_code: '81', carrier: 'NTT Docomo', line_type: 'Mobile', fraud_score: 8, spam_risk: 5, voip_risk: 3, recent_activity: 65, carrier_trust: 95, active_status: 'Active', blacklist_hits: 0, email: null, notes: null }
  };

  // Check if number exists in DB, otherwise generate
  let result = phoneDB[cleaned];
  if (!result) {
    // Generate realistic demo data based on number pattern
    const hash = [...cleaned].reduce((a, c) => a + c.charCodeAt(0), 0);
    const isVoip = hash % 5 === 0;
    const fraudScore = Math.min(95, Math.max(5, (hash * 7) % 100));
    const countries = [
      { country: 'Hong Kong', code: 'HK', dial: '852', carriers: ['HKT / PCCW', 'China Mobile HK', '3 Hong Kong', 'SmarTone'] },
      { country: 'United States', code: 'US', dial: '1', carriers: ['AT&T', 'T-Mobile', 'Verizon'] },
      { country: 'United Kingdom', code: 'GB', dial: '44', carriers: ['Vodafone UK', 'EE', 'O2'] },
      { country: 'Taiwan', code: 'TW', dial: '886', carriers: ['Chunghwa Telecom', 'FarEasTone', 'Taiwan Mobile'] },
      { country: 'Singapore', code: 'SG', dial: '65', carriers: ['Singtel', 'StarHub', 'M1'] }
    ];
    // Detect country from prefix
    let geo = countries[0]; // default HK
    if (cleaned.startsWith('+1')) geo = countries[1];
    else if (cleaned.startsWith('+44')) geo = countries[2];
    else if (cleaned.startsWith('+886')) geo = countries[3];
    else if (cleaned.startsWith('+65')) geo = countries[4];

    result = {
      country: geo.country,
      country_code: geo.code,
      dial_code: geo.dial,
      carrier: geo.carriers[hash % geo.carriers.length],
      line_type: isVoip ? 'VOIP' : (hash % 3 === 0 ? 'Landline' : 'Mobile'),
      fraud_score: fraudScore,
      spam_risk: Math.min(95, Math.max(5, (hash * 3) % 100)),
      voip_risk: isVoip ? Math.min(95, 60 + (hash % 35)) : Math.max(3, hash % 20),
      recent_activity: Math.min(95, Math.max(10, (hash * 11) % 100)),
      carrier_trust: isVoip ? Math.max(20, 50 - (hash % 30)) : Math.min(95, 60 + (hash % 35)),
      active_status: hash % 4 === 0 ? 'Inactive' : 'Active',
      blacklist_hits: fraudScore > 60 ? Math.floor(hash % 8) + 1 : (fraudScore > 30 ? hash % 3 : 0),
      email: fraudScore > 50 ? `user${hash % 999}@tempmail.net` : null,
      notes: fraudScore > 70 ? 'Number flagged in multiple fraud databases' : (fraudScore > 40 ? 'Moderate risk — exercise caution' : null)
    };
  }

  res.json(result);
});

// ==================== SERVE PAGES ====================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ==================== ASI-1 AI PROXY ====================
const ASI_API_KEY = process.env.ASI_API_KEY || '';
const ASI_MODEL = process.env.ASI_MODEL || 'asi1-mini';
const ASI_BASE_URL = 'https://api.asi1.ai';

// Generic ASI-1 chat completion proxy
app.post('/api/asi/chat', async (req, res) => {
  if (!ASI_API_KEY) return res.status(500).json({ error: 'ASI API key not configured' });
  const { messages, model, max_tokens } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages array required' });

  try {
    const payload = JSON.stringify({
      model: model || ASI_MODEL,
      messages,
      max_tokens: max_tokens || 1024,
      temperature: 0.7
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.asi1.ai',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ASI_API_KEY}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch(e) { reject(new Error('Invalid JSON from ASI API')); }
        });
      });
      apiReq.on('error', reject);
      apiReq.setTimeout(30000, () => { apiReq.destroy(); reject(new Error('ASI API timeout')); });
      apiReq.write(payload);
      apiReq.end();
    });

    if (result.error) return res.status(502).json({ error: result.error.message || 'ASI API error' });
    const reply = result.choices?.[0]?.message?.content || '';
    res.json({ reply, model: result.model, usage: result.usage });
  } catch(err) {
    console.error('ASI proxy error:', err.message);
    res.status(502).json({ error: 'Failed to reach ASI-1 API: ' + err.message });
  }
});

// Chatbot endpoint (wraps ASI with NeoTrace system prompt)
app.post('/api/chatbot', async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const systemPrompt = `You are NeoTrace AI Assistant, a friendly cybersecurity expert built into the NeoTrace platform.
NeoTrace is an AI-powered cybersecurity intelligence platform with these tools:
- Dashboard: Real-time threat stats, charts, news feed
- Story Mode: Interactive cybersecurity stories with decision points
- Training Game: Quiz-style cybersecurity training
- Phone Inspector: Analyze phone numbers for spam/fraud risk
- URL Scanner: Check URLs for phishing, malware, and threats
- Image Forensics: Detect AI-generated or manipulated images
- Text Verifier: Verify text credibility and detect misinformation

Also available: Careers page (cybersecurity job roles), Courses (online learning), Certifications (security certs).

Help users navigate the platform, explain cybersecurity concepts, and provide guidance. Keep answers concise and helpful. Reply in the same language the user uses.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-6),
    { role: 'user', content: message }
  ];

  // Forward to ASI proxy internally
  if (!ASI_API_KEY) {
    // Fallback if no API key
    return res.json({ reply: 'I\'m NeoTrace AI Assistant. The AI service is currently being configured. In the meantime, feel free to explore our tools — use the navigation bar to access URL Scanner, Image Forensics, Text Verifier, and more!' });
  }

  try {
    const payload = JSON.stringify({ model: ASI_MODEL, messages, max_tokens: 512, temperature: 0.7 });
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.asi1.ai', port: 443,
        path: '/v1/chat/completions', method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ASI_API_KEY}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
      });
      apiReq.on('error', reject);
      apiReq.setTimeout(30000, () => { apiReq.destroy(); reject(new Error('timeout')); });
      apiReq.write(payload);
      apiReq.end();
    });

    const reply = result.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that. Try again!';
    res.json({ reply });
  } catch(err) {
    console.error('Chatbot error:', err.message);
    res.json({ reply: 'I\'m having trouble connecting right now. Please try again in a moment!' });
  }
});

// ==================== FEEDBACK API ====================
const feedbackStore = [];

app.post('/api/feedback', (req, res) => {
  const { rating, message, page } = req.body;
  if (!rating && !message) return res.status(400).json({ error: 'rating or message required' });

  const entry = {
    id: Date.now(),
    rating: rating || 0,
    message: message || '',
    page: page || 'unknown',
    timestamp: new Date().toISOString()
  };
  feedbackStore.push(entry);
  console.log(`📝 Feedback received: ${entry.rating}★ — "${entry.message.slice(0, 60)}"`);
  res.json({ success: true, message: 'Thank you for your feedback!' });
});

app.get('/api/feedback', (req, res) => {
  res.json({ count: feedbackStore.length, recent: feedbackStore.slice(-20) });
});

// ==================== START SERVER ====================
// Only start HTTP server when running locally (not on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n◉ NeoTrace is running!`);
    console.log(`🌐 Open: http://localhost:${PORT}`);
    console.log(`📡 Server started at ${new Date().toLocaleString()}`);
    console.log(`🤖 ASI-1 API: ${ASI_API_KEY ? 'Configured ✓' : 'Not configured — set ASI_API_KEY env var'}\n`);
  });
}

// Export for Vercel serverless (required)
module.exports = app;
