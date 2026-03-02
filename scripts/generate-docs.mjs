import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, ExternalHyperlink, UnderlineType, TabStopType, TabStopPosition,
} from "docx";
import { writeFileSync } from "fs";

// ─── Helpers ────────────────────────────────────────────────────────────────

const COLORS = {
  primary:   "2563EB", // blue-600
  emerald:   "059669", // emerald-600
  muted:     "6B7280", // gray-500
  heading:   "111827", // gray-900
  accent:    "7C3AED", // purple-600
  rowAlt:    "F9FAFB", // gray-50
  headerBg:  "EFF6FF", // blue-50
  orgBg:     "ECFDF5", // emerald-50
  border:    "E5E7EB", // gray-200
};

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    run: { color: COLORS.heading, bold: true },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, color: opts.color ?? "374151", ...opts })],
    alignment: opts.alignment,
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    text,
    bullet: { level },
    spacing: { after: 80 },
    run: { size: 22, color: "374151" },
  });
}

function code(text) {
  return new Paragraph({
    spacing: { after: 80 },
    shading: { type: ShadingType.SOLID, color: "F3F4F6" },
    children: [
      new TextRun({
        text: `  ${text}`,
        font: "Courier New",
        size: 18,
        color: "1F2937",
      }),
    ],
  });
}

function divider() {
  return new Paragraph({
    text: "─".repeat(80),
    spacing: { before: 200, after: 200 },
    run: { color: COLORS.border, size: 16 },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function label(text, color = COLORS.primary) {
  return new TextRun({ text, bold: true, color, size: 22 });
}

function sectionTag(text, bg = COLORS.headerBg, color = COLORS.primary) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    shading: { type: ShadingType.SOLID, color: bg },
    children: [
      new TextRun({ text: `  ${text}  `, bold: true, color, size: 20 }),
    ],
  });
}

// ─── Simple ASCII diagram renderer as code blocks ─────────────────────────

function asciiBox(lines, color = "1F2937") {
  return lines.map((l) =>
    new Paragraph({
      shading: { type: ShadingType.SOLID, color: "1E293B" },
      children: [new TextRun({ text: l, font: "Courier New", size: 18, color: "F1F5F9" })],
    })
  );
}

// ─── Table builder ──────────────────────────────────────────────────────────

