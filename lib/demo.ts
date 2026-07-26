import type { Campaign, NegotiationResult } from "./types";

// Shown when GEMINI_API_KEY is not configured, so the app is demoable offline.
export const DEMO_CAMPAIGN: Campaign = {
  demoMode: true,
  strategy: {
    projectedRaise: "₺180,000 – ₺260,000",
    positioning:
      "HackTheCity Istanbul is the cheapest access a brand will ever get to 600 young builders — sold as measurable activation and talent pipeline, not charity.",
    approach: [
      "Lead with telcos, banks, and dev-tool companies: they have standing youth-marketing and talent-brand budgets reviewed quarterly.",
      "Anchor every pitch on measurable outcomes — API sign-ups, promo redemptions, recruiting leads — never on 'supporting young people'.",
      "Open outreach 3–4 months before the event; follow up on day 3 and day 8 — most deals close on the second follow-up.",
    ],
  },
  tiers: [
    {
      name: "Title Sponsor",
      price: "₺90,000",
      benefits: [
        "Naming rights: 'HackTheCity Istanbul presented by —'",
        "Opening-ceremony keynote slot",
        "Logo on stage, swag, badges, and all digital assets",
        "Dedicated API prize track judged on the main stage",
        "First access to participant CVs (opt-in)",
      ],
    },
    {
      name: "Track Sponsor",
      price: "₺45,000",
      benefits: [
        "Branded challenge track with your prize",
        "Booth in the main hall for all 48 hours",
        "Workshop slot in the official program",
        "2 social features to the builder community",
      ],
    },
    {
      name: "Community Sponsor",
      price: "₺15,000",
      benefits: ["Logo on website and closing slides", "Swag-bag inserts and product sampling", "1 social feature"],
    },
  ],
  deck: {
    tagline: "600 builders. 48 hours. Your brand at the center of it.",
    aboutEvent:
      "HackTheCity Istanbul 2026 is a 48-hour civic-tech hackathon: 600 student developers and designers aged 16–24 from 40+ schools and universities, building products for the city with mentors from local tech companies.",
    audienceStats: [
      "600 builders from 40+ schools and universities",
      "Ages 16–24 — future engineers, founders, and first bank accounts",
      "15,000+ combined Instagram reach, 3,000-member Discord",
      "48 hours of continuous on-site brand exposure plus year-round community",
    ],
    whySponsor: [
      "Talent pipeline: meet your next intern class in one weekend",
      "Real activation, not a logo: API prize tracks, workshops, booths, product drops",
      "Measurable outcomes reported post-event: sign-ups, redemptions, recruiting leads",
      "A youth-innovation CSR story that writes itself",
    ],
    cta: "Custom packages available — the broker will schedule a 15-minute call this week.",
  },
  prospects: [
    {
      company: "Turkcell",
      category: "Telco",
      whyFit: "Runs Gen Z data plans and a developer platform; sponsors youth tech events to stay embedded with future subscribers and hires.",
      pitchAngle: "600 heavy-data users choosing their first own-name contract within 2 years — plus an API track that seeds your developer ecosystem.",
      estDealSize: "₺40,000 – ₺90,000",
      outreachSubject: "600 Gen Z builders, one weekend — HackTheCity Istanbul",
      outreachBody:
        "Hi [Name],\n\nHackTheCity Istanbul brings 600 student developers together for 48 hours this November.\n\nEvery one of them is choosing their first own-name mobile contract within two years — and a Turkcell API prize track puts your developer platform in their hands all weekend. Packages run ₺15,000–₺90,000 with sign-up and redemption numbers reported after the event.\n\nCan I send the two-page deck?\n\nBest,\nSponsorPilot Broker, on behalf of HackTheCity",
      stage: "researched",
    },
    {
      company: "Yapı Kredi",
      category: "Banking",
      whyFit: "Youth-banking products and a fintech API program; standing budget for university tech events.",
      pitchAngle: "First-account acquisition plus a fintech challenge track that doubles as recruiting.",
      estDealSize: "₺30,000 – ₺60,000",
      outreachSubject: "Your next 600 account-holders are at HackTheCity",
      outreachBody:
        "Hi [Name],\n\nHackTheCity Istanbul hosts 600 students aged 16–24 for a 48-hour hackathon this November — first bank accounts, first salaries, first credit cards, all within two years.\n\nA Track Sponsorship (₺45,000) gives you a branded fintech challenge, a booth for the whole weekend, and opt-in CVs from participants who build on your API.\n\nWorth a 15-minute call? Deck available today.\n\nBest,\nSponsorPilot Broker, on behalf of HackTheCity",
      stage: "researched",
    },
    {
      company: "JetBrains",
      category: "Developer Tools",
      whyFit: "Student-licensing funnel converts to paid seats; sponsors hackathons globally for exactly this reason.",
      pitchAngle: "600 future IDE customers activating student licenses in one room.",
      estDealSize: "₺20,000 – ₺45,000",
      outreachSubject: "600 student devs · 48 hours · JetBrains on every screen",
      outreachBody:
        "Hi [Name],\n\nHackTheCity Istanbul (November, 600 builders) is a natural fit for JetBrains' student program: teams ship for 48 hours straight, and the IDE they use this weekend is the one they'll buy at their first job.\n\nCommunity tier (₺15,000) covers swag inserts and license-activation booths; Track tier (₺45,000) adds a branded challenge and workshop.\n\nShall I send the deck?\n\nBest,\nSponsorPilot Broker, on behalf of HackTheCity",
      stage: "researched",
    },
    {
      company: "Red Bull",
      category: "Energy / FMCG",
      whyFit: "Owns the all-nighter moment; sponsors hackathons and e-sports as core Gen Z strategy.",
      pitchAngle: "Official energy partner of a 48-hour all-nighter — sampling with perfect product-market fit.",
      estDealSize: "₺15,000 – ₺30,000",
      outreachSubject: "The most on-brand 48 hours in Istanbul",
      outreachBody:
        "Hi [Name],\n\n600 students coding through two consecutive nights — there is no better sampling moment for Red Bull in Istanbul this fall.\n\nCommunity package (₺15,000): fridge placement in the main hall, swag inserts, and social features from a 15k-reach account. Add the 3AM 'fuel drop' moment and it writes your content calendar for you.\n\nInterested? Details today.\n\nBest,\nSponsorPilot Broker, on behalf of HackTheCity",
      stage: "researched",
    },
    {
      company: "Hepsiburada",
      category: "E-commerce / Tech",
      whyFit: "Hires hundreds of junior engineers yearly; tech-talent branding is a stated priority.",
      pitchAngle: "Meet your next intern class in one weekend — branded track plus CV access beats any job fair.",
      estDealSize: "₺30,000 – ₺60,000",
      outreachSubject: "Your 2027 intern class is building at HackTheCity",
      outreachBody:
        "Hi [Name],\n\nHiring junior engineers is expensive; meeting 600 of them while they build is not.\n\nHackTheCity Istanbul (November) offers Hepsiburada a branded challenge track, demo-day judging seat, and opt-in CVs from every team on your track — a recruiting funnel disguised as a great weekend.\n\nTrack tier is ₺45,000. Can I send the deck and hold a slot?\n\nBest,\nSponsorPilot Broker, on behalf of HackTheCity",
      stage: "researched",
    },
    {
      company: "Kolektif House",
      category: "Coworking / Venue",
      whyFit: "Community-marketing budget targets exactly this demographic; in-kind + cash hybrid deals possible.",
      pitchAngle: "Community partner: day passes in every swag bag convert builders into members.",
      estDealSize: "₺15,000 – ₺25,000",
      outreachSubject: "600 future members, one weekend — community partner slot",
      outreachBody:
        "Hi [Name],\n\nHackTheCity Istanbul brings 600 young builders together this November — freelancers, founders, and remote workers of the next five years.\n\nOur Community package (₺15,000, cash or cash+in-kind) puts Kolektif House day passes in every swag bag and your logo across the event. Historically these convert: builders remember where they shipped their first product.\n\nShall I send details?\n\nBest,\nSponsorPilot Broker, on behalf of HackTheCity",
      stage: "researched",
    },
  ],
};

