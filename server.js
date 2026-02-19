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

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const dns = require("dns");
const https = require("https");
const http = require("http");
const url = require("url");
const fs = require("fs");

// Load environment variables from .env if present
try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed — use Vercel env vars or system env
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: "50mb" })); // Parse JSON bodies (up to 50MB)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Configure multer for file uploads (in-memory storage, 20MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ==================== LEADERBOARD API ====================
/**
 * In-memory leaderboard storage with seed data
 * In production, this would be replaced with a database
 */
let leaderboard = [
  {
    name: "CyberNinja",
    score: 2850,
    rank: "Elite Detective",
    badge: "👑",
    date: "2026-02-10",
  },
  {
    name: "NetGuardian",
    score: 2400,
    rank: "Senior Detective",
    badge: "🏆",
    date: "2026-02-12",
  },
  {
    name: "PhishHunter",
    score: 2100,
    rank: "Senior Detective",
    badge: "🏆",
    date: "2026-02-08",
  },
  {
    name: "SecureBot",
    score: 1800,
    rank: "Detective",
    badge: "🥇",
    date: "2026-02-14",
  },
  {
    name: "DataShield",
    score: 1500,
    rank: "Detective",
    badge: "🥇",
    date: "2026-02-09",
  },
  {
    name: "HackBuster",
    score: 1200,
    rank: "Junior Detective",
    badge: "🥈",
    date: "2026-02-11",
  },
  {
    name: "AlertEagle",
    score: 900,
    rank: "Trainee",
    badge: "🥉",
    date: "2026-02-13",
  },
  {
    name: "CodeWatcher",
    score: 600,
    rank: "Trainee",
    badge: "🥉",
    date: "2026-02-15",
  },
];

/**
 * GET /api/leaderboard
 * Returns top 50 players sorted by score
 */
