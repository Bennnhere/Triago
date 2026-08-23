/* Triago landing page: a composed developer-product narrative with operational proof instead of generic AI motifs. */
import { Link } from "wouter";
import { Activity, ArrowRight, BellRing, BrainCircuit, Check, ChevronRight, CircleAlert, Clock3, Database, Layers3, Radar, Search, ShieldCheck, Sparkles, Wrench } from "lucide-react";

const capabilities = [
  { icon: Layers3, label: "Alert Correlation", detail: "Signals → one incident" },
  { icon: Search, label: "Autonomous Investigation", detail: "Evidence, not guesswork" },
  { icon: BrainCircuit, label: "Incident Memory", detail: "Lessons preserved" },
  { icon: ShieldCheck, label: "Safe Remediation", detail: "Verify before closing" },
];

const workflow = [
  ["01", "Detect", "Triago receives incoming alerts."],
  ["02", "Correlate", "Related alerts become one actionable incident."],
  ["03", "Investigate", "Logs, deployments and service health are queried."],
  ["04", "Remember", "Historical incidents and successful remediations are searched."],
  ["05", "Decide", "Known and safe is remediated; novel and unsafe is escalated."],
  ["06", "Verify", "Recovery is checked against live service health."],
  ["07", "Notify", "The responsible engineer or infrastructure team receives the outcome."],
];

const features = [
  [Layers3, "Intelligent Alert Correlation", "Turn hundreds of related alerts into a single actionable incident."],
  [Search, "Autonomous Investigation", "Triago dynamically investigates incidents using the available operational tools."],
  [BrainCircuit, "Incident Memory", "Retrieve similar historical incidents and their successful resolutions."],
  [Wrench, "Autonomous Resolution", "Apply known, safe fixes and verify the result before closing the loop."],
  [ShieldCheck, "Safe Escalation", "Unknown or unsafe incidents are investigated and escalated with complete context."],
  [BellRing, "Intelligent Notifications", "Notify responsible engineers and route hardware incidents to infrastructure teams."],
];

function EntranceOverlay() {
  return <div className="triago-entrance" aria-hidden="true"><div className="entrance-panel entrance-panel-top" /><div className="entrance-panel entrance-panel-bottom" /><div className="entrance-line" /></div>;
}

function MiniIncidentConsole() {
  const stages = [
    ["done", "Logs investigated"], ["done", "Deployment history checked"], ["done", "Similar incident found"], ["active", "Applying known resolution…"], ["pending", "Verifying service health"],
  ];
  return <div className="hero-console" aria-label="Live-looking incident investigation preview"><div className="hero-console-bar"><span className="live-dot" /> INCIDENT #1042 <span className="hero-console-live">LIVE TRIAGE</span></div><div className="hero-console-main"><div><span className="severity-dot critical" /> CHECKOUT SERVICE DEGRADATION</div><strong>47 alerts <span>correlated</span></strong></div><div className="hero-stages">{stages.map(([state, label]) => <div className={`hero-stage ${state}`} key={label}>{state === "done" ? <Check size={13} /> : state === "active" ? <Activity size={13} /> : <Clock3 size={13} />}<span>{label}</span><i /></div>)}</div><div className="hero-console-footer"><span>Memory match <b>94%</b></span><span>Owner <b>Rahul M.</b></span></div></div>;
}

