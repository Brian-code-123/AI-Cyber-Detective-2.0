import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper.jsx";
import HeroBadge from "../components/ui/HeroBadge.jsx";
import KPICard from "../components/ui/KPICard.jsx";
import KPIGrid from "../components/ui/KPIGrid.jsx";
import NeonButton from "../components/ui/NeonButton.jsx";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useChatbot } from "../contexts/ChatbotContext.jsx";

const TOOLS = [
  { icon: "📱", key: "nav.phone",    path: "/phone",           desc: "Carrier lookup, risk score, fraud signals & VOIP detection", badge: null },
  { icon: "🔗", key: "nav.url",      path: "/url",             desc: "WHOIS, DNS, SSL, safe browsing & redirect chain analysis", badge: null },
  { icon: "🖼️", key: "nav.image",    path: "/image-forensics", desc: "Detect AI-generated or manipulated images via EXIF analysis", badge: "NEW" },
  { icon: "📝", key: "nav.text",     path: "/content-verifier", desc: "AI credibility scoring, clickbait detection & fact-checking", badge: null },
  { icon: "🔐", key: "nav.password", path: "/password",        desc: "Real-time zxcvbn scoring, entropy calculation & generator", badge: "NEW" },
  { icon: "📧", key: "nav.email",    path: "/email",           desc: "SPF/DKIM/DMARC verification & phishing header analysis", badge: "NEW" },
  { icon: "📶", key: "nav.wifi",     path: "/wifi",            desc: "Network security assessment & open/WEP risk detection", badge: "NEW" },
  { icon: "⬛", key: "nav.qr",       path: "/qr",             desc: "Decode QR codes and instantly scan the embedded URL", badge: "NEW" },
];

const STATS = [
  { icon: "📊", key: "stats.scams",     value: "800K+",  color: "var(--red)" },
  { icon: "🌍", key: "stats.countries", value: "195",    color: "var(--accent)" },
  { icon: "💸", key: "stats.lost",      value: "$12.5B", color: "var(--orange)" },
  { icon: "🛡", key: "stats.users",     value: "2M+",    color: "var(--green)" },
];

export default function Dashboard() {
  const { t } = useI18n();
  const { sendMessage, setIsOpen } = useChatbot();

  const handleAskAI = () => {
    sendMessage("What are the most common cybersecurity threats I should know about in 2025?");
    setIsOpen(true);
  };

  return (
    <PageWrapper>
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "48px 0 56px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <HeroBadge icon="◈">{t("hero.badge")}</HeroBadge>
        <h1
          style={{
            fontSize: "clamp(40px, 8vw, 80px)",
            fontWeight: 900,
            letterSpacing: "-3px",
            lineHeight: 1.1,
            marginBottom: 20,
            background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("hero.title")}
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "var(--text-secondary)",
            maxWidth: 560,
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          {t("hero.subtitle")}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/url" style={{ textDecoration: "none" }}>
            <NeonButton size="lg">🔗 Scan a URL</NeonButton>
          </Link>
          <NeonButton variant="glass" size="lg" onClick={handleAskAI}>
            🤖 Ask NeoTrace AI
          </NeonButton>
        </div>
      </section>

      {/* Stats */}
      <section style={{ marginBottom: 48 }}>
        <KPIGrid cols={4} style={{ "@media(max-width:768px)": { gridTemplateColumns: "1fr 1fr" } }}>
          {STATS.map((s) => (
            <KPICard
              key={s.key}
              icon={s.icon}
              label={t(s.key)}
              value={s.value}
              color={s.color}
            />
          ))}
        </KPIGrid>
      </section>

      {/* Tool cards */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "var(--text-primary)",
            }}
          >
            {t("toolkit.title")}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginTop: 4 }}>
            {t("toolkit.subtitle")}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {TOOLS.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 22px",
                  transition: "var(--transition)",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                  e.currentTarget.style.borderColor = "var(--glass-border-hover)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-card)";
                  e.currentTarget.style.borderColor = "var(--glass-border)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {tool.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      background: "var(--accent)",
                      color: "#fff",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {tool.badge}
                  </span>
                )}
                <div style={{ fontSize: 28, marginBottom: 10 }}>{tool.icon}</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 6,
                  }}
                >
                  {t(tool.key)}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                  {tool.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
