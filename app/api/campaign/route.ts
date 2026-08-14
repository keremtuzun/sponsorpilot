import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { DEMO_CAMPAIGN } from "@/lib/demo";
import { env } from "@/lib/env";
import { generateResilient } from "@/lib/gemini";
import type { Campaign, IntakeForm } from "@/lib/types";

export const maxDuration = 120;

// Broker agent, step 1: turn an event listing into a full brokerage campaign -
// strategy, tiers, deck, and researched prospects with ready-to-send outreach.

const campaignSchema = {
  type: Type.OBJECT,
  properties: {
    strategy: {
      type: Type.OBJECT,
      properties: {
        projectedRaise: { type: Type.STRING, description: "Realistic raise range in the event's currency, e.g. '₺90,000 – ₺140,000'" },
        positioning: { type: Type.STRING, description: "One sharp sentence: how the broker will sell this event to sponsors" },
        approach: { type: Type.ARRAY, minItems: 3, maxItems: 4, items: { type: Type.STRING }, description: "The broker's campaign strategy points" },
      },
      required: ["projectedRaise", "positioning", "approach"],
    },
    tiers: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 3,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.STRING, description: "Price in the event's currency" },
          benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "price", "benefits"],
      },
    },
    deck: {
      type: Type.OBJECT,
      properties: {
        tagline: { type: Type.STRING },
        aboutEvent: { type: Type.STRING },
        audienceStats: { type: Type.ARRAY, items: { type: Type.STRING } },
        whySponsor: { type: Type.ARRAY, items: { type: Type.STRING } },
        cta: { type: Type.STRING },
      },
      required: ["tagline", "aboutEvent", "audienceStats", "whySponsor", "cta"],
    },
    prospects: {
      type: Type.ARRAY,
      minItems: 8,
      maxItems: 10,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING, description: "Real company active in the event's country, or a realistic local business type" },
          category: { type: Type.STRING },
          whyFit: { type: Type.STRING },
          pitchAngle: { type: Type.STRING, description: "The specific commercial hook for this prospect" },
          estDealSize: { type: Type.STRING, description: "Realistic deal range for this prospect in the event's currency" },
          outreachSubject: { type: Type.STRING },
          outreachBody: { type: Type.STRING, description: "Full cold email under 130 words, signed 'SponsorPilot Broker, on behalf of {org}'. Use [Name] as recipient placeholder." },
        },
        required: ["company", "category", "whyFit", "pitchAngle", "estDealSize", "outreachSubject", "outreachBody"],
      },
    },
  },
  required: ["strategy", "tiers", "deck", "prospects"],
};

function buildPrompt(f: IntakeForm): string {
  return `You are SponsorPilot, an autonomous AI sponsorship broker. You represent event organizers - your only job is getting them funded, so every prospect and email must be commercially real, not filler.

A new client just listed their event. Build the full brokerage campaign.

EVENT LISTING
- Organization: ${f.orgName}
- Event: ${f.eventName} (${f.eventType})
- Location: ${f.city}, ${f.country}
- Date: ${f.date}
- Expected attendance: ${f.attendance}
- Audience: ${f.audience}
- Reach: ${f.reach}
- Fundraising goal: ${f.goalAmount} ${f.currency}
- Minimum acceptable single deal: ${f.floorDeal || "not specified"} ${f.currency}
- What the organizer can offer sponsors: ${f.offerables || "standard placements (logos, booth, social features, stage mentions)"}
- Past sponsors: ${f.pastSponsors || "none"}

RULES
- Prospects: prefer real companies active in ${f.country} with youth/community/education marketing budgets; when unsure, use a realistic local business type. Order by likelihood to close.
- estDealSize must be plausible for that company and this audience size; tier prices must sum plausibly toward the goal across several sponsors.
- Emails: sharp broker tone, lead with what the sponsor gets, mention a concrete price anchor, under 130 words, sign as "SponsorPilot Broker, on behalf of ${f.orgName}". Use [Name] for the recipient.
- Never invent statistics; only reframe the numbers given.
- Write in English unless the listing is clearly in another language.`;
}

export async function POST(req: Request) {
  let form: IntakeForm;
  try {
    form = (await req.json()) as IntakeForm;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!form.eventName?.trim() || !form.audience?.trim()) {
    return NextResponse.json({ error: "Event name and audience are required" }, { status: 400 });
  }

  const apiKey = env("GEMINI_API_KEY");
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json(DEMO_CAMPAIGN);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await generateResilient(ai, {
      contents: buildPrompt(form),
      config: { responseMimeType: "application/json", responseSchema: campaignSchema, temperature: 0.8 },
    });

    const campaign = JSON.parse(response.text ?? "") as Campaign;
    campaign.prospects = campaign.prospects.map((p) => ({ ...p, stage: "researched" as const }));
    console.log(
      `[sponsorpilot:broker] campaign created event="${form.eventName}" country="${form.country}" prospects=${campaign.prospects.length} projected="${campaign.strategy.projectedRaise}"`
    );
    return NextResponse.json(campaign);
  } catch (err) {
    console.error("[sponsorpilot:broker] campaign failed", err);
    return NextResponse.json({ error: "Campaign creation failed - please try again." }, { status: 502 });
  }
}
