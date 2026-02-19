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

export default function PhoneInspector() {
  const { t } = useI18n();
  const { sendMessage, setIsOpen, setContext } = useChatbot();
  const [countryCode, setCountryCode] = useState("+1");
  const [number, setNumber] = useState("");
  const { data, loading, error, execute } = useApi("/api/phone/check");

  const handleAnalyze = async () => {
    if (!number.trim()) return;
    const fullNumber = countryCode + number.replace(/\D/g, "");
    await execute({ phoneNumber: fullNumber });
  };

  const handleAskAI = () => {
    if (!data) return;
    const ctx = `Phone number analyzed: ${data.phone_number}, Risk: ${data.risk_score}/100, Type: ${data.line_type}, Country: ${data.country}`;
    setContext(ctx);
    sendMessage(`Analyze this phone number result and tell me if it's suspicious: ${ctx}`);
    setIsOpen(true);
  };

  const flags = data?.flags?.map((f) => ({
    type: f.severity === "high" ? "danger" : f.severity === "medium" ? "warn" : "info",
    text: f.message,
  })) || [];

  const tableRows = data
    ? [
        { label: "Number", value: data.phone_number, mono: true },
        { label: "Country", value: data.country },
        { label: "Carrier", value: data.carrier || "Unknown" },
        { label: "Line Type", value: data.line_type },
        { label: "VOIP", value: data.voip ? "⚠ Likely VOIP" : "No", accent: data.voip },
        { label: "Formatted", value: data.formatted },
        { label: "Valid", value: data.valid ? "✓ Valid" : "✗ Invalid" },
      ]
    : [];

  const kpis = data
    ? [
        { icon: "🔢", label: "Risk Score",  value: data.risk_score != null ? `${data.risk_score}/100` : "—", color: data.risk_score > 75 ? "var(--red)" : data.risk_score > 50 ? "var(--orange)" : "var(--green)" },
        { icon: "📡", label: "Line Type",   value: data.line_type || "—" },
        { icon: "🌐", label: "Country",     value: data.country || "—" },
        { icon: "📶", label: "VOIP",        value: data.voip ? "Yes ⚠" : "No ✓", color: data.voip ? "var(--orange)" : "var(--green)" },
        { icon: "🏢", label: "Carrier",     value: data.carrier || "—" },
        { icon: "🛡", label: "Valid",       value: data.valid ? "Valid ✓" : "Invalid ✗", color: data.valid ? "var(--green)" : "var(--red)" },
        { icon: "📍", label: "Location",    value: data.location || data.timezone || "—" },
        { icon: "⚡", label: "Spam Listed", value: data.spam_listed ? "Yes ⚠" : "No ✓", color: data.spam_listed ? "var(--red)" : "var(--green)" },
      ]
    : [];

  return (
    <ToolLayout
      badge="Phone Intelligence"
      badgeIcon="📱"
      title={t("phone.title")}
      subtitle="Look up any phone number — carrier, risk score, VOIP detection, and fraud signals."
    >
      {/* Input */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          marginBottom: 24,
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Country Code
          </label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--glass-border)",
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontFamily: "var(--font)",
              width: 100,
            }}
          >
            {["+1","+44","+852","+86","+81","+49","+33","+61","+65","+91"].map(cc => (
              <option key={cc} value={cc}>{cc}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder={t("phone.placeholder")}
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

        <NeonButton loading={loading} onClick={handleAnalyze} disabled={!number.trim()}>
          {loading ? t("phone.analyzing") : t("phone.analyze")}
        </NeonButton>
      </div>

      {error && (
        <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>
          ✗ {error}
        </div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Risk bar */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "20px 24px" }}>
            <RiskBar score={data.risk_score} />
          </div>

          {/* KPIs */}
          <KPIGrid cols={4}>
            {kpis.map((k) => (
              <KPICard key={k.label} icon={k.icon} label={k.label} value={k.value} color={k.color} />
            ))}
          </KPIGrid>

          {/* Details */}
          <DetailTable rows={tableRows} />

          {/* Flags */}
          {flags.length > 0 && <FlagList flags={flags} title="Risk Signals" />}

          {/* AI analysis */}
          <NeonButton variant="glass" onClick={handleAskAI}>
            🤖 Ask AI to Analyze This Result
          </NeonButton>
        </div>
      )}
    </ToolLayout>
  );
}