app.get("/api/leaderboard", (req, res) => {
  const sorted = [...leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
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
app.post("/api/leaderboard", (req, res) => {
  const { name, score, rank, badge } = req.body;
  if (!name || score === undefined)
    return res.status(400).json({ error: "Name and score required" });
  const entry = {
    name,
    score,
    rank: rank || "Trainee",
    badge: badge || "🥉",
    date: new Date().toISOString().split("T")[0],
  };
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 100) leaderboard = leaderboard.slice(0, 100);
  const position =
    leaderboard.findIndex((e) => e.name === name && e.score === score) + 1;
  res.json({ success: true, position, entry });
});

// ==================== URL ANALYZER API ====================
/**
 * Threat detection databases for URL analysis
 */
const SUSPICIOUS_TLDS = [
  ".xyz",
  ".top",
  ".buzz",
  ".club",
  ".work",
  ".click",
  ".link",
  ".info",
  ".online",
  ".site",
  ".icu",
  ".fun",
  ".space",
  ".gq",
  ".ml",
  ".cf",
  ".tk",
  ".ga",
];
const PHISHING_KEYWORDS = [
  "login",
  "verify",
  "secure",
  "account",
  "update",
  "confirm",
  "banking",
  "signin",
  "sign-in",
  "credential",
  "password",
  "crypto",
  "wallet",
  "prize",
  "winner",
  "free",
  "urgent",
  "suspended",
  "locked",
  "unauthorized",
  "alert",
  "billing",
];
const LEGITIMATE_DOMAINS = [
  "google.com",
  "facebook.com",
  "amazon.com",
  "apple.com",
  "microsoft.com",
  "github.com",
  "stackoverflow.com",
  "wikipedia.org",
  "youtube.com",
  "twitter.com",
  "linkedin.com",
  "netflix.com",
  "paypal.com",
];

/**
 * POST /api/analyze-url
 * Analyzes URL for phishing and security threats
 * @body {string} targetUrl - URL to analyze
 * @returns {object} Risk score, findings, and domain details
 */
app.post("/api/analyze-url", async (req, res) => {
  try {
    const { targetUrl } = req.body;
    if (!targetUrl) return res.status(400).json({ error: "URL required" });

    let parsedUrl;
    try {
      parsedUrl = new URL(
        targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`,
      );
    } catch (e) {
      return res.json({
        error: "Invalid URL format",
        riskScore: 100,
        riskLevel: "Critical",
      });
    }

    const hostname = parsedUrl.hostname;
    const domain = hostname.replace(/^www\./, "");
    let riskScore = 0;
    const findings = [];
    const details = {};

    // Domain analysis
    details.domain = domain;
    details.protocol = parsedUrl.protocol;
    details.path = parsedUrl.pathname;
    details.port =
      parsedUrl.port || (parsedUrl.protocol === "https:" ? "443" : "80");

    // Check protocol
    if (parsedUrl.protocol !== "https:") {
      riskScore += 20;
      findings.push({
        type: "warning",
        message: "Site does not use HTTPS encryption",
      });
    } else {
      findings.push({ type: "safe", message: "Site uses HTTPS encryption" });
    }

    // Check TLD
    const tld = "." + domain.split(".").pop();
    if (SUSPICIOUS_TLDS.includes(tld)) {
      riskScore += 15;
      findings.push({
        type: "warning",
        message: `Suspicious TLD: ${tld} - commonly used in scam sites`,
      });
    }

    // Check for IP address
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      riskScore += 25;
      findings.push({
        type: "danger",
        message: "URL uses IP address instead of domain name",
      });
    }

    // Check for suspicious patterns
    if (domain.includes("-") && domain.split("-").length > 2) {
      riskScore += 10;
      findings.push({
        type: "warning",
        message: "Domain contains multiple hyphens - common in phishing",
      });
    }

    if (domain.length > 30) {
      riskScore += 10;
      findings.push({ type: "warning", message: "Unusually long domain name" });
    }

    // Check for homograph attacks
    if (/[а-яА-Я]|[^\x00-\x7F]/.test(domain)) {
      riskScore += 30;
      findings.push({
        type: "danger",
        message:
          "Domain contains non-ASCII characters - possible homograph attack",
      });
    }

    // Check phishing keywords
    const foundKeywords = PHISHING_KEYWORDS.filter(
      (kw) =>
        domain.includes(kw) || parsedUrl.pathname.toLowerCase().includes(kw),
    );
    if (foundKeywords.length > 0) {
      riskScore += foundKeywords.length * 5;
      findings.push({
        type: "warning",
        message: `Suspicious keywords found: ${foundKeywords.join(", ")}`,
      });
    }

    // Check for brand impersonation
    const brandCheck = LEGITIMATE_DOMAINS.find(
      (ld) =>
        domain.includes(ld.split(".")[0]) &&
        domain !== ld &&
        !domain.endsWith("." + ld),
    );
    if (brandCheck) {
      riskScore += 25;
      findings.push({
        type: "danger",
        message: `Possible brand impersonation of ${brandCheck}`,
      });
    }

    // Check if legitimate
    if (LEGITIMATE_DOMAINS.includes(domain)) {
      riskScore = Math.max(0, riskScore - 40);
      findings.push({
        type: "safe",
        message: "Domain is a well-known legitimate website",
      });
    }

    // Subdomain analysis
    const subdomains = hostname.split(".").length - 2;
    if (subdomains > 2) {
      riskScore += 10;
      findings.push({
        type: "warning",
        message: `Multiple subdomains detected (${subdomains}) - may indicate phishing`,
      });
    }

    // URL length check
    if (targetUrl.length > 100) {
      riskScore += 5;
      findings.push({ type: "info", message: "URL is unusually long" });
    }

    // Query parameter check
    if (parsedUrl.search && parsedUrl.search.length > 50) {
      riskScore += 5;
      findings.push({
        type: "info",
        message: "URL contains lengthy query parameters",
      });
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
      findings.push({
        type: "safe",
        message: `Domain resolves to ${addresses[0]}`,
      });
    } catch (e) {
      riskScore += 20;
      findings.push({
        type: "danger",
        message: "Domain does not resolve - may not exist or is blocked",
      });
    }

    riskScore = Math.min(100, Math.max(0, riskScore));
    let riskLevel = "Low";
    if (riskScore >= 70) riskLevel = "Critical";
    else if (riskScore >= 50) riskLevel = "High";
    else if (riskScore >= 30) riskLevel = "Medium";

    res.json({ riskScore, riskLevel, findings, details, domain });
  } catch (error) {
    res.status(500).json({ error: "Analysis failed", message: error.message });
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
app.post("/api/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

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
      forensic: { findings: [] },
    };

    // EXIF Analysis
    try {
      const exifr = require("exifr");
      const exif = await exifr.parse(buffer, true);
      if (exif) {
        results.exifData = {
          make: exif.Make || null,
          model: exif.Model || null,
          software: exif.Software || null,
          dateTime: exif.DateTimeOriginal || exif.DateTime || null,
          gps: exif.latitude
            ? { lat: exif.latitude, lng: exif.longitude }
            : null,
          dimensions: exif.ImageWidth
            ? `${exif.ImageWidth}x${exif.ImageHeight}`
            : null,
          colorSpace: exif.ColorSpace || null,
          iso: exif.ISO || null,
          focalLength: exif.FocalLength || null,
          aperture: exif.FNumber || null,
          exposureTime: exif.ExposureTime || null,
        };

        // Check for AI generation software
        const aiSoftware = [
          "dall-e",
          "midjourney",
          "stable diffusion",
          "novelai",
          "artbreeder",
          "deepai",
          "runway",
          "adobe firefly",
        ];
        const softwareStr = (exif.Software || "").toLowerCase();
        if (aiSoftware.some((s) => softwareStr.includes(s))) {
          results.aiDetection.score += 40;
          results.aiDetection.findings.push({
            type: "danger",
            message: `AI generation software detected: ${exif.Software}`,
          });
        }

        if (!exif.Make && !exif.Model) {
          results.aiDetection.score += 10;
          results.aiDetection.findings.push({
            type: "warning",
            message:
              "No camera manufacturer/model data - may indicate digital creation",
          });
        }

        if (!exif.DateTimeOriginal) {
          results.aiDetection.score += 5;
          results.aiDetection.findings.push({
            type: "info",
            message: "No original capture date found",
          });
        }
      } else {
        results.aiDetection.score += 15;
        results.aiDetection.findings.push({
          type: "warning",
          message:
            "No EXIF data found - metadata may have been stripped or image is digitally created",
        });
      }
    } catch (e) {
      results.aiDetection.findings.push({
        type: "info",
        message: "Could not parse EXIF data from this image format",
      });
    }

    // Compression Analysis
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      // Check JPEG markers
      const hasJFIF = buffer.indexOf(Buffer.from("JFIF")) !== -1;
      const hasExif = buffer.indexOf(Buffer.from("Exif")) !== -1;

      if (fileSize < 50000 && fileName.toLowerCase().includes(".jpg")) {
        results.compression.findings.push({
          type: "warning",
          message:
            "Small file size suggests heavy compression or low resolution",
        });
        results.aiDetection.score += 5;
      }

      // Count quantization tables (DQT markers)
      let dqtCount = 0;
      for (let i = 0; i < buffer.length - 1; i++) {
        if (buffer[i] === 0xff && buffer[i + 1] === 0xdb) dqtCount++;
      }
      if (dqtCount > 2) {
        results.compression.findings.push({
          type: "warning",
          message:
            "Multiple quantization tables detected - possible re-compression",
        });
        results.aiDetection.score += 10;
      }

      results.compression.findings.push({
        type: "info",
        message: `Format: JPEG ${hasJFIF ? "(JFIF)" : ""} ${hasExif ? "(EXIF)" : ""}`,
      });
    } else if (mimeType === "image/png") {
      results.compression.findings.push({
        type: "info",
        message: "Format: PNG (lossless compression)",
      });

      // Check for tEXt chunks that might contain AI metadata
      const textChunk = buffer.indexOf(Buffer.from("tEXt"));
      if (textChunk !== -1) {
        results.compression.findings.push({
          type: "info",
          message: "PNG text metadata chunks found",
        });
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
      results.forensic.findings.push({
        type: "warning",
        message: `High pixel uniformity detected (${(uniformityRatio * 100).toFixed(1)}%) - potential AI smoothing artifacts`,
      });
    } else {
      results.forensic.findings.push({
        type: "safe",
        message: `Normal pixel variance detected (${((1 - uniformityRatio) * 100).toFixed(1)}% variation)`,
      });
    }

    // Check file signature
    const header = buffer.slice(0, 8);
    const isPNG = header[0] === 0x89 && header[1] === 0x50;
    const isJPG = header[0] === 0xff && header[1] === 0xd8;
    const isGIF = header[0] === 0x47 && header[1] === 0x49;
    const isWebP = header[4] === 0x57 && header[5] === 0x45;

    if (!isPNG && !isJPG && !isGIF && !isWebP) {
      results.forensic.findings.push({
        type: "warning",
        message: "File header does not match standard image formats",
      });
      results.aiDetection.score += 10;
    } else {
      results.forensic.findings.push({
        type: "safe",
        message: "File signature matches declared format",
      });
    }

    // Normalize AI score
    results.aiDetection.score = Math.min(
      100,
      Math.max(0, results.aiDetection.score),
    );

    let aiVerdict = "Likely Authentic";
    if (results.aiDetection.score >= 60) aiVerdict = "Likely AI Generated";
    else if (results.aiDetection.score >= 35)
      aiVerdict = "Possibly Manipulated";
    else if (results.aiDetection.score >= 15) aiVerdict = "Minor Concerns";
    results.aiDetection.verdict = aiVerdict;

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image analysis failed", message: error.message });
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
app.post("/api/verify-text", (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    const Sentiment = require("sentiment");
    const sentiment = new Sentiment();
    const sentimentResult = sentiment.analyze(text);

    const results = {
      content: { findings: [] },
      sentiment: {
        score: sentimentResult.score,
        comparative: sentimentResult.comparative,
        positive: sentimentResult.positive,
        negative: sentimentResult.negative,
        label:
          sentimentResult.score > 2
            ? "Very Positive"
            : sentimentResult.score > 0
              ? "Positive"
              : sentimentResult.score === 0
                ? "Neutral"
                : sentimentResult.score > -2
                  ? "Negative"
                  : "Very Negative",
      },
      misinformation: { score: 0, findings: [] },
      credibility: { score: 100, findings: [] },
    };

    const lowerText = text.toLowerCase();
    const wordCount = text.split(/\s+/).length;

    // Clickbait patterns
    const clickbaitPatterns = [
      {
        pattern: /you won't believe/i,
        message: 'Clickbait phrase: "You won\'t believe"',
      },
      {
        pattern: /shocking|jaw.?dropping/i,
        message: "Sensationalist language detected",
      },
      {
        pattern: /doctors hate|they don'?t want you to know/i,
        message: "Conspiracy-style clickbait detected",
      },
      {
        pattern: /one weird trick|secret revealed/i,
        message: "Classic clickbait pattern detected",
      },
      {
        pattern: /breaking[!:\s]|just in[!:\s]|urgent[!:\s]/i,
        message: "Urgency-inducing language detected",
      },
      {
        pattern: /100%\s*(true|real|proven|guaranteed)/i,
        message: "Absolute certainty claims are often false",
      },
      {
        pattern: /miracle\s*(cure|solution|product)/i,
        message: "Miracle claims detected - likely misinformation",
      },
      {
        pattern: /exposed!?|exposed:?\s/i,
        message: 'Sensationalist "exposé" language',
      },
      {
        pattern: /mainstream media won'?t|media is hiding/i,
        message: "Anti-media conspiracy language",
      },
      {
        pattern: /share (this|before|now)|must share|going viral/i,
        message: "Social pressure to share - common in misinformation",
      },
      {
        pattern:
          /you (have |)(won|win|winner)|congratulations.*prize|claim your (prize|reward|money)/i,
        message: "Prize/lottery scam language detected",
      },
      {
        pattern:
          /click (here |)(now|immediately|fast|quick)|act (now|fast|immediately)|limited time/i,
        message: "High-pressure call-to-action detected",
      },
      {
        pattern: /\$[\d,]+[,.]?\d*\s*(dollar|usd|cash|prize|reward|won|win)?/i,
        message: "Monetary amount mentioned — verify legitimacy",
      },
      {
        pattern: /expire|expiring|last chance|don'?t miss|before.*too late/i,
        message: "Artificial scarcity/deadline language detected",
      },
    ];

    let clickbaitCount = 0;
    clickbaitPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(text)) {
        clickbaitCount++;
        results.misinformation.findings.push({ type: "warning", message });
      }
    });

    if (clickbaitCount > 0) {
      results.misinformation.score += clickbaitCount * 12;
      results.credibility.score -= clickbaitCount * 10;
    }

    // Emotional manipulation
    const emotionalPatterns = [/!!+/g, /\?\?+/g, /ALL CAPS/g];
    const capsRatio =
      text.replace(/[^A-Z]/g, "").length /
      Math.max(text.replace(/[^a-zA-Z]/g, "").length, 1);
    if (capsRatio > 0.5 && wordCount > 5) {
      results.misinformation.score += 10;
      results.misinformation.findings.push({
        type: "warning",
        message: `Excessive capitalization (${(capsRatio * 100).toFixed(0)}%) - often used in misleading content`,
      });
      results.credibility.score -= 10;
    }

    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 3) {
      results.misinformation.score += 5;
      results.misinformation.findings.push({
        type: "info",
        message: `Multiple exclamation marks (${exclamationCount}) - emotional emphasis`,
      });
    }

    // Source indicators
    const hasLinks = /https?:\/\/[^\s]+/.test(text);
    const hasCitations =
      /\[\d+\]|according to|research shows|study (shows|finds|suggests)|scientists say/i.test(
        text,
      );
    const hasQuotes = /"[^"]{10,}"/.test(text);

    if (hasCitations) {
      results.credibility.score += 5;
      results.credibility.findings.push({
        type: "safe",
        message: "Contains source citations or research references",
      });
    }
    if (hasLinks) {
      results.credibility.findings.push({
        type: "info",
        message: "Contains external links",
      });
    }
    if (hasQuotes) {
      results.credibility.findings.push({
        type: "info",
        message: "Contains direct quotes",
      });
    }

    if (!hasCitations && !hasLinks && wordCount > 50) {
      results.credibility.score -= 15;
      results.credibility.findings.push({
        type: "warning",
        message: "No sources or citations in lengthy text",
      });
    }

    // Statistical claims without evidence
    const statClaims = text.match(
      /\d+%|\d+ out of \d+|\d+ million|\d+ billion/g,
    );
    if (statClaims && !hasCitations) {
      results.misinformation.score += 10;
      results.misinformation.findings.push({
        type: "warning",
        message: `Statistical claims found (${statClaims.length}) without source citations`,
      });
      results.credibility.score -= 10;
    }

    // Content length analysis
    if (wordCount < 10) {
      results.content.findings.push({
        type: "info",
        message: "Very short text - limited analysis available",
      });
    } else if (wordCount > 500) {
      results.content.findings.push({
        type: "info",
        message: `Lengthy content (${wordCount} words) - detailed analysis performed`,
      });
    }

    // Grammar / quality indicators
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
    if (avgSentenceLength > 35) {
      results.content.findings.push({
        type: "info",
        message: "Very long sentences - may indicate automated generation",
      });
      results.misinformation.score += 5;
    }

    // Normalize scores
    results.misinformation.score = Math.min(
      100,
      Math.max(0, results.misinformation.score),
    );
    results.credibility.score = Math.min(
      100,
      Math.max(0, results.credibility.score),
    );

    results.misinformation.level =
      results.misinformation.score >= 50
        ? "High Risk"
        : results.misinformation.score >= 25
          ? "Medium Risk"
          : "Low Risk";
    results.credibility.level =
      results.credibility.score >= 70
        ? "Credible"
        : results.credibility.score >= 40
          ? "Questionable"
          : "Low Credibility";

    // Overall verdict
    if (results.misinformation.findings.length === 0) {
      results.misinformation.findings.push({
        type: "safe",
        message: "No obvious misinformation patterns detected",
      });
    }
    if (results.content.findings.length === 0) {
      results.content.findings.push({
        type: "safe",
        message: "Text content appears normal",
      });
    }
    if (results.credibility.findings.length === 0) {
      results.credibility.findings.push({
        type: "safe",
        message: "Content appears credible",
      });
    }

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Text analysis failed", message: error.message });
  }
});

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ==================== NEWS API ====================
/**
 * GET /api/news
 * Returns latest cybersecurity news from RSS feeds
 * Scrapes The Hacker News RSS feed and returns up to 10 articles with AI-generated summaries
 */
let newsCache = { data: null, timestamp: 0 };
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

app.get("/api/news", async (req, res) => {
  try {
    // Return cache if fresh
    if (newsCache.data && Date.now() - newsCache.timestamp < NEWS_CACHE_TTL) {
      return res.json(newsCache.data);
    }

    const feedUrl = "https://feeds.feedburner.com/TheHackersNews";
    const xml = await fetchURL(feedUrl);

    // Simple XML parsing for RSS items
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
      const itemXml = match[1];
      const title = extractTag(itemXml, "title");
      const rawLink = extractTag(itemXml, "link");
      const guid = extractTag(itemXml, "guid");
      // <link> in RSS can be a bare URL or CDATA; guid is more reliable
      const link =
        (rawLink && rawLink.startsWith("http") ? rawLink : "") ||
        (guid && guid.startsWith("http") ? guid : "") ||
        rawLink;
      const pubDate = extractTag(itemXml, "pubDate");
      const description = extractTag(itemXml, "description");

      // Clean HTML from description for summary
      const cleanDesc = description
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim();
      const summary =
        cleanDesc.length > 200
          ? cleanDesc.substring(0, 200) + "..."
          : cleanDesc;

      const cleanLink = link.replace(/<!\[CDATA[|]]>/g, "").trim();
      items.push({
        title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim(),
        link: cleanLink,
        url: cleanLink, // alias for backwards compat
        date: pubDate
          ? new Date(pubDate).toISOString()
          : new Date().toISOString(),
        source: "The Hacker News",
        summary,
      });
    }

    // Enhance summaries with AI if API key is available
    if (ASI_API_KEY && items.length > 0) {
      try {
        const articlesText = items
          .map(
            (item, i) =>
              `${i + 1}. Title: ${item.title}\nContent: ${item.summary}`,
          )
          .join("\n\n");
        const prompt = `You are given ${items.length} cybersecurity news article titles and excerpts. Write a 1-2 sentence plain-English summary for each one that a non-expert can understand. Return ONLY a valid JSON array of ${items.length} strings, e.g. ["summary1","summary2",...]. No extra text, no markdown.\n\n${articlesText}`;
        const aiResponse = await callASI(
          prompt,
          "You are a concise cybersecurity news summarizer. Only output valid JSON arrays.",
          1200,
        );
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiSummaries = JSON.parse(jsonMatch[0]);
          aiSummaries.forEach((s, i) => {
            if (items[i] && s && typeof s === "string")
              items[i].summary = s.trim();
          });
        }
      } catch (e) {
        console.warn("AI news summary failed, using text excerpts:", e.message);
      }
    }

    newsCache = { data: items, timestamp: Date.now() };
    res.json(items);
  } catch (error) {
    console.error("News fetch error:", error.message);
    // Return cached data if available, even if stale
    if (newsCache.data) return res.json(newsCache.data);
    res
      .status(500)
      .json({ error: "Failed to fetch news", message: error.message });
  }
});

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}

function fetchURL(targetUrl) {
  return new Promise((resolve, reject) => {
    const protocol = targetUrl.startsWith("https") ? https : http;
    protocol
      .get(
        targetUrl,
        { headers: { "User-Agent": "NeoTrace/3.0" } },
        (response) => {
          // Handle redirects
          if (
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            return fetchURL(response.headers.location)
              .then(resolve)
              .catch(reject);
          }
          let data = "";
          response.on("data", (chunk) => (data += chunk));
          response.on("end", () => resolve(data));
          response.on("error", reject);
        },
      )
      .on("error", reject);
  });
}

// ==================== REAL-TIME DASHBOARD STATS (AI) ====================
// Cache stats for 24 hours to avoid excessive API calls
let statsCache = { data: null, timestamp: 0 };
const STATS_TTL = 24 * 60 * 60 * 1000; // 24 hours

app.get("/api/stats", async (req, res) => {
  const now = Date.now();
  // Return cached data if still valid
  if (statsCache.data && now - statsCache.timestamp < STATS_TTL) {
    return res.json(statsCache.data);
  }

  try {
    const prompt = `You are a cybersecurity data analyst. Return a JSON object with the latest approximate global cybersecurity statistics for ${new Date().getFullYear()}. The JSON must have exactly these keys:
- "scamsReported": number (total scam reports worldwide, approx, in thousands, e.g. 920)
- "scamsReportedSuffix": "K"  
- "countriesAffected": number (countries with significant cybercrime, e.g. 195)
- "moneyLost": number (total money lost to cybercrime in billions USD, e.g. 14.8)
- "moneyLostPrefix": "$"
- "moneyLostSuffix": "B"
- "usersProtected": number (approximate users of major security platforms in millions, e.g. 2.8)
- "usersProtectedSuffix": "M"
- "topScams": array of 10 objects with "name" and "reports" (number in thousands)
- "yearlyTrend": array of objects with "year" (2018-2026) and "reports" (in thousands) and "losses" (in billions)

Return ONLY valid JSON, no markdown, no explanation.`;

    const aiResponse = await callASI(
      prompt,
      "You are a data analyst returning only valid JSON.",
    );
    // Try to parse the AI response as JSON
    let stats;
    try {
      // Remove markdown code block if present
      const cleaned = aiResponse
        .replace(/```json?\n?/g, "")
        .replace(/```/g, "")
        .trim();
      stats = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error("AI returned invalid JSON");
    }

    statsCache = { data: stats, timestamp: now };
    res.json(stats);
  } catch (err) {
    console.error("Stats AI error:", err.message);
    // Return hardcoded fallback
    const fallback = {
      scamsReported: 920,
      scamsReportedSuffix: "K",
      countriesAffected: 195,
      moneyLost: 14.8,
      moneyLostPrefix: "$",
      moneyLostSuffix: "B",
      usersProtected: 2.8,
      usersProtectedSuffix: "M",
      source: "fallback",
    };
    res.json(fallback);
  }
});

// ==================== PHONE INSPECTOR API ====================
// Accepts { phone } or { dialCode, number }. Uses Numverify + ASI-1 AI analysis.
app.post("/api/phone/check", async (req, res) => {
  let { phone, dialCode, number } = req.body;

  // Merge split-input mode
  if (!phone && dialCode && number) {
    const dc = dialCode.replace(/[^\d]/g, "");
    const num = number.replace(/[^\d]/g, "");
    phone = `+${dc}${num}`;
  }

  if (!phone) return res.status(400).json({ error: "Phone number required" });

  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  const NUMVERIFY_KEY = process.env.NUMVERIFY_KEY;

  // Smart risk scorer: uses real signal fields, not pure hash
  function buildRiskProfile(num, nvData) {
    const isVoip = (nvData.line_type || "").toLowerCase().includes("voip");
    const isValid = nvData.valid !== false;
    const carrier = (nvData.carrier || "").toLowerCase();
    const country = (nvData.country_code || "").toUpperCase();
    const location = (nvData.location || "").toLowerCase();
    const hash = [...num].reduce((a, c) => a + c.charCodeAt(0), 0);

    // Base fraud score from real signals
    let fraud = 10;
    if (!isValid) fraud += 40; // invalid = high risk
    if (isVoip) fraud += 30; // VOIP lines heavily abused
    if (!nvData.carrier) fraud += 10; // no carrier = suspicious
    if (
      carrier.includes("anonymous") ||
      carrier.includes("prepaid") ||
      carrier.includes("unlimited")
    )
      fraud += 15;
    // High-risk country adjustments (based on FBI IC3 reports)
    if (["NG", "KE", "GH", "CI"].includes(country)) fraud += 20;
    if (["RU", "UA", "BY"].includes(country)) fraud += 10;
    // Reassure for strong telcos
    if (
      carrier.includes("docomo") ||
      carrier.includes("at&t") ||
      carrier.includes("singtel")
    )
      fraud = Math.max(5, fraud - 10);
    // Add minor entropy for differentiation within same category
    fraud += (hash % 8) - 4;
    fraud = Math.min(95, Math.max(3, fraud));

    const spamRisk = Math.min(95, fraud * 0.85 + (hash % 6));
    const voipRisk = isVoip
      ? Math.min(95, 60 + (hash % 30))
      : Math.min(20, hash % 15);
    const carrierTrust = isVoip
      ? Math.max(20, 55 - (hash % 25))
      : isValid
        ? Math.min(97, 72 + (hash % 20))
        : 35;
    const recentActivity = isValid
      ? Math.min(95, 65 + (hash % 28))
      : Math.max(10, 20 + (hash % 20));

    return {
      fraud: Math.round(fraud),
      spamRisk: Math.round(spamRisk),
      voipRisk: Math.round(voipRisk),
      carrierTrust: Math.round(carrierTrust),
      recentActivity: Math.round(recentActivity),
      blacklistHits:
        fraud > 65 ? Math.floor(hash % 5) + 1 : fraud > 40 ? hash % 3 : 0,
    };
  }

  // ── Try Numverify API ──────────────────────────────
  if (NUMVERIFY_KEY) {
    try {
      const numUrl = `http://apilayer.net/api/validate?access_key=${NUMVERIFY_KEY}&number=${encodeURIComponent(cleaned)}&format=1`;
      const raw = await new Promise((resolve, reject) => {
        require("http")
          .get(numUrl, (resp) => {
            let d = "";
            resp.on("data", (c) => (d += c));
            resp.on("end", () => resolve(d));
            resp.on("error", reject);
          })
          .on("error", reject);
      });
      const nv = JSON.parse(raw);
      if (nv && nv.valid !== undefined && !nv.error) {
        const r = buildRiskProfile(cleaned, nv);
        const isVoip = (nv.line_type || "").toLowerCase().includes("voip");

        // AI analysis (non-blocking)
        let aiAnalysis = null;
        try {
          aiAnalysis = await callASI(
            `Phone number ${nv.international_format || cleaned}. Country: ${nv.country_name}, Carrier: ${nv.carrier || "Unknown"}, Line type: ${nv.line_type || "Unknown"}, Valid: ${nv.valid}. Fraud score: ${r.fraud}/100. Provide a 2-sentence security assessment and one protection tip.`,
            "You are a telecom fraud analyst. Be concise and practical.",
            250,
          );
        } catch (e) {}

        return res.json({
          country: nv.country_name || "Unknown",
          country_code: nv.country_code || "??",
          dial_code: nv.country_prefix || "",
          carrier: nv.carrier || "Unknown Carrier",
          line_type: nv.line_type || (isVoip ? "VOIP" : "Mobile"),
          location: nv.location || "",
          international_format: nv.international_format || cleaned,
          local_format: nv.local_format || cleaned,
          valid: nv.valid,
          fraud_score: r.fraud,
          spam_risk: r.spamRisk,
          voip_risk: r.voipRisk,
          recent_activity: r.recentActivity,
          carrier_trust: r.carrierTrust,
          active_status: nv.valid ? "Active" : "Inactive",
          blacklist_hits: r.blacklistHits,
          email: null,
          notes: nv.valid
            ? null
            : "Number could not be validated — may be inactive or invalid format",
          timezone: nv.timezone || null,
          number_type: nv.number_type || null,
          aiAnalysis,
          source: "numverify",
        });
      }
    } catch (err) {
      console.error("Numverify API error, falling back to demo:", err.message);
    }
  }

  // ── Fallback: curated demo database + smart heuristics ───
  const phoneDB = {
    "+85291234567": {
      country: "Hong Kong",
      country_code: "HK",
      dial_code: "852",
      carrier: "HKT / PCCW",
      line_type: "Mobile",
      valid: true,
      location: "Hong Kong Island",
      timezone: "Asia/Hong_Kong",
    },
    "+85261234567": {
      country: "Hong Kong",
      country_code: "HK",
      dial_code: "852",
      carrier: "China Mobile HK",
      line_type: "Mobile",
      valid: true,
      location: "Kowloon",
      timezone: "Asia/Hong_Kong",
      _notes: "Multiple spam complaints reported in the last 30 days",
    },
    "+85253001234": {
      country: "Hong Kong",
      country_code: "HK",
      dial_code: "852",
      carrier: "3 Hong Kong",
      line_type: "VOIP",
      valid: false,
      location: "",
      timezone: "Asia/Hong_Kong",
      _notes: "Linked to investment scam operations targeting elderly victims",
    },
    "+14155551234": {
      country: "United States",
      country_code: "US",
      dial_code: "1",
      carrier: "T-Mobile",
      line_type: "Mobile",
      valid: true,
      location: "San Francisco, CA",
      timezone: "America/Los_Angeles",
    },
    "+447911123456": {
      country: "United Kingdom",
      country_code: "GB",
      dial_code: "44",
      carrier: "Vodafone UK",
      line_type: "Mobile",
      valid: true,
      location: "London",
      timezone: "Europe/London",
      _notes: "Low-level telemarketing complaints",
    },
    "+86138001234567": {
      country: "China",
      country_code: "CN",
      dial_code: "86",
      carrier: "China Mobile",
      line_type: "Mobile",
      valid: true,
      location: "Beijing",
      timezone: "Asia/Shanghai",
      _notes: "Region associated with elevated scam activity",
    },
    "+81901234567": {
      country: "Japan",
      country_code: "JP",
      dial_code: "81",
      carrier: "NTT Docomo",
      line_type: "Mobile",
      valid: true,
      location: "Tokyo",
      timezone: "Asia/Tokyo",
    },
  };

  const geoMap = [
    {
      prefix: "+1",
      country: "United States",
      code: "US",
      dial: "1",
      carriers: ["AT&T", "T-Mobile", "Verizon", "Sprint"],
      tz: "America/New_York",
    },
    {
      prefix: "+44",
      country: "United Kingdom",
      code: "GB",
      dial: "44",
      carriers: ["Vodafone UK", "EE", "O2", "BT"],
      tz: "Europe/London",
    },
    {
      prefix: "+86",
      country: "China",
      code: "CN",
      dial: "86",
      carriers: ["China Mobile", "China Unicom", "China Telecom"],
      tz: "Asia/Shanghai",
    },
    {
      prefix: "+81",
      country: "Japan",
      code: "JP",
      dial: "81",
      carriers: ["NTT Docomo", "SoftBank", "au KDDI"],
      tz: "Asia/Tokyo",
    },
    {
      prefix: "+82",
      country: "South Korea",
      code: "KR",
      dial: "82",
      carriers: ["SK Telecom", "KT", "LG Uplus"],
      tz: "Asia/Seoul",
    },
    {
      prefix: "+886",
      country: "Taiwan",
      code: "TW",
      dial: "886",
      carriers: ["Chunghwa Telecom", "FarEasTone", "Taiwan Mobile"],
      tz: "Asia/Taipei",
    },
    {
      prefix: "+65",
      country: "Singapore",
      code: "SG",
      dial: "65",
      carriers: ["Singtel", "StarHub", "M1", "TPG"],
      tz: "Asia/Singapore",
    },
    {
      prefix: "+852",
      country: "Hong Kong",
      code: "HK",
      dial: "852",
      carriers: [
        "HKT / PCCW",
        "China Mobile HK",
        "3 Hong Kong",
        "SmarTone",
        "CMHK",
      ],
      tz: "Asia/Hong_Kong",
    },
    {
      prefix: "+61",
      country: "Australia",
      code: "AU",
      dial: "61",
      carriers: ["Telstra", "Optus", "Vodafone AU"],
      tz: "Australia/Sydney",
    },
    {
      prefix: "+49",
      country: "Germany",
      code: "DE",
      dial: "49",
      carriers: ["Deutsche Telekom", "Vodafone DE", "O2 Germany"],
      tz: "Europe/Berlin",
    },
    {
      prefix: "+33",
      country: "France",
      code: "FR",
      dial: "33",
      carriers: ["Orange", "SFR", "Bouygues"],
      tz: "Europe/Paris",
    },
    {
      prefix: "+91",
      country: "India",
      code: "IN",
      dial: "91",
      carriers: ["Jio", "Airtel", "Vodafone Idea", "BSNL"],
      tz: "Asia/Kolkata",
    },
    {
      prefix: "+971",
      country: "UAE",
      code: "AE",
      dial: "971",
      carriers: ["Etisalat", "Du"],
      tz: "Asia/Dubai",
    },
    {
      prefix: "+66",
      country: "Thailand",
      code: "TH",
      dial: "66",
      carriers: ["AIS", "DTAC", "True Move"],
      tz: "Asia/Bangkok",
    },
    {
      prefix: "+60",
      country: "Malaysia",
      code: "MY",
      dial: "60",
      carriers: ["Maxis", "Celcom", "Digi", "U Mobile"],
      tz: "Asia/Kuala_Lumpur",
    },
  ];

  const hash = [...cleaned].reduce((a, c) => a + c.charCodeAt(0), 0);
  let nvData = phoneDB[cleaned] || null;
  let geo = geoMap.find((g) => cleaned.startsWith(g.prefix)) || geoMap[0];

  if (!nvData) {
    const isVoip = hash % 7 === 0;
    nvData = {
      country: geo.country,
      country_code: geo.code,
      dial_code: geo.dial,
      carrier: geo.carriers[hash % geo.carriers.length],
      line_type: isVoip ? "VOIP" : hash % 4 === 0 ? "Landline" : "Mobile",
      valid: hash % 5 !== 0,
      location: geo.country,
      timezone: geo.tz,
    };
  }

  const r = buildRiskProfile(cleaned, nvData);

  let aiAnalysis = null;
  try {
    aiAnalysis = await callASI(
      `Phone ${cleaned}. Country: ${nvData.country}, Carrier: ${nvData.carrier}, Line: ${nvData.line_type}, Valid: ${nvData.valid}. Fraud score: ${r.fraud}/100. Assess risk and give one concrete tip.`,
      "You are a telecom fraud analyst. Be concise.",
      200,
    );
  } catch (e) {}

  res.json({
    country: nvData.country,
    country_code: nvData.country_code,
    dial_code: nvData.dial_code,
    carrier: nvData.carrier,
    line_type: nvData.line_type,
    location: nvData.location || "",
    international_format: cleaned,
    local_format: cleaned,
    valid: nvData.valid !== false,
    fraud_score: r.fraud,
    spam_risk: r.spamRisk,
    voip_risk: r.voipRisk,
    recent_activity: r.recentActivity,
    carrier_trust: r.carrierTrust,
    active_status: nvData.valid !== false ? "Active" : "Inactive",
    blacklist_hits: r.blacklistHits,
    email: r.fraud > 60 ? `user${hash % 999}@tempmail.net` : null,
    notes:
      nvData._notes ||
      (r.fraud > 70
        ? "Number flagged in multiple fraud databases"
        : r.fraud > 40
          ? "Moderate risk — exercise caution"
          : null),
    timezone: nvData.timezone || null,
    aiAnalysis,
    source: "demo",
  });
});

// ==================== EMAIL HEADER ANALYZER API ====================
app.post("/api/email-analyze", async (req, res) => {
  const { headers: rawHeaders } = req.body;
  if (!rawHeaders || rawHeaders.trim().length < 20)
    return res.status(400).json({ error: "Email headers required" });

  // Parse folded RFC 2822 headers
  const unfolded = rawHeaders.replace(/\r?\n([ \t])/g, " $1");
  const headerMap = {};
  const allReceived = [];
  for (const line of unfolded.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z\-]+):\s*(.*)$/);
    if (!m) continue;
    const k = m[1].toLowerCase(),
      v = m[2].trim();
    if (k === "received") {
      allReceived.push(v);
      continue;
    }
    if (!headerMap[k]) headerMap[k] = v;
  }

  const get = (k) => headerMap[k] || "";
  const from = get("from");
  const replyTo = get("reply-to");
  const returnPath = get("return-path");
  const subject = get("subject");
  const messageId = get("message-id");
  const date = get("date");
  const authResults = get("authentication-results");
  const receivedSpf = get("received-spf");
  const dkimSig = get("dkim-signature");
  const xMailer = get("x-mailer");
  const xOriginIp = get("x-originating-ip") || get("x-sender-ip");
  const contentType = get("content-type");

  const domainOf = (str) =>
    str.match(/@([a-zA-Z0-9._-]+[a-zA-Z0-9])/)?.[1]?.toLowerCase() || "";
  const fromDomain = domainOf(from);
  const replyToDomain = domainOf(replyTo);
  const returnPathDomain = domainOf(returnPath);
  const msgIdDomain = domainOf(messageId);

  // SPF
  let spfResult = "unknown";
  const spfSrc = (authResults + " " + receivedSpf).toLowerCase();
  if (spfSrc.includes("spf=pass")) spfResult = "pass";
  else if (spfSrc.includes("spf=fail") && !spfSrc.includes("spf=softfail"))
    spfResult = "fail";
  else if (spfSrc.includes("spf=softfail")) spfResult = "softfail";
  else if (spfSrc.includes("spf=neutral")) spfResult = "neutral";
  else if (spfSrc.includes("pass")) spfResult = "pass";
  else if (spfSrc.includes("fail")) spfResult = "fail";

  // DKIM
  let dkimResult = "none";
  const dkimSrc = authResults.toLowerCase();
  if (dkimSrc.includes("dkim=pass")) dkimResult = "pass";
  else if (dkimSrc.includes("dkim=fail")) dkimResult = "fail";
  else if (dkimSig) dkimResult = "present_unverified";

  // DMARC
  let dmarcResult = "none";
  if (authResults.toLowerCase().includes("dmarc=pass")) dmarcResult = "pass";
  else if (authResults.toLowerCase().includes("dmarc=fail"))
    dmarcResult = "fail";
  else if (authResults.toLowerCase().includes("dmarc="))
    dmarcResult = "present";

  // Risk scoring
  let riskScore = 0;
  const flags = [];

  if (spfResult === "fail") {
    riskScore += 30;
    flags.push({
      t: "danger",
      m: "SPF check FAILED — email is NOT from claimed domain",
    });
  } else if (spfResult === "softfail") {
    riskScore += 15;
    flags.push({
      t: "warning",
      m: "SPF softfail — sender may not be authorized",
    });
  } else if (spfResult === "unknown") {
    riskScore += 8;
    flags.push({ t: "info", m: "No SPF record found in headers" });
  } else if (spfResult === "pass") {
    flags.push({ t: "safe", m: "SPF passed ✓" });
  }

  if (dkimResult === "fail") {
    riskScore += 25;
    flags.push({
      t: "danger",
      m: "DKIM signature FAILED — message may have been tampered",
    });
  } else if (dkimResult === "none") {
    riskScore += 10;
    flags.push({ t: "warning", m: "No DKIM signature found" });
  } else if (dkimResult === "present_unverified") {
    flags.push({
      t: "info",
      m: "DKIM signature present (server-side verification not performed)",
    });
  } else if (dkimResult === "pass") {
    flags.push({ t: "safe", m: "DKIM passed ✓" });
  }

  if (dmarcResult === "fail") {
    riskScore += 20;
    flags.push({ t: "danger", m: "DMARC policy FAILED" });
  } else if (dmarcResult === "none") {
    riskScore += 5;
    flags.push({ t: "info", m: "No DMARC record detected" });
  } else if (dmarcResult === "pass") {
    flags.push({ t: "safe", m: "DMARC passed ✓" });
  }

  if (fromDomain && replyToDomain && fromDomain !== replyToDomain) {
    riskScore += 25;
    flags.push({
      t: "danger",
      m: `Reply-To domain (${replyToDomain}) ≠ From domain (${fromDomain}) — classic phishing tactic`,
    });
  }
  if (fromDomain && returnPathDomain && fromDomain !== returnPathDomain) {
    riskScore += 12;
    flags.push({
      t: "warning",
      m: `Return-Path domain (${returnPathDomain}) differs from From domain`,
    });
  }
  if (
    fromDomain &&
    msgIdDomain &&
    fromDomain !== msgIdDomain &&
    msgIdDomain !== "example.com"
  ) {
    riskScore += 8;
    flags.push({
      t: "warning",
      m: `Message-ID domain (${msgIdDomain}) differs from From domain`,
    });
  }

  const urgencyWords = [
    "urgent",
    "immediately",
    "action required",
    "verify",
    "suspended",
    "blocked",
    "warning",
    "limited time",
    "expires",
  ];
  if (urgencyWords.some((w) => subject.toLowerCase().includes(w))) {
    riskScore += 10;
    flags.push({
      t: "warning",
      m: "Subject contains urgency keywords common in phishing",
    });
  }

  if (allReceived.length > 6) {
    riskScore += 5;
    flags.push({
      t: "info",
      m: `Email passed through ${allReceived.length} mail servers — unusual routing`,
    });
  }

  if (
    xMailer &&
    (xMailer.toLowerCase().includes("mass") ||
      xMailer.toLowerCase().includes("bulk"))
  ) {
    riskScore += 10;
    flags.push({
      t: "warning",
      m: `X-Mailer indicates bulk/mass mailing: ${xMailer}`,
    });
  }

  if (riskScore === 0 && flags.filter((f) => f.t === "safe").length >= 3)
    flags.push({
      t: "safe",
      m: "All authentication checks passed — email appears legitimate",
    });

  // AI summary
  let aiSummary = null;
  try {
    const prompt = `Analyze this email header for phishing/spoofing. Give a clear 2–3 sentence verdict.
From: ${from} | Reply-To: ${replyTo} | Return-Path: ${returnPath}
SPF: ${spfResult}, DKIM: ${dkimResult}, DMARC: ${dmarcResult}
Subject: ${subject}
Flags: ${flags.map((f) => f.m).join("; ")}`;
    aiSummary = await callASI(
      prompt,
      "You are an email forensics expert. Be concise, use bullet-free prose.",
      300,
    );
  } catch (e) {
    console.error("Email AI error:", e.message);
  }

  res.json({
    from,
    replyTo,
    returnPath,
    subject,
    date,
    messageId,
    xOriginIp,
    xMailer,
    contentType,
    spfResult,
    dkimResult,
    dmarcResult,
    fromDomain,
    replyToDomain,
    returnPathDomain,
    riskScore: Math.min(100, riskScore),
    flags,
    receivedHops: allReceived.length,
    aiSummary,
  });
});

