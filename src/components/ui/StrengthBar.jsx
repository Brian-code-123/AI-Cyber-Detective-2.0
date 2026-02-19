/** StrengthBar — password strength indicator with 5 segments. */
const LEVELS = [
  { label: "Very Weak", color: "var(--red)" },
  { label: "Weak",      color: "var(--orange)" },
  { label: "Fair",      color: "var(--yellow)" },
  { label: "Strong",    color: "var(--green)" },
  { label: "Very Strong", color: "#00e676" },
];

export default function StrengthBar({ score = 0 }) {
  // score: 0-4
  const level = LEVELS[Math.min(4, Math.max(0, score))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {LEVELS.map((l, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 4,
              background: i <= score ? l.color : "var(--glass-border)",
              transition: "background 0.4s",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: level.color }}>
        {level.label}
      </span>
    </div>
  );
}
