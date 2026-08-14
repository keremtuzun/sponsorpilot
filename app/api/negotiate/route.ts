import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { DEMO_AGREEMENT, DEMO_NEGOTIATION } from "@/lib/demo";
import { env } from "@/lib/env";
import { generateResilient } from "@/lib/gemini";
import type { NegotiationResult } from "@/lib/types";

export const maxDuration = 120;

// Broker agent, step 2: the negotiation engine. Takes a sponsor's reply and the
// organizer's guardrails, decides the move (counter / accept / decline /
// escalate), drafts the response, and writes the contract when a deal closes.

const negotiationSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.STRING,
      description: "The broker's read of the sponsor's position: leverage, budget signals, what they really want. 3-5 sentences.",
    },
    decision: {
      type: Type.STRING,
      enum: ["counter", "accept", "decline", "escalate"],
      description:
        "counter = push for better terms; accept = close at these terms (only if at/above floor); decline = walk away politely; escalate = organizer must decide",
    },
    proposedTerms: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.STRING, description: "The deal amount the broker is now proposing/accepting, with currency" },
        deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["amount", "deliverables"],
    },
    replyEmail: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
        body: { type: Type.STRING, description: "The reply to send the sponsor, under 160 words, signed 'SponsorPilot Broker, on behalf of {org}'" },
      },
      required: ["subject", "body"],
    },
    agreement: {
      type: Type.STRING,
      description:
        "ONLY when decision=accept: the full plain-text sponsorship agreement (parties, package, deliverables, payment terms - sponsor pays the Organizer directly - cancellation, content approval, signature lines). Otherwise an empty string.",
    },
  },
  required: ["analysis", "decision", "proposedTerms", "replyEmail", "agreement"],
};

interface NegotiateRequest {
  orgName: string;
  eventName: string;
  currency: string;
  prospect: string;
  tierContext: string;
  floorDeal: string;
  askAmount: string;
  sponsorMessage: string;
  history?: string;
}

export async function POST(req: Request) {
  let body: NegotiateRequest;
  try {
    body = (await req.json()) as NegotiateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.sponsorMessage?.trim()) {
    return NextResponse.json({ error: "Paste the sponsor's message first" }, { status: 400 });
  }

  const apiKey = env("GEMINI_API_KEY");
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1200));
    const accepting = /accept|deal|agreed|let's do it|send the (agreement|contract)/i.test(body.sponsorMessage);
    if (accepting) {
      return NextResponse.json({
        ...DEMO_NEGOTIATION,
        decision: "accept",
        analysis:
          "The sponsor has accepted the counter-offer at ₺40,000 with category exclusivity - above the organizer's floor and within tier economics. Closing now: confirmation email plus the agreement for signature.",
        replyEmail: {
          subject: "Confirmed - HackTheCity Istanbul Track Partnership (exclusive)",
          body: "Hi [Name],\n\nExcellent - you're confirmed as the exclusive telco partner of HackTheCity Istanbul at ₺40,000.\n\nI've attached the sponsorship agreement for signature; payment goes directly to the organizing team per the terms inside. Deliverables kick off immediately after: we'll request your logo pack and API-track brief this week.\n\nWelcome aboard - this is going to perform.\n\nBest,\nSponsorPilot Broker, on behalf of HackTheCity",
        },
        agreement: DEMO_AGREEMENT,
      } satisfies NegotiationResult);
    }
    return NextResponse.json({ ...DEMO_NEGOTIATION, agreement: "" });
  }

  const prompt = `You are SponsorPilot's autonomous negotiation agent, brokering sponsorship deals on behalf of event organizers. Your incentive is to CLOSE at the best defensible price - not to be polite and lose the deal, and not to overreach and kill it.

DEAL CONTEXT
- Event: ${body.eventName}, organized by ${body.orgName}
- Currency: ${body.currency}
- Prospect: ${body.prospect}
- Package context: ${body.tierContext}
- Our current ask: ${body.askAmount}
- Organizer's HARD FLOOR for a single deal: ${body.floorDeal} (never accept below this; counter or escalate instead)
${body.history ? `- Negotiation so far:\n${body.history}` : ""}

THE SPONSOR JUST REPLIED:
"""
${body.sponsorMessage}
"""

YOUR MOVE
1. Analyze their position: budget signals, leverage, what they actually want.
2. Decide: counter / accept / decline / escalate.
   - accept only at or above the floor.
   - Non-monetary asks (exclusivity, extra deliverables, speaking slots) are pricing levers - charge for them.
   - escalate when the sponsor requests things only the organizer can approve (program changes, unusual legal terms).
3. Draft the reply email (broker voice: confident, concrete, deadline-driven; under 160 words; sign as "SponsorPilot Broker, on behalf of ${body.orgName}").
4. If accepting: write the complete plain-text sponsorship agreement - payment is made directly to the Organizer's bank account within 14 days of signature. If not accepting, agreement must be an empty string.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await generateResilient(ai, {
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: negotiationSchema, temperature: 0.6 },
    });
    const result = JSON.parse(response.text ?? "") as NegotiationResult;
    console.log(
      `[sponsorpilot:negotiate] event="${body.eventName}" prospect="${body.prospect}" decision=${result.decision} amount="${result.proposedTerms?.amount}"`
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("[sponsorpilot:negotiate] failed", err);
    return NextResponse.json({ error: "Negotiation agent failed - please try again." }, { status: 502 });
  }
}
