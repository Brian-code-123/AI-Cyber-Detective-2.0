/* password-checker.js — NeoTrace Password Strength Checker */
'use strict';

let pwVisible = false;
let lastPwValue = '';
let aiRequested = false;

/* ── Visibility toggle ─────────────────────────────────────────────── */
function togglePwVisibility() {
  const input = document.getElementById('pwInput');
  const btn = document.getElementById('togglePw');
  pwVisible = !pwVisible;
  input.type = pwVisible ? 'text' : 'password';
  btn.textContent = pwVisible ? '🙈' : '👁️';
}

/* ── Main analysis function ─────────────────────────────────────────── */
function analyzePassword(value) {
  lastPwValue = value;
  const noResults = document.getElementById('noResults');
  const resultsArea = document.getElementById('resultsArea');
  const aiPanel = document.getElementById('aiPanel');

  if (!value) {
    noResults.style.display = 'block';
    resultsArea.style.display = 'none';
    resetBar();
    return;
  }

  noResults.style.display = 'none';
  resultsArea.style.display = 'block';

  const result = zxcvbn(value);
  renderBar(result, value);
  renderScoreGrid(result, value);
  renderCriteria(value);
  renderSuggestions(result);

  // Show AI panel after first analysis
  aiPanel.style.display = 'block';
  if (!aiRequested) {
    document.getElementById('aiContent').textContent = '';
  }
}

/* ── Strength bar ───────────────────────────────────────────────────── */
function resetBar() {
  document.getElementById('barFill').style.width = '0%';
  document.getElementById('barFill').className = 'pw-bar-fill';
  document.getElementById('strengthLabel').textContent = '—';
  document.getElementById('entropyLabel').textContent = '';
}

function renderBar(result, value) {
  // Map zxcvbn 0-4 score to 0-100
  const score = result.score; // 0-4
  const pct = Math.round((score / 4) * 100);
  const entropy = Math.round(result.guesses_log10 * 3.32); // approx bits

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#ff3b30', '#ff9f0a', '#ffd60a', '#30d158', '#30d158'];
  const barColors = ['#ff3b30', '#ff9f0a', '#ffd60a', '#30d158', '#0a84ff'];

  const fill = document.getElementById('barFill');
  fill.style.width = Math.max(pct, 5) + '%';
  fill.style.background = barColors[score];

  document.getElementById('strengthLabel').textContent = labels[score];
  document.getElementById('strengthLabel').style.color = colors[score];

  const crackTime = result.crack_times_display.offline_slow_hashing_1e4_per_second;
  document.getElementById('entropyLabel').textContent = `~${entropy} bits entropy · Crack: ${crackTime}`;
}