export default function Landing() {
  return <div className="landing-shell"><EntranceOverlay /><header className="site-nav"><Link href="/" className="brand"><span className="brand-glyph"><i /><i /><i /></span><span>TRIAGO</span></Link><nav><a href="#product">Product</a><a href="#workflow">How It Works</a><a href="#features">Features</a><Link href="/app">Incidents</Link></nav><div className="nav-auth-actions"><Link href="/app" className="nav-cta">Open Command Center <ArrowRight size={15} /></Link></div></header>
    <main>
      <section className="landing-hero" id="product"><div className="hero-copy"><h1>Your First Responder When <em>Production</em> <span className="hero-breaks">Breaks.</span></h1><p>Triago autonomously investigates incidents, learns from past resolutions, and takes action — so small engineering teams can spend less time firefighting and more time building.</p><div className="hero-actions"><Link href="/app" className="button primary">Launch Triago <ArrowRight size={17} /></Link><a href="#workflow" className="button secondary">See How It Works <ChevronRight size={17} /></a></div><div className="hero-trust"><span><Check size={14} /> Investigates with evidence</span><span><Check size={14} /> Escalates safely when uncertain</span></div></div><MiniIncidentConsole /><div className="signal-translation" aria-label="Triago turns raw signals into a verified operational outcome"><div className="signal-intake"><span>RAW INTAKE</span><b>47 alerts</b><i /><i /><i /></div><div className="signal-aperture"><span>TRIAGE GATE</span><i /></div><div className="signal-output"><span>COMPOSED OUTPUT</span><b>1 verified incident</b><em>owner notified</em></div></div></section>
      <section className="capability-strip">{capabilities.map(({ icon: Icon, label, detail }) => <div className="capability" key={label}><span><Icon size={18} /></span><div><strong>{label}</strong><small>{detail}</small></div></div>)}</section>
      <section className="problem-section"><div className="section-heading"><span className="section-kicker">THE OPERATIONAL GAP</span><h2>Alerts tell you something is wrong. <em>Triago finds out why.</em></h2></div><div className="workflow-comparison"><div className="comparison-card old"><div className="comparison-title"><CircleAlert size={19} /> Traditional response <span>100 alerts</span></div><div className="manual-chain">{["Engineer checks dashboard", "Checks logs", "Checks deployments", "Searches previous incidents", "Investigates manually", "Finds cause", "Resolves"].map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></div>)}</div></div><div className="comparison-divider"><ArrowRight size={20} /></div><div className="comparison-card triago"><div className="comparison-title"><Sparkles size={19} /> Triago response <span>one incident</span></div><div className="triago-chain">{["Alerts", "Correlate", "Investigate", "Remember", "Decide", "Act", "Verify", "Notify"].map((item) => <span key={item}>{item}<i /></span>)}</div><p>One coherent workflow, with an engineer receiving the completed context.</p></div></div></section>
      <section className="lifecycle-section" id="workflow"><div className="section-heading centered"><span className="section-kicker">HOW TRIAGO WORKS</span><h2>From raw signal to a verified outcome.</h2><p>Every stage produces observable operational evidence — never hidden reasoning.</p></div><div className="lifecycle-line">{workflow.map(([index, title, detail], i) => <article className="lifecycle-step" key={title}><span className="step-number">{index}</span><div className="step-icon">{i === 0 ? <Radar size={17} /> : i === 3 ? <BrainCircuit size={17} /> : i === 6 ? <BellRing size={17} /> : <ChevronRight size={17} />}</div><h3>{title}</h3><p>{detail}</p></article>)}</div></section>
      <section className="features-section" id="features"><div className="section-heading"><span className="section-kicker">BUILT FOR THE INCIDENT LOOP</span><h2>Operational confidence, without an operations team.</h2></div><div className="feature-grid">{features.map(([Icon, title, description]) => <article className="feature-card" key={title as string}><span className="feature-icon"><Icon size={20} /></span><h3>{title as string}</h3><p>{description as string}</p><span className="feature-link">Explore capability <ArrowRight size={14} /></span></article>)}</div></section>
      <section className="preview-section"><div className="section-heading"><span className="section-kicker">COMMAND CENTER</span><h2>See Triago in action.</h2><p>A calm command center for active incidents, evidence, ownership, and completed work.</p></div><div className="product-frame"><div className="frame-top"><span /><span /><span /><b>triago / command-center</b></div><div className="preview-app"><aside><div className="preview-logo">T</div>{["Overview", "Incidents", "Memory", "Notifications", "Analytics"].map((item, i) => <div className={i === 0 ? "selected" : ""} key={item}>{item}</div>)}</aside><div className="preview-body"><div className="preview-topline"><div><small>OVERVIEW</small><h3>Autonomous Incident Response</h3></div><span className="system-ok"><i /> All systems operational</span></div><div className="preview-metrics">{[["03", "Active incidents"], ["18", "Resolved this week"], ["72", "Alerts correlated"], ["61%", "Auto-resolved"]].map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div><div className="preview-incidents"><div className="preview-label">ACTIVE INCIDENTS</div><div><span className="severity-dot critical" /><b>Checkout Service Degradation</b><small>47 alerts · Investigating</small><em>View incident →</em></div><div><span className="severity-dot hardware" /><b>Database Server DB-03</b><small>6 alerts · Infrastructure notified</small><em>View incident →</em></div></div></div></div></div><Link href="/app" className="button primary preview-cta">Open Command Center <ArrowRight size={17} /></Link></section>
      <section className="final-cta"><div><span className="section-kicker">INCIDENTS WILL HAPPEN</span><h2>Make the response feel smaller.</h2><p>Give your engineering team an autonomous first responder that investigates, remembers, acts safely, and keeps the right people informed.</p></div><Link href="/app" className="button primary">Launch Triago <ArrowRight size={17} /></Link></section>
    </main><footer className="site-footer"><div><span className="brand"><span className="brand-glyph"><i /><i /><i /></span><span>TRIAGO</span></span><p>Autonomous incident response for modern engineering teams.</p></div><div className="footer-links"><a href="#product">Product</a><a href="#workflow">How it works</a><a href="#features">Features</a><Link href="/app">Command Center</Link></div><small>© 2026 Triago. All rights reserved.</small></footer></div>;
}
