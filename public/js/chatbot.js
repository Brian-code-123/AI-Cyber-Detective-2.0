/**
 * NeoTrace AI Chatbot
 * ASI-1 powered assistant with feedback integration
 */
(function() {
  'use strict';

  const toggle = document.getElementById('chatbotToggle');
  const panel = document.getElementById('chatbotPanel');
  const closeBtn = document.getElementById('chatbotClose');
  const messages = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');

  if (!toggle || !panel) return;

  let chatHistory = [];
  let isOpen = false;

  // Toggle panel
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) input.focus();
  });

  closeBtn?.addEventListener('click', () => {
    isOpen = false;
    panel.classList.remove('open');
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      panel.classList.remove('open');
    }
  });

  // Send message
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    appendMsg('user', text);
    input.value = '';
    sendBtn.disabled = true;

    // Show typing indicator
    const typingEl = appendMsg('bot', '<div class="typing-dots"><span></span><span></span><span></span></div>', true);

    chatHistory.push({ role: 'user', content: text });

    fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: chatHistory.slice(-6) })
    })
    .then(r => r.json())
    .then(data => {
      typingEl.remove();
      const reply = data.reply || 'Sorry, something went wrong.';
      appendMsg('bot', reply);
      chatHistory.push({ role: 'assistant', content: reply });
    })
    .catch(() => {
      typingEl.remove();
      appendMsg('bot', 'Connection error. Please try again.');
    })
    .finally(() => {
      sendBtn.disabled = false;
      input.focus();
    });
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ==================== Feedback System ====================
  const feedbackOverlay = document.getElementById('feedbackOverlay');
  const feedbackCancel = document.getElementById('feedbackCancel');
  const feedbackSubmit = document.getElementById('feedbackSubmit');
  const feedbackStars = document.getElementById('feedbackStars');
  const feedbackText = document.getElementById('feedbackText');

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

  feedbackCancel?.addEventListener('click', () => {
    feedbackOverlay?.classList.remove('open');
  });

  feedbackOverlay?.addEventListener('click', (e) => {
    if (e.target === feedbackOverlay) feedbackOverlay.classList.remove('open');
  });

  feedbackSubmit?.addEventListener('click', () => {
    const msg = feedbackText?.value?.trim() || '';
    if (!selectedRating && !msg) return;

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: selectedRating,
        message: msg,
        page: window.location.pathname
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        feedbackOverlay?.classList.remove('open');
        if (feedbackText) feedbackText.value = '';
        selectedRating = 0;
        feedbackStars?.querySelectorAll('button').forEach(b => {
          b.textContent = '☆';
          b.classList.remove('active');
        });
        // Show quick thank you in chatbot
        if (messages) {
          appendMsg('bot', '✅ Thank you for your feedback! We appreciate it.');
          isOpen = true;
          panel?.classList.add('open');
        }
      }
    })
    .catch(() => {
      alert('Failed to submit feedback. Please try again.');
    });
  });

})();
