import styles from "./PageWrapper.module.css";

export default function PageWrapper({ children, className = "" }) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
