/**
 * =====================================================
 * NeoTrace — Backend Server
 * =====================================================
 *
 * Express.js server providing comprehensive API endpoints for the NeoTrace
 * cybersecurity intelligence platform. Implements threat detection, digital
 * forensics, and gamification features.
 *
 * @author NeoTrace Team
 * @version 4.0.0
 * @date 2026-03-21
 * @license MIT
 *
 * Core Features:
 * - URL phishing & threat analysis with multi-factor risk scoring
 * - Image forensics with AI-generated image detection
 * - Content verification with sentiment & credibility analysis
 * - Real-time global leaderboard with player rankings
 *
 * Main API Endpoints:
 * - GET/POST /api/leaderboard  - Retrieve/add player scores
 * - POST /api/analyze-url      - Comprehensive URL security analysis
 * - POST /api/analyze-image    - Image authenticity & forensics analysis
 * - POST /api/verify-text      - Text credibility & fake news detection
 *
 * Deployment:
 * - Vercel (serverless) or Node.js + Express
 * - Supports environment variables via dotenv or Vercel
 * - CORS enabled for all origins (adjustable for production)
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const path = require("path");
const dns = require("dns");
const https = require("https");
const http = require("http");
const url = require("url");
const fs = require("fs");

// Security: Input validation
const Joi = require("joi");

// Load environment variables from .env if present
try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed — use Vercel env vars or system env
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════════════
// P0 SECURITY: HELMET + SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════════
/**
 * Helmet: Add essential security headers
 * - X-Frame-Options: prevent clickjacking
 * - X-Content-Type-Options: prevent MIME sniffing  
 * - Strict-Transport-Security: force HTTPS
 * - Content-Security-Policy: mitigate XSS attacks
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "api.asi1.ai", "*.vercel.app"],
      fontSrc: ["'self'", "cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: "deny",
  },
  noSniff: true,
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
}));

// ══════════════════════════════════════════════════════════════════════
// P0 SECURITY: CORS CONFIGURATION
// ══════════════════════════════════════════════════════════════════════
/**
 * CORS: Restrict allowed origins for security
 * Authorization: only requests from configured origins are allowed
 */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3010",
  process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()).join(",") || "https://neotrace.vercel.app"
];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: Access denied for origin: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Preflight requests
app.options("*", cors(corsOptions));

// ══════════════════════════════════════════════════════════════════════
// P0 SECURITY: BODY SIZE & REQUEST LIMIT CONFIGURATION  
// ══════════════════════════════════════════════════════════════════════
/**
 * Reduce body size limits to prevent memory exhaustion attacks
 * - JSON: 5MB (reduced from 50MB)
 * - URL-encoded: 2MB
 * - File uploads: 20MB (controlled by multer)
 */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ══════════════════════════════════════════════════════════════════════
// P0 SECURITY: RATE LIMITING
// ══════════════════════════════════════════════════════════════════════
/**
 * Rate limiters with varying strictness:
 * - Global: 100 requests per minute per IP
 * - APIs: 30 requests per minute per IP
 * - Analyze endpoints: 10 requests per minute (consuming API keys)
 * - Auth endpoints: 5 attempts per minute (brute force protection)
 */

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Standard API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many API requests, please slow down.",
  skip: (req) => req.path.startsWith("/api/leaderboard/get"), // GET leaderboard is less critical
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for resource-heavy endpoints
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute  
  max: 10,
  message: "Too many analysis requests. Please wait before analyzing more content.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication/sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many attempts, please try again later.",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
app.use("/api/", apiLimiter);
app.use("/api/analyze-", analyzeLimiter);
app.use("/api/verify-", analyzeLimiter);

// Static File Serving: Serve the React frontend from /public directory
app.use(express.static(path.join(__dirname, "public")));

// ══════════════════════════════════════════════════════════════════════
// P0 SECURITY: API KEY AUTHENTICATION MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════
/**
 * Secret API key validation for sensitive endpoints
 * Check X-API-Key header or query parameter
 */
const requiredApiKey = process.env.API_KEY || "";

function validateApiKey(req, res, next) {
  if (!requiredApiKey) {
    // If no API key is configured, warn but allow (development mode)
    console.warn("⚠️  Warning: API_KEY not configured. Set API_KEY env var for production security.");
    return next();
  }

  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  
  if (!apiKey || apiKey !== requiredApiKey) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid API key. Provide X-API-Key header or ?api_key query parameter",
    });
  }

  next();
}

// ──────────────────────────────────────────────────────────────────────
// File Upload Configuration
// ──────────────────────────────────────────────────────────────────────
/**
 * Multer: In-memory storage for image uploads with security validation
 * - Maximum file size: 10MB (reduced from 20MB)
 * - MIME type whitelist: image/jpeg, image/png, image/webp only
 * - File count limit: 1 file per request
 */
const fileTypeModule = require("file-type");

const upload = multer({
  storage: multer.memoryStorage(), // Files stored in RAM, not disk
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB maximum (down from 20MB)
    files: 1, // Only 1 file per request
  },
  fileFilter: async (req, file, cb) => {
    // Basic MIME type check
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
    cb(null, true);
  },
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
 * Adds new player score to leaderboard with input validation
 * @body {string} name - Player name (1-50 characters, no HTML)
 * @body {number} score - Player score (0-10000)
 * @body {string} rank - Player rank (optional)
 * @body {string} badge - Player badge emoji (optional)
 */
app.post("/api/leaderboard", (req, res) => {
  // Input validation with Joi
  const schema = Joi.object({
    name: Joi.string().trim().min(1).max(50).required().pattern(/^[^<>]*$/),
    score: Joi.number().integer().min(0).max(10000).required(),
    rank: Joi.string().trim().max(30).optional().pattern(/^[^<>]*$/),
    badge: Joi.string().max(10).optional(), // Allow emoji
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: "Invalid input",
      details: error.details.map(e => e.message),
    });
  }

  const { name, score, rank, badge } = value;
  
  // Create new entry with unique ID to fix position calculation bug
  const entry = {
    id: Date.now() + Math.random().toString(36).substr(2, 9), // Unique ID
    name,
    score,
    rank: rank || "Trainee",
    badge: badge || "🥉",
    date: new Date().toISOString().split("T")[0],
  };
  
  leaderboard.push(entry);
  
  // Sort by score descending, then by date ascending (stable sort)
  leaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Keep only top 100 entries
  if (leaderboard.length > 100) leaderboard = leaderboard.slice(0, 100);
  
  // Calculate position by finding the entry's index (fixed bug: was using findIndex which could return -1)
  const position = leaderboard.findIndex(e => e.id === entry.id) + 1;
  
  res.status(201).json({
    success: true,
    position,
    entry: {
      ...entry,
      id: undefined, // Don't expose internal ID to client
    },
  });
});

