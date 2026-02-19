/**
 * KPIGrid — responsive grid of KPICards.
 * Props: cols (default 4), children
 */
export default function KPIGrid({ cols = 4, children, style = {} }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
