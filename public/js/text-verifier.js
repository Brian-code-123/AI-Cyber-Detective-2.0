// === Text Verifier ===
async function verifyText() {
  const text = document.getElementById('textInput').value.trim();
  if (!text) { alert('Please paste some text to verify'); return; }

  document.getElementById('textPlaceholder').classList.add('hidden');
  document.getElementById('textResults').classList.add('hidden');
  document.getElementById('textLoading').classList.remove('hidden');

  try {
    const resp = await fetch('/api/verify-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await resp.json();
    renderTextResults(data);
  } catch (err) {
    console.error(err);
    alert('Verification failed — check console for details.');
  } finally {
    document.getElementById('textLoading').classList.add('hidden');
  }
}

function renderTextResults(data) {
  document.getElementById('textResults').classList.remove('hidden');

  // -- Credibility arc (server gives data.credibility.score) --
  const cred = (data.credibility && data.credibility.score) ?? 50;
  const arc = document.getElementById('textCredArc');
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (cred / 100) * circumference;
  arc.style.transition = 'stroke-dashoffset 1.2s ease';
  arc.setAttribute('stroke-dasharray', circumference);
  arc.setAttribute('stroke-dashoffset', circumference);
  requestAnimationFrame(() => {
    arc.setAttribute('stroke-dashoffset', offset);
  });

  let color, label;
  if (cred >= 75)       { color = '#00ff41'; label = '✅ Likely Credible'; }
  else if (cred >= 50)  { color = '#ffaa00'; label = '⚠️ Questionable'; }
  else if (cred >= 25)  { color = '#ff6600'; label = '🔶 Suspicious'; }
  else                  { color = '#ff0055'; label = '🚨 Likely Misinformation'; }
  arc.setAttribute('stroke', color);
  document.getElementById('textCredScore').textContent = cred;
  document.getElementById('textCredScore').style.color = color;
  document.getElementById('textCredLabel').textContent = label;

  // -- Content Analysis (computed client-side from the input text) --
  const rawText = document.getElementById('textInput').value;
  const words = rawText.split(/\s+/).filter(Boolean);
  const sentences = rawText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const capsLetters = rawText.replace(/[^A-Z]/g, '').length;
  const allLetters = rawText.replace(/[^a-zA-Z]/g, '').length;
  const capsRatio = allLetters ? capsLetters / allLetters : 0;
  const exclamationCount = (rawText.match(/!/g) || []).length;
  const questionCount = (rawText.match(/\?/g) || []).length;
  const urlCount = (rawText.match(/https?:\/\/[^\s]+/g) || []).length;
  const statClaims = (rawText.match(/\d+%|\d+ out of \d+|\d+ million|\d+ billion/g) || []).length;
  const hasCitations = /\[\d+\]|according to|research shows|study (shows|finds|suggests)|scientists say/i.test(rawText);

  const ct = document.getElementById('contentTable');
  ct.innerHTML = Object.entries({
    'Word Count': words.length,
    'Sentence Count': sentences.length,
    'Avg Words/Sentence': sentences.length ? (words.length / sentences.length).toFixed(1) : '—',
    'CAPS Ratio': (capsRatio * 100).toFixed(1) + '%',
    'Exclamation Marks': exclamationCount,
    'Question Marks': questionCount,
    'URLs Found': urlCount,
    'Statistical Claims': statClaims,
    'Source Citations': hasCitations ? 'Yes' : 'None found'
  }).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  // -- Sentiment (server gives data.sentiment) --
  const sent = data.sentiment || {};
  const sentViz = document.getElementById('sentimentViz');
  let sentColor, sentEmoji, sentLabel;
  const sc = sent.comparative ?? 0;
  if (sc > 0.05)      { sentColor = '#00ff41'; sentEmoji = '😊'; sentLabel = 'Positive'; }
  else if (sc < -0.05){ sentColor = '#ff0055'; sentEmoji = '😠'; sentLabel = 'Negative'; }
  else                { sentColor = '#ffaa00'; sentEmoji = '😐'; sentLabel = 'Neutral'; }
  sentViz.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 0.5rem;">${sentEmoji}</div>
    <div style="font-size: 1.3rem; font-weight: 700; color: ${sentColor};">${sentLabel}</div>
    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem;">Score: ${(sent.score ?? 0).toFixed(2)} &nbsp;|&nbsp; Comparative: ${sc.toFixed(4)}</div>
  `;

  const st = document.getElementById('sentimentTable');
  st.innerHTML = '';
  if (sent.positive && sent.positive.length) {
    st.innerHTML += `<tr><td>Positive Words</td><td style="color:#00ff41;">${sent.positive.join(', ')}</td></tr>`;
  }
  if (sent.negative && sent.negative.length) {
    st.innerHTML += `<tr><td>Negative Words</td><td style="color:#ff0055;">${sent.negative.join(', ')}</td></tr>`;
  }

  // -- Findings (merge content + misinformation + credibility findings) --
  const fc = document.getElementById('textFindings');
  fc.innerHTML = '';
  const allFindings = [
    ...(data.content?.findings || []),
    ...(data.misinformation?.findings || []),
    ...(data.credibility?.findings || [])
  ];
  if (allFindings.length === 0) {
    fc.innerHTML = '<div class="finding-item safe"><span>✅ No significant red flags detected</span></div>';
  } else {
    allFindings.forEach(f => {
      const type = f.type || 'info';
      const sevClass = type === 'warning' ? 'warning' : type === 'safe' ? 'safe' : 'info';
      const icon = type === 'warning' ? '⚠️' : type === 'safe' ? '✅' : 'ℹ️';
      fc.innerHTML += `<div class="finding-item ${sevClass}"><span>${icon} ${f.message}</span></div>`;
    });
  }
}
