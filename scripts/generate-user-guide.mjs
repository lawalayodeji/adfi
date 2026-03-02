import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, ImageRun,
} from "docx";
import { writeFileSync } from "fs";

// ─── Colour Palette ──────────────────────────────────────────────────────────
const C = {
  primary:  "2563EB",
  emerald:  "059669",
  amber:    "D97706",
  red:      "DC2626",
  gray900:  "111827",
  gray700:  "374151",
  gray500:  "6B7280",
  gray200:  "E5E7EB",
  gray50:   "F9FAFB",
  blueBg:   "EFF6FF",
  greenBg:  "ECFDF5",
  amberBg:  "FFFBEB",
  redBg:    "FEF2F2",
  white:    "FFFFFF",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const border = {
  top:    { style: BorderStyle.SINGLE, size: 1, color: C.gray200 },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: C.gray200 },
  left:   { style: BorderStyle.SINGLE, size: 1, color: C.gray200 },
  right:  { style: BorderStyle.SINGLE, size: 1, color: C.gray200 },
};

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer(before = 0, after = 160) {
  return new Paragraph({ spacing: { before, after } });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 40, color: C.gray900, font: "Calibri" })],
  });
}

function h2(text, color = C.primary) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color, font: "Calibri" })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: C.gray700, font: "Calibri" })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 140 },
    alignment: opts.align,
    children: [
      new TextRun({
        text,
        size: opts.size ?? 22,
        color: opts.color ?? C.gray700,
        bold: opts.bold,
        italics: opts.italic,
        font: "Calibri",
      }),
    ],
  });
}

function bullet(text, level = 0, color = C.gray700) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 100 },
    children: [new TextRun({ text, size: 22, color, font: "Calibri" })],
  });
}

function numberedStep(num, title, detail) {
  return [
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({ text: `${num}. `, bold: true, size: 24, color: C.primary, font: "Calibri" }),
        new TextRun({ text: title, bold: true, size: 24, color: C.gray900, font: "Calibri" }),
      ],
    }),
    ...(detail ? [para(`   ${detail}`, { color: C.gray500 })] : []),
  ];
}

function callout(text, type = "info") {
  const styles = {
    info:    { bg: C.blueBg,   border: C.primary, icon: "ℹ️  " },
    success: { bg: C.greenBg,  border: C.emerald, icon: "✅  " },
    warning: { bg: C.amberBg,  border: C.amber,   icon: "⚠️  " },
    tip:     { bg: C.greenBg,  border: C.emerald, icon: "💡  " },
  };
  const s = styles[type] ?? styles.info;
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    shading: { type: ShadingType.SOLID, color: s.bg },
    children: [
      new TextRun({ text: s.icon + text, size: 20, color: C.gray700, font: "Calibri" }),
    ],
  });
}

function uiMockup(lines) {
  return lines.map((line) =>
    new Paragraph({
      shading: { type: ShadingType.SOLID, color: "1E293B" },
      spacing: { after: 0 },
      children: [
        new TextRun({ text: line, font: "Courier New", size: 18, color: "E2E8F0" }),
      ],
    })
  );
}

function simpleTable(headers, rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) =>
      new TableCell({
        shading: { type: ShadingType.SOLID, color: C.blueBg },
        borders: border,
        children: [new Paragraph({
          children: [new TextRun({ text: h, bold: true, color: C.primary, size: 20, font: "Calibri" })],
        })],
      })
    ),
  });
  const dataRows = rows.map((row, i) =>
    new TableRow({
      children: row.map((cell) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? C.white : C.gray50 },
          borders: border,
          children: [new Paragraph({
            children: [new TextRun({ text: cell, size: 20, color: C.gray700, font: "Calibri" })],
          })],
        })
      ),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function sectionBanner(text, bg = C.blueBg, color = C.primary) {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    shading: { type: ShadingType.SOLID, color: bg },
    children: [new TextRun({ text: `  ${text}`, bold: true, size: 24, color, font: "Calibri" })],
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 240, after: 240 },
    children: [new TextRun({ text: "─".repeat(90), color: C.gray200, size: 16 })],
  });
}

// ─── COVER PAGE ──────────────────────────────────────────────────────────────
const cover = [
  spacer(800),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: "AdFi", bold: true, size: 96, color: C.primary, font: "Calibri" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "User Guide", size: 44, color: C.gray500, font: "Calibri" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: "Your complete guide to running affiliate marketing campaigns", size: 24, color: C.gray500, italics: true, font: "Calibri" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: `Version 1.0  ·  ${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long" })}`, size: 20, color: C.gray500, font: "Calibri" })],
  }),
  pageBreak(),
];

