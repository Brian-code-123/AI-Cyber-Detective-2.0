// =====================================================
// NeoTrace Dashboard
// - Interactive map with clustering, heatmap, density, playback
// - News fusion with credibility badges and source filtering
// - GeoJSON/CSV export and real-time stream heartbeat
// =====================================================

const dashboardState = {
  news: [],
  newsMeta: null,
  newsFilters: {
    sourceType: "all",
    sort: "latest",
  },
  map: {
    instance: null,
    baseLayer: null,
    markersLayer: null,
    clusterLayer: null,
    heatLayer: null,
    densityLayer: null,
    events: [],
    filteredEvents: [],
    markerIndex: new Map(),
    layerVisibility: {
      markers: true,
      cluster: true,
      heat: true,
      density: false,
    },
    filters: {
      category: "all",
      minConfidence: 40,
      timeWindowHours: 24,
    },
    playback: {
      active: false,
      sliderValue: 100,
      timer: null,
    },
  },
};

let topScamsChart = null;
let trendChart = null;
let eventSource = null;
let fallbackPollingTimer = null;

function getChartScalesConfig(theme) {
  if (theme === "light") {
    return {
      gridColor: "rgba(0,0,0,0.06)",
      tickColor: "rgba(0,0,0,0.7)",
    };
  }
  return {
    gridColor: "rgba(255,255,255,0.08)",
    tickColor: "rgba(255,255,255,0.85)",
  };
}

function setChartTheme(theme) {
  if (theme === "light") {
    Chart.defaults.color = "rgba(0,0,0,0.72)";
    Chart.defaults.borderColor = "rgba(0,0,0,0.08)";
  } else {
    Chart.defaults.color = "rgba(255,255,255,0.9)";
    Chart.defaults.borderColor = "rgba(255,255,255,0.08)";
  }
  Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
}

