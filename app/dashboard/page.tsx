"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Campaign, IntakeForm, NegotiationResult, Prospect, Stage } from "@/lib/types";

const STAGES: { id: Stage; label: string }[] = [
  { id: "researched", label: "Researched" },
  { id: "contacted", label: "Pitched" },
  { id: "negotiating", label: "Negotiating" },
  { id: "closed", label: "Closed ✓" },
  { id: "declined", label: "Passed" },
];

function parseAmount(s: string | undefined): number {
  if (!s) return 0;
  const m = s.replace(/[.,](?=\d{3}\b)/g, "").match(/\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}

/** Review-and-send panel: the agent drafted it, the human approves, the agent
 *  sends - from the organizer's OWN Gmail. Credentials live in this browser's
 *  localStorage and travel only with each send request; the server keeps nothing. */
function SendPanel({
  defaultTo,
  defaultSubject,
  defaultBody,
  context,
  onSent,
  onCancel,
}: {
  defaultTo?: string;
  defaultSubject: string;
  defaultBody: string;
  context: { prospect: string; eventName: string; orgName: string };
  onSent: (to: string) => void;
  onCancel: () => void;
}) {
  const [to, setTo] = useState(defaultTo ?? "");
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [gmailUser, setGmailUser] = useState("");
  const [gmailPass, setGmailPass] = useState("");
  const [editFrom, setEditFrom] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sponsorpilot_gmail") || "null");
      if (saved?.user) {
        setGmailUser(saved.user);
        setGmailPass(saved.pass || "");
      } else {
        setEditFrom(true);
      }
    } catch {
      setEditFrom(true);
    }
  }, []);

  function forgetAccount() {
    localStorage.removeItem("sponsorpilot_gmail");
    setGmailUser("");
    setGmailPass("");
    setEditFrom(true);
  }

  async function send() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body, gmailUser, gmailAppPassword: gmailPass, ...context }),
      });
      const data = await res.json();
      if (data.configured === false) {
        setEditFrom(true);
        setError("Enter your Gmail and App Password above so the broker can send from your account.");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Sending failed");
      if (gmailUser.trim() && gmailPass.trim()) {
        localStorage.setItem("sponsorpilot_gmail", JSON.stringify({ user: gmailUser.trim(), pass: gmailPass }));
      }
      onSent(to);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sending failed - try again.");
    } finally {
      setBusy(false);
    }
  }

  function copyDraft() {
    navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="send-panel">
      <div className="send-head">Review before it goes out - edit anything, replace [Name], then approve.</div>

      {editFrom ? (
        <div className="send-setup" style={{ marginBottom: 16 }}>
          <strong>Sending account</strong> - the broker sends from your own Gmail using an App Password (a special
          16-character password just for apps; your real password never touches SponsorPilot). It stays in this
          browser only.
          <details className="pw-help">
            <summary>How do I get an App Password? (~2 minutes)</summary>
            <ol>
              <li>
                Turn on 2-Step Verification if you haven&apos;t:{" "}
                <a href="https://myaccount.google.com/signinoptions/two-step-verification" target="_blank" rel="noreferrer">
                  myaccount.google.com → Security → 2-Step Verification
                </a>
              </li>
              <li>
                Open{" "}
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">
                  myaccount.google.com/apppasswords
                </a>{" "}
                (or search &quot;app passwords&quot; in your Google Account)
              </li>
              <li>Type a name like &quot;SponsorPilot&quot; and click <em>Create</em></li>
              <li>Google shows a 16-character password - copy it and paste it below (spaces are fine)</li>
            </ol>
            <p>
              Note: school or company Google accounts often have App Passwords disabled by the administrator - use a
              personal Gmail if the page says it&apos;s unavailable. You can revoke the password anytime from the same
              page.
            </p>
          </details>
          <div className="grid2" style={{ marginTop: 12 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Your Gmail address</label>
              <input value={gmailUser} onChange={(e) => setGmailUser(e.target.value)} placeholder="you@gmail.com" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>App Password (16 characters)</label>
              <input
                type="password"
                value={gmailPass}
                onChange={(e) => setGmailPass(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="from-row">
          Sending from <strong>{gmailUser}</strong>
          <button className="copy-btn" onClick={() => setEditFrom(true)}>Change</button>
          <button className="copy-btn" onClick={forgetAccount}>Forget on this device</button>
        </div>
      )}

      <div className="field">
        <label>To (sponsor&apos;s email)</label>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. sponsorships@company.com" />
      </div>
      <div className="field">
        <label>Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="field">
        <label>Message</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 180 }} />
      </div>
      <div className="deal-actions">
        <button className="copy-btn primary-btn" onClick={send} disabled={busy || !to.trim()}>
          {busy ? "Sending…" : "Approve & send ✈"}
        </button>
        <button className="copy-btn" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button className="copy-btn" onClick={copyDraft}>
          {copied ? "Copied ✓" : "Copy instead"}
        </button>
      </div>
      {error && <div className="error-msg" style={{ textAlign: "left" }}>{error}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<IntakeForm | null>(null);
  const [negotiatingIdx, setNegotiatingIdx] = useState<number | null>(null);
  const [sponsorMsg, setSponsorMsg] = useState("");
  const [negoResult, setNegoResult] = useState<NegotiationResult | null>(null);
  const [negoBusy, setNegoBusy] = useState(false);
  const [negoError, setNegoError] = useState("");
  const [negoReplySent, setNegoReplySent] = useState("");
  const [showNegoSend, setShowNegoSend] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showDeck, setShowDeck] = useState(false);

  useEffect(() => {
    try {
      const c = sessionStorage.getItem("sponsorpilot_campaign");
      const f = sessionStorage.getItem("sponsorpilot_form");
      if (c) setCampaign(JSON.parse(c));
      if (f) setForm(JSON.parse(f));
    } catch {
      /* corrupted storage - show empty state */
    }
  }, []);

  function persist(next: Campaign) {
    setCampaign(next);
    sessionStorage.setItem("sponsorpilot_campaign", JSON.stringify(next));
  }

  function updateProspect(i: number, patch: Partial<Prospect>) {
    if (!campaign) return;
    const prospects = campaign.prospects.map((p, j) => (j === i ? { ...p, ...patch } : p));
    persist({ ...campaign, prospects });
  }

  function copy(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  async function negotiate() {
    if (!campaign || !form || negotiatingIdx === null) return;
    const p = campaign.prospects[negotiatingIdx];
    setNegoBusy(true);
    setNegoError("");
    setNegoResult(null);
    setNegoReplySent("");
    setShowNegoSend(false);
    try {
      const res = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: form.orgName,
          eventName: form.eventName,
          currency: form.currency,
          prospect: p.company,
          tierContext: campaign.tiers.map((t) => `${t.name}: ${t.price}`).join("; "),
          floorDeal: `${form.floorDeal} ${form.currency}`,
          askAmount: p.estDealSize,
          sponsorMessage: sponsorMsg,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Negotiation failed");
      setNegoResult(data);
      setShowNegoSend(true);
      if (data.decision === "accept") {
        updateProspect(negotiatingIdx, { stage: "closed", closedAmount: data.proposedTerms?.amount });
      } else if (data.decision === "decline") {
        updateProspect(negotiatingIdx, { stage: "declined" });
      } else {
        updateProspect(negotiatingIdx, { stage: "negotiating" });
      }
    } catch (err) {
      setNegoError(err instanceof Error ? err.message : "Negotiation failed - try again.");
    } finally {
      setNegoBusy(false);
    }
  }

  const stats = useMemo(() => {
    if (!campaign) return { pitched: 0, negotiating: 0, closed: 0, raised: 0 };
    const closed = campaign.prospects.filter((p) => p.stage === "closed");
    const raised = closed.reduce((s, p) => s + parseAmount(p.closedAmount ?? p.estDealSize), 0);
    return {
      pitched: campaign.prospects.filter((p) => p.stage !== "researched").length,
      negotiating: campaign.prospects.filter((p) => p.stage === "negotiating").length,
      closed: closed.length,
      raised,
    };
  }, [campaign]);

  if (!campaign || !form) {
    return (
      <div className="container">
        <nav className="nav">
          <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
            Sponsor<span>Pilot</span>
          </Link>
        </nav>
        <section className="hero">
          <h1>No campaign yet</h1>
          <p className="sub">List your event first - your AI broker will build the campaign in ~30 seconds.</p>
          <Link className="cta" href="/">
            List my event - free
          </Link>
        </section>
      </div>
    );
  }

  const fmt = (n: number) => `${n.toLocaleString()} ${form.currency}`;
  const negoProspect = negotiatingIdx !== null ? campaign.prospects[negotiatingIdx] : null;

  return (
    <>
      <div className="container">
        <nav className="nav">
          <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
            Sponsor<span>Pilot</span>
          </Link>
          <span className="badge" style={{ marginBottom: 0 }}>
            Broker campaign · live
          </span>
        </nav>

        <header className="kit-header">
          {campaign.demoMode && (
            <div className="demo-banner">
              Demo mode - set GEMINI_API_KEY for live Gemini brokerage. This is a sample campaign.
            </div>
          )}
          <h1>{form.eventName} - Broker Dashboard</h1>
          <p className="tagline">{campaign.deck.tagline}</p>
          <p className="pitch">{campaign.strategy.positioning}</p>
        </header>

        <section className="stat-row">
          <div className="stat">
            <div className="stat-num">{campaign.strategy.projectedRaise}</div>
            <div className="stat-label">Projected raise</div>
          </div>
          <div className="stat">
            <div className="stat-num">{campaign.prospects.length}</div>
            <div className="stat-label">Prospects researched</div>
          </div>
          <div className="stat">
            <div className="stat-num">{stats.negotiating}</div>
            <div className="stat-label">In negotiation</div>
          </div>
          <div className="stat">
            <div className="stat-num">{fmt(stats.raised)}</div>
            <div className="stat-label">Closed deals total ({stats.closed})</div>
          </div>
        </section>

        <section className="kit-section">
          <h2>
            Broker strategy <span className="tag">how your agent will run this</span>
          </h2>
          <div className="deck-card">
            <ul>
              {campaign.strategy.approach.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
            <h4 style={{ marginTop: 16 }}>Packages the broker is selling</h4>
            <p>
              {campaign.tiers.map((t) => `${t.name} - ${t.price}`).join("  ·  ")}{" "}
              <button className="copy-btn" style={{ marginLeft: 8 }} onClick={() => setShowDeck((s) => !s)}>
                {showDeck ? "Hide deck" : "View partnership deck"}
              </button>
            </p>
            {showDeck && (
              <>
                <h4>About the event</h4>
                <p>{campaign.deck.aboutEvent}</p>
                <h4>The audience</h4>
                <ul>
                  {campaign.deck.audienceStats.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                <h4>Why sponsor</h4>
                <ul>
                  {campaign.deck.whySponsor.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                <h4>Next step</h4>
                <p>{campaign.deck.cta}</p>
                <button className="copy-btn" onClick={() => window.print()}>
                  Export deck as PDF
                </button>
              </>
            )}
          </div>
        </section>

        <section className="kit-section">
          <h2>
            Deal pipeline <span className="tag">{campaign.prospects.length} prospects · sorted by likelihood</span>
          </h2>
          {campaign.prospects.map((p, i) => (
            <ProspectCard
              key={i}
              p={p}
              idx={i}
              form={form}
              onUpdate={updateProspect}
              onNegotiate={(idx) => {
                setNegotiatingIdx(idx);
                setNegoResult(null);
                setSponsorMsg("");
                document.getElementById("nego-console")?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          ))}
        </section>

        <section className="kit-section" id="nego-console">
          <h2>
            Negotiation console <span className="tag">the agent closes, you approve</span>
          </h2>
          <div className="nego-card">
            {negotiatingIdx === null || !negoProspect ? (
              <p className="nego-hint">
                When a sponsor replies to your pitch, hit <strong>“Sponsor replied”</strong> on their card and
                paste the reply here. The agent analyzes their position, negotiates against your floor of{" "}
                <strong>
                  {form.floorDeal} {form.currency}
                </strong>
                , drafts the response, and sends it after your approval.
              </p>
            ) : (
              <>
                <div className="nego-head">
                  Negotiating with <strong>{negoProspect.company}</strong> · ask: {negoProspect.estDealSize} · your
                  floor: {form.floorDeal} {form.currency}
                </div>
                <textarea
                  className="nego-input"
                  value={sponsorMsg}
                  onChange={(e) => setSponsorMsg(e.target.value)}
                  placeholder={`Paste ${negoProspect.company}'s reply here…\n\ne.g. "Thanks for reaching out. We like the audience but our budget for this is 30,000. We'd also want to be the only telco at the event. Need an answer this month."`}
                />
                <button className="submit-btn" style={{ marginTop: 4 }} onClick={negotiate} disabled={negoBusy || !sponsorMsg.trim()}>
                  {negoBusy ? "Agent is negotiating…" : "Let the agent negotiate →"}
                </button>
                {negoBusy && (
                  <div className="gen-status">
                    <span className="spinner" />
                    Reading their position, checking your floor, drafting the move
                  </div>
                )}
                {negoError && <div className="error-msg">{negoError}</div>}
              </>
            )}

            {negoResult && negoProspect && (
              <div className="nego-result">
                <div className={`decision-badge ${negoResult.decision}`}>
                  {negoResult.decision === "counter" && "↩ Counter-offer"}
                  {negoResult.decision === "accept" && "✓ Deal closed"}
                  {negoResult.decision === "decline" && "✕ Walk away"}
                  {negoResult.decision === "escalate" && "⚠ Needs your call"}
                  <span className="decision-amount">{negoResult.proposedTerms.amount}</span>
                </div>
                <h4>Agent&apos;s read</h4>
                <p>{negoResult.analysis}</p>
                <h4>Proposed terms</h4>
                <ul>
                  {negoResult.proposedTerms.deliverables.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
                <h4>Reply - approve to send</h4>
                {negoReplySent ? (
                  <p className="closed-line">✓ Reply sent to {negoReplySent}</p>
                ) : showNegoSend ? (
                  <SendPanel
                    defaultTo={negoProspect.sentTo}
                    defaultSubject={negoResult.replyEmail.subject}
                    defaultBody={negoResult.replyEmail.body}
                    context={{ prospect: negoProspect.company, eventName: form.eventName, orgName: form.orgName }}
                    onSent={(to) => setNegoReplySent(to)}
                    onCancel={() => setShowNegoSend(false)}
                  />
                ) : (
                  <button className="copy-btn primary-btn" onClick={() => setShowNegoSend(true)}>
                    Review & send reply
                  </button>
                )}
                {negoResult.agreement && (
                  <>
                    <h4>Sponsorship agreement - auto-drafted</h4>
                    <div className="email-card agreement" style={{ marginBottom: 0 }}>
                      <pre>{negoResult.agreement}</pre>
                      <button className="copy-btn" onClick={() => copy("agreement", negoResult.agreement!)}>
                        {copied === "agreement" ? "Copied ✓" : "Copy agreement"}
                      </button>
                    </div>
                    <p className="nego-hint" style={{ marginTop: 12 }}>
                      Next: send the agreement for signature. The sponsor pays your organization directly under the
                      terms above.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="kit-actions">
          <Link className="secondary" href="/">
            List another event
          </Link>
        </div>
      </div>

      <footer>
        <div className="container">SponsorPilot - the AI sponsorship broker. Powered by Gemini.</div>
      </footer>
    </>
  );
}

function ProspectCard({
  p,
  idx,
  form,
  onUpdate,
  onNegotiate,
}: {
  p: Prospect;
  idx: number;
  form: IntakeForm;
  onUpdate: (idx: number, patch: Partial<Prospect>) => void;
  onNegotiate: (idx: number) => void;
}) {
  const [sending, setSending] = useState(false);
  return (
    <div className={`deal-card stage-${p.stage}`}>
      <div className="deal-top">
        <div>
          <h3>{p.company}</h3>
          <div className="cat">
            {p.category} · est. {p.estDealSize}
          </div>
        </div>
        <div className={`stage-pill stage-${p.stage}`}>{STAGES.find((s) => s.id === p.stage)?.label}</div>
      </div>
      <p>
        <strong>Why they fit:</strong> {p.whyFit}
      </p>
      <p>
        <strong>Broker&apos;s angle:</strong> {p.pitchAngle}
      </p>
      {p.sentTo && (
        <p className="closed-line">✓ Pitch sent to {p.sentTo}</p>
      )}
      {p.stage === "closed" && p.closedAmount && (
        <p className="closed-line">
          Closed at <strong>{p.closedAmount}</strong> - agreement drafted, sponsor pays your organization directly.
        </p>
      )}
      <div className="deal-actions">
        {p.stage === "researched" && !sending && (
          <button className="copy-btn primary-btn" onClick={() => setSending(true)}>
            Review &amp; send pitch
          </button>
        )}
        {(p.stage === "contacted" || p.stage === "negotiating") && (
          <button className="copy-btn primary-btn" onClick={() => onNegotiate(idx)}>
            Sponsor replied → negotiate
          </button>
        )}
      </div>
      {sending && (
        <SendPanel
          defaultSubject={p.outreachSubject}
          defaultBody={p.outreachBody}
          context={{ prospect: p.company, eventName: form.eventName, orgName: form.orgName }}
          onSent={(to) => {
            setSending(false);
            onUpdate(idx, { stage: "contacted", sentTo: to });
          }}
          onCancel={() => setSending(false)}
        />
      )}
    </div>
  );
}