// ─── TABLE OF CONTENTS ───────────────────────────────────────────────────────
const toc = [
  h1("Contents"),
  para("1.  What is AdFi?"),
  para("2.  Logging In for the First Time"),
  para("3.  The Onboarding Wizard"),
  para("4.  Your Dashboard — At a Glance"),
  para("5.  Creating a Campaign"),
  para("6.  Creating Affiliate Links"),
  para("7.  Organic Campaigns — Tracking Free Traffic"),
  para("8.  Sharing Your Links"),
  para("9.  Tracking Clicks & Conversions"),
  para("10. Viewing Reports"),
  para("11. Connecting Google Ads"),
  para("12. Settings & Postback URL"),
  para("13. Glossary"),
  para("14. Frequently Asked Questions"),
  pageBreak(),
];

// ─── SECTION 1: What is AdFi ─────────────────────────────────────────────────
const s1 = [
  h1("1. What is AdFi?"),
  para("AdFi is your all-in-one affiliate marketing dashboard. It brings together everything you need to run, track, and optimise advertising campaigns — without needing to jump between Google Ads, spreadsheets, and analytics tools."),
  spacer(0, 200),
  h2("What you can do with AdFi"),
  bullet("Create and manage Google Ads campaigns from a simple form — no Google Ads training needed"),
  bullet("Generate trackable short links for every campaign, blog post, or social media post"),
  bullet("See exactly how many people clicked your links and how many became customers"),
  bullet("Track organic (free) traffic from Google, Instagram, Facebook, Reddit, and more"),
  bullet("View revenue, conversions, and ROAS in one clear dashboard"),
  bullet("Export reports as CSV for your own records"),
  spacer(0, 200),
  callout("AdFi is designed for simplicity. If you can fill out a form, you can run a campaign.", "tip"),
  pageBreak(),
];

// ─── SECTION 2: Logging In ───────────────────────────────────────────────────
const s2 = [
  h1("2. Logging In for the First Time"),
  para("AdFi uses your Google account for login — no separate password needed."),
  spacer(),
  ...numberedStep(1, "Open your browser and go to your AdFi URL", "e.g. https://adfi.yourdomain.com"),
  ...numberedStep(2, "You will be taken to the login page automatically"),
  ...numberedStep(3, "Click the blue 'Continue with Google' button"),
  ...numberedStep(4, "Choose your Google account from the list"),
  ...numberedStep(5, "Google will ask for permissions — click Allow", "AdFi needs Google Ads access so it can manage your campaigns. Your data is never shared."),
  ...numberedStep(6, "You are redirected to your dashboard or the setup wizard"),
  spacer(0, 200),
  ...uiMockup([
    "  ┌──────────────────────────────────────────────┐  ",
    "  │                                              │  ",
    "  │              ⚡  AdFi                        │  ",
    "  │                                              │  ",
    "  │   Affiliate marketing made simple.           │  ",
    "  │   Sign in to access your dashboard.          │  ",
    "  │                                              │  ",
    "  │   ┌──────────────────────────────────────┐  │  ",
    "  │   │  G   Continue with Google            │  │  ",
    "  │   └──────────────────────────────────────┘  │  ",
    "  │                                              │  ",
    "  └──────────────────────────────────────────────┘  ",
    "                Login Page                          ",
  ]),
  spacer(200),
  callout("You only need to log in once. Your session stays active. If you ever get logged out, just click 'Continue with Google' again.", "info"),
  pageBreak(),
];

// ─── SECTION 3: Onboarding Wizard ────────────────────────────────────────────
const s3 = [
  h1("3. The Onboarding Wizard"),
  para("The first time you log in, AdFi guides you through a 3-step setup wizard. This takes about 2 minutes."),
  spacer(),
  ...uiMockup([
    "  ●  ○  ○  ○   ← Progress dots                    ",
    "                                                    ",
    "  Step 1 of 3                                       ",
    "  Hi [Your Name]!                                   ",
    "  Welcome to AdFi. Let's get you set up in          ",
    "  3 quick steps.                                    ",
    "                                                    ",
    "              [ Continue ]                          ",
  ]),
  spacer(200),
  h3("Step 1 — Welcome"),
  para("Just a greeting. Click Continue."),
  spacer(),
  h3("Step 2 — Connect Google Ads (Optional)"),
  para("Enter your Google Ads Customer ID if you have one. This looks like: 123-456-7890 and is found in the top-right corner of Google Ads."),
  callout("You can skip this step and add your Customer ID later in Settings.", "warning"),
  spacer(),
  h3("Step 3 — Create Your First Link"),
  para("Give your first affiliate link a name and paste the URL of the page you want people to visit. AdFi will generate a short trackable link for you."),
  spacer(),
  h3("Step 4 — Done!"),
  para("Click 'Go to Dashboard' to start using AdFi."),
  pageBreak(),
];