function getCurrentTheme() {
  const html = document.documentElement;
  if (html.hasAttribute("data-theme")) {
    return html.getAttribute("data-theme");
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

document.addEventListener("DOMContentLoaded", async () => {
  setChartTheme(getCurrentTheme());
  bindThemeListener();
  bindNewsControls();
  bindMapControls();

  await Promise.all([
    initCharts(),
    loadAIStats(),
    loadNews(),
    initThreatMap(),
  ]);

  connectEventStream();
});

function bindThemeListener() {
  const observer = new MutationObserver(() => {
    setChartTheme(getCurrentTheme());
    initCharts();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

async function initCharts() {
  const stats = await fetchStatsData();
  renderTopScamsChart(stats.topScams || getFallbackTopScams());
  renderTrendChart(stats.yearlyTrend || getFallbackTrend());
}

async function fetchStatsData() {
  try {
    const res = await fetch("/api/stats", { cache: "no-store" });
    if (!res.ok) throw new Error("stats request failed");
    return await res.json();
  } catch (_error) {
    return {
      topScams: getFallbackTopScams(),
      yearlyTrend: getFallbackTrend(),
    };
  }
}

function getFallbackTopScams() {
  return [
    { name: "Phishing", reports: 324 },
    { name: "Investment Fraud", reports: 267 },
    { name: "Romance Scam", reports: 215 },
    { name: "Tech Support Scam", reports: 186 },
    { name: "Identity Theft", reports: 142 },
    { name: "BEC", reports: 125 },
    { name: "Crypto Scam", reports: 108 },
    { name: "Prize Scam", reports: 84 },
    { name: "Social Engineering", reports: 73 },
    { name: "Deepfake Scam", reports: 65 },
  ];
}

function getFallbackTrend() {
  return [
    { year: 2018, reports: 352, losses: 2.7 },
    { year: 2019, reports: 467, losses: 3.5 },
    { year: 2020, reports: 791, losses: 4.2 },
    { year: 2021, reports: 847, losses: 6.9 },
    { year: 2022, reports: 880, losses: 10.3 },
    { year: 2023, reports: 920, losses: 12.5 },
    { year: 2024, reports: 1020, losses: 14.8 },
    { year: 2025, reports: 1150, losses: 17.2 },
    { year: 2026, reports: 1280, losses: 19.8 },
  ];
}

function renderTopScamsChart(topScams) {
  const canvas = document.getElementById("topScamsChart");
  if (!canvas) return;

  if (topScamsChart) topScamsChart.destroy();

  topScamsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: topScams.map((item) => item.name),
      datasets: [
        {
          label: "Reports (K)",
          data: topScams.map((item) => item.reports),
          backgroundColor: [
            "rgba(10,132,255,0.62)",
            "rgba(48,209,88,0.62)",
            "rgba(255,69,58,0.62)",
            "rgba(255,159,10,0.62)",
            "rgba(191,90,242,0.62)",
            "rgba(100,210,255,0.62)",
            "rgba(255,214,10,0.62)",
            "rgba(255,55,95,0.62)",
            "rgba(90,200,245,0.62)",
            "rgba(110,190,160,0.62)",
          ],
          borderRadius: 7,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.x}K incidents`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: () => getChartScalesConfig(getCurrentTheme()).gridColor },
          ticks: {
            color: () => getChartScalesConfig(getCurrentTheme()).tickColor,
            callback: (v) => `${v}K`,
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: () => getChartScalesConfig(getCurrentTheme()).tickColor,
            autoSkip: false,
          },
        },
      },
    },
  });
}

function renderTrendChart(trendData) {
  const canvas = document.getElementById("trendChart");
  if (!canvas) return;

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: trendData.map((p) => String(p.year)),
      datasets: [
        {
          label: "Reports (K)",
          data: trendData.map((p) => p.reports),
          borderColor: "#0A84FF",
          backgroundColor: "rgba(10,132,255,0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
        {
          label: "Financial Loss (B USD)",
          data: trendData.map((p) => p.losses),
          borderColor: "#FF453A",
          backgroundColor: "rgba(255,69,58,0.06)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      interaction: { intersect: false, mode: "index" },
      scales: {
        x: {
          grid: { color: () => getChartScalesConfig(getCurrentTheme()).gridColor },
          ticks: { color: () => getChartScalesConfig(getCurrentTheme()).tickColor },
        },
        y: {
          beginAtZero: true,
          grid: { color: () => getChartScalesConfig(getCurrentTheme()).gridColor },
          ticks: { color: () => getChartScalesConfig(getCurrentTheme()).tickColor },
        },
      },
    },
  });
}

async function initThreatMap() {
  const mapContainer = document.getElementById("heatmap");
  if (!mapContainer || typeof L === "undefined") return;

  const map = L.map("heatmap", {
    center: [18, 12],
    zoom: 2,
    minZoom: 2,
    maxZoom: 9,
    keyboard: true,
  });

  const base = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      subdomains: "abcd",
      maxZoom: 20,
      attribution: "",
    },
  );
  base.addTo(map);

  const markersLayer = L.layerGroup().addTo(map);
  const clusterLayer =
    typeof L.markerClusterGroup === "function"
      ? L.markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          disableClusteringAtZoom: 6,
        }).addTo(map)
      : L.layerGroup().addTo(map);

  const heatLayer =
    typeof L.heatLayer === "function"
      ? L.heatLayer([], { radius: 26, blur: 18, minOpacity: 0.3 }).addTo(map)
      : null;

  const densityLayer = L.layerGroup().addTo(map);

  dashboardState.map.instance = map;
  dashboardState.map.baseLayer = base;
  dashboardState.map.markersLayer = markersLayer;
  dashboardState.map.clusterLayer = clusterLayer;
  dashboardState.map.heatLayer = heatLayer;
  dashboardState.map.densityLayer = densityLayer;

  await refreshEvents();
}

async function refreshEvents(forceRefresh = false) {
  const params = new URLSearchParams({ format: "json" });
  if (forceRefresh) params.set("refresh", "1");

  try {
    const res = await fetch(`/api/events?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("events request failed");
    const payload = await res.json();
    dashboardState.map.events = payload.events || [];
    applyMapFilters();
    setMapLivePill(`Live: ${dashboardState.map.events.length} events synced`);
  } catch (_error) {
    setMapLivePill("Live: using local fallback");
    dashboardState.map.events = getFallbackEvents();
    applyMapFilters();
  }
}

function getFallbackEvents() {
  return [
    {
      id: "evt-fallback-1",
      lat: 22.3193,
      lng: 114.1694,
      timestamp: new Date(Date.now() - 1.2 * 60 * 60 * 1000).toISOString(),
      source: "SOC Intel Feed",
      confidence: 87,
      category: "phishing",
      title: "Credential phishing domains detected in APAC banking sector",
      severity: "high",
      provenance: {
        sourceUrl: "https://example.com/fallback/apac-phishing",
        fetchedAt: new Date().toISOString(),
        parser: "fallback",
      },
    },
    {
      id: "evt-fallback-2",
      lat: 1.3521,
      lng: 103.8198,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: "CERT Advisory",
      confidence: 91,
      category: "ransomware",
      title: "Hospital sector receives ransomware extortion attempts",
      severity: "critical",
      provenance: {
        sourceUrl: "https://example.com/fallback/ransomware-hospital",
        fetchedAt: new Date().toISOString(),
        parser: "fallback",
      },
    },
  ];
}

function applyMapFilters() {
  const mapState = dashboardState.map;
  const now = Date.now();
  const category = mapState.filters.category;
  const minConfidence = mapState.filters.minConfidence;
  const windowMs = mapState.filters.timeWindowHours * 60 * 60 * 1000;
  const windowStart = now - windowMs;

  let filtered = mapState.events.filter((event) => {
    if (category !== "all" && event.category !== category) return false;
    if (event.confidence < minConfidence) return false;
    const eventTime = new Date(event.timestamp).getTime();
    if (Number.isNaN(eventTime) || eventTime < windowStart) return false;
    return true;
  });

  const cutoffTime = getPlaybackCutoffTime(filtered);
  if (cutoffTime) {
    filtered = filtered.filter((event) => new Date(event.timestamp).getTime() <= cutoffTime);
  }

  mapState.filteredEvents = filtered;
  renderMapLayers(filtered);
  refreshTimelineInfo(filtered);
}

function getPlaybackCutoffTime(events) {
  if (!events.length) return 0;
  const sliderPct = dashboardState.map.playback.sliderValue / 100;
  if (sliderPct >= 1) return Number.MAX_SAFE_INTEGER;
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor(sliderPct * (sorted.length - 1))));
  return new Date(sorted[idx].timestamp).getTime();
}

function renderMapLayers(events) {
  const mapState = dashboardState.map;
  const map = mapState.instance;
  if (!map) return;

  mapState.markerIndex.clear();
  mapState.markersLayer.clearLayers();
  mapState.clusterLayer.clearLayers();
  mapState.densityLayer.clearLayers();
  if (mapState.heatLayer) mapState.heatLayer.setLatLngs([]);

  const heatPoints = [];
  const densityBuckets = new Map();

  events.forEach((event) => {
    const marker = L.circleMarker([event.lat, event.lng], {
      radius: markerRadius(event.confidence),
      fillColor: markerColor(event.confidence),
      color: markerColor(event.confidence),
      fillOpacity: 0.5,
      opacity: 0.92,
      weight: 1.2,
    });

    marker.bindTooltip(buildMarkerTooltip(event), {
      direction: "top",
      sticky: true,
      className: "custom-tooltip",
    });

    marker.on("click", () => {
      updateMapDetailPanel(event);
      marker.openTooltip();
    });

    marker.addTo(mapState.markersLayer);
    mapState.clusterLayer.addLayer(marker);
    mapState.markerIndex.set(event.id, marker);

    heatPoints.push([event.lat, event.lng, Math.max(0.2, event.confidence / 100)]);

    const gridKey = `${Math.round(event.lat / 8) * 8}:${Math.round(event.lng / 8) * 8}`;
    const existing = densityBuckets.get(gridKey) || {
      lat: Math.round(event.lat / 8) * 8,
      lng: Math.round(event.lng / 8) * 8,
      count: 0,
      confidence: 0,
    };
    existing.count += 1;
    existing.confidence += event.confidence;
    densityBuckets.set(gridKey, existing);
  });

  if (mapState.heatLayer) {
    mapState.heatLayer.setLatLngs(heatPoints);
  }

  [...densityBuckets.values()].forEach((bucket) => {
    const avgConfidence = bucket.confidence / bucket.count;
    const radius = 50000 + bucket.count * 80000;
    L.circle([bucket.lat, bucket.lng], {
      radius,
      fillColor: markerColor(avgConfidence),
      color: markerColor(avgConfidence),
      fillOpacity: 0.2,
      opacity: 0.35,
      weight: 1,
    })
      .bindTooltip(`Density: ${bucket.count} incidents | Avg confidence: ${Math.round(avgConfidence)}`)
      .addTo(mapState.densityLayer);
  });

  applyLayerVisibility();
}

function markerColor(confidence) {
  if (confidence >= 90) return "#ff453a";
  if (confidence >= 80) return "#ff6b61";
  if (confidence >= 70) return "#ff9f0a";
  if (confidence >= 60) return "#ffd60a";
  return "#30d158";
}

function markerRadius(confidence) {
  return Math.max(6, Math.min(18, confidence / 7));
}

function buildMarkerTooltip(event) {
  const ts = new Date(event.timestamp).toLocaleString();
  return `
    <div class="custom-tooltip">
      <div class="tooltip-title">${escapeHtml(event.title || event.category)}</div>
      <div class="tooltip-value">Source: ${escapeHtml(event.source)}</div>
      <div class="tooltip-value">Time: ${escapeHtml(ts)}</div>
      <div class="tooltip-value">Confidence: ${event.confidence}</div>
      <div class="tooltip-value">Category: ${escapeHtml(event.category)}</div>
    </div>
  `;
}

function refreshTimelineInfo(events) {
  const slider = document.getElementById("timelineSlider");
  const label = document.getElementById("timelineLabel");
  if (!slider || !label) return;

  if (!events.length) {
    label.textContent = "No events";
    return;
  }

  const cutoff = getPlaybackCutoffTime(events);
  if (!cutoff || cutoff === Number.MAX_SAFE_INTEGER) {
    label.textContent = `Latest (${events.length})`;
  } else {
    label.textContent = `${new Date(cutoff).toLocaleString()} | ${events.length} visible`;
  }
}

function applyLayerVisibility() {
  const mapState = dashboardState.map;
  const map = mapState.instance;
  if (!map) return;

  toggleLayer(mapState.markersLayer, mapState.layerVisibility.markers, map);
  toggleLayer(mapState.clusterLayer, mapState.layerVisibility.cluster, map);
  if (mapState.heatLayer) toggleLayer(mapState.heatLayer, mapState.layerVisibility.heat, map);
  toggleLayer(mapState.densityLayer, mapState.layerVisibility.density, map);
}

function toggleLayer(layer, enabled, map) {
  if (!layer) return;
  const hasLayer = map.hasLayer(layer);
  if (enabled && !hasLayer) map.addLayer(layer);
  if (!enabled && hasLayer) map.removeLayer(layer);
}

function bindMapControls() {
  const category = document.getElementById("mapCategoryFilter");
  const confidence = document.getElementById("mapConfidenceFilter");
  const confidenceValue = document.getElementById("mapConfidenceValue");
  const timeRange = document.getElementById("mapTimeRange");
  const layerButtons = document.querySelectorAll(".map-btn[data-layer]");
  const exportGeoJsonBtn = document.getElementById("exportGeoJsonBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const playbackBtn = document.getElementById("playbackBtn");
  const timelineSlider = document.getElementById("timelineSlider");

  if (category) {
    category.addEventListener("change", () => {
      dashboardState.map.filters.category = category.value;
      applyMapFilters();
    });
  }

  if (confidence) {
    confidence.addEventListener("input", () => {
      dashboardState.map.filters.minConfidence = Number(confidence.value);
      if (confidenceValue) confidenceValue.textContent = String(confidence.value);
      applyMapFilters();
    });
  }

  if (timeRange) {
    timeRange.addEventListener("change", () => {
      dashboardState.map.filters.timeWindowHours = Number(timeRange.value);
      applyMapFilters();
    });
  }

  layerButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const layer = btn.dataset.layer;
      dashboardState.map.layerVisibility[layer] = !dashboardState.map.layerVisibility[layer];
      btn.classList.toggle("active", dashboardState.map.layerVisibility[layer]);
      applyLayerVisibility();
    });
  });

  if (exportGeoJsonBtn) {
    exportGeoJsonBtn.addEventListener("click", () => openEventExport("geojson"));
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => openEventExport("csv"));
  }

  if (playbackBtn) {
    playbackBtn.addEventListener("click", () => togglePlayback());
  }

  if (timelineSlider) {
    timelineSlider.addEventListener("input", () => {
      dashboardState.map.playback.sliderValue = Number(timelineSlider.value);
      applyMapFilters();
    });
  }
}