/* ── Score grid KPIs ───────────────────────────────────────────────── */
function renderScoreGrid(result, value) {
  const score = result.score;
  const entropy = Math.round(result.guesses_log10 * 3.32);
  const crackTime = result.crack_times_display.offline_slow_hashing_1e4_per_second;
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#ff3b30', '#ff9f0a', '#ffd60a', '#30d158', '#0a84ff'];

  const kpis = [
    { icon: '🏋️', label: 'Score', value: `${score}/4`, sub: labels[score], color: colors[score] },
    { icon: '🔢', label: 'Entropy', value: `${entropy}`, sub: 'bits' },
    { icon: '⏱️', label: 'Crack Time', value: crackTime, sub: 'offline slow hash' },
    { icon: '📏', label: 'Length', value: value.length, sub: `${value.length >= 16 ? '✅ Excellent' : value.length >= 12 ? '⚠️ OK' : '❌ Short'}` },
    { icon: '🔢', label: 'Guess Rank', value: `10^${result.guesses_log10.toFixed(1)}`, sub: 'guesses needed' },
    { icon: '🧩', label: 'Patterns', value: result.sequence.length, sub: 'detected patterns' },
  ];

  const grid = document.getElementById('scoreGrid');
  grid.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-value" style="${k.color ? `color:${k.color}` : ''}">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>
  `).join('');
}

/* ── Criteria checklist ─────────────────────────────────────────────── */
function renderCriteria(pw) {
  const checks = [
    { label: '12+ characters', ok: pw.length >= 12 },
    { label: '16+ characters (excellent)', ok: pw.length >= 16 },
    { label: 'Uppercase letters (A-Z)', ok: /[A-Z]/.test(pw) },
    { label: 'Lowercase letters (a-z)', ok: /[a-z]/.test(pw) },
    { label: 'Numbers (0-9)', ok: /[0-9]/.test(pw) },
    { label: 'Symbols (!@#$…)', ok: /[^A-Za-z0-9]/.test(pw) },
    { label: 'No common patterns', ok: !/(123|abc|password|qwerty|letmein)/i.test(pw) },
    { label: 'No keyboard walks', ok: !/(qwer|asdf|zxcv|1234|abcd)/i.test(pw) },
  ];

  const list = document.getElementById('criteriaList');
  list.innerHTML = checks.map(c => `
    <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:${c.ok ? 'var(--green)' : 'var(--text-tertiary)'};">
      <span style="font-size:1rem;">${c.ok ? '✅' : '⬜'}</span>
      <span>${c.label}</span>
    </div>
  `).join('');
}

/* ── Suggestions ─────────────────────────────────────────────────────── */
function renderSuggestions(result) {
  const panel = document.getElementById('suggestionsPanel');
  const list = document.getElementById('suggestionsList');
  const suggestions = [];

  if (result.feedback.warning) {
    suggestions.push({ type: 'warning', text: result.feedback.warning });
  }
  result.feedback.suggestions.forEach(s => {
    suggestions.push({ type: 'info', text: s });
  });

  if (!suggestions.length) {
    list.innerHTML = '<p style="color:var(--green);font-size:0.85rem;">✅ No immediate issues found!</p>';
    return;
  }

  list.innerHTML = suggestions.map(s => `
    <div class="flag-item flag-${s.type === 'warning' ? 'danger' : 'warning'}">
      <span class="flag-icon">${s.type === 'warning' ? '⚠️' : '💡'}</span>
      <span>${s.text}</span>
    </div>
  `).join('');
}

/* ── Generate password ─────────────────────────────────────────────── */
function generatePassword() {
  const length = 16;
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const all = upper + lower + digits + symbols;

  let pw = '';
  // Ensure at least one from each set
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  pw += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = pw.length; i < length; i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  pw = pw.split('').sort(() => Math.random() - 0.5).join('');

  const genPanel = document.getElementById('genPanel');
  const genPwEl = document.getElementById('genPw');
  genPanel.style.display = 'block';
  genPwEl.textContent = pw;

  // Also analyze the generated password
  const input = document.getElementById('pwInput');
  input.value = pw;
  analyzePassword(pw);
}

function copyGenPw() {
  const pw = document.getElementById('genPw').textContent;
  if (!pw) return;
  navigator.clipboard.writeText(pw).then(() => {
    const btn = document.querySelector('#genPanel .cyber-btn');
    const orig = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = pw;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

/* ── AI Advice ───────────────────────────────────────────────────────── */
async function getAIAdvice() {
  const pw = lastPwValue;
  if (!pw) return;

  const btn = document.getElementById('aiBtn');
  const content = document.getElementById('aiContent');

  btn.disabled = true;
  btn.textContent = '🤖 Analyzing...';
  content.textContent = '';

  const result = zxcvbn(pw);
  const score = result.score;
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const entropy = Math.round(result.guesses_log10 * 3.32);
  const patterns = result.sequence.map(s => s.pattern).join(', ');

  const msg = `Analyze this password profile for a cybersecurity education platform:
- Strength: ${labels[score]} (${score}/4)
- Length: ${pw.length} characters
- Entropy: ~${entropy} bits
- Detected patterns: ${patterns || 'none'}
- Warning: ${result.feedback.warning || 'none'}
- Suggestions from zxcvbn: ${result.feedback.suggestions.join('; ') || 'none'}

Please provide:
1. A brief assessment of why this password is or isn't secure
2. Two specific, actionable improvements
3. One example of a secure password pattern (not a real password)
Keep it concise, educational, and under 150 words.`;

  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await response.json();
    content.textContent = data.reply || data.message || 'AI analysis unavailable.';
    aiRequested = true;
    btn.textContent = '🔄 Re-analyze';
  } catch (err) {
    content.textContent = 'AI service unavailable. Please try again later.';
  } finally {
    btn.disabled = false;
  }
}