// ─── SECTION 4: Dashboard ────────────────────────────────────────────────────
const s4 = [
  h1("4. Your Dashboard — At a Glance"),
  para("The dashboard is your home screen. It shows a live summary of how your campaigns and links are performing."),
  spacer(0, 200),
  ...uiMockup([
    "  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ",
    "  │   Clicks  │  │Conversions│  │  Revenue  │  │ Campaigns │  ",
    "  │   1,240   │  │    48     │  │  £2,160   │  │     5     │  ",
    "  │All-time   │  │ 3.9% rate │  │  Total    │  │  Active   │  ",
    "  └───────────┘  └───────────┘  └───────────┘  └───────────┘  ",
    "                                                                ",
    "  ┌──────────────────────────────────┐  ┌───────────────────┐  ",
    "  │   Performance (Last 30 Days)     │  │  Recent Campaigns │  ",
    "  │                                  │  │                   │  ",
    "  │   ▁▂▃▅▆▇▆▅▄▃▂▃▄▅▆▇▆▇▅▄▃▄▅▆▇  │  │  Summer Sale ● ACTIVE  │  ",
    "  │   — Clicks  — Revenue            │  │  Blog Traffic ● PAUSED │  ",
    "  └──────────────────────────────────┘  └───────────────────┘  ",
    "                                                                ",
    "  ┌──────────────────────────────────────────────────────────┐  ",
    "  │  🌿 Organic Traffic (Last 30 Days)                       │  ",
    "  │  142 Clicks · 12 Conversions · £360 Revenue              │  ",
    "  │  Google Search ████████████████████  78                  │  ",
    "  │  Instagram     ████████████          31                  │  ",
    "  │  Direct / None ███████               22                  │  ",
    "  └──────────────────────────────────────────────────────────┘  ",
  ]),
  spacer(200),
  h2("What each card means"),
  simpleTable(
    ["Card", "What it shows"],
    [
      ["Total Clicks",      "Every time someone clicked any of your affiliate links, ever"],
      ["Conversions",       "How many clicks led to a sale or sign-up"],
      ["Revenue",           "Total money earned through tracked conversions"],
      ["Active Campaigns",  "Number of campaigns currently running"],
      ["Performance Chart", "Clicks and revenue trend over the last 30 days"],
      ["Recent Campaigns",  "Your 5 most recently updated campaigns and their status"],
      ["Organic Traffic",   "Clicks, conversions, and revenue from organic (free) campaigns only — broken down by where visitors came from"],
    ]
  ),
  spacer(0, 200),
  h2("Left sidebar navigation"),
  simpleTable(
    ["Menu Item", "What it does"],
    [
      ["Overview",        "Dashboard home — stats and charts"],
      ["Campaigns",       "Create and manage your ad campaigns"],
      ["Affiliate Links", "Generate and manage your trackable links"],
      ["Reports",         "Detailed analytics with date filtering and CSV export"],
      ["Settings",        "Connect Google Ads, view your postback URL"],
    ]
  ),
  pageBreak(),
];

