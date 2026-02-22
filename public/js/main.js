// =====================================================
// NeoTrace — Main Shared JavaScript
// Handles: navigation, theme toggle, counters,
//          scroll reveal, calendar, auto-suggest
// =====================================================

// Ensure chatbot markup exists (inject homepage chatbot HTML when missing)
(function ensureChatbotMarkup() {
  try {
    if (document.getElementById("chatbotPanel") || typeof document === "undefined") return;

    // Insert chatbot toggle button if missing
    if (!document.getElementById("chatbotToggle")) {
      const btn = document.createElement("button");
      btn.className = "chatbot-toggle";
      btn.id = "chatbotToggle";
      btn.title = "NeoTrace AI Assistant";
      btn.innerHTML = '<img src="images/logo.png" alt="NeoTrace AI" class="chatbot-logo-icon" />';
      document.body.appendChild(btn);
    }

    // Insert chatbot panel
    if (!document.getElementById("chatbotPanel")) {
      const panel = document.createElement("div");
      panel.className = "chatbot-panel";
      panel.id = "chatbotPanel";
      panel.innerHTML = `
        <div class="chatbot-header">
          <div class="bot-avatar">💀</div>
          <h4 data-i18n="chat.title">NeoTrace AI</h4>
          <button class="chatbot-close" id="chatbotClose">✕</button>
        </div>
        <div class="chat-messages" id="chatMessages">
          <div class="chat-msg bot" data-i18n="chat.welcome">Hi! I'm NeoTrace AI Assistant. Ask me anything about cybersecurity or how to use this platform.</div>
        </div>
        <div class="chat-input-area">
          <input type="text" id="chatInput" data-i18n-placeholder="chat.placeholder" placeholder="Ask something..." autocomplete="off" />
          <button class="chat-send-btn" id="chatSend">➤</button>
        </div>
      `;
      document.body.appendChild(panel);
    }

    // Insert feedback overlay if missing (used by chatbot)
    if (!document.getElementById("feedbackOverlay")) {
      const fb = document.createElement("div");
      fb.className = "feedback-overlay";
      fb.id = "feedbackOverlay";
      fb.innerHTML = `
        <div class="feedback-modal">
          <h3 data-i18n="feedback.title">Share Your Feedback</h3>
          <p data-i18n="feedback.subtitle">Help us improve NeoTrace</p>
          <div class="feedback-stars" id="feedbackStars">
            <button data-star="1">☆</button><button data-star="2">☆</button><button data-star="3">☆</button><button data-star="4">☆</button><button data-star="5">☆</button>
          </div>
          <textarea id="feedbackText" data-i18n-placeholder="feedback.placeholder" placeholder="Tell us what you think..."></textarea>
          <div class="feedback-actions">
            <button class="btn-feedback-cancel" id="feedbackCancel" data-i18n="feedback.cancel">Cancel</button>
            <button class="btn-feedback-submit" id="feedbackSubmit" data-i18n="feedback.submit">Submit</button>
          </div>
        </div>
      `;
      document.body.appendChild(fb);
    }
  } catch (e) {
    // fail silently — non-critical enhancement
    console.warn("Chatbot injector failed:", e);
  }
})();

// ── Dark / Light Theme Toggle ──────────────────────
function initThemeToggle() {
  const saved = localStorage.getItem("neotrace-theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.textContent = saved === "dark" ? "☀️" : "🌙";
  btn.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("neotrace-theme", next);
    btn.textContent = next === "dark" ? "☀️" : "🌙";
  });
}

// ── Mobile Nav Toggle ──────────────────────────────
function initNavToggle() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navLinks.classList.remove("show"));
    });
  }
}

/** Animate stat counter elements using IntersectionObserver. Eases in using cubic bezier and supports float/int values with prefix/suffix. */
function animateCounters() {
  document.querySelectorAll(".stat-number[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const isFloat = String(el.dataset.count).includes(".");
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat
        ? (target * eased).toFixed(1)
        : Math.floor(target * eased).toLocaleString();
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(update);
        observer.disconnect();
      }
    });
    observer.observe(el);
  });
}

