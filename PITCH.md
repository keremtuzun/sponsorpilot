# SponsorPilot — Build with Gemini XPRIZE submission plan

## The problem worth solving

Every year, millions of student organizations, hackathons, school clubs, sports teams, and community micro-events need sponsorship money to exist. The process is brutal for a young organizer: figure out which companies might care, build a professional deck, write cold emails in "business language," negotiate with an actual marketing manager, and draft a contract. Professional sponsorship agencies charge thousands and won't touch a ₺100k student event. The result: most small events are underfunded or die, and sponsors miss the cheapest access they'll ever get to Gen Z audiences.

I know this problem because I live it — I run sponsorship for a 400-person student conference in Istanbul and did all of this by hand.

## The business: an autonomous AI sponsorship broker

Not a tool. A **broker that does the whole job**:

1. Organizer lists their event free (3-minute form, includes their floor price).
2. The AI broker researches sponsors that fit the audience, estimates deal sizes, writes the deck, and drafts the pitch for each prospect.
3. When a sponsor replies, the **negotiation agent** takes over: it reads the sponsor's position, prices non-monetary asks (exclusivity, extra deliverables) instead of discounting, never goes below the organizer's floor, and escalates only what a human must decide.
4. When a deal closes, the agent **drafts the sponsorship agreement** with direct-payment terms — the sponsor pays the organizing team's account; the platform never touches the money.

**Monetization plan:** free while in beta to maximize adoption and closed-deal volume. Revenue comes from success-fee invoices — after a brokered deal closes, the organizer is invoiced a 10% fee (simple bank transfer, no payment processing in the product). First invoices target weeks 3–6, once the broker has closed deals for early users.

## Category

**Entrepreneurship & Job Creation** — SponsorPilot gives first-time organizers access to a funding market only professional agencies could navigate. (Alternate framing: Money & Financial Access — unlocking sponsorship capital for organizers who can't reach it.)

## Why this wins on the three criteria

1. **Business viability** — free listing means explosive top-of-funnel (any organizer will try something that costs nothing), and revenue scales with deal size, not user count: one closed ₺30,000 deal invoiced at 10% = ₺3,000 (~$75). Ten closed deals across student conference, hackathon, and club networks ≈ $750–2,000 in bank-verifiable fee invoices, plus a story no other team has: *"our AI negotiated and closed $X in sponsorship deals."*
2. **AI-native operations** — the AI *is the businessperson*. Four Gemini agents in production: broker (research + pitch), **negotiator (analyzes sponsor replies, counter-offers, enforces the floor, writes contracts)**, growth (daily Vercel Cron run: picks leads, drafts outreach, makes one growth decision), support (autonomous site chat). Runtime logs record every decision — the required production-log evidence. The Gemini API is the Google Cloud product integration the rules ask for.
3. **Category impact** — every closed deal is a student event that exists because an AI broker made the funding market accessible. Trackable headline metric: **total sponsorship money the broker has closed for organizers**.

## 6-week launch plan (deadline: Aug 17, 2026)

**Week 1 (now)** — Ship: Gemini API key ✅, deployed at https://sponsorpilot-eight.vercel.app ✅, daily growth-agent cron ✅. Remaining: custom domain, deal ledger spreadsheet.
**Week 2** — Run my own conference's fall outreach entirely through SponsorPilot: first real negotiations, first closed deal = the demo-video footage + first success-fee invoice.
**Weeks 3–4** — Distribution: onboard 5–10 student conferences, hackathons, and clubs fundraising for fall events (their window is open right now). The broker runs each campaign; collect testimonials and reply screenshots.
**Weeks 5–6** — Revenue push + submission: close deals in flight, collect fee invoices + bank evidence, record the video, write the narrative, export production logs.

## Submission checklist (from official rules)

- [x] Deployed (https://sponsorpilot-eight.vercel.app) with Gemini API calls in production — the Gemini API is the required Google Cloud product integration; all four agents run on it
- [ ] Demo video < 3 min, public on YouTube
- [ ] Written narrative tying to category
- [ ] Repo access for judges
- [ ] Revenue evidence: bank statement of collected success-fee invoices + deal ledger
- [ ] User evidence: organizer testimonials + sponsor reply screenshots
- [ ] Production logs: Vercel runtime logs of broker/negotiator/growth/support agent decisions (`npx vercel logs sponsorpilot-eight.vercel.app`)

## Demo video script (2:50)

1. **0:00–0:20** — Problem: "I raise sponsorship for a 400-person student conference. Agencies wanted thousands. So I built an AI broker that does the whole job — for free."
2. **0:20–1:10** — List a real event live: form → 30 seconds → broker dashboard: researched prospects with estimated deal sizes, strategy, pipeline.
3. **1:10–2:10** — **The money shot: a live negotiation.** Paste a real sponsor reply lowballing at ₺30,000 and demanding exclusivity. The agent's read appears on screen: *"exclusivity is leverage, not a discount"* → counters at ₺40,000 with exclusivity priced in → sponsor accepts → the agent instantly drafts the full contract. Cut to the production-log line of that decision.
4. **2:10–2:35** — Ops proof: the morning growth-agent cron run in the production logs (its lead picks + drafted outreach + growth decision), the support chat answering a customer autonomously.
5. **2:35–2:50** — Traction: total ₺ closed by the broker, success-fee invoices collected, organizer testimonial. "Every deal is a student event that exists because the funding market finally has a broker for the little guys."

## Important eligibility note

Rules require entrants to be **at least the age of majority** in their country (18 in Turkey). If you're under 18, register the entry with an eligible teammate or parent/guardian as the official entrant before submitting.

## Legal footnote

The product processes no payments — sponsors pay organizers directly, which keeps the platform out of money-transmission territory entirely. When success-fee invoicing starts, invoice from a registered individual/company account (a parent/guardian can hold this if needed) and keep the deal ledger clean.