// ─── SECTION 5: Campaigns ────────────────────────────────────────────────────
const s5 = [
  h1("5. Creating a Campaign"),
  para("A campaign is a group of affiliate links that share a common goal — for example, a product launch, a seasonal promotion, or a content marketing push."),
  spacer(0, 200),
  h2("How to create a campaign"),
  ...numberedStep(1, "Click 'Campaigns' in the left sidebar"),
  ...numberedStep(2, "Click the blue 'New Campaign' button (top right)"),
  ...numberedStep(3, "Fill in the form:"),
  spacer(0, 80),
  ...uiMockup([
    "  ┌─────────────────────────────────────────────┐  ",
    "  │  Create Campaign                            │  ",
    "  │                                             │  ",
    "  │  Campaign Name  [ Summer Sale 2024        ] │  ",
    "  │                                             │  ",
    "  │  Channel        [ Google Ads          ▼  ] │  ",
    "  │                   Google Ads               │  ",
    "  │                   Meta Ads                 │  ",
    "  │                   TikTok Ads               │  ",
    "  │                   Email                    │  ",
    "  │                   Organic     🌿           │  ",
    "  │                                             │  ",
    "  │  Daily Budget   [ £50                     ] │  ",
    "  │                                             │  ",
    "  │  Landing Page   [ https://...            ] │  ",
    "  │                                             │  ",
    "  │  Campaign Goal  [ Increase sales by 30%  ] │  ",
    "  │                                             │  ",
    "  │        [ Cancel ]     [ Create Campaign ]  │  ",
    "  └─────────────────────────────────────────────┘  ",
  ]),
  spacer(200),
  ...numberedStep(4, "Click 'Create Campaign'"),
  para("   Your campaign appears in the table immediately."),
  spacer(0, 200),
  h2("Campaign fields explained"),
  simpleTable(
    ["Field", "Required", "Description"],
    [
      ["Campaign Name",  "Yes", "A name you'll recognise, e.g. 'Christmas Sale'"],
      ["Channel",        "Yes", "Which platform: Google Ads, Meta, TikTok, Email, or Organic"],
      ["Daily Budget",   "No",  "How much per day you plan to spend (Google Ads campaigns only)"],
      ["Landing Page",   "No",  "The URL users will be sent to when they click your links"],
      ["Campaign Goal",  "No",  "A note about what you want to achieve — for your reference"],
    ]
  ),
  spacer(0, 200),
  h2("Campaign statuses"),
  simpleTable(
    ["Status", "Colour", "Meaning"],
    [
      ["DRAFT",    "Grey",   "Created but not yet started"],
      ["ACTIVE",   "Green",  "Currently running"],
      ["PAUSED",   "Yellow", "Temporarily stopped — can be resumed"],
      ["ENDED",    "Red",    "Finished"],
      ["ARCHIVED", "Grey",   "Hidden from view but data is kept"],
    ]
  ),
  spacer(0, 200),
  callout("Google Ads campaigns are created in PAUSED status by default. Go to the campaign row and click the ▶ Play button to activate it.", "warning"),
  spacer(0, 200),
  h2("Pausing or activating a campaign"),
  ...numberedStep(1, "Go to Campaigns"),
  ...numberedStep(2, "Find your campaign in the table"),
  ...numberedStep(3, "Click the Pause ⏸ or Play ▶ icon on the right"),
  para("   If the campaign is linked to Google Ads, the status change is automatically synced."),
  pageBreak(),
];

// ─── SECTION 6: Affiliate Links ──────────────────────────────────────────────
const s6 = [
  h1("6. Creating Affiliate Links"),
  para("Affiliate links are the short, trackable URLs you share with your audience. Every click is recorded, and every conversion is attributed back to the exact link."),
  spacer(0, 200),
  h2("How to create a link"),
  ...numberedStep(1, "Click 'Affiliate Links' in the sidebar"),
  ...numberedStep(2, "Click 'New Link' (top right)"),
  ...numberedStep(3, "Fill in the form:"),
  spacer(0, 80),
  ...uiMockup([
    "  ┌─────────────────────────────────────────────────┐  ",
    "  │  Create Affiliate Link                          │  ",
    "  │                                                 │  ",
    "  │  Link Name      [ Homepage Banner            ] │  ",
    "  │                                                 │  ",
    "  │  Destination URL [ https://yoursite.com/offer ] │  ",
    "  │                                                 │  ",
    "  │  Campaign       [ Summer Sale 2024         ▼ ] │  ",
    "  │                                                 │  ",
    "  │  UTM Parameters                                 │  ",
    "  │  Source  [ adfi     ]   Medium [ affiliate  ]  │  ",
    "  │  Campaign[ summer-sale] Content [ banner-top ]  │  ",
    "  │                                                 │  ",
    "  │        [ Cancel ]       [ Create Link ]         │  ",
    "  └─────────────────────────────────────────────────┘  ",
  ]),
  spacer(200),
  ...numberedStep(4, "Click 'Create Link'"),
  para("   Your link is created instantly. You'll see it in the table with its short URL."),
  spacer(0, 200),
  h2("What is a UTM parameter?"),
  para("UTM parameters are invisible labels added to your link's URL. They tell analytics tools (like Google Analytics) where a visitor came from. AdFi fills these in automatically — you usually don't need to change them."),
  simpleTable(
    ["UTM Parameter", "What it means", "Default value"],
    [
      ["Source",   "Where the traffic comes from",    "adfi"],
      ["Medium",   "What type of traffic it is",       "affiliate"],
      ["Campaign", "Which campaign it belongs to",     "(empty)"],
      ["Content",  "Which specific ad or link it was", "(empty)"],
    ]
  ),
  spacer(0, 200),
  h2("Copying and sharing your link"),
  ...numberedStep(1, "Find your link in the Affiliate Links table"),
  ...numberedStep(2, "Click the Copy icon 📋 on the right"),
  ...numberedStep(3, "The short URL is copied — e.g. https://yourdomain.com/go/aB3xP9zQ"),
  ...numberedStep(4, "Paste it anywhere: social posts, emails, blog articles, ads"),
  callout("The short URL automatically redirects visitors to your destination page with UTM tracking applied.", "success"),
  pageBreak(),
];