function openEventExport(format) {
  const params = new URLSearchParams({
    format,
    category: dashboardState.map.filters.category === "all" ? "" : dashboardState.map.filters.category,
    minConfidence: String(dashboardState.map.filters.minConfidence),
  });
  window.open(`/api/events/export?${params.toString()}`, "_blank", "noopener");
}

function togglePlayback() {
  const playbackBtn = document.getElementById("playbackBtn");
  const slider = document.getElementById("timelineSlider");
  if (!playbackBtn || !slider) return;

  const playback = dashboardState.map.playback;
  playback.active = !playback.active;
  playbackBtn.classList.toggle("active", playback.active);
  playbackBtn.textContent = playback.active ? "Pause" : "Playback";

  if (playback.active) {
    if (playback.timer) clearInterval(playback.timer);
    playback.timer = setInterval(() => {
      let next = Number(slider.value) + 2;
      if (next > 100) next = 0;
      slider.value = String(next);
      playback.sliderValue = next;
      applyMapFilters();
    }, 700);
  } else if (playback.timer) {
    clearInterval(playback.timer);
    playback.timer = null;
  }
}

function updateMapDetailPanel(item) {
  const panel = document.getElementById("mapDetailPanel");
  if (!panel || !item) return;

  const sourceUrl = item.provenance?.sourceUrl || item.link || "";
  const type = item.category || "news";
  panel.innerHTML = `
    <h4>${escapeHtml(item.title || "Event")}</h4>
    <ul class="map-detail-list">
      <li><strong>Source:</strong> ${escapeHtml(item.source || "Unknown")}</li>
      <li><strong>Timestamp:</strong> ${escapeHtml(new Date(item.timestamp || item.date).toLocaleString())}</li>
      <li><strong>Confidence:</strong> ${escapeHtml(String(item.confidence || "N/A"))}</li>
      <li><strong>Category:</strong> ${escapeHtml(type)}</li>
      <li><strong>Provenance:</strong> ${escapeHtml(item.provenance?.parser || "n/a")}</li>
    </ul>
    ${sourceUrl ? `<a class="map-source-link" href="${sourceUrl}" target="_blank" rel="noopener">Open source reference</a>` : ""}
  `;
}

