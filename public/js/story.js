// =====================================================
// AI CYBER DETECTIVE 2.0 — Story Mode
// Scroll progress · Typewriter headers · AI Chapter Analysis
// =====================================================

/** Chapter context for ASI-1 AI analysis */
const CHAPTER_CONTEXT = {
  1: 'Chapter 1 - The Prize Trap: Alex received a fake "$10,000 Amazon gift card" email from amaz0n-prizes.xyz with urgency pressure (24 hours). Red flags: unsolicited prize, suspicious domain, urgency.',
  2: 'Chapter 2 - The Urgency Game: Fake bank SMS from wellsfarg0-secure.net claiming "unauthorized access", threatening account lock in 60 minutes. Red flags: fake domain, urgency, link to verify.',
  3: "Chapter 3 - The Impersonator: WhatsApp message impersonating CEO asking employee to buy iTunes gift cards and send codes. Red flags: gift card request, secrecy, personal messaging app for business.",
  4: 'Chapter 4 - The Social Engineer: Someone posing as new IT support asking to install remote access tool and share login credentials for "mandatory security audit". Red flags: credential request, unknown software, authority claim.',
};

document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.getElementById("progressBar");
  const progressPercent = document.getElementById("progressPercent");
  const scrollProgressEl = document.getElementById("scrollProgress");
  const chapters = document.querySelectorAll(".chapter");

  /** Update the scroll progress bar width and percentage. */
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min((scrollTop / docHeight) * 100, 100);

    if (scrollProgressEl) scrollProgressEl.style.width = progress + "%";
    if (progressBar) progressBar.style.width = progress + "%";
    if (progressPercent)
      progressPercent.textContent = Math.round(progress) + "%";
  }

  window.addEventListener("scroll", updateScrollProgress);

  // Chapter reveal on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
  );

  chapters.forEach((ch) => observer.observe(ch));

  // Initial check
  updateScrollProgress();

  // Add typing effect to chapter headers on reveal
  chapters.forEach((ch) => {
    const h2 = ch.querySelector("h2");
    if (h2) {
      const originalText = h2.textContent;
      const chapterObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            typeText(h2, originalText);
            chapterObserver.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      chapterObserver.observe(ch);
    }
  });
});

/** Typewriter animation effect for chapter headers. @param {HTMLElement} element @param {string} text */
function typeText(element, text) {
  element.textContent = "";
  element.style.borderRight = "2px solid var(--accent-green)";
  let i = 0;
  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      setTimeout(() => {
        element.style.borderRight = "none";
      }, 500);
    }
  }, 40);
}

/**
 * Ask NeoTrace AI to analyze a story chapter.
 * Sends user question + chapter context to /api/chatbot for AI-powered explanation.
 * @param {number} chapterNum - Chapter number (1-4)
 */
async function askStoryAI(chapterNum) {
  const textarea = document.getElementById("storyAI" + chapterNum);
  const replyDiv = document.getElementById("storyReply" + chapterNum);
  const btn = textarea?.parentElement?.querySelector(".story-ai-btn");

  if (!textarea || !replyDiv) return;

  const userQ = textarea.value.trim();
  if (!userQ) {
    replyDiv.innerHTML =
      '<span style="color:var(--orange)">Please type a question about this chapter first.</span>';
    replyDiv.style.display = "block";
    return;
  }

  // Show loading
  if (btn) {
    btn.disabled = true;
    btn.innerHTML =
      '<span class="typing-dots"><span></span><span></span><span></span></span>';
  }
  replyDiv.style.display = "block";
  replyDiv.innerHTML = '<em style="color:var(--text-muted)">Analyzing...</em>';

  const context = CHAPTER_CONTEXT[chapterNum] || "";

  try {
    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userQ,
        history: [],
        context: `Story Mode ${context}. The user is reading this chapter and asking about it.`,
      }),
    });

    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    const reply = data.reply || "Could not get AI analysis. Please try again.";
    replyDiv.innerHTML =
      "🤖 <strong>NeoTrace AI:</strong> " + reply.replace(/\n/g, "<br>");
  } catch (err) {
    replyDiv.innerHTML =
      '<span style="color:var(--orange)">⚡ AI temporarily unavailable. The chapter\'s Detective Analysis above has the key takeaways.</span>';
  } finally {
    if (btn) {
      btn.disabled = false;
      const lang = localStorage.getItem("cyberlang") || "en";
      btn.innerHTML =
        '<span data-i18n="story.askBtn">' +
        (lang === "zh" ? "問AI" : "Ask AI") +
        "</span> ➤";
    }
  }
}
