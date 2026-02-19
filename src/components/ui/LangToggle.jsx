import { useI18n } from "../../contexts/I18nContext.jsx";

export default function LangToggle() {
  const { lang, toggleLang } = useI18n();

  return (
    <button
      onClick={toggleLang}
      title={lang === "en" ? "切換繁體中文" : "Switch to English"}
      aria-label="Toggle language"
      style={{
        padding: "5px 10px",
        borderRadius: 8,
        border: "1px solid var(--glass-border)",
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-secondary)",
        transition: "var(--transition)",
        letterSpacing: "0.3px",
        flexShrink: 0,
      }}
    >
      {lang === "en" ? "中文" : "EN"}
    </button>
  );
}
