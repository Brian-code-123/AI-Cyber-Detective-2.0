import { createContext, useContext, useState, useCallback } from "react";

// Re-export translation keys inline (mirrors public/js/i18n.js)
// Add more keys as pages are migrated
const translations = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.story": "Story Mode",
    "nav.game": "Training Game",
    "nav.phone": "Phone Inspector",
    "nav.url": "URL Scanner",
    "nav.image": "Image Forensics",
    "nav.text": "Content Verifier",
    "nav.password": "Password Checker",
    "nav.email": "Email Analyzer",
    "nav.wifi": "WiFi Scanner",
    "nav.qr": "QR Scanner",

    "hero.badge": "CYBERSECURITY INTELLIGENCE",
    "hero.title": "NeoTrace",
    "hero.subtitle":
      "Intelligent threat detection, digital forensics, and cybersecurity education — all in one platform.",

    "stats.scams": "Scams Reported",
    "stats.countries": "Countries Affected",
    "stats.lost": "Money Lost (USD)",
    "stats.users": "Users Protected",

    "toolkit.title": "Investigation Toolkit",
    "toolkit.subtitle": "Select a tool to begin your investigation",

    "footer.tagline": "Empowering defenders worldwide",
    "footer.rights": "All rights reserved.",

    "chatbot.placeholder": "Ask me anything about cybersecurity…",
    "chatbot.title": "NeoTrace AI",
    "chatbot.subtitle": "Cybersecurity Expert",

    "phone.title": "Phone Inspector",
    "phone.placeholder": "Enter phone number…",
    "phone.analyze": "Analyze",
    "phone.analyzing": "Analyzing…",

    "url.title": "URL Threat Scanner",
    "url.placeholder": "Enter URL or domain…",
    "url.scan": "Scan URL",

    "image.title": "AI Image Forensics",
    "image.upload": "Drop image here or click to upload",

    "password.title": "Password Strength Checker",
    "password.placeholder": "Enter password to analyze…",
    "password.generate": "Generate Strong Password",

    "email.title": "Email Analyzer",
    "email.placeholder": "Paste email headers or full email…",
    "email.analyze": "Analyze Email",

    "wifi.title": "WiFi Security Scanner",
    "wifi.analyze": "Analyze Network",

    "qr.title": "QR Code Scanner",
    "qr.scan": "Scan QR Code",

    "story.title": "Cybersecurity Story Mode",
    "game.title": "Cybersecurity Training Game",

    "risk.low": "Low Risk",
    "risk.medium": "Medium Risk",
    "risk.high": "High Risk",
    "risk.critical": "Critical Risk",
    "risk.unknown": "Unknown",
  },
  zh: {
    "nav.dashboard": "儀表板",
    "nav.story": "情景故事",
    "nav.game": "訓練遊戲",
    "nav.phone": "電話查詢",
    "nav.url": "網址掃描",
    "nav.image": "圖像鑑證",
    "nav.text": "內容核實",
    "nav.password": "密碼強度",
    "nav.email": "電郵分析",
    "nav.wifi": "WiFi掃描",
    "nav.qr": "QR掃描儀",

    "hero.badge": "網絡安全智能平台",
    "hero.title": "NeoTrace",
    "hero.subtitle": "智能威脅偵測、數碼鑑證及網絡安全教育——一站式平台。",

    "stats.scams": "詐騙舉報",
    "stats.countries": "受影響國家",
    "stats.lost": "損失金額（美元）",
    "stats.users": "受保護用戶",

    "toolkit.title": "調查工具箱",
    "toolkit.subtitle": "選擇工具開始調查",

    "footer.tagline": "為全球防禦者賦能",
    "footer.rights": "版權所有。",

    "chatbot.placeholder": "問我任何網絡安全問題……",
    "chatbot.title": "NeoTrace AI",
    "chatbot.subtitle": "網絡安全專家",

    "phone.title": "電話號碼查詢",
    "phone.placeholder": "輸入電話號碼……",
    "phone.analyze": "分析",
    "phone.analyzing": "分析中……",

    "url.title": "網址威脅掃描",
    "url.placeholder": "輸入網址或域名……",
    "url.scan": "掃描網址",

    "image.title": "AI圖像鑑證",
    "image.upload": "拖放圖片或點擊上傳",

    "password.title": "密碼強度檢查",
    "password.placeholder": "輸入密碼進行分析……",
    "password.generate": "生成強密碼",

    "email.title": "電郵分析",
    "email.placeholder": "貼上電郵標頭或完整電郵……",
    "email.analyze": "分析電郵",

    "wifi.title": "WiFi安全掃描",
    "wifi.analyze": "分析網絡",

    "qr.title": "QR碼掃描",
    "qr.scan": "掃描QR碼",

    "story.title": "網絡安全情景故事",
    "game.title": "網絡安全訓練遊戲",

    "risk.low": "低風險",
    "risk.medium": "中風險",
    "risk.high": "高風險",
    "risk.critical": "極高風險",
    "risk.unknown": "未知",
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("nt-lang") || "en";
  });

  const t = useCallback(
    (key, fallback) => {
      return translations[lang]?.[key] ?? translations.en[key] ?? fallback ?? key;
    },
    [lang]
  );

  const toggleLang = () => {
    const next = lang === "en" ? "zh" : "en";
    setLang(next);
    localStorage.setItem("nt-lang", next);
  };

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem("nt-lang", l);
  };

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang, switchLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export default I18nContext;
