import { createContext, useContext, useState, useCallback, useRef } from "react";

const ChatbotContext = createContext(null);

const OFFLINE_ANSWERS = {
  phishing:
    "Phishing attacks use fake emails/sites to steal credentials. Look for mismatched sender addresses, urgent language, and suspicious links. Always verify URLs before clicking.",
  password:
    "A strong password has 12+ characters, mixing uppercase, lowercase, numbers, and symbols. Use a password manager and enable MFA on all important accounts.",
  url: "Before clicking unknown URLs: hover to preview the destination, check for HTTPS, look for lookalike domains (rn vs m), and use NeoTrace's URL Scanner for deep analysis.",
  cert: "Key cybersecurity certifications include: CompTIA Security+ (entry), CEH (ethical hacking), CISSP (management), OSCP (penetration testing), and CISM (management).",
  job: "Cybersecurity careers include: SOC Analyst, Penetration Tester, Incident Responder, Security Engineer, CISO, Threat Intelligence Analyst, and Cloud Security Architect.",
  image:
    "To detect AI-generated/manipulated images: look for unnatural fingers/ears, inconsistent lighting/shadows, blurry backgrounds, and use NeoTrace's Image Forensics tool.",
  general:
    "I'm NeoTrace AI — your cybersecurity expert. I can help with threat analysis, tool guidance, security best practices, certifications, career advice, and much more. What would you like to know?",
};

function offlineFallback(text) {
  const lower = text.toLowerCase();
  if (/phish|email|spam|scam/.test(lower)) return OFFLINE_ANSWERS.phishing;
  if (/password|pass|credential|login/.test(lower)) return OFFLINE_ANSWERS.password;
  if (/url|link|domain|website/.test(lower)) return OFFLINE_ANSWERS.url;
  if (/cert|certif|cissp|ceh|oscp/.test(lower)) return OFFLINE_ANSWERS.cert;
  if (/job|career|salary|hire|work/.test(lower)) return OFFLINE_ANSWERS.job;
  if (/image|photo|picture|deepfake|fake/.test(lower)) return OFFLINE_ANSWERS.image;
  return OFFLINE_ANSWERS.general;
}

export function ChatbotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "👋 Hi! I'm **NeoTrace AI** — your cybersecurity expert assistant. Ask me anything about threats, tools, best practices, certifications, or use the quick chips below!",
      id: 0,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState(""); // current tool context
  const historyRef = useRef([]); // { role, content } pairs for API
  const msgIdRef = useRef(1);

  const addMessage = useCallback((role, content) => {
    const id = msgIdRef.current++;
    setMessages((prev) => [...prev, { role, content, id }]);
    return id;
  }, []);

  const sendMessage = useCallback(
    async (text, toolContext = "") => {
      if (!text.trim() || isLoading) return;

      addMessage("user", text);
      setIsLoading(true);
      setIsOpen(true);

      // history = previous turns (not including current)
      const historyToSend = historyRef.current.slice(-12);
      historyRef.current.push({ role: "user", content: text });

      const tryFetch = async (attempt) => {
        try {
          const res = await fetch("/api/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              history: historyToSend,
              context: toolContext || context,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return data.reply || "Sorry, something went wrong.";
        } catch (err) {
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
            return tryFetch(attempt + 1);
          }
          return null; // all retries failed
        }
      };

      const reply = await tryFetch(0);

      if (reply) {
        addMessage("bot", reply);
        historyRef.current.push({ role: "assistant", content: reply });
      } else {
        const fallback = offlineFallback(text);
        addMessage("bot", `*[offline mode]*\n${fallback}`);
        historyRef.current.push({ role: "assistant", content: fallback });
      }

      setIsLoading(false);
    },
    [isLoading, addMessage, context]
  );

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    setMessages([
      {
        role: "bot",
        content:
          "👋 Hi! I'm **NeoTrace AI** — your cybersecurity expert assistant. How can I help you?",
        id: msgIdRef.current++,
      },
    ]);
  }, []);

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        setIsOpen,
        messages,
        isLoading,
        sendMessage,
        clearHistory,
        setContext,
        context,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbot must be used within ChatbotProvider");
  return ctx;
}

export default ChatbotContext;
