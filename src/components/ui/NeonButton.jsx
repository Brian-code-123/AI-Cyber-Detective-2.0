/**
 * NeonButton — accent/glass CTA button.
 * Props: variant ("accent" | "glass"), size ("sm"|"md"|"lg"), disabled, loading, onClick, type
 */
export default function NeonButton({
  children,
  variant = "accent",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  style = {},
  ...rest
}) {
  const sizes = { sm: "8px 14px", md: "10px 20px", lg: "13px 28px" };
  const fontSizes = { sm: 12, md: 14, lg: 15 };

  const base = {
    padding: sizes[size],
    fontSize: fontSizes[size],
    fontFamily: "var(--font)",
    fontWeight: 600,
    borderRadius: 10,
    border: "1px solid transparent",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    transition: "var(--transition)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    letterSpacing: "-0.2px",
    ...style,
  };

  const variants = {
    accent: {
      background: "var(--accent)",
      color: "#fff",
      borderColor: "transparent",
      boxShadow: "0 0 12px var(--accent-glow)",
    },
    glass: {
      background: "var(--glass-bg)",
      color: "var(--text-primary)",
      borderColor: "var(--glass-border)",
      backdropFilter: "blur(20px)",
    },
    danger: {
      background: "rgba(255, 69, 58, 0.15)",
      color: "var(--red)",
      borderColor: "rgba(255, 69, 58, 0.3)",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...variants[variant] }}
      {...rest}
    >
      {loading ? (
        <>
          <span
            style={{
              width: 12,
              height: 12,
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
          Loading…
        </>
      ) : (
        children
      )}
    </button>
  );
}
