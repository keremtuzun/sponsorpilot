import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { env } from "@/lib/env";
import { generateResilient } from "@/lib/gemini";
import { LEADS } from "@/lib/leads";

export const maxDuration = 120;

// Growth agent: hit daily by Cloud Scheduler. Reviews business metrics and the
// lead list, decides who to pitch today, drafts the outreach, and logs one
// growth decision. Every run is logged to stdout -> Cloud Run production logs.

const opsSchema = {
  type: Type.OBJECT,
  properties: {
    dailyReport: { type: Type.STRING, description: "3-4 sentence ops summary: how the business is doing and what matters today" },
    leadPicks: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 3,
      items: {
        type: Type.OBJECT,
        properties: {
          lead: { type: Type.STRING, description: "Lead name, exactly as given" },
          why: { type: Type.STRING, description: "Why pitch this lead today (timing, fit, urgency)" },
          channel: { type: Type.STRING },
          outreachMessage: { type: Type.STRING, description: "Ready-to-send message for that channel, under 100 words" },
        },
        required: ["lead", "why", "channel", "outreachMessage"],
      },
    },
    growthDecision: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: "One concrete growth action to take today" },
        rationale: { type: Type.STRING },
      },
      required: ["action", "rationale"],
    },
  },
  required: ["dailyReport", "leadPicks", "growthDecision"],
};

const DEMO_OPS = {
  demoMode: true,
  dailyReport:
    "Steady day: kit generations up, conversion holding near 8%. Fall-season conferences (Sep-Nov events) are entering their fundraising window now, so outreach should prioritize them over winter events. No support escalations.",
  leadPicks: [
    {
      lead: "TEDxYouth Ankara",
      why: "October event means sponsorship outreach is happening right now; Turkish market where we have testimonials.",
      channel: "Email",
      outreachMessage:
        "Hi — I saw TEDxYouth Ankara is coming up in October. SponsorPilot is a free AI broker that finds sponsors for student events, pitches them, and negotiates the deals for you. Built by student organizers who raised sponsorship for their own conference the hard way. Listing takes 3 minutes: [link].",
    },
    {
      lead: "Cambridge Schools Debate Open",
      why: "October event, English-speaking market, debate circuit is dense with organizers who refer each other.",
      channel: "Email",
      outreachMessage:
        "Hi — running sponsorship for a schools debate open is brutal without an agency. SponsorPilot is a free AI broker: it finds the sponsors, pitches them, and negotiates the deal for you. Built by student organizers, for student organizers: [link]",
    },
    {
      lead: "HackHighSchool NYC",
      why: "Hackathons have the highest sponsorship budgets per attendee; October timing is urgent.",
      channel: "Discord",
      outreachMessage:
        "hey! saw you're organizing HackHighSchool for October — if sponsor outreach is still on the todo list, we built a free AI broker that finds sponsors, pitches them, and negotiates deals for you. 3 min to list: [link]",
    },
  ],
  growthDecision: {
    action: "Post a before/after thread in the two largest student-organizer Discord servers showing a real closed deal.",
    rationale: "Fall events are fundraising this month; social proof in-community converts better than DMs alone.",
  },
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = env("OPS_SECRET");
  if (secret) {
    // Accept ?key= (manual runs) or the Bearer header Vercel Cron sends when
    // CRON_SECRET is set. Sanitize both sides — env values from Windows shells
    // can carry a BOM, which arrives in headers as either ﻿ or "ï»¿".
    const clean = (s: string | null) =>
      (s || "").replace(new RegExp("^(\\uFEFF|\\u00EF\\u00BB\\u00BF)+"), "").trim();
    const bearer = clean(req.headers.get("authorization")).replace(/^Bearer\s+/i, "");
    const authorized = clean(url.searchParams.get("key")) === secret || (bearer && bearer === (env("CRON_SECRET") || secret));
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // MVP metrics: replaced by Firestore reads once persistence lands.
  const metrics = {
    date: new Date().toISOString().slice(0, 10),
    kitsGeneratedLast7d: Number(url.searchParams.get("kits") ?? 0),
    revenueLast7dUsd: Number(url.searchParams.get("revenue") ?? 0),
    siteVisitsLast7d: Number(url.searchParams.get("visits") ?? 0),
  };

  const apiKey = env("GEMINI_API_KEY");
  if (!apiKey) {
    console.log("[sponsorpilot:ops] demo run", JSON.stringify({ metrics }));
    return NextResponse.json({ metrics, ...DEMO_OPS });
  }

  const prompt = `You are the autonomous growth agent for SponsorPilot, the free AI sponsorship broker for student organizations and small event organizers. Growth = more listed events with real fundraising windows open now. Today is ${metrics.date}.

BUSINESS METRICS (last 7 days)
- Kits generated: ${metrics.kitsGeneratedLast7d}
- Revenue: $${metrics.revenueLast7dUsd}
- Site visits: ${metrics.siteVisitsLast7d}

LEAD LIST
${LEADS.map((l) => `- ${l.name} | ${l.type} | ${l.country} | event: ${l.eventMonth} | channel: ${l.channel} | status: ${l.status}`).join("\n")}

YOUR JOB TODAY
1. Write a short daily ops report.
2. Pick the 3 best leads to pitch TODAY (prioritize events whose sponsorship-fundraising window is open now — typically 2-5 months before the event — and leads not yet contacted). Draft the actual outreach message for each, matched to the channel's tone.
3. Make one concrete growth decision for today with rationale.

Use [link] as the product-link placeholder. Be commercially sharp, not spammy.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await generateResilient(ai, {
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: opsSchema, temperature: 0.7 },
    });
    const plan = JSON.parse(response.text ?? "");
    // stdout -> Cloud Run logs = auditable evidence the agent runs the business.
    console.log("[sponsorpilot:ops] run", JSON.stringify({ metrics, plan }));
    return NextResponse.json({ metrics, ...plan });
  } catch (err) {
    console.error("[sponsorpilot:ops] failed", err);
    return NextResponse.json({ error: "Ops agent run failed" }, { status: 502 });
  }
}
