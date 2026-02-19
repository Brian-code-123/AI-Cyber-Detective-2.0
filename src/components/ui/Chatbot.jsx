import { useRef, useEffect, useState } from "react";
import { useChatbot } from "../../contexts/ChatbotContext.jsx";
import { useI18n } from "../../contexts/I18nContext.jsx";
import styles from "./Chatbot.module.css";

const QUICK_CHIPS = [
  { label: "🛡 What is phishing?", text: "What is phishing and how can I protect myself?" },
  { label: "🔐 Strong passwords", text: "How do I create strong passwords?" },
  { label: "🌐 URL safety", text: "How do I check if a URL is safe?" },
  { label: "📱 Phone scams", text: "How do phone scam calls work?" },
  { label: "🕵️ OSCP info", text: "Tell me about the OSCP certification" },
  { label: "🦠 Ransomware", text: "How does ransomware work and how can I prevent it?" },
];

// Simple markdown-lite renderer (bold, code, bullet points)
function renderMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n/g, "<br>");
}

export default function Chatbot() {
  const { isOpen, setIsOpen, messages, isLoading, sendMessage, clearHistory } =
    useChatbot();
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [chipsShown, setChipsShown] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setChipsShown(false);
    sendMessage(text);
  };

  const handleChip = (text) => {
    setChipsShown(false);
    sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className={`${styles.toggle} ${isOpen ? styles.toggleActive : ""}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close NeoTrace AI" : "Open NeoTrace AI"}
        title="NeoTrace AI Assistant"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        role="dialog"
        aria-label="NeoTrace AI chatbot"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.headerAvatar}>◈</div>
            <div>
              <div className={styles.headerTitle}>{t("chatbot.title")}</div>
              <div className={styles.headerSub}>
                <span className={styles.statusDot} />
                {t("chatbot.subtitle")}
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={clearHistory}
              className={styles.headerBtn}
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              🗑
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.headerBtn}
              title="Close"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.msg} ${msg.role === "user" ? styles.msgUser : styles.msgBot}`}
            >
              {msg.role === "bot" && (
                <div className={styles.botAvatar}>◈</div>
              )}
              <div
                className={styles.msgBubble}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.msg} ${styles.msgBot}`}>
              <div className={styles.botAvatar}>◈</div>
              <div className={styles.msgBubble}>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips */}
        {chipsShown && messages.length < 3 && (
          <div className={styles.chips}>
            <div className={styles.chipsLabel}>💡 Quick questions</div>
            <div className={styles.chipsRow}>
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.text}
                  className={styles.chip}
                  onClick={() => handleChip(chip.text)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chatbot.placeholder")}
            disabled={isLoading}
            aria-label="Chat input"
            className={styles.input}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={styles.sendBtn}
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}
