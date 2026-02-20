/**
 * NeoTrace AI Chatbot v3
 * ASI-1 powered · Quick chips · Conversation history · Offline fallback
 * @description Full-featured chatbot with persistent conversation, retry logic,
 *   and professional frosted-glass UI matching the NeoTrace design system.
 */
(function () {
  "use strict";

  // ── Quick-question data ──────────────────────────────────────────
  const QUICK_QUESTIONS = [
    {
      label: "🎣 What is phishing?",
      text: "What is phishing and how can I avoid it?",
    },
    {
      label: "🔐 Protect my accounts",
      text: "What are the best ways to protect my online accounts?",
    },
    {
      label: "🔗 Check suspicious URL",
      text: "How do I use the URL Scanner to check a suspicious link?",
    },
    {
      label: "📜 Best security certs?",
      text: "What cybersecurity certifications should I get as a beginner?",
    },
    {
      label: "💼 Top cyber careers",
      text: "What are the highest-paying cybersecurity job roles in 2025?",
    },
    {
      label: "🖼️ Detect fake images",
      text: "How does the Image Forensics tool detect AI-generated images?",
    },
  ];

  // ── Offline fallback answers ─────────────────────────────────────
  const OFFLINE_ANSWERS = {
    url_scanner:
      "## How to use the URL Scanner\n\n1. Go to **For You → URL Scanner** in the top navigation\n2. Paste any suspicious URL into the input field\n3. Click **Scan URL**\n4. Review the full report — it includes:\n   - Domain age & WHOIS registration info\n   - SSL certificate validity\n   - Google Safe Browsing status\n   - Redirect chain analysis\n   - Phishing pattern detection score\n\n> **Tip:** Even shortened URLs (bit.ly, tinyurl) can be scanned — the tool follows all redirects automatically.",
    phishing:
      "## What is Phishing?\n\nPhishing is a **social engineering attack** where criminals impersonate trusted entities to steal credentials or money.\n\n**Common types:**\n- **Email phishing** — fake emails from banks, PayPal, Netflix\n- **Smishing** — phishing via SMS/text\n- **Vishing** — phone/voice phishing calls\n- **Spear phishing** — targeted attacks using personal info\n\n**How to protect yourself:**\n1. Always verify the sender's actual email domain\n2. Hover over links before clicking to see the real URL\n3. Never enter passwords on pages reached via a link in an email\n4. Enable 2FA on all important accounts\n5. Use NeoTrace's **URL Scanner** to check suspicious links",
    password:
      "## How to Protect Your Accounts\n\n**Use strong, unique passwords:**\n1. Minimum 16 characters for important accounts\n2. Mix uppercase, lowercase, numbers, symbols\n3. Never reuse passwords across sites\n4. Check your password strength with NeoTrace's **Password Checker**\n\n**Enable Two-Factor Authentication (2FA):**\n- Use authenticator apps (Google Authenticator, Authy) — more secure than SMS\n- Enable 2FA on: email, banking, social media, password managers\n\n**Use a Password Manager:**\n- Recommended: Bitwarden (free), 1Password, Dashlane\n- Generates and stores unique passwords securely\n\n> Check if your accounts have been breached: [haveibeenpwned.com](https://haveibeenpwned.com)",
    cert:
      "## Cybersecurity Certifications — Where to Start\n\n**Beginner:**\n- **CompTIA Security+** — Most recognized entry-level cert, covers all fundamentals\n- **Google Cybersecurity Certificate** — Free/cheap via Coursera, great intro\n\n**Intermediate:**\n- **CompTIA CySA+** — Blue team/SOC analyst focused\n- **CEH (Certified Ethical Hacker)** — Offensive techniques overview\n- **eJPT (eLearnSecurity)** — Hands-on practical pentesting cert\n\n**Advanced:**\n- **OSCP** — The gold standard for penetration testers. Hands-on 24hr exam\n- **CISSP** — For security management and architecture (5 yrs experience)\n- **CISM** — Management-focused security cert\n\n> See the NeoTrace **Certifications** page for full study guides and resources!",
    careers:
      "## Cybersecurity Career Paths\n\n**Entry Level:**\n- SOC Analyst Tier 1 — Monitor alerts, triage incidents ($55K–$75K)\n- IT Security Analyst — Policies, vulnerability scanning ($60K–$85K)\n\n**Mid Level:**\n- Penetration Tester — Ethical hacking, reporting ($85K–$130K)\n- Incident Responder — Contain & investigate breaches ($90K–$140K)\n- Cloud Security Engineer — AWS/Azure security ($100K–$160K)\n\n**Senior Level:**\n- Security Architect — Design secure systems ($130K–$200K)\n- Red Team Lead — Advanced offensive operations ($135K–$200K)\n- CISO — Chief Information Security Officer ($180K–$300K+)\n\n> Visit the NeoTrace **Careers** page for detailed job descriptions and skill requirements!",
    image_forensics:
      "## How to Use Image Forensics\n\n1. Go to **For You → Image Forensics**\n2. Upload any image (JPG, PNG, WebP — max 20MB)\n3. The tool analyzes:\n   - **EXIF metadata** — camera model, GPS coordinates, software used\n   - **AI artifact detection** — checks for GAN/diffusion model patterns\n   - **Compression analysis** — detects re-saving and manipulation via error level analysis\n   - **Pixel noise analysis** — statistical anomalies that reveal tampering\n4. Review the AI probability score and forensic report\n\n> **Use case:** Received a suspicious photo as 'evidence'? Upload it to check if it was AI-generated or edited.",
    general:
      "## Welcome to NeoTrace AI! 👋\n\nI can help you with:\n\n**🛠️ Platform Tools:**\n- How to use any NeoTrace tool (URL Scanner, Image Forensics, Email Analyzer, etc.)\n- Understanding scan results\n\n**🔐 Cybersecurity Knowledge:**\n- Phishing, malware, social engineering explained\n- How to protect your accounts and devices\n- Certification and career guidance\n\n**🎮 Learning Resources:**\n- Story Mode and Training Game guide\n- YouTube channels, books, and courses\n\nJust type your question below — or click a **Quick Question** chip to get started!",
  };

  /** @description Match user text to offline fallback for when ASI is unreachable. */
  function offlineFallback(text) {
    const t = text.toLowerCase();
    if (t.includes("url") || t.includes("link") || t.includes("scanner")) return OFFLINE_ANSWERS.url_scanner;
    if (t.includes("phish") || t.includes("scam") || t.includes("spam")) return OFFLINE_ANSWERS.phishing;
    if (t.includes("password") || t.includes("account") || t.includes("2fa") || t.includes("protect")) return OFFLINE_ANSWERS.password;
    if (t.includes("cert") || t.includes("cissp") || t.includes("oscp") || t.includes("security+")) return OFFLINE_ANSWERS.cert;
    if (t.includes("job") || t.includes("salary") || t.includes("career") || t.includes("role")) return OFFLINE_ANSWERS.careers;
    if (t.includes("image") || t.includes("forensic") || t.includes("fake") || t.includes("ai-generated")) return OFFLINE_ANSWERS.image_forensics;
    return OFFLINE_ANSWERS.general;
  }

  // ── Minimal Markdown → HTML renderer ─────────────────────────────
  function renderMd(text) {
    if (!text) return "";
    let html = text;

    // Escape HTML entities first (except we need to allow our own tags later) — skip, trust the AI
    // 1. Code blocks (``` lang\n...\n```)
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="chat-code-block"><code>${escHtml(code.trim())}</code></pre>`;
    });

    // 2. Inline code
    html = html.replace(/`([^`\n]+)`/g, (_, c) => `<code class="chat-inline-code">${escHtml(c)}</code>`);

    // 3. Bold **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // 4. Italic *text* or _text_ (not inside **)
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
    html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "<em>$1</em>");

    // 5. Blockquote / tip lines (> text)
    html = html.replace(/^&gt; (.+)$/gm, '<div class="chat-tip">$1</div>');
    html = html.replace(/^> (.+)$/gm, '<div class="chat-tip">$1</div>');

    // 6. Headings
    html = html.replace(/^### (.+)$/gm, "<h5>$1</h5>");
    html = html.replace(/^## (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^# (.+)$/gm, "<h4>$1</h4>");

    // 7. Unordered lists — group consecutive bullet lines
    // Replace bullet lines with <li> temporarily
    html = html.replace(/^[ \t]*[-*•] (.+)$/gm, "<li>$1</li>");

    // Group consecutive <li> blocks into <ul>
    html = html.replace(/(<li>[\s\S]*?<\/li>)(\n<li>[\s\S]*?<\/li>)*/g, (match) => {
      // Wrap them in a single <ul>
      return "<ul>" + match.replace(/\n/g, "") + "</ul>";
    });

    // 8. Ordered lists
    html = html.replace(/^[ \t]*\d+\. (.+)$/gm, "<oli>$1</oli>");
    html = html.replace(/(<oli>[\s\S]*?<\/oli>)(\n<oli>[\s\S]*?<\/oli>)*/g, (match) => {
      return "<ol>" + match.replace(/<oli>/g, "<li>").replace(/<\/oli>/g, "</li>").replace(/\n/g, "") + "</ol>";
    });

    // 9. Paragraphs — split by double newlines, wrap non-tag blocks
    const parts = html.split(/\n\n+/);
    html = parts.map(p => {
      p = p.trim();
      if (!p) return "";
      if (/^<(h[1-6]|ul|ol|pre|div)/.test(p)) return p;
      // Replace single newlines inside paragraphs with <br>
      return "<p>" + p.replace(/\n/g, "<br>") + "</p>";
    }).join("\n");

    return html;
  }

  function escHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  // ── DOM refs ─────────────────────────────────────────────────────
  const toggle = document.getElementById("chatbotToggle");
  const panel = document.getElementById("chatbotPanel");
  const closeBtn = document.getElementById("chatbotClose");
  const messages = document.getElementById("chatMessages");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSend");

  if (!toggle || !panel) return;

  let chatHistory = []; // { role, content } — previous turns only
  let isOpen = false;
  let chipsVisible = true;
  let retryCount = 0;
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 2000;

  // ── Inject feedback button into chatbot header ───────────────────
  const header = panel.querySelector(".chatbot-header");
  if (header) {
    const fbBtn = document.createElement("button");
    fbBtn.className = "chatbot-feedback-btn";
    fbBtn.title = "Give feedback about NeoTrace";
    fbBtn.innerHTML = "💬";
    fbBtn.addEventListener("click", () => {
      const overlay = document.getElementById("feedbackOverlay");
      if (overlay) {
        overlay.classList.add("open");
      } else {
        appendMsg(
          "bot",
          "💬 Please visit the Dashboard page to leave feedback. Or email us your thoughts anytime!",
        );
        isOpen = true;
        panel.classList.add("open");
      }
    });
    if (closeBtn) header.insertBefore(fbBtn, closeBtn);
    else header.appendChild(fbBtn);
  }

  // ── Inject quick-chips section above input ───────────────────────
  const inputArea = panel.querySelector(".chat-input-area");
  if (inputArea) {
    const chipsEl = document.createElement("div");
    chipsEl.id = "chatQuickChips";
    chipsEl.className = "chat-quick-chips";
    chipsEl.innerHTML =
      '<div class="chips-label">💡 Quick questions</div>' +
      QUICK_QUESTIONS.map(
        (q) =>
          `<button class="chat-chip" data-text="${q.text}">${q.label}</button>`,
      ).join("");
    panel.insertBefore(chipsEl, inputArea);

    chipsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".chat-chip");
      if (!btn) return;
      input.value = btn.dataset.text;
      sendMessage();
      hideChips();
    });
  }

  function hideChips() {
    if (!chipsVisible) return;
    chipsVisible = false;
    const c = document.getElementById("chatQuickChips");
    if (c) {
      c.style.opacity = "0";
      setTimeout(() => {
        c.style.display = "none";
      }, 250);
    }
  }

  // ── Toggle open / close ──────────────────────────────────────────
  toggle.addEventListener("click", () => {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
    toggle.classList.toggle("active", isOpen);
    if (isOpen) input.focus();
  });

  closeBtn?.addEventListener("click", () => {
    isOpen = false;
    panel.classList.remove("open");
    toggle.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      isOpen = false;
      panel.classList.remove("open");
      toggle.classList.remove("active");
    }
  });

  // ── Send message (with retry) ────────────────────────────────────
  /** @description Send user message to ASI-1 backend, with retry and offline fallback. */
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    hideChips();
    appendMsg("user", text);
    input.value = "";
    sendBtn.disabled = true;

    const typingEl = appendMsg(
      "bot",
      '<div class="typing-dots"><span></span><span></span><span></span></div>',
      true,
    );

    // Send previous conversation history (NOT including current message)
    const historyToSend = chatHistory.slice(-12);
    chatHistory.push({ role: "user", content: text });

    callChatAPI(text, historyToSend, typingEl, 0);
  }

  /** @description Call /api/chatbot with retry logic. */
  function callChatAPI(text, history, typingEl, attempt) {
    fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        typingEl.remove();
        const reply =
          data.reply || data.error || "Sorry, something went wrong.";
        appendMsg("bot", reply);
        chatHistory.push({ role: "assistant", content: reply });
        retryCount = 0;
        sendBtn.disabled = false;
        input.focus();
      })
      .catch((err) => {
        if (attempt < MAX_RETRIES) {
          // Retry with exponential backoff
          const delay = RETRY_DELAY * (attempt + 1);
          setTimeout(
            () => callChatAPI(text, history, typingEl, attempt + 1),
            delay,
          );
          return;
        }
        // All retries exhausted
        typingEl.remove();
        const fallback = offlineFallback(text);
        appendMsg("bot", fallback);
        chatHistory.push({ role: "assistant", content: fallback });
        sendBtn.disabled = false;
        input.focus();
      });
  }

  /** @description Append a message bubble to the chat panel. */
  function appendMsg(role, content, isHTML) {
    const el = document.createElement("div");
    el.className = `chat-msg ${role}`;
    if (isHTML) {
      el.innerHTML = content;
    } else if (role === "bot") {
      // Always render bot messages as markdown
      el.innerHTML = renderMd(content);
    } else {
      el.textContent = content;
    }
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  sendBtn?.addEventListener("click", sendMessage);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ── Feedback system ──────────────────────────────────────────────
  const feedbackOverlay = document.getElementById("feedbackOverlay");
  const feedbackCancel = document.getElementById("feedbackCancel");
  const feedbackSubmit = document.getElementById("feedbackSubmit");
  const feedbackStars = document.getElementById("feedbackStars");
  const feedbackText = document.getElementById("feedbackText");
  let selectedRating = 0;

  if (feedbackStars) {
    feedbackStars.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedRating = parseInt(btn.dataset.star);
        feedbackStars.querySelectorAll("button").forEach((b, i) => {
          b.textContent = i < selectedRating ? "★" : "☆";
          b.classList.toggle("active", i < selectedRating);
        });
      });
    });
  }

  feedbackCancel?.addEventListener("click", () =>
    feedbackOverlay?.classList.remove("open"),
  );
  feedbackOverlay?.addEventListener("click", (e) => {
    if (e.target === feedbackOverlay) feedbackOverlay.classList.remove("open");
  });

  feedbackSubmit?.addEventListener("click", () => {
    const msg = feedbackText?.value?.trim() || "";
    if (!selectedRating && !msg) return;
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: selectedRating,
        message: msg,
        page: window.location.pathname,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          feedbackOverlay?.classList.remove("open");
          if (feedbackText) feedbackText.value = "";
          selectedRating = 0;
          feedbackStars?.querySelectorAll("button").forEach((b) => {
            b.textContent = "☆";
            b.classList.remove("active");
          });
          appendMsg(
            "bot",
            "✅ Thank you for your feedback! We really appreciate it.",
          );
          isOpen = true;
          panel?.classList.add("open");
        }
      })
      .catch(() => alert("Failed to submit feedback. Please try again."));
  });
})();
