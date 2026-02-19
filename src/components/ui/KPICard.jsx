/**
 * KPICard — displays a single metric/KPI.
 * Props: icon, label, value, color, sub
 */
export default function KPICard({ icon, label, value, color, sub, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "var(--transition)",
        cursor: "default",
      }}
    >
      <div
        style={{
          fontSize: 20,
          lineHeight: 1,
          marginBottom: 2,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.6px",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: color || "var(--text-primary)",
          letterSpacing: "-0.5px",
        }}
      >
        {value ?? "—"}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
