# SponsorPilot

**The AI sponsorship broker. You pay nothing until money lands.**

SponsorPilot is an autonomous AI broker for student organizations, clubs, and small event organizers — the market sponsorship agencies ignore. It researches matching sponsors, sizes the deals, writes the pitches, **negotiates counter-offers against the organizer's floor price**, and drafts the sponsorship agreement. Free for organizers; sponsors pay the organizing team directly.

Built for the [Build with Gemini XPRIZE](https://www.geminixprize.com/) hackathon. Powered by the Gemini API.

## The agent does the whole job

| Step | Who does it |
|---|---|
| Research sponsors that fit the audience + estimate deal sizes | **Broker agent** (`/api/campaign`) |
| Write the partnership deck, tier pricing, and pitch emails | **Broker agent** (`/api/campaign`) |
| Analyze sponsor replies, counter-offer, price exclusivity asks, enforce the floor | **Negotiation agent** (`/api/negotiate`) |
| Draft the sponsorship contract when a deal closes | **Negotiation agent** (`/api/negotiate`) |
| Send the outreach and negotiation replies from the organizer's own Gmail (after one-click human approval) | **Send pipeline** (`/api/send`, Gmail SMTP) |
| Decide which events to pitch each day, draft the growth outreach | **Growth agent** (`/api/ops`, Vercel Cron daily at 05:00 UTC) |
| Handle customer support autonomously | **Support agent** (`/api/support`, site chat) |
| Approve before sending, sign contracts | Human organizer |

Every agent decision is logged to stdout → Vercel runtime logs, which doubles as the production-log evidence the hackathon requires. The Gemini API is the Google Cloud product integration required by the rules.

**Live:** https://sponsorpilot-eight.vercel.app

## Run locally

```bash
npm install
cp .env.example .env.local   # add your GEMINI_API_KEY
npm run dev
```

Without `GEMINI_API_KEY`, the app runs in **demo mode** with a realistic sample campaign, so the full flow — including negotiation — is always demoable.

Try the negotiation agent: launch a campaign, click **"Copy pitch & mark as sent"** on a prospect, then **"Sponsor replied → negotiate"** and paste something like *"We like it but our budget is 15,000 and we'd want to be the only bank at the event."* Watch the agent price the exclusivity ask instead of discounting.

## Environment

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini API key from [AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | Defaults to `gemini-3.5-flash` |
| `GEMINI_FALLBACK_MODEL` | Used when the primary model is overloaded; defaults to `gemini-2.5-flash` |
| `OPS_SECRET` | Shared secret protecting the growth-agent endpoint (`/api/ops?key=...`) |
| `CRON_SECRET` | Same value as `OPS_SECRET`; Vercel Cron sends it as a Bearer token |
| `GMAIL_USER` | Optional platform-wide fallback sender — normally each organizer enters their own Gmail in the send panel |
| `GMAIL_APP_PASSWORD` | App Password for the fallback sender (Google Account → Security → 2-Step Verification → App passwords) |

**Per-user sending:** every organizer connects their own Gmail directly in the send panel (address + App Password). Credentials are kept in that user's browser (`localStorage`) and travel only with each send request — the server stores nothing.

## Stack

Next.js 15 (App Router) · `@google/genai` (Gemini API — the Google Cloud integration) · deployed on Vercel with a daily cron for the growth agent. Model calls retry with a hard per-attempt timeout and fall back to a secondary model when Gemini sheds load.

## Roadmap (next after MVP)

- Firestore: persistent campaigns, accounts, multi-event dashboards
- Inbound email webhook: sponsor replies land directly in the negotiation agent, no paste needed (outbound sending is already live via `/api/send`)
- Sponsor-side marketplace: brands browse vetted events by audience and budget
