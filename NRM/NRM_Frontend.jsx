import { useState } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: "#070f1a",
  surface: "#0d1b2a",
  surfaceAlt: "#122333",
  surfaceHover: "#172a3e",
  border: "#1a3048",
  borderLight: "#22405e",
  accent: "#c8922a",
  accentBright: "#f0b429",
  accentGlow: "rgba(200,146,42,0.15)",
  text: "#dce8f0",
  textMuted: "#6b90aa",
  textDim: "#3d6278",
  green: "#22c55e",
  greenDim: "rgba(34,197,94,0.12)",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.12)",
  blue: "#38bdf8",
  blueDim: "rgba(56,189,248,0.1)",
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const DEPT = {
  name: "Mos-NT",
  unit: "Risk Management",
  objective: "To establish a powerful National Risk Management framework within public sector entities fostering a strong risk culture and ensuring regulatory compliance",
  year: "2025/2026",
};

const RISKS = [
  { id:1, rank:7, event:"Inactive risk management key players", csf:"Risk management key players (champions, coordinators, Internal Auditor, management)", source:"Low risk awareness; insufficient training; uncommitted leadership; limited resources", effect:"Poor decision making; organizational dysfunction; reputational damage", likelihood_i:5, consequence_i:4, irl:20, controls:"Scheduled risk management training; risk awareness strategy; follow-ups with trained entities", likelihood_r:4, consequence_r:2, rrl:8, evaluation:"Accept", movement:"→" },
  { id:2, rank:5, event:"Insufficient logistical support", csf:"Logistics (Office, equipment, transport)", source:"Poor communication; supply chain disruptions; procurement inefficiencies", effect:"Operational downtime; safety hazards; poor service delivery", likelihood_i:4, consequence_i:4, irl:16, controls:"Early booking; regular reminders; proper planning", likelihood_r:2, consequence_r:3, rrl:6, evaluation:"Accept", movement:"↓" },
  { id:3, rank:1, event:"Inconsistent regulations & policies governing risk management across MDAs", csf:"Laws, regulations, guidelines, standards & procedures", source:"Legislative gaps; outdated legal instruments; unenforceable laws", effect:"Irrelevancy in implementation; regulatory non-compliance", likelihood_i:5, consequence_i:5, irl:25, controls:"Aligning RM guidelines, policies and procedures to Ministerial order", likelihood_r:4, consequence_r:5, rrl:20, evaluation:"Treat", treatment:"Continuous implementation of clear and concise risk management laws, regulations, guidelines and procedures", due:"31 Dec 2023", responsibility:"National Risk Management Analyst & AG", movement:"→" },
  { id:4, rank:6, event:"Limited capacity among risk management key players", csf:"Trainings: accessible, well-equipped, regular, harmonized", source:"Inefficient leadership; insufficient resources; unequipped training facilities", effect:"Failure to conduct training; incompetent risk owners; inability to control risk efficiently", likelihood_i:5, consequence_i:4, irl:20, controls:"Establish and implement risk management training plan for all key players", likelihood_r:4, consequence_r:3, rrl:12, evaluation:"Treat", treatment:"Regular and sufficient trainings to MDAs on risk management", due:"30 Jun 2026", responsibility:"National Risk Management Analyst", movement:"↑" },
  { id:5, rank:4, event:"National Risk Management function not adequately structured & staffed", csf:"Personnel: Well structured, skilled, committed, competent", source:"Inadequate structure at national and entity level; limited technical expertise", effect:"Poor performance of risk management function; poor risk culture in public entities", likelihood_i:5, consequence_i:4, irl:20, controls:"Provision of trainings; access to mentors; securing budget for technical support", likelihood_r:4, consequence_r:4, rrl:16, evaluation:"Treat", treatment:"Advanced training; convert Professional Interns to Contractual Staff (Sector Specialists)", due:"30 Jun 2026", responsibility:"National Risk Management Analyst", movement:"→" },
  { id:6, rank:2, event:"Managerial Reluctance to incorporate risk management practices in MDA's operations", csf:"Public sector entities: Risk aware culture, compliance, commitment, transparency", source:"Insufficient promotion of risk awareness; no sanctions for non-compliance", effect:"Low level of risk maturity; delayed risk identification; poor entity performance", likelihood_i:5, consequence_i:5, irl:25, controls:"Issue guidelines; conduct awareness and follow-ups with non-reporting entities", likelihood_r:4, consequence_r:4, rrl:16, evaluation:"Treat", treatment:"Design and implement a strategic risk culture transformation program across public sector entities", due:"30 Jun 2026", responsibility:"National Risk Management Analyst", movement:"↑" },
  { id:7, rank:3, event:"User-unfriendly toolkit", csf:"Risk Management toolkit: user-friendly, accurate, comprehensive", source:"Inconsistent data format; limited data expertise; automation budget not secured", effect:"Data entry errors; gap in risk analysis; time-consuming reporting; poor user engagement", likelihood_i:5, consequence_i:4, irl:20, controls:"Enforce data standardized format; review toolkits for user-friendliness", likelihood_r:4, consequence_r:4, rrl:16, evaluation:"Treat", treatment:"Automation of risk management toolkit (system)", due:"30 Jun 2026", responsibility:"National Risk Management Analyst", movement:"↓" },
];

