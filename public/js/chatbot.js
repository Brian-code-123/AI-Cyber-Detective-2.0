/**
 * NeoTrace AI Chatbot v2
 * Quick question chips · Feedback integration · Offline fallback
 */
(function () {
  'use strict';

  // ── Quick-question data ──────────────────────────────────────────
  const QUICK_QUESTIONS = [
    { label: '🎣 What is phishing?',         text: 'What is phishing and how can I avoid it?' },
    { label: '🔐 How to protect accounts?',   text: 'What are the best ways to protect my online accounts?' },
    { label: '🔗 Check suspicious URL',        text: 'How do I use the URL Scanner to check a suspicious link?' },
    { label: '📜 Best security certs?',        text: 'What cybersecurity certifications should I get as a beginner?' },
    { label: '💼 Top cyber job roles',         text: 'What are the highest-paying cybersecurity job roles in 2025?' },
    { label: '🖼️ Detect fake images',          text: 'How does the Image Forensics tool detect AI-generated images?' },
  ];

  // ── Offline fallback answers ─────────────────────────────────────
  const OFFLINE_ANSWERS = {
    phishing:  'Phishing tricks you into giving up credentials by impersonating trusted entities via email/SMS/calls. Always verify senders, hover links before clicking, and never enter passwords on pages reached via link.',
    password:  'To protect accounts: (1) Use a password manager. (2) Enable 2FA everywhere. (3) Use unique 16+ char passwords. (4) Never reuse passwords. (5) Check haveibeenpwned.com for breached accounts.',
    url:       'Use the URL Scanner — paste the URL, click Scan, and get a full report: domain age, WHOIS, SSL status, safe browsing checks, and redirect chain analysis.',
    cert:      'Best beginner certs: CompTIA Security+ (entry-level, widely recognised). Next: CySA+ (analyst), CEH (ethical hacking), OSCP (hands-on pentesting). For management: CISSP or CISM.',
    job:       'Top-paying roles in 2025: Cloud Security Engineer ($120K–$185K), Security Architect ($150K–$220K), Red Team Lead ($135K–$200K). Full salary table on the Careers page.',
    image:     'The Image Forensics tool analyses pixel-level noise, EXIF metadata, and AI artefact signatures. Upload an image and it returns a probability score for AI generation and tampering.',
  };

  function offlineFallback(text) {
    const t = text.toLowerCase();
    if (t.includes('phish') || t.includes('scam'))                              return OFFLINE_ANSWERS.phishing;
    if (t.includes('password') || t.includes('account') || t.includes('2fa'))  return OFFLINE_ANSWERS.password;
    if (t.includes('url') || t.includes('link') || t.includes('scanner'))      return OFFLINE_ANSWERS.url;
    if (t.includes('cert') || t.includes('cissp') || t.includes('oscp'))       return OFFLINE_ANSWERS.cert;
    if (t.includes('job') || t.includes('salary') || t.includes('career'))     return OFFLINE_ANSWERS.job;
    if (t.includes('image') || t.includes('forensic') || t.includes('fake'))   return OFFLINE_ANSWERS.image;
    return 'I\'m having trouble connecting right now. Try the quick chips below, or explore: 🔗 URL Scanner · 🖼️ Image Forensics · 📞 Phone Inspector · 📋 Careers · 🎓 Courses.';
  }

  // ── DOM refs ─────────────────────────────────────────────────────
  const toggle = document.getElementById('chatbotToggle');
  const panel     = document.getElementById('chatbotPanel');
  const closeBtn  = document.getElementById('chatbotClose');
  const messages  = document.getElementById('chatMessages');
  const input     = document.getElementById('chatInput');
  const sendBtn   = document.getElementById('chatSend');

  if (!toggle || !panel) return;

  let chatHistory  = [];
  let isOpen       = false;
  let chipsVisible = true;

  // ── Inject feedback button into chatbot header ───────────────────
  const header = panel.querySelector('.chatbot-header');
  if (header) {
    const fbBtn = document.createElement('button');
    fbBtn.className = 'chatbot-feedback-btn';
    fbBtn.title = 'Give feedback about NeoTrace';
    fbBtn.innerHTML = '💬';
    fbBtn.addEventListener('click', () => {
      const overlay = document.getElementById('feedbackOverlay');
      if (overlay) { overlay.classList.add('open'); }
      else {
        // On pages without the feedback modal, show inline in chat
        appendMsg('bot', '💬 Please visit the Dashboard page to leave feedback. Or email us your thoughts anytime!');
        isOpen = true; panel.classList.add('open');
      }
    });
    if (closeBtn) header.insertBefore(fbBtn, closeBtn);
    else header.appendChild(fbBtn);
  }

  // ── Inject quick-chips section above input ───────────────────────
  const inputArea = panel.querySelector('.chat-input-area');
  if (inputArea) {
    const chipsEl = document.createElement('div');
    chipsEl.id = 'chatQuickChips';
    chipsEl.className = 'chat-quick-chips';
    chipsEl.innerHTML =
      '<div class="chips-label">💡 Quick questions</div>' +
      QUICK_QUESTIONS.map(q =>
        `<button class="chat-chip" data-text="${q.text}">${q.label}</button>`
      ).join('');
    panel.insertBefore(chipsEl, inputArea);

    chipsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.chat-chip');
      if (!btn) return;
      input.value = btn.dataset.text;
      sendMessage();
      hideChips();
    });
  }

  function hideChips() {
    if (!chipsVisible) return;
    chipsVisible = false;
    const c = document.getElementById('chatQuickChips');
    if (c) { c.style.opacity = '0'; setTimeout(() => { c.style.display = 'none'; }, 250); }
  }

  // ── Toggle open / close ──────────────────────────────────────────
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) input.focus();
  });

  closeBtn?.addEventListener('click', () => { isOpen = false; panel.classList.remove('open'); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) { isOpen = false; panel.classList.remove('open'); }
  });

  // ── Send message ─────────────────────────────────────────────────
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    hideChips();
    appendMsg('user', text);
    input.value = '';
    sendBtn.disabled = true;

    const typingEl = appendMsg('bot',
      '<div class="typing-dots"><span></span><span></span><span></span></div>', true);

    chatHistory.push({ role: 'user', content: text });

    fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: chatHistory.slice(-6) })
    })
      .then(r => r.json())
      .then(data => {
        typingEl.remove();
        const reply = data.reply || data.error || 'Sorry, something went wrong.';
        appendMsg('bot', reply);
        chatHistory.push({ role: 'assistant', content: reply });
      })
      .catch(() => {
        typingEl.remove();
        const fallback = offlineFallback(text);
        appendMsg('bot', fallback);
        chatHistory.push({ role: 'assistant', content: fallback });
      })
      .finally(() => { sendBtn.disabled = false; input.focus(); });
  }

  function appendMsg(role, content, isHTML) {
    const el = document.createElement('div');
    el.className = `chat-msg ${role}`;
    if (isHTML) el.innerHTML = content;
    else el.textContent = content;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  sendBtn?.addEventListener('click', sendMessage);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // ── Feedback system ──────────────────────────────────────────────
  const feedbackOverlay = document.getElementById('feedbackOverlay');
  const feedbackCancel  = document.getElementById('feedbackCancel');
  const feedbackSubmit  = document.getElementById('feedbackSubmit');
  const feedbackStars   = document.getElementById('feedbackStars');
  const feedbackText    = document.getElementById('feedbackText');
  let selectedRating = 0;

  if (feedbackStars) {
    feedbackStars.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.dataset.star);
        feedbackStars.querySelectorAll('button').forEach((b, i) => {
          b.textContent = i < selectedRating ? '★' : '☆';
          b.classList.toggle('active', i < selectedRating);
        });
      });
    });
  }

  feedbackCancel?.addEventListener('click', () => feedbackOverlay?.classList.remove('open'));
  feedbackOverlay?.addEventListener('click', (e) => {
    if (e.target === feedbackOverlay) feedbackOverlay.classList.remove('open');
  });

  feedbackSubmit?.addEventListener('click', () => {
    const msg = feedbackText?.value?.trim() || '';
    if (!selectedRating && !msg) return;
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: selectedRating, message: msg, page: window.location.pathname })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          feedbackOverlay?.classList.remove('open');
          if (feedbackText) feedbackText.value = '';
          selectedRating = 0;
          feedbackStars?.querySelectorAll('button').forEach(b => { b.textContent = '☆'; b.classList.remove('active'); });
          appendMsg('bot', '✅ Thank you for your feedback! We really appreciate it.');
          isOpen = true; panel?.classList.add('open');
        }
      })
      .catch(() => alert('Failed to submit feedback. Please try again.'));
  });

})();