function focusMapOnNews(newsItem) {
  if (!newsItem || !Number.isFinite(newsItem.lat) || !Number.isFinite(newsItem.lng)) return;
  const map = dashboardState.map.instance;
  if (!map) return;

  map.setView([newsItem.lat, newsItem.lng], 4, { animate: true });

  const linkedMarker = [...dashboardState.map.markerIndex.values()].find((marker) => {
    const ll = marker.getLatLng();
    return Math.abs(ll.lat - newsItem.lat) < 0.0001 && Math.abs(ll.lng - newsItem.lng) < 0.0001;
  });

  if (linkedMarker) {
    linkedMarker.fire("click");
  } else {
    updateMapDetailPanel(newsItem);
  }
}

async function loadNews() {
  const grid = document.getElementById("newsGrid");
  if (!grid) return;

  try {
    const res = await fetch("/api/news?includeMeta=1&limit=36", { cache: "no-store" });
    if (!res.ok) throw new Error("news request failed");
    const payload = await res.json();

    dashboardState.news = payload.items || [];
    dashboardState.newsMeta = payload.meta || null;
    renderNewsMetrics();
    applyNewsFilters();
  } catch (_error) {
    dashboardState.news = fallbackNews();
    dashboardState.newsMeta = null;
    renderNewsMetrics();
    applyNewsFilters();
  }
}

