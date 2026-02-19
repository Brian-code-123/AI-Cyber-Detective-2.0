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

export default function ContentVerifier() {
  const { t } = useI18n();
  const { sendMessage, setIsOpen, setContext } = useChatbot();
  const [text, setText] = useState("");
  const { data, loading, error, execute } = useApi("/api/verify-content");

  const handleVerify = async () => {
    if (!text.trim()) return;
    await execute({ text });
  };

  const handleAskAI = () => {
    if (!data) return;
    const ctx = `Content verification: credibility ${data.credibility_score}%, clickbait score ${data.clickbait_score}%, sentiment ${data.sentiment}`;
    setContext(ctx);
    sendMessage(`Explain this content analysis result: ${ctx}. Is this content reliable?`);
    setIsOpen(true);
  };

  const flags = data?.flags?.map((f) => ({
    type: f.severity === "high" ? "danger" : f.severity === "medium" ? "warn" : "info",
    text: f.message,
  })) || [];

  return (
    <ToolLayout
      badge="Content Verifier"
      badgeIcon="📰"
      title={t("content.title")}
      subtitle="Analyze news articles, social media posts, and web content for misinformation, clickbait patterns, and credibility signals."
      maxWidth={860}
    >
      {/* Input */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste article text, social media post, or any content to fact-check…"
          rows={7}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "var(--bg-input, var(--bg-card))",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: 14,
            lineHeight: 1.6,
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <NeonButton loading={loading} onClick={handleVerify} disabled={!text.trim()}>
            {loading ? "Verifying…" : "📰 Verify Content"}
          </NeonButton>
          {text && (
            <NeonButton variant="glass" size="sm" onClick={() => setText("")}>
              Clear
            </NeonButton>
          )}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
            {text.length} chars
          </span>
        </div>
      </div>

      {/* Results */}
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Credibility bar */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
              Credibility Score — {data.credibility_score ?? "—"}/100
            </div>
            <RiskBar score={100 - (data.credibility_score || 0)} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12 }}>
              <span style={{ color: "var(--green)" }}>Credible</span>
              <span style={{ color: "var(--red)" }}>Unreliable</span>
            </div>
          </div>

          <KPIGrid cols={4}>
            <KPICard icon="✅" label="Credibility"   value={`${data.credibility_score ?? "—"}%`}  color={data.credibility_score > 60 ? "var(--green)" : "var(--red)"} />
            <KPICard icon="🎣" label="Clickbait"     value={`${data.clickbait_score ?? "—"}%`}    color={data.clickbait_score > 50 ? "var(--red)" : "var(--green)"} />
            <KPICard icon="💭" label="Sentiment"     value={data.sentiment ?? "—"} />
            <KPICard icon="🔍" label="Fact Checks"   value={`${data.fact_check_flags ?? 0} flagged`} color={data.fact_check_flags > 0 ? "var(--orange)" : "var(--green)"} />
          </KPIGrid>

          {data.summary && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                AI Summary
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>{data.summary}</p>
            </div>
          )}

          {flags.length > 0 && <FlagList flags={flags} />}

          <NeonButton variant="glass" onClick={handleAskAI}>
            🤖 Ask AI for Deeper Analysis
          </NeonButton>
        </div>
      )}

      {error && <div style={{ color: "var(--red)", fontSize: 13, marginTop: 12 }}>✗ {error}</div>}
    </ToolLayout>
  );
}
