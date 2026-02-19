export default function SpinnerOverlay({ message = "Loading…" }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
        gap: 16,
      }}
    >
      <div className="spinner" />
      <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{message}</p>
    </div>
  );
}