const KRIS = [
  { riskId:1, kri:"% of trained entities where involvement of key players is not traceable/evident", frequency:"Quarterly", green:0.5, amber:0.8, direction:"lower", responsibility:"Risk Champion", entries:{ Q4:{value:0.83,comments:"13/47 trained entities have not approved policies. 7 Risk Coordinators did not comply.",status:"WIP"}, Q1:{value:0.95,comments:null,status:"Select one"}, Q2:{value:0.96,comments:null,status:"Select one"} } },
  { riskId:2, kri:"Number of RM activities whose facilitation requests were delayed or not serviced", frequency:"Quarterly", green:2, amber:5, direction:"lower", responsibility:"Risk Champion", entries:{ Q4:{value:6,comments:"Multiple denials of boardroom and projector access.",status:"Completed"}, Q1:{value:0,comments:null,status:null}, Q2:{value:0,comments:null,status:null} } },
  { riskId:3, kri:"Number of outdated risk management legal instruments (laws, orders, regulations, guidelines)", frequency:"Annually", green:0, amber:1, direction:"lower", responsibility:"Risk Champion", entries:{ Q4:{value:2,comments:"MO delayed 18 months; old guidelines still in use.",status:"Overdue"}, Q1:{value:2,comments:"MO still pending.",status:"Overdue"}, Q2:{value:2,comments:"MO and guidelines still pending.",status:"Overdue"} } },
  { riskId:4, kri:"Number of public entities that failed to produce the risk report", frequency:"Quarterly", green:0, amber:1, direction:"lower", responsibility:"Risk Champion", entries:{ Q4:{value:0,comments:null,status:null}, Q1:{value:0,comments:null,status:"Select one"}, Q2:{value:0,comments:null,status:"Select one"} } },
  { riskId:5, kri:"Number of missing personnel with expertise in National Risk Management Function", frequency:"Quarterly", green:1, amber:3, direction:"lower", responsibility:"Risk Champion", entries:{ Q4:{value:0,comments:null,status:"Select one"}, Q1:{value:0,comments:null,status:"Select one"}, Q2:{value:0,comments:null,status:"Select one"} } },
  { riskId:6, kri:"% of trained public entities that failed to produce risk report", frequency:"Quarterly", green:3, amber:10, direction:"lower", responsibility:"Risk Champion", entries:{ Q4:{value:0,comments:null,status:null}, Q1:{value:1,comments:"HEC failed to provide Risk Report.",status:"Overdue"}, Q2:{value:0,comments:null,status:null} } },
  { riskId:7, kri:"Percentage of user feedback on toolkit that is unfavorable", frequency:"Quarterly", green:0.2, amber:0.55, direction:"lower", responsibility:"Risk Champion", entries:{ Q4:{value:0.60,comments:"Majority struggling with risk management tools.",status:"Select one"}, Q1:{value:0.70,comments:"Concept note approved by MoS NT.",status:"WIP"}, Q2:{value:0.70,comments:"Awaiting budget inclusion.",status:"WIP"} } },
];

const KPIS = [
  { kpi:"Percentage of PSEs that adopted National Risk Management framework", frequency:"Quarterly", green:0.8, amber:0.6, direction:"higher", responsibility:"National Risk Management Analyst", entries:{ Q4:{value:1.0}, Q1:{value:null}, Q2:{value:null} } },
  { kpi:"Percentage of PSE employees receiving Risk Management Trainings", frequency:"Quarterly", green:0.9, amber:0.6, direction:"higher", responsibility:"National Risk Management Analyst", entries:{ Q4:{value:null}, Q1:{value:null}, Q2:{value:null} } },
  { kpi:"% of PSEs with risk registers that provide risk report", frequency:"Quarterly", green:0.9, amber:0.6, direction:"higher", responsibility:"National Risk Management Analyst", entries:{ Q4:{value:null}, Q1:{value:null}, Q2:{value:null} } },
];

