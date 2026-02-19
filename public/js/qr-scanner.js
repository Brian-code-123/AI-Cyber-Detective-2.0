/* qr-scanner.js — NeoTrace QR Code Scanner */
'use strict';

let qrImageData = null;
let qrImageFile = null;

/* ── Drag & drop ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const dropArea = document.getElementById('qrDropArea');
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
    if (file && file.type.startsWith('image/')) loadQrImage(file);
  });
});

/* ── Handle file input ───────────────────────────────────────────────── */
function handleQrFile(input) {
  const file = input.files[0];
  if (!file) return;
  loadQrImage(file);
}

function loadQrImage(file) {
  qrImageFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('qrCanvas');
      // Scale down if too large
      const maxW = 360;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      qrImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      document.getElementById('previewWrap').style.display = 'block';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ── Clear ───────────────────────────────────────────────────────────── */
function clearQr() {
  qrImageData = null;
  qrImageFile = null;
  document.getElementById('qrFile').value = '';
  document.getElementById('previewWrap').style.display = 'none';
  document.getElementById('resultsArea').style.display = 'none';
  document.getElementById('noResults').style.display = 'block';
  document.getElementById('loadingArea').style.display = 'none';
  const canvas = document.getElementById('qrCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* ── Decode ──────────────────────────────────────────────────────────── */
async function decodeQr() {
  if (!qrImageData) {
    alert('Please upload a QR code image first.');
    return;
  }

  document.getElementById('noResults').style.display = 'none';
  document.getElementById('resultsArea').style.display = 'none';
  document.getElementById('loadingArea').style.display = 'block';
  document.getElementById('loadingMsg').textContent = 'Decoding QR code...';

  // Use jsQR to decode
  let decoded = null;
  try {
    decoded = jsQR(qrImageData.data, qrImageData.width, qrImageData.height, {
      inversionAttempts: 'dontInvert'
    });
    // Try inverted if not found
    if (!decoded) {
      decoded = jsQR(qrImageData.data, qrImageData.width, qrImageData.height, {
        inversionAttempts: 'onlyInvert'
      });
    }
  } catch (err) {
    document.getElementById('loadingArea').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';
    document.getElementById('noResults').querySelector('p').textContent = '❌ Decode error: ' + err.message;
    return;
  }

  if (!decoded || !decoded.data) {
    document.getElementById('loadingArea').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';
    document.getElementById('noResults').querySelector('p').textContent = '❌ No QR code detected in the image. Try a clearer, higher-contrast image.';
    return;
  }

  const decodedText = decoded.data;

  // Show decoded content
  document.getElementById('decodedContent').textContent = decodedText;

  // Determine content type
  const contentTypeEl = document.getElementById('contentType');
  const isUrl = /^https?:\/\//i.test(decodedText) || /^www\./i.test(decodedText);
  const isEmail = /^mailto:/i.test(decodedText);
  const isPhone = /^tel:/i.test(decodedText);
  const isVCard = /BEGIN:VCARD/i.test(decodedText);
  const isWifi = /^WIFI:/i.test(decodedText);

  let typeLabel, typeColor;
  if (isUrl) { typeLabel = '🔗 URL'; typeColor = 'var(--accent)'; }
  else if (isEmail) { typeLabel = '📧 Email'; typeColor = 'var(--purple)'; }
  else if (isPhone) { typeLabel = '📞 Phone'; typeColor = 'var(--green)'; }
  else if (isVCard) { typeLabel = '👤 vCard'; typeColor = 'var(--teal)'; }
  else if (isWifi) { typeLabel = '📶 WiFi Config'; typeColor = 'var(--orange)'; }
  else { typeLabel = '📄 Plain Text'; typeColor = 'var(--text-secondary)'; }

  contentTypeEl.innerHTML = `<span style="font-size:0.8rem;font-weight:600;color:${typeColor};background:rgba(0,0,0,0.15);padding:0.2rem 0.6rem;border-radius:20px;">${typeLabel}</span>`;

  // If URL: scan it
  if (isUrl || /^www\./i.test(decodedText)) {
    const url = decodedText.startsWith('www.') ? 'https://' + decodedText : decodedText;
    document.getElementById('loadingMsg').textContent = 'Scanning URL for threats...';
    await analyzeUrl(url);
  } else if (isWifi) {
    // Parse WiFi QR: WIFI:T:WPA;S:NetworkName;P:password;;
    const ssidMatch = decodedText.match(/S:([^;]+)/);
    const typeMatch = decodedText.match(/T:([^;]+)/);
    const ssid = ssidMatch ? ssidMatch[1] : '';
    const security = typeMatch ? typeMatch[1].toLowerCase() : 'unknown';
    // Redirect to wifi scanner with pre-filled data
    document.getElementById('loadingArea').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'block';
    document.getElementById('urlResultPanel').style.display = 'none';
    document.getElementById('whoisPanel').style.display = 'none';
    document.getElementById('aiPanel').style.display = 'block';
    document.getElementById('aiContent').textContent = `WiFi QR Code detected:\n• SSID: ${ssid || '(hidden)'}\n• Security: ${security.toUpperCase()}\n\nTip: Scan this WiFi network in our WiFi Scanner tool for a full security assessment.`;
  } else {
    document.getElementById('loadingArea').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'block';
    document.getElementById('urlResultPanel').style.display = 'none';
    document.getElementById('whoisPanel').style.display = 'none';
    document.getElementById('aiPanel').style.display = 'none';
  }
}

/* ── URL threat analysis via existing endpoint ───────────────────────── */
async function analyzeUrl(url) {
  try {
    const res = await fetch('/api/analyze-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    renderUrlResults(data, url);
  } catch (err) {
    document.getElementById('loadingArea').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'block';
    document.getElementById('urlResultPanel').style.display = 'none';
    document.getElementById('aiPanel').style.display = 'block';
    document.getElementById('aiContent').textContent = 'URL scan unavailable: ' + err.message;
  }
}

function renderUrlResults(data, url) {
  document.getElementById('loadingArea').style.display = 'none';
  document.getElementById('resultsArea').style.display = 'block';

  const panel = document.getElementById('urlResultPanel');
  panel.style.display = 'block';

  // Risk
  const risk = Math.min(100, Math.max(0, data.riskScore || data.score || 0));
  const riskColor = risk >= 70 ? 'var(--red)' : risk >= 40 ? 'var(--orange)' : 'var(--green)';
  document.getElementById('urlRiskValue').textContent = `${risk}/100`;
  document.getElementById('urlRiskValue').style.color = riskColor;
  const fill = document.getElementById('urlRiskFill');
  fill.style.width = risk + '%';
  fill.style.background = riskColor;

  // URL details
  const details = document.getElementById('urlDetails');
  const rows = [
    ['URL', url],
    ['Domain', data.domain || new URL(url).hostname],
    ['Protocol', url.startsWith('https') ? '✅ HTTPS' : '⚠️ HTTP'],
    ['IP', data.ip || '—'],
    ['Country', data.country || '—'],
    ['Hosting', data.hosting || data.org || '—'],
  ];
  details.innerHTML = `<table class="detail-table"><tbody>${
    rows.filter(([,v]) => v && v !== '—').map(([k, v]) =>
      `<tr><td style="color:var(--text-tertiary);padding-right:1rem;white-space:nowrap;">${k}</td><td style="word-break:break-all;">${escHtml(String(v))}</td></tr>`
    ).join('')
  }</tbody></table>`;

  // Flags
  const flags = document.getElementById('urlFlags');
  if (data.flags && data.flags.length) {
    const iconMap = { danger: '🚨', warning: '⚠️', info: 'ℹ️', safe: '✅' };
    flags.innerHTML = data.flags.map(f => `
      <div class="flag-item flag-${f.t || f.type || 'info'}">
        <span class="flag-icon">${iconMap[f.t || f.type] || 'ℹ️'}</span>
        <span>${escHtml(f.m || f.message || String(f))}</span>
      </div>
    `).join('');
  }

  // WHOIS / domain info
  if (data.registrar || data.created || data.age) {
    document.getElementById('whoisPanel').style.display = 'block';
    const whoisRows = [
      ['Registrar', data.registrar],
      ['Registered', data.created],
      ['Domain Age', data.age],
      ['SSL Valid', data.ssl ? '✅ Yes' : '—'],
    ];
    document.getElementById('whoisContent').innerHTML = whoisRows
      .filter(([,v]) => v)
      .map(([k, v]) => `<div class="info-row"><span style="color:var(--text-tertiary);">${k}:</span><span>${escHtml(String(v))}</span></div>`)
      .join('');
  }

  // AI
  if (data.aiSummary || data.summary) {
    document.getElementById('aiPanel').style.display = 'block';
    document.getElementById('aiContent').textContent = data.aiSummary || data.summary;
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
