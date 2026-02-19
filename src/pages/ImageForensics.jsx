import { useState } from "react";
import ToolLayout from "../components/ui/ToolLayout.jsx";
import UploadArea from "../components/ui/UploadArea.jsx";
import KPICard from "../components/ui/KPICard.jsx";
import KPIGrid from "../components/ui/KPIGrid.jsx";
import RiskBar from "../components/ui/RiskBar.jsx";
import FlagList from "../components/ui/FlagList.jsx";
import DetailTable from "../components/ui/DetailTable.jsx";
import NeonButton from "../components/ui/NeonButton.jsx";
import { useApi } from "../hooks/useApi.js";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useChatbot } from "../contexts/ChatbotContext.jsx";

export default function ImageForensics() {
  const { t } = useI18n();
  const { sendMessage, setIsOpen, setContext } = useChatbot();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { data, loading, error, execute } = useApi("/api/image/analyze");

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleAnalyze = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    await execute(formData);
  };

  const handleAskAI = () => {
    if (!data) return;
    const ctx = `Image forensics: AI probability ${data.ai_probability}%, authenticity score ${data.authenticity_score}/100`;
    setContext(ctx);
    sendMessage(`Explain what this image forensics result means: ${ctx}`);
    setIsOpen(true);
  };

  const flags = data?.flags?.map((f) => ({
    type: f.severity === "high" ? "danger" : f.severity === "medium" ? "warn" : "info",
    text: f.message,
  })) || [];

  const exifRows = data?.exif
    ? Object.entries(data.exif).slice(0, 10).map(([k, v]) => ({ label: k, value: String(v), mono: true }))
    : [];

  return (
    <ToolLayout
      badge="Image Forensics"
      badgeIcon="🖼️"
      title={t("image.title")}
      subtitle="Detect AI-generated or manipulated images through EXIF metadata analysis, artifact detection, and authenticity scoring."
      maxWidth={960}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!preview ? (
            <UploadArea
              onFile={handleFile}
              accept="image/*"
              label={t("image.upload")}
              sublabel="PNG, JPG, WebP, HEIC · Max 20MB"
              maxMB={20}
            />
          ) : (
            <div style={{ position: "relative" }}>
              <img
                src={preview}
                alt="Image under analysis"
                style={{ width: "100%", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)", display: "block", maxHeight: 320, objectFit: "cover" }}
              />
              <NeonButton
                variant="glass"
                size="sm"
                onClick={() => { setFile(null); setPreview(null); }}
                style={{ position: "absolute", top: 10, right: 10 }}
              >
                ✕ Remove
              </NeonButton>
            </div>
          )}

          {file && (
            <NeonButton loading={loading} onClick={handleAnalyze}>
              {loading ? "Analyzing…" : "🔍 Analyze Image"}
            </NeonButton>
          )}
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data ? (
            <>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                  Authenticity Score
                </div>
                <RiskBar score={100 - (data.authenticity_score || 0)} showLabel={false} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12 }}>
                  <span style={{ color: "var(--green)" }}>Authentic</span>
                  <span style={{ color: "var(--red)" }}>AI-Generated / Manipulated</span>
                </div>
              </div>

              <KPIGrid cols={2}>
                <KPICard icon="🤖" label="AI Probability" value={`${data.ai_probability ?? "—"}%`} color={data.ai_probability > 70 ? "var(--red)" : "var(--green)"} />
                <KPICard icon="📷" label="Camera Make"    value={data.exif?.Make || "None"} />
                <KPICard icon="🕒" label="Date Taken"     value={data.exif?.DateTimeOriginal || "—"} />
                <KPICard icon="📍" label="GPS"            value={data.has_gps ? "Present ⚠" : "None ✓"} color={data.has_gps ? "var(--orange)" : "var(--green)"} />
              </KPIGrid>

              {exifRows.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>EXIF Metadata</h4>
                  <DetailTable rows={exifRows} />
                </div>
              )}

              {flags.length > 0 && <FlagList flags={flags} />}

              <NeonButton variant="glass" onClick={handleAskAI}>
                🤖 Ask AI to Interpret
              </NeonButton>
            </>
          ) : (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔬</div>
              Upload an image to perform forensic analysis
            </div>
          )}
          {error && <div style={{ color: "var(--red)", fontSize: 13 }}>✗ {error}</div>}
        </div>
      </div>
    </ToolLayout>
  );
}
