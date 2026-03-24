/**
 * ═══════════════════════════════════════════════════════════════════
 * INTEGRATION TESTS - NeoTrace API Security & Functionality
 * ═══════════════════════════════════════════════════════════════════
 * 
 * These tests verify the complete workflows of the NeoTrace API,
 * including security headers, CORS restrictions, rate limiting,
 * input validation, and core business logic.
 * 
 * Run: npm test -- test/integration.test.js
 */

const request = require('supertest');
const app = require('../server');

describe('NeoTrace Integration Tests', () => {
  
  // ═══════════════════════════════════════════════════════════════════
  // SECURITY HEADERS & CORS VALIDATION
  // ═══════════════════════════════════════════════════════════════════

  describe('Security Headers', () => {
    it('should return Helmet security headers', async () => {
      const res = await request(app).get('/');
      
      // X-Content-Type-Options: nosniff prevents MIME type sniffing
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      
      // X-Frame-Options: DENY prevents clickjacking
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should include CSP headers', async () => {
      const res = await request(app).get('/');
      
      // Content-Security-Policy restricts where resources can be loaded from
      expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('should include HSTS header for HTTPS', async () => {
      const res = await request(app).get('/');
      
      // Strict-Transport-Security enforces HTTPS
      expect(res.headers['strict-transport-security']).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // LEADERBOARD WORKFLOW
  // ═══════════════════════════════════════════════════════════════════

  describe('Leaderboard Workflow', () => {
    it('should fetch leaderboard without authentication', async () => {
      const res = await request(app).get('/api/leaderboard');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(Array.isArray(res.body.leaderboard)).toBe(true);
    });

    it('should add valid entry to leaderboard', async () => {
      const newEntry = {
        name: 'IntegrationTestPlayer',
        score: 750,
        rank: 'Expert',
        badge: 'Security Master',
      };

      const res = await request(app)
        .post('/api/leaderboard')
        .send(newEntry);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body).toHaveProperty('position');
      expect(typeof res.body.position).toBe('number');
    });

    it('should reject leaderboard entry with name too long (>50 chars)', async () => {
      const invalidEntry = {
        name: 'a'.repeat(51), // >50 chars - violates validation
        score: 500,
      };

      const res = await request(app)
        .post('/api/leaderboard')
        .send(invalidEntry);

      expect([400, 422]).toContain(res.statusCode);
    });

    it('should reject leaderboard entry with invalid score range', async () => {
      const invalidEntry = {
        name: 'TestPlayer',
        score: 10001, // >10000 - violates validation
      };

      const res = await request(app)
        .post('/api/leaderboard')
        .send(invalidEntry);

      expect([400, 422]).toContain(res.statusCode);
    });

    it('should reject leaderboard entry with HTML injection attempt', async () => {
      const xssEntry = {
        name: '<script>alert("xss")</script>',
        score: 500,
      };

      const res = await request(app)
        .post('/api/leaderboard')
        .send(xssEntry);

      expect([400, 422]).toContain(res.statusCode);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // URL ANALYZER - SSRF & SECURITY TESTS
  // ═══════════════════════════════════════════════════════════════════

  describe('URL Threat Analyzer - SSRF Protection', () => {
    it('should reject SSRF attempt to localhost', async () => {
      const res = await request(app)
        .post('/api/analyze-url')
        .send({ url: 'http://localhost:3000' });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('SSRF');
    });

    it('should reject SSRF attempt to 127.0.0.1', async () => {
      const res = await request(app)
        .post('/api/analyze-url')
        .send({ url: 'http://127.0.0.1:8080' });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('SSRF');
    });

    it('should reject SSRF attempt to private IP (192.168.x.x)', async () => {
      const res = await request(app)
        .post('/api/analyze-url')
        .send({ url: 'http://192.168.1.1' });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('SSRF');
    });

    it('should reject SSRF attempt to private IP (10.x.x.x)', async () => {
      const res = await request(app)
        .post('/api/analyze-url')
        .send({ url: 'http://10.0.0.1' });

      expect(res.statusCode).toBe(403);
    });

    it('should validate URL format before DNS lookup', async () => {
      const res = await request(app)
        .post('/api/analyze-url')
        .send({ url: 'not a valid url' });

      expect([400, 403]).toContain(res.statusCode);
    });

    it('should reject URLs exceeding maximum length (2048 chars)', async () => {
      const longUrl = 'http://example.com/' + 'a'.repeat(2100);
      
      const res = await request(app)
        .post('/api/analyze-url')
        .send({ url: longUrl });

      expect(res.statusCode).toBe(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // TEXT VERIFICATION - INPUT VALIDATION TESTS
  // ═══════════════════════════════════════════════════════════════════

  describe('Text Verification - Input Validation', () => {
    it('should accept valid text for verification', async () => {
      const res = await request(app)
        .post('/api/verify-text')
        .send({ text: 'This is a legitimate news article about cybersecurity.' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('riskScore');
      expect(res.body).toHaveProperty('riskLevel');
    });

    it('should reject empty text', async () => {
      const res = await request(app)
        .post('/api/verify-text')
        .send({ text: '' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject text exceeding 100,000 characters', async () => {
      const hugeText = 'a'.repeat(100001);
      
      const res = await request(app)
        .post('/api/verify-text')
        .send({ text: hugeText });

      expect(res.statusCode).toBe(400);
    });

    it('should detect clickbait patterns', async () => {
      const clickbaitText = "SHOCKING: You WON'T BELIEVE What This Celebrity Did!!! CLICK HERE NOW!!!";
      
      const res = await request(app)
        .post('/api/verify-text')
        .send({ text: clickbaitText });

      expect(res.statusCode).toBe(200);
      expect(res.body.riskScore).toBeGreaterThan(30); // Should have elevated risk
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════

  describe('Error Handling & Validation', () => {
    it('should handle malformed JSON gracefully', async () => {
      const res = await request(app)
        .post('/api/leaderboard')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect([400, 422]).toContain(res.statusCode);
    });

    it('should provide meaningful error messages', async () => {
      const res = await request(app)
        .post('/api/leaderboard')
        .send({ name: 'a'.repeat(51), score: 500 });

      expect(res.body).toHaveProperty('error');
      expect(typeof res.body.error).toBe('string');
    });

    it('should handle missing endpoints gracefully', async () => {
      const res = await request(app).get('/api/nonexistent');
      
      expect(res.statusCode).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // STATIC CONTENT SERVING
  // ═══════════════════════════════════════════════════════════════════

  describe('Static Content Serving', () => {
    it('should serve index.html', async () => {
      const res = await request(app).get('/');
      
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('html');
    });

    it('should serve CSS files from public/css/', async () => {
      const res = await request(app).get('/css/style.css');
      
      expect([200, 304]).toContain(res.statusCode);
    });
  });
});
