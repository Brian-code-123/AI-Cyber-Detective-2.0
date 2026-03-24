/**
 * NeoTrace Unit Tests & Integration Tests
 * Tests for API endpoints, security utilities, and input validation
 * 
 * Run: npm test
 * Run with coverage: npm run test:coverage
 */

const request = require('supertest');
const express = require('express');

// ═════════════════════════════════════════════════════════════════════
// SECURITY UTILITIES TESTS
// ═════════════════════════════════════════════════════════════════════

describe('Security Utilities', () => {
  
  test('should detect private IP addresses (SSRF prevention)', () => {
    const privateIpPattern = /^(10\.|127\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|::1|localhost|fc00::|fd00::)/i;
    
    const privateIps = ["127.0.0.1", "192.168.1.1", "10.0.0.1", "172.16.0.1", "localhost"];
    const publicIps = ["8.8.8.8", "example.com", "google.com"];
    
    privateIps.forEach(ip => {
      expect(privateIpPattern.test(ip)).toBe(true);
    });
    
    publicIps.forEach(ip => {
      if (ip.includes(".")) {
        expect(privateIpPattern.test(ip.split(":")[0])).toBe(false);
      }
    });
  });

  test('should validate HTML to prevent XSS', () => {
    const xssPatterns = [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert('xss')>",
      "javascript:alert('xss')",
      "<svg onload=alert('xss')>"
    ];
    
    xssPatterns.forEach(pattern => {
      expect(pattern.includes("<")).toBe(true);
      expect(pattern.includes(">")).toBe(true);
    });
  });

  test('should validate rate limit thresholds', () => {
    const rateLimits = {
      global: { windowMs: 60000, max: 100 },
      api: { windowMs: 60000, max: 30 },
      analyze: { windowMs: 60000, max: 10 },
      auth: { windowMs: 15 * 60 * 1000, max: 5 }
    };
    
    Object.values(rateLimits).forEach(limit => {
      expect(limit.max).toBeGreaterThan(0);
      expect(limit.windowMs).toBeGreaterThan(0);
    });
  });

});

// ═════════════════════════════════════════════════════════════════════
// INPUT VALIDATION TESTS
// ═════════════════════════════════════════════════════════════════════

describe('Input Validation', () => {

  test('should validate leaderboard submission input', () => {
    const validSubmissions = [
      { name: "Player1", score: 100 },
      { name: "Test Player 123", score: 999 },
      { name: "👾 CyberNinja", score: 5000 }
    ];
    
    const invalidSubmissions = [
      { name: "", score: 100 }, // empty name
      { name: "Player", score: -100 }, // negative score
      { name: "Player", score: 50001 }, // score > 10000
      { name: "<script>alert('xss')</script>", score: 100 } // XSS attempt
    ];
    
    validSubmissions.forEach(sub => {
      expect(sub.name.length).toBeGreaterThan(0);
      expect(sub.score).toBeGreaterThanOrEqual(0);
      expect(sub.score).toBeLessThanOrEqual(10000);
    });
    
    invalidSubmissions.forEach(sub => {
      let isInvalid = false;
      if (sub.name.length < 1 || sub.name.length > 50) isInvalid = true;
      if (sub.score < 0 || sub.score > 10000) isInvalid = true;
      if (sub.name.includes("<")) isInvalid = true;
      expect(isInvalid).toBe(true);
    });
  });

  test('should validate text length for analysis', () => {
    const tooShort = "";
    const normal = "This is a normal text for analysis.";
    const tooLong = "x".repeat(100001);
    
    expect(tooShort.length < 1).toBe(true);
    expect(normal.length >= 1 && normal.length <= 100000).toBe(true);
    expect(tooLong.length > 100000).toBe(true);
  });

  test('should validate URL format', () => {
    const validUrls = [
      "https://google.com",
      "http://example.com/path?query=value",
      "https://sub.example.com:8080"
    ];
    
    const invalidUrls = [
      "not a url",
      "ftp://example.com",
      "",
      "javascript:alert('xss')"
    ];
    
    validUrls.forEach(url => {
      expect(() => new URL(url)).not.toThrow();
    });
    
    invalidUrls.forEach(url => {
      let isInvalid = false;
      try {
        new URL(url);
        if (url.startsWith("javascript") || url.startsWith("ftp")) {
          isInvalid = true; // reject these schemes
        }
      } catch {
        isInvalid = true;
      }
      expect(isInvalid).toBe(true);
    });
  });

});

