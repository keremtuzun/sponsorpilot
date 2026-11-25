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
    title: "You describe the event",
    desc: "Attendance, audience, what sponsors can get, your fundraising goal, and the smallest single deal you would accept. That minimum is the floor the negotiation never goes below.",
  },
  {
    title: "Gemini builds the campaign",
    desc: "It proposes three sponsor packages with prices, writes a short deck, and lists eight to ten companies that fit your audience and country, each with an estimated deal size and a cold email. Company names come from a language model, so check each one exists before you send.",
  },
  {
    title: "You send, then paste the replies",
    desc: "Review each email and send it from your own Gmail, or send it yourself and mark it sent. When a sponsor writes back, paste the reply in. The agent decides whether to accept, counter or walk away, drafts your response, and writes the agreement once a deal closes. Nothing leaves your account until you approve it.",
  },
];

const LOADING_MSGS = [
  "Reading your event details…",
  "Estimating deal sizes…",
  "Pricing three packages…",
  "Writing one email per prospect…",
  "Putting the campaign together…",
];

function Example() {
  return (
    <div className="example">
      <div className="example-title">Example from the sample campaign (HackTheCity Istanbul, floor 15,000)</div>
      <div className="example-row">
        <div className="who">Sponsor replies</div>
        We like the audience, but our budget is 30,000. We would also want to be the only telco at the event, and
        we need an answer this month.
      </div>
      <div className="example-row">
        <div className="who">Broker counters</div>
        <div className="amount">₺40,000</div>
        Exclusivity is priced in, not given as a discount. Above the floor, with the branded track, booth and
        workshop slot kept.
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
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
            Describe your event
          </a>
        </nav>

        <section className="hero">
          <div className="hero-grid">
            <div>
              <h1>Sponsor outreach and negotiation for events too small for an agency</h1>
              <p className="sub">
                You enter your event and the lowest deal you would accept. SponsorPilot uses Gemini to suggest
                companies that fit, price three sponsor packages, and draft a pitch for each. When a company
                replies, it proposes a counter-offer that stays above your minimum. Sponsors pay your
                organization directly.
              </p>
              <div>
                <a className="cta" href="#start">
                  Describe your event
                </a>
                <p className="fine">
                  No account. The campaign lives in this browser tab and is gone when you close it. Generating it
                  takes up to a minute.
                </p>
              </div>
            </div>
            <Example />
          </div>
        </section>

        <div className="section-head">
          <h2>What happens, in order</h2>
        </div>

        <ol className="steps">
          {STEPS.map((s, i) => (
            <li className="step" key={i}>
              <div className="num">{String(i + 1).padStart(2, "0")}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>

        <div className="section-head" id="start">
          <h2>Describe your event</h2>
          <p>Specific answers give better prospects and tighter counter-offers. Every field marked required is used in the prompt.</p>
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
              {loading ? "Building your campaign…" : "Build my campaign"}
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
          <span>SponsorPilot is a Gemini-based project by Kerem Tüzün. Free for organizers.</span>
          <a href="https://github.com/keremtuzun/sponsorpilot" target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
