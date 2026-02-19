import PageWrapper from "../layout/PageWrapper.jsx";
import HeroBadge from "./HeroBadge.jsx";

/**
 * ToolLayout — standard page shell for every tool.
 * Props: badge, badgeIcon, title, subtitle, children, actions
 */
export default function ToolLayout({
  badge,
  badgeIcon,
  title,
  subtitle,
  children,
  actions,
  maxWidth = 900,
}) {
  return (
    <PageWrapper>
      <div style={{ maxWidth, margin: "0 auto" }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          {badge && <HeroBadge icon={badgeIcon}>{badge}</HeroBadge>}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-1px",
              marginBottom: 8,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
          {actions && <div style={{ marginTop: 16 }}>{actions}</div>}
        </div>

        {/* Tool content */}
        {children}
      </div>
    </PageWrapper>
  );
}
