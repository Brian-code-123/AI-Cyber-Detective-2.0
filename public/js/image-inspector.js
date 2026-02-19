// =====================================================
// AI CYBER DETECTIVE 2.0 — Image Inspector
// =====================================================

let selectedFile = null;

document.addEventListener("DOMContentLoaded", () => {
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");

  uploadArea.addEventListener("click", () => fileInput.click());

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });
});

/** Validate and preview the selected image file. @param {File} file */
function handleFile(file) {
  if (!file.type.startsWith("image/")) return;
  if (file.size > 20 * 1024 * 1024) {
    alert(t("error.fileTooLarge"));
    return;
  }

  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("previewImg").src = e.target.result;
    document.getElementById("imagePreview").classList.remove("hidden");
    document.getElementById("fileName").textContent = file.name;
  };
  reader.readAsDataURL(file);
  document.getElementById("analyzeBtn").disabled = false;
}

/** Upload image to /api/analyze-image and display forensic results. */
async function analyzeImage() {
  if (!selectedFile) return;

  document.getElementById("resultsPlaceholder").classList.add("hidden");
  document.getElementById("resultsContainer").classList.add("hidden");
  document.getElementById("loadingState").classList.remove("hidden");
  document.getElementById("analyzeBtn").disabled = true;

  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const res = await fetch("/api/analyze-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    displayResults(data);
  } catch (error) {
    console.error("Analysis failed:", error);
    document.getElementById("loadingState").classList.add("hidden");
    document.getElementById("resultsPlaceholder").classList.remove("hidden");
  } finally {
    document.getElementById("analyzeBtn").disabled = false;
  }
}

/** Render all forensic analysis panels: AI detection, EXIF, compression, forensic artifacts. @param {Object} data - API response */
function displayResults(data) {
  document.getElementById("loadingState").classList.add("hidden");
  document.getElementById("resultsContainer").classList.remove("hidden");

  // AI Detection Score
  const score = data.aiDetection.score;
  const arc = document.getElementById("aiRiskArc");
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (score / 100) * circumference;
  arc.style.strokeDashoffset = offset;

  let color = "var(--accent-green)";
  if (score >= 60) color = "var(--accent-red)";
  else if (score >= 35) color = "var(--accent-orange)";
  else if (score >= 15) color = "var(--accent-yellow)";
  arc.style.stroke = color;

  document.getElementById("aiScore").textContent = score;
  document.getElementById("aiScore").style.color = color;
  document.getElementById("aiVerdict").textContent = data.aiDetection.verdict;
  document.getElementById("aiVerdict").style.color = color;

  // AI Findings
  document.getElementById("aiFindings").innerHTML = data.aiDetection.findings
    .map(
      (f) =>
        `<div class="finding-item ${f.type}">${getIcon(f.type)} ${f.message}</div>`,
    )
    .join("");

  // File Info
  const fi = data.fileInfo;
  document.getElementById("fileInfoTable").innerHTML = `
    <tr><td>${t("image.fileName")}</td><td>${fi.name}</td></tr>
    <tr><td>${t("image.fileSize")}</td><td>${fi.sizeFormatted}</td></tr>
    <tr><td>${t("image.mimeType")}</td><td>${fi.type}</td></tr>
  `;

  // EXIF Data
  const exif = data.exifData;
  const exifTable = document.getElementById("exifTable");
  const noExif = document.getElementById("noExif");

  if (exif && Object.values(exif).some((v) => v !== null)) {
    noExif.classList.add("hidden");
    exifTable.classList.remove("hidden");
    let rows = "";
    if (exif.make)
      rows += `<tr><td>${t("image.cameraMake")}</td><td>${exif.make}</td></tr>`;
    if (exif.model)
      rows += `<tr><td>${t("image.cameraModel")}</td><td>${exif.model}</td></tr>`;
    if (exif.software)
      rows += `<tr><td>${t("image.software")}</td><td>${exif.software}</td></tr>`;
    if (exif.dateTime)
      rows += `<tr><td>${t("image.dateTaken")}</td><td>${exif.dateTime}</td></tr>`;
    if (exif.dimensions)
      rows += `<tr><td>${t("image.dimensions")}</td><td>${exif.dimensions}</td></tr>`;
    if (exif.iso)
      rows += `<tr><td>${t("image.iso")}</td><td>${exif.iso}</td></tr>`;
    if (exif.focalLength)
      rows += `<tr><td>${t("image.focalLength")}</td><td>${exif.focalLength}mm</td></tr>`;
    if (exif.aperture)
      rows += `<tr><td>${t("image.aperture")}</td><td>f/${exif.aperture}</td></tr>`;
    if (exif.exposureTime)
      rows += `<tr><td>${t("image.exposure")}</td><td>${exif.exposureTime}s</td></tr>`;
    if (exif.gps)
      rows += `<tr><td>${t("image.gps")}</td><td>${exif.gps.lat.toFixed(4)}, ${exif.gps.lng.toFixed(4)}</td></tr>`;
    if (!rows)
      rows =
        '<tr><td colspan="2" style="text-align:center; color:var(--text-muted);">No detailed EXIF data</td></tr>';
    exifTable.innerHTML = rows;
  } else {
    exifTable.classList.add("hidden");
    noExif.classList.remove("hidden");
  }

  // Compression
  document.getElementById("compressionFindings").innerHTML =
    data.compression.findings
      .map(
        (f) =>
          `<div class="finding-item ${f.type}">${getIcon(f.type)} ${f.message}</div>`,
      )
      .join("") ||
    `<div class="finding-item info">ℹ️ ${t("image.noCompressionAnomalies")}</div>`;

  // Forensic
  document.getElementById("forensicFindings").innerHTML =
    data.forensic.findings
      .map(
        (f) =>
          `<div class="finding-item ${f.type}">${getIcon(f.type)} ${f.message}</div>`,
      )
      .join("") ||
    `<div class="finding-item info">ℹ️ ${t("image.noForensicAnomalies")}</div>`;
}

/** Map finding severity type to emoji icon. @param {string} type @returns {string} */
function getIcon(type) {
  switch (type) {
    case "danger":
      return "🔴";
    case "warning":
      return "🟡";
    case "safe":
      return "🟢";
    case "info":
      return "ℹ️";
    default:
      return "•";
  }
}