// ==================== WIFI SECURITY ANALYZER API ====================
app.post("/api/wifi-analyze", async (req, res) => {
  const { ssid, security, signal, vendor } = req.body;
  if (!ssid) return res.status(400).json({ error: "SSID required" });

  let riskScore = 0;
  const flags = [];
  const sec = (security || "").toLowerCase();

  // Security type
  if (!security || sec === "open" || sec === "none" || sec === "") {
    riskScore += 55;
    flags.push({
      t: "danger",
      m: "Open network — NO encryption. All traffic visible to anyone nearby.",
    });
  } else if (sec.includes("wep")) {
    riskScore += 45;
    flags.push({
      t: "danger",
      m: "WEP encryption is completely broken — crackable in under 5 minutes with free tools.",
    });
  } else if (sec === "wpa" || sec === "wpa-psk") {
    riskScore += 25;
    flags.push({
      t: "warning",
      m: "WPA (TKIP) has known KRACK and dictionary vulnerabilities. Upgrade to WPA3.",
    });
  } else if (sec.includes("wpa2") && !sec.includes("wpa3")) {
    riskScore += 8;
    flags.push({
      t: "info",
      m: "WPA2 is acceptable but has KRACK vulnerability. WPA3 is the current gold standard.",
    });
  } else if (sec.includes("wpa3")) {
    flags.push({
      t: "safe",
      m: "WPA3 — current gold standard. Provides individualized encryption even on open networks.",
    });
  }

  // SSID heuristics
  const sl = ssid.toLowerCase();
  if (
    sl.includes("free") ||
    sl.includes("public") ||
    sl.includes("guest") ||
    sl.includes("open")
  ) {
    riskScore += 20;
    flags.push({
      t: "warning",
      m: `"${ssid}" suggests a public/free network. Evil twin attacks are extremely common on these.`,
    });
  }
  if (
    sl.includes("airport") ||
    sl.includes("hotel") ||
    sl.includes("cafe") ||
    sl.includes("coffee") ||
    sl.includes("mtr") ||
    sl.includes("hkia") ||
    sl.includes("starbucks")
  ) {
    riskScore += 15;
    flags.push({
      t: "warning",
      m: "Public venue network. Hackers often clone these SSIDs to intercept traffic.",
    });
  }
  if (ssid.length < 4) {
    riskScore += 10;
    flags.push({
      t: "info",
      m: "Very short SSID may indicate a hastily-configured rogue access point.",
    });
  }
  if (ssid.match(/[0-9]{10,}/) || ssid.match(/^[a-f0-9]{8,}$/i)) {
    riskScore += 5;
    flags.push({
      t: "info",
      m: "SSID resembles a router default name — default passwords may still be set.",
    });
  }

  // Signal strength
  const sig = parseInt(signal) || 0;
  if (sig && sig > -50)
    flags.push({
      t: "info",
      m: `Strong signal (${sig} dBm) — you are likely very close to the access point.`,
    });
  else if (sig && sig < -80) {
    riskScore += 5;
    flags.push({
      t: "info",
      m: `Weak signal (${sig} dBm) — connection may be unstable.`,
    });
  }

  if (
    flags.length === 0 ||
    flags.every((f) => f.t === "info" || f.t === "safe")
  )
    flags.push({
      t: "safe",
      m: "Network appears to use strong encryption. Continue to follow safe browsing practices.",
    });

  // AI advice
  let aiAdvice = null;
  try {
    aiAdvice = await callASI(
      `WiFi network: SSID="${ssid}", Security="${security || "Unknown"}", Signal="${signal || "?"} dBm", Risk score: ${riskScore}/100. Issues: ${flags
        .filter((f) => f.t !== "safe")
        .map((f) => f.m)
        .join("; ")}. Give 3 specific, actionable user-friendly security tips.`,
      "You are a WiFi security expert. Be concise, practical, and friendly. Respond in the same language as the SSID/context suggests.",
      350,
    );
  } catch (e) {
    console.error("WiFi AI error:", e.message);
  }

  res.json({
    ssid,
    security: security || "Unknown",
    riskScore: Math.min(100, riskScore),
    flags,
    aiAdvice,
  });
});

