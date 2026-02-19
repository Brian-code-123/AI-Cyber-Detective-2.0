/** HeroBadge — small pill badge shown above page hero titles. */
export default function HeroBadge({ children, icon }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 100,
        background: "var(--accent-soft)",
        border: "1px solid rgba(10,132,255,0.25)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        color: "var(--accent)",
        marginBottom: 16,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </div>
  );
}
