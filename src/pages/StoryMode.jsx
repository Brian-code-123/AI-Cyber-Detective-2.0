import { useState } from "react";
import ToolLayout from "../components/ui/ToolLayout.jsx";
import NeonButton from "../components/ui/NeonButton.jsx";
import { useChatbot } from "../contexts/ChatbotContext.jsx";

const CHAPTERS = [
  {
    id: 1,
    number: "CHAPTER 01",
    title: "Chapter 1: The Prize Trap",
    story:
      "Alex received an exciting email: \"Congratulations! You've won a $10,000 Amazon gift card! Click here to claim your prize within 24 hours!\" The message looked professional, with the Amazon logo and official-looking formatting. But something felt off…",
    danger: `🎉 CONGRATULATIONS! You've been selected as our WINNER!
Click here IMMEDIATELY to claim your $10,000 Amazon Gift Card!
Offer expires in 24 HOURS! ➡️ http://amaz0n-prizes.xyz/claim`,
    safe: `Thank you for your Amazon order #302-4821956.
Your package has been shipped. Track your delivery at amazon.com/orders.
Delivery expected: Feb 20, 2026.`,
    analysis:
      "Alex noticed the red flags: unsolicited prize notification, urgency pressure (24 hours), suspicious URL (amaz0n-prizes.xyz instead of amazon.com), and a request to click unknown links.",
    aiPrompt: "Is this email a scam? What red flags should I look for?",
  },
  {
    id: 2,
    number: "CHAPTER 02",
    title: "Chapter 2: The Urgency Game",
    story: "The next day, Alex received an alarming text message from an unknown number claiming to be from Wells Fargo bank…",
    danger: `🚨 URGENT: Your Wells Fargo account has detected unauthorized access!
Verify your identity NOW or your account will be LOCKED in 60 minutes!
➡️ http://wellsfarg0-secure.net/verify
Ref: #WF-8834721`,
    safe: `Wells Fargo Alert: We noticed a login from a new device.
If this was you, no action needed.
If not, call us at 1-800-869-3557 (on the back of your card).
We'll never ask for your password via text.`,
    analysis:
      "Scammers create artificial urgency to make you panic and act without thinking. Real bank alerts never contain links to external sites and always provide official contact numbers for verification.",
    aiPrompt: "How do I tell if this bank text is real or a scam?",
  },
  {
    id: 3,
    number: "CHAPTER 03",
    title: "Chapter 3: The Impersonator",
    story: "Alex's colleague received a WhatsApp message from their \"CEO\". The message appeared to come from the same profile picture and name they recognized…",
    danger: `Hi, this is James (CEO). I'm stuck in meetings all day.
I need a favor - can you purchase 5x $100 iTunes gift cards for client gifts?
Send me the codes when done. Will reimburse ASAP.
please keep this between us 🤫`,
    safe: `Team meeting rescheduled to 3 PM.
Please review Q4 report before the meeting.
Join via Zoom link in your calendar invite.
- James, CEO`,
    analysis:
      "Impersonation scams exploit trust and authority. Key red flags: using personal messaging for business, requesting gift cards (untraceable), asking for secrecy, and creating urgency. Always verify through official company channels.",
    aiPrompt: "How should I verify if a message is really from my boss?",
  },
  {
    id: 4,
    number: "CHAPTER 04",
    title: "Chapter 4: The Social Engineer",
    story:
      "For the final case, Alex discovered a sophisticated social engineering attack targeting employees at a tech company. The attacker posed as a new IT support staff member…",
    danger: `Hi, I'm Mike from IT Support (new hire).
We're doing a mandatory security audit.
Please install this remote access tool: http://quicksupport-dl.com/install
I'll also need your login and password to verify your account security.
This is required by management.`,
    safe: `IT Department Notice:
Scheduled system maintenance on Feb 20, 6-8 PM.
Some services may be temporarily unavailable.
No action required from users.
Contact helpdesk@company.com for questions.`,
    analysis:
      "Social engineering manipulates human psychology rather than technical vulnerabilities. No legitimate IT department ever asks for your password. Always verify identity via official internal directories before granting system access.",
    aiPrompt: "What social engineering tactics should I watch out for at work?",
  },
];

const DETECTIVE_CODE = [
  "Never share passwords or verification codes with anyone",
  "Verify sender identity through official channels",
  "Don't click links in unsolicited messages",
  "Be suspicious of urgency and pressure tactics",
  "If it seems too good to be true, it probably is",
];

