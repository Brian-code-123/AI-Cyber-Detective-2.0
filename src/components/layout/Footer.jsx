import { Link } from "react-router-dom";
import { useI18n } from "../../contexts/I18nContext.jsx";
import styles from "./Footer.module.css";

const TOOL_LINKS = [
  { key: "nav.phone",    path: "/phone" },
  { key: "nav.url",      path: "/url" },
  { key: "nav.image",    path: "/image-forensics" },
  { key: "nav.text",     path: "/content-verifier" },
  { key: "nav.password", path: "/password" },
  { key: "nav.email",    path: "/email" },
  { key: "nav.wifi",     path: "/wifi" },
  { key: "nav.qr",       path: "/qr" },
];

const LEARN_LINKS = [
  { key: "nav.story", path: "/story" },
  { key: "nav.game",  path: "/game" },
];

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <span>◈</span> NeoTrace
          </Link>
          <p className={styles.tagline}>{t("footer.tagline")}</p>
          <p className={styles.version}>v4.0 · ASI-1 Powered</p>
        </div>

        {/* Tools */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Tools</h3>
          {TOOL_LINKS.map((l) => (
            <Link key={l.path} to={l.path} className={styles.colLink}>
              {t(l.key)}
            </Link>
          ))}
        </div>

        {/* Learn */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Learn</h3>
          {LEARN_LINKS.map((l) => (
            <Link key={l.path} to={l.path} className={styles.colLink}>
              {t(l.key)}
            </Link>
          ))}
        </div>

        {/* About / Tech */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Platform</h3>
          <span className={styles.colText}>React 18 + Vite</span>
          <span className={styles.colText}>Node.js + Express</span>
          <span className={styles.colText}>ASI-1 AI Agent</span>
          <span className={styles.colText}>Vercel Deployed</span>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} NeoTrace. {t("footer.rights")}</p>
        <p className={styles.disclaimer}>
          For educational purposes only. Not a substitute for professional security advice.
        </p>
      </div>
    </footer>
  );
}
