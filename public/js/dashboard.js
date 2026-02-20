// =====================================================
// NeoTrace — Dashboard Charts (Apple-Style, 3 Charts Only)
// =====================================================


function getChartScalesConfig(theme) {
  if (theme === "light") {
    return {
      gridColor: "rgba(0,0,0,0.06)",
      tickColor: "rgba(0,0,0,0.7)",
    };
  }
  return {
    gridColor: "rgba(255,255,255,0.06)",
    tickColor: "rgba(255,255,255,0.85)",
  };
}

function setChartTheme(theme) {
  if (theme === "light") {
    Chart.defaults.color = "rgba(0,0,0,0.7)";
    Chart.defaults.borderColor = "rgba(0,0,0,0.08)";
  } else {
    Chart.defaults.color = "rgba(255,255,255,0.85)";
    Chart.defaults.borderColor = "rgba(255,255,255,0.08)";
  }
  Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
}

function getCurrentTheme() {
  // 優先用 data-theme，否則 fallback 至 prefers-color-scheme
  const html = document.documentElement;
  if (html.hasAttribute('data-theme')) {
    return html.getAttribute('data-theme');
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function redrawCharts() {
  // 重新載入頁面即可重繪（簡單做法，或可優化為動態重繪）
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  setChartTheme(getCurrentTheme());

  // 監聽主題切換（假設有 data-theme 變化）
  const observer = new MutationObserver(() => {
    setChartTheme(getCurrentTheme());
    redrawCharts();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ── Fetch AI-powered real-time stats ───────────────
  loadAIStats();

  // ===== 1. Top 10 Scam Types (Horizontal Bar) =====
  const topScamsCtx = document.getElementById("topScamsChart");
  if (topScamsCtx) {
    new Chart(topScamsCtx, {
      type: "bar",
      data: {
        labels: [
          t("charts.phishing"),
          t("charts.investment"),
          t("charts.romance"),
          t("charts.techSupport"),
          t("charts.onlineShopping"),
          t("charts.identityTheft"),
          t("charts.businessEmail"),
          t("charts.cryptocurrency"),
          t("charts.prize"),
          t("charts.socialMedia"),
        ],
        datasets: [
          {
            label: t("charts.reports"),
            data: [324, 267, 215, 186, 158, 142, 125, 108, 84, 73],
            backgroundColor: [
              "rgba(10,132,255,0.65)",
              "rgba(48,209,88,0.65)",
              "rgba(255,69,58,0.65)",
              "rgba(255,159,10,0.65)",
              "rgba(191,90,242,0.65)",
              "rgba(100,210,255,0.65)",
              "rgba(255,214,10,0.65)",
              "rgba(255,55,95,0.65)",
              "rgba(90,200,245,0.65)",
              "rgba(172,142,104,0.65)",
            ],
            borderColor: [
              "#0A84FF",
              "#30D158",
              "#FF453A",
              "#FF9F0A",
              "#BF5AF2",
              "#64D2FF",
              "#FFD60A",
              "#FF375F",
              "#5AC8F5",
              "#AC8E68",
            ],
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(28,28,30,0.95)",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            titleFont: { size: 12, weight: "600" },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.x}K reports worldwide`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: () => getChartScalesConfig(getCurrentTheme()).gridColor },
            ticks: { callback: (v) => v + "K", font: { size: 11 }, color: () => getChartScalesConfig(getCurrentTheme()).tickColor },
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: () => getChartScalesConfig(getCurrentTheme()).tickColor },
          },
        },
      },
    });
  }

  // ===== 2. Yearly Trend (Line) =====
  const trendCtx = document.getElementById("trendChart");
  if (trendCtx) {
    new Chart(trendCtx, {
      type: "line",
      data: {
        labels: [
          "2018",
          "2019",
          "2020",
          "2021",
          "2022",
          "2023",
          "2024",
          "2025",
          "2026",
        ],
        datasets: [
          {
            label: t("charts.totalReports"),
            data: [352, 467, 791, 847, 800, 880, 1020, 1150, 1280],
            borderColor: "#0A84FF",
            backgroundColor: "rgba(10,132,255,0.08)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#0A84FF",
            pointBorderColor: "#000",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            borderWidth: 2,
          },
          {
            label: t("charts.financialLoss"),
            data: [2.7, 3.5, 4.2, 6.9, 10.3, 12.5, 14.8, 17.2, 19.8],
            borderColor: "#FF453A",
            backgroundColor: "rgba(255,69,58,0.05)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#FF453A",
            pointBorderColor: "#000",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: {
            labels: { usePointStyle: true, padding: 20, font: { size: 11 } },
          },
          tooltip: {
            backgroundColor: "rgba(28,28,30,0.95)",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            titleFont: { weight: "600" },
            padding: 12,
            cornerRadius: 10,
          },
        },
        scales: {
          x: {
            grid: { color: () => getChartScalesConfig(getCurrentTheme()).gridColor },
            ticks: { font: { size: 11 }, color: () => getChartScalesConfig(getCurrentTheme()).tickColor },
          },
          y: {
            grid: { color: () => getChartScalesConfig(getCurrentTheme()).gridColor },
            ticks: { font: { size: 11 }, color: () => getChartScalesConfig(getCurrentTheme()).tickColor },
            beginAtZero: true,
          },
        },
      },
    });
  }

  // ===== 3. World Heatmap (Leaflet) =====
  initHeatmap();

  // ===== Load News =====
  loadNews();
});

// ==================== HEATMAP ====================
function initHeatmap() {
  const mapContainer = document.getElementById("heatmap");
  if (!mapContainer) return;

  const map = L.map("heatmap", {
    center: [25, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 6,
    zoomControl: true,
    attributionControl: false,
    scrollWheelZoom: true,
  });

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {
      subdomains: "abcd",
      maxZoom: 20,
    },
  ).addTo(map);

  const countryData = [
    {
      name: "United States",
      lat: 39.8,
      lng: -98.5,
      reports: 880418,
      risk: 95,
      lost: "$12.5B",
    },
    {
      name: "United Kingdom",
      lat: 55.3,
      lng: -3.4,
      reports: 425000,
      risk: 88,
      lost: "$4.7B",
    },
    {
      name: "Canada",
      lat: 56.1,
      lng: -106.3,
      reports: 186000,
      risk: 82,
      lost: "$2.1B",
    },
    {
      name: "Australia",
      lat: -25.3,
      lng: 133.7,
      reports: 267000,
      risk: 85,
      lost: "$2.7B",
    },
    {
      name: "Germany",
      lat: 51.1,
      lng: 10.4,
      reports: 198000,
      risk: 78,
      lost: "$1.8B",
    },
    {
      name: "France",
      lat: 46.2,
      lng: 2.2,
      reports: 175000,
      risk: 76,
      lost: "$1.5B",
    },
    {
      name: "India",
      lat: 20.5,
      lng: 78.9,
      reports: 520000,
      risk: 90,
      lost: "$3.2B",
    },
    {
      name: "China",
      lat: 35.8,
      lng: 104.1,
      reports: 680000,
      risk: 92,
      lost: "$8.8B",
    },
    {
      name: "Japan",
      lat: 36.2,
      lng: 138.2,
      reports: 145000,
      risk: 72,
      lost: "$1.2B",
    },
    {
      name: "South Korea",
      lat: 35.9,
      lng: 127.7,
      reports: 165000,
      risk: 75,
      lost: "$1.4B",
    },
    {
      name: "Brazil",
      lat: -14.2,
      lng: -51.9,
      reports: 310000,
      risk: 86,
      lost: "$2.8B",
    },
    {
      name: "Nigeria",
      lat: 9.08,
      lng: 8.67,
      reports: 210000,
      risk: 88,
      lost: "$1.6B",
    },
    {
      name: "Russia",
      lat: 61.5,
      lng: 105.3,
      reports: 290000,
      risk: 84,
      lost: "$2.4B",
    },
    {
      name: "South Africa",
      lat: -30.5,
      lng: 22.9,
      reports: 120000,
      risk: 78,
      lost: "$0.9B",
    },
    {
      name: "Mexico",
      lat: 23.6,
      lng: -102.5,
      reports: 95000,
      risk: 70,
      lost: "$0.7B",
    },
    {
      name: "Indonesia",
      lat: -0.7,
      lng: 113.9,
      reports: 155000,
      risk: 74,
      lost: "$1.1B",
    },
    {
      name: "Philippines",
      lat: 12.8,
      lng: 121.7,
      reports: 180000,
      risk: 80,
      lost: "$1.3B",
    },
    {
      name: "Thailand",
      lat: 15.8,
      lng: 100.9,
      reports: 98000,
      risk: 72,
      lost: "$0.8B",
    },
    {
      name: "Vietnam",
      lat: 14.0,
      lng: 108.2,
      reports: 86000,
      risk: 68,
      lost: "$0.6B",
    },
    {
      name: "Malaysia",
      lat: 4.2,
      lng: 101.9,
      reports: 115000,
      risk: 76,
      lost: "$1.0B",
    },
    {
      name: "Singapore",
      lat: 1.35,
      lng: 103.8,
      reports: 42000,
      risk: 65,
      lost: "$0.5B",
    },
    {
      name: "UAE",
      lat: 23.4,
      lng: 53.8,
      reports: 58000,
      risk: 68,
      lost: "$0.6B",
    },
    {
      name: "Italy",
      lat: 41.8,
      lng: 12.5,
      reports: 142000,
      risk: 74,
      lost: "$1.1B",
    },
    {
      name: "Spain",
      lat: 40.4,
      lng: -3.7,
      reports: 128000,
      risk: 72,
      lost: "$1.0B",
    },
    {
      name: "Netherlands",
      lat: 52.1,
      lng: 5.2,
      reports: 98000,
      risk: 70,
      lost: "$0.8B",
    },
    {
      name: "Turkey",
      lat: 38.9,
      lng: 35.2,
      reports: 95000,
      risk: 72,
      lost: "$0.7B",
    },
    {
      name: "Taiwan",
      lat: 23.69,
      lng: 120.96,
      reports: 78000,
      risk: 70,
      lost: "$0.6B",
    },
    {
      name: "Hong Kong",
      lat: 22.39,
      lng: 114.1,
      reports: 62000,
      risk: 74,
      lost: "$0.8B",
    },
  ];

  function getRiskColor(risk) {
    if (risk >= 90) return "#FF453A";
    if (risk >= 80) return "#FF6961";
    if (risk >= 70) return "#FF9F0A";
    if (risk >= 60) return "#FFD60A";
    return "#30D158";
  }

  function getRadius(reports) {
    return Math.max(8, Math.min(30, Math.sqrt(reports / 1200)));
  }

  countryData.forEach((c) => {
    L.circleMarker([c.lat, c.lng], {
      radius: getRadius(c.reports),
      fillColor: getRiskColor(c.risk),
      color: getRiskColor(c.risk),
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.4,
    })
      .addTo(map)
      .bindTooltip(
        `
      <div class="custom-tooltip">
        <div class="tooltip-title">${c.name}</div>
        <div class="tooltip-value">📊 Reports: ${c.reports.toLocaleString()}</div>
        <div class="tooltip-value">⚠️ Risk Level: ${c.risk}/100</div>
        <div class="tooltip-value">💰 Losses: ${c.lost}</div>
      </div>
    `,
        { direction: "top", offset: [0, -10], className: "custom-tooltip" },
      );
  });

  // Legend
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    div.style.cssText =
      "background:rgba(28,28,30,0.9);padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);font-size:12px;";
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
  const grid = document.getElementById("newsGrid");
  if (!grid) return;

  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("API error");
    const news = await res.json();
    if (news && news.length > 0) {
      renderNews(grid, news);
      return;
    }
  } catch (e) {
    console.warn("Failed to load real news:", e.message);
  }

  // Fallback demo news with real clickable links and images
  renderNews(grid, [
    {
      title: "Major Phishing Campaign Targets Banking Customers Across Asia",
      date: "2026-02-19",
      source: "The Hacker News",
      link: "https://thehackernews.com/search/label/Phishing",
      summary: "A sophisticated phishing campaign leveraging AI-generated emails has been detected targeting major banks in Hong Kong and Singapore with credential harvesting attacks.",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&q=80&fit=crop",
    },
    {
      title: "New Ransomware Variant Uses Zero-Day Exploit in Windows",
      date: "2026-02-18",
      source: "BleepingComputer",
      link: "https://www.bleepingcomputer.com/news/security/ransomware/",
      summary: "Security researchers discovered a new ransomware strain that exploits a previously unknown vulnerability in Windows systems, affecting thousands of devices.",
      image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&q=80&fit=crop",
    },
    {
      title: "Critical Vulnerability Found in Popular Open-Source Library",
      date: "2026-02-17",
      source: "SecurityWeek",
      link: "https://www.securityweek.com/cyber-attacks/",
      summary: "A critical remote code execution vulnerability has been found affecting millions of applications worldwide, vendors urge immediate patching.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&fit=crop",
    },
    {
      title: "AI-Powered Deepfake Scams Surge 300% in Southeast Asia",
      date: "2026-02-16",
      source: "CyberScoop",
      link: "https://www.cyberscoop.io/",
      summary: "Law enforcement agencies report a dramatic increase in deepfake-enabled fraud across the APAC region, targeting businesses and individuals.",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80&fit=crop",
    },
    {
      title: "Global Law Enforcement Takes Down Major Dark Web Marketplace",
      date: "2026-02-15",
      source: "Krebs on Security",
      link: "https://krebsonsecurity.com/",
      summary: "An international operation has successfully dismantled one of the largest illegal marketplaces on the dark web, arresting dozens of operators.",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&fit=crop",
    },
  ]);
}

function renderNews(container, items) {
  // Filter items to ensure they all have valid links
  const validItems = items.filter(item => item.link && item.link.startsWith("http"));
  
  if (validItems.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted);">
        <p>No news articles available at the moment. Check back later.</p>
      </div>
    `;
    return;
  }

  // Create card-based layout with images (BBC-style)
  container.innerHTML = validItems
    .map((item, i) => {
      const d = new Date(item.date);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const link = item.link || item.url || "https://thehackernews.com";
      const image = item.image || "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80";
      
      return `
      <a href="${link}" target="_blank" rel="noopener noreferrer" 
         class="news-card" 
         style="
           animation: slideUp 0.4s ease ${i * 0.06}s both;
           display: flex;
           flex-direction: column;
           background: rgba(0,0,0,0.4);
           backdrop-filter: blur(20px);
           -webkit-backdrop-filter: blur(20px);
           border-radius: 16px;
           overflow: hidden;
           text-decoration: none;
           color: inherit;
           cursor: pointer;
           transition: all 0.3s ease;
           border: 1px solid rgba(255,255,255,0.1);
           height: 100%;
           display: flex;
           flex-direction: column;
         ">
        <!-- Image -->
        <div style="
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(0,113,227,0.1) 0%, rgba(255,180,80,0.1) 100%);
          position: relative;
        ">
          <img src="${image}" alt="${escapeHtml(item.title)}" 
               style="
                 width: 100%;
                 height: 100%;
                 object-fit: cover;
                 transition: transform 0.3s ease;
               "
               onmouseover="this.style.transform='scale(1.05)'"
               onmouseout="this.style.transform='scale(1)'"/>
          <div style="
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(255, 145, 0, 0.85);
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">
            THREAT INTEL
          </div>
        </div>

        <!-- Content -->
        <div style="
          padding: 1.2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        ">
          <!-- Title -->
          <h3 style="
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 0.8rem 0;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            transition: color 0.3s ease;
          ">
            ${escapeHtml(item.title)}
          </h3>

          <!-- Summary -->
          <p style="
            font-size: 0.82rem;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0 0 0.8rem 0;
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          ">
            ${escapeHtml(item.summary || "")}
          </p>

          <!-- Footer: Source and Date -->
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255,255,255,0.08);
            padding-top: 0.8rem;
            font-size: 0.75rem;
            color: var(--text-muted);
          ">
            <span style="font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
              ${escapeHtml(item.source || "Security News")}
            </span>
            <span style="font-variant-numeric: tabular-nums;">
              ${months[d.getMonth()]} ${d.getDate()}
            </span>
          </div>
        </div>
      </a>
    `;
    })
    .join("");
  
  // Add hover effects for cards
  const newsCards = container.querySelectorAll(".news-card");
  newsCards.forEach(card => {
    card.addEventListener("mouseenter", function() {
      this.style.background = "rgba(255,255,255,0.06)";
      this.style.borderColor = "rgba(255,255,255,0.2)";
      this.style.transform = "translateY(-4px)";
      const title = this.querySelector("h3");
      if (title) title.style.color = "var(--accent)";
    });
    card.addEventListener("mouseleave", function() {
      this.style.background = "rgba(0,0,0,0.4)";
      this.style.borderColor = "rgba(255,255,255,0.1)";
      this.style.transform = "translateY(0)";
      const title = this.querySelector("h3");
      if (title) title.style.color = "var(--text-primary)";
    });
  });
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ==================== AI-POWERED STATS ====================
// Fetches real-time cybersecurity stats from the AI endpoint
// and updates the hero stat counter elements on the dashboard
async function loadAIStats() {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return;
    const stats = await res.json();

    // Map stat keys to data-count attribute selectors
    const statEls = document.querySelectorAll(".stat-number[data-count]");
    if (!statEls.length) return;

    // Update counter targets from AI data
    statEls.forEach((el) => {
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";

      if (suffix === "K" && stats.scamsReported) {
        el.dataset.count = stats.scamsReported;
      } else if (!suffix && !prefix && stats.countriesAffected) {
        el.dataset.count = stats.countriesAffected;
      } else if (prefix === "$" && suffix === "B" && stats.moneyLost) {
        el.dataset.count = stats.moneyLost;
      } else if (suffix === "M" && stats.usersProtected) {
        el.dataset.count = stats.usersProtected;
      }
    });

    // Re-trigger counter animations with new values
    if (typeof animateCounters === "function") animateCounters();
  } catch (e) {
    console.log("Using default stats (AI unavailable)");
  }
}
