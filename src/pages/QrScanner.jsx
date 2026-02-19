import { useState, useRef } from "react";
import ToolLayout from "../components/ui/ToolLayout.jsx";
import UploadArea from "../components/ui/UploadArea.jsx";
import KPICard from "../components/ui/KPICard.jsx";
import KPIGrid from "../components/ui/KPIGrid.jsx";
import RiskBar from "../components/ui/RiskBar.jsx";
import FlagList from "../components/ui/FlagList.jsx";
import NeonButton from "../components/ui/NeonButton.jsx";
import { useApi } from "../hooks/useApi.js";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useChatbot } from "../contexts/ChatbotContext.jsx";

export default function QrScanner() {
  const { t } = useI18n();
  const { sendMessage, setIsOpen, setContext } = useChatbot();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { data, loading, error, execute } = useApi("/api/qr-scan");

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleScan = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    await execute(formData, { method: "POST" });
  };

  const handleAskAI = () => {
    if (!data?.url) return;
    const ctx = `QR Code contained URL: ${data.url}, Risk: ${data.risk_score}/100`;
    setContext(ctx);
    sendMessage(`Analyze this QR code URL and tell me if it's safe to visit: ${data.url}`);
    setIsOpen(true);
  };

  const flags = data?.flags?.map((f) => ({
    type: f.severity === "high" ? "danger" : f.severity === "medium" ? "warn" : "info",
    text: f.message,
  })) || [];

  return (
    <ToolLayout
      badge="QR Code Security"
      badgeIcon="⬛"
      title={t("qr.title")}
      subtitle="Upload a QR code image to decode its content and instantly scan the embedded URL for threats."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!preview ? (
            <UploadArea
              onFile={handleFile}
              accept="image/*"
              label="Drop QR code image here"
              sublabel="PNG, JPG, WebP · Max 10MB"
              maxMB={10}
            />
          ) : (
            <div style={{ position: "relative" }}>
              <img
                src={preview}
                alt="QR code preview"
                style={{ width: "100%", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)", display: "block" }}
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
            <NeonButton loading={loading} onClick={handleScan}>
              {loading ? "Scanning…" : t("qr.scan")}
            </NeonButton>
          )}
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data ? (
            <>
              {data.url && (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                    Decoded Content
                  </div>
                  <div style={{ fontSize: 14, color: "var(--accent)", wordBreak: "break-all", fontFamily: "'SF Mono','Fira Code',monospace" }}>
                    {data.url}
                  </div>
                </div>
              )}

              {data.risk_score != null && (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px 18px" }}>
                  <RiskBar score={data.risk_score} />
                </div>
              )}

              {data.url && (
                <KPIGrid cols={2}>
                  <KPICard icon="🔗" label="URL Type"   value={data.url_type || "Link"} />
                  <KPICard icon="🛡" label="Safe"       value={data.safe ? "Safe ✓" : "Risky ✗"} color={data.safe ? "var(--green)" : "var(--red)"} />
                </KPIGrid>
              )}

              {flags.length > 0 && <FlagList flags={flags} />}

              {data.url && (
                <NeonButton variant="glass" onClick={handleAskAI}>
                  🤖 Ask AI to Analyze URL
                </NeonButton>
              )}
            </>
          ) : (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⬛</div>
              Upload a QR code to decode and scan
            </div>
          )}
          {error && <div style={{ color: "var(--red)", fontSize: 13 }}>✗ {error}</div>}
        </div>
      </div>
    </ToolLayout>
  );
}
