// =====================================================
// NeoTrace — Internationalization (i18n)
// =====================================================

const translations = {
  en: {
    // Nav
    "nav.dashboard": "Dashboard",
    "nav.story": "Story Mode",
    "nav.game": "Training Game",
    "nav.image": "AI Image Forensics",
    "nav.url": "URL Threat Scanner",
    "nav.text": "Content Verifier",
    "nav.password": "Password Checker",
    "nav.email": "Email Analyzer",
    "nav.wifi": "WiFi Scanner",
    "nav.qr": "QR Scanner",

    // Error Messages & Alerts
    "error.enterUrl": "Please enter a URL",
    "error.analysisFailed": "Analysis failed — check console for details.",
    "error.fileTooLarge": "File too large. Maximum 20MB.",
    "error.pasteText": "Please paste some text to verify",
    "error.verificationFailed":
      "Verification failed — check console for details.",
    "error.enterName": "Please enter your name",
    "error.submitFailed": "Failed to submit score",

    // Nav - Phone
    "nav.phone": "Phone Inspector",
    "nav.scanner": "URL Scanner",
    "nav.forensics": "Image Forensics",
    "nav.verifier": "Text Verifier",

    // Hero
    "hero.badge": "CYBERSECURITY INTELLIGENCE",
    "hero.title": "NeoTrace",
    "hero.subtitle":
      "Intelligent threat detection, digital forensics, and cybersecurity education — all in one platform.",

    // Stats
    "stats.scams": "Scams Reported",
    "stats.countries": "Countries Affected",
    "stats.lost": "Money Lost (USD)",
    "stats.users": "Users Protected",

    // Dashboard Charts
    "charts.title": "Global Cyber Threat Intelligence",
    "charts.scamTypes": "Top Scam Types",
    "charts.reports": "Reports (thousands)",
    "charts.phishing": "Phishing / Spoofing",
    "charts.investment": "Investment Fraud",
    "charts.romance": "Romance Scams",
    "charts.techSupport": "Tech Support Scams",
    "charts.onlineShopping": "Online Shopping Fraud",
    "charts.identityTheft": "Identity Theft",
    "charts.businessEmail": "Business Email Compromise",
    "charts.cryptocurrency": "Cryptocurrency Fraud",
    "charts.prize": "Prize / Lottery Scams",
    "charts.socialMedia": "Social Media Scams",
    "charts.financialFraud": "Financial Fraud",
    "charts.phishingSpoofing": "Phishing & Spoofing",
    "charts.identityCrimes": "Identity Crimes",
    "charts.romanceSocial": "Romance & Social",
    "charts.techSupport2": "Tech & Support",
    "charts.other": "Other",
    "charts.totalReports": "Total Reports (K)",
    "charts.financialLoss": "Financial Loss ($B)",
    "charts.subtitle":
      "Real-time analysis of worldwide cyber fraud patterns and trends",
    "charts.topScams": "📊 Top 10 Cyber Scam Types",
    "charts.distribution": "🍩 Scam Category Distribution",
    "charts.trend": "📈 Yearly Cyber Fraud Trend",
    "charts.heatmap": "🌍 Global Cyber Fraud Heatmap",
    "charts.sophistication": "🕸️ Threat Sophistication Radar",

    // News Section
    "news.title": "Cybersecurity News",
    "news.subtitle": "Latest threats and advisories from across the industry",

    // Tools Section
    "tools.title": "Investigation Toolkit",
    "tools.subtitle": "Powerful AI-driven tools for analyzing digital threats",
    "tools.story.title": "Story-Based Learning",
    "tools.story.desc":
      "Follow Alex the Cyber Detective through interactive chapters covering prize scams, urgency tactics, impersonation, and social engineering.",
    "tools.game.title": "Gamified Training",
    "tools.game.desc":
      "5 difficulty tiers with 15+ scenarios covering phishing, impersonation, delivery scams, emotional manipulation, and homograph attacks.",
    "tools.image.title": "AI Image Forensics",
    "tools.image.desc":
      "Detect AI-generated images, analyze EXIF metadata, check compression artifacts, and identify forensic manipulation signs.",
    "tools.url.title": "URL Threat Scanner",
    "tools.url.desc":
      "Check domain reputation, evaluate SSL certificates, detect phishing patterns, and analyze link safety with advanced threat intelligence.",
    "tools.text.title": "Content Verifier",
    "tools.text.desc":
      "Fact-check articles, detect sentiment manipulation, identify clickbait patterns, and verify content credibility with AI analysis.",
    "tools.launch": "Launch Tool →",
    "tools.password.title": "Password Checker",
    "tools.password.desc": "Real-time password strength analysis with entropy scoring, crack-time estimates, and an AI-powered strong password generator.",
    "tools.email.title": "Email Analyzer",
    "tools.email.desc": "Detect phishing and spoofing by verifying SPF, DKIM, and DMARC authentication. Paste headers or upload a .eml file.",
    "tools.wifi.title": "WiFi Scanner",
    "tools.wifi.desc": "Assess your WiFi network's security posture — detect open/WEP/weak networks with AI-powered protection advice.",
    "tools.qr.title": "QR Code Scanner",
    "tools.qr.desc": "Decode QR codes and instantly scan embedded URLs for phishing, malware, and other cyber threats.",

    // Password Checker
    "password.title": "Password Strength Checker",
    "password.subtitle": "Real-time strength analysis powered by zxcvbn — the same engine used by Dropbox",
    "password.enterLabel": "Enter password to analyze",
    "password.generate": "⚡ Generate Strong Password",
    "password.copy": "📋 Copy",
    "password.regenerate": "🔄 Regenerate",
    "password.noResults": "Type a password above to see real-time analysis",
    "password.aiAnalyze": "Ask NeoTrace AI for deeper advice",

    // Email Analyzer
    "email.title": "Email Header Analyzer",
    "email.subtitle": "Detect phishing & spoofing — verify SPF, DKIM, and DMARC authentication",
    "email.uploadLabel": "Upload .eml file (optional)",
    "email.dragDrop": "Click or drag .eml file here",
    "email.pasteLabel": "Or paste raw email headers",
    "email.scan": "🔍 Analyze Headers",
    "email.clear": "✕ Clear",
    "email.noResults": "Paste email headers or upload a .eml file and click analyze",
    "email.riskScore": "Phishing Risk Score",
    "email.analyzing": "Analyzing headers...",

    // WiFi Scanner
    "wifi.title": "WiFi Security Scanner",
    "wifi.subtitle": "Assess your WiFi network's security posture and get AI-powered protection tips",
    "wifi.manual": "Manual Network Details",
    "wifi.ssidLabel": "Network Name (SSID)",
    "wifi.securityLabel": "Security Type",
    "wifi.signalLabel": "Signal Strength",
    "wifi.vendorLabel": "Router Vendor (optional)",
    "wifi.scan": "📶 Assess Risk",
    "wifi.analyzing": "Analyzing WiFi security...",

    // QR Scanner
    "qr.title": "QR Code Scanner",
    "qr.subtitle": "Decode QR codes and instantly scan embedded URLs for threats",
    "qr.dragDrop": "Click or drop a QR code image here",
    "qr.preview": "Uploaded QR image",
    "qr.decode": "🔍 Decode QR Code",
    "qr.clear": "✕ Clear",
    "qr.noResults": "Upload a QR code image to decode and analyze it",
    "qr.threatScore": "Threat Score",
    "qr.decoding": "Decoding QR code...",

    // Image Inspector
    "image.title": "AI Image Forensics",
    "image.subtitle":
      "AI-powered deep image forensic analysis & authenticity verification",
    "image.upload": "Drop image here or click to upload",
    "image.filetypes": "JPG, PNG, GIF, WebP — Max 20MB",
    "image.analyze": "ANALYZE IMAGE",
    "image.aiDetection": "🤖 AI Generation Detection",
    "image.metadata": "📋 EXIF Metadata",
    "image.compression": "🗜️ Compression Analysis",
    "image.forensic": "🔬 Forensic Artifacts",
    "image.fileInfo": "📁 File Information",
    "image.verdict": "Verdict",
    "image.noResults": "Upload an image to begin analysis",

    // URL Analyzer
    "url.title": "URL Threat Scanner",
    "url.subtitle":
      "Advanced threat detection & phishing analysis for web addresses",
    "url.placeholder": "Enter URL to analyze...",
    "url.analyze": "ANALYZE URL",
    "url.riskScore": "🎯 Risk Assessment",
    "url.domain": "🌐 Domain Analysis",
    "url.security": "🔒 Security Findings",
    "url.noResults": "Enter a URL above to begin analysis",

    // Text Verifier
    "text.title": "Content Verifier",
    "text.subtitle":
      "AI-powered credibility analysis & misinformation detection",
    "text.placeholder": "Paste text or article content here for analysis...",
    "text.analyze": "VERIFY TEXT",
    "text.content": "📝 Content Analysis",
    "text.sentiment": "💭 Sentiment Analysis",
    "text.misinfo": "⚠️ Misinformation Detection",
    "text.credibility": "✅ Credibility Assessment",
    "text.noResults": "Paste text above to begin verification",

    // Story
    "story.title": "Story-Based Learning",
    "story.subtitle":
      "Follow Alex the Cyber Detective on a thrilling investigation",
    "story.progress": "Story Progress",
    "story.ch1.title": "Chapter 1: The Prize Trap",
    "story.ch1.number": "CHAPTER 01",
    "story.ch2.title": "Chapter 2: The Urgency Game",
    "story.ch2.number": "CHAPTER 02",
    "story.ch3.title": "Chapter 3: The Impersonator",
    "story.ch3.number": "CHAPTER 03",
    "story.ch4.title": "Chapter 4: The Social Engineer",
    "story.ch4.number": "CHAPTER 04",
    "story.code.title": "◉ The NeoTrace Code",
    "story.dangerLabel": "⚠ DANGER",
    "story.safeLabel": "✓ SAFE",
    "story.ch1.text":
      'Alex received an exciting email: "Congratulations! You\'ve won a $10,000 Amazon gift card! Click here to claim your prize within 24 hours!" The message looked professional, with the Amazon logo and official-looking formatting. But something felt off...',
    "story.ch1.msg1":
      "🎉 CONGRATULATIONS! You've been selected as our WINNER!\nClick here IMMEDIATELY to claim your $10,000 Amazon Gift Card!\nOffer expires in 24 HOURS! ➡️ http://amaz0n-prizes.xyz/claim",
    "story.ch1.msg2":
      "Thank you for your Amazon order #302-4821956.\nYour package has been shipped. Track your delivery at amazon.com/orders.\nDelivery expected: Feb 20, 2026.",
    "story.ch1.lesson":
      "Alex noticed the red flags: unsolicited prize notification, urgency pressure (24 hours), suspicious URL (amaz0n-prizes.xyz instead of amazon.com), and a request to click unknown links. Real prizes don't come from random emails.",

    "story.ch2.text":
      'The next day, Alex received an alarming text message: "Your bank account has been compromised! You must verify your identity within 1 HOUR or your account will be permanently locked." The message included a link to what looked like a bank website...',
    "story.ch2.msg1":
      "🚨 URGENT: Your Wells Fargo account has detected unauthorized access!\nVerify your identity NOW or your account will be LOCKED in 60 minutes!\n➡️ http://wellsfarg0-secure.net/verify\nRef: #WF-8834721",
    "story.ch2.msg2":
      "Wells Fargo Alert: We noticed a login from a new device.\nIf this was you, no action needed.\nIf not, call us at 1-800-869-3557 (on the back of your card).\nWe'll never ask for your password via text.",
    "story.ch2.lesson":
      "Scammers create artificial urgency to make you panic and act without thinking. Real banks never threaten to lock accounts via text or ask you to verify through links. They provide their official phone number and encourage you to call directly.",

    "story.ch3.text":
      "Alex's colleague received a WhatsApp message from their \"CEO\": \"I'm in an emergency meeting. I need you to buy $500 in gift cards for a client surprise. I'll reimburse you. Don't tell anyone, it's a surprise!\" The profile picture matched perfectly...",
    "story.ch3.msg1":
      "Hi, this is James (CEO). I'm stuck in meetings all day.\nI need a favor - can you purchase 5x $100 iTunes gift cards for client gifts? \nSend me the codes when done. Will reimburse ASAP.\nplease keep this between us 🤫",
    "story.ch3.msg2":
      "Team meeting rescheduled to 3 PM.\nPlease review Q4 report before the meeting.\nJoin via Zoom link in your calendar invite.\n- James, CEO",
    "story.ch3.lesson":
      "Impersonation scams exploit trust and authority. Key red flags: unusual requests from authority figures, gift card purchases (untraceable), secrecy requests, and using personal messaging apps for business. Always verify unusual requests through official channels.",

    "story.ch4.text":
      'For the final case, Alex discovered a sophisticated social engineering attack targeting the company. A "new IT support" person called employees asking them to install "security software" and share their login credentials for a "mandatory security audit"...',
    "story.ch4.msg1":
      "Hi, I'm Mike from IT Support (new hire).\nWe're doing a mandatory security audit.\nPlease install this remote access tool: http://quicksupport-dl.com/install\nI'll also need your login and password to verify your account security.\nThis is required by management.",
    "story.ch4.msg2":
      "IT Department Notice:\nScheduled system maintenance on Feb 20, 6-8 PM.\nSome services may be temporarily unavailable.\nNo action required from users.\nContact helpdesk@company.com for questions.",
    "story.ch4.lesson":
      'Social engineering manipulates human psychology. Red flags: someone claiming to be "new" (unverifiable), requesting credentials (IT never does this), asking to install unknown software, and claiming management authority. Always verify through HR or known IT contacts.',

    "story.code1": "Never share passwords or verification codes with anyone",
    "story.code2": "Verify sender identity through official channels",
    "story.code3": "Don't click links in unsolicited messages",
    "story.code4": "Be suspicious of urgency and pressure tactics",
    "story.code5": "If it seems too good to be true, it probably is",

    // Game
    "game.title": "NeoTrace Training",
    "game.subtitle": "Test your scam detection skills",
    "game.score": "Score",
    "game.streak": "Streak",
    "game.best": "Best",
    "game.level": "Level",
    "game.next": "NEXT SCENARIO →",
    "game.restart": "RESTART",
    "game.leaderboard": "🏆 Leaderboard",
    "game.yourName": "Your Name",
    "game.submit": "SUBMIT SCORE",
    "game.rank": "Rank",
    "game.player": "Player",
    "game.playerScore": "Score",
    "game.badge": "Badge",
    "game.date": "Date",
    "game.correct": "✓ Correct!",
    "game.incorrect": "✗ Incorrect!",

    // Game Completion
    "game.trainingComplete": "🎉 Training Complete!",
    "game.nextRankInfo": "Score {0}+ for next rank",
    "game.maxRank": "Maximum rank achieved!",
    "game.scoreForNext": "Score 500+ for next rank",

    // Game Ranks (more detailed)
    "game.rankTrainee": "Trainee",
    "game.rankJunior": "Junior Detective",
    "game.rankDetective": "Detective",
    "game.rankSenior": "Senior Detective",
    "game.rankElite": "Elite Detective",

    // Phone Inspector
    "phone.title": "Phone Inspector",
    "phone.subtitle":
      "Analyze phone numbers for fraud risk, carrier verification, and threat intelligence",
    "phone.placeholder": "Enter phone number (e.g. +852 91234567)",
    "phone.scan": "SCAN NUMBER",
    "phone.scanning": "Scanning...",
    "phone.country": "Country / Region",
    "phone.carrier": "Carrier",
    "phone.lineType": "Line Type",
    "phone.riskScore": "Fraud Risk Score",
    "phone.activity": "Activity Status",
    "phone.blacklist": "Blacklist Hits",
    "phone.email": "Associated Email",
    "phone.voip": "VOIP",
    "phone.mobile": "Mobile",
    "phone.landline": "Landline",
    "phone.highRisk": "High Risk",
    "phone.mediumRisk": "Medium Risk",
    "phone.lowRisk": "Low Risk",
    "phone.active": "Active",
    "phone.inactive": "Inactive",
    "phone.newNumber": "New Number",
    "phone.riskRadar": "Risk Analysis Radar",
    "phone.storyTip":
      "This number looks suspicious? Alex the Detective teaches you how to spot scam calls and protect yourself.",
    "phone.noResults": "Enter a phone number above to begin analysis",

    // Phone Inspector Tool Card
    "tools.phone.title": "Phone Inspector",
    "tools.phone.desc":
      "Analyze phone numbers for fraud risk, carrier info, line type, blacklist status, and geo-location intelligence.",

    // Footer
    "footer.text": "NeoTrace — Cybersecurity Intelligence Platform",
    "footer.disclaimer":
      "Educational platform. Data shown is for demonstration purposes.",
    "footer.meta": "Powered by advanced threat detection and analysis",

    // Logo & Navigation
    "nav.logo": "NeoTrace",

    // Hero Badges & Sections
    "hero.aiPowered": "CYBERSECURITY INTELLIGENCE",
    "story.interactive": "INTERACTIVE LEARNING",
    "game.gamified": "GAMIFIED TRAINING",
    "image.forensic": "FORENSIC ANALYSIS",
    "url.threat": "THREAT ANALYSIS",
    "text.content": "CONTENT ANALYSIS",

    // Game Difficulty Levels
    "game.easy": "Easy",
    "game.medium": "Medium",
    "game.hard": "Hard",
    "game.expert": "Expert",
    "game.ultimate": "Ultimate",

    // Game Ranks
    "game.trainee": "Trainee",
    "game.initiate": "Initiate",
    "game.detective": "Detective",
    "game.specialist": "Specialist",
    "game.master": "Master",

    // Game Feedback
    "game.correct": "Correct!",
    "game.incorrect": "Incorrect!",
    "game.points": "points",
    "game.streakBonus": "streak bonus",
    "game.grandmaster": "Grandmaster",

    // Tool Labels
    "image.uploadImage": "📤 Upload Image",
    "url.enterUrl": "🔗 Enter URL",
    "text.pasteText": "📝 Paste Text",
    "image.tips": "💡 Tips",
    "url.tips": "💡 Tips",
    "text.whatWeCheck": "🔎 What We Check",

    // URL Analyzer Tips
    "url.tip1": "• Check for misspellings in domains",
    "url.tip2": "• Look for suspicious TLDs (.xyz, .top, etc.)",
    "url.tip3": "• Verify HTTPS is present",
    "url.tip4": "• Check for homograph characters",
    "url.tip5": "• Be wary of IP addresses as URLs",

    // Text Verifier Tips
    "text.tip1": "📊 Sentiment analysis (positive / negative / neutral)",
    "text.tip2": "🎣 Clickbait pattern detection",
    "text.tip3": "🔠 CAPS LOCK & urgency detection",
    "text.tip4": "📉 Statistical claim analysis",
    "text.tip5": "📰 Source & citation check",

    // Text Verifier Results
    "text.findings": "🔎 Findings & Warnings",

    // Text Verifier Button
    "text.verify": "VERIFY TEXT",

    // Text Verifier Credibility Labels
    "text.likelyCredible": "Likely Credible",
    "text.questionable": "Questionable",
    "text.suspicious": "Suspicious",
    "text.likelyMisinformation": "Likely Misinformation",

    // Text Verifier Content Analysis Labels
    "text.wordCount": "Word Count",
    "text.sentenceCount": "Sentence Count",
    "text.avgWords": "Avg Words/Sentence",
    "text.capsRatio": "CAPS Ratio",
    "text.exclamationMarks": "Exclamation Marks",
    "text.questionMarks": "Question Marks",
    "text.urlsFound": "URLs Found",
    "text.statisticalClaims": "Statistical Claims",
    "text.sourceCitations": "Source Citations",
    "text.yes": "Yes",
    "text.noneFound": "None found",

    // Text Verifier Sentiment Labels
    "text.positive": "Positive",
    "text.negative": "Negative",
    "text.neutral": "Neutral",
    "text.positiveWords": "Positive Words",
    "text.negativeWords": "Negative Words",
    "text.sentimentScore": "Score",
    "text.comparative": "Comparative",

    // Text Verifier Findings
    "text.noRedFlags": "No significant red flags detected",

    // Game Badges
    "game.phishing": "📧 PHISHING",
    "game.prize": "🎁 PRIZE SCAM",
    "game.delivery": "📦 DELIVERY SCAM",
    "game.impersonation": "🎭 IMPERSONATION",
    "game.emotional": "💔 EMOTIONAL MANIPULATION",
    "game.homograph": "🔤 HOMOGRAPH ATTACK",
    "game.analysis1": "Analysis",
    "game.analysis2": "Prevention",

    // Image Inspector Additional
    "image.noExif": "未找到EXIF數據",

    // URL Analyzer Additional
    "url.lowRisk": "低風險",
    "url.mediumRisk": "中等風險",
    "url.highRisk": "高風險",
    "url.criticalRisk": "關鍵風險",

    // Image Inspector Table Labels
    "image.fileName": "File Name",
    "image.fileSize": "File Size",
    "image.mimeType": "MIME Type",
    "image.cameraMake": "Camera Make",
    "image.cameraModel": "Camera Model",
    "image.software": "Software",
    "image.dateTaken": "Date Taken",
    "image.dimensions": "Dimensions",
    "image.iso": "ISO",
    "image.focalLength": "Focal Length",
    "image.aperture": "Aperture",
    "image.exposure": "Exposure",
    "image.gps": "GPS",
    "image.noCompressionAnomalies": "No compression anomalies detected",
    "image.noForensicAnomalies": "No forensic anomalies detected",

    // URL Analyzer Table Labels
    "url.protocol": "Protocol",
    "url.hostname": "Hostname",
    "url.domain": "Domain",
    "url.tld": "TLD",
    "url.path": "Path",
    "url.hasIP": "Has IP",
    "url.ssl": "SSL",
    "url.resolvedIP": "Resolved IP",
    "url.riskLevel": "Risk Level",
    "url.noThreats": "No significant threats detected",
    "url.yes": "Yes",
    "url.no": "No",

    // Nav - New
    "nav.tools": "Tools ▾",
    "nav.careers": "Careers",
    "nav.courses": "Courses",
    "nav.certs": "Certifications",
    "nav.about": "About",

    // Careers Page
    "careers.title": "Cybersecurity Careers",
    "careers.subtitle":
      "Explore high-demand roles, salary ranges, career paths, and top companies hiring in cybersecurity.",

    // Courses Page
    "courses.title": "Cybersecurity Courses",
    "courses.subtitle":
      "Curated online courses from top platforms to build your cybersecurity skills from beginner to expert.",

    // Certifications Page
    "certs.title": "Cybersecurity Certifications",
    "certs.subtitle":
      "Industry-recognized credentials that validate your security expertise and boost your career.",

    // About Page
    "about.title": "About NeoTrace",
    "about.subtitle":
      "Building the future of cybersecurity education with AI-powered intelligence tools.",
    "about.mission.title": "🎯 Mission",
    "about.mission.desc":
      "NeoTrace was built to make cybersecurity knowledge accessible to everyone. In a world where digital threats evolve daily, we believe that education and practical tools should be free, engaging, and powered by cutting-edge AI.",
    "about.platform.title": "🔧 The Platform",
    "about.platform.desc":
      "NeoTrace combines real-time threat intelligence with interactive education. From our AI-powered URL Scanner and Image Forensics to Story Mode and Training Games, every feature is designed to teach cybersecurity concepts through hands-on experience.",
    "about.tech.title": "⚡ Technology Stack",
    "about.tech.desc":
      "Built with modern web technologies for performance, security, and scalability.",
    "about.creator.title": "👤 About the Creator",
    "about.creator.desc":
      "NeoTrace was developed as a comprehensive cybersecurity intelligence platform, combining a passion for cybersecurity with modern AI capabilities.",
    "about.features.title": "✨ Key Features",
    "about.features.desc":
      "A comprehensive suite of AI-powered cybersecurity tools and educational resources.",

    // Story AI
    "story.askAI": "Ask NeoTrace AI",
    "story.askBtn": "Ask AI",
    "story.askPlaceholder":
      "E.g. Is this message a scam? What are the red flags?",
    "story.heroBadge": "Powered by ASI-1",

    // Game AI
    "game.aiScenario": "AI Generated",
    "game.aiExplaining": "AI is analyzing your answer...",

    // Theme
    "theme.dark": "Dark Mode",
    "theme.light": "Light Mode",

    // Chatbot
    "chat.title": "NeoTrace AI",
    "chat.welcome":
      "Hi! I'm NeoTrace AI Assistant. Ask me anything about cybersecurity or how to use this platform.",
    "chat.placeholder": "Ask something...",

    // Feedback
    "feedback.title": "Share Your Feedback",
    "feedback.subtitle": "Help us improve NeoTrace",
    "feedback.placeholder": "Tell us what you think...",
    "feedback.cancel": "Cancel",
    "feedback.submit": "Submit",
  },

  zh: {
    // Nav
    "nav.dashboard": "儀表板",
    "nav.story": "故事模式",
    "nav.game": "訓練遊戲",
    "nav.image": "AI圖像鑑證",
    "nav.url": "網址威脅掃描",
    "nav.text": "內容驗證器",
    "nav.password": "密碼檢查器",
    "nav.email": "電郵標頭分析",
    "nav.wifi": "WiFi安全扫描",
    "nav.qr": "QR碼掃描器",

    // Error Messages & Alerts
    "error.enterUrl": "請輸入網址",
    "error.analysisFailed": "分析失敗 — 請查看控制台了解詳情。",
    "error.fileTooLarge": "文件太大。最大20MB。",
    "error.pasteText": "請粘貼一些文本以進行驗證",
    "error.verificationFailed": "驗證失敗 — 請查看控制台了解詳情。",
    "error.enterName": "請輸入你的名字",
    "error.submitFailed": "提交分數失敗",

    // Nav - Phone
    "nav.phone": "電話檢查器",
    "nav.scanner": "網址掃描",
    "nav.forensics": "圖像鑑證",
    "nav.verifier": "內容驗證",

    // Hero
    "hero.badge": "網絡安全情報",
    "hero.title": "NeoTrace",
    "hero.subtitle": "智能威脅偵測、數字取證和網絡安全教育 — 全部集於一身。",

    // Stats
    "stats.scams": "已報告騙案",
    "stats.countries": "受影響國家",
    "stats.lost": "損失金額（美元）",
    "stats.users": "受保護用戶",

    // Dashboard Charts
    "charts.title": "全球網絡威脅情報",
    "charts.scamTypes": "十大騙案類型",
    "charts.reports": "報告數量（千）",
    "charts.phishing": "網絡釣魚 / 欺騙",
    "charts.investment": "投資詐騙",
    "charts.romance": "戀愛騙局",
    "charts.techSupport": "技術支援詐騙",
    "charts.onlineShopping": "網上購物詐騙",
    "charts.identityTheft": "身份盜竊",
    "charts.businessEmail": "商業電郵詐騙",
    "charts.cryptocurrency": "加密貨幣詐騙",
    "charts.prize": "獎品 / 彩票騙局",
    "charts.socialMedia": "社交媒體詐騙",
    "charts.financialFraud": "金融詐騙",
    "charts.phishingSpoofing": "網絡釣魚及欺騙",
    "charts.identityCrimes": "身份犯罪",
    "charts.romanceSocial": "戀愛及社交騙局",
    "charts.techSupport2": "技術支援",
    "charts.other": "其他",
    "charts.totalReports": "總報告數（千）",
    "charts.financialLoss": "經濟損失（十億美元）",
    "charts.subtitle": "全球網絡詐騙模式和趨勢的實時分析",
    "charts.topScams": "📊 十大網絡騙案類型",
    "charts.distribution": "🍩 騙案類別分佈",
    "charts.trend": "📈 年度網絡詐騙趨勢",
    "charts.heatmap": "🌍 全球網絡詐騙熱力圖",
    "charts.sophistication": "🕸️ 威脅複雜度雷達圖",

    // News Section
    "news.title": "網絡安全新聞",
    "news.subtitle": "來自業界的最新威脅和建議",

    // Tools Section
    "tools.title": "調查工具箱",
    "tools.subtitle": "強大的AI驅動數字威脅分析工具",
    "tools.story.title": "故事式學習",
    "tools.story.desc":
      "跟隨網絡偵探Alex的互動章節，涵蓋獎品騙局、緊迫策略、身份冒充和社交工程。",
    "tools.game.title": "遊戲化訓練",
    "tools.game.desc":
      "5個難度等級，15+場景，涵蓋釣魚、冒充、快遞詐騙、情感操控和同形字攻擊。",
    "tools.image.title": "AI圖像鑑證",
    "tools.image.desc":
      "檢測AI生成圖片、分析EXIF元數據、檢查壓縮偽影，識別取證操縱痕跡。",
    "tools.url.title": "網址威脅掃描",
    "tools.url.desc":
      "檢查域名信譽、評估SSL證書、檢測釣魚模式、使用先進威脅情報分析鏈接安全性。",
    "tools.text.title": "內容驗證器",
    "tools.text.desc":
      "事實核查文章、檢測情緒操控、識別標題黨模式、使用AI分析驗證內容可信度。",
    "tools.launch": "啟動工具 →",
    "tools.password.title": "密碼強度檢查器",
    "tools.password.desc": "實時密碼強度分析，包含熵卒評分、破解時間估算及 AI 生成強密碼功能。",
    "tools.email.title": "電郵標頭分析",
    "tools.email.desc": "通過驗證 SPF、DKIM 和 DMARC 認證，檢測釣魚和仍造郵件。可貼上標頭或上傳 .eml 檔案。",
    "tools.wifi.title": "WiFi 安全扫描",
    "tools.wifi.desc": "評估 WiFi 網絡安全態勢 — 檢測開放/WEP/弱加密網絡，並證取 AI 保護建議。",
    "tools.qr.title": "QR 碼掃描器",
    "tools.qr.desc": "解碼 QR 碼並立即掃描內嵌網址，防秘魚、惡意軟件和其他網絡威脅。",

    // Password Checker
    "password.title": "密碼強度檢查器",
    "password.subtitle": "由 zxcvbn 驅動的實時強度分析",
    "password.enterLabel": "輸入密碼以分析",
    "password.generate": "⚡ 生成強密碼",
    "password.copy": "📋 複製",
    "password.regenerate": "🔄 重新生成",
    "password.noResults": "在上方輸入密碼以查看實時分析",
    "password.aiAnalyze": "請求 NeoTrace AI 深度分析",

    // Email Analyzer
    "email.title": "電郵標頭分析器",
    "email.subtitle": "檢測釣魚和仮造 — 驗證 SPF、DKIM 和 DMARC",
    "email.uploadLabel": "上傳 .eml 檔案（可選）",
    "email.dragDrop": "點擊或拖放 .eml 檔案到此",
    "email.pasteLabel": "或貼上原始電郵標頭",
    "email.scan": "🔍 分析標頭",
    "email.clear": "✕ 清除",
    "email.noResults": "貼上電郵標頭或上傳 .eml 檔案後點擊分析",
    "email.riskScore": "釣魚風險評分",
    "email.analyzing": "分析標頭中...",

    // WiFi Scanner
    "wifi.title": "WiFi 安全扫描器",
    "wifi.subtitle": "評估網絡安全態勢，獲取 AI 保護建議",
    "wifi.manual": "手動輸入網絡詳情",
    "wifi.ssidLabel": "網絡名稱 (SSID)",
    "wifi.securityLabel": "安全類型",
    "wifi.signalLabel": "信號強度",
    "wifi.vendorLabel": "路由器廠商（可選）",
    "wifi.scan": "📶 評估風險",
    "wifi.analyzing": "分析 WiFi 安全性中...",

    // QR Scanner
    "qr.title": "QR 碼掃描器",
    "qr.subtitle": "解碼 QR 碼並立即掃描內嵌網址以防範威脅",
    "qr.dragDrop": "點擊或拖放 QR 码圖片到此",
    "qr.preview": "已上傳的 QR 圖片",
    "qr.decode": "🔍 解碼 QR 碼",
    "qr.clear": "✕ 清除",
    "qr.noResults": "上傳 QR 码圖片以解碼和分析",
    "qr.threatScore": "威脅評分",
    "qr.decoding": "解碼 QR 碼中...",

    // Image Inspector
    "image.title": "AI圖像鑑證",
    "image.subtitle": "AI驅動的深度圖像取證分析與真偽驗證",
    "image.upload": "拖放圖片或點擊上傳",
    "image.filetypes": "JPG、PNG、GIF、WebP — 最大20MB",
    "image.analyze": "分析圖片",
    "image.aiDetection": "🤖 AI生成檢測",
    "image.metadata": "📋 EXIF元數據",
    "image.compression": "🗜️ 壓縮分析",
    "image.forensic": "🔬 取證偽影",
    "image.fileInfo": "📁 文件信息",
    "image.verdict": "判定結果",
    "image.noResults": "上傳圖片以開始分析",

    // URL Analyzer
    "url.title": "網址威脅掃描",
    "url.subtitle": "先進的威脅檢測與釣魚分析系統",
    "url.placeholder": "輸入要分析的網址...",
    "url.analyze": "分析網址",
    "url.riskScore": "🎯 風險評估",
    "url.domain": "🌐 域名分析",
    "url.security": "🔒 安全發現",
    "url.noResults": "在上方輸入網址以開始分析",

    // Text Verifier
    "text.title": "內容驗證器",
    "text.subtitle": "AI驅動的可信度分析與虛假信息檢測",
    "text.placeholder": "在此粘貼文字或文章內容以進行分析...",
    "text.analyze": "驗證文本",
    "text.content": "📝 內容分析",
    "text.sentiment": "💭 情感分析",
    "text.misinfo": "⚠️ 虛假信息檢測",
    "text.credibility": "✅ 可信度評估",
    "text.noResults": "粘貼文本以開始驗證",

    // Story
    "story.title": "故事式學習",
    "story.subtitle": "跟隨網絡偵探Alex展開驚險調查",
    "story.progress": "故事進度",
    "story.ch1.title": "第一章：獎品陷阱",
    "story.ch1.number": "第 01 章",
    "story.ch2.title": "第二章：緊迫遊戲",
    "story.ch2.number": "第 02 章",
    "story.ch3.title": "第三章：冒充者",
    "story.ch3.number": "第 03 章",
    "story.ch4.title": "第四章：社交工程師",
    "story.ch4.number": "第 04 章",
    "story.code.title": "◉ NeoTrace 守則",
    "story.dangerLabel": "⚠ 危險",
    "story.safeLabel": "✓ 安全",
    "story.ch1.text":
      "Alex收到了一封激動人心的電子郵件：「恭喜！您已贏得$10,000亞馬遜禮品卡！請在24小時內點擊此處領取您的獎品！」郵件看起來很專業，有亞馬遜的標誌和官方格式。但總覺得哪裡不對勁...",
    "story.ch1.msg1":
      "🎉 恭喜！您已被選為我們的獲獎者！\n立即點擊領取您的$10,000亞馬遜禮品卡！\n優惠24小時內過期！➡️ http://amaz0n-prizes.xyz/claim",
    "story.ch1.msg2":
      "感謝您的亞馬遜訂單 #302-4821956。\n您的包裹已發貨。在 amazon.com/orders 追蹤配送。\n預計送達時間：2026年2月20日。",
    "story.ch1.lesson":
      "Alex注意到了危險信號：不請自來的獎品通知、緊迫壓力（24小時）、可疑網址（amaz0n-prizes.xyz而非amazon.com），以及要求點擊未知鏈接。真正的獎品不會通過隨機郵件發送。",

    "story.ch2.text":
      "第二天，Alex收到了一條令人擔憂的短信：「您的銀行帳戶已被入侵！您必須在1小時內驗證身份，否則帳戶將被永久鎖定。」短信中包含一個看似銀行網站的鏈接...",
    "story.ch2.msg1":
      "🚨 緊急：您的富國銀行帳戶檢測到未授權訪問！\n立即驗證身份，否則帳戶將在60分鐘內被鎖定！\n➡️ http://wellsfarg0-secure.net/verify\n參考：#WF-8834721",
    "story.ch2.msg2":
      "富國銀行提醒：我們注意到一個新設備的登入。\n如果是您本人，無需操作。\n如果不是，請撥打卡背面的 1-800-869-3557。\n我們絕不會通過短信要求您提供密碼。",
    "story.ch2.lesson":
      "騙子製造人為的緊迫感讓你恐慌並不加思考地行動。真正的銀行不會通過短信威脅鎖定帳戶，也不會要求通過鏈接進行驗證。他們會提供官方電話號碼並鼓勵您直接致電。",

    "story.ch3.text":
      "Alex的同事收到了來自「CEO」的WhatsApp消息：「我正在開緊急會議。我需要你買$500的禮品卡作為客戶驚喜。我會報銷給你。不要告訴任何人，這是個驚喜！」頭像完全匹配...",
    "story.ch3.msg1":
      "嗨，我是James（CEO）。我一整天都在開會。\n需要你幫個忙 - 能買5張$100的iTunes禮品卡作為客戶禮物嗎？\n買好後把代碼發給我。會盡快報銷。\n請保密哦🤫",
    "story.ch3.msg2":
      "團隊會議改到下午3點。\n請在會議前查看第四季度報告。\n通過日曆邀請中的Zoom鏈接加入。\n- James，CEO",
    "story.ch3.lesson":
      "冒充騙局利用信任和權威。主要危險信號：權威人物提出不尋常的要求、禮品卡購買（無法追溯）、保密要求、以及使用個人通訊應用程序處理公事。務必通過官方渠道驗證不尋常的要求。",

    "story.ch4.text":
      "最後一個案件，Alex發現了一個針對公司的複雜社交工程攻擊。一個「新入職的IT支持人員」致電員工，要求他們安裝「安全軟件」並分享登入憑證以進行「強制安全審計」...",
    "story.ch4.msg1":
      "嗨，我是IT支持的Mike（新入職）。\n我們正在進行必要的安全審計。\n請安裝這個遠程訪問工具：http://quicksupport-dl.com/install\n我還需要您的登入名和密碼來驗證帳戶安全。\n這是管理層要求的。",
    "story.ch4.msg2":
      "IT部門通知：\n計劃系統維護在2月20日下午6-8點。\n部分服務可能暫時不可用。\n用戶無需採取任何操作。\n有問題請聯繫 helpdesk@company.com。",
    "story.ch4.lesson":
      "社交工程利用人類心理學。危險信號：聲稱「新來的」（無法驗證）、要求憑證（IT部門絕不會這樣做）、要求安裝未知軟件、聲稱管理層授權。務必通過人力或已知的IT聯繫人員進行驗證。",

    "story.code1": "永遠不要與任何人分享密碼或驗證碼",
    "story.code2": "通過官方渠道驗證發件人身份",
    "story.code3": "不要點擊未經請求的消息中的鏈接",
    "story.code4": "對緊迫和壓力策略保持懷疑",
    "story.code5": "如果看起來好得不像真的，那很可能就是假的",

    // Game
    "game.title": "NeoTrace 訓練",
    "game.subtitle": "測試你的騙局識別能力",
    "game.score": "分數",
    "game.streak": "連勝",
    "game.best": "最高",
    "game.level": "等級",
    "game.next": "下一場景 →",
    "game.restart": "重新開始",
    "game.leaderboard": "🏆 排行榜",
    "game.yourName": "你的名字",
    "game.submit": "提交分數",
    "game.rank": "排名",
    "game.player": "玩家",
    "game.playerScore": "分數",
    "game.badge": "徽章",
    "game.date": "日期",
    "game.correct": "✓ 正確！",
    "game.incorrect": "✗ 錯誤！",

    // Game Completion
    "game.trainingComplete": "🎉 訓練完成！",
    "game.nextRankInfo": "得分{0}+以獲得下一個等級",
    "game.maxRank": "已達到最高等級！",
    "game.scoreForNext": "得分500+以獲得下一個等級",

    // Game Ranks (more detailed)
    "game.rankTrainee": "學員",
    "game.rankJunior": "初級偵探",
    "game.rankDetective": "偵探",
    "game.rankSenior": "高級偵探",
    "game.rankElite": "精英偵探",

    // Phone Inspector
    "phone.title": "電話檢查器",
    "phone.subtitle": "分析電話號碼的欺詐風險、運營商驗證和威脅情報",
    "phone.placeholder": "輸入電話號碼（例如 +852 91234567）",
    "phone.scan": "掃描號碼",
    "phone.scanning": "掃描中...",
    "phone.country": "國家 / 地區",
    "phone.carrier": "電訊商",
    "phone.lineType": "線路類型",
    "phone.riskScore": "欺詐風險分數",
    "phone.activity": "活躍狀態",
    "phone.blacklist": "黑名單記錄",
    "phone.email": "關聯電郵",
    "phone.voip": "VOIP網絡電話",
    "phone.mobile": "手機",
    "phone.landline": "固定電話",
    "phone.highRisk": "高風險",
    "phone.mediumRisk": "中等風險",
    "phone.lowRisk": "低風險",
    "phone.active": "活躍",
    "phone.inactive": "不活躍",
    "phone.newNumber": "新號碼",
    "phone.riskRadar": "風險分析雷達",
    "phone.storyTip":
      "呢個號碼似可疑？Alex偵探教你點樣識別詐騙電話同保護自己。",
    "phone.noResults": "在上方輸入電話號碼以開始分析",

    // Phone Inspector Tool Card
    "tools.phone.title": "電話檢查器",
    "tools.phone.desc":
      "分析電話號碼的欺詐風險、電訊商資訊、線路類型、黑名單狀態和地理位置情報。",

    // Footer
    "footer.text": "NeoTrace — 網絡安全情報平台",
    "footer.disclaimer": "教育平台。所顯示的數據僅供演示。",
    "footer.meta": "由先進的威脅偵測和分析技術驅動",

    // Logo & Navigation
    "nav.logo": "NeoTrace",

    // Hero Badges & Sections
    "hero.aiPowered": "網絡安全情報",
    "story.interactive": "互動式學習",
    "game.gamified": "遊戲化訓練",
    "image.forensic": "取證分析",
    "url.threat": "威脅分析",
    "text.content": "內容分析",

    // Game Difficulty Levels
    "game.easy": "簡單",
    "game.medium": "中等",
    "game.hard": "困難",
    "game.expert": "專家",
    "game.ultimate": "終極",

    // Game Ranks
    "game.trainee": "學員",
    "game.initiate": "初級",
    "game.detective": "偵探",
    "game.specialist": "專家",
    "game.master": "大師",
    "game.grandmaster": "宗師",

    // Game Feedback
    "game.correct": "正確！",
    "game.incorrect": "錯誤！",
    "game.points": "分",
    "game.streakBonus": "連勝獎勵",

    // Tool Labels
    "image.uploadImage": "📤 上傳圖片",
    "url.enterUrl": "🔗 輸入網址",
    "text.pasteText": "📝 粘貼文本",
    "image.tips": "💡 提示",
    "url.tips": "💡 提示",
    "text.whatWeCheck": "🔎 我們檢查什麼",

    // URL Analyzer Tips
    "url.tip1": "• 檢查域名中的錯誤拼寫",
    "url.tip2": "• 查找可疑的頂級域名（.xyz、.top等）",
    "url.tip3": "• 驗證HTTPS是否存在",
    "url.tip4": "• 檢查同形字",
    "url.tip5": "• 警惕IP地址作為網址",

    // Text Verifier Tips
    "text.tip1": "📊 情緒分析（正面/負面/中立）",
    "text.tip2": "🎣 標題黨模式檢測",
    "text.tip3": "🔠 大寫字母和緊急檢測",
    "text.tip4": "📉 統計聲明分析",
    "text.tip5": "📰 來源和引用檢查",

    // Text Verifier Results
    "text.findings": "🔎 發現和警告",

    // Text Verifier Button
    "text.verify": "驗證文本",

    // Text Verifier Credibility Labels
    "text.likelyCredible": "可能可信",
    "text.questionable": "可疑",
    "text.suspicious": "懷疑",
    "text.likelyMisinformation": "可能是虛假信息",

    // Text Verifier Content Analysis Labels
    "text.wordCount": "字數",
    "text.sentenceCount": "句子數",
    "text.avgWords": "平均字數/句子",
    "text.capsRatio": "大寫比例",
    "text.exclamationMarks": "感嘆號",
    "text.questionMarks": "問號",
    "text.urlsFound": "找到的網址",
    "text.statisticalClaims": "統計聲明",
    "text.sourceCitations": "來源引用",
    "text.yes": "有",
    "text.noneFound": "未找到",

    // Text Verifier Sentiment Labels
    "text.positive": "正面",
    "text.negative": "負面",
    "text.neutral": "中立",
    "text.positiveWords": "正面詞語",
    "text.negativeWords": "負面詞語",
    "text.sentimentScore": "分數",
    "text.comparative": "比較值",

    // Text Verifier Findings
    "text.noRedFlags": "未檢測到明顯危險信號",

    // Game Badges
    "game.phishing": "📧 釣魚",
    "game.prize": "🎁 獎品騙局",
    "game.delivery": "📦 快遞騙局",
    "game.impersonation": "🎭 身份冒充",
    "game.emotional": "💔 情感操控",
    "game.homograph": "🔤 同形字攻擊",
    "game.analysis1": "分析",
    "game.analysis2": "預防",

    // Image Inspector Additional
    "image.noExif": "未找到EXIF數據",

    // URL Analyzer Additional
    "url.lowRisk": "低風險",
    "url.mediumRisk": "中等風險",
    "url.highRisk": "高風險",
    "url.criticalRisk": "關鍵風險",

    // Image Inspector Table Labels
    "image.fileName": "文件名",
    "image.fileSize": "文件大小",
    "image.mimeType": "MIME類型",
    "image.cameraMake": "相機製造商",
    "image.cameraModel": "相機型號",
    "image.software": "軟件",
    "image.dateTaken": "拍攝日期",
    "image.dimensions": "尺寸",
    "image.iso": "ISO",
    "image.focalLength": "焦距",
    "image.aperture": "光圈",
    "image.exposure": "曝光",
    "image.gps": "GPS",
    "image.noCompressionAnomalies": "未檢測到壓縮異常",
    "image.noForensicAnomalies": "未檢測到取證異常",

    // URL Analyzer Table Labels
    "url.protocol": "協議",
    "url.hostname": "主機名",
    "url.domain": "域名",
    "url.tld": "頂級域名",
    "url.path": "路徑",
    "url.hasIP": "是否為IP",
    "url.ssl": "SSL",
    "url.resolvedIP": "解析IP",
    "url.riskLevel": "風險等級",
    "url.noThreats": "未檢測到重大威脅",
    "url.yes": "是",
    "url.no": "否",

    // Nav - New
    "nav.tools": "工具 ▾",
    "nav.careers": "職業",
    "nav.courses": "課程",
    "nav.certs": "證書",
    "nav.about": "關於",

    // Careers Page
    "careers.title": "網絡安全職業",
    "careers.subtitle": "探索高需求崗位、薪資範圍、職業路徑和頂級招聘公司。",

    // Courses Page
    "courses.title": "網絡安全課程",
    "courses.subtitle":
      "精選頂級平台的在線課程，從初學者到專家建立您的網絡安全技能。",

    // Certifications Page
    "certs.title": "網絡安全證書",
    "certs.subtitle":
      "業界認可的資格證書，驗證您的安全專業知識並推動職業發展。",

    // About Page
    "about.title": "關於 NeoTrace",
    "about.subtitle": "以AI驅動的智能工具，打造網絡安全教育的未來。",
    "about.mission.title": "🎯 使命",
    "about.mission.desc":
      "NeoTrace 的使命是讓每個人都能獲得網絡安全知識。在數字威脅日新月異的世界中，我們相信教育和實用工具應該是免費的、有趣的，並由尖端AI驅動。",
    "about.platform.title": "🔧 平台",
    "about.platform.desc":
      "NeoTrace 結合實時威脅情報與互動教育。從AI驅動的網址掃描器和圖像鑑證到故事模式和訓練遊戲，每個功能都旨在通過實踐體驗教授網絡安全概念。",
    "about.tech.title": "⚡ 技術棧",
    "about.tech.desc": "採用現代網絡技術構建，注重性能、安全性和可擴展性。",
    "about.creator.title": "👤 關於創建者",
    "about.creator.desc":
      "NeoTrace 是一個綜合性的網絡安全情報平台，將對網絡安全的熱情與現代AI能力相結合。",
    "about.features.title": "✨ 主要功能",
    "about.features.desc": "一套全面的AI驅動網絡安全工具和教育資源。",

    // Story AI
    "story.askAI": "問 NeoTrace AI",
    "story.askBtn": "問 AI",
    "story.askPlaceholder": "例如：這條訊息是詐騙嗎？有什麼危險信號？",
    "story.heroBadge": "由 ASI-1 驅動",

    // Game AI
    "game.aiScenario": "AI 生成",
    "game.aiExplaining": "AI 正在分析你的答案...",

    // Theme
    "theme.dark": "深色模式",
    "theme.light": "淺色模式",

    // Chatbot
    "chat.title": "NeoTrace AI",
    "chat.welcome":
      "你好！我是 NeoTrace AI 助手。可以問我任何關於網絡安全或如何使用此平台的問題。",
    "chat.placeholder": "請輸入問題...",

    // Feedback
    "feedback.title": "分享您的意見",
    "feedback.subtitle": "幫助我們改進 NeoTrace",
    "feedback.placeholder": "告訴我們您的想法...",
    "feedback.cancel": "取消",
    "feedback.submit": "提交",
  },
};

let currentLang = localStorage.getItem("cyberlang") || "en";

function t(key) {
  return (
    (translations[currentLang] && translations[currentLang][key]) ||
    (translations["en"] && translations["en"][key]) ||
    key
  );
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("cyberlang", lang);

  // Update all elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });

  // Update pre/code elements that need whitespace preserved
  document.querySelectorAll("[data-i18n-pre]").forEach((el) => {
    const key = el.getAttribute("data-i18n-pre");
    el.textContent = t(key);
  });

  // Update placeholder attributes
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });

  // Update lang buttons
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Fire custom event for page-specific updates
  window.dispatchEvent(
    new CustomEvent("languageChanged", { detail: { lang } }),
  );
}

function initI18n() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });
  setLanguage(currentLang);
}
