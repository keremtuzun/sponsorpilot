"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "agent";
  text: string;
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "agent", text: "This is SponsorPilot's AI support agent. Ask about how campaigns, negotiation or sending work." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [msgs, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...msgs, { role: "user", text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "agent", text: data.reply ?? "Sorry, something went wrong." }]);
    } catch {
      setMsgs((m) => [...m, { role: "agent", text: "Sorry, I hit a snag. Please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="support-widget">
      {open && (
        <div className="support-panel">
          <div className="support-head">
            <div>
              <strong>Support</strong>
              <div className="support-sub">Answered by an AI agent</div>
            </div>
            <button className="support-close" onClick={() => setOpen(false)} aria-label="Close chat">
              Close
            </button>
          </div>
          <div className="support-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.text}
              </div>
            ))}
            {busy && <div className="bubble agent typing">…</div>}
          </div>
          <div className="support-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about fees, deals, payouts…"
            />
            <button onClick={send} disabled={busy}>
              Send
            </button>
          </div>
        </div>
      )}
      <button className="support-fab" onClick={() => setOpen((o) => !o)} aria-label="Open support chat">
        {open ? "Close" : "Ask a question"}
      </button>
    </div>
  );
}
