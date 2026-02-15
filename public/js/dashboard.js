// =====================================================
// AI CYBER DETECTIVE 2.0 — Dashboard Charts
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  const chartColors = {
    green: '#00ff41',
    cyan: '#00d4ff',
    blue: '#0066ff',
    purple: '#9d4edd',
    red: '#ff0055',
    orange: '#ff8c00',
    yellow: '#ffd600',
    pink: '#ff69b4',
    teal: '#00cec9',
    lime: '#a8e600'
  };

  const chartDefaults = {
    color: '#8b949e',
    borderColor: 'rgba(255,255,255,0.05)',
    font: { family: "'Rajdhani', sans-serif" }
  };

  Chart.defaults.color = chartDefaults.color;
  Chart.defaults.borderColor = chartDefaults.borderColor;
  Chart.defaults.font.family = chartDefaults.font.family;

  // ===== Top 10 Scam Types (Horizontal Bar) =====
  const topScamsCtx = document.getElementById('topScamsChart');
  if (topScamsCtx) {
    new Chart(topScamsCtx, {
      type: 'bar',
      data: {
        labels: [
          'Phishing / Spoofing',
          'Investment Fraud',
          'Romance Scams',
          'Tech Support Scams',
          'Online Shopping Fraud',
          'Identity Theft',
          'Business Email Compromise',
          'Cryptocurrency Fraud',
          'Prize / Lottery Scams',
          'Social Media Scams'
        ],
        datasets: [{
          label: 'Reports (thousands)',
          data: [324, 267, 215, 186, 158, 142, 125, 108, 84, 73],
          backgroundColor: [
            'rgba(0, 255, 65, 0.7)',
            'rgba(0, 212, 255, 0.7)',
            'rgba(255, 0, 85, 0.7)',
            'rgba(255, 140, 0, 0.7)',
            'rgba(157, 78, 221, 0.7)',
            'rgba(0, 102, 255, 0.7)',
            'rgba(255, 214, 0, 0.7)',
            'rgba(255, 105, 180, 0.7)',
            'rgba(0, 206, 201, 0.7)',
            'rgba(168, 230, 0, 0.7)'
          ],
          borderColor: [
            '#00ff41', '#00d4ff', '#ff0055', '#ff8c00', '#9d4edd',
            '#0066ff', '#ffd600', '#ff69b4', '#00cec9', '#a8e600'
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
            backgroundColor: 'rgba(13, 19, 33, 0.95)',
            borderColor: '#00ff41',
            borderWidth: 1,
            titleFont: { family: "'Orbitron', sans-serif", size: 12 },
            bodyFont: { family: "'Rajdhani', sans-serif", size: 14 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: ctx => `${ctx.parsed.x}K reports worldwide`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.03)' },
            ticks: { callback: v => v + 'K' }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  }

  // ===== Scam Distribution (Doughnut) =====
  const distCtx = document.getElementById('distributionChart');
  if (distCtx) {
    new Chart(distCtx, {
      type: 'doughnut',
      data: {
        labels: ['Financial Fraud', 'Phishing & Spoofing', 'Identity Crimes', 'Romance & Social', 'Tech & Support', 'Other'],
        datasets: [{
          data: [32, 24, 15, 14, 10, 5],
          backgroundColor: [
            'rgba(0, 255, 65, 0.8)',
            'rgba(0, 212, 255, 0.8)',
            'rgba(255, 0, 85, 0.8)',
            'rgba(157, 78, 221, 0.8)',
            'rgba(255, 140, 0, 0.8)',
            'rgba(100, 100, 120, 0.8)'
          ],
          borderColor: 'rgba(10, 14, 23, 1)',
          borderWidth: 3,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              usePointStyle: true,
              pointStyleWidth: 12,
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(13, 19, 33, 0.95)',
            borderColor: '#00d4ff',
            borderWidth: 1,
            titleFont: { family: "'Orbitron', sans-serif", size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed}%`
            }
          }
        }
      }
    });
  }

  // ===== Yearly Trend (Line) - Last 3 Years Highlighted =====
  const trendCtx = document.getElementById('trendChart');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
        datasets: [
          {
            label: 'Total Reports (K)',
            data: [352, 467, 791, 847, 800, 880, 1020, 1150, 1280],
            borderColor: '#00ff41',
            backgroundColor: 'rgba(0, 255, 65, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00ff41',
            pointBorderColor: '#0a0e17',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            segment: {
              // Highlight last 3 years (2024-2026) with thicker line
              borderWidth: ctx => ctx.p1DataIndex >= 6 ? 4 : 2,
            }
          },
          {
            label: 'Financial Loss ($B)',
            data: [2.7, 3.5, 4.2, 6.9, 10.3, 12.5, 14.8, 17.2, 19.8],
            borderColor: '#ff0055',
            backgroundColor: 'rgba(255, 0, 85, 0.05)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ff0055',
            pointBorderColor: '#0a0e17',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            segment: {
              // Highlight last 3 years (2024-2026) with thicker line
              borderWidth: ctx => ctx.p1DataIndex >= 6 ? 4 : 2,
            }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            labels: { usePointStyle: true, padding: 20, font: { size: 12 } }
          },
          tooltip: {
            backgroundColor: 'rgba(13, 19, 33, 0.95)',
            borderColor: '#00ff41',
            borderWidth: 1,
            titleFont: { family: "'Orbitron', sans-serif" },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, beginAtZero: true }
        }
      }
    });
  }

  // ===== Threat Sophistication Radar - 3 Year Comparison =====
  const radarCtx = document.getElementById('radarChart');
  if (radarCtx) {
    new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: ['Phishing', 'Social Engineering', 'Deepfake', 'Ransomware', 'BEC', 'Crypto Fraud', 'Romance Scam'],
        datasets: [
          {
            label: '2024',
            data: [88, 84, 75, 85, 78, 82, 68],
            borderColor: 'rgba(0, 102, 255, 0.8)',
            backgroundColor: 'rgba(0, 102, 255, 0.15)',
            pointBackgroundColor: '#0066ff',
            pointBorderColor: '#0a0e17',
            pointBorderWidth: 2,
          },
          {
            label: '2025',
            data: [92, 90, 88, 82, 85, 90, 72],
            borderColor: 'rgba(0, 212, 255, 0.8)',
            backgroundColor: 'rgba(0, 212, 255, 0.15)',
            pointBackgroundColor: '#00d4ff',
            pointBorderColor: '#0a0e17',
            pointBorderWidth: 2,
          },
          {
            label: '2026',
            data: [95, 94, 93, 88, 90, 95, 80],
            borderColor: 'rgba(255, 0, 85, 0.8)',
            backgroundColor: 'rgba(255, 0, 85, 0.1)',
            pointBackgroundColor: '#ff0055',
            pointBorderColor: '#0a0e17',
            pointBorderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { usePointStyle: true, padding: 20, font: { size: 12 } }
          },
          tooltip: {
            backgroundColor: 'rgba(13, 19, 33, 0.95)',
            borderColor: '#9d4edd',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(255,255,255,0.05)' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            pointLabels: { font: { size: 11 }, color: '#8b949e' },
            ticks: { display: false },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }

  // ===== World Heatmap (Leaflet Choropleth) =====
  initHeatmap();
});

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

  // Dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Country centroids with cyber fraud risk data
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
    { name: 'Saudi Arabia', lat: 23.8, lng: 45.0, reports: 48000, risk: 62, lost: '$0.4B' },
    { name: 'Italy', lat: 41.8, lng: 12.5, reports: 142000, risk: 74, lost: '$1.1B' },
    { name: 'Spain', lat: 40.4, lng: -3.7, reports: 128000, risk: 72, lost: '$1.0B' },
    { name: 'Netherlands', lat: 52.1, lng: 5.2, reports: 98000, risk: 70, lost: '$0.8B' },
    { name: 'Sweden', lat: 60.1, lng: 18.6, reports: 65000, risk: 66, lost: '$0.5B' },
    { name: 'Poland', lat: 51.9, lng: 19.1, reports: 78000, risk: 68, lost: '$0.6B' },
    { name: 'Turkey', lat: 38.9, lng: 35.2, reports: 95000, risk: 72, lost: '$0.7B' },
    { name: 'Pakistan', lat: 30.3, lng: 69.3, reports: 85000, risk: 70, lost: '$0.5B' },
    { name: 'Bangladesh', lat: 23.6, lng: 90.3, reports: 72000, risk: 66, lost: '$0.4B' },
    { name: 'Colombia', lat: 4.5, lng: -74.2, reports: 68000, risk: 65, lost: '$0.4B' },
    { name: 'Argentina', lat: -38.4, lng: -63.6, reports: 52000, risk: 60, lost: '$0.3B' },
    { name: 'Egypt', lat: 26.8, lng: 30.8, reports: 62000, risk: 64, lost: '$0.4B' },
    { name: 'Kenya', lat: -0.02, lng: 37.9, reports: 48000, risk: 62, lost: '$0.3B' },
    { name: 'Ghana', lat: 7.9, lng: -1.0, reports: 55000, risk: 66, lost: '$0.4B' },
    { name: 'Taiwan', lat: 23.69, lng: 120.96, reports: 78000, risk: 70, lost: '$0.6B' },
    { name: 'Hong Kong', lat: 22.39, lng: 114.1, reports: 62000, risk: 74, lost: '$0.8B' },
    { name: 'New Zealand', lat: -40.9, lng: 174.8, reports: 35000, risk: 60, lost: '$0.2B' },
    { name: 'Israel', lat: 31.05, lng: 34.85, reports: 42000, risk: 64, lost: '$0.4B' },
  ];

  function getRiskColor(risk) {
    if (risk >= 90) return '#ff0033';
    if (risk >= 80) return '#ff4444';
    if (risk >= 70) return '#ff8c00';
    if (risk >= 60) return '#ffd600';
    return '#00ff41';
  }

  function getRadius(reports) {
    return Math.max(8, Math.min(35, Math.sqrt(reports / 1000)));
  }

  countryData.forEach(c => {
    const circle = L.circleMarker([c.lat, c.lng], {
      radius: getRadius(c.reports),
      fillColor: getRiskColor(c.risk),
      color: getRiskColor(c.risk),
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.45
    }).addTo(map);

    // Pulsing effect for high-risk countries
    if (c.risk >= 85) {
      const pulseCircle = L.circleMarker([c.lat, c.lng], {
        radius: getRadius(c.reports) + 5,
        fillColor: getRiskColor(c.risk),
        color: getRiskColor(c.risk),
        weight: 1,
        opacity: 0.2,
        fillOpacity: 0.1,
        className: 'pulse-marker'
      }).addTo(map);
    }

    circle.bindTooltip(`
      <div class="custom-tooltip">
        <div class="tooltip-title">${c.name}</div>
        <div class="tooltip-value">📊 Reports: ${c.reports.toLocaleString()}</div>
        <div class="tooltip-value">⚠️ Risk Level: ${c.risk}/100</div>
        <div class="tooltip-value">💰 Losses: ${c.lost}</div>
      </div>
    `, {
      direction: 'top',
      offset: [0, -10],
      className: 'custom-tooltip'
    });
  });

  // Legend
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.cssText = 'background: rgba(13,19,33,0.9); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(0,255,65,0.2); color: #e0e6ed; font-family: Rajdhani, sans-serif; font-size: 12px;';
    div.innerHTML = `
      <div style="font-weight:700; margin-bottom:8px; font-family: Orbitron, sans-serif; font-size: 11px; color: #00ff41;">RISK LEVEL</div>
      <div style="display:flex; align-items:center; gap:6px; margin:4px 0;"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#ff0033;"></span> Critical (90+)</div>
      <div style="display:flex; align-items:center; gap:6px; margin:4px 0;"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#ff4444;"></span> High (80-89)</div>
      <div style="display:flex; align-items:center; gap:6px; margin:4px 0;"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#ff8c00;"></span> Medium (70-79)</div>
      <div style="display:flex; align-items:center; gap:6px; margin:4px 0;"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#ffd600;"></span> Moderate (60-69)</div>
      <div style="display:flex; align-items:center; gap:6px; margin:4px 0;"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#00ff41;"></span> Low (&lt;60)</div>
    `;
    return div;
  };
  legend.addTo(map);

  // Add CSS animation for pulse effect
  const style = document.createElement('style');
  style.textContent = `
    .pulse-marker { animation: mapPulse 2s infinite; }
    @keyframes mapPulse {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}