// ─── SECTION 7: Organic Campaigns ────────────────────────────────────────────
const s7 = [
  h1("7. Organic Campaigns — Tracking Free Traffic"),
  sectionBanner("  🌿  Organic = free traffic from blogs, social media, word of mouth, and search  ", "ECFDF5", "059669"),
  spacer(0, 200),
  para("An Organic campaign is for tracking visitors who don't come through paid ads. When you write a blog post, share a link on Instagram, or get mentioned in a YouTube video, that is organic traffic."),
  spacer(0, 200),
  h2("How organic campaigns are different"),
  simpleTable(
    ["Feature",         "Paid Campaign",          "Organic Campaign"],
    [
      ["Cost",          "Daily budget required",   "Free — no ad spend"],
      ["Row colour",    "White",                   "Soft green highlight"],
      ["Channel badge", "Blue / Pink / Indigo",    "Green with 🌿 leaf icon"],
      ["Budget column", "Shows daily spend",       "Shows 'Free'"],
      ["UTM medium",    "affiliate",               "organic (auto-filled)"],
    ]
  ),
  spacer(0, 200),
  h2("Creating an organic campaign"),
  ...numberedStep(1, "Click 'Campaigns' → 'New Campaign'"),
  ...numberedStep(2, "Set Channel to 'Organic'"),
  ...numberedStep(3, "No budget is needed — leave it blank"),
  ...numberedStep(4, "Click 'Create Campaign'"),
  spacer(0, 200),
  h2("Creating organic links"),
  para("When you create a link and select an organic campaign, AdFi automatically sets the UTM parameters correctly:"),
  ...uiMockup([
    "  🌿 Organic campaign detected — UTM parameters auto-set to    ",
    "  utm_medium=organic. You can still edit them below.            ",
    "                                                                ",
    "  Source  [ organic  ]   Medium [ organic   ] ← green border   ",
  ]),
  spacer(200),
  h2("The Organic Insights card"),
  para("On your dashboard, the green 'Organic Traffic' card shows:"),
  bullet("Total clicks and conversions from organic campaigns in the last 30 days"),
  bullet("Revenue earned from organic traffic"),
  bullet("A bar chart of your top traffic sources — Google Search, Instagram, Facebook, Direct, and more"),
  bullet("A device split showing how many visitors were on mobile vs desktop"),
  spacer(0, 200),
  ...uiMockup([
    "  ┌──────────────────────────────────────────────────────────┐  ",
    "  │  🌿  Organic Traffic   Last 30 days                      │  ",
    "  │                                                          │  ",
    "  │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐       │  ",
    "  │  │  142     │  │     12       │  │   £360.00    │       │  ",
    "  │  │ Clicks   │  │ Conversions  │  │   Revenue    │       │  ",
    "  │  └──────────┘  └──────────────┘  └──────────────┘       │  ",
    "  │                                                          │  ",
    "  │  Top Sources                                             │  ",
    "  │  Google Search  ████████████████████████  78            │  ",
    "  │  Instagram      ████████████████          31            │  ",
    "  │  Direct / None  ██████████████            22            │  ",
    "  │  Reddit         ███████                   11            │  ",
    "  │                                                          │  ",
    "  │  📱 mobile 98   🖥 desktop 44                            │  ",
    "  └──────────────────────────────────────────────────────────┘  ",
  ]),
  spacer(200),
  callout("Organic tracking works automatically — just share your short links and AdFi captures where every visitor came from.", "tip"),
  pageBreak(),
];

// ─── SECTION 8: Sharing Links ────────────────────────────────────────────────
const s8 = [
  h1("8. Sharing Your Links"),
  para("Your short affiliate links work anywhere. Here are the most common places to use them:"),
  spacer(0, 200),
  simpleTable(
    ["Where", "How to use it", "Tip"],
    [
      ["Google Ads",      "Paste as the Final URL in your ad",                           "Create a Google Ads campaign in AdFi first"],
      ["Instagram bio",   "Paste in the link in bio field",                               "Use a descriptive link name like 'Instagram Bio'"],
      ["Facebook post",   "Paste the short URL directly into your post",                  "Organic campaign recommended"],
      ["Email newsletter","Use as a hyperlink on a button or text",                        "Set utm_content to the email name"],
      ["Blog article",    "Link naturally within your content",                           "One link per article so you can compare performance"],
      ["YouTube description", "Paste in the video description",                          "Use utm_content with the video title"],
      ["Twitter / X",     "Paste directly — the short URL saves characters",              "Short URLs won't be expanded by Twitter"],
      ["WhatsApp / SMS",  "Paste the short URL and send",                                 "Organic campaign works well here"],
    ]
  ),
  spacer(0, 200),
  callout("Always use a different link for each placement so you can see exactly which source drives the most conversions.", "tip"),
  pageBreak(),
];

