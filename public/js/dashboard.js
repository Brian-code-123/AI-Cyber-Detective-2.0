// =====================================================
// NeoTrace — Dashboard Charts (Apple-Style, 3 Charts Only)
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  // Apple-style chart defaults
  Chart.defaults.color = 'rgba(255,255,255,0.45)';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.04)';
  Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

  // ===== 1. Top 10 Scam Types (Horizontal Bar) =====
  const topScamsCtx = document.getElementById('topScamsChart');
  if (topScamsCtx) {
    new Chart(topScamsCtx, {
      type: 'bar',
      data: {
        labels: [
          t('charts.phishing'),
          t('charts.investment'),
          t('charts.romance'),
          t('charts.techSupport'),
          t('charts.onlineShopping'),
          t('charts.identityTheft'),
          t('charts.businessEmail'),
          t('charts.cryptocurrency'),
          t('charts.prize'),
          t('charts.socialMedia')
        ],
        datasets: [{
          label: t('charts.reports'),
          data: [324, 267, 215, 186, 158, 142, 125, 108, 84, 73],
          backgroundColor: [
            'rgba(10,132,255,0.65)',
            'rgba(48,209,88,0.65)',
            'rgba(255,69,58,0.65)',
            'rgba(255,159,10,0.65)',
            'rgba(191,90,242,0.65)',
            'rgba(100,210,255,0.65)',
            'rgba(255,214,10,0.65)',
            'rgba(255,55,95,0.65)',
            'rgba(90,200,245,0.65)',
            'rgba(172,142,104,0.65)'
          ],
          borderColor: [
            '#0A84FF', '#30D158', '#FF453A', '#FF9F0A', '#BF5AF2',
            '#64D2FF', '#FFD60A', '#FF375F', '#5AC8F5', '#AC8E68'
          ],
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(28,28,30,0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleFont: { size: 12, weight: '600' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: ctx => ` ${ctx.parsed.x}K reports worldwide`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.03)' },
            ticks: { callback: v => v + 'K', font: { size: 11 } }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  }

  // ===== 2. Yearly Trend (Line) =====
  const trendCtx = document.getElementById('trendChart');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
        datasets: [
          {
            label: t('charts.totalReports'),
            data: [352, 467, 791, 847, 800, 880, 1020, 1150, 1280],
            borderColor: '#0A84FF',
            backgroundColor: 'rgba(10,132,255,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0A84FF',
            pointBorderColor: '#000',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            borderWidth: 2,
          },
          {
            label: t('charts.financialLoss'),
            data: [2.7, 3.5, 4.2, 6.9, 10.3, 12.5, 14.8, 17.2, 19.8],
            borderColor: '#FF453A',
            backgroundColor: 'rgba(255,69,58,0.05)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FF453A',
            pointBorderColor: '#000',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            borderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            labels: { usePointStyle: true, padding: 20, font: { size: 11 } }
          },
          tooltip: {
            backgroundColor: 'rgba(28,28,30,0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleFont: { weight: '600' },
            padding: 12,
            cornerRadius: 10
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, beginAtZero: true }
        }
      }
    });
  }

  // ===== 3. World Heatmap (Leaflet) =====
  initHeatmap();

  // ===== Load News =====
  loadNews();
});

