/** DetailTable — renders a key/value list in a glass-styled table. */
export default function DetailTable({ rows = [] }) {
  // rows: [{ label, value, mono?, accent? }]
  return (
    <div
      style={{
        borderRadius: "var(--radius)",
        border: "1px solid var(--glass-border)",
        overflow: "hidden",
      }}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            padding: "10px 16px",
            background: i % 2 === 0 ? "var(--bg-card)" : "transparent",
            borderBottom:
              i < rows.length - 1 ? "1px solid var(--glass-border)" : "none",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              minWidth: 120,
              flexShrink: 0,
            }}
          >
            {row.label}
          </span>
          <span
            style={{
              fontSize: 13,
              color: row.accent ? "var(--accent)" : "var(--text-secondary)",
              fontFamily: row.mono
                ? "'SF Mono','Fira Code',monospace"
                : "inherit",
              wordBreak: "break-all",
            }}
          >
            {row.value ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