function dataTable(headers, rows) {
  const borderDef = {
    top:    { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    left:   { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    right:  { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) =>
      new TableCell({
        shading: { type: ShadingType.SOLID, color: COLORS.headerBg },
        borders: borderDef,
        children: [
          new Paragraph({
            children: [new TextRun({ text: h, bold: true, color: COLORS.primary, size: 20 })],
          }),
        ],
      })
    ),
  });

  const dataRows = rows.map((row, i) =>
    new TableRow({
      children: row.map((cell) =>
        new TableCell({
          shading: {
            type: ShadingType.SOLID,
            color: i % 2 === 0 ? "FFFFFF" : COLORS.rowAlt,
          },
          borders: borderDef,
          children: [
            new Paragraph({
              children: [new TextRun({ text: cell, size: 20, color: "374151" })],
            }),
          ],
        })
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ─── Document sections ──────────────────────────────────────────────────────

const coverPage = [
  new Paragraph({ spacing: { before: 1200 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "AdFi", bold: true, size: 72, color: COLORS.primary })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Affiliate Marketing Platform", size: 36, color: COLORS.muted })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: "Technical & Product Documentation", size: 26, color: COLORS.muted })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Built with Next.js 14 · TypeScript · PostgreSQL · Google Ads API", size: 20, color: COLORS.muted, italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
    children: [new TextRun({ text: `Version 1.0  ·  ${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`, size: 18, color: COLORS.muted })],
  }),
  pageBreak(),
];

const tocSection = [
  h1("Table of Contents"),
  body("1.  Overview & Purpose"),
  body("2.  System Architecture"),
  body("3.  Technology Stack"),
  body("4.  Database Schema"),
  body("5.  User Journey & Authentication"),
  body("6.  Google Ads Integration"),
  body("7.  Affiliate Link Engine"),
  body("8.  Organic Traffic Tracking"),
  body("9.  Conversion & Postback System"),
  body("10. Reporting & Analytics"),
  body("11. API Reference"),
  body("12. Deployment Guide"),
  body("13. Environment Variables"),
  pageBreak(),
];

const overviewSection = [
  h1("1. Overview & Purpose"),
  body(
    "AdFi is a full-stack affiliate marketing platform built to simplify Google Ads campaign management and multi-channel affiliate tracking for clients who lack deep technical expertise. Instead of navigating Google Ads directly or manually injecting UTM parameters, the client uses a single clean dashboard."
  ),
  new Paragraph({ spacing: { after: 160 } }),
  h2("Core Problems Solved"),
  bullet("Google Ads UI is complex — AdFi provides a simplified campaign creation and management layer"),
  bullet("UTM tracking is error-prone — AdFi auto-injects UTM parameters into every affiliate link"),
  bullet("Conversion attribution is fragmented — AdFi unifies click tracking and conversion postbacks"),
  bullet("Organic traffic is invisible — AdFi tracks referrer sources and device splits for organic campaigns"),
  bullet("Reporting requires multiple tools — AdFi provides a single dashboard with charts and CSV export"),
  new Paragraph({ spacing: { after: 160 } }),
  h2("Who Uses It"),
  dataTable(
    ["Role", "What They Do"],
    [
      ["Client / Advertiser", "Creates campaigns, generates affiliate links, views reports"],
      ["Affiliate Networks", "Fire conversions via postback URL"],
      ["Google Ads", "Receives campaign data via API; syncs status changes"],
    ]
  ),
  pageBreak(),
];

const architectureSection = [
  h1("2. System Architecture"),
  body("AdFi is a monolithic Next.js 14 app using the App Router. The frontend, API routes, and server-side rendering all live in one codebase, deployed to Vercel. The database is PostgreSQL hosted on Railway or Supabase."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("High-Level Architecture Diagram"),
  ...asciiBox([
    "                                                                    ",
    "   ┌──────────────────────────────────────────────────────────┐    ",
    "   │                     BROWSER / CLIENT                     │    ",
    "   │   Dashboard  ·  Campaigns  ·  Links  ·  Reports          │    ",
    "   └──────────────────────────┬───────────────────────────────┘    ",
    "                              │  HTTPS                             ",
    "   ┌──────────────────────────▼───────────────────────────────┐    ",
    "   │             NEXT.JS 14 APP  (Vercel Edge)                │    ",
    "   │                                                           │    ",
    "   │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │    ",
    "   │  │  App Router │  │  API Routes  │  │  Middleware    │  │    ",
    "   │  │  (RSC/SSR)  │  │  /api/*      │  │  /go/:code     │  │    ",
    "   │  └─────────────┘  └──────┬───────┘  └────────────────┘  │    ",
    "   └─────────────────────────┬┴──────────────────────────────┘    ",
    "                    ┌────────┴────────┐                            ",
    "          ┌─────────▼──┐         ┌────▼──────────┐                ",
    "          │ PostgreSQL  │         │ Google Ads API │                ",
    "          │ (Prisma)   │         │ (OAuth2)       │                ",
    "          └────────────┘         └───────────────┘                ",
    "                                                                    ",
    "   ┌──────────────────────────────────────────────────────────┐    ",
    "   │         AFFILIATE NETWORK  (external)                    │    ",
    "   │  POST /api/postback?cid={click_id}&revenue={value}       │    ",
    "   └──────────────────────────────────────────────────────────┘    ",
    "                                                                    ",
  ]),
  new Paragraph({ spacing: { after: 240 } }),
  h2("Request Flow — Click Tracking"),
  ...asciiBox([
    "                                                                  ",
    "  User clicks short link  →  /go/abc123                          ",
    "           │                                                      ",
    "           ▼                                                      ",
    "  Next.js Middleware  (edge, sub-ms)                              ",
    "  Rewrites to  →  /api/track/abc123                              ",
    "           │                                                      ",
    "           ▼                                                      ",
    "  API Route: /api/track/[shortCode]                               ",
    "    1. Look up AffiliateLink by shortCode                         ",
    "    2. Extract IP, UserAgent, Referrer from headers               ",
    "    3. Detect device type (mobile / desktop)                      ",
    "    4. Create ClickEvent in DB  (async, non-blocking)             ",
    "    5. Increment link.clicks counter                              ",
    "    6. Build destination URL with UTM params                      ",
    "    7. HTTP 302 redirect → destination                            ",
    "           │                                                      ",
    "           ▼                                                      ",
    "  User lands on advertiser's site                                 ",
    "  URL contains: ?utm_source=organic&utm_medium=organic&...        ",
    "                                                                  ",
  ]),
  pageBreak(),
];

const stackSection = [
  h1("3. Technology Stack"),
  body("Every technology choice was made to minimise operational complexity while maximising developer velocity."),
  new Paragraph({ spacing: { after: 160 } }),
  dataTable(
    ["Layer", "Technology", "Why"],
    [
      ["Frontend",        "Next.js 14 (App Router)",    "Co-located API, SSR, React Server Components"],
      ["Styling",         "Tailwind CSS + shadcn/ui",   "Utility-first, consistent, no design system overhead"],
      ["Language",        "TypeScript (strict)",         "End-to-end type safety from DB schema to UI"],
      ["Database",        "PostgreSQL via Prisma ORM",  "Relational data, type-safe queries, easy migrations"],
      ["Auth",            "NextAuth.js",                 "Google OAuth2 built-in, session management"],
      ["Google Ads",      "google-ads-api (npm)",        "Official API wrapper with TypeScript support"],
      ["Link Redirects",  "Next.js Middleware (Edge)",   "Runs at CDN edge — sub-millisecond redirects"],
      ["Hosting (app)",   "Vercel",                      "Zero-config Next.js deployment, edge network"],
      ["Hosting (DB)",    "Railway / Supabase",          "Managed PostgreSQL, no ops needed"],
    ]
  ),
  pageBreak(),
];

const schemaSection = [
  h1("4. Database Schema"),
  body("The schema is defined in prisma/schema.prisma. All tables are connected through userId to ensure multi-tenant isolation — each user can only see their own data."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Entity Relationship Diagram"),
  ...asciiBox([
    "                                                                        ",
    "  ┌──────────────┐        ┌──────────────────┐                          ",
    "  │    User      │ 1────* │   Campaign        │                          ",
    "  │──────────────│        │──────────────────│                          ",
    "  │ id           │        │ id               │                          ",
    "  │ email        │        │ userId (FK)       │                          ",
    "  │ name         │        │ name             │                          ",
    "  │ googleAdsId  │        │ channelType      │ GOOGLE|META|TIKTOK|      ",
    "  │ refreshToken │        │ status           │ EMAIL|ORGANIC            ",
    "  └──────────────┘        │ budget           │                          ",
    "         │                │ externalId       │ ← Google Ads campaign ID ",
    "         │                └────────┬─────────┘                          ",
    "         │                         │                                     ",
    "         │ 1                       │ 1                                   ",
    "         │                         │                                     ",
    "         * ┌────────────────────── ▼ ─────────────────────────────┐     ",
    "           │              AffiliateLink                            │     ",
    "           │───────────────────────────────────────────────────── │     ",
    "           │ id           shortCode        utmSource              │     ",
    "           │ userId (FK)  destinationUrl   utmMedium              │     ",
    "           │ campaignId   clicks           utmCampaign            │     ",
    "           │ name         conversions      utmContent             │     ",
    "           │              revenue          isActive               │     ",
    "           └────────────────┬──────────────────────────────────── ┘     ",
    "                    ┌───────┴──────────┐                                 ",
    "                    │                  │                                  ",
    "          ┌─────────▼────┐    ┌────────▼──────────┐                     ",
    "          │  ClickEvent  │    │  ConversionEvent   │                     ",
    "          │──────────────│    │───────────────────│                     ",
    "          │ id           │    │ id                │                     ",
    "          │ linkId (FK)  │ 1* │ linkId (FK)       │                     ",
    "          │ ip           │────│ clickId (FK)      │                     ",
    "          │ userAgent    │    │ value             │                     ",
    "          │ referrer     │    │ currency          │                     ",
    "          │ device       │    │ source            │ POSTBACK|PIXEL       ",
    "          │ timestamp    │    │ timestamp         │                     ",
    "          └──────────────┘    └───────────────────┘                     ",
    "                                                                        ",
  ]),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Enums"),
  dataTable(
    ["Enum", "Values"],
    [
      ["ChannelType",       "GOOGLE · META · TIKTOK · EMAIL · ORGANIC"],
      ["CampaignStatus",    "DRAFT · ACTIVE · PAUSED · ENDED · ARCHIVED"],
      ["ConversionSource",  "POSTBACK · PIXEL · MANUAL"],
    ]
  ),
  pageBreak(),
];

const authSection = [
  h1("5. User Journey & Authentication"),
  body("Authentication is handled by NextAuth.js using Google OAuth2. The flow requests the Google Ads scope so the refresh token stored in the DB can be used to call the Google Ads API on behalf of the user — without storing credentials manually."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Authentication Flow"),
  ...asciiBox([
    "                                                                     ",
    "  1. User visits /login                                              ",
    "     └─ Clicks 'Continue with Google'                               ",
    "                                                                     ",
    "  2. NextAuth redirects to Google OAuth2                            ",
    "     Scopes requested:                                               ",
    "       · openid · email · profile                                    ",
    "       · https://www.googleapis.com/auth/adwords  ← Ads scope       ",
    "                                                                     ",
    "  3. Google returns auth code → NextAuth exchanges for tokens        ",
    "     · access_token   (short-lived, for current session)             ",
    "     · refresh_token  (long-lived, stored in User.googleRefreshToken)",
    "                                                                     ",
    "  4. NextAuth creates/updates User + Account rows in DB             ",
    "     signIn() callback also saves refresh_token to User table        ",
    "                                                                     ",
    "  5. Session cookie set → user redirected to /dashboard             ",
    "                                                                     ",
    "  6. Future API calls use stored refresh_token to get              ",
    "     fresh access tokens for Google Ads API calls                   ",
    "                                                                     ",
  ]),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Route Protection"),
  body("src/middleware.ts runs on every request at the Edge. It:"),
  bullet("Allows public paths: /login, /api/auth/*, /api/track/*, /api/postback, /go/*"),
  bullet("For all other paths, checks the NextAuth JWT session token"),
  bullet("Redirects unauthenticated users to /login"),
  body("The /go/:shortCode redirect is handled in the same middleware by rewriting to /api/track/:shortCode with click metadata forwarded as query params."),
  pageBreak(),
];

const googleAdsSection = [
  h1("6. Google Ads Integration"),
  body("The integration lives in src/lib/google-ads/. It uses the google-ads-api npm package which wraps the Google Ads REST/gRPC API. All API calls are authenticated with the user's stored OAuth2 refresh token — the platform never asks the client for an API key."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Setup Requirements"),
  dataTable(
    ["Requirement", "Where to Get It"],
    [
      ["Google Cloud Project",    "console.cloud.google.com → New Project"],
      ["OAuth2 Client ID + Secret", "APIs & Services → Credentials → OAuth 2.0 Client"],
      ["Google Ads Developer Token", "ads.google.com → Tools → API Center"],
      ["Customer ID",             "Top-right in Google Ads UI (format: 123-456-7890)"],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2("What the Platform Can Do via Google Ads API"),
  dataTable(
    ["Action", "API Operation", "File"],
    [
      ["List campaigns",    "customer.query(GAQL)",              "src/lib/google-ads/campaigns.ts"],
      ["Create campaign",   "campaignBudgets.create + campaigns.create", "src/lib/google-ads/campaigns.ts"],
      ["Pause campaign",    "campaigns.update (status=PAUSED)",  "src/lib/google-ads/campaigns.ts"],
      ["Enable campaign",   "campaigns.update (status=ENABLED)", "src/lib/google-ads/campaigns.ts"],
      ["Fetch metrics",     "customer.query with segments.date", "src/lib/google-ads/campaigns.ts"],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Campaign Creation Flow"),
  ...asciiBox([
    "                                                                     ",
    "  Client fills 'New Campaign' dialog                                 ",
    "    name, channel=GOOGLE, budget=$50/day                             ",
    "           │                                                         ",
    "           ▼                                                         ",
    "  POST /api/campaigns                                                ",
    "    1. Validate request body (Zod schema)                           ",
    "    2. If pushToGoogleAds=true AND user has googleAdsCustomerId:     ",
    "         a. Call campaignBudgets.create($50/day budget resource)     ",
    "         b. Call campaigns.create(name, budget ref, status=PAUSED)  ",
    "         c. Store returned externalId in Campaign.externalId        ",
    "    3. Save Campaign row to PostgreSQL                               ",
    "    4. Return 201 Created                                            ",
    "           │                                                         ",
    "           ▼                                                         ",
    "  Dashboard refreshes — campaign appears in table                   ",
    "  Status shows PAUSED (safe default — client enables manually)      ",
    "                                                                     ",
  ]),
  pageBreak(),
];

const trackingSection = [
  h1("7. Affiliate Link Engine"),
  body("The affiliate link engine handles short URL generation, UTM parameter injection, and click/conversion recording. It lives in src/lib/tracking/links.ts."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Link Creation"),
  ...asciiBox([
    "                                                                     ",
    "  Client fills 'New Link' dialog                                     ",
    "    name='Homepage Banner'                                           ",
    "    destinationUrl='https://client-site.com/product'                 ",
    "    campaign=Summer Sale (GOOGLE)                                    ",
    "    utmSource='adfi'  utmMedium='affiliate'                          ",
    "           │                                                         ",
    "           ▼                                                         ",
    "  POST /api/links                                                    ",
    "    1. nanoid(8) generates unique shortCode, e.g. 'aB3xP9zQ'       ",
    "    2. AffiliateLink row saved to DB                                 ",
    "    3. Short URL returned:                                           ",
    "       https://yourdomain.com/go/aB3xP9zQ                           ",
    "                                                                     ",
  ]),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Short URL Redirect Flow (Edge Speed)"),
  ...asciiBox([
    "                                                                     ",
    "  Browser → GET https://yourdomain.com/go/aB3xP9zQ                  ",
    "           │                                                         ",
    "           ▼                                                         ",
    "  Next.js Middleware (Vercel Edge Node)                             ",
    "  Pattern: /go/* → rewrite to /api/track/aB3xP9zQ                  ",
    "  Attaches headers: ip, user-agent, referer as query params         ",
    "           │                                                         ",
    "           ▼                                                         ",
    "  /api/track/[shortCode]  route handler                             ",
    "  1. DB lookup: AffiliateLink WHERE shortCode=aB3xP9zQ              ",
    "  2. Detect device: /mobile|iphone|android/i.test(userAgent)        ",
    "  3. recordClick() — fires async (non-blocking):                    ",
    "       · INSERT ClickEvent (ip, ua, referrer, device, timestamp)    ",
    "       · UPDATE AffiliateLink SET clicks = clicks + 1               ",
    "  4. buildTrackingUrl() — appends UTM params to destinationUrl:     ",
    "       https://client-site.com/product                               ",
    "         ?utm_source=adfi                                            ",
    "         &utm_medium=affiliate                                       ",
    "         &utm_campaign=summer-sale                                   ",
    "  5. HTTP 302 → final URL                                           ",
    "                                                                     ",
    "  Total redirect latency: ~5–15ms (edge execution, async DB write)  ",
    "                                                                     ",
  ]),
  pageBreak(),
];

const organicSection = [
  h1("8. Organic Traffic Tracking"),
  sectionTag("  Organic traffic is tracked at the same depth as paid ads — for free.  ", COLORS.orgBg, COLORS.emerald),
  new Paragraph({ spacing: { after: 160 } }),
  body("Organic campaigns are a first-class channel type in AdFi. Unlike paid channels (Google, Meta), organic campaigns have no ad spend. Instead they track where natural traffic comes from — social posts, blog links, influencer mentions, etc."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("How Organic Differs in the UI"),
  dataTable(
    ["Feature", "Paid Campaigns", "Organic Campaigns"],
    [
      ["Row colour in table",   "White",                "Soft green (bg-emerald-50)"],
      ["Channel pill",          "Blue/pink/indigo badge", "Green badge with 🌿 leaf icon + ring outline"],
      ["Budget column",         "Shows $/day",          "Shows 'Free' in green"],
      ["Campaign name",         "Plain text",           "Leaf icon prefix"],
      ["UTM auto-fill (links)", "utm_medium=affiliate", "utm_medium=organic, utm_source=organic"],
      ["Link dialog hint",      "None",                 "Green info banner explains auto-fill"],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Organic Insights Card (Dashboard)"),
  body("A dedicated card appears on the dashboard showing organic-only data for the last 30 days:"),
  bullet("Total clicks, conversions, and revenue from organic campaigns"),
  bullet("Top referrer sources — parsed from browser Referer headers into readable names (Google Search, Facebook, Instagram, X/Twitter, Reddit, Direct/None, etc.)"),
  bullet("Horizontal bar chart showing volume per source"),
  bullet("Device split: mobile vs desktop click counts"),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Referrer Parsing Logic"),
  ...asciiBox([
    "  ClickEvent.referrer = 'https://www.google.com/search?q=...'        ",
    "           │                                                          ",
    "           ▼  parseReferrer()                                         ",
    "  new URL(referrer).hostname → 'www.google.com'                      ",
    "  strip 'www.' → 'google.com'                                        ",
    "  match 'google' → return 'Google Search'                            ",
    "                                                                      ",
    "  Rules (in order):                                                   ",
    "  google.*          → Google Search                                   ",
    "  facebook|fb.com   → Facebook                                        ",
    "  instagram.*       → Instagram                                       ",
    "  twitter|x.com     → X / Twitter                                     ",
    "  linkedin.*        → LinkedIn                                        ",
    "  tiktok.*          → TikTok                                          ",
    "  youtube.*         → YouTube                                         ",
    "  reddit.*          → Reddit                                          ",
    "  null / error      → Direct / None                                   ",
    "  anything else     → raw hostname                                    ",
    "                                                                      ",
  ]),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Organic API Endpoint"),
  body("GET /api/analytics/organic?days=30"),
  code("Response:"),
  code("{"),
  code("  totalClicks: 142,"),
  code("  totalConversions: 12,"),
  code("  totalRevenue: 360.00,"),
  code("  referrers: ["),
  code("    { source: 'Google Search', count: 78 },"),
  code("    { source: 'Instagram',     count: 31 },"),
  code("    { source: 'Direct / None', count: 22 },"),
  code("    { source: 'Reddit',        count: 11 }"),
  code("  ],"),
  code("  devices: ["),
  code("    { device: 'mobile',  count: 98 },"),
  code("    { device: 'desktop', count: 44 }"),
  code("  ]"),
  code("}"),
  pageBreak(),
];

const postbackSection = [
  h1("9. Conversion & Postback System"),
  body("Conversions can be recorded in two ways: server-side postback (recommended) or manually. The postback system is how affiliate networks notify AdFi that a sale happened."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Postback Flow"),
  ...asciiBox([
    "                                                                      ",
    "  1. User clicks affiliate link → ClickEvent created (id=CLICK_ID)  ",
    "                                                                      ",
    "  2. AdFi redirects user to advertiser site with UTM params          ",
    "                                                                      ",
    "  3. User buys product → affiliate network detects conversion        ",
    "                                                                      ",
    "  4. Network fires postback (server-to-server):                      ",
    "     GET /api/postback                                               ",
    "       ?cid=CLICK_ID                                                  ",
    "       &revenue=49.99                                                 ",
    "       &currency=USD                                                  ",
    "       &secret=YOUR_POSTBACK_SECRET                                  ",
    "                                                                      ",
    "  5. AdFi /api/postback handler:                                    ",
    "     a. Verify secret matches POSTBACK_SECRET env var               ",
    "     b. Look up ClickEvent by id=cid                                 ",
    "     c. INSERT ConversionEvent (linkId, clickId, value=49.99)       ",
    "     d. UPDATE AffiliateLink SET                                     ",
    "          conversions = conversions + 1                              ",
    "          revenue = revenue + 49.99                                  ",
    "     e. Return 200 { ok: true }                                      ",
    "                                                                      ",
  ]),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Postback URL Format"),
  body("Give this URL to your affiliate network to paste as their conversion postback URL:"),
  code("https://yourdomain.com/api/postback?cid={CLICK_ID}&revenue={REVENUE}&currency=USD&secret=YOUR_SECRET"),
  body("Replace {CLICK_ID} and {REVENUE} with the network's macro placeholders (e.g. {transaction_id}, {payout})."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Security"),
  bullet("POSTBACK_SECRET env var must match the secret query param — requests without it return 401"),
  bullet("The secret is set in your .env file and shared with the affiliate network only"),
  bullet("Both GET and POST methods are supported for network compatibility"),
  pageBreak(),
];

const reportingSection = [
  h1("10. Reporting & Analytics"),
  body("The reporting system aggregates click and conversion events into daily buckets and presents them as interactive charts with date-range filtering."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Analytics API — /api/analytics/overview"),
  ...asciiBox([
    "  GET /api/analytics/overview?days=30                               ",
    "                                                                     ",
    "  Queries:                                                           ",
    "  · ClickEvent   WHERE timestamp >= 30 days ago                     ",
    "  · ConversionEvent WHERE timestamp >= 30 days ago                  ",
    "  · CampaignMetric WHERE date >= 30 days ago  (Google Ads spend)    ",
    "                                                                     ",
    "  Groups into daily buckets using date-fns eachDayOfInterval        ",
    "                                                                     ",
    "  Returns:                                                           ",
    "  {                                                                  ",
    "    data: [                                                          ",
    "      { date:'Mar 1', clicks:42, conversions:3, revenue:89, spend:20}",
    "      { date:'Mar 2', clicks:55, conversions:5, revenue:140, spend:25}",
    "      ...                                                            ",
    "    ],                                                               ",
    "    totals: { clicks, conversions, revenue, spend, roas }           ",
    "  }                                                                  ",
    "                                                                     ",
  ]),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Dashboard Overview Chart"),
  body("An AreaChart (Recharts) plots clicks and revenue over the selected date range. Gradients fill under each line for visual depth. The chart fetches data client-side via the analytics API."),
  h2("Reports Page"),
  body("The /dashboard/reports page provides:"),
  dataTable(
    ["Feature", "Detail"],
    [
      ["Date range toggle",  "7D / 30D / 90D buttons switch the API query window"],
      ["Summary cards",      "Clicks · Conversions · Revenue · Ad Spend · ROAS"],
      ["Bar chart",          "Clicks vs Conversions per day (Recharts BarChart)"],
      ["Line chart",         "Revenue vs Spend per day (Recharts LineChart)"],
      ["CSV export",         "Downloads current data range as adfi-report-Xd.csv"],
    ]
  ),
  new Paragraph({ spacing: { after: 160 } }),
  h2("ROAS Calculation"),
  body("ROAS (Return on Ad Spend) = Revenue ÷ Spend. Calculated in src/lib/utils.ts:"),
  code("export function calcROAS(revenue: number, spend: number) {"),
  code("  if (spend === 0) return 0;"),
  code("  return revenue / spend;"),
  code("}"),
  body("A ROAS of 3.0x means for every $1 spent on ads, $3 in revenue was generated."),
  pageBreak(),
];

const apiSection = [
  h1("11. API Reference"),
  dataTable(
    ["Method", "Endpoint", "Auth", "Description"],
    [
      ["GET",   "/api/auth/[...nextauth]",       "—",    "NextAuth OAuth2 handler"],
      ["POST",  "/api/campaigns",                "Yes",  "Create campaign (optionally pushes to Google Ads)"],
      ["GET",   "/api/campaigns",                "Yes",  "List all campaigns for current user"],
      ["GET",   "/api/campaigns/:id",            "Yes",  "Campaign detail with links and metrics"],
      ["PATCH", "/api/campaigns/:id/status",     "Yes",  "Toggle ACTIVE / PAUSED (syncs Google Ads)"],
      ["DELETE","/api/campaigns/:id",            "Yes",  "Delete campaign"],
      ["POST",  "/api/links",                    "Yes",  "Create affiliate link"],
      ["GET",   "/api/links",                    "Yes",  "List all links"],
      ["PATCH", "/api/links/:id",                "Yes",  "Update link (e.g. isActive toggle)"],
      ["DELETE","/api/links/:id",                "Yes",  "Delete link"],
      ["GET",   "/go/:shortCode",                "—",    "Short link redirect (middleware)"],
      ["GET",   "/api/track/:shortCode",         "—",    "Records click and redirects"],
      ["GET",   "/api/postback",                 "Secret","Network postback (GET + POST supported)"],
      ["POST",  "/api/postback",                 "Secret","Network postback"],
      ["GET",   "/api/analytics/overview",       "Yes",  "Daily stats for last N days"],
      ["GET",   "/api/analytics/organic",        "Yes",  "Organic-only referrer + device breakdown"],
      ["GET",   "/api/google-ads/campaigns",     "Yes",  "Proxy: list campaigns from Google Ads"],
      ["PATCH", "/api/settings/google-ads",      "Yes",  "Save Customer ID and developer token"],
    ]
  ),
  pageBreak(),
];

const deploySection = [
  h1("12. Deployment Guide"),
  h2("Prerequisites"),
  bullet("Node.js 20.x"),
  bullet("PostgreSQL database (Railway, Supabase, or self-hosted)"),
  bullet("Google Cloud project with OAuth2 credentials"),
  bullet("Google Ads developer token"),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Step-by-Step"),
  body("Step 1 — Clone the repository and install dependencies:"),
  code("npm install"),
  body("Step 2 — Copy the environment template:"),
  code("cp .env.example .env"),
  body("Step 3 — Fill in all values in .env (see section 13)"),
  body("Step 4 — Run database migrations:"),
  code("npx prisma migrate dev --name init"),
  body("Step 5 — Start the development server:"),
  code("npm run dev"),
  body("Step 6 — For production on Vercel:"),
  code("vercel deploy"),
  body("Add all .env values as environment variables in the Vercel dashboard."),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Google Cloud OAuth2 Setup"),
  bullet("Go to console.cloud.google.com → Select your project"),
  bullet("APIs & Services → Credentials → Create OAuth 2.0 Client ID"),
  bullet("Application type: Web application"),
  bullet("Authorised redirect URIs: https://yourdomain.com/api/auth/callback/google"),
  bullet("Copy Client ID and Client Secret to .env"),
  new Paragraph({ spacing: { after: 200 } }),
  h2("First Login After Deploy"),
  bullet("Visit https://yourdomain.com → redirected to /login"),
  bullet("Click 'Continue with Google' → consent screen (includes Ads scope)"),
  bullet("Redirected to /dashboard or /onboarding wizard"),
  bullet("In Settings, enter your Google Ads Customer ID"),
  pageBreak(),
];

const envSection = [
  h1("13. Environment Variables"),
  dataTable(
    ["Variable", "Required", "Description"],
    [
      ["DATABASE_URL",                  "Yes", "PostgreSQL connection string"],
      ["NEXTAUTH_URL",                  "Yes", "Full URL of your app (e.g. http://localhost:3000)"],
      ["NEXTAUTH_SECRET",               "Yes", "Random secret — run: openssl rand -base64 32"],
      ["GOOGLE_CLIENT_ID",              "Yes", "OAuth2 Client ID from Google Cloud Console"],
      ["GOOGLE_CLIENT_SECRET",          "Yes", "OAuth2 Client Secret from Google Cloud Console"],
      ["GOOGLE_ADS_DEVELOPER_TOKEN",    "Yes", "From Google Ads API Center"],
      ["NEXT_PUBLIC_APP_URL",           "Yes", "Public URL (used in short link generation)"],
      ["POSTBACK_SECRET",               "Rec.", "Secret included in postback URLs for security"],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2("Generating Secrets"),
  code("# NEXTAUTH_SECRET"),
  code("openssl rand -base64 32"),
  code(""),
  code("# POSTBACK_SECRET"),
  code("openssl rand -base64 24"),
  new Paragraph({ spacing: { after: 400 } }),
  divider(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({ text: "AdFi Platform Documentation  ·  v1.0  ·  Confidential", size: 18, color: COLORS.muted, italics: true }),
    ],
  }),
];

// ─── Assemble & export ───────────────────────────────────────────────────────

const doc = new Document({
  creator: "AdFi Platform",
  title: "AdFi — Technical & Product Documentation",
  description: "Full documentation for the AdFi affiliate marketing platform",
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22 },
      },
      heading1: {
        run: { font: "Calibri", size: 36, bold: true, color: COLORS.heading },
      },
      heading2: {
        run: { font: "Calibri", size: 28, bold: true, color: COLORS.primary },
      },
      heading3: {
        run: { font: "Calibri", size: 24, bold: true, color: COLORS.muted },
      },
    },
  },
  sections: [
    {
      children: [
        ...coverPage,
        ...tocSection,
        ...overviewSection,
        ...architectureSection,
        ...stackSection,
        ...schemaSection,
        ...authSection,
        ...googleAdsSection,
        ...trackingSection,
        ...organicSection,
        ...postbackSection,
        ...reportingSection,
        ...apiSection,
        ...deploySection,
        ...envSection,
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("AdFi-Documentation.docx", buffer);
console.log("✅  AdFi-Documentation.docx generated successfully.");
