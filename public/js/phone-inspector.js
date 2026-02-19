/* ─── Phone Inspector ─── NeoTrace v4.0 ─── */

let radarChart = null;

/* Country flag emoji from ISO code */
function getFlag(code) {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/* Risk color helper */
function riskColor(score) {
  if (score >= 75) return "var(--red)";
  if (score >= 40) return "var(--orange)";
  return "var(--green)";
}

function riskLabel(score) {
  if (score >= 75) return t("phone.highRisk");
  if (score >= 40) return t("phone.mediumRisk");
  return t("phone.lowRisk");
}

/* ─── Dial Code Suggest ─── */
const DIAL_COUNTRIES = [
  { code: "+852", name: "Hong Kong" },
  { code: "+1",   name: "United States / Canada" },
  { code: "+44",  name: "United Kingdom" },
  { code: "+86",  name: "China" },
  { code: "+81",  name: "Japan" },
  { code: "+82",  name: "South Korea" },
  { code: "+886", name: "Taiwan" },
  { code: "+65",  name: "Singapore" },
  { code: "+61",  name: "Australia" },
  { code: "+49",  name: "Germany" },
  { code: "+33",  name: "France" },
  { code: "+91",  name: "India" },
  { code: "+55",  name: "Brazil" },
  { code: "+7",   name: "Russia" },
  { code: "+971", name: "UAE" },
  { code: "+66",  name: "Thailand" },
  { code: "+63",  name: "Philippines" },
  { code: "+60",  name: "Malaysia" },
  { code: "+62",  name: "Indonesia" },
  { code: "+84",  name: "Vietnam" },
  { code: "+234", name: "Nigeria" },
  { code: "+254", name: "Kenya" },
  { code: "+27",  name: "South Africa" },
  { code: "+380", name: "Ukraine" },
  { code: "+39",  name: "Italy" },
  { code: "+34",  name: "Spain" },
  { code: "+31",  name: "Netherlands" },
  { code: "+41",  name: "Switzerland" },
  { code: "+48",  name: "Poland" },
  { code: "+90",  name: "Turkey" },
];

function onDialInput(input) {
  const val = input.value.trim();
  const dropdown = document.getElementById("dialSuggest");
  if (!val || val === "+") {
    dropdown.style.display = "none";
    return;
  }
  const matches = DIAL_COUNTRIES.filter(c =>
    c.code.startsWith(val) || c.name.toLowerCase().includes(val.toLowerCase())
  ).slice(0, 6);

  if (!matches.length) { dropdown.style.display = "none"; return; }

  dropdown.innerHTML = matches.map(c =>
    `<div class="suggest-item" onclick="selectDial('${c.code}')">${c.code} <span style="opacity:0.6;font-size:0.8rem;">${c.name}</span></div>`
  ).join("");
  dropdown.style.display = "block";
}

function selectDial(code) {
  document.getElementById("dialCodeInput").value = code;
  document.getElementById("dialSuggest").style.display = "none";
  document.getElementById("numberInput").focus();
}

/* ─── Main Function ─── */
async function checkPhone() {
  // Read split inputs
  const dialRaw = (document.getElementById("dialCodeInput")?.value || "").trim();
  const numberRaw = (document.getElementById("numberInput")?.value || "").trim();

  // If numberRaw contains a full international number (starts with +), send as-is
  let payload;
  if (numberRaw.startsWith("+") || numberRaw.startsWith("00")) {
    // Full number in right field
    payload = { phone: numberRaw };
  } else if (dialRaw && numberRaw) {
    // Split mode
    const dialCode = dialRaw.replace(/^\+/, "");
    payload = { dialCode, number: numberRaw };
  } else {
    // Fallback — treat whatever is in numberRaw as full phone
    const combined = (dialRaw ? dialRaw + numberRaw : numberRaw);
    if (!combined) {
      document.getElementById("numberInput")?.focus();
      return;
    }
    payload = { phone: combined };
  }

  const scanBtn = document.getElementById("scanBtn");
  scanBtn.disabled = true;
  scanBtn.innerHTML = `<span class="scan-spinner"></span> ${t("phone.scanning")}`;

  try {
    const res = await fetch("/api/phone/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    document.getElementById("noResults").style.display = "none";
    document.getElementById("resultsArea").style.display = "block";

    renderKPI(data);
    renderRadar(data);
    renderDetails(data);

    // Show AI analysis if present
    const aiPanel = document.getElementById("aiAnalysisPanel");
    const aiContent = document.getElementById("aiAnalysisContent");
    if (data.aiAnalysis && aiPanel) {
      aiPanel.style.display = "block";
      aiContent.textContent = data.aiAnalysis;
    }
  } catch (err) {
    console.error("Phone check failed:", err);
  } finally {
    scanBtn.disabled = false;
    scanBtn.innerHTML = `<span data-i18n="phone.scan">SCAN NUMBER</span>`;
  }
}


/* ─── KPI Cards ─── */
function renderKPI(d) {
  const grid = document.getElementById("kpiGrid");
  const cards = [
    {
      icon: getFlag(d.country_code),
      label: t("phone.country"),
      value: d.country || "Unknown",
      accent: "var(--accent)",
    },
    {
      icon: "📡",
      label: t("phone.carrier"),
      value: d.carrier || "Unknown",
      accent: "var(--cyan)",
    },
    {
      icon: "📞",
      label: t("phone.lineType"),
      value: d.line_type || d.number_type || "Unknown",
      accent: lineTypeColor(d.line_type || d.number_type),
    },
    {
      icon: "🛡️",
      label: t("phone.riskScore"),
      value: `${d.fraud_score}/100`,
      accent: riskColor(d.fraud_score),
      progress: d.fraud_score,
    },
    {
      icon: "📈",
      label: t("phone.activity"),
      value: d.active_status || "Unknown",
      accent: d.active_status === "Active" ? "var(--green)" : "var(--orange)",
    },
    {
      icon: "🚫",
      label: t("phone.blacklist"),
      value: `${d.blacklist_hits || 0} hits`,
      accent: d.blacklist_hits > 0 ? "var(--red)" : "var(--green)",
    },
    {
      icon: "⏰",
      label: "Timezone",
      value: d.timezone || "—",
      accent: "var(--purple)",
    },
    {
      icon: "✅",
      label: "Valid",
      value: d.valid === true ? "Yes" : d.valid === false ? "No" : "—",
      accent: d.valid ? "var(--green)" : d.valid === false ? "var(--red)" : "var(--text-secondary)",
    },
  ];

  grid.innerHTML = cards
    .map(
      (c) => `
    <div class="kpi-card" style="--kpi-accent: ${c.accent};">
      <div class="kpi-icon">${c.icon}</div>
      <div class="kpi-body">
        <div class="kpi-label">${c.label}</div>
        <div class="kpi-value">${c.value}</div>
        ${
          c.progress !== undefined
            ? `
          <div class="kpi-bar-bg">
            <div class="kpi-bar-fill" style="width:${c.progress}%; background:${c.accent};"></div>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `,
    )
    .join("");
}

function lineTypeColor(type) {
  if (!type) return "var(--text-secondary)";
  const t = type.toLowerCase();
  if (t === "voip") return "var(--red)";
  if (t === "mobile") return "var(--green)";
  if (t === "landline") return "var(--cyan)";
  return "var(--text-secondary)";
}

/* ─── Radar Chart ─── */
/** Create/update the Chart.js radar chart for the phone risk profile. @param {Object} d - Phone data */
function renderRadar(d) {
  const ctx = document.getElementById("riskRadar").getContext("2d");
  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: [
        "Fraud Score",
        "Spam Risk",
        "VOIP Risk",
        "Recent Activity",
        "Blacklist Score",
        "Carrier Trust",
      ],
      datasets: [
        {
          label: "Risk Profile",
          data: [
            d.fraud_score || 0,
            d.spam_risk || 0,
            d.voip_risk || 0,
            d.recent_activity || 0,
            Math.min((d.blacklist_hits || 0) * 25, 100),
            d.carrier_trust || 0,
          ],
          backgroundColor: "rgba(10, 132, 255, 0.15)",
          borderColor: "#0A84FF",
          borderWidth: 2,
          pointBackgroundColor: "#0A84FF",
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
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
            color: "#999",
            backdropColor: "transparent",
            font: { size: 10 },
          },
          grid: { color: "rgba(255,255,255,0.06)" },
          angleLines: { color: "rgba(255,255,255,0.06)" },
          pointLabels: {
            color: "#aaa",
            font: { family: "Inter", size: 11 },
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

/* ─── Details Panel ─── */
function renderDetails(d) {
  const panel = document.getElementById("detailsPanel");
  const riskClass =
    d.fraud_score >= 75 ? "danger" : d.fraud_score >= 40 ? "warning" : "safe";

  panel.innerHTML = `
    <h3>📋 Detailed Findings</h3>

    <div class="finding-item ${riskClass}">
      <strong>${t("phone.riskScore")}:</strong> ${d.fraud_score}/100 — ${riskLabel(d.fraud_score)}
    </div>

    <div class="finding-item ${(d.line_type || d.number_type || '').toUpperCase() === 'VOIP' ? 'danger' : 'info'}">
      <strong>${t("phone.lineType")}:</strong> ${d.line_type || d.number_type || "Unknown"}
      ${(d.line_type || d.number_type || '').toUpperCase() === 'VOIP' ? " ⚠️ High abuse potential" : ""}
    </div>

    <div class="finding-item info">
      <strong>${t("phone.carrier")}:</strong> ${d.carrier || "Unknown"}
    </div>

    <div class="finding-item info">
      <strong>${t("phone.country")}:</strong> ${getFlag(d.country_code)} ${d.country || "Unknown"} (+${d.dial_code || "?"})
    </div>

    ${d.location ? `
    <div class="finding-item info">
      <strong>📍 Location:</strong> ${d.location}
    </div>` : ""}

    ${d.timezone ? `
    <div class="finding-item info">
      <strong>⏰ Timezone:</strong> ${d.timezone}
    </div>` : ""}

    ${d.international_format ? `
    <div class="finding-item info">
      <strong>🌐 International Format:</strong> ${d.international_format}
    </div>` : ""}

    ${d.local_format ? `
    <div class="finding-item info">
      <strong>📲 Local Format:</strong> ${d.local_format}
    </div>` : ""}

    ${d.valid !== undefined ? `
    <div class="finding-item ${d.valid ? "safe" : "danger"}">
      <strong>✅ Valid Number:</strong> ${d.valid ? "Yes — Verified" : "No — Invalid or unreachable"}
    </div>` : ""}

    ${d.spam_risk !== undefined ? `
    <div class="finding-item ${d.spam_risk >= 50 ? "warning" : "safe"}">
      <strong>📵 Spam Risk:</strong> ${d.spam_risk}/100
    </div>` : ""}

    ${d.voip_risk !== undefined ? `
    <div class="finding-item ${d.voip_risk >= 50 ? "danger" : "safe"}">
      <strong>🖥️ VOIP Risk:</strong> ${d.voip_risk}/100
    </div>` : ""}

    ${d.carrier_trust !== undefined ? `
    <div class="finding-item ${d.carrier_trust >= 70 ? "safe" : d.carrier_trust >= 40 ? "warning" : "danger"}">
      <strong>🏢 Carrier Trust:</strong> ${d.carrier_trust}/100
    </div>` : ""}

    ${d.email ? `
    <div class="finding-item ${d.email.includes("temp") ? "warning" : "info"}">
      <strong>${t("phone.email")}:</strong> ${d.email}
    </div>` : ""}

    <div class="finding-item ${d.blacklist_hits > 0 ? "danger" : "safe"}">
      <strong>${t("phone.blacklist")}:</strong> ${d.blacklist_hits || 0} database hits
    </div>

    ${d.notes ? `
    <div class="finding-item warning" style="margin-top: 0.5rem;">
      <strong>⚠️ Notes:</strong> ${d.notes}
    </div>` : ""}

    <div class="finding-item info" style="margin-top: 0.8rem; opacity: 0.6;">
      <strong>🔄 Data Source:</strong> ${d.source === "numverify" ? "Numverify API (Real-time)" : "NeoTrace Demo Database"}
    </div>
  `;
}

/* ─── Enter key & Auto-suggest ─── */
document.addEventListener("DOMContentLoaded", () => {
  // Close dial suggest on outside click
  document.addEventListener("click", (e) => {
    const dd = document.getElementById("dialSuggest");
    if (dd && !dd.contains(e.target) && e.target.id !== "dialCodeInput") {
      dd.style.display = "none";
    }
  });

  // Enter key on number input
  const numInput = document.getElementById("numberInput");
  if (numInput) {
    numInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkPhone();
    });
  }
});