export const DEMO_NEGOTIATION: NegotiationResult = {
  demoMode: true,
  analysis:
    "The sponsor is interested but anchoring low: ₺30,000 against a ₺45,000 Track ask, citing budget cycle. Their request for telco exclusivity is actually leverage for us — category exclusivity is worth a premium, not a discount. Their timing pressure (they want an answer this month) signals unspent quarterly budget. Counter above the floor with exclusivity priced in.",
  decision: "counter",
  proposedTerms: {
    amount: "₺40,000",
    deliverables: [
      "Category exclusivity: only telco at HackTheCity Istanbul",
      "Branded API challenge track with main-stage judging",
      "Booth in the main hall for all 48 hours",
      "Workshop slot + 2 social features to the builder community",
    ],
  },
  replyEmail: {
    subject: "Re: HackTheCity Istanbul — exclusive telco slot",
    body: "Hi [Name],\n\nThank you — great to hear the audience fits your developer-platform goals.\n\n₺30,000 won't work for a Track package, but here's what I can do: ₺40,000 with category exclusivity — you'd be the only telco at HackTheCity Istanbul, which we don't normally offer at this tier. That covers your branded API track with main-stage judging, a booth for the full 48 hours, a workshop slot, and two social features.\n\nI can hold the exclusive slot until Friday. Shall I send the agreement?\n\nBest,\nSponsorPilot Broker, on behalf of HackTheCity",
  },
};

export const DEMO_AGREEMENT = `SPONSORSHIP AGREEMENT — HACKTHECITY ISTANBUL 2026

Parties: HackTheCity (the "Organizer"), represented by SponsorPilot as broker, and [Sponsor Legal Name] (the "Sponsor").

1. PACKAGE — Track Sponsor with telco-category exclusivity, total fee ₺40,000 (VAT excluded).
2. DELIVERABLES — The Organizer will provide: (a) category exclusivity — no other telecommunications brand at the event; (b) a Sponsor-branded API challenge track judged on the main stage; (c) booth space in the main hall for the full 48 hours; (d) one workshop slot in the official program; (e) two dedicated posts to the event's social channels; (f) post-event report with sign-up and redemption metrics.
3. PAYMENT — 100% (₺40,000) due within 14 days of signature by bank transfer directly to the Organizer's account, details to be provided on the invoice.
4. CANCELLATION — If the event is cancelled, the Sponsor receives a full refund. If the Sponsor withdraws within 30 days of the event, 50% is retained.
5. CONTENT APPROVAL — The Sponsor approves logo usage within 5 business days of receiving proofs; silence constitutes approval.

Signed: ____________________ (Organizer)   ____________________ (Sponsor)   Date: ____________`;