// ─── SECTION 9: Clicks & Conversions ─────────────────────────────────────────
const s9 = [
  h1("9. Tracking Clicks & Conversions"),
  h2("How clicks are tracked"),
  para("Every time someone clicks your short link, AdFi records:"),
  bullet("The exact time of the click"),
  bullet("Whether they were on mobile or desktop"),
  bullet("Where they came from (referrer — e.g. Instagram, Google, a blog)"),
  bullet("Their general location (country, if available)"),
  spacer(0, 160),
  para("You can see the total clicks for each link in the Affiliate Links table."),
  spacer(0, 200),
  h2("How conversions are tracked"),
  para("A conversion is when someone clicks your link AND then completes a purchase or sign-up. There are two ways this gets recorded:"),
  spacer(0, 160),
  h3("Option A — Postback URL (Recommended)"),
  para("If you are working with an affiliate network (like Impact, Awin, ShareASale, etc.), they will fire a conversion notification automatically when a sale happens. You just give them your postback URL from the Settings page."),
  callout("See Section 12 (Settings) to find your postback URL.", "info"),
  spacer(0, 160),
  h3("Option B — Manual"),
  para("If you track sales yourself, you can record conversions manually through the API (ask your developer)."),
  spacer(0, 200),
  h2("Where to see conversions"),
  bullet("Dashboard overview cards — total conversions and conversion rate"),
  bullet("Affiliate Links table — conversions column per link"),
  bullet("Campaign detail page — conversions per link within that campaign"),
  bullet("Reports page — daily conversion chart over time"),
  pageBreak(),
];

// ─── SECTION 10: Reports ─────────────────────────────────────────────────────
const s10 = [
  h1("10. Viewing Reports"),
  para("The Reports page gives you a detailed breakdown of your performance over time. Click 'Reports' in the sidebar."),
  spacer(0, 200),
  ...uiMockup([
    "  ┌────────────────────────────────────────────────────────────┐  ",
    "  │  Reports                                                   │  ",
    "  │                                                            │  ",
    "  │  [ 7D ]  [ 30D ]  [ 90D ]              [ Export CSV ]     │  ",
    "  │                                                            │  ",
    "  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │  ",
    "  │  │1,240 │ │  48  │ │£2,160│ │ £420 │ │5.14x │           │  ",
    "  │  │Click │ │Conv. │ │Rev.  │ │Spend │ │ROAS  │           │  ",
    "  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │  ",
    "  │                                                            │  ",
    "  │  ┌──────────────────────┐  ┌───────────────────────────┐  │  ",
    "  │  │ Clicks & Conversions │  │   Revenue vs Spend        │  │  ",
    "  │  │  █                   │  │          ╱                 │  │  ",
    "  │  │  █  █               │  │        ╱                   │  │  ",
    "  │  │  █  █  █  █        │  │      ╱──────               │  │  ",
    "  │  └──────────────────────┘  └───────────────────────────┘  │  ",
    "  └────────────────────────────────────────────────────────────┘  ",
  ]),
  spacer(200),
  h2("Date range"),
  para("Use the date range buttons to choose your time window:"),
  bullet("7D  — last 7 days (good for spotting recent trends)"),
  bullet("30D — last 30 days (default, good for monthly reviews)"),
  bullet("90D — last 90 days (good for quarterly planning)"),
  spacer(0, 200),
  h2("Summary cards"),
  simpleTable(
    ["Card", "What it means"],
    [
      ["Clicks",      "Total clicks across all links in the period"],
      ["Conversions", "Total completed sales or sign-ups"],
      ["Revenue",     "Total money earned from conversions"],
      ["Ad Spend",    "Total money spent on ads (synced from Google Ads if connected)"],
      ["ROAS",        "Return on Ad Spend. A ROAS of 3.0x means £3 earned for every £1 spent"],
    ]
  ),
  spacer(0, 200),
  h2("Exporting to CSV"),
  ...numberedStep(1, "Go to Reports"),
  ...numberedStep(2, "Select your date range"),
  ...numberedStep(3, "Click 'Export CSV' (top right)"),
  para("   A file named adfi-report-30d.csv is downloaded. Open it in Excel or Google Sheets."),
  spacer(0, 200),
  callout("ROAS of less than 1x means you are spending more on ads than you earn back. A healthy ROAS depends on your margin — typically aim for 3x or higher.", "warning"),
  pageBreak(),
];