const TREATMENT_PLANS = [
  { riskId:3, action:"Continuous implementation of clear and concise risk management laws, regulations, guidelines and procedures", due:"31 Dec 2023", responsibility:"National Risk Management Analyst & AG", quarters:{ Q4:{status:"Overdue",comments:"Draft MO and Guidelines prepared but not published."}, Q1:{status:"Overdue",comments:"MO deadline passed. Guidelines awaiting MO issuance."}, Q2:{status:"Overdue",comments:"MO and guidelines still pending."} } },
  { riskId:4, action:"Regular and sufficient trainings to MDAs on risk management", due:"30 Jun 2026", responsibility:"National Risk Management Analyst", quarters:{ Q4:{status:"WIP",comments:"Some PSEs supported. Need for technical assistance remains."}, Q1:{status:"Overdue",comments:"On-job trainings achieved. Advanced training not yet received."}, Q2:{status:"WIP",comments:"On-job trainings ongoing. Advanced training advocacy in progress."} } },
  { riskId:5, action:"Advanced training; establish structure by converting Professional Interns to Contractual Staff (Sector Specialists)", due:"30 Jun 2026", responsibility:"National Risk Management Analyst", quarters:{ Q4:{status:"WIP",comments:"ToT session conducted for 10 interns; budget not secured."}, Q1:{status:"WIP",comments:"Budget request in progress. Risk Management project proposal being prepared."}, Q2:{status:"WIP",comments:"Budget request ongoing. Awaiting revised budget for FY 2025/2026."} } },
  { riskId:6, action:"Design and implement a strategic risk culture transformation program across public sector entities", due:"30 Jun 2026", responsibility:"National Risk Management Analyst", quarters:{ Q4:{status:"WIP",comments:"Some PSEs at Risk Defined, others at Risk Awareness level."}, Q1:{status:"Overdue",comments:"MO issuance delayed beyond Sept deadline."}, Q2:{status:"Overdue",comments:"MO and guidelines still pending."} } },
  { riskId:7, action:"Automation of risk management toolkit (system)", due:"30 Jun 2026", responsibility:"National Risk Management Analyst", quarters:{ Q4:{status:"Not Started",comments:"Budget for 2 consultants not secured in FY 2025/2026."}, Q1:{status:"WIP",comments:"Concept note prepared and approved by MoS NT. Awaiting revised budget."}, Q2:{status:"WIP",comments:"Concept note approved. Awaiting budget inclusion in revised budget."} } },
];

const COMPLIANCE = [
  { riskId:1, control:"Carrying out follow-ups with trained entities where players are consistently inactive", question:"Confirm that follow-ups with trained entities where players are consistently inactive has been carried out", frequency:"Quarterly", responses:{ Q4:"Yes", Q1:"Yes", Q2:"Yes" } },
  { riskId:2, control:"Proper Planning", question:"Confirm that proper planning was done", frequency:"Quarterly", responses:{ Q4:"Yes", Q1:"Yes", Q2:"Yes" } },
  { riskId:3, control:"Aligning RM guidelines, policies and procedures to the Ministerial order, RM standard and Organic law", question:"Confirm that RM guidelines, policies and procedures has been aligned to the Ministerial order, RM standard and Organic law", frequency:"Annually", responses:{ Q4:"Yes", Q1:"Yes", Q2:"Yes" } },
  { riskId:4, control:"Establishing and effectively implement risk management training plan for all key players across MDAs", question:"Confirm that effective collaboration with PSE on risk management training is being done", frequency:"Quarterly", responses:{ Q4:"No", Q1:"Yes", Q2:"Yes" }, noComment:{ Q4:"3/6 PSEs met requirements; 2 pending" } },
  { riskId:5, control:"Securing budget for technical support; conducting ToT sessions for Risk Management Staffs", question:"Confirm that the budget for technical support is secured; ToT sessions conducted; proper structure established", frequency:"Annually", responses:{ Q4:"Yes", Q1:"Yes", Q2:"Yes" } },
  { riskId:6, control:"Conducting awareness and follow-ups with entities consistently not reporting", question:"Confirm that awareness and follow-ups with entities consistently not reporting has been conducted", frequency:"Quarterly", responses:{ Q4:"Yes", Q1:"Yes", Q2:"Yes" } },
  { riskId:7, control:"Review the toolkits for user-friendliness and make adjustments where necessary", question:"Confirm that user-friendly risk management toolkit in PSE has been provided", frequency:"Annually", responses:{ Q4:"Yes", Q1:"Yes", Q2:"Yes" } },
];