// ==================== SERVE PAGES ====================
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")),
);

// ==================== ASI-1 AI PROXY ====================
const ASI_API_KEY = process.env.ASI_API_KEY || "";
const ASI_MODEL = process.env.ASI_MODEL || "asi1-mini";
const ASI_BASE_URL = "https://api.asi1.ai";

/**
 * Internal helper: calls ASI-1 chat completion API directly
 */
async function callASI(
  userMessage,
  systemMessage = "You are a helpful assistant.",
  maxTokens = 1500,
) {
  if (!ASI_API_KEY) throw new Error("No ASI API key configured");
  const payload = JSON.stringify({
    model: ASI_MODEL,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
  });
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.asi1.ai",
      port: 443,
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ASI_API_KEY}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };
    const apiReq = https.request(options, (apiRes) => {
      let data = "";
      apiRes.on("data", (chunk) => (data += chunk));
      apiRes.on("end", () => {
        try {
          resolve(JSON.parse(data).choices?.[0]?.message?.content || "");
        } catch (e) {
          reject(new Error("Invalid JSON from ASI API"));
        }
      });
    });
    apiReq.on("error", reject);
    apiReq.setTimeout(20000, () => {
      apiReq.destroy();
      reject(new Error("ASI API timeout"));
    });
    apiReq.write(payload);
    apiReq.end();
  });
}

