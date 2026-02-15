// === URL Analyzer ===
async function analyzeUrl() {
  const input = document.getElementById('urlInput').value.trim();
  if (!input) { alert('Please enter a URL'); return; }

  document.getElementById('urlPlaceholder').classList.add('hidden');
  document.getElementById('urlResults').classList.add('hidden');
  document.getElementById('urlLoading').classList.remove('hidden');

  try {
    const resp = await fetch('/api/analyze-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: input })
    });
    const data = await resp.json();
    renderUrlResults(data);
  } catch (err) {
    console.error(err);
    alert('Analysis failed — check console for details.');
  } finally {
    document.getElementById('urlLoading').classList.add('hidden');
  }
}

function renderUrlResults(data) {
  document.getElementById('urlResults').classList.remove('hidden');

  // Risk score & arc animation
  const risk = data.riskScore ?? 0;
  const arc = document.getElementById('urlRiskArc');
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (risk / 100) * circumference;
  arc.style.transition = 'stroke-dashoffset 1.2s ease';
  arc.setAttribute('stroke-dasharray', circumference);
  arc.setAttribute('stroke-dashoffset', circumference);
  requestAnimationFrame(() => {
    arc.setAttribute('stroke-dashoffset', offset);
  });

  let color, label;
  if (risk <= 25)      { color = '#00ff41'; label = '✅ Low Risk'; }
  else if (risk <= 50) { color = '#ffaa00'; label = '⚠️ Medium Risk'; }
  else if (risk <= 75) { color = '#ff6600'; label = '🔶 High Risk'; }
  else                 { color = '#ff0055'; label = '🚨 Critical Risk'; }
  arc.setAttribute('stroke', color);
  document.getElementById('urlRiskScore').textContent = risk;
  document.getElementById('urlRiskScore').style.color = color;
  document.getElementById('urlRiskLevel').textContent = label;

  // Domain table
  const dtable = document.getElementById('domainTable');
  const info = data.details || {};
  const inputUrl = document.getElementById('urlInput').value.trim();
  let parsedProtocol = '—', parsedHostname = '—', parsedTld = '—', parsedPath = '/', isIP = false, hasSSL = false;
  try {
    const u = new URL(inputUrl.startsWith('http') ? inputUrl : 'https://' + inputUrl);
    parsedProtocol = u.protocol;
    parsedHostname = u.hostname;
    parsedTld = '.' + u.hostname.split('.').pop();
    parsedPath = u.pathname;
    isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(u.hostname);
    hasSSL = u.protocol === 'https:';
  } catch (e) {}
  dtable.innerHTML = Object.entries({
    'Protocol': parsedProtocol,
    'Hostname': parsedHostname,
    'Domain': data.domain || '—',
    'TLD': parsedTld,
    'Path': parsedPath,
    'Has IP': isIP ? 'Yes ⚠️' : 'No',
    'SSL': hasSSL ? '✅ Yes' : '❌ No',
    'Resolved IP': info.ip || '—',
    'Risk Level': data.riskLevel || '—'
  }).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  // Findings
  const container = document.getElementById('urlFindings');
  container.innerHTML = '';
  const findings = data.findings || [];
  if (findings.length === 0) {
    container.innerHTML = '<div class="finding-item safe"><span>✅ No significant threats detected</span></div>';
  } else {
    findings.forEach(f => {
      const type = f.type || 'info';
      const sevClass = type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : type === 'safe' ? 'safe' : 'info';
      const icon = type === 'danger' ? '🚨' : type === 'warning' ? '⚠️' : type === 'safe' ? '✅' : 'ℹ️';
      container.innerHTML += `<div class="finding-item ${sevClass}"><span>${icon} ${f.message}</span></div>`;
    });
  }
}

// Allow Enter key to trigger analysis
document.getElementById('urlInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') analyzeUrl();
});