const INCIDENTS = [
  { id:1, serial:1, quarter:"Q4", details:"Cancelling of Q3 Risk Management Report of the Senate. Units provided inaccurate information; reports could not be validated. Entire institution's Risk in Motion was cancelled.", date:"04 Jun 2025", location:"MINECOFIN", financial:false, action:"3-day session provided to improve awareness on Risk Data Recording and Reporting.", riskEvent:"Managerial Reluctance to incorporate risk management practices in MDA's operations", causes:"Insufficient risk awareness promotion; no sanctions for non-compliance", effects:"Low risk maturity; delayed risk identification; poor entity performance", corrective:"Ensure all Senior Managers are trained before proceeding with Risk Registers" },
  { id:2, serial:2, quarter:"Q4", details:"Budget for technical assistance and automation not secured in FY 2025/2026.", date:"30 Jun 2025", location:"MINECOFIN", financial:false, action:"Preparing request to secure budget for technical assistance and automation in revised budget for FY 25/26.", riskEvent:"Limited capacity among risk management key players", causes:"Limited data expertise; fear of change; budget not secured", effects:"Limited monitoring and reporting of risks across Public Sector Entities", corrective:"Request approved by MoS NT; waiting for inclusion in revised budget" },
  { id:3, serial:1, quarter:"Q1", details:"HEC could not produce Q4 Risk Report. Risk Owners claimed not to understand Risk Management. Most Risk Owners were new and did not attend previous sessions.", date:"22–25 Jul 2025", location:"HEC Headquarters", financial:false, action:"Conducting Risk Management Awareness to HEC Senior Management and all Risk Owners.", riskEvent:"Limited capacity among risk management key players", causes:"Lack of law enforcing risk management implementation among public entities", effects:"Low risk maturity; delayed risk identification and response", corrective:"Fast-track issuance of the MO on PFM" },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const kriStatus = (value, green, amber, dir) => {
  if (value === null || value === undefined) return null;
  if (dir === "lower") {
    if (value <= green) return "green";
    if (value <= amber) return "amber";
    return "red";
  } else {
    if (value >= green) return "green";
    if (value >= amber) return "amber";
    return "red";
  }
};

const rrlZone = (rrl) => {
  if (rrl >= 20) return "critical";
  if (rrl >= 10) return "high";
  if (rrl >= 5) return "medium";
  return "low";
};

const zoneColor = (zone) => ({
  critical: C.red,
  high: "#f97316",
  medium: C.amber,
  low: C.green,
}[zone] || C.textMuted);

const zoneBg = (zone) => ({
  critical: C.redDim,
  high: "rgba(249,115,22,0.12)",
  medium: C.amberDim,
  low: C.greenDim,
}[zone] || "transparent");

const statusStyle = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "completed") return { color: C.green, bg: C.greenDim };
  if (s === "overdue") return { color: C.red, bg: C.redDim };
  if (s === "wip") return { color: C.amber, bg: C.amberDim };
  if (s === "not started") return { color: C.textMuted, bg: C.surface };
  return { color: C.textMuted, bg: "transparent" };
};