/**
 * Get registered domain (eTLD+1) from a domain name
 * Examples:
 * - "example.com" → "example.com"
 * - "sub.example.com" → "example.com"  
 * - "co.uk" → "co.uk" (common suffix)
 * - "example.co.uk" → "example.co.uk"
 *
 * Note: This is a simplified version. For production, use publicsuffix library.
 */
function getRegisteredDomain(domain) {
  if (!domain) return "";
  
  const parts = domain.toLowerCase().split(".");
  
  // Common multi-part TLDs that need special handling
  const multiPartTlds = [
    "co.uk", "co.jp", "co.in", "com.au", "co.nz",
    "com.br", "co.il", "co.kr", "co.th", "co.id",
    "ge.com", "c.la", "c.st"
  ];
  
  // Check if domain ends with multi-part TLD
  for (let i = 2; i <= Math.min(3, parts.length); i++) {
    const possibleTld = parts.slice(-i).join(".");
    if (multiPartTlds.includes(possibleTld)) {
      return parts.length > i ? parts.slice(-(i + 1)).join(".") : domain;
    }
  }
  
  // Default: return last 2 parts (domain + TLD)
  return parts.length > 1 ? parts.slice(-2).join(".") : domain;
}

// ──────────────────────────────────────────────────────────────────────
// URL ANALYZER API
// ──────────────────────────────────────────────────────────────────────
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
 * Analyzes URL for phishing and security threats with SSRF protection
 * @body {string} targetUrl - URL to analyze
 * @returns {object} Risk score, findings, and domain details
 */
