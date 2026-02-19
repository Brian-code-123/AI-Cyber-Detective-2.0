import { useState } from "react";
import ToolLayout from "../components/ui/ToolLayout.jsx";
import KPICard from "../components/ui/KPICard.jsx";
import KPIGrid from "../components/ui/KPIGrid.jsx";
import RiskBar from "../components/ui/RiskBar.jsx";
import FlagList from "../components/ui/FlagList.jsx";
import DetailTable from "../components/ui/DetailTable.jsx";
import NeonButton from "../components/ui/NeonButton.jsx";
import { useApi } from "../hooks/useApi.js";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useChatbot } from "../contexts/ChatbotContext.jsx";

export default function UrlScanner() {
  const { t } = useI18n();
  const { sendMessage, setIsOpen, setContext } = useChatbot();
  const [url, setUrl] = useState("");
  const { data, loading, error, execute } = useApi("/api/url/analyze");

  const handleScan = async () => {
    if (!url.trim()) return;
    const target = url.startsWith("http") ? url : `https://${url}`;
    await execute({ url: target });
  };

  const handleAskAI = () => {
    if (!data) return;
    const ctx = `URL scanned: ${data.url}, Risk: ${data.risk_score}/100, Safe Browsing: ${data.safe_browsing_status}`;
    setContext(ctx);
    sendMessage(`Analyze this URL scan result and advise if it's safe: ${ctx}`);
    setIsOpen(true);
  };

  const flags = data?.flags?.map((f) => ({
    type: f.severity === "high" ? "danger" : f.severity === "medium" ? "warn" : "info",
    text: f.message,
  })) || [];

  return (
    <ToolLayout
      badge="URL Intelligence"
      badgeIcon="🔗"
      title={t("url.title")}
      subtitle="Deep URL analysis — WHOIS, DNS records, SSL certificate, safe browsing checks, and redirect chain inspection."
    >
      {/* Input */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        marginBottom: 24,
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            URL or Domain
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder={t("url.placeholder")}
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--glass-border)",
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontFamily: "var(--font)",
              outline: "none",
            }}
          />
        </div>
        <NeonButton loading={loading} onClick={handleScan} disabled={!url.trim()}>
          {loading ? "Scanning…" : t("url.scan")}
        </NeonButton>
      </div>

      {error && (
        <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>✗ {error}</div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "20px 24px" }}>
            <RiskBar score={data.risk_score} />
          </div>

          <KPIGrid cols={4}>
            <KPICard icon="⚠️" label="Risk Score"     value={data.risk_score != null ? `${data.risk_score}/100` : "—"} color={data.risk_score > 75 ? "var(--red)" : data.risk_score > 50 ? "var(--orange)" : "var(--green)"} />
            <KPICard icon="🔒" label="Safe Browsing"  value={data.safe_browsing_status || "—"} color={data.safe_browsing_status === "SAFE" ? "var(--green)" : "var(--red)"} />
            <KPICard icon="🔐" label="SSL Valid"       value={data.ssl?.valid ? "Valid ✓" : "Invalid ✗"} color={data.ssl?.valid ? "var(--green)" : "var(--red)"} />
            <KPICard icon="📅" label="Domain Age"      value={data.whois?.domain_age || "—"} />
            <KPICard icon="🌐" label="IP"              value={data.dns?.ip || "—"} mono />
            <KPICard icon="🏳️" label="Country"        value={data.dns?.country || "—"} />
            <KPICard icon="📦" label="Redirects"       value={data.redirect_count || "0"} />
            <KPICard icon="🕒" label="SSL Expiry"     value={data.ssl?.expiry || "—"} />
          </KPIGrid>

          <DetailTable rows={[
            { label: "URL",          value: data.url, mono: true },
            { label: "Domain",       value: data.domain },
            { label: "Registrar",    value: data.whois?.registrar },
            { label: "Created",      value: data.whois?.creation_date },
            { label: "Expires",      value: data.whois?.expiry_date },
            { label: "Name Servers", value: data.dns?.nameservers?.join(", ") },
          ]} />

          {flags.length > 0 && <FlagList flags={flags} />}

          <NeonButton variant="glass" onClick={handleAskAI}>
            🤖 Ask AI to Analyze This Result
          </NeonButton>
        </div>
      )}
    </ToolLayout>
  );
}
