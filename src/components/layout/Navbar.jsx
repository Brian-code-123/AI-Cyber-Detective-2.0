import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { useI18n } from "../../contexts/I18nContext.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import LangToggle from "../ui/LangToggle.jsx";
import styles from "./Navbar.module.css";

const TOOLS = [
  { key: "nav.phone",    path: "/phone",           icon: "📱" },
  { key: "nav.url",      path: "/url",              icon: "🔗" },
  { key: "nav.image",    path: "/image-forensics",  icon: "🖼️",  badge: "NEW" },
  { key: "nav.text",     path: "/content-verifier", icon: "📝" },
  { key: "nav.password", path: "/password",         icon: "🔐", badge: "NEW" },
  { key: "nav.email",    path: "/email",            icon: "📧", badge: "NEW" },
  { key: "nav.wifi",     path: "/wifi",             icon: "📶", badge: "NEW" },
  { key: "nav.qr",       path: "/qr",              icon: "⬛", badge: "NEW" },
];

export default function Navbar() {
  const { t } = useI18n();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setToolsOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="NeoTrace home">
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>NeoTrace</span>
        </Link>

        {/* Desktop nav links */}
        <div className={styles.links}>
          <Link
            to="/"
            className={`${styles.link} ${isActive("/") ? styles.active : ""}`}
          >
            {t("nav.dashboard")}
          </Link>
          <Link
            to="/story"
            className={`${styles.link} ${isActive("/story") ? styles.active : ""}`}
          >
            {t("nav.story")}
          </Link>
          <Link
            to="/game"
            className={`${styles.link} ${isActive("/game") ? styles.active : ""}`}
          >
            {t("nav.game")}
          </Link>

          {/* Tools dropdown */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              className={`${styles.link} ${styles.dropdownTrigger}`}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
            >
              Tools
              <svg
                className={`${styles.chevron} ${toolsOpen ? styles.chevronOpen : ""}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {toolsOpen && (
              <div className={styles.dropdownMenu} role="menu">
                {TOOLS.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className={`${styles.dropdownItem} ${isActive(tool.path) ? styles.dropdownItemActive : ""}`}
                    role="menuitem"
                  >
                    <span className={styles.dropdownIcon}>{tool.icon}</span>
                    <span>{t(tool.key)}</span>
                    {tool.badge && (
                      <span className={styles.badge}>{tool.badge}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <LangToggle />
          <ThemeToggle />
          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" className={styles.mobileLink}>{t("nav.dashboard")}</Link>
          <Link to="/story" className={styles.mobileLink}>{t("nav.story")}</Link>
          <Link to="/game" className={styles.mobileLink}>{t("nav.game")}</Link>
          <div className={styles.mobileDivider} />
          {TOOLS.map((tool) => (
            <Link key={tool.path} to={tool.path} className={styles.mobileLink}>
              {tool.icon} {t(tool.key)}
              {tool.badge && <span className={styles.badge}>{tool.badge}</span>}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
