/** FlagItem — a single risk/warning flag row. */
export default function FlagItem({ type = "warn", text }) {
  const TYPE_MAP = {
    info:    { bg: "rgba(10,132,255,0.08)",  border: "rgba(10,132,255,0.2)",  color: "var(--accent)",  icon: "ℹ" },
    warn:    { bg: "rgba(255,159,10,0.08)",  border: "rgba(255,159,10,0.2)",  color: "var(--orange)", icon: "⚠" },
    danger:  { bg: "rgba(255,69,58,0.08)",   border: "rgba(255,69,58,0.2)",   color: "var(--red)",    icon: "✗" },
    success: { bg: "rgba(48,209,88,0.08)",   border: "rgba(48,209,88,0.2)",   color: "var(--green)",  icon: "✓" },
  };
  const s = TYPE_MAP[type] || TYPE_MAP.warn;

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "9px 14px",
        borderRadius: "var(--radius-sm)",
        background: s.bg,
        border: `1px solid ${s.border}`,
      }}
    >
      <span style={{ color: s.color, fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>
        {s.icon}
      </span>
      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {text}
      </span>
    </div>
  );
}