function fallbackNews() {
  const now = Date.now();
  return [
    {
      id: "news-fallback-1",
      title: "Major phishing campaign targets banking customers across APAC",
      date: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      source: "The Hacker News",
      sourceType: "rss",
      confidence: 84,
      confidenceBadge: "Medium Confidence",
      corroborationCount: 2,
      clusterId: "cluster-a",
      shortSummary:
        "Security teams report credential-harvesting pages impersonating regional banking portals.",
      summary:
        "Security teams report credential-harvesting pages impersonating regional banking portals and pushing victims through fake MFA challenges.",
      link: "https://thehackernews.com/search/label/Phishing",
      image:
        "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&q=80&fit=crop",
      lat: 22.3193,
      lng: 114.1694,
      provenance: {
        sourceUrl: "https://thehackernews.com/search/label/Phishing",
        fetchedAt: new Date().toISOString(),
        parser: "fallback",
      },
    },
    {
      id: "news-fallback-2",
      title: "Official advisory highlights active ransomware targeting healthcare",
      date: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      source: "CISA Advisories",
      sourceType: "official",
      confidence: 92,
      confidenceBadge: "High Confidence",
      corroborationCount: 3,
      clusterId: "cluster-b",
      shortSummary:
        "Authorities urge immediate patching and segmentation after new ransomware indicators were confirmed.",
      summary:
        "Authorities urge immediate patching and segmentation after new ransomware indicators were confirmed in healthcare incident response operations.",
      link: "https://www.cisa.gov/cybersecurity-advisories",
      image:
        "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&q=80&fit=crop",
      lat: 1.3521,
      lng: 103.8198,
      provenance: {
        sourceUrl: "https://www.cisa.gov/cybersecurity-advisories",
        fetchedAt: new Date().toISOString(),
        parser: "fallback",
      },
    },
  ];
}