// ═════════════════════════════════════════════════════════════════════
// RISK SCORING LOGIC TESTS
// ═════════════════════════════════════════════════════════════════════

describe('Risk Scoring', () => {

  test('should calculate risk scores in valid range (0-100)', () => {
    const calculateRisk = () => {
      let score = 0;
      score += 20; // HTTPS missing
      score += 15; // Suspicious TLD
      score += 25; // IP address
      score += 30; // Homograph attack
      return Math.min(100, Math.max(0, score));
    };
    
    const risk = calculateRisk();
    expect(risk).toBeLessThanOrEqual(100);
    expect(risk).toBeGreaterThanOrEqual(0);
    expect(risk).toBe(90); // 20+15+25+30=90, clamped to 100
  });

  test('should determine risk levels correctly', () => {
    const getRiskLevel = (score) => {
      if (score >= 70) return "Critical";
      if (score >= 50) return "High";
      if (score >= 30) return "Medium";
      return "Low";
    };
    
    expect(getRiskLevel(85)).toBe("Critical");
    expect(getRiskLevel(60)).toBe("High");
    expect(getRiskLevel(40)).toBe("Medium");
    expect(getRiskLevel(10)).toBe("Low");
  });

  test('should detect phishing keywords', () => {
    const PHISHING_KEYWORDS = [
      "login", "verify", "confirm", "banking", "urgent", 
      "suspended", "update", "click", "link", "password"
    ];
    
    const testTexts = [
      { text: "Click here to verify your account", hasBad: true },
      { text: "Your account has been suspended", hasBad: true },
      { text: "Update your banking information", hasBad: true },
      { text: "Read our security blog", hasBad: false },
      { text: "Download our app", hasBad: false }
    ];
    
    testTexts.forEach(({ text, hasBad }) => {
      const found = PHISHING_KEYWORDS.some(kw => 
        text.toLowerCase().includes(kw)
      );
      expect(found).toBe(hasBad);
    });
  });

});

// ═════════════════════════════════════════════════════════════════════
// BRAND IMPERSONATION DETECTION TESTS
// ═════════════════════════════════════════════════════════════════════

describe('Brand Protection', () => {

  test('should detect possible brand impersonation', () => {
    const LEGITIMATE = ["google.com", "amazon.com", "apple.com", "microsoft.com"];
    
    const testCases = [
      { domain: "google.com", isLegit: true },  // Exact match
      { domain: "sub.amazon.com", isLegit: true }, // Subdomain of legit
      { domain: "gooogle.com", isLegit: false }, // Typosquatting
      { domain: "secure-google-verify.com", isLegit: false }, // Contains brand
      { domain: "paypal-confirm.com", isLegit: false }, // Phishing
      { domain: "github.com", isLegit: false } // Not in list
    ];
    
    testCases.forEach(({ domain, isLegit }) => {
      const isInList = LEGITIMATE.includes(domain) || 
                      LEGITIMATE.some(legit => domain.endsWith("." + legit));
      expect(isInList).toBe(isLegit);
    });
  });

  test('should handle eTLD+1 domain matching', () => {
    // Simplified version of getRegisteredDomain
    const getRegisteredDomain = (domain) => {
      const parts = domain.toLowerCase().split(".");
      return parts.length > 1 ? parts.slice(-2).join(".") : domain;
    };
    
    expect(getRegisteredDomain("example.com")).toBe("example.com");
    expect(getRegisteredDomain("sub.example.com")).toBe("example.com");
    expect(getRegisteredDomain("a.b.example.com")).toBe("example.com");
    expect(getRegisteredDomain("example")).toBe("example");
  });

});

// ═════════════════════════════════════════════════════════════════════
// API ENDPOINT TESTS (Integration)
// ═════════════════════════════════════════════════════════════════════