const trafficColor = (status) => ({ green: C.green, amber: C.amber, red: C.red }[status] || C.textDim);

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Badge = ({ children, color, bg }) => (
  <span style={{ color, background: bg, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const StatusBadge = ({ status }) => {
  if (!status || status === "Select one") return <span style={{ color: C.textDim, fontSize: 11 }}>—</span>;
  const { color, bg } = statusStyle(status);
  return <Badge color={color} bg={bg}>{status}</Badge>;
};

const ScorePill = ({ value, zone }) => (
  <span style={{ color: zoneColor(zone), background: zoneBg(zone), fontFamily: "monospace", fontWeight: 800, fontSize: 15, padding: "3px 10px", borderRadius: 8, border: `1px solid ${zoneColor(zone)}40` }}>
    {value}
  </span>
);

const TrafficDot = ({ status }) => {
  if (!status) return <span style={{ color: C.textDim }}>—</span>;
  const c = trafficColor(status);
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 13, color: c }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block", boxShadow: `0 0 6px ${c}` }} />{(value => typeof value === "number" ? value.toFixed(2) : "—")(null)}</span>;
};

const KriEntry = ({ value, green, amber, dir }) => {
  if (value === null || value === undefined) return <span style={{ color: C.textDim }}>—</span>;
  const st = kriStatus(value, green, amber, dir);
  const c = trafficColor(st);
  const display = value < 1 ? `${(value * 100).toFixed(0)}%` : value;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c, fontWeight: 700, fontSize: 13 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}`, flexShrink: 0 }} />
      {display}
    </span>
  );
};

const SectionHeader = ({ title, subtitle, icon }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 26, color: C.text, fontWeight: 700, margin: 0 }}>{title}</h2>
    </div>
    {subtitle && <p style={{ color: C.textMuted, fontSize: 13, marginTop: 6, marginLeft: 34, fontStyle: "italic" }}>{subtitle}</p>}
    <div style={{ marginTop: 14, marginLeft: 34, height: 1, background: `linear-gradient(90deg, ${C.accent}60, transparent)` }} />
  </div>
);

const Table = ({ headers, children }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", background: C.surfaceAlt, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Tr = ({ children, onClick, selected }) => (
  <tr onClick={onClick} style={{ borderBottom: `1px solid ${C.border}`, background: selected ? C.surfaceHover : "transparent", cursor: onClick ? "pointer" : "default", transition: "background 0.15s" }}
    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = C.surfaceHover; }}
    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}>
    {children}
  </tr>
);

const Td = ({ children, style: s }) => (
  <td style={{ padding: "12px 14px", fontSize: 13, color: C.text, verticalAlign: "middle", ...s }}>{children}</td>
);

// ─── HEATMAP ─────────────────────────────────────────────────────────────────
const HeatMap = () => {
  const cellScore = (l, c) => l * c;
  const cellZone = (s) => s >= 20 ? "critical" : s >= 10 ? "high" : s >= 5 ? "medium" : "low";
  const cellColors = { critical: "#7f1d1d", high: "#7c2d12", medium: "#713f12", low: "#14532d" };
  const cellBorders = { critical: "#ef444460", high: "#f9731660", medium: "#f59e0b60", low: "#22c55e60" };

  const risksOnMap = RISKS.map(r => ({ id: r.id, rank: r.rank, l: r.likelihood_r, c: r.consequence_r, rrl: r.rrl, short: `R${r.rank}` }));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
        {/* Y-axis label */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, gap: 4 }}>
          <span style={{ color: C.textMuted, fontSize: 11, writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Likelihood</span>
        </div>
        <div>
          {/* Grid */}
          {[5, 4, 3, 2, 1].map(l => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <span style={{ color: C.textMuted, fontSize: 10, width: 14, textAlign: "right", marginRight: 6, flexShrink: 0 }}>{l}</span>
              {[1, 2, 3, 4, 5].map(c => {
                const score = cellScore(l, c);
                const zone = cellZone(score);
                const here = risksOnMap.filter(r => r.l === l && r.c === c);
                return (
                  <div key={c} style={{ width: 48, height: 48, background: cellColors[zone], border: `1px solid ${cellBorders[zone]}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, position: "absolute", top: 3, left: 3 }}>{score}</span>
                    {here.map(r => (
                      <span key={r.id} style={{ background: "rgba(255,255,255,0.95)", color: "#000", borderRadius: 4, fontSize: 9, fontWeight: 800, padding: "1px 4px", margin: 1 }}>R{r.rank}</span>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
          {/* X-axis */}
          <div style={{ display: "flex", marginLeft: 20 }}>
            {[1,2,3,4,5].map(c => <div key={c} style={{ width: 48, textAlign: "center", fontSize: 10, color: C.textMuted, paddingTop: 4 }}>{c}</div>)}
          </div>
          <div style={{ textAlign: "center", marginLeft: 20, marginTop: 4, fontSize: 11, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Consequence</div>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
          {[["critical","≥20","Critical"],["high","10–19","High"],["medium","5–9","Medium"],["low","1–4","Low"]].map(([zone,range,label]) => (
            <div key={zone} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 14, height: 14, background: cellColors[zone], border: `1px solid ${cellBorders[zone]}`, borderRadius: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.textMuted }}><span style={{ color: zoneColor(zone), fontWeight: 700 }}>{label}</span> {range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const criticalRisks = RISKS.filter(r => r.rrl >= 20).length;
  const highRisks = RISKS.filter(r => r.rrl >= 10 && r.rrl < 20).length;
  const overdueActions = TREATMENT_PLANS.filter(tp => Object.values(tp.quarters).some(q => q.status === "Overdue")).length;
  const noCompliance = COMPLIANCE.filter(c => Object.values(c.responses).some(v => v === "No")).length;

  const StatCard = ({ label, value, color, sub }) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", flex: 1 }}>
      <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: C.text, marginTop: 6, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{sub}</div>}
    </div>
  );

  const sortedRisks = [...RISKS].sort((a, b) => a.rank - b.rank);

  return (
    <div>
      <SectionHeader icon="📊" title="Risk Dashboard" subtitle="Q2 Dec 2025/2026 — National Risk Management Function" />

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Critical Risks (RRL ≥ 20)" value={criticalRisks} color={C.red} sub="Immediate escalation required" />
        <StatCard label="High Risks (RRL 10–19)" value={highRisks} color="#f97316" sub="Treatment actions in progress" />
        <StatCard label="Overdue Treatment Actions" value={overdueActions} color={C.amber} sub="Past due date" />
        <StatCard label="Compliance Non-Compliance" value={noCompliance} color={C.blue} sub="'No' responses in Q4" />
        <StatCard label="Incidents Logged" value={INCIDENTS.length} color={C.textMuted} sub="Q4 + Q1 combined" />
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        {/* Heatmap */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Residual Risk Heat Map</div>
          <HeatMap />
        </div>

        {/* Risk Rankings */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Risk Ranking — Q2 Aggregate</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedRisks.map(r => {
              const zone = rrlZone(r.rrl);
              const mvColor = r.movement === "↑" ? C.red : r.movement === "↓" ? C.green : C.textMuted;
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surfaceAlt, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: C.accent, width: 20, flexShrink: 0 }}>#{r.rank}</span>
                  <span style={{ fontSize: 12, color: C.text, flex: 1, lineHeight: 1.4 }}>{r.event}</span>
                  <span style={{ fontSize: 16, color: mvColor, fontWeight: 800, width: 16, flexShrink: 0 }}>{r.movement}</span>
                  <ScorePill value={r.rrl} zone={zone} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KRI quick status */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>KRI Status — Current Quarter (Q2)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {KRIS.map((k, i) => {
            const e = k.entries.Q2;
            const st = e ? kriStatus(e.value, k.green, k.amber, k.direction) : null;
            const c = trafficColor(st);
            const risk = RISKS.find(r => r.id === k.riskId);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 12px", borderRadius: 8, background: C.surfaceAlt }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: st ? c : C.textDim, boxShadow: st ? `0 0 8px ${c}` : "none", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.textMuted, width: 60, flexShrink: 0 }}>Risk #{risk?.rank}</span>
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{k.kri}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: e?.value !== null && e?.value !== undefined ? c : C.textDim, fontFamily: "monospace" }}>
                  {e?.value !== null && e?.value !== undefined ? (e.value < 1 ? `${(e.value * 100).toFixed(0)}%` : e.value) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── RISK REGISTER ────────────────────────────────────────────────────────────
const RiskRegister = () => {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <SectionHeader icon="📋" title="Risk Register" subtitle="Full risk lifecycle — Inherent & Residual Analysis" />
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <Table headers={["#", "Risk Event", "IRL", "RRL", "Zone", "Evaluation", "Movement"]}>
          {RISKS.sort((a,b) => a.rank - b.rank).map(r => {
            const zone = rrlZone(r.rrl);
            const isExp = expanded === r.id;
            const mvColor = r.movement === "↑" ? C.red : r.movement === "↓" ? C.green : C.textMuted;
            return [
              <Tr key={r.id} onClick={() => setExpanded(isExp ? null : r.id)} selected={isExp}>
                <Td><span style={{ fontFamily: "monospace", fontWeight: 800, color: C.accent }}>#{r.rank}</span></Td>
                <Td><span style={{ fontWeight: 600 }}>{r.event}</span><br /><span style={{ fontSize: 11, color: C.textMuted }}>{r.csf}</span></Td>
                <Td><ScorePill value={r.irl} zone={rrlZone(r.irl)} /></Td>
                <Td><ScorePill value={r.rrl} zone={zone} /></Td>
                <Td><Badge color={zoneColor(zone)} bg={zoneBg(zone)}>{zone}</Badge></Td>
                <Td><Badge color={r.evaluation === "Treat" ? C.amber : C.green} bg={r.evaluation === "Treat" ? C.amberDim : C.greenDim}>{r.evaluation}</Badge></Td>
                <Td><span style={{ color: mvColor, fontWeight: 800, fontSize: 18 }}>{r.movement}</span></Td>
              </Tr>,
              isExp && (
                <tr key={`exp-${r.id}`} style={{ background: C.surfaceAlt }}>
                  <td colSpan={7} style={{ padding: "20px 24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 16 }}>
                      {[["Risk Source", r.source], ["Risk Effect", r.effect], ["Current Controls", r.controls]].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
                          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6,auto)", gap: 12, alignItems: "center", fontSize: 12 }}>
                      {[["Likelihood (I)", r.likelihood_i], ["Consequence (I)", r.consequence_i], ["IRL", r.irl], ["Likelihood (R)", r.likelihood_r], ["Consequence (R)", r.consequence_r], ["RRL", r.rrl]].map(([l, v]) => (
                        <div key={l} style={{ background: C.surface, borderRadius: 8, padding: "8px 12px", textAlign: "center", border: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{l}</div>
                          <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 18, color: C.text }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {r.treatment && (
                      <div style={{ marginTop: 16, padding: "12px 16px", background: C.amberDim, borderLeft: `3px solid ${C.amber}`, borderRadius: "0 8px 8px 0" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: "0.08em" }}>Treatment Action: </span>
                        <span style={{ fontSize: 12, color: C.text }}>{r.treatment}</span>
                        <span style={{ fontSize: 12, color: C.textMuted }}> — Due: {r.due} — {r.responsibility}</span>
                      </div>
                    )}
                  </td>
                </tr>
              )
            ];
          })}
        </Table>
      </div>
    </div>
  );
};

// ─── TREATMENT PLANS ─────────────────────────────────────────────────────────
const TreatmentPlans = () => {
  const quarters = ["Q4", "Q1", "Q2"];
  const qLabels = { Q4:"Q4 June 24/25", Q1:"Q1 Sept 25/26", Q2:"Q2 Dec 25/26" };

  return (
    <div>
      <SectionHeader icon="🛡️" title="Risk Treatment Plans" subtitle="Quarterly improvement action tracking" />
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <Table headers={["Risk Event", "Improvement Action", "Due Date", "Responsibility", ...quarters.map(q => qLabels[q])]}>
          {TREATMENT_PLANS.map((tp, i) => {
            const risk = RISKS.find(r => r.id === tp.riskId);
            return (
              <Tr key={i}>
                <Td><span style={{ fontSize: 12, fontWeight: 600, maxWidth: 200, display: "block" }}>{risk?.event}</span></Td>
                <Td><span style={{ fontSize: 12, color: C.textMuted, maxWidth: 220, display: "block", lineHeight: 1.5 }}>{tp.action}</span></Td>
                <Td><span style={{ fontSize: 12, color: tp.due.includes("2023") ? C.red : C.textMuted, fontFamily: "monospace" }}>{tp.due}</span></Td>
                <Td><span style={{ fontSize: 11, color: C.textMuted }}>{tp.responsibility}</span></Td>
                {quarters.map(q => {
                  const entry = tp.quarters[q];
                  return (
                    <Td key={q}>
                      <StatusBadge status={entry?.status} />
                      {entry?.comments && <div style={{ fontSize: 10, color: C.textDim, marginTop: 4, maxWidth: 180, lineHeight: 1.4 }}>{entry.comments.slice(0, 80)}…</div>}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Table>
        {/* Risks with "Accept" */}
        <div style={{ padding: "12px 24px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
          Risks #5 (Inactive key players) and #2 (Logistics) are evaluated as "Accept" — no improvement actions required.
        </div>
      </div>
    </div>
  );
};

// ─── KRIs ─────────────────────────────────────────────────────────────────────
const KRIsView = () => {
  const quarters = ["Q4", "Q1", "Q2"];
  const qLabels = { Q4:"Q4 June", Q1:"Q1 Sept", Q2:"Q2 Dec" };

  return (
    <div>
      <SectionHeader icon="📈" title="Key Risk Indicators" subtitle="Quarterly monitoring with Green / Amber / Red thresholds" />
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <Table headers={["Risk", "Key Risk Indicator", "Freq.", "🟢 Green", "🟡 Amber/Red", "Q4 Entry", "Q1 Entry", "Q2 Entry"]}>
          {KRIS.map((k, i) => {
            const risk = RISKS.find(r => r.id === k.riskId);
            const fmt = v => v < 1 ? `${(v*100).toFixed(0)}%` : v;
            return (
              <Tr key={i}>
                <Td><span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>R#{risk?.rank}</span><br /><span style={{ fontSize: 10, color: C.textMuted }}>{k.riskId === 1 ? "Inactive players" : k.riskId === 2 ? "Logistics" : k.riskId === 3 ? "Regulations" : k.riskId === 4 ? "Capacity" : k.riskId === 5 ? "Staffing" : k.riskId === 6 ? "Mgr Reluctance" : "Toolkit"}</span></Td>
                <Td><span style={{ fontSize: 12, maxWidth: 220, display: "block", lineHeight: 1.5 }}>{k.kri}</span><span style={{ fontSize: 10, color: C.textMuted }}>{k.frequency}</span></Td>
                <Td><span style={{ fontSize: 11, color: C.textMuted }}>{k.frequency}</span></Td>
                <Td><span style={{ color: C.green, fontFamily: "monospace", fontWeight: 700 }}>≤{fmt(k.green)}</span></Td>
                <Td><span style={{ color: C.red, fontFamily: "monospace", fontWeight: 700 }}>{fmt(k.amber)}</span></Td>
                {quarters.map(q => {
                  const e = k.entries[q];
                  return (
                    <Td key={q}>
                      <KriEntry value={e?.value} green={k.green} amber={k.amber} dir={k.direction} />
                      {e?.status && e.status !== "Select one" && <div style={{ marginTop: 4 }}><StatusBadge status={e.status} /></div>}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Table>
      </div>
    </div>
  );
};

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const KPIsView = () => {
  const quarters = ["Q4", "Q1", "Q2"];
  const qLabels = { Q4:"Q4 June", Q1:"Q1 Sept", Q2:"Q2 Dec" };

  return (
    <div>
      <SectionHeader icon="🎯" title="Key Performance Indicators" subtitle="Departmental performance monitoring" />
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.textMuted }}><span style={{ color: C.accent, fontWeight: 700 }}>Department:</span> {DEPT.name} — {DEPT.unit}</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}><span style={{ color: C.accent, fontWeight: 700 }}>Objective:</span> {DEPT.objective}</div>
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <Table headers={["KPI", "Frequency", "🟢 Green", "🟡 Amber/Red", "Q4 Entry", "Q1 Entry", "Q2 Entry", "Responsibility"]}>
          {KPIS.map((k, i) => {
            const fmt = v => v < 1 ? `${(v*100).toFixed(0)}%` : v;
            return (
              <Tr key={i}>
                <Td><span style={{ fontSize: 12, fontWeight: 600, maxWidth: 260, display: "block" }}>{k.kpi}</span></Td>
                <Td><span style={{ fontSize: 11, color: C.textMuted }}>{k.frequency}</span></Td>
                <Td><span style={{ color: C.green, fontFamily: "monospace", fontWeight: 700 }}>≥{fmt(k.green)}</span></Td>
                <Td><span style={{ color: C.red, fontFamily: "monospace", fontWeight: 700 }}>&lt;{fmt(k.amber)}</span></Td>
                {quarters.map(q => {
                  const e = k.entries[q];
                  return (
                    <Td key={q}>
                      {e?.value !== null && e?.value !== undefined
                        ? <KriEntry value={e.value} green={k.green} amber={k.amber} dir={k.direction} />
                        : <span style={{ color: C.textDim, fontSize: 12 }}>Pending</span>}
                    </Td>
                  );
                })}
                <Td><span style={{ fontSize: 11, color: C.textMuted }}>{k.responsibility}</span></Td>
              </Tr>
            );
          })}
        </Table>
      </div>
    </div>
  );
};

// ─── COMPLIANCE ───────────────────────────────────────────────────────────────
const ComplianceView = () => {
  const quarters = ["Q4", "Q1", "Q2"];
  const qLabels = { Q4:"Q4 June 24/25", Q1:"Q1 Sept 25/26", Q2:"Q2 Dec 25/26" };

  const ResponseChip = ({ val, comment }) => {
    if (!val || val === "Select One") return <span style={{ color: C.textDim }}>—</span>;
    const isYes = val === "Yes";
    return (
      <div>
        <Badge color={isYes ? C.green : C.red} bg={isYes ? C.greenDim : C.redDim}>{val}</Badge>
        {!isYes && comment && <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, maxWidth: 140, lineHeight: 1.4 }}>{comment}</div>}
      </div>
    );
  };

  return (
    <div>
      <SectionHeader icon="✅" title="Compliance Management" subtitle="Key control verification per quarter" />
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <Table headers={["Risk", "Key Control", "Compliance Question", "Freq.", ...quarters.map(q => qLabels[q])]}>
          {COMPLIANCE.map((c, i) => {
            const risk = RISKS.find(r => r.id === c.riskId);
            return (
              <Tr key={i}>
                <Td><span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>R#{risk?.rank}</span></Td>
                <Td><span style={{ fontSize: 12, maxWidth: 180, display: "block", lineHeight: 1.5 }}>{c.control}</span></Td>
                <Td><span style={{ fontSize: 11, color: C.textMuted, maxWidth: 200, display: "block", lineHeight: 1.5 }}>{c.question}</span></Td>
                <Td><span style={{ fontSize: 11, color: C.textMuted }}>{c.frequency}</span></Td>
                {quarters.map(q => (
                  <Td key={q}><ResponseChip val={c.responses[q]} comment={c.noComment?.[q]} /></Td>
                ))}
              </Tr>
            );
          })}
        </Table>
      </div>
    </div>
  );
};

// ─── INCIDENTS ────────────────────────────────────────────────────────────────
const IncidentsView = () => {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <SectionHeader icon="⚠️" title="Incident Management Register" subtitle="Risk incidents logged and managed" />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {INCIDENTS.map(inc => {
          const isExp = expanded === inc.id;
          return (
            <div key={inc.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div onClick={() => setExpanded(isExp ? null : inc.id)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", gap: 16, alignItems: "flex-start" }}
                onMouseEnter={e => e.currentTarget.style.background = C.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 8, padding: "8px 14px", textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: C.amber, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{inc.quarter}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: C.accent }}>#{inc.serial}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 600, lineHeight: 1.5, marginBottom: 4 }}>{inc.details.slice(0, 120)}…</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.textMuted }}>
                    <span>📅 {inc.date}</span>
                    <span>📍 {inc.location}</span>
                    <span>💰 Financial: {inc.financial ? "Yes" : "No"}</span>
                  </div>
                </div>
                <span style={{ color: C.textMuted, fontSize: 18, flexShrink: 0 }}>{isExp ? "▲" : "▼"}</span>
              </div>
              {isExp && (
                <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
                    {[
                      ["Full Details", inc.details],
                      ["Related Risk Event", inc.riskEvent],
                      ["Risk Causes", inc.causes],
                      ["Risk Effects", inc.effects],
                      ["Action Taken", inc.action],
                      ["Corrective Action", inc.corrective],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: C.surfaceAlt, borderRadius: 8, padding: "12px 16px", border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{val || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "register", label: "Risk Register", icon: "📋" },
  { id: "treatment", label: "Treatment Plans", icon: "🛡️" },
  { id: "kri", label: "KRI Monitoring", icon: "📈" },
  { id: "kpi", label: "KPI Tracking", icon: "🎯" },
  { id: "compliance", label: "Compliance", icon: "✅" },
  { id: "incidents", label: "Incidents", icon: "⚠️" },
];

export default function App() {
  const [view, setView] = useState("dashboard");

  const VIEWS = { dashboard: <Dashboard />, register: <RiskRegister />, treatment: <TreatmentPlans />, kri: <KRIsView />, kpi: <KPIsView />, compliance: <ComplianceView />, incidents: <IncidentsView /> };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: 240, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
        {/* Logo */}
        <div style={{ padding: "28px 20px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>National Risk<br />Management</div>
          <div style={{ fontSize: 11, color: C.accent, marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>FY {DEPT.year}</div>
          <div style={{ marginTop: 12, padding: "8px 10px", background: C.surfaceAlt, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.textMuted }}>Department</div>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{DEPT.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{DEPT.unit}</div>
          </div>
        </div>

        {/* Quarter indicator */}
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Current Period</div>
          {[["Q2","Dec 25/26","Active"],["Q1","Sept 25/26",""],["Q4","June 24/25",""]].map(([q, period, active]) => (
            <div key={q} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? C.accent : C.border, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: active ? C.accentBright : C.textMuted, fontWeight: active ? 700 : 400 }}>{q} — {period}</span>
            </div>
          ))}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {NAV.map(n => {
            const active = view === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: active ? C.accentGlow : "transparent", color: active ? C.accentBright : C.textMuted, fontSize: 13, fontWeight: active ? 700 : 400, textAlign: "left", transition: "all 0.15s", marginBottom: 2, borderLeft: active ? `2px solid ${C.accent}` : "2px solid transparent" }}>
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.5 }}>Rwanda National Risk<br />Management System</div>
          <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>ISO 31000:2018</div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "36px 40px", overflow: "auto", maxWidth: "calc(100vw - 240px)" }}>
        {VIEWS[view]}
      </main>
    </div>
  );
}