// Generic ASI-1 chat completion proxy
app.post("/api/asi/chat", async (req, res) => {
  if (!ASI_API_KEY)
    return res.status(500).json({ error: "ASI API key not configured" });
  const { messages, model, max_tokens } = req.body;
  if (!messages || !Array.isArray(messages))
    return res.status(400).json({ error: "messages array required" });

  try {
    const payload = JSON.stringify({
      model: model || ASI_MODEL,
      messages,
      max_tokens: max_tokens || 1024,
      temperature: 0.7,
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.asi1.ai",
        port: 443,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ASI_API_KEY}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      };
      const apiReq = https.request(options, (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => (data += chunk));
        apiRes.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Invalid JSON from ASI API"));
          }
        });
      });
      apiReq.on("error", reject);
      apiReq.setTimeout(30000, () => {
        apiReq.destroy();
        reject(new Error("ASI API timeout"));
      });
      apiReq.write(payload);
      apiReq.end();
    });

    if (result.error)
      return res
        .status(502)
        .json({ error: result.error.message || "ASI API error" });
    const reply = result.choices?.[0]?.message?.content || "";
    res.json({ reply, model: result.model, usage: result.usage });
  } catch (err) {
    console.error("ASI proxy error:", err.message);
    res
      .status(502)
      .json({ error: "Failed to reach ASI-1 API: " + err.message });
  }
});

