/** AuthBadge — shows PASS/FAIL/WARN for auth checks (SPF, DKIM, DMARC etc.) */
export default function AuthBadge({ status, label }) {
  const STATUS_MAP = {
    pass: { bg: "rgba(48,209,88,0.15)", color: "var(--green)", icon: "✓" },
    fail: { bg: "rgba(255,69,58,0.15)", color: "var(--red)", icon: "✗" },
    warn: { bg: "rgba(255,159,10,0.15)", color: "var(--orange)", icon: "⚠" },
    neutral: { bg: "var(--bg-card)", color: "var(--text-muted)", icon: "—" },
  };

  const s = STATUS_MAP[status?.toLowerCase()] || STATUS_MAP.neutral;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 8,
        background: s.bg,
        fontSize: 12,
        fontWeight: 700,
        color: s.color,
      }}
    >
      <span>{s.icon}</span>
      {label}
    </div>
  );
}