function ChapterCard({ chapter, progress, onComplete }) {
  const [aiQuestion, setAiQuestion] = useState(chapter.aiPrompt);
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const { sendMessage } = useChatbot();

  const isRead = progress.includes(chapter.id);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiReply("");
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: aiQuestion, history: [] }),
      });
      const json = await res.json();
      setAiReply(json.reply || json.message || "No response.");
    } catch {
      setAiReply("⚠ Could not reach AI. Check your connection.");
    } finally {
      setAiLoading(false);
      if (!isRead) onComplete(chapter.id);
    }
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--glass-border)",
      borderRadius: "var(--radius-lg)",
      padding: "28px 32px",
      marginBottom: 24,
      position: "relative",
    }}>
      {isRead && (
        <span style={{ position: "absolute", top: 20, right: 20, fontSize: 11, fontWeight: 700, background: "var(--green)", color: "#000", padding: "2px 8px", borderRadius: 10 }}>
          READ ✓
        </span>
      )}
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "1px", marginBottom: 8, textTransform: "uppercase" }}>
        {chapter.number}
      </div>
      <h2 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 20, marginBottom: 14, color: "var(--text-primary)" }}>
        {chapter.title}
      </h2>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
        {chapter.story}
      </p>

      {/* Danger example */}
      <div style={{ background: "rgba(255,58,58,0.07)", border: "1px solid rgba(255,58,58,0.3)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", marginBottom: 8, textTransform: "uppercase" }}>⚠ DANGER</div>
        <pre style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono, monospace)" }}>
          {chapter.danger}
        </pre>
      </div>

      {/* Safe example */}
      <div style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.25)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", marginBottom: 8, textTransform: "uppercase" }}>✓ SAFE</div>
        <pre style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono, monospace)" }}>
          {chapter.safe}
        </pre>
      </div>

      {/* Detective's analysis */}
      <div style={{ padding: "14px 16px", background: "rgba(0,212,255,0.05)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--accent)", marginBottom: 24 }}>
        <strong style={{ color: "var(--accent)" }}>🔍 Detective's Analysis:</strong>
        <p style={{ color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: 1.65, fontSize: 14 }}>{chapter.analysis}</p>
      </div>

      {/* Ask AI */}
      <div style={{ background: "rgba(0,0,0,0.15)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", padding: "16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--accent)" }}>🤖 Ask NeoTrace AI</div>
        <textarea
          value={aiQuestion}
          onChange={(e) => setAiQuestion(e.target.value)}
          rows={2}
          style={{ width: "100%", padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", marginBottom: 10 }}
        />
        <NeonButton size="sm" loading={aiLoading} onClick={handleAskAI}>
          Ask AI ➤
        </NeonButton>
        {aiReply && (
          <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(0,212,255,0.05)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
            {aiReply}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StoryMode() {
  const [completedChapters, setCompletedChapters] = useState([]);

  const progress = Math.round((completedChapters.length / CHAPTERS.length) * 100);

  const handleComplete = (id) => {
    setCompletedChapters((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(0,212,255,0.1)", border: "1px solid var(--accent)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse 2s infinite" }} />
          Interactive Learning · Powered by ASI-1
        </div>
        <h1 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: "clamp(24px, 4vw, 36px)", marginBottom: 12, color: "var(--text-primary)" }}>
          Story-Based Learning
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Follow Alex the Cyber Detective on a thrilling investigation
        </p>

        {/* Progress bar */}
        <div style={{ maxWidth: 500, margin: "20px auto 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
            <span>Story Progress</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 3, transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>
        {/* Chapters */}
        <div>
          {CHAPTERS.map((ch) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              progress={completedChapters}
              onComplete={handleComplete}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80 }}>
          {/* Detective Code */}
          <div style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.25)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
            <h3 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 14, marginBottom: 14 }}>🔍 The Cyber Detective Code</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DETECTIVE_CODE.map((rule, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ minWidth: 20, fontWeight: 700, color: "var(--green)", fontSize: 13 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
            <h3 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 14, marginBottom: 12 }}>📊 Quick Stats</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
              Phishing attacks account for <strong style={{ color: "var(--red)" }}>36%</strong> of all data breaches. The average cost of a phishing attack for a mid-sized company is <strong style={{ color: "var(--orange)" }}>$4.76M</strong>.
            </p>
          </div>

          {/* Pro Tip */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
            <h3 style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontSize: 14, marginBottom: 12 }}>💡 Pro Tip</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
              Always hover over links before clicking to verify the actual URL destination. Scammers often use look-alike domains like "amaz0n.com" or "paypa1.com".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