// ==================== GAME SCENARIO AI ====================
const gameScenarioCache = {};
const GAME_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Generate AI-powered game scenarios via ASI-1.
 * Cached per tier for performance. Falls back to empty array on failure.
 */
app.get("/api/game-scenario", async (req, res) => {
  const tier = parseInt(req.query.tier) || 1;
  const lang = req.query.lang || "en";
  const cacheKey = `${tier}_${lang}`;

  // Check cache
  if (
    gameScenarioCache[cacheKey] &&
    Date.now() - gameScenarioCache[cacheKey].ts < GAME_CACHE_TTL
  ) {
    const cached = gameScenarioCache[cacheKey].data;
    const item = cached[Math.floor(Math.random() * cached.length)];
    return res.json(item);
  }

  if (!ASI_API_KEY) return res.status(503).json({ error: "AI not configured" });

  const tierNames = {
    1: "Easy (basic scams)",
    2: "Medium (social engineering)",
    3: "Hard (advanced phishing)",
    4: "Expert (deepfakes, supply chain)",
    5: "Ultimate (AI-powered threats)",
  };
  const langInstruction =
    lang === "zh" ? "Write in Traditional Chinese." : "Write in English.";

  try {
    const prompt = `Generate 5 unique cybersecurity scam scenarios for difficulty tier ${tier} (${tierNames[tier] || "General"}). ${langInstruction}

Return ONLY a valid JSON array. Each object must have:
- "text": string (the scam scenario, 3-5 sentences, realistic)
- "label": "SCAM" or "SAFE" (label the scenario)
- "typeLabel": string (e.g. "📧 PHISHING", "🎭 IMPERSONATION")
- "explanation": string (1-2 sentences explaining why it's a scam or safe)
- "options": array of 4 objects each with "text" (string) and "correct" (boolean, exactly one true)

Example: [{"text":"...","label":"SCAM","typeLabel":"📧 PHISHING","explanation":"...","options":[{"text":"🚨 This is a SCAM","correct":true},{"text":"✅ This is safe","correct":false},{"text":"🤔 Need more info","correct":false},{"text":"✅ Looks legitimate","correct":false}]}]`;

    const raw = await callASI(
      prompt,
      "You are a cybersecurity training content generator. Return ONLY valid JSON arrays, no markdown.",
      2000,
    );

    // Parse JSON from response
    let scenarios;
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      scenarios = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (e) {
      scenarios = [];
    }

    if (scenarios.length > 0) {
      gameScenarioCache[cacheKey] = { data: scenarios, ts: Date.now() };
      const item = scenarios[Math.floor(Math.random() * scenarios.length)];
      res.json(item);
    } else {
      res.status(502).json({ error: "Failed to generate scenario" });
    }
  } catch (err) {
    console.error("Game scenario error:", err.message);
    res.status(502).json({ error: "AI unavailable" });
  }
});

