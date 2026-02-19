import FlagItem from "./FlagItem.jsx";

/** FlagList — renders an array of flags with section title. */
export default function FlagList({ flags = [], title = "Risk Signals" }) {
  if (!flags.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
        {title}
      </h4>
      {flags.map((f, i) => (
        <FlagItem key={i} type={f.type} text={f.text} />
      ))}
    </div>
  );
}
