import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { env } from "@/lib/env";
import { STYLE_RULES } from "@/lib/style";
import { generateResilient } from "@/lib/gemini";

export const maxDuration = 30;

// Support agent: Gemini handles customer questions and refund decisions
// autonomously via the site chat widget. Escalations are logged for review.

const supportSchema = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING, description: "The reply to send to the customer" },
    action: {
      type: Type.STRING,
      enum: ["answer", "approve_refund", "escalate"],
      description: "answer = normal reply; approve_refund = unused (free product); escalate = human review needed",
    },
  },
  required: ["reply", "action"],
};

const SYSTEM = `You are the support agent for SponsorPilot, the AI sponsorship broker. You resolve tickets autonomously.

PRODUCT FACTS
- SponsorPilot is an AI broker for student orgs, clubs, and small event organizers: it researches matching sponsors, estimates deal sizes, writes the pitch emails, negotiates counter-offers against the organizer's floor price, and drafts the sponsorship agreement.
- Pricing: completely free for organizers while in beta. SponsorPilot never touches the money, sponsors pay the organizer's organization directly under the terms in the agreement.
- Campaign generation takes about a minute. Campaigns are stored in the browser session for now (accounts and saved campaigns are coming); organizers can relist an event anytime for free.
- The organizer always approves before anything is sent: the agent drafts and decides, the organizer clicks send. The agent never accepts a deal below the organizer's floor price.

DECISION AUTHORITY
- The product is free and processes no payments, so action=approve_refund should never be used.
- Escalate (action=escalate) only for: legal threats, disputes between an organizer and a sponsor, bugs you cannot resolve, or partnership/press inquiries. Tell the customer a human will follow up within 24h.
- Otherwise answer directly, warmly, and briefly (under 120 words). Never invent features. If asked about something the product doesn't do, say so and note it's on the roadmap if plausible.`;

const DEMO_REPLY = {
  demoMode: true,
  reply:
    "Hi! I'm SponsorPilot's AI support agent. Listing your event and running the broker campaign is completely free while we're in beta, and sponsors pay your organization directly, we never touch the money. Anything else I can help with?",
  action: "answer",
};

export async function POST(req: Request) {
  let body: { messages?: { role: string; text: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const messages = (body.messages ?? []).slice(-10);
  if (messages.length === 0) {
    return NextResponse.json({ error: "No message" }, { status: 400 });
  }

  const apiKey = env("GEMINI_API_KEY");
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json(DEMO_REPLY);
  }

  const transcript = messages.map((m) => `${m.role === "user" ? "Customer" : "Agent"}: ${m.text}`).join("\n");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await generateResilient(ai, {
      contents: `${SYSTEM}\n\nCONVERSATION SO FAR\n${transcript}\n\nRespond to the customer's last message.\n${STYLE_RULES}`,
      config: { responseMimeType: "application/json", responseSchema: supportSchema, temperature: 0.5 },
    });
    const result = JSON.parse(response.text ?? "");
    console.log("[sponsorpilot:support]", JSON.stringify({ lastMessage: messages[messages.length - 1]?.text, action: result.action }));
    return NextResponse.json(result);
  } catch (err) {
    console.error("[sponsorpilot:support] failed", err);
    return NextResponse.json({ reply: "Sorry, I hit a snag. Please try again in a moment.", action: "answer" }, { status: 200 });
  }
}