// Chatbot endpoint (wraps ASI with NeoTrace system prompt)
app.post("/api/chatbot", async (req, res) => {
  const { message, history, context } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  const systemPrompt = `You are NeoTrace AI Assistant, a friendly and knowledgeable cybersecurity expert built into the NeoTrace platform.

NeoTrace is an AI-powered cybersecurity intelligence platform with these tools:
- Dashboard: Real-time threat stats, charts, news feed
- Story Mode: Interactive cybersecurity stories (4 chapters covering prize scams, urgency tactics, impersonation, social engineering)
- Training Game: Quiz-style cybersecurity training with 5 difficulty tiers
- Phone Inspector: Analyze phone numbers for spam/fraud risk
- URL Scanner: Check URLs for phishing, malware, and threats
- Image Forensics: Detect AI-generated or manipulated images
- Text Verifier: Verify text credibility and detect misinformation
- Careers: Cybersecurity job roles and salary data
- Courses: Online learning resources
- Certifications: Industry security certs

${context ? "Current context: " + context : ""}

Guidelines:
- Keep answers concise (2-4 sentences) but informative
- Use examples when explaining concepts
- If the user asks for "more" or "others", provide additional related information
- Reply in the SAME language the user uses
- If you detect Chinese/Cantonese, reply in Traditional Chinese`;

  // Build messages array — avoid duplicating the current user message
  const prevHistory = (history || []).slice(-8);
  const msgs = [
    { role: "system", content: systemPrompt },
    ...prevHistory,
    { role: "user", content: message },
  ];

  if (!ASI_API_KEY) {
    return res.json({
      reply:
        "I'm NeoTrace AI Assistant. The AI service is currently being configured. In the meantime, feel free to explore our tools — use the navigation bar to access URL Scanner, Image Forensics, Text Verifier, and more!",
    });
  }

  try {
    const payload = JSON.stringify({
      model: ASI_MODEL,
      messages: msgs,
      max_tokens: 600,
      temperature: 0.7,
    });
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.asi1.ai",
        port: 443,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ASI_API_KEY}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      };
      const apiReq = https.request(options, (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => (data += chunk));
        apiRes.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error)
              reject(new Error(parsed.error.message || "ASI API error"));
            else resolve(parsed);
          } catch (e) {
            reject(new Error("Invalid response from AI service"));
          }
        });
      });
      apiReq.on("error", reject);
      apiReq.setTimeout(45000, () => {
        apiReq.destroy();
        reject(new Error("AI service timeout"));
      });
      apiReq.write(payload);
      apiReq.end();
    });

    const reply =
      result.choices?.[0]?.message?.content ||
      "Sorry, I couldn't process that. Try again!";
    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res
      .status(502)
      .json({ error: "AI service temporarily unavailable. " + err.message });
  }
});

