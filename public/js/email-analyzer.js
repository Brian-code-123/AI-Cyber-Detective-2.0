/* email-analyzer.js — NeoTrace Email Header Analyzer */
'use strict';

/* ── Drag & drop setup ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const dropArea = document.getElementById('emlDropArea');
  if (!dropArea) return;

  ['dragenter', 'dragover'].forEach(e => {
    dropArea.addEventListener(e, ev => {
      ev.preventDefault();
      dropArea.style.borderColor = 'var(--accent)';
      dropArea.style.background = 'rgba(10,132,255,0.08)';
    });
  });
  ['dragleave', 'drop'].forEach(e => {
    dropArea.addEventListener(e, ev => {
      ev.preventDefault();
      dropArea.style.borderColor = '';
      dropArea.style.background = '';
    });
  });
  dropArea.addEventListener('drop', ev => {
    const file = ev.dataTransfer.files[0];
    if (file) readEmlFile(file);
  });
});

/* ── File handler ─────────────────────────────────────────────────────── */
function handleEmlFile(input) {
  const file = input.files[0];
  if (!file) return;
  readEmlFile(file);
}

function readEmlFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const content = e.target.result;
    // Extract only the headers section (everything before the first blank line)
    const blankLine = content.indexOf('\r\n\r\n');
    const blankLine2 = content.indexOf('\n\n');
    let headers = content;
    if (blankLine !== -1) headers = content.substring(0, blankLine);
    else if (blankLine2 !== -1) headers = content.substring(0, blankLine2);
    document.getElementById('headersInput').value = headers;
  };
  reader.readAsText(file);
}

/* ── Clear ───────────────────────────────────────────────────────────── */
function clearEmail() {
  document.getElementById('headersInput').value = '';
  document.getElementById('resultsArea').style.display = 'none';
  document.getElementById('noResults').style.display = 'block';
  document.getElementById('loadingArea').style.display = 'none';
}

/* ── Analyze ─────────────────────────────────────────────────────────── */
async function analyzeEmail() {
  const headers = document.getElementById('headersInput').value.trim();
  if (!headers) {
    alert('Please paste email headers or upload a .eml file first.');
    return;
  }

  document.getElementById('noResults').style.display = 'none';
  document.getElementById('resultsArea').style.display = 'none';
  document.getElementById('loadingArea').style.display = 'block';

  try {
    const res = await fetch('/api/email-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headers })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    renderResults(data);
  } catch (err) {
    document.getElementById('loadingArea').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';
    document.getElementById('noResults').querySelector('p').textContent = '❌ Error: ' + err.message;
  }
}

/* ── Render ──────────────────────────────────────────────────────────── */
function renderResults(data) {
  document.getElementById('loadingArea').style.display = 'none';
  document.getElementById('resultsArea').style.display = 'block';

  // Auth badges
  const badges = document.getElementById('authBadges');
  const authItems = [
    { label: 'SPF', result: data.spfResult },
    { label: 'DKIM', result: data.dkimResult },
    { label: 'DMARC', result: data.dmarcResult },
  ];
  badges.innerHTML = authItems.map(a => {
    const pass = /pass/i.test(a.result);
    const fail = /fail/i.test(a.result);
    const color = pass ? 'var(--green)' : fail ? 'var(--red)' : 'var(--orange)';
    const icon = pass ? '✅' : fail ? '❌' : '⚠️';
    return `
      <div class="auth-badge" style="background:rgba(0,0,0,0.2);border:1px solid ${color};border-radius:8px;padding:0.6rem 1rem;text-align:center;min-width:90px;">
        <div style="font-size:1.4rem;">${icon}</div>
        <div style="font-weight:700;font-size:0.9rem;color:${color};">${a.label}</div>
        <div style="font-size:0.72rem;color:var(--text-tertiary);">${a.result || 'none'}</div>
      </div>
    `;
  }).join('');

  // Risk bar
  const risk = Math.min(100, Math.max(0, data.riskScore || 0));
  const riskColor = risk >= 70 ? 'var(--red)' : risk >= 40 ? 'var(--orange)' : 'var(--green)';
  document.getElementById('riskValue').textContent = `${risk}/100`;
  document.getElementById('riskValue').style.color = riskColor;
  const fill = document.getElementById('riskFill');
  fill.style.width = risk + '%';
  fill.style.background = riskColor;

  // Header details table
  const tbody = document.querySelector('#headerTable tbody');
  const fields = [
    ['From', data.from],
    ['Reply-To', data.replyTo],
    ['Return-Path', data.returnPath],
    ['Subject', data.subject],
    ['Date', data.date],
    ['Message-ID', data.messageId],
    ['X-Origin-IP', data.xOriginIp],
    ['X-Mailer', data.xMailer],
    ['Content-Type', data.contentType],
    ['Received Hops', data.receivedHops],
    ['From Domain', data.fromDomain],
    ['Reply-To Domain', data.replyToDomain],
  ];
  tbody.innerHTML = fields
    .filter(([, v]) => v && v !== 'none' && v !== undefined)
    .map(([k, v]) => `<tr><td style="color:var(--text-tertiary);white-space:nowrap;padding-right:1rem;">${k}</td><td style="word-break:break-all;">${escHtml(String(v))}</td></tr>`)
    .join('');

  // Flags
  const flagsList = document.getElementById('flagsList');
  if (data.flags && data.flags.length) {
    const iconMap = { danger: '🚨', warning: '⚠️', info: 'ℹ️', safe: '✅' };
    flagsList.innerHTML = data.flags.map(f => `
      <div class="flag-item flag-${f.t || f.type || 'info'}">
        <span class="flag-icon">${iconMap[f.t || f.type] || 'ℹ️'}</span>
        <span>${escHtml(f.m || f.message || '')}</span>
      </div>
    `).join('');
  } else {
    flagsList.innerHTML = '<p style="color:var(--green);font-size:0.85rem;">✅ No suspicious flags detected.</p>';
  }

  // AI summary
  const aiPanel = document.getElementById('aiPanel');
  const aiContent = document.getElementById('aiContent');
  if (data.aiSummary) {
    aiPanel.style.display = 'block';
    aiContent.textContent = data.aiSummary;
  } else {
    aiPanel.style.display = 'none';
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
