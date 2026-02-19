import { useState } from "react";
import ToolLayout from "../components/ui/ToolLayout.jsx";
import KPICard from "../components/ui/KPICard.jsx";
import KPIGrid from "../components/ui/KPIGrid.jsx";
import RiskBar from "../components/ui/RiskBar.jsx";
import FlagList from "../components/ui/FlagList.jsx";
import NeonButton from "../components/ui/NeonButton.jsx";
import { useApi } from "../hooks/useApi.js";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useChatbot } from "../contexts/ChatbotContext.jsx";

const SECURITY_TYPES = ["WPA3", "WPA2", "WPA", "WEP", "Open (None)"];
const FREQUENCIES = ["2.4 GHz", "5 GHz", "6 GHz"];

export default function WifiScanner() {
  const { t } = useI18n();
  const { sendMessage, setIsOpen, setContext } = useChatbot();
  const [form, setForm] = useState({ ssid: "", security: "WPA2", signal: "-65", frequency: "5 GHz", hidden: false });
  const { data, loading, error, execute } = useApi("/api/wifi-analyze");

  const handleAnalyze = async () => {
    if (!form.ssid.trim()) return;
    await execute({ ...form, signal_strength: parseInt(form.signal) });
  };

  const handleAskAI = () => {
    if (!data) return;
    const ctx = `WiFi network: ${form.ssid}, Security: ${form.security}, Risk: ${data.risk_score}/100`;
    setContext(ctx);
    sendMessage(`How can I improve the security of a ${form.security} WiFi network? ${ctx}`);
    setIsOpen(true);
  };

  const flags = data?.flags?.map((f) => ({
    type: f.severity === "high" ? "danger" : f.severity === "medium" ? "warn" : "info",
    text: f.message,
  })) || [];

  return (
    <ToolLayout
      badge="WiFi Security"
      badgeIcon="📶"
      title={t("wifi.title")}
      subtitle="Assess your WiFi network's security posture — encryption type analysis, signal strength evaluation, and risk scoring."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Form */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Network Details</h3>

          {[
            { label: "Network Name (SSID)", key: "ssid", type: "text", placeholder: "e.g. MyHomeNetwork" },
            { label: "Signal Strength (dBm)", key: "signal", type: "text", placeholder: "-65" },
          ].map((field) => (
            <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{ padding: "9px 13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font)", outline: "none" }}
              />
            </div>
          ))}

          {[
            { label: "Security Type", key: "security", options: SECURITY_TYPES },
            { label: "Frequency Band", key: "frequency", options: FREQUENCIES },
          ].map((field) => (
            <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {field.label}
              </label>
              <select
                value={form[field.key]}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                style={{ padding: "9px 13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font)" }}
              >
                {field.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.hidden} onChange={(e) => setForm((f) => ({ ...f, hidden: e.target.checked }))} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Hidden Network</span>
          </label>

          <NeonButton loading={loading} onClick={handleAnalyze} disabled={!form.ssid.trim()}>
            {loading ? "Analyzing…" : t("wifi.analyze")}
          </NeonButton>
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data ? (
            <>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px 18px" }}>
                <RiskBar score={data.risk_score} />
              </div>

              <KPIGrid cols={2}>
                <KPICard icon="🔒" label="Encryption"  value={data.encryption_strength || form.security} color={form.security.startsWith("WPA3") ? "var(--green)" : form.security === "WPA2" ? "var(--accent)" : form.security === "WEP" ? "var(--red)" : "var(--red)"} />
                <KPICard icon="📶" label="Signal"       value={`${form.signal} dBm`} />
                <KPICard icon="📡" label="Frequency"    value={form.frequency} />
                <KPICard icon="👁" label="Visibility"   value={form.hidden ? "Hidden" : "Visible"} color={form.hidden ? "var(--green)" : "var(--text-secondary)"} />
              </KPIGrid>

              {flags.length > 0 && <FlagList flags={flags} />}

              <NeonButton variant="glass" onClick={handleAskAI}>
                🤖 Ask AI for Security Tips
              </NeonButton>
            </>
          ) : (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📶</div>
              Fill in your network details and click Analyze
            </div>
          )}
          {error && <div style={{ color: "var(--red)", fontSize: 13 }}>✗ {error}</div>}
        </div>
      </div>
    </ToolLayout>
  );
}