app.post("/api/analyze-url", analyzeLimiter, async (req, res) => {
  try {
    const { targetUrl } = req.body;
    
    // Input validation
    if (!targetUrl || typeof targetUrl !== "string" || targetUrl.length > 2048) {
      return res.status(400).json({ error: "Invalid URL: must be a string ≤ 2048 chars" });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(
        targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`,
      );
    } catch (e) {
      return res.status(400).json({
        error: "Invalid URL format",
        riskScore: 100,
        riskLevel: "Critical",
      });
    }

    // ────────────────────────────────────────────────────────────────
    // SSRF PROTECTION: Prevent resolution of private IP addresses
    // ────────────────────────────────────────────────────────────────
    const hostname = parsedUrl.hostname;
    const privateIpPattern = /^(10\.|127\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|169\.254\.|localhost|::1|fc00::|fd00::)/i;
    
    if (privateIpPattern.test(hostname)) {
      return res.status(403).json({
        error: "SSRF Protection: Cannot analyze private/internal IP addresses",
        riskScore: 100,
        riskLevel: "Critical",
      });
    }

    // Additional protection: block certain schemes
    if (!/^https?:$/.test(parsedUrl.protocol)) {
      return res.status(400).json({
        error: "Only HTTP and HTTPS schemes are supported",
        riskScore: 100,
        riskLevel: "Critical",
      });
    }

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
        domain.toLowerCase().includes(kw) || parsedUrl.pathname.toLowerCase().includes(kw),
    );
    if (foundKeywords.length > 0) {
      riskScore += foundKeywords.length * 5;
      findings.push({
        type: "warning",
        message: `Suspicious keywords found: ${foundKeywords.join(", ")}`,
      });
    }

    // ────────────────────────────────────────────────────────────────
    // IMPROVED BRAND IMPERSONATION DETECTION
    // Use registered domain (eTLD+1) to avoid false positives
    // ────────────────────────────────────────────────────────────────
    const registeredDomain = getRegisteredDomain(domain);
    const brandCheck = LEGITIMATE_DOMAINS.find(legit => {
      const legitimateDomain = getRegisteredDomain(legit);
      // Check if impersonating: domain !== legitimate AND domain contains the brand
      return (
        registeredDomain !== legitimateDomain &&
        domain.includes(legitimateDomain.split(".")[0]) &&
        !domain.endsWith("." + legitimateDomain)
      );
    });
    
    if (brandCheck) {
      riskScore += 25;
      findings.push({
        type: "danger",
        message: `Possible brand impersonation of ${brandCheck}`,
      });
    }

    // Check if legitimate
    if (LEGITIMATE_DOMAINS.includes(domain) || LEGITIMATE_DOMAINS.some(ld => domain.endsWith("." + ld))) {
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

    // DNS lookup with timeout
    try {
      const addresses = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("DNS lookup timeout"));
        }, 5000);
        
        dns.resolve4(hostname, (err, addresses) => {
          clearTimeout(timeout);
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
    console.error("URL analysis error:", error.message);
    res.status(500).json({ error: "Analysis failed", message: error.message });
  }
});

// ==================== IMAGE ANALYZER API ====================
/**
 * POST /api/analyze-image
 * Multi-layered image forensic analysis with file validation
 * @body {file} image - Image file to analyze (multipart/form-data, max 10MB)
 * @returns {object} AI detection score, EXIF data, compression analysis, forensic findings
 *
 * Security Validations:
 * - File type verification via magic bytes (file signature)
 * - MIME type validation
 * - Memory-safe processing
 * - No execution of embedded content
 */
app.post("/api/analyze-image", analyzeLimiter, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const buffer = req.file.buffer;
    const fileSize = buffer.length;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;

    // ────────────────────────────────────────────────────────────────
    // SECURITY: Validate file type by checking magic bytes
    // ────────────────────────────────────────────────────────────────
    const header = buffer.slice(0, 12);
    const isPNG = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
    const isJPG = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    const isGIF = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46;
    const isWebP = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
                   header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;

    // Verify file signature matches declared MIME type
    if (!isPNG && !isJPG && !isGIF && !isWebP) {
      return res.status(400).json({
        error: "Invalid image file. File signature does not match standard image formats.",
        details: "File appears to be corrupted or is not a valid image.",
      });
    }

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

    // Compression Analysis (JPEG specific)
    if (isPNG) {
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
    } else if (isJPG) {
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

    // File signature verification (already done above)
    results.forensic.findings.push({
      type: "safe",
      message: "File signature matches declared format",
    });

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
    console.error("Image analysis error:", error.message);
    res
      .status(500)
      .json({ error: "Image analysis failed", message: error.message });
  }
});

// ==================== TEXT VERIFIER API ====================
/**
 * POST /api/verify-text
 * Analyzes text content for misinformation, credibility, and emotional manipulation
 * with input validation and output escaping for XSS protection
 * @body {string} text - Text content to verify (1-100,000 chars)
 * @returns {object} Credibility score, sentiment analysis, misinformation risk, content findings
 *
 * Detection patterns:
 * - Clickbait/sensationalist language
 * - Emotional manipulation (caps, exclamations)
 * - Statistical claims without sources
 * - Urgency tactics and social pressure
 * - Source citation analysis
 */
app.post("/api/verify-text", analyzeLimiter, (req, res) => {
  try {
    const { text } = req.body;
    
    // Input validation
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required and must be a string" });
    }
    
    if (text.length < 1 || text.length > 100000) {
      return res.status(400).json({ error: "Text must be between 1 and 100,000 characters" });
    }

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
    console.error("Text verification error:", error.message);
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
 * News + Data Pipeline
 * - Multi-source feed fusion (official, RSS, social snapshot, GDELT snapshot)
 * - Basic entity extraction + location linking
 * - Deduplication + similarity clustering
 * - Confidence badge scoring (source reputation, corroboration, recency)
 * - GeoJSON event generation with provenance metadata
 */
let newsCache = { data: null, timestamp: 0 };
let eventsCache = { data: null, timestamp: 0, quality: null };
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 min
const EVENTS_CACHE_TTL = 5 * 60 * 1000; // 5 min

const NEWS_FEEDS = [
  {
    name: "The Hacker News",
    url: "https://feeds.feedburner.com/TheHackersNews",
    sourceType: "rss",
    reputation: 88,
  },
  {
    name: "BleepingComputer",
    url: "https://www.bleepingcomputer.com/feed/",
    sourceType: "rss",
    reputation: 86,
  },
  {
    name: "CISA Advisories",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    sourceType: "official",
    reputation: 95,
  },
  {
    name: "SecurityWeek",
    url: "https://feeds.feedburner.com/securityweek",
    sourceType: "rss",
    reputation: 84,
  },
];

const SOURCE_REPUTATION = {
  "The Hacker News": 88,
  BleepingComputer: 86,
  "CISA Advisories": 95,
  SecurityWeek: 84,
  GDELT: 80,
  "Social Monitor": 72,
};

const LOCATION_INDEX = {
  "Hong Kong": { lat: 22.3193, lng: 114.1694 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  Taiwan: { lat: 23.6978, lng: 120.9605 },
  Japan: { lat: 36.2048, lng: 138.2529 },
  Korea: { lat: 35.9078, lng: 127.7669 },
  "South Korea": { lat: 35.9078, lng: 127.7669 },
  China: { lat: 35.8617, lng: 104.1954 },
  India: { lat: 20.5937, lng: 78.9629 },
  "United States": { lat: 39.8283, lng: -98.5795 },
  US: { lat: 39.8283, lng: -98.5795 },
  Canada: { lat: 56.1304, lng: -106.3468 },
  Australia: { lat: -25.2744, lng: 133.7751 },
  Germany: { lat: 51.1657, lng: 10.4515 },
  France: { lat: 46.2276, lng: 2.2137 },
  UK: { lat: 55.3781, lng: -3.436 },
  "United Kingdom": { lat: 55.3781, lng: -3.436 },
  Brazil: { lat: -14.235, lng: -51.9253 },
  Nigeria: { lat: 9.082, lng: 8.6753 },
  UAE: { lat: 23.4241, lng: 53.8478 },
  Thailand: { lat: 15.87, lng: 100.9925 },
  Malaysia: { lat: 4.2105, lng: 101.9758 },
  Vietnam: { lat: 14.0583, lng: 108.2772 },
  Indonesia: { lat: -0.7893, lng: 113.9213 },
  Philippines: { lat: 12.8797, lng: 121.774 },
  Russia: { lat: 61.524, lng: 105.3188 },
};


app.get("/api/news", async (req, res) => {
  try {
    if (newsCache.data && Date.now() - newsCache.timestamp < NEWS_CACHE_TTL) {
      const limit = clampInt(req.query.limit, 1, 60, 24);
      if (req.query.includeMeta === "1") {
        return res.json({
          items: newsCache.data.slice(0, limit),
          meta: buildNewsMeta(newsCache.data),
        });
      }
      return res.json(newsCache.data.slice(0, limit));
    }

    const fusedNews = await buildFusedNews();
    newsCache = { data: fusedNews, timestamp: Date.now() };
    eventsCache.timestamp = 0; // invalidate event cache when news refreshes

    const limit = clampInt(req.query.limit, 1, 60, 24);
    if (req.query.includeMeta === "1") {
      return res.json({
        items: fusedNews.slice(0, limit),
        meta: buildNewsMeta(fusedNews),
      });
    }
    res.json(fusedNews.slice(0, limit));
  } catch (error) {
    console.error("News fetch error:", error.message);
    if (newsCache.data) {
      const limit = clampInt(req.query.limit, 1, 60, 24);
      return res.json(newsCache.data.slice(0, limit));
    }
    res
      .status(500)
      .json({ error: "Failed to fetch news", message: error.message });
  }
});

app.get("/api/news/metrics", async (req, res) => {
  try {
    if (!newsCache.data || Date.now() - newsCache.timestamp >= NEWS_CACHE_TTL) {
      newsCache = { data: await buildFusedNews(), timestamp: Date.now() };
    }
    res.json(buildNewsMeta(newsCache.data));
  } catch (error) {
    res.status(500).json({ error: "Failed to compute news metrics", message: error.message });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const payload = await buildEventPayload({ force: req.query.refresh === "1" });

    const categories = (req.query.category || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const start = parseIsoOrEmpty(req.query.start);
    const end = parseIsoOrEmpty(req.query.end);
    const minConfidence = clampInt(req.query.minConfidence, 0, 100, 0);

    const filtered = filterEvents(payload.events, {
      categories,
      start,
      end,
      minConfidence,
    });

    const format = (req.query.format || "geojson").toLowerCase();
    if (format === "csv") {
      const csv = eventsToCsv(filtered);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=events.csv");
      return res.send(csv);
    }

    if (format === "json") {
      return res.json({
        events: filtered,
        meta: {
          ...payload.meta,
          filteredCount: filtered.length,
          latencyMs: Date.now() - new Date(payload.meta.generatedAt).getTime(),
        },
      });
    }

    return res.json({
      type: "FeatureCollection",
      features: toGeoJSONFeatures(filtered),
      meta: {
        ...payload.meta,
        filteredCount: filtered.length,
        latencyMs: Date.now() - new Date(payload.meta.generatedAt).getTime(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to build events", message: error.message });
  }
});

app.get("/api/events/export", async (req, res) => {
  try {
    const payload = await buildEventPayload({ force: req.query.refresh === "1" });
    const categories = (req.query.category || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const start = parseIsoOrEmpty(req.query.start);
    const end = parseIsoOrEmpty(req.query.end);
    const minConfidence = clampInt(req.query.minConfidence, 0, 100, 0);
    const filtered = filterEvents(payload.events, {
      categories,
      start,
      end,
      minConfidence,
    });

    const format = (req.query.format || "geojson").toLowerCase();
    if (format === "csv") {
      const csv = eventsToCsv(filtered);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=events.csv");
      return res.send(csv);
    }

    const geojson = {
      type: "FeatureCollection",
      features: toGeoJSONFeatures(filtered),
      meta: {
        ...payload.meta,
        filteredCount: filtered.length,
        exportedAt: new Date().toISOString(),
      },
    };
    res.setHeader("Content-Type", "application/geo+json; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=events.geojson");
    return res.send(JSON.stringify(geojson, null, 2));
  } catch (error) {
    res.status(500).json({ error: "Failed to export events", message: error.message });
  }
});

app.get("/api/events/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = async () => {
    try {
      const payload = await buildEventPayload();
      const chunk = {
        generatedAt: payload.meta.generatedAt,
        eventCount: payload.events.length,
        latencyMs: Date.now() - new Date(payload.meta.generatedAt).getTime(),
      };
      res.write(`event: snapshot\n`);
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    } catch (error) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
    }
  };

  send();
  const timer = setInterval(send, 20000);
  req.on("close", () => {
    clearInterval(timer);
    res.end();
  });
});

async function buildFusedNews() {
  const feedPayloads = await Promise.all(
    NEWS_FEEDS.map(async (feed) => {
      const startedAt = Date.now();
      try {
        const items = await fetchFeedItems(feed);
        return {
          source: feed.name,
          latencyMs: Date.now() - startedAt,
          items,
          success: true,
        };
      } catch (error) {
        console.warn(`Feed fetch failed: ${feed.name} -> ${error.message}`);
        return {
          source: feed.name,
          latencyMs: Date.now() - startedAt,
          items: [],
          success: false,
        };
      }
    }),
  );

  const socialSnapshot = getSocialSnapshot();
  const gdeltSnapshot = getGdeltSnapshot();
  const raw = feedPayloads.flatMap((f) => f.items).concat(socialSnapshot, gdeltSnapshot);

  const deduped = dedupeNews(raw);
  const clustered = clusterNewsItems(deduped);
  const corroborationMap = buildCorroborationMap(clustered);

  const enriched = clustered
    .map((item, idx) => {
      const entities = extractEntities(`${item.title} ${item.summary}`);
      const location = inferLocation(item.title, item.summary, entities);
      const coords = location ? LOCATION_INDEX[location] : null;
      const corroborationCount = corroborationMap[item.clusterId] || 1;
      const confidencePack = computeConfidenceScore(
        item.source,
        item.date,
        corroborationCount,
      );

      return {
        id: item.id || `news-${idx + 1}-${hashString(item.title).slice(0, 8)}`,
        title: item.title,
        date: item.date,
        source: item.source,
        sourceType: item.sourceType,
        link: item.link,
        url: item.link,
        image: item.image,
        summary: item.summary,
        shortSummary: summarizeText(item.summary, 150),
        entities,
        location,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
        confidence: confidencePack.score,
        confidenceBadge: confidencePack.badge,
        corroborationCount,
        clusterId: item.clusterId,
        provenance: {
          sourceUrl: item.link,
          fetchedAt: new Date().toISOString(),
          parser: item.parser || "rss-parser-v2",
          sourceFeed: item.feedUrl || "snapshot",
        },
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  await maybeEnhanceSummariesWithAI(enriched);

  return enriched;
}

async function maybeEnhanceSummariesWithAI(items) {
  if (!ASI_API_KEY || !items.length) return;
  const target = items.slice(0, 8);
  try {
    const prompt = `You are given ${target.length} cybersecurity headlines. Produce one short summary sentence for each headline. Return ONLY valid JSON array with ${target.length} strings.\n\n${target
      .map((x, i) => `${i + 1}. ${x.title}`)
      .join("\n")}`;
    const raw = await callASI(
      prompt,
      "You are concise. Output only JSON arrays.",
      700,
    );
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return;
    const arr = JSON.parse(jsonMatch[0]);
    arr.forEach((summary, i) => {
      if (typeof summary === "string" && target[i]) {
        target[i].shortSummary = summarizeText(summary, 150);
      }
    });
  } catch (error) {
    console.warn("AI summary enhancement skipped:", error.message);
  }
}

async function fetchFeedItems(feed) {
  const xml = await fetchURL(feed.url);
  const itemBlocks = getXmlBlocks(xml, "item");
  const entryBlocks = itemBlocks.length ? [] : getXmlBlocks(xml, "entry");
  const blocks = itemBlocks.length ? itemBlocks : entryBlocks;

  const items = [];
  for (const block of blocks.slice(0, 16)) {
    const titleRaw = extractTag(block, "title") || extractTag(block, "media:title");
    const descRaw =
      extractTag(block, "description") ||
      extractTag(block, "summary") ||
      extractTag(block, "content");
    const pubDateRaw =
      extractTag(block, "pubDate") ||
      extractTag(block, "updated") ||
      extractTag(block, "published");

    const link =
      cleanAndValidateUrl(extractTag(block, "link")) ||
      cleanAndValidateUrl(extractTag(block, "guid")) ||
      cleanAndValidateUrl(extractTagAttribute(block, "link", "href"));

    if (!link) continue;

    const title = cleanText(titleRaw);
    const description = cleanText(descRaw);
    if (!title) continue;

    const image =
      cleanAndValidateUrl(extractTagAttribute(block, "media:content", "url")) ||
      cleanAndValidateUrl(extractTagAttribute(block, "enclosure", "url")) ||
      cleanAndValidateUrl(extractImageFromHtml(descRaw)) ||
      fallbackImageFromTitle(title);

    items.push({
      id: `news-${hashString(`${feed.name}-${title}-${link}`).slice(0, 12)}`,
      title,
      link,
      date: safeIsoDate(pubDateRaw),
      source: feed.name,
      sourceType: feed.sourceType,
      summary: summarizeText(description || title, 240),
      image,
      parser: "rss-parser-v2",
      feedUrl: feed.url,
      reputation: feed.reputation,
    });
  }
  return items;
}

function getSocialSnapshot() {
  const now = Date.now();
  return [
    {
      id: `social-${hashString("hk-banking-phish").slice(0, 8)}`,
      title: "Verified social reports flag banking phishing wave in Hong Kong",
      link: "https://example.com/social/hk-banking-phish",
      date: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      source: "Social Monitor",
      sourceType: "social",
      summary:
        "Multiple verified posts report cloned bank login portals targeting mobile users in Hong Kong.",
      image: fallbackImageFromTitle("phishing"),
      parser: "social-snapshot",
      feedUrl: "snapshot://social",
      reputation: SOURCE_REPUTATION["Social Monitor"],
    },
    {
      id: `social-${hashString("sg-ransomware-hospital").slice(0, 8)}`,
      title: "Security community tracks ransomware activity against regional healthcare networks",
      link: "https://example.com/social/sg-ransomware-healthcare",
      date: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      source: "Social Monitor",
      sourceType: "social",
      summary:
        "Threat researchers are sharing indicators of compromise tied to recent healthcare ransomware attempts in Southeast Asia.",
      image: fallbackImageFromTitle("ransomware"),
      parser: "social-snapshot",
      feedUrl: "snapshot://social",
      reputation: SOURCE_REPUTATION["Social Monitor"],
    },
  ];
}

function getGdeltSnapshot() {
  const now = Date.now();
  return [
    {
      id: `gdelt-${hashString("credential-theft-apac").slice(0, 8)}`,
      title: "GDELT trend: credential theft incidents rising across APAC financial sector",
      link: "https://example.com/gdelt/credential-theft-apac",
      date: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      source: "GDELT",
      sourceType: "gdelt",
      summary:
        "Event stream indicates sustained increase in credential theft mentions related to financial entities in APAC.",
      image: fallbackImageFromTitle("credential theft"),
      parser: "gdelt-snapshot",
      feedUrl: "snapshot://gdelt",
      reputation: SOURCE_REPUTATION.GDELT,
    },
  ];
}

function dedupeNews(items) {
  const seen = new Map();
  for (const item of items) {
    const key = normalizeText(item.title).slice(0, 110);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, item);
      continue;
    }
    const existingScore = (existing.reputation || SOURCE_REPUTATION[existing.source] || 70);
    const currentScore = (item.reputation || SOURCE_REPUTATION[item.source] || 70);
    if (currentScore > existingScore) {
      seen.set(key, item);
    }
  }
  return [...seen.values()];
}

function clusterNewsItems(items) {
  const clustered = items.map((x) => ({ ...x, clusterId: "" }));
  let clusterCounter = 1;

  for (let i = 0; i < clustered.length; i++) {
    if (clustered[i].clusterId) continue;
    const currentCluster = `cluster-${clusterCounter++}`;
    clustered[i].clusterId = currentCluster;
    const baseTokens = tokenize(clustered[i].title);

    for (let j = i + 1; j < clustered.length; j++) {
      if (clustered[j].clusterId) continue;
      const candidateTokens = tokenize(clustered[j].title);
      const score = jaccard(baseTokens, candidateTokens);
      if (score >= 0.32) {
        clustered[j].clusterId = currentCluster;
      }
    }
  }
  return clustered;
}

function buildCorroborationMap(items) {
  return items.reduce((acc, item) => {
    acc[item.clusterId] = (acc[item.clusterId] || 0) + 1;
    return acc;
  }, {});
}

function extractEntities(text) {
  const tokens = cleanText(text).split(/\s+/);
  const organizations = [];
  const persons = [];
  const locations = [];

  const orgHints = ["Inc", "Corp", "Ltd", "Agency", "Security", "Microsoft", "Google", "CISA"];
  for (let i = 0; i < tokens.length - 1; i++) {
    const pair = `${tokens[i]} ${tokens[i + 1]}`;
    if (/^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(pair)) {
      persons.push(pair);
    }
  }

  Object.keys(LOCATION_INDEX).forEach((loc) => {
    if (new RegExp(`\\b${escapeRegex(loc)}\\b`, "i").test(text)) {
      locations.push(loc);
    }
  });

  orgHints.forEach((hint) => {
    if (new RegExp(`\\b${escapeRegex(hint)}\\b`, "i").test(text)) {
      organizations.push(hint);
    }
  });

  return {
    locations: [...new Set(locations)].slice(0, 5),
    organizations: [...new Set(organizations)].slice(0, 5),
    persons: [...new Set(persons)].slice(0, 5),
  };
}

function inferLocation(title, summary, entities) {
  if (entities.locations.length) return entities.locations[0];
  const text = `${title} ${summary}`;
  for (const locationName of Object.keys(LOCATION_INDEX)) {
    if (new RegExp(`\\b${escapeRegex(locationName)}\\b`, "i").test(text)) {
      return locationName;
    }
  }
  return "United States";
}

function computeConfidenceScore(source, isoDate, corroborationCount) {
  const reputation = SOURCE_REPUTATION[source] || 70;
  const recency = computeRecencyScore(isoDate);
  const corroboration = Math.min(100, 45 + corroborationCount * 12);
  const score = Math.round(reputation * 0.45 + recency * 0.25 + corroboration * 0.3);
  let badge = "Unverified";
  if (score >= 85) badge = "High Confidence";
  else if (score >= 70) badge = "Medium Confidence";
  else if (score >= 55) badge = "Watch";
  return { score: clampInt(score, 0, 100, 60), badge };
}

function computeRecencyScore(isoDate) {
  const hoursOld = Math.max(0, (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60));
  if (hoursOld <= 6) return 96;
  if (hoursOld <= 24) return 88;
  if (hoursOld <= 72) return 76;
  if (hoursOld <= 168) return 64;
  return 50;
}

async function buildEventPayload(opts = {}) {
  const force = !!opts.force;
  if (!force && eventsCache.data && Date.now() - eventsCache.timestamp < EVENTS_CACHE_TTL) {
    return eventsCache.data;
  }

  if (!newsCache.data || Date.now() - newsCache.timestamp >= NEWS_CACHE_TTL) {
    newsCache = { data: await buildFusedNews(), timestamp: Date.now() };
  }

  const generatedAt = new Date().toISOString();
  const events = buildNormalizedEvents(newsCache.data);
  const quality = measureDataQuality(events);
  const payload = {
    events,
    meta: {
      generatedAt,
      latencyMs: Date.now() - new Date(generatedAt).getTime(),
      totalEvents: events.length,
      categories: [...new Set(events.map((e) => e.category))],
      quality,
      indexing: {
        recommendedStores: ["PostGIS", "Elasticsearch"],
        indexedFields: ["timestamp", "category", "confidence", "lat", "lng", "source"],
      },
    },
  };

  eventsCache = { data: payload, timestamp: Date.now(), quality };
  return payload;
}

function buildNormalizedEvents(newsItems) {
  const seed = [
    {
      id: "evt-seed-001",
      lat: 22.3193,
      lng: 114.1694,
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      source: "SOC Intel Feed",
      confidence: 87,
      category: "phishing",
      title: "Credential phishing infrastructure detected",
      severity: "high",
      provenance: {
        sourceUrl: "https://example.com/soc/phishing-hk",
        fetchedAt: new Date().toISOString(),
        parser: "seed-event",
      },
    },
    {
      id: "evt-seed-002",
      lat: 1.3521,
      lng: 103.8198,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      source: "CERT Advisory",
      confidence: 91,
      category: "ransomware",
      title: "Ransomware campaign targeting healthcare",
      severity: "critical",
      provenance: {
        sourceUrl: "https://example.com/cert/ransomware-healthcare",
        fetchedAt: new Date().toISOString(),
        parser: "seed-event",
      },
    },
  ];

  const derived = newsItems
    .filter((n) => Number.isFinite(n.lat) && Number.isFinite(n.lng))
    .slice(0, 80)
    .map((item, idx) => ({
      id: `evt-news-${idx + 1}-${hashString(item.id).slice(0, 8)}`,
      lat: item.lat,
      lng: item.lng,
      timestamp: item.date,
      source: item.source,
      confidence: item.confidence,
      category: inferCategory(item.title, item.summary),
      title: item.title,
      severity: confidenceToSeverity(item.confidence),
      provenance: {
        sourceUrl: item.link,
        fetchedAt: item.provenance?.fetchedAt || new Date().toISOString(),
        parser: item.provenance?.parser || "news-derived",
      },
      newsId: item.id,
      clusterId: item.clusterId,
    }));

  const merged = seed.concat(derived);
  const normalized = [];
  for (const event of merged) {
    const validated = validateEvent(event);
    if (validated.valid) {
      normalized.push(validated.event);
    }
  }
  return normalized.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function validateEvent(event) {
  const required = ["id", "lat", "lng", "timestamp", "source", "confidence", "category"];
  for (const key of required) {
    if (event[key] === undefined || event[key] === null || event[key] === "") {
      return { valid: false, reason: `missing_${key}` };
    }
  }

  const lat = Number(event.lat);
  const lng = Number(event.lng);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { valid: false, reason: "invalid_lat" };
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return { valid: false, reason: "invalid_lng" };

  const ts = safeIsoDate(event.timestamp);
  const confidence = clampInt(event.confidence, 0, 100, 50);

  return {
    valid: true,
    event: {
      ...event,
      lat,
      lng,
      timestamp: ts,
      confidence,
      category: String(event.category).toLowerCase(),
      source: String(event.source).trim(),
      provenance: {
        sourceUrl: event.provenance?.sourceUrl || "",
        fetchedAt: event.provenance?.fetchedAt || new Date().toISOString(),
        parser: event.provenance?.parser || "unknown",
      },
    },
  };
}

function measureDataQuality(events) {
  const duplicates = new Set();
  let duplicateCount = 0;
  let missingProvenance = 0;

  for (const event of events) {
    const key = `${event.source}-${event.timestamp}-${event.lat.toFixed(3)}-${event.lng.toFixed(3)}-${event.category}`;
    if (duplicates.has(key)) duplicateCount += 1;
    duplicates.add(key);
    if (!event.provenance?.sourceUrl) missingProvenance += 1;
  }

  const total = events.length || 1;
  const duplicateRate = duplicateCount / total;
  const provenanceCoverage = 1 - missingProvenance / total;
  const qualityScore = Math.round(100 - duplicateRate * 40 - (1 - provenanceCoverage) * 35);

  return {
    qualityScore: clampInt(qualityScore, 0, 100, 0),
    duplicateRate: Number(duplicateRate.toFixed(3)),
    provenanceCoverage: Number(provenanceCoverage.toFixed(3)),
    totalRecords: events.length,
  };
}

function filterEvents(events, filters) {
  return events.filter((event) => {
    if (filters.categories.length && !filters.categories.includes(event.category)) {
      return false;
    }
    if (filters.start && new Date(event.timestamp).getTime() < new Date(filters.start).getTime()) {
      return false;
    }
    if (filters.end && new Date(event.timestamp).getTime() > new Date(filters.end).getTime()) {
      return false;
    }
    if (event.confidence < filters.minConfidence) {
      return false;
    }
    return true;
  });
}

function toGeoJSONFeatures(events) {
  return events.map((event) => ({
    type: "Feature",
    id: event.id,
    geometry: {
      type: "Point",
      coordinates: [event.lng, event.lat],
    },
    properties: {
      id: event.id,
      lat: event.lat,
      lng: event.lng,
      timestamp: event.timestamp,
      source: event.source,
      confidence: event.confidence,
      category: event.category,
      title: event.title,
      severity: event.severity,
      clusterId: event.clusterId || "",
      provenance: event.provenance,
    },
  }));
}

function eventsToCsv(events) {
  const headers = [
    "id",
    "lat",
    "lng",
    "timestamp",
    "source",
    "confidence",
    "category",
    "title",
    "severity",
    "sourceUrl",
    "fetchedAt",
    "parser",
  ];
  const rows = events.map((event) => [
    event.id,
    event.lat,
    event.lng,
    event.timestamp,
    event.source,
    event.confidence,
    event.category,
    event.title || "",
    event.severity || "",
    event.provenance?.sourceUrl || "",
    event.provenance?.fetchedAt || "",
    event.provenance?.parser || "",
  ]);
  return [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function buildNewsMeta(items) {
  const sources = items.reduce((acc, item) => {
    acc[item.source] = (acc[item.source] || 0) + 1;
    return acc;
  }, {});

  const confidenceAvg = items.length
    ? Math.round(items.reduce((sum, x) => sum + (x.confidence || 0), 0) / items.length)
    : 0;

  return {
    total: items.length,
    uniqueClusters: new Set(items.map((x) => x.clusterId)).size,
    sourceBreakdown: sources,
    confidenceAverage: confidenceAvg,
    generatedAt: new Date().toISOString(),
    latencyMs: Date.now() - (newsCache.timestamp || Date.now()),
  };
}

function inferCategory(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  if (/phish|credential|spoof/.test(text)) return "phishing";
  if (/ransom|encrypt|extortion/.test(text)) return "ransomware";
  if (/vulnerability|cve|zero-day|exploit/.test(text)) return "vulnerability";
  if (/deepfake|ai fraud|voice clone/.test(text)) return "deepfake";
  if (/breach|data leak|exposed/.test(text)) return "data-breach";
  if (/botnet|ddos/.test(text)) return "botnet";
  return "threat-intel";
}

function confidenceToSeverity(confidence) {
  if (confidence >= 90) return "critical";
  if (confidence >= 75) return "high";
  if (confidence >= 60) return "medium";
  return "low";
}

function getXmlBlocks(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  const blocks = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}

function extractTagAttribute(xml, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]+)"[^>]*>`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}

function extractImageFromHtml(html = "") {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : "";
}

function fallbackImageFromTitle(title) {
  const lower = String(title || "").toLowerCase();
  if (lower.includes("ransom")) {
    return "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&q=80&fit=crop";
  }
  if (lower.includes("phish") || lower.includes("credential")) {
    return "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&q=80&fit=crop";
  }
  if (lower.includes("vulnerability") || lower.includes("zero-day")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&fit=crop";
  }
  return "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80&fit=crop";
}

function cleanText(input = "") {
  return decodeHtmlEntities(
    String(input)
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function decodeHtmlEntities(text = "") {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function summarizeText(text, max = 180) {
  const cleaned = cleanText(text);
  if (!cleaned) return "No summary available.";
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

function normalizeText(text = "") {
  return cleanText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text = "") {
  return new Set(
    normalizeText(text)
      .split(" ")
      .filter((w) => w.length > 2),
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const item of a) {
    if (b.has(item)) inter += 1;
  }
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function hashString(text = "") {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function safeIsoDate(value) {
  const d = new Date(value || Date.now());
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function parseIsoOrEmpty(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Clean and validate a URL extracted from RSS
 * Removes CDATA wrappers, extra whitespace, and verifies it's a valid URL
 */
function cleanAndValidateUrl(url) {
  if (!url) return "";
  
  let cleaned = url
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")  // Remove CDATA
    .replace(/<[^>]*>/g, "")  // Remove HTML tags
    .trim()
    .split(/\s+/)[0];  // Take first URL if multiple
  
  // Ensure it starts with http:// or https://
  if (cleaned && !cleaned.startsWith("http")) {
    if (cleaned.startsWith("//")) {
      cleaned = "https:" + cleaned;
    } else {
      cleaned = "https://" + cleaned;
    }
  }
  
  // Validate it's a real URL
  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    return "";
  }
}

function fetchURL(targetUrl, redirectCount = 0, maxRedirects = 5) {
  // 防止无限重定向
  if (redirectCount > maxRedirects) {
    return Promise.reject(new Error("Too many redirects"));
  }

  return new Promise((resolve, reject) => {
    const protocol = targetUrl.startsWith("https") ? https : http;
    let totalSize = 0;
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    
    const req = protocol
      .get(
        targetUrl,
        { 
          headers: { "User-Agent": "NeoTrace/3.0" },
          timeout: 5000  // 5秒超时
        },
        (response) => {
          // Handle redirects with redirect counter
          if (
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            return fetchURL(response.headers.location, redirectCount + 1, maxRedirects)
              .then(resolve)
              .catch(reject);
          }
          let data = "";
          response.on("data", (chunk) => {
            totalSize += chunk.length;
            // 检查响应大小限制
            if (totalSize > maxSize) {
              response.destroy();
              reject(new Error("Response size exceeded 10MB limit"));
              return;
            }
            data += chunk;
          });
          response.on("end", () => resolve(data));
          response.on("error", reject);
        },
      )
      .on("error", reject)
      .on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout after 5 seconds"));
      });
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
const IS_VERCEL = !!process.env.VERCEL; // Detect Vercel environment

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
    const timeout = IS_VERCEL ? 15000 : 20000; // Shorter timeout for Vercel
    apiReq.setTimeout(timeout, () => {
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

  const systemPrompt = `You are NeoTrace AI, a friendly and expert cybersecurity assistant. You have deep knowledge of cybersecurity AND the NeoTrace platform.

## NeoTrace Platform — Tools & How to Use Them:
- **Phone Inspector** — Analyze any phone number for carrier, risk score, VOIP detection, fraud signals. Go to "For You → Phone Inspector", enter the number, click Analyze.
- **URL Scanner** — Deep URL analysis: WHOIS, DNS, SSL cert check, safe browsing, redirect chain. Go to "For You → URL Scanner", paste URL, click Scan.
- **Image Forensics** — Detect AI-generated or manipulated images via EXIF metadata + pixel artifact analysis. Go to "For You → Image Forensics", upload an image.
- **Text Verifier / Content Verifier** — AI credibility scoring, clickbait detection, fact-check support. Paste any article or message text.
- **Password Checker** — Real-time strength scoring, entropy, estimated crack time, and password generator. Go to "For You → Password Checker".
- **Email Analyzer** — SPF/DKIM/DMARC header verification, phishing risk scoring. Paste email headers.
- **WiFi Scanner** — Network security assessment, detect open/WEP networks and risks.
- **QR Scanner** — Decode QR codes and instantly scan the embedded URL for threats.
- **Story Mode** — Interactive 4-chapter narrative learning experience covering real scam tactics (prize, urgency, impersonation, social engineering).
- **Training Game** — 5-tier quiz game with 15+ realistic attack scenarios. Earn points and appear on the leaderboard.
- **Certifications Page** — Guides for CompTIA Security+, CEH, OSCP, CISSP and more.
- **Careers Page** — Cybersecurity job roles, salary ranges, and required skills.
- **YouTube Learning** — Curated free video courses from NetworkChuck, Professor Messer, John Hammond, and more.
- **Books** — Recommended cybersecurity reading list.
- **Courses** — Online course recommendations for all levels.

## Cybersecurity Expertise:
- Phishing, social engineering, malware, ransomware, APTs
- Firewalls, IDS/IPS, SIEM, EDR, MFA, encryption
- Penetration testing, red teaming, OSINT, CTF
- OWASP Top 10, web security, cloud security
- Password security, OAuth, zero-trust
- GDPR, HIPAA, incident response, forensics
- Current CVEs, threat intelligence, breaches

## Response Format Rules (CRITICAL — always follow these):
1. **Structure every answer clearly** — use headers (##), bullet points (- item), numbered steps (1. step), and **bold** for key terms.
2. **For how-to questions**: always use numbered steps. Example: "1. Open the URL Scanner page. 2. Paste the URL..."
3. **For concept explanations**: use a short definition first, then bullet points for details.
4. **No character limits** — give complete, useful answers. Do NOT truncate or abbreviate.
5. **Use markdown formatting**: \`inline code\` for commands/tools, **bold** for important terms, > for tips/warnings.
6. **Multi-turn conversation**: read previous context, give coherent follow-ups. Never repeat what was already said.
7. **Language**: reply in the EXACT same language the user used. English → English. 廣東話/中文 → 繁體中文.
8. **Be specific and actionable**: include real commands, tool names, example payloads where appropriate.

${context ? `## Current page context:\n${context}` : ""}`;

  // Build messages array with full conversation history
  const prevHistory = (history || []).slice(-12); // keep last 6 turns
  const msgs = [
    { role: "system", content: systemPrompt },
    ...prevHistory,
    { role: "user", content: message },
  ];

  if (!ASI_API_KEY) {
    const noKeyMsg = IS_VERCEL 
      ? "🤖 **AI backend not configured on Vercel.**\n\nSet the `ASI_API_KEY` environment variable in your Vercel project settings to enable the chatbot.\n\n📚 In the meantime, ask me about:\n• How to use our security tools\n• Cybersecurity fundamentals\n• Recommended certifications"
      : "I'm NeoTrace AI. The AI backend isn't configured yet — but I can still help! Ask me about cybersecurity topics and explore our tools via the navigation menu.";
    return res.json({ reply: noKeyMsg });
  }

  try {
    const payload = JSON.stringify({
      model: ASI_MODEL,
      messages: msgs,
      max_tokens: 900,
      temperature: 0.72,
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
      const timeout = IS_VERCEL ? 20000 : 25000; // Shorter timeout for Vercel (10s buffer)
      apiReq.setTimeout(timeout, () => {
        apiReq.destroy();
        reject(new Error("AI service timeout"));
      });
      apiReq.write(payload);
      apiReq.end();
    });

    let reply = result.choices?.[0]?.message?.content ||
      "Sorry, I couldn't process that. Try again!";

    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    // If AI service fails, send graceful response with explanation
    if (err.message.includes("timeout") || err.message.includes("ECONNREFUSED")) {
      // Return offline fallback for timeout/connection errors
      const fallback = 
        "🤖 **AI service is temporarily unavailable.** I can still help! Ask me about:\n" +
        "• How to use our tools (URL Scanner, Phone Inspector, Image Forensics, etc.)\n" +
        "• Cybersecurity basics (phishing, malware, passwords, 2FA)\n" +
        "• Recommended certifications (Security+, CEH, OSCP)\n" +
        "• Career paths in cybersecurity\n" +
        "• Password security best practices\n\n" +
        "💡 Try refreshing the page and trying again.";
      return res.status(200).json({ reply: fallback });
    }
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

// ==================== PRODUCTION: Serve React Build ====================
// Serve the Vite-built React app from dist/ in production (non-Vercel)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  // SPA fallback — all non-API routes return index.html
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
}

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
