import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";

export const maxDuration = 30;

// Sends broker outreach through the organizer's OWN Gmail after they approve
// the draft in the dashboard. Each organizer supplies their Gmail address and
// an App Password (Google Account → Security → 2-Step Verification → App
// passwords) in the send panel; credentials are used for this request only and
// never stored server-side. GMAIL_USER/GMAIL_APP_PASSWORD env vars act as an
// optional platform-wide fallback.

interface SendRequest {
  to: string;
  subject: string;
  body: string;
  prospect?: string;
  eventName?: string;
  orgName?: string;
  gmailUser?: string;
  gmailAppPassword?: string;
}

export async function POST(req: Request) {
  let data: SendRequest;
  try {
    data = (await req.json()) as SendRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const to = (data.to || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Enter a valid recipient email address" }, { status: 400 });
  }
  if (!data.subject?.trim() || !data.body?.trim()) {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }
  if (/\[Name\]|\[Contact/i.test(data.body)) {
    return NextResponse.json(
      { error: "The draft still contains a [Name] placeholder — replace it with the recipient's name before sending." },
      { status: 400 }
    );
  }

  // Google shows App Passwords with spaces — strip them.
  const user = (data.gmailUser || "").trim() || env("GMAIL_USER");
  const pass = (data.gmailAppPassword || "").replace(/\s+/g, "") || env("GMAIL_APP_PASSWORD");
  if (!user || !pass) {
    return NextResponse.json({ configured: false });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user)) {
    return NextResponse.json({ error: "Your Gmail address doesn't look valid — check the sending account." }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    const fromName = data.orgName ? `${data.orgName} — Sponsorship` : "SponsorPilot";
    const info = await transporter.sendMail({
      from: `"${fromName.replace(/"/g, "")}" <${user}>`,
      to,
      subject: data.subject.trim(),
      text: data.body,
    });

    console.log(
      `[sponsorpilot:send] sent from="${user}" to="${to}" prospect="${data.prospect ?? ""}" event="${data.eventName ?? ""}" id=${info.messageId}`
    );
    return NextResponse.json({ sent: true, id: info.messageId });
  } catch (err) {
    console.error("[sponsorpilot:send] failed", err);
    const msg = String(err);
    if (/invalid login|username and password not accepted|EAUTH/i.test(msg)) {
      return NextResponse.json(
        { error: "Gmail rejected the login — double-check your Gmail address and App Password (it must be an App Password from Google Account → Security → App passwords, not your normal password)." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Sending failed — please try again." }, { status: 502 });
  }
}
