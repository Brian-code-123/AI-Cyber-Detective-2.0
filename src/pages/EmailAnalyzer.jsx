import { useState } from "react";
import ToolLayout from "../components/ui/ToolLayout.jsx";
import AuthBadge from "../components/ui/AuthBadge.jsx";
import FlagList from "../components/ui/FlagList.jsx";
import KPICard from "../components/ui/KPICard.jsx";
import KPIGrid from "../components/ui/KPIGrid.jsx";
import RiskBar from "../components/ui/RiskBar.jsx";
import NeonButton from "../components/ui/NeonButton.jsx";
import { useApi } from "../hooks/useApi.js";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useChatbot } from "../contexts/ChatbotContext.jsx";

export default function EmailAnalyzer() {
  const { t } = useI18n();
  const { sendMessage, setIsOpen, setContext } = useChatbot();
  const [emailText, setEmailText] = useState("");
  const { data, loading, error, execute } = useApi("/api/email-analyze");

  const handleAnalyze = async () => {
    if (!emailText.trim()) return;
    await execute({ emailText });
  };

  const handleAskAI = () => {
    if (!data) return;
    const ctx = `Email analyzed: Risk ${data.risk_score}/100, SPF: ${data.spf}, DKIM: ${data.dkim}, DMARC: ${data.dmarc}`;
    setContext(ctx);
    sendMessage(`Explain this email analysis result and what actions I should take: ${ctx}`);
    setIsOpen(true);
  };

  const flags = data?.flags?.map((f) => ({
    type: f.severity === "high" ? "danger" : f.severity === "medium" ? "warn" : "info",
    text: f.message,
  })) || [];

  return (
    <ToolLayout
      badge="Email Security"
      badgeIcon="📧"
      title={t("email.title")}
      subtitle="Paste email headers or the full email to verify SPF, DKIM, DMARC records and detect phishing signals."
      maxWidth={960}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Left: input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Email Headers / Full Email
            </label>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder={t("email.placeholder")}
              rows={14}
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--glass-border)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                fontSize: 12,
                fontFamily: "'SF Mono','Fira Code',monospace",
                resize: "vertical",
                outline: "none",
                lineHeight: 1.6,
              }}
            />
          </div>
          <NeonButton loading={loading} onClick={handleAnalyze} disabled={!emailText.trim()}>
            {loading ? "Analyzing…" : t("email.analyze")}
          </NeonButton>
        </div>

        {/* Right: results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data ? (
            <>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px 18px" }}>
                <RiskBar score={data.risk_score} />
              </div>

              {/* Auth results */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <h3 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Authentication</h3>
                <AuthBadge status={data.spf}   label={`SPF: ${data.spf || "Unknown"}`} />
                <AuthBadge status={data.dkim}  label={`DKIM: ${data.dkim || "Unknown"}`} />
                <AuthBadge status={data.dmarc} label={`DMARC: ${data.dmarc || "Unknown"}`} />
              </div>

              <KPIGrid cols={2}>
                <KPICard icon="📬" label="From Domain" value={data.from_domain || "—"} />
                <KPICard icon="🔗" label="Links Found"  value={data.link_count ?? "—"} />
              </KPIGrid>

              {flags.length > 0 && <FlagList flags={flags} />}

              <NeonButton variant="glass" onClick={handleAskAI}>
                🤖 Ask AI to Analyze
              </NeonButton>
            </>
          ) : (
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-lg)",
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13,
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📧</div>
              Paste an email on the left and click Analyze to see results
            </div>
          )}

          {error && (
            <div style={{ color: "var(--red)", fontSize: 13 }}>✗ {error}</div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