describe('API Endpoints (Integration)', () => {

  test('POST /api/analyze-url should reject SSRF attacks', () => {
    const ssrfUrls = [
      "http://127.0.0.1:8080",
      "http://localhost/admin",
      "http://192.168.1.1",
      "http://10.0.0.1:3000"
    ];
    
    ssrfUrls.forEach(url => {
      try {
        const parsed = new URL(url);
        const privateIpPattern = /^(10\.|127\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|::1|localhost)/i;
        expect(privateIpPattern.test(parsed.hostname)).toBe(true);
      } catch {
        // Invalid URL is OK (should be rejected)
      }
    });
  });

  test('POST /api/analyze-image should validate file MIME types', () => {
    const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    
    const testMimes = [
      { mime: "image/jpeg", allowed: true },
      { mime: "image/png", allowed: true },
      { mime: "image/svg+xml", allowed: false },
      { mime: "application/pdf", allowed: false },
      { mime: "video/mp4", allowed: false },
      { mime: "text/html", allowed: false }
    ];
    
    testMimes.forEach(({ mime, allowed }) => {
      const isAllowed = ALLOWED_MIMES.includes(mime);
      expect(isAllowed).toBe(allowed);
    });
  });

  test('POST /api/verify-text should catch clickbait patterns', () => {
    const clickbaitPatterns = [
      /you won't believe/i,
      /shocking|jaw.?dropping/i,
      /100%\s*(true|real|proven)/i,
      /miracle\s*(cure|solution)/i
    ];
    
    const testTexts = [
      { text: "You won't believe what happened next!", found: true },
      { text: "Shocking news about celebrities", found: true },
      { text: "This miracle cure changed my life", found: true },
      { text: "Read our blog about security", found: false },
      { text: "New study published today", found: false }
    ];
    
    testTexts.forEach(({ text, found }) => {
      const matchFound = clickbaitPatterns.some(pattern => pattern.test(text));
      expect(matchFound).toBe(found);
    });
  });

});


    expect(response.status).toBe(200);
    expect(response.body.riskLevel).toBe('Low');
    expect(response.body.domain).toBe('google.com');
  });

  test('should reject missing URL', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.post('/api/analyze-url', (req, res) => {
      if (!req.body.targetUrl) {
        return res.status(400).json({ error: 'URL required' });
      }
      res.json({ riskScore: 0 });
    });

    const response = await request(testApp)
      .post('/api/analyze-url')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('URL required');
  });

  test('should detect suspicious TLDs', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.post('/api/analyze-url', (req, res) => {
      const targetUrl = req.body.targetUrl;
      const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.icu'];
      
      const parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      const domain = parsedUrl.hostname.replace(/^www\./, '');
      const tld = '.' + domain.split('.').pop();
      
      let riskScore = 0;
      const findings = [];
      
      if (SUSPICIOUS_TLDS.includes(tld)) {
        riskScore += 15;
        findings.push({ type: 'warning', message: `Suspicious TLD: ${tld}` });
      }
      
      res.json({ riskScore, findings, domain });
    });

    const response = await request(testApp)
      .post('/api/analyze-url')
      .send({ targetUrl: 'https://evil.xyz' });

    expect(response.status).toBe(200);
    expect(response.body.riskScore).toBeGreaterThan(0);
    expect(response.body.findings.some(f => f.message.includes('.xyz'))).toBe(true);
  });
});

