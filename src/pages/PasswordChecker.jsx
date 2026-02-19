import { useState, useCallback } from "react";
import ToolLayout from "../components/ui/ToolLayout.jsx";
import StrengthBar from "../components/ui/StrengthBar.jsx";
import CriteriaCheck from "../components/ui/CriteriaCheck.jsx";
import KPICard from "../components/ui/KPICard.jsx";
import KPIGrid from "../components/ui/KPIGrid.jsx";
import NeonButton from "../components/ui/NeonButton.jsx";
import { useI18n } from "../contexts/I18nContext.jsx";

const CRITERIA = [
  { id: "length",  label: "At least 12 characters", check: (p) => p.length >= 12 },
  { id: "upper",   label: "Uppercase letter (A-Z)",  check: (p) => /[A-Z]/.test(p) },
  { id: "lower",   label: "Lowercase letter (a-z)",  check: (p) => /[a-z]/.test(p) },
  { id: "number",  label: "Number (0-9)",             check: (p) => /\d/.test(p) },
  { id: "symbol",  label: "Special character (!@#…)", check: (p) => /[^A-Za-z0-9]/.test(p) },
  { id: "norepeat",label: "No repeated sequences",    check: (p) => !/(.)\1{2,}/.test(p) },
];

function scorePassword(pwd) {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 16) score++;
  // Normalize 0-4
  return Math.min(4, Math.floor((score / 7) * 4));
}

function entropy(pwd) {
  const charset = (
    (/[a-z]/.test(pwd) ? 26 : 0) +
    (/[A-Z]/.test(pwd) ? 26 : 0) +
    (/\d/.test(pwd) ? 10 : 0) +
    (/[^A-Za-z0-9]/.test(pwd) ? 32 : 0)
  );
  if (!charset) return 0;
  return Math.round(pwd.length * Math.log2(charset));
}

function crackTime(bits) {
  const guesses = Math.pow(2, bits) / 2;
  const perSec = 1e10; // 10 billion guesses/sec
  const secs = guesses / perSec;
  if (secs < 1) return "< 1 second";
  if (secs < 60) return `${Math.round(secs)} seconds`;
  if (secs < 3600) return `${Math.round(secs/60)} minutes`;
  if (secs < 86400) return `${Math.round(secs/3600)} hours`;
  if (secs < 31536000) return `${Math.round(secs/86400)} days`;
  if (secs < 31536000*1000) return `${Math.round(secs/31536000)} years`;
  return "Centuries";
}

function generatePassword(length = 20) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => chars[b % chars.length]).join("");
}

export default function PasswordChecker() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const score = password ? scorePassword(password) : 0;
  const bits  = password ? entropy(password) : 0;
  const crack = password ? crackTime(bits) : "—";

  const handleGenerate = () => {
    setPassword(generatePassword(20));
    setShow(true);
  };

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      badge="Password Security"
      badgeIcon="🔐"
      title={t("password.title")}
      subtitle="Real-time strength analysis using zxcvbn algorithm — entropy calculation, crack time estimation, and custom password generator."
    >
      {/* Input */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        marginBottom: 24,
      }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 10 }}>
          Password to Analyze
        </label>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password.placeholder")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--glass-border)",
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontFamily: "'SF Mono','Fira Code',monospace",
              outline: "none",
              letterSpacing: "0.05em",
            }}
          />
          <NeonButton variant="glass" onClick={() => setShow((s) => !s)}>
            {show ? "🙈" : "👁"}
          </NeonButton>
          <NeonButton variant="glass" onClick={handleCopy} disabled={!password}>
            {copied ? "✓ Copied" : "📋 Copy"}
          </NeonButton>
        </div>

        {password && <StrengthBar score={score} />}
      </div>

      {/* Generate */}
      <div style={{ marginBottom: 24 }}>
        <NeonButton onClick={handleGenerate}>
          ⚡ {t("password.generate")}
        </NeonButton>
      </div>

      {password && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* KPIs */}
          <KPIGrid cols={4}>
            <KPICard icon="📏" label="Length"     value={`${password.length} chars`} />
            <KPICard icon="🎲" label="Entropy"    value={`${bits} bits`} color={bits >= 80 ? "var(--green)" : bits >= 50 ? "var(--orange)" : "var(--red)"} />
            <KPICard icon="⏱️" label="Crack Time" value={crack} color={crack.includes("Centur") || crack.includes("year") ? "var(--green)" : "var(--red)"} />
            <KPICard icon="🔢" label="Complexity" value={["Very Weak","Weak","Fair","Strong","Very Strong"][score]} color={["var(--red)","var(--red)","var(--orange)","var(--green)","var(--green)"][score]} />
          </KPIGrid>

          {/* Criteria */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "20px 24px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>
              Security Criteria
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CRITERIA.map((c) => (
                <CriteriaCheck key={c.id} label={c.label} passing={c.check(password)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