// ─── SECTION 11: Google Ads ───────────────────────────────────────────────────
const s11 = [
  h1("11. Connecting Google Ads"),
  para("Connecting Google Ads lets AdFi create and manage campaigns directly in your Google Ads account. You do not need to log into Google Ads separately."),
  spacer(0, 200),
  h2("What you need"),
  bullet("A Google Ads account (ads.google.com)"),
  bullet("Your Google Ads Customer ID (format: 123-456-7890)"),
  bullet("A Google Ads Developer Token (one-time setup — see below)"),
  spacer(0, 200),
  h2("Finding your Customer ID"),
  ...numberedStep(1, "Log into ads.google.com"),
  ...numberedStep(2, "Look at the top-right corner of the screen"),
  ...numberedStep(3, "You will see a number like: 123-456-7890"),
  ...numberedStep(4, "Copy this number"),
  spacer(0, 200),
  h2("Getting a Developer Token"),
  para("The developer token is a one-time setup that allows AdFi to connect to your Google Ads account via the API."),
  ...numberedStep(1, "In Google Ads, click the wrench icon (Tools) → API Center"),
  ...numberedStep(2, "Apply for a developer token (takes 1–2 business days to approve)"),
  ...numberedStep(3, "Once approved, copy the token"),
  callout("For testing and small accounts, a Basic Access developer token is sufficient.", "info"),
  spacer(0, 200),
  h2("Entering your details in AdFi"),
  ...numberedStep(1, "Click 'Settings' in the sidebar"),
  ...numberedStep(2, "Find the 'Google Ads Integration' section"),
  ...numberedStep(3, "Paste your Customer ID and Developer Token"),
  ...numberedStep(4, "Click 'Save Google Ads Settings'"),
  ...numberedStep(5, "The status badge changes to 'Connected' in green"),
  spacer(0, 200),
  ...uiMockup([
    "  ┌──────────────────────────────────────────────────────────┐  ",
    "  │  Google Ads Integration              ✅ Connected        │  ",
    "  │                                                          │  ",
    "  │  Google Ads Customer ID                                  │  ",
    "  │  [ 123-456-7890                                        ] │  ",
    "  │  Found in Google Ads → top-right menu                   │  ",
    "  │                                                          │  ",
    "  │  Developer Token                                         │  ",
    "  │  [ ••••••••••••••••••••••••••••••                     ] │  ",
    "  │                                                          │  ",
    "  │             [ Save Google Ads Settings ]                 │  ",
    "  └──────────────────────────────────────────────────────────┘  ",
  ]),
  pageBreak(),
];

// ─── SECTION 12: Settings & Postback ────────────────────────────────────────
const s12 = [
  h1("12. Settings & Postback URL"),
  h2("Settings page overview"),
  para("Click 'Settings' in the sidebar to manage your account and integrations."),
  simpleTable(
    ["Section", "What it does"],
    [
      ["Account",               "Shows your name and email address"],
      ["Google Ads Integration","Connect your Google Ads account (see Section 11)"],
      ["Postback / Tracking",   "Displays your unique postback URL for affiliate networks"],
    ]
  ),
  spacer(0, 200),
  h2("Postback URL"),
  para("The postback URL is how affiliate networks tell AdFi when a conversion (sale) happens. You copy this URL and paste it into your affiliate network's conversion settings."),
  spacer(0, 160),
  ...uiMockup([
    "  ┌──────────────────────────────────────────────────────────────────┐  ",
    "  │  Postback / Conversion Tracking                                  │  ",
    "  │                                                                  │  ",
    "  │  Postback URL                                                    │  ",
    "  │  https://yourdomain.com/api/postback                             │  ",
    "  │    ?cid={click_id}&revenue={revenue}&secret=YOUR_SECRET          │  ",
    "  │                                                                  │  ",
    "  │  Replace YOUR_SECRET with the value in your .env file           │  ",
    "  └──────────────────────────────────────────────────────────────────┘  ",
  ]),
  spacer(200),
  h2("How to set up a postback with your affiliate network"),
  ...numberedStep(1, "Go to Settings in AdFi → copy the Postback URL"),
  ...numberedStep(2, "Log into your affiliate network (e.g. Awin, Impact, ShareASale)"),
  ...numberedStep(3, "Find the 'Postback URL' or 'Server-to-server tracking' setting"),
  ...numberedStep(4, "Paste the URL — replace {click_id} and {revenue} with the network's macros"),
  ...numberedStep(5, "Save in the network — from now on, every sale fires automatically to AdFi"),
  callout("Each affiliate network uses different macro names. For example, Impact uses {order_id} for click ID. Ask your network's support team if you're unsure which macros to use.", "warning"),
  pageBreak(),
];