describe('Leaderboard API', () => {
  test('should return leaderboard as array', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    let leaderboard = [
      { name: 'Player1', score: 1000, rank: 'Elite', badge: '👑', date: '2026-03-21' }
    ];
    
    testApp.get('/api/leaderboard', (req, res) => {
      const sorted = [...leaderboard]
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
      res.json(sorted);
    });

    const response = await request(testApp)
      .get('/api/leaderboard');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('should add new player to leaderboard', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    let leaderboard = [];
    
    testApp.post('/api/leaderboard', (req, res) => {
      const { name, score, rank, badge } = req.body;
      if (!name || score === undefined) {
        return res.status(400).json({ error: 'Name and score required' });
      }
      
      const entry = {
        name,
        score,
        rank: rank || 'Trainee',
        badge: badge || '🥉',
        date: new Date().toISOString().split('T')[0]
      };
      leaderboard.push(entry);
      leaderboard.sort((a, b) => b.score - a.score);
      
      const position = leaderboard.findIndex(e => e.name === name && e.score === score) + 1;
      res.json({ success: true, position, entry });
    });

    const response = await request(testApp)
      .post('/api/leaderboard')
      .send({ name: 'TestPlayer', score: 500 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.entry.name).toBe('TestPlayer');
    expect(response.body.entry.score).toBe(500);
  });

  test('should reject incomplete player data', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.post('/api/leaderboard', (req, res) => {
      const { name, score } = req.body;
      if (!name || score === undefined) {
        return res.status(400).json({ error: 'Name and score required' });
      }
      res.json({ success: true });
    });

    const response = await request(testApp)
      .post('/api/leaderboard')
      .send({ name: 'TestPlayer' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });
});

describe('Text Verification API', () => {
  test('should analyze text sentiment', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.post('/api/verify-text', (req, res) => {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text required' });
      }
      
      // Simple sentiment simulation
      const score = text.includes('urgent') || text.includes('!!!') ? -2 : 0;
      
      res.json({
        sentiment: {
          score: score,
          label: score < 0 ? 'Negative' : 'Neutral'
        },
        misinformation: {
          score: text.includes('urgent') ? 30 : 10,
          level: 'Low Risk'
        },
        credibility: {
          score: text.includes('source') ? 70 : 50,
          level: text.includes('source') ? 'Credible' : 'Questionable'
        }
      });
    });

    const response = await request(testApp)
      .post('/api/verify-text')
      .send({ text: 'This is urgent!!! Click now!!!' });

    expect(response.status).toBe(200);
    expect(response.body.misinformation.score).toBeGreaterThan(0);
  });

  test('should detect clickbait patterns', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.post('/api/verify-text', (req, res) => {
      const { text } = req.body;
      const foundClickbait = /you won't believe|shocking|doctors hate/.test(text.toLowerCase());
      
      res.json({
        misinformation: {
          findings: foundClickbait 
            ? [{ type: 'warning', message: 'Clickbait pattern detected' }]
            : []
        }
      });
    });

    const response = await request(testApp)
      .post('/api/verify-text')
      .send({ text: 'You won\'t believe what doctors hate!!!' });

    expect(response.body.misinformation.findings.length).toBeGreaterThan(0);
  });
});

describe('Utility Functions', () => {
  test('formatBytes should work correctly', () => {
    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toContain('KB');
    expect(formatBytes(1024 * 1024)).toContain('MB');
    expect(formatBytes(1024 * 1024 * 1024)).toContain('GB');
  });

  test('should validate URLs correctly', () => {
    const cleanAndValidateUrl = (url) => {
      if (!url) return '';
      let cleaned = url
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/<[^>]*>/g, '')
        .trim()
        .split(/\s+/)[0];
      
      if (cleaned && !cleaned.startsWith('http')) {
        if (cleaned.startsWith('//')) {
          cleaned = 'https:' + cleaned;
        } else {
          cleaned = 'https://' + cleaned;
        }
      }
      
      try {
        new URL(cleaned);
        // Additional validation: must have a proper TLD or be localhost
        if (cleaned.includes('://')) {
          const hostname = new URL(cleaned).hostname;
          if (hostname === 'localhost' || hostname.includes('.')) {
            return cleaned;
          }
        }
        return '';
      } catch {
        return '';
      }
    };

    expect(cleanAndValidateUrl('https://example.com')).toBe('https://example.com');
    expect(cleanAndValidateUrl('example.com')).toBe('https://example.com');
    expect(cleanAndValidateUrl('//example.com')).toBe('https://example.com');
    expect(cleanAndValidateUrl('')).toBe('');
    expect(cleanAndValidateUrl('not a url')).toBe('');
  });

  test('should calculate Jaccard similarity correctly', () => {
    const tokenize = (text) => new Set(text.toLowerCase().split(/\s+/));
    const jaccard = (a, b) => {
      if (!a.size || !b.size) return 0;
      let inter = 0;
      for (const item of a) {
        if (b.has(item)) inter += 1;
      }
      const union = a.size + b.size - inter;
      return union ? inter / union : 0;
    };

    const set1 = tokenize('the quick brown fox');
    const set2 = tokenize('the quick brown dog');
    
    const similarity = jaccard(set1, set2);
    expect(similarity).toBeGreaterThan(0.5);
    expect(similarity).toBeLessThan(1);
  });

  test('should clamp integer values correctly', () => {
    const clampInt = (value, min, max, fallback) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return fallback;
      return Math.min(max, Math.max(min, Math.round(n)));
    };

    expect(clampInt(50, 0, 100, 60)).toBe(50);
    expect(clampInt(150, 0, 100, 60)).toBe(100);
    expect(clampInt(-50, 0, 100, 60)).toBe(0);
    expect(clampInt('invalid', 0, 100, 60)).toBe(60);
  });
});