// ==================== HEATMAP ====================
function initHeatmap() {
  const mapContainer = document.getElementById('heatmap');
  if (!mapContainer) return;

  const map = L.map('heatmap', {
    center: [25, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 6,
    zoomControl: true,
    attributionControl: false,
    scrollWheelZoom: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  const countryData = [
    { name: 'United States', lat: 39.8, lng: -98.5, reports: 880418, risk: 95, lost: '$12.5B' },
    { name: 'United Kingdom', lat: 55.3, lng: -3.4, reports: 425000, risk: 88, lost: '$4.7B' },
    { name: 'Canada', lat: 56.1, lng: -106.3, reports: 186000, risk: 82, lost: '$2.1B' },
    { name: 'Australia', lat: -25.3, lng: 133.7, reports: 267000, risk: 85, lost: '$2.7B' },
    { name: 'Germany', lat: 51.1, lng: 10.4, reports: 198000, risk: 78, lost: '$1.8B' },
    { name: 'France', lat: 46.2, lng: 2.2, reports: 175000, risk: 76, lost: '$1.5B' },
    { name: 'India', lat: 20.5, lng: 78.9, reports: 520000, risk: 90, lost: '$3.2B' },
    { name: 'China', lat: 35.8, lng: 104.1, reports: 680000, risk: 92, lost: '$8.8B' },
    { name: 'Japan', lat: 36.2, lng: 138.2, reports: 145000, risk: 72, lost: '$1.2B' },
    { name: 'South Korea', lat: 35.9, lng: 127.7, reports: 165000, risk: 75, lost: '$1.4B' },
    { name: 'Brazil', lat: -14.2, lng: -51.9, reports: 310000, risk: 86, lost: '$2.8B' },
    { name: 'Nigeria', lat: 9.08, lng: 8.67, reports: 210000, risk: 88, lost: '$1.6B' },
    { name: 'Russia', lat: 61.5, lng: 105.3, reports: 290000, risk: 84, lost: '$2.4B' },
    { name: 'South Africa', lat: -30.5, lng: 22.9, reports: 120000, risk: 78, lost: '$0.9B' },
    { name: 'Mexico', lat: 23.6, lng: -102.5, reports: 95000, risk: 70, lost: '$0.7B' },
    { name: 'Indonesia', lat: -0.7, lng: 113.9, reports: 155000, risk: 74, lost: '$1.1B' },
    { name: 'Philippines', lat: 12.8, lng: 121.7, reports: 180000, risk: 80, lost: '$1.3B' },
    { name: 'Thailand', lat: 15.8, lng: 100.9, reports: 98000, risk: 72, lost: '$0.8B' },
    { name: 'Vietnam', lat: 14.0, lng: 108.2, reports: 86000, risk: 68, lost: '$0.6B' },
    { name: 'Malaysia', lat: 4.2, lng: 101.9, reports: 115000, risk: 76, lost: '$1.0B' },
    { name: 'Singapore', lat: 1.35, lng: 103.8, reports: 42000, risk: 65, lost: '$0.5B' },
    { name: 'UAE', lat: 23.4, lng: 53.8, reports: 58000, risk: 68, lost: '$0.6B' },
    { name: 'Italy', lat: 41.8, lng: 12.5, reports: 142000, risk: 74, lost: '$1.1B' },
    { name: 'Spain', lat: 40.4, lng: -3.7, reports: 128000, risk: 72, lost: '$1.0B' },
    { name: 'Netherlands', lat: 52.1, lng: 5.2, reports: 98000, risk: 70, lost: '$0.8B' },
    { name: 'Turkey', lat: 38.9, lng: 35.2, reports: 95000, risk: 72, lost: '$0.7B' },
    { name: 'Taiwan', lat: 23.69, lng: 120.96, reports: 78000, risk: 70, lost: '$0.6B' },
    { name: 'Hong Kong', lat: 22.39, lng: 114.1, reports: 62000, risk: 74, lost: '$0.8B' },
  ];

  function getRiskColor(risk) {
    if (risk >= 90) return '#FF453A';
    if (risk >= 80) return '#FF6961';
    if (risk >= 70) return '#FF9F0A';
    if (risk >= 60) return '#FFD60A';
    return '#30D158';
  }

  function getRadius(reports) {
    return Math.max(8, Math.min(30, Math.sqrt(reports / 1200)));
  }

  countryData.forEach(c => {
    L.circleMarker([c.lat, c.lng], {
      radius: getRadius(c.reports),
      fillColor: getRiskColor(c.risk),
      color: getRiskColor(c.risk),
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.4
    }).addTo(map).bindTooltip(`
      <div class="custom-tooltip">
        <div class="tooltip-title">${c.name}</div>
        <div class="tooltip-value">📊 Reports: ${c.reports.toLocaleString()}</div>
        <div class="tooltip-value">⚠️ Risk Level: ${c.risk}/100</div>
        <div class="tooltip-value">💰 Losses: ${c.lost}</div>
      </div>
    `, { direction: 'top', offset: [0, -10], className: 'custom-tooltip' });
  });

  // Legend
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.cssText = 'background:rgba(28,28,30,0.9);padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);font-size:12px;';
    div.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.06em;">RISK LEVEL</div>
      <div style="display:flex;align-items:center;gap:6px;margin:4px 0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF453A;"></span> Critical (90+)</div>
      <div style="display:flex;align-items:center;gap:6px;margin:4px 0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF6961;"></span> High (80-89)</div>
      <div style="display:flex;align-items:center;gap:6px;margin:4px 0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF9F0A;"></span> Medium (70-79)</div>
      <div style="display:flex;align-items:center;gap:6px;margin:4px 0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFD60A;"></span> Moderate (60-69)</div>
      <div style="display:flex;align-items:center;gap:6px;margin:4px 0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#30D158;"></span> Low (&lt;60)</div>
    `;
    return div;
  };
  legend.addTo(map);
}

// ==================== NEWS ====================
async function loadNews() {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/news');
    if (!res.ok) throw new Error('API error');
    const news = await res.json();
    renderNews(grid, news);
  } catch (e) {
    // Fallback demo news
    renderNews(grid, [
      { title: 'Major Phishing Campaign Targets Banking Customers Across Asia', date: '2026-02-19', source: 'The Hacker News', link: '#', summary: 'A sophisticated phishing campaign leveraging AI-generated emails has been detected targeting major banks in Hong Kong and Singapore.' },
      { title: 'New Ransomware Variant Uses Zero-Day Exploit in Windows', date: '2026-02-18', source: 'BleepingComputer', link: '#', summary: 'Security researchers discovered a new ransomware strain that exploits a previously unknown vulnerability in Windows.' },
      { title: 'Critical Vulnerability Found in Popular Open-Source Library', date: '2026-02-17', source: 'SecurityWeek', link: '#', summary: 'A critical remote code execution vulnerability has been found affecting millions of applications worldwide.' },
      { title: 'AI-Powered Deepfake Scams Surge 300% in Southeast Asia', date: '2026-02-16', source: 'CyberScoop', link: '#', summary: 'Law enforcement agencies report a dramatic increase in deepfake-enabled fraud across the APAC region.' },
      { title: 'Global Law Enforcement Takes Down Major Dark Web Marketplace', date: '2026-02-15', source: 'Krebs on Security', link: '#', summary: 'An international operation has successfully dismantled one of the largest illegal marketplaces on the dark web.' },
    ]);
  }
}

function renderNews(container, items) {
  container.innerHTML = items.map((item, i) => {
    const d = new Date(item.date);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `
      <a href="${item.link || item.url || '#'}" target="_blank" rel="noopener" class="news-item" style="animation: slideUp 0.4s ease ${i * 0.06}s both;">
        <div class="news-date">
          <div class="day">${d.getDate()}</div>
          <div class="month">${months[d.getMonth()]}</div>
        </div>
        <div class="news-content">
          <h4>${item.title}</h4>
          <p class="news-summary">${item.summary || ''}</p>
          <span class="news-source">${item.source || 'Security News'}</span>
        </div>
        <span class="news-link-icon">↗</span>
      </a>
    `;
  }).join('');
}