/** Observe elements for scroll-triggered fade-in animation via .visible class. */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll(
      ".chapter, .card, .chart-container, .tool-panel, .result-panel, .news-item",
    )
    .forEach((el) => {
      observer.observe(el);
    });
}

/** Highlight the current page link in the navbar by matching pathname. */
function setActiveNavLink() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

// =====================================================
// Calendar Widget
// =====================================================
let calendarDate = new Date();

function initCalendar() {
  renderCalendar();
}

function changeMonth(delta) {
  calendarDate.setMonth(calendarDate.getMonth() + delta);
  renderCalendar();
}

/** Render the calendar grid for the current month with today highlighted. */
function renderCalendar() {
  const monthEl = document.getElementById("calendarMonth");
  const daysEl = document.getElementById("calendarDays");
  if (!monthEl || !daysEl) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  monthEl.textContent = monthNames[month] + " " + year;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  let html = "";
  // Day labels (matches CSS .day-label)
  ["S", "M", "T", "W", "T", "F", "S"].forEach((d) => {
    html += '<div class="day-label">' + d + "</div>";
  });

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="day-cell other-month"></div>';
  }

  // Day cells (matches CSS .day-cell, .day-cell.today)
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
    html +=
      '<div class="day-cell' + (isToday ? " today" : "") + '">' + d + "</div>";
  }

  daysEl.innerHTML = html;
}

// =====================================================
// Auto-Suggest Component
// Usage: initAutoSuggest(inputEl, suggestions[])
// =====================================================
function initAutoSuggest(inputEl, suggestions) {
  if (!inputEl) return;
  // Wrap input for dropdown positioning
  const wrapper = document.createElement("div");
  wrapper.className = "suggest-wrapper";
  inputEl.parentNode.insertBefore(wrapper, inputEl);
  wrapper.appendChild(inputEl);

  const dropdown = document.createElement("div");
  dropdown.className = "suggest-dropdown";
  wrapper.appendChild(dropdown);

  let activeIdx = -1;

  function render(filtered) {
    activeIdx = -1;
    if (!filtered.length) {
      dropdown.classList.remove("show");
      return;
    }
    dropdown.innerHTML = filtered
      .map((s, i) => `<div class="suggest-item" data-idx="${i}">${s}</div>`)
      .join("");
    dropdown.classList.add("show");
    dropdown.querySelectorAll(".suggest-item").forEach((item) => {
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        inputEl.value = item.textContent;
        dropdown.classList.remove("show");
        inputEl.dispatchEvent(new Event("input"));
      });
    });
  }

  inputEl.addEventListener("input", () => {
    const val = inputEl.value.trim().toLowerCase();
    if (!val) {
      dropdown.classList.remove("show");
      return;
    }
    const filtered = suggestions
      .filter((s) => s.toLowerCase().includes(val))
      .slice(0, 8);
    render(filtered);
  });

  inputEl.addEventListener("focus", () => {
    if (inputEl.value.trim()) inputEl.dispatchEvent(new Event("input"));
  });

  inputEl.addEventListener("blur", () => {
    setTimeout(() => dropdown.classList.remove("show"), 150);
  });

  inputEl.addEventListener("keydown", (e) => {
    const items = dropdown.querySelectorAll(".suggest-item");
    if (!items.length || !dropdown.classList.contains("show")) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      inputEl.value = items[activeIdx].textContent;
      dropdown.classList.remove("show");
      return;
    } else if (e.key === "Escape") {
      dropdown.classList.remove("show");
      return;
    }
    items.forEach((it, i) => it.classList.toggle("active", i === activeIdx));
  });
}

// =====================================================
// Mega-menu hover with delay (prevents accidental close)
// =====================================================
function initMegaMenus() {
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    let closeTimer = null;
    dropdown.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      // close any other open dropdown
      document.querySelectorAll('.nav-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.add('open');
    });
    dropdown.addEventListener('mouseleave', () => {
      closeTimer = setTimeout(() => dropdown.classList.remove('open'), 400);
    });
  });
  // close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    }
  });
}

// =====================================================
// Initialize
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initNavToggle();
  initMegaMenus();
  animateCounters();
  initScrollReveal();
  setActiveNavLink();
  initCalendar();
  if (typeof initI18n === "function") initI18n();
});
