/* wifi-scanner.js — NeoTrace WiFi Security Scanner */
'use strict';

/* ── On load: populate browser connection info ──────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    document.getElementById('connType').textContent = conn.type || '—';
    document.getElementById('connEffective').textContent = conn.effectiveType || '—';
    document.getElementById('connDownlink').textContent = conn.downlink ? conn.downlink + ' Mbps' : '—';
    document.getElementById('connRtt').textContent = conn.rtt ? conn.rtt + ' ms' : '—';
  } else {
    document.getElementById('connType').textContent = 'API not supported';
    document.getElementById('connEffective').textContent = '—';
    document.getElementById('connDownlink').textContent = '—';
    document.getElementById('connRtt').textContent = '—';
  }
});

/* ── Scan ────────────────────────────────────────────────────────────── */
async function scanWifi() {
  const ssid = document.getElementById('ssidInput').value.trim();
  const security = document.getElementById('securityInput').value;
  const signal = parseInt(document.getElementById('signalInput').value, 10);
  const vendor = document.getElementById('vendorInput').value.trim();

  if (!ssid && !security) {
    alert('Please enter at least the network name or security type.');
    return;
  }

  document.getElementById('resultsArea').style.display = 'none';
  document.getElementById('loadingArea').style.display = 'block';

  try {
    const res = await fetch('/api/wifi-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssid, security, signal, vendor })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    renderResults(data);
  } catch (err) {
    document.getElementById('loadingArea').style.display = 'none';
    alert('Error: ' + err.message);
  }
}

/* ── Render ──────────────────────────────────────────────────────────── */
function renderResults(data) {
  document.getElementById('loadingArea').style.display = 'none';
  document.getElementById('resultsArea').style.display = 'block';

  const risk = Math.min(100, Math.max(0, data.riskScore || 0));
  const riskColor = risk >= 70 ? 'var(--red)' : risk >= 40 ? 'var(--orange)' : 'var(--green)';
  const riskLabel = risk >= 70 ? 'HIGH RISK' : risk >= 40 ? 'MODERATE RISK' : 'LOW RISK';

  document.getElementById('riskLabel').textContent = riskLabel;
  document.getElementById('riskLabel').style.color = riskColor;
  document.getElementById('riskValue').textContent = `${risk}/100`;
  document.getElementById('riskValue').style.color = riskColor;
  const fill = document.getElementById('riskFill');
  fill.style.width = risk + '%';
  fill.style.background = riskColor;

  // Score grid
  const securityLabel = {
    open: 'Open', wep: 'WEP', wpa: 'WPA', wpa2: 'WPA2', wpa3: 'WPA3', unknown: 'Unknown', '': 'Unknown'
  }[data.security || ''] || data.security || '—';
  const securityScore = {
    open: '❌', wep: '🔴', wpa: '🟠', wpa2: '🟡', wpa3: '✅'
  }[data.security] || '❓';

  const signal = parseInt(document.getElementById('signalInput').value, 10);
  const sigQuality = signal >= -50 ? 'Excellent' : signal >= -65 ? 'Good' : signal >= -75 ? 'Fair' : 'Weak';

  const kpis = [
    { icon: '🔒', label: 'Security', value: securityLabel, sub: securityScore },
    { icon: '📶', label: 'Signal', value: `${signal} dBm`, sub: sigQuality },
    { icon: '🎯', label: 'Risk Score', value: `${risk}/100`, sub: riskLabel, color: riskColor },
  ];

  document.getElementById('scoreGrid').innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-value" style="${k.color ? `color:${k.color}` : ''}">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>
  `).join('');

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
    flagsList.innerHTML = '<p style="color:var(--green);font-size:0.85rem;">✅ No major risk factors detected.</p>';
  }

  // AI advice
  const aiPanel = document.getElementById('aiPanel');
  const aiAdvice = document.getElementById('aiAdvice');
  if (data.aiAdvice) {
    aiPanel.style.display = 'block';
    aiAdvice.textContent = data.aiAdvice;
  } else {
    aiPanel.style.display = 'none';
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
