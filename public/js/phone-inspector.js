/* ─── Phone Inspector ─── NeoTrace v3.0 ─── */

let radarChart = null;

/* Country flag emoji from ISO code */
function getFlag(code) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  );
}

/* Risk color helper */
function riskColor(score) {
  if (score >= 75) return 'var(--red)';
  if (score >= 40) return 'var(--orange)';
  return 'var(--green)';
}

function riskLabel(score) {
  if (score >= 75) return t('phone.highRisk');
  if (score >= 40) return t('phone.mediumRisk');
  return t('phone.lowRisk');
}

/* ─── Main Function ─── */
async function checkPhone() {
  const input = document.getElementById('phoneInput');
  const phone = input.value.trim();
  if (!phone) { input.focus(); return; }

  const scanBtn = document.getElementById('scanBtn');
  scanBtn.disabled = true;
  scanBtn.innerHTML = `<span class="scan-spinner"></span> ${t('phone.scanning')}`;

  try {
    const res = await fetch('/api/phone/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();

    document.getElementById('noResults').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'block';

    renderKPI(data);
    renderRadar(data);
    renderDetails(data);
  } catch (err) {
    console.error('Phone check failed:', err);
  } finally {
    scanBtn.disabled = false;
    scanBtn.innerHTML = `<span data-i18n="phone.scan">SCAN NUMBER</span>`;
  }
}

/* ─── KPI Cards ─── */
function renderKPI(d) {
  const grid = document.getElementById('kpiGrid');
  const cards = [
    {
      icon: getFlag(d.country_code),
      label: t('phone.country'),
      value: d.country || 'Unknown',
      accent: 'var(--accent)'
    },
    {
      icon: '📡',
      label: t('phone.carrier'),
      value: d.carrier || 'Unknown',
      accent: 'var(--cyan)'
    },
    {
      icon: '📞',
      label: t('phone.lineType'),
      value: d.line_type || 'Unknown',
      accent: lineTypeColor(d.line_type)
    },
    {
      icon: '🛡️',
      label: t('phone.riskScore'),
      value: `${d.fraud_score}/100`,
      accent: riskColor(d.fraud_score),
      progress: d.fraud_score
    },
    {
      icon: '📈',
      label: t('phone.activity'),
      value: d.active_status || 'Unknown',
      accent: d.active_status === 'Active' ? 'var(--green)' : 'var(--orange)'
    },
    {
      icon: '🚫',
      label: t('phone.blacklist'),
      value: `${d.blacklist_hits || 0} hits`,
      accent: d.blacklist_hits > 0 ? 'var(--red)' : 'var(--green)'
    }
  ];

  grid.innerHTML = cards.map(c => `
    <div class="kpi-card" style="--kpi-accent: ${c.accent};">
      <div class="kpi-icon">${c.icon}</div>
      <div class="kpi-body">
        <div class="kpi-label">${c.label}</div>
        <div class="kpi-value">${c.value}</div>
        ${c.progress !== undefined ? `
          <div class="kpi-bar-bg">
            <div class="kpi-bar-fill" style="width:${c.progress}%; background:${c.accent};"></div>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function lineTypeColor(type) {
  if (!type) return 'var(--text-secondary)';
  const t = type.toLowerCase();
  if (t === 'voip') return 'var(--red)';
  if (t === 'mobile') return 'var(--green)';
  if (t === 'landline') return 'var(--cyan)';
  return 'var(--text-secondary)';
}

/* ─── Radar Chart ─── */
function renderRadar(d) {
  const ctx = document.getElementById('riskRadar').getContext('2d');
  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Fraud Score', 'Spam Risk', 'VOIP Risk', 'Recent Activity', 'Blacklist Score', 'Carrier Trust'],
      datasets: [{
        label: 'Risk Profile',
        data: [
          d.fraud_score || 0,
          d.spam_risk || 0,
          d.voip_risk || 0,
          d.recent_activity || 0,
          Math.min((d.blacklist_hits || 0) * 25, 100),
          d.carrier_trust || 0
        ],
        backgroundColor: 'rgba(10, 132, 255, 0.15)',
        borderColor: '#0A84FF',
        borderWidth: 2,
        pointBackgroundColor: '#0A84FF',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 25,
            color: '#999',
            backdropColor: 'transparent',
            font: { size: 10 }
          },
          grid: { color: 'rgba(255,255,255,0.06)' },
          angleLines: { color: 'rgba(255,255,255,0.06)' },
          pointLabels: {
            color: '#aaa',
            font: { family: 'Inter', size: 11 }
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/* ─── Details Panel ─── */
function renderDetails(d) {
  const panel = document.getElementById('detailsPanel');
  const riskClass = d.fraud_score >= 75 ? 'danger' : d.fraud_score >= 40 ? 'warning' : 'safe';

  panel.innerHTML = `
    <h3>📋 Detailed Findings</h3>

    <div class="finding-item ${riskClass}">
      <strong>${t('phone.riskScore')}:</strong> ${d.fraud_score}/100 — ${riskLabel(d.fraud_score)}
    </div>

    <div class="finding-item ${d.line_type === 'VOIP' ? 'danger' : 'info'}">
      <strong>${t('phone.lineType')}:</strong> ${d.line_type || 'Unknown'}
      ${d.line_type === 'VOIP' ? ' ⚠️ High abuse potential' : ''}
    </div>

    <div class="finding-item info">
      <strong>${t('phone.carrier')}:</strong> ${d.carrier || 'Unknown'}
    </div>

    <div class="finding-item info">
      <strong>${t('phone.country')}:</strong> ${getFlag(d.country_code)} ${d.country || 'Unknown'} (+${d.dial_code || '?'})
    </div>

    ${d.email ? `
    <div class="finding-item ${d.email.includes('temp') ? 'warning' : 'info'}">
      <strong>${t('phone.email')}:</strong> ${d.email}
    </div>
    ` : ''}

    <div class="finding-item ${d.blacklist_hits > 0 ? 'danger' : 'safe'}">
      <strong>${t('phone.blacklist')}:</strong> ${d.blacklist_hits || 0} database hits
    </div>

    ${d.notes ? `
    <div class="finding-item warning" style="margin-top: 0.5rem;">
      <strong>⚠️ Notes:</strong> ${d.notes}
    </div>
    ` : ''}
  `;
}

/* ─── Enter key support ─── */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('phoneInput');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkPhone();
    });
  }
});