// ─── SECTION 13: Glossary ────────────────────────────────────────────────────
const s13 = [
  h1("13. Glossary"),
  simpleTable(
    ["Term", "Plain English definition"],
    [
      ["Affiliate Link",    "A trackable URL that records who clicked it and whether they converted"],
      ["Campaign",          "A group of links organised around a shared goal or promotion"],
      ["Channel",           "The advertising platform — Google Ads, Meta, TikTok, Email, or Organic"],
      ["Click",             "When someone taps or clicks your affiliate link"],
      ["Conversion",        "When a click leads to a desired action (purchase, sign-up, download)"],
      ["Conversion Rate",   "Percentage of clicks that become conversions. Formula: (Conversions ÷ Clicks) × 100"],
      ["Customer ID",       "Your unique Google Ads account number (format: 123-456-7890)"],
      ["Developer Token",   "A code from Google that allows third-party tools to connect to Google Ads"],
      ["Organic",           "Traffic that comes without paying for ads — social media, blogs, word of mouth"],
      ["Postback URL",      "A URL your affiliate network calls when a conversion happens — fully automatic"],
      ["ROAS",              "Return on Ad Spend. Revenue ÷ Spend. A ROAS of 3x means £3 earned per £1 spent"],
      ["Referrer",          "The website or app that sent a visitor to your link (e.g. Google, Instagram)"],
      ["Short URL",         "The compact link AdFi creates — e.g. https://yourdomain.com/go/aB3xP9zQ"],
      ["UTM Parameters",    "Hidden labels in a URL that track the source, medium, and campaign of traffic"],
    ]
  ),
  pageBreak(),
];

// ─── SECTION 14: FAQ ─────────────────────────────────────────────────────────
const s14 = [
  h1("14. Frequently Asked Questions"),

  h3("Do I need a Google Ads account to use AdFi?"),
  para("No. Google Ads is optional. You can create Organic campaigns and track affiliate links without any Google Ads connection. You only need Google Ads if you want to create and manage paid search campaigns."),

  divider(),
  h3("Will my visitors notice the short link redirect?"),
  para("No. The redirect happens in milliseconds — users are sent straight to your destination page. They see your normal website URL in the browser address bar after the redirect."),

  divider(),
  h3("What if someone clicks my link but doesn't buy right away?"),
  para("AdFi records the click. If a conversion happens later and your affiliate network fires a postback, AdFi can still attribute it to the original click using the click ID. The time window depends on your network's settings (usually 7–30 days)."),

  divider(),
  h3("Can I use the same short link in multiple places?"),
  para("Technically yes, but we recommend creating a separate link for each placement. That way you can see exactly which source — your Instagram bio, your email newsletter, or your blog post — is driving the most conversions."),

  divider(),
  h3("How do I know if my postback is working?"),
  para("After setting up the postback URL in your affiliate network, ask them to send a test conversion. Then check your Affiliate Links table — the conversions count should go up and the revenue should increase."),

  divider(),
  h3("Can I have multiple users?"),
  para("Currently AdFi is single-user per Google account. Each person who signs in with their own Google account gets their own isolated workspace."),

  divider(),
  h3("What happens to my data if I stop using AdFi?"),
  para("All your data (campaigns, links, click events, conversions) is stored in your database. Nothing is deleted unless you explicitly remove it."),

  divider(),
  h3("Can I export all my data?"),
  para("Yes — use the Export CSV button on the Reports page to download your performance data. For full database exports, contact your administrator."),

  divider(),
  new Paragraph({ spacing: { before: 400 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "AdFi User Guide  ·  v1.0  ·  Confidential", size: 18, color: C.gray500, italics: true, font: "Calibri" })],
  }),
];

// ─── Assemble & Export ───────────────────────────────────────────────────────
const doc = new Document({
  creator: "AdFi Platform",
  title: "AdFi User Guide",
  description: "Step-by-step user guide for the AdFi affiliate marketing platform",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
      heading1: { run: { font: "Calibri", size: 40, bold: true, color: C.gray900 } },
      heading2: { run: { font: "Calibri", size: 28, bold: true, color: C.primary } },
      heading3: { run: { font: "Calibri", size: 24, bold: true, color: C.gray700 } },
    },
  },
  sections: [
    {
      children: [
        ...cover,
        ...toc,
        ...s1,
        ...s2,
        ...s3,
        ...s4,
        ...s5,
        ...s6,
        ...s7,
        ...s8,
        ...s9,
        ...s10,
        ...s11,
        ...s12,
        ...s13,
        ...s14,
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("AdFi-User-Guide.docx", buffer);
console.log("✅  AdFi-User-Guide.docx generated successfully.");
