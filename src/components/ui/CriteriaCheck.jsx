/** CriteriaCheck — shows a check/cross for a password rule. */
export default function CriteriaCheck({ label, passing }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: passing ? "var(--green)" : "var(--text-muted)",
        transition: "color 0.3s",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: passing ? "rgba(48,209,88,0.15)" : "var(--bg-card)",
          border: `1px solid ${passing ? "var(--green)" : "var(--glass-border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          flexShrink: 0,
          transition: "all 0.3s",
        }}
      >
        {passing ? "✓" : "·"}
      </span>
      {label}
    </div>
  );
}
