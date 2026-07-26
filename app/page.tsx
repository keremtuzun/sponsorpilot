"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { IntakeForm } from "@/lib/types";

const EMPTY: IntakeForm = {
  orgName: "",
  eventName: "",
  eventType: "Hackathon / tech event",
  city: "",
  country: "",
  date: "",
  attendance: "",
  audience: "",
  reach: "",
  goalAmount: "",
  currency: "USD",
  floorDeal: "",
  offerables: "",
  pastSponsors: "",
  contactName: "",
};

const STEPS = [
  {
    title: "List your event — free",
    desc: "3 minutes: who's coming, what you can offer sponsors, and your floor price. That's the last work you do.",
  },
  {
    title: "The AI broker goes to work",
    desc: "It researches sponsors that fit your audience, estimates deal sizes, writes the pitches, and runs the outreach campaign.",
  },
  {
    title: "It negotiates. You get funded.",
    desc: "The agent handles counter-offers against your floor price and drafts the contract the moment a deal closes. Sponsors pay your organization directly.",
  },
];

const LOADING_MSGS = [
  "Scanning the sponsor market for your audience…",
  "Estimating deal sizes per prospect…",
  "Pricing your sponsorship tiers…",
  "Writing personalized pitches…",
  "Assembling your campaign…",
];

function Terminal() {
  return (
    <div className="terminal rise d2">
      <div className="terminal-bar">
        <span>Sample campaign activity</span>
      </div>
      <div className="terminal-body">
        <div className="tl"><span className="pfx">01</span><span><b>214</b> relevant sponsors researched</span></div>
        <div className="tl"><span className="pfx">02</span><span><b>8</b> tailored partnership pitches drafted</span></div>
        <div className="tl"><span className="pfx">03</span><span>Counter-offer checked against your minimum</span></div>
        <div className="tl win"><span className="pfx">04</span><span>Agreement ready for your approval</span></div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<IntakeForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setLoadMsg((v) => (v + 1) % LOADING_MSGS.length), 3200);
    return () => clearInterval(id);
  }, [loading]);

  const set = (k: keyof IntakeForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      sessionStorage.setItem("sponsorpilot_campaign", JSON.stringify(data));
      sessionStorage.setItem("sponsorpilot_form", JSON.stringify(form));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="container">
        <nav className="nav">
          <div className="logo">
            Sponsor<span>Pilot</span>
          </div>
          <a className="cta-small" href="#start">
            List my event — free
          </a>
        </nav>

        <section className="hero">
          <div className="hero-grid">
            <div>
              <div className="badge rise">The AI sponsorship broker · free for organizers</div>
              <h1 className="rise d1">
                An AI broker that gets your event <em>sponsored.</em>
              </h1>
              <p className="sub rise d2">
                It researches the sponsors, writes the pitches, negotiates the deals, and drafts the
                contracts — like an agent that works for you. Every deal it closes is yours: sponsors
                pay your organization directly.
              </p>
              <div className="rise d3">
                <a className="cta" href="#start">
                  Put the broker to work
                </a>
                <p className="fine">Campaign live in ~30 seconds · No account · Free while in beta</p>
              </div>
            </div>
            <Terminal />
          </div>
        </section>

        <div className="section-head">
          <div className="kicker">How it works</div>
          <h2>Your fundraising team, minus the team</h2>
          <p>Sponsorship agencies charge thousands and ignore small events. Your AI broker has one job: closing your deals.</p>
        </div>

        <section className="steps">
          {STEPS.map((s, i) => (
            <div className="step" key={i}>
              <div className="num">{String(i + 1).padStart(2, "0")}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </section>

        <div className="section-head" id="start">
          <div className="kicker">Start free</div>
          <h2>List your event</h2>
          <p>The more specific you are, the better your broker negotiates.</p>
        </div>

        <section className="form-section">
          <form className="form-card" onSubmit={submit}>
            <div className="grid2">
              <div className="field">
                <label>Organization name</label>
                <input required value={form.orgName} onChange={set("orgName")} placeholder="e.g. HackTheCity" />
              </div>
              <div className="field">
                <label>Event name</label>
                <input required value={form.eventName} onChange={set("eventName")} placeholder="e.g. HackTheCity Istanbul 2026" />
              </div>
            </div>

            <div className="grid2">
              <div className="field">
                <label>Event type</label>
                <select value={form.eventType} onChange={set("eventType")}>
                  <option>Hackathon / tech event</option>
                  <option>Student conference</option>
                  <option>Club / society event</option>
                  <option>Sports tournament</option>
                  <option>Community / cultural event</option>
                  <option>Charity / fundraiser</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label>Event date</label>
                <input required value={form.date} onChange={set("date")} placeholder="e.g. November 2026" />
              </div>
            </div>

            <div className="grid2">
              <div className="field">
                <label>City</label>
                <input required value={form.city} onChange={set("city")} placeholder="e.g. Istanbul" />
              </div>
              <div className="field">
                <label>Country</label>
                <input required value={form.country} onChange={set("country")} placeholder="e.g. Turkey" />
              </div>
            </div>

            <div className="grid2">
              <div className="field">
                <label>Expected attendance</label>
                <input required value={form.attendance} onChange={set("attendance")} placeholder="e.g. 600 builders" />
              </div>
              <div className="field">
                <label>Your name</label>
                <input required value={form.contactName} onChange={set("contactName")} placeholder="e.g. Kerem T." />
              </div>
            </div>

            <div className="field">
              <label>Who is your audience?</label>
              <textarea
                required
                value={form.audience}
                onChange={set("audience")}
                placeholder="e.g. 600 student developers and designers aged 16–24 from 40+ schools and universities, plus mentors from local tech companies"
              />
            </div>

            <div className="field">
              <label>What can you offer sponsors?</label>
              <textarea
                value={form.offerables}
                onChange={set("offerables")}
                placeholder="e.g. Booth space, logo on stage and swag, API prize tracks, workshop slot, social media features, demo-day judging seat"
              />
            </div>

            <div className="field">
              <label>Your reach (social media, newsletter, past attendance)</label>
              <input
                value={form.reach}
                onChange={set("reach")}
                placeholder="e.g. 15k Instagram reach, 3k Discord members, 2nd annual edition"
              />
            </div>

            <div className="grid2">
              <div className="field">
                <label>Fundraising goal</label>
                <input required value={form.goalAmount} onChange={set("goalAmount")} placeholder="e.g. 250,000" />
              </div>
              <div className="field">
                <label>Currency</label>
                <select value={form.currency} onChange={set("currency")}>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>TRY</option>
                  <option>INR</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid2">
              <div className="field">
                <label>Minimum single deal you&apos;d accept (your floor)</label>
                <input required value={form.floorDeal} onChange={set("floorDeal")} placeholder="e.g. 15,000" />
              </div>
              <div className="field">
                <label>Past sponsors (optional)</label>
                <input value={form.pastSponsors} onChange={set("pastSponsors")} placeholder="e.g. Local coworking space" />
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Your broker is working…" : "Launch my sponsorship campaign →"}
            </button>
            {loading && (
              <div className="gen-status">
                <span className="spinner" />
                {LOADING_MSGS[loadMsg]}
              </div>
            )}
            {error && <div className="error-msg">{error}</div>}
          </form>
        </section>
      </div>

      <footer>
        <div className="container">
          SponsorPilot — the AI sponsorship broker. Free for organizers. Powered by Gemini.
        </div>
      </footer>
    </>
  );
}