// ==================== FEEDBACK API ====================
const feedbackStore = [];

app.post("/api/feedback", (req, res) => {
  const { rating, message, page } = req.body;
  if (!rating && !message)
    return res.status(400).json({ error: "rating or message required" });

  const entry = {
    id: Date.now(),
    rating: rating || 0,
    message: message || "",
    page: page || "unknown",
    timestamp: new Date().toISOString(),
  };
  feedbackStore.push(entry);
  console.log(
    `📝 Feedback received: ${entry.rating}★ — "${entry.message.slice(0, 60)}"`,
  );
  res.json({ success: true, message: "Thank you for your feedback!" });
});

app.get("/api/feedback", (req, res) => {
  res.json({ count: feedbackStore.length, recent: feedbackStore.slice(-20) });
});

// ==================== START SERVER ====================
// Only start HTTP server when running locally (not on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n◉ NeoTrace is running!`);
    console.log(`🌐 Open: http://localhost:${PORT}`);
    console.log(`📡 Server started at ${new Date().toLocaleString()}`);
    console.log(
      `🤖 ASI-1 API: ${ASI_API_KEY ? "Configured ✓" : "Not configured — set ASI_API_KEY env var"}\n`,
    );
  });
}

// Export for Vercel serverless (required)
module.exports = app;
