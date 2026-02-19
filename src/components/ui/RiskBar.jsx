/**
 * RiskBar — horizontal progress bar that shows risk level.
 * Props: score (0-100), label
 */
const getRiskMeta = (score) => {
  if (score === null || score === undefined) return { color: "var(--text-muted)", label: "Unknown" };
  if (score <= 25) return { color: "var(--green)", label: "Low Risk" };
  if (score <= 60) return { color: "var(--orange)", label: "Medium Risk" };
  if (score <= 80) return { color: "var(--red)", label: "High Risk" };
  return { color: "var(--red)", label: "Critical Risk" };
};

export default function RiskBar({ score, showLabel = true, height = 8 }) {
  const pct = score ?? 0;
  const meta = getRiskMeta(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {showLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
            {meta.label}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: meta.color,
            }}
          >
            {score !== null && score !== undefined ? `${pct}/100` : "—"}
          </span>
        </div>
      )}
      <div
        style={{
          height,
          borderRadius: height,
          background: "var(--glass-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, pct)}%`,
            background: meta.color,
            borderRadius: height,
            transition: "width 0.8s cubic-bezier(0.25,0.1,0.25,1)",
            boxShadow: `0 0 8px ${meta.color}`,
          }}
        />
      </div>
    </div>
  );
}