function bindNewsControls() {
  const sourceButtons = document.querySelectorAll(".intel-chip[data-news-source]");
  const sortSelect = document.getElementById("newsSort");

  sourceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      dashboardState.newsFilters.sourceType = button.dataset.newsSource || "all";
      sourceButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      applyNewsFilters();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      dashboardState.newsFilters.sort = sortSelect.value;
      applyNewsFilters();
    });
  }
}

function applyNewsFilters() {
  let items = [...dashboardState.news];
  const { sourceType, sort } = dashboardState.newsFilters;

  if (sourceType !== "all") {
    items = items.filter((item) => (item.sourceType || "rss") === sourceType);
  }

  if (sort === "confidence") {
    items.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  } else if (sort === "corroboration") {
    items.sort((a, b) => (b.corroborationCount || 0) - (a.corroborationCount || 0));
  } else {
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  renderNews(items);
}

function renderNews(items) {
  const grid = document.getElementById("newsGrid");
  if (!grid) return;

  // Filter news to only show items from the last 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const recentItems = items.filter((item) => {
    const itemDate = new Date(item.date);
    return !Number.isNaN(itemDate.getTime()) && itemDate >= threeDaysAgo;
  });

  if (!recentItems.length) {
    grid.innerHTML = `
      <div class="intel-empty">
        <h4>No articles from the last 3 days</h4>
        <p>Check back later for newer content or expand your date range.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = recentItems
    .map((item) => {
      const d = new Date(item.date);
      const dateLabel = Number.isNaN(d.getTime()) ? "Unknown date" : d.toLocaleString();
      const confidenceClass = confidenceClassName(item.confidence || 0);

      return `
      <article class="intel-card carousel-item news-item" tabindex="0" data-news-id="${escapeHtml(item.id)}">
        <div class="intel-card-media">
          <img src="${escapeHtml(item.image || "")}" alt="${escapeHtml(item.title)}" loading="lazy" />
          <span class="intel-badge ${confidenceClass}">${escapeHtml(item.confidenceBadge || "Watch")}</span>
        </div>
        <div class="intel-card-body">
          <div class="intel-card-meta">
            <span>${escapeHtml(item.source)}</span>
            <span>${escapeHtml(item.sourceType || "rss")}</span>
            <span>${item.confidence || 0}/100</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.shortSummary || item.summary || "")}</p>
          <div class="intel-card-footer">
            <span>${escapeHtml(dateLabel)}</span>
            <span>Corroboration: ${item.corroborationCount || 1}</span>
          </div>
          <div class="intel-card-actions">
            <button class="map-jump-btn" data-news-open-map="${escapeHtml(item.id)}">Show on map</button>
            <a href="${escapeHtml(item.link || "#")}" target="_blank" rel="noopener">Read source</a>
          </div>
        </div>
      </article>
      `;
    })
    .join("");

  // Ensure carousel styling is applied
  grid.classList.add("carousel-container");
  grid.querySelectorAll(".intel-card").forEach((card) => {
    card.style.minWidth = "380px";
    card.style.flexShrink = "0";
  });

  grid.querySelectorAll("[data-news-open-map]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const id = btn.getAttribute("data-news-open-map");
      const item = dashboardState.news.find((n) => n.id === id);
      if (item) {
        focusMapOnNews(item);
        updateMapDetailPanel(item);
      }
    });
  });

  grid.querySelectorAll(".intel-card").forEach((card) => {
    const newsId = card.getAttribute("data-news-id");
    const item = dashboardState.news.find((n) => n.id === newsId);
    if (!item) return;

    card.addEventListener("click", () => {
      focusMapOnNews(item);
      updateMapDetailPanel(item);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        focusMapOnNews(item);
        updateMapDetailPanel(item);
      }
    });
  });
}

function renderNewsMetrics() {
  const list = document.getElementById("newsMetricsList");
  if (!list) return;

  const meta = dashboardState.newsMeta;
  if (!meta || !meta.sourceBreakdown) {
    list.innerHTML = `<p class="intel-empty-copy">Metrics unavailable.</p>`;
    return;
  }

  const rows = Object.entries(meta.sourceBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([source, count]) => `
      <div class="intel-metric-row">
        <span>${escapeHtml(source)}</span>
        <span>${count}</span>
      </div>
    `,
    )
    .join("");

  list.innerHTML = `
    <div class="intel-metric-head">Avg confidence: ${meta.confidenceAverage || 0}</div>
    ${rows}
  `;
}

function confidenceClassName(score) {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  if (score >= 55) return "watch";
  return "low";
}

function connectEventStream() {
  if (!window.EventSource) {
    startFallbackEventPolling();
    return;
  }

  try {
    eventSource = new EventSource("/api/events/stream");

    eventSource.addEventListener("snapshot", async (event) => {
      const data = JSON.parse(event.data || "{}");
      setMapLivePill(`Live: ${data.eventCount || 0} events | latency ${data.latencyMs || 0}ms`);
      await refreshEvents();
    });

    eventSource.addEventListener("error", () => {
      setMapLivePill("Live: stream reconnecting");
      if (eventSource) eventSource.close();
      startFallbackEventPolling();
    });
  } catch (_error) {
    startFallbackEventPolling();
  }
}

function startFallbackEventPolling() {
  if (fallbackPollingTimer) return;
  fallbackPollingTimer = setInterval(() => {
    refreshEvents();
  }, 60000);
}

function setMapLivePill(text) {
  const pill = document.getElementById("mapLivePill");
  if (pill) pill.textContent = text;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadAIStats() {
  try {
    const res = await fetch("/api/stats", { cache: "no-store" });
    if (!res.ok) return;
    const stats = await res.json();

    const statEls = document.querySelectorAll(".stat-number[data-count]");
    if (!statEls.length) return;

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

    if (typeof animateCounters === "function") animateCounters();
  } catch (_error) {
    // Keep static fallback numbers.
  }
}
