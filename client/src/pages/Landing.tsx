/* Triago landing: a cinematic incident-response narrative built around evidence entering and verified decisions leaving. */
import { Activity, ArrowRight, BellRing, BrainCircuit, Check, ChevronRight, CircleAlert, Database, FileSearch, Layers3, Radar, ScanSearch, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "wouter";

const pressurePoints = [
  ["01", "Alert overload", "Many signals arrive at once; they do not arrive as a coherent incident."],
  ["02", "Evidence burden", "Logs, deployments, memory, and health checks must be assembled before action is safe."],
  ["03", "Repeated failure", "Previous incidents hold useful context, but only if it can be retrieved when the next event arrives."],
  ["04", "Human attention", "Small teams need a system that can act confidently—and know when to involve the right person."],
];

const loop: Array<[string, string, LucideIcon]> = [
  ["01", "Detect", Radar], ["02", "Correlate", Layers3], ["03", "Investigate", ScanSearch], ["04", "Remember", BrainCircuit], ["05", "Decide", Sparkles], ["06", "Act", Wrench], ["07", "Verify / Escalate", ShieldCheck],
];

const tools = [
  ["01", "search_incident_memory", "Retrieve a comparable incident and prior resolution."],
  ["02", "query_deploy_history", "Test whether a recent change supports the observed signature."],
  ["03", "check_service_health", "Verify whether remediation restored the affected service."],
  ["04", "notify_engineer", "Attach a completed evidence package to the right owner."],
];

function EntranceOverlay() {
  return <div className="triago-entrance" aria-hidden="true"><div className="entrance-panel entrance-panel-top" /><div className="entrance-panel entrance-panel-bottom" /><div className="entrance-line" /></div>;
}

function AgentVisualization() {
  return <div className="agent-visual" aria-label="Illustration of Triago investigating an incident through logs, deployment history, memory, and service health">
    <div className="agent-visual-top"><span className="visual-live-dot" /> INCIDENT SIGNAL RECEIVED <time>LIVE</time></div>
    <div className="agent-alert-lane"><span>ALERT</span><i /><i /><i /><b>47 incoming signals</b></div>
    <div className="agent-core"><span className="core-orbit orbit-one" /><span className="core-orbit orbit-two" /><div><small>AUTONOMOUS</small><strong>TRIAGO</strong><em>AGENT</em></div></div>
    <div className="agent-branches"><article><FileSearch size={17} /><span>LOGS</span><i /></article><article><Layers3 size={17} /><span>DEPLOYMENT</span><i /></article><article><BrainCircuit size={17} /><span>MEMORY</span><i /></article><article><Activity size={17} /><span>HEALTH</span><i /></article></div>
    <div className="agent-decision"><span>ROOT CAUSE EVALUATED</span><div><b>SAFE TO ACT</b><i /><em>VERIFYING SERVICE HEALTH</em></div></div>
  </div>;
}

export default function Landing() {
  return <div className="cinematic-landing"><EntranceOverlay /><header className="site-nav cinematic-nav"><Link href="/" className="brand"><span className="brand-glyph"><i /><i /><i /></span><span>TRIAGO</span></Link><nav><a href="#why">Why Triago</a><a href="#agent">The agent loop</a><a href="#workflow">Workflow</a><Link href="/app">Command center</Link></nav><Link href="/app" className="nav-cta">Open Command Center <ArrowRight size={15} /></Link></header>
    <main>
      <section className="cinematic-hero" id="top"><div className="hero-noise" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><div className="hero-copy"><span className="operational-kicker"><i /> AUTONOMOUS INCIDENT RESPONSE</span><h1>Your First Responder When <em>Something</em> <span className="hero-breaks">Breaks.</span></h1><p>Triago turns a noisy production event into an evidence-led decision: investigate the system, remember what worked, act safely, and verify the result.</p><div className="hero-actions"><Link href="/app" className="button primary">Open Command Center <ArrowRight size={17} /></Link><a href="#agent" className="button cinematic-secondary">Watch the agent loop <ChevronRight size={17} /></a></div><div className="hero-evidence"><span><Check size={14} /> Evidence before action</span><span><Check size={14} /> Safe escalation when uncertain</span></div></div><AgentVisualization /><div className="hero-gate-story"><div><span>RAW INTAKE</span><b>Signal density</b><small>alerts · logs · deployments</small></div><i><em>TRIAGO</em></i><div><span>COMPOSED OUTCOME</span><b>Verified decision</b><small>resolve · notify · escalate</small></div></div></section>

      <section className="pressure-section" id="why"><div className="editorial-heading"><span>THE OPERATIONAL PROBLEM</span><h2>Alerts describe a symptom.<br /><em>They do not do the investigation.</em></h2><p>Triago gives a small engineering team a calm first responder between the alert and the pager.</p></div><div className="pressure-grid">{pressurePoints.map(([index, title, text]) => <article key={index}><span>{index}</span><h3>{title}</h3><p>{text}</p><i /></article>)}</div><div className="pressure-outcome"><span className="signal-cluster"><i /><i /><i /><i /><i /></span><p>Noise enters as many disconnected signals.</p><ArrowRight size={22} /><p><b>Triago produces one inspectable operational decision.</b></p></div></section>

      <section className="agent-section" id="agent"><div className="agent-section-head"><div><span className="operational-kicker"><i /> THE AUTONOMOUS LOOP</span><h2>Tools are not decoration.<br />They are <em>evidence.</em></h2></div><p>Each decision is grounded in observable agent work. Triago inspects the system, checks history, searches incident memory, and only then resolves or escalates.</p></div><div className="tool-ledger"><div className="tool-ledger-rail"><span>INVESTIGATION TRACE</span><i /><i /><i /><i /></div><div className="tool-ledger-items">{tools.map(([index, tool, detail], toolIndex) => <article key={tool}><span>{index}</span><div><small>AGENT TOOL CALL</small><h3>{tool}</h3><p>{detail}</p></div><em className={toolIndex === 3 ? "complete" : "active"}>{toolIndex === 3 ? "NOTIFIED" : "INSPECTED"}</em></article>)}</div><aside className="agent-verdict"><span>DECISION FRAME</span><h3>Known signature.<br />Safe remediation.</h3><p>When the evidence aligns, Triago resolves and verifies. When it does not, the system preserves the context and escalates it.</p><div><Check size={16} /> Root cause evaluated</div><div><Check size={16} /> Owner context attached</div></aside></div></section>

      <section className="loop-section" id="workflow"><div className="editorial-heading centered"><span>THE RESPONSE SEQUENCE</span><h2>From signal to a decision<br />you can <em>inspect.</em></h2></div><div className="response-loop">{loop.map(([index, label, StepIcon], indexPosition) => <article key={label}><span>{index}</span><div><StepIcon size={18} /></div><h3>{label}</h3>{indexPosition !== loop.length - 1 && <i />}</article>)}</div><div className="loop-caption"><span>TRIAGO DOES NOT STOP AT NOTIFICATION.</span><p>Detect → investigate → decide → act → verify—or attach the evidence to a safe escalation.</p></div></section>

      <section className="command-callout"><div className="command-callout-grid"><span className="callout-index">LIVE / 01</span><div><span className="operational-kicker"><i /> COMMAND CENTER</span><h2>See the work<br /><em>while it is happening.</em></h2><p>Live activity, the investigation graph, incident memory, evidence, outcomes, and ownership live in one operational record.</p><Link href="/app" className="button cream">Enter the command center <ArrowRight size={17} /></Link></div><div className="callout-panel"><div><span className="visual-live-dot" /> AGENT ACTIVITY <time>STREAMING</time></div><p><b>01</b> Correlating incoming signals</p><p><b>02</b> Searching incident memory</p><p><b>03</b> Validating service health</p><p className="outcome"><Check size={15} /> Decision ready for review</p></div></div></section>
    </main>
    <footer className="cinematic-footer"><div className="footer-wordmark">TRIAGO</div><div className="footer-main"><div><span>YOUR FIRST RESPONDER</span><h2>When Something<br />Breaks.</h2></div><div className="footer-links"><a href="#why">Why Triago</a><a href="#agent">The agent loop</a><a href="#workflow">Workflow</a><Link href="/app">Command Center</Link></div></div><div className="footer-bottom"><span>© 2026 TRIAGO</span><span>CALM, EVIDENCE-LED INCIDENT RESPONSE</span><span>BUILT FOR THE OPERATIONAL LOOP</span></div></footer>
  </div>;
}
