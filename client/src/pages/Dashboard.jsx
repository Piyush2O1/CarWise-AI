import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileBarChart,
  FileText,
  Gauge,
  History,
  LogOut,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { resolveContractRiskSummary } from "../utils/contractRisk";

const formatCurrency = (value) => {
  if (!value) return "$0";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${Math.round(value).toLocaleString()}`;
};

const getContractType = (name = "") => {
  if (/lease/i.test(name)) return "Lease";
  if (/loan|finance/i.test(name)) return "Auto loan";
  return "Purchase";
};

const getDateLabel = (date) => {
  if (!date) return "Recently";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getRelativeTime = (date) => {
  if (!date) return "Recently";
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

function DashboardHeader({ navigate }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="dash-topbar">
      <button className="dash-brand" onClick={() => navigate("/dashboard")}>
        <span className="dash-brand-mark"><ShieldCheck size={19} /></span>
        <span>CarWise <strong>AI</strong></span>
      </button>
      <div className="dash-breadcrumb"><span>Workspace</span><ChevronDown size={14} /><b>/</b><strong>Dashboard</strong></div>
      <div className="dash-header-actions">
        <button className="dash-icon-button" aria-label="Notifications"><Bell size={18} /><i /></button>
        <button className="dash-profile" onClick={handleLogout} title="Log out">
          <span className="dash-avatar">P</span><span className="dash-profile-copy"><b>Piyush</b><small>Personal workspace</small></span><ChevronDown size={15} />
        </button>
        <button className="dash-mobile-logout" onClick={handleLogout} aria-label="Log out"><LogOut size={17} /></button>
      </div>
    </header>
  );
}

function TrendSparkline({ tone = "blue", points = "0,34 14,29 28,32 42,20 56,23 70,10 86,14 100,4" }) {
  return <svg className={`trend-sparkline ${tone}`} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} /></svg>;
}

function StatCard({ icon: Icon, label, value, detail, trend, tone, points }) {
  return (
    <article className={`dash-stat-card ${tone}`}>
      <div className="dash-stat-top"><span className="dash-stat-icon"><Icon size={20} /></span><span className="dash-stat-trend"><ArrowDownRight size={13} /> {trend}</span></div>
      <p>{label}</p><strong>{value}</strong><small>{detail}</small><TrendSparkline tone={tone} points={points} />
    </article>
  );
}

function QuickActions({ navigate }) {
  const actions = [
    [Plus, "Analyze contract", "Upload a PDF for AI review", () => navigate("/analyze")],
    [UploadCloud, "Upload PDF", "Start with a new document", () => navigate("/analyze")],
    [History, "View history", "Browse every past analysis", () => navigate("/history")],
    [Download, "Download reports", "Export your insights", () => navigate("/history")],
  ];
  return <section className="dash-section dash-actions-section"><div className="dash-section-heading"><div><span className="dash-kicker">WORKFLOW</span><h2>Quick actions</h2></div></div><div className="dash-action-grid">{actions.map(([Icon, title, description, onClick]) => <button className="dash-action" key={title} onClick={onClick}><span><Icon size={19} /></span><b>{title}</b><small>{description}</small><ArrowRight className="dash-action-arrow" size={16} /></button>)}</div></section>;
}

function RiskChart({ analyzedContracts }) {
  const values = [
    analyzedContracts.filter(({ summary }) => summary.riskLevel === "HIGH RISK").length,
    analyzedContracts.filter(({ summary }) => summary.riskLevel === "MEDIUM RISK").length,
    analyzedContracts.filter(({ summary }) => ["SAFE", "LOW RISK", "STRONGEST SAFE"].includes(summary.riskLevel)).length,
  ];
  const total = Math.max(values.reduce((sum, value) => sum + value, 0), 1);
  const safePercent = Math.round((values[2] / total) * 100);
  return <article className="dash-chart-card"><div className="dash-card-heading"><div><span className="dash-kicker">RISK PROFILE</span><h3>Risk distribution</h3></div><button className="dash-more" aria-label="More risk options"><MoreHorizontal size={18} /></button></div><div className="risk-chart-content"><div className="donut-chart" style={{ "--safe": `${(values[2] / total) * 100}%`, "--medium": `${(values[1] / total) * 100}%` }}><div><strong>{safePercent}%</strong><small>safe</small></div></div><div className="chart-legend"><span><i className="legend-safe" />Safe <b>{values[2]}</b></span><span><i className="legend-medium" />Needs review <b>{values[1]}</b></span><span><i className="legend-high" />High risk <b>{values[0]}</b></span></div></div></article>;
}

function ScoreChart({ analyzedContracts }) {
  const scoreValues = analyzedContracts.slice(-6).map(({ summary }) => Math.max(0, Number(summary.safetyScore) || 0));
  const points = scoreValues.length ? scoreValues : [0, 0, 0, 0, 0, 0];
  const line = points.map((value, index) => `${index * 20},${60 - (value / 100) * 48}`).join(" ");
  return <article className="dash-chart-card score-chart"><div className="dash-card-heading"><div><span className="dash-kicker">SAFETY SIGNAL</span><h3>AI score trend</h3></div><span className="chart-period">Last 6 analyses</span></div><div className="score-chart-value"><strong>{points[points.length - 1] || 0}</strong><span><ArrowDownRight size={13} /> 8.4%</span></div><svg viewBox="0 0 100 64" preserveAspectRatio="none" className="score-line-chart"><defs><linearGradient id="score-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#38bdf8" stopOpacity=".3" /><stop offset="1" stopColor="#38bdf8" stopOpacity="0" /></linearGradient></defs><polygon points={`0,64 ${line} 100,64`} fill="url(#score-fill)" /><polyline points={line} /></svg><div className="chart-axis"><span>Older</span><span>Recent</span></div></article>;
}

function AIInsights({ averageRiskScore, safeCount, moneySaved, latestContract }) {
  return <aside className="dash-insights"><div className="insights-orb"><Sparkles size={20} /></div><span className="dash-kicker">AI INSIGHTS</span><h2>Your workspace, at a glance.</h2><p>Small signals from your contract portfolio, translated into clear next steps.</p><div className="insight-metric"><span>Average safety score</span><strong>{averageRiskScore}<small>/100</small></strong><div className="insight-progress"><i style={{ width: `${averageRiskScore}%` }} /></div></div><div className="insight-metric"><span>Potential savings identified</span><strong>{formatCurrency(moneySaved)}</strong></div><div className="insight-note"><CheckCircle2 size={16} /><span>{safeCount > 0 ? `${safeCount} contracts look safer than average.` : "Analyze a contract to unlock your first insight."}</span></div>{latestContract && <div className="insight-latest"><small>Latest recommendation</small><b>Review the highlighted clauses in {latestContract.originalName || "your latest contract"}.</b></div>}</aside>;
}

function RecentContracts({ contracts, navigate, setContracts }) {
  return <section className="dash-section recent-analysis"><div className="dash-section-heading"><div><span className="dash-kicker">YOUR WORKSPACE</span><h2>Recent analyses</h2><p>Keep an eye on the contracts that need your attention.</p></div><button className="dash-text-button" onClick={() => navigate("/history")}>View all <ArrowRight size={16} /></button></div><div className="recent-contract-list">{contracts.slice(0, 5).map(({ contract, summary }) => { const level = summary.riskLevel || "NOT ANALYZED"; return <article className="contract-row" key={contract._id}><div className="contract-row-main"><span className="pdf-icon"><FileText size={19} /></span><div><b>{contract.originalName || "Untitled contract"}</b><span>{getContractType(contract.originalName)} <i /> {getDateLabel(contract.createdAt)}</span></div></div><div className="contract-score"><strong>{summary.safetyScore ?? "--"}</strong><small>AI score</small></div><span className={`risk-badge ${level.toLowerCase().replaceAll(" ", "-")}`}>{level}</span><span className="analysis-status"><i />{contract.status === "analyzed" ? "Complete" : contract.status}</span><div className="contract-row-actions"><button onClick={() => navigate(`/contract/${contract._id}`)} aria-label="View contract"><Eye size={16} /></button><button aria-label="Download report"><Download size={16} /></button><button onClick={() => setContracts((current) => current.filter((item) => item._id !== contract._id))} aria-label="Remove contract"><X size={16} /></button></div></article>; })}</div></section>;
}

function Timeline({ contracts }) {
  const latest = contracts[0]?.contract;
  const events = latest ? [[UploadCloud, "Contract uploaded", "Your document was securely added", latest.createdAt], [Activity, "AI analysis started", "Scanning clauses and financial terms", latest.createdAt], [Check, "Analysis completed", "Risk profile is ready to review", latest.updatedAt || latest.createdAt]] : [];
  return <section className="dash-section timeline-section"><div className="dash-section-heading"><div><span className="dash-kicker">ACTIVITY</span><h2>Latest activity</h2></div><span className="live-indicator"><i /> Live</span></div><div className="timeline">{events.map(([Icon, title, detail, date]) => <div className="timeline-item" key={title}><span className="timeline-icon"><Icon size={15} /></span><div><b>{title}</b><p>{detail}</p></div><time>{getRelativeTime(date)}</time></div>)}</div></section>;
}

function EmptyState({ navigate }) {
  return <div className="dash-empty-state"><div className="empty-illustration"><FileBarChart size={42} /><Sparkles className="empty-sparkle" size={17} /></div><span className="dash-kicker">YOUR FIRST SIGNAL</span><h2>No contracts yet</h2><p>Upload your first vehicle contract and let AI surface the clauses that matter.</p><button className="dash-primary-button" onClick={() => navigate("/analyze")}><UploadCloud size={18} /> Upload a contract <ArrowRight size={16} /></button></div>;
}

function Dashboard() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 useEffect(() => {
  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(
        "/contracts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setContracts(response.data.contracts);

    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
        "Failed to load contracts"
      );

    } finally {
      setLoading(false);
    }
  };


  fetchContracts();
}, [navigate]);

  const totalContracts = contracts.length;
  const analyzedContracts = contracts.filter((contract) => contract.status === "analyzed").map((contract) => ({ contract, summary: resolveContractRiskSummary(contract) }));
  const scoredContracts = analyzedContracts.filter(({ summary }) => Number.isFinite(Number(summary.safetyScore)));
  const highRiskContracts = analyzedContracts.filter(({ summary }) => summary.riskLevel === "HIGH RISK");
  const safeContracts = analyzedContracts.filter(({ summary }) => ["SAFE", "LOW RISK", "STRONGEST SAFE"].includes(summary.riskLevel));

const parseCurrencyToNumber = (value) => {
    if (value == null) return 0;
    const raw = String(value).trim();
    const cleaned = raw
      .replace(/₹/g, "")
      .replace(/,/g, "")
      .replace(/\s+/g, "")
      .replace(/INR/gi, "")
      .replace(/\$/g, "");
    const match = cleaned.match(/\d+(?:\.\d+)?/);
    const number = match ? Number(match[0]) : NaN;
    return Number.isFinite(number) ? number : 0;
  };

  const averageRiskScore = scoredContracts.length ? Math.round(scoredContracts.reduce((sum, { summary }) => sum + Number(summary.safetyScore), 0) / scoredContracts.length) : 0;

  const moneySaved = analyzedContracts.reduce((sum, contract) => {
    const purchasePrice = parseCurrencyToNumber(
      contract.analysis?.financials?.purchasePrice ||
        contract.analysis?.financials?.amount ||
        contract.analysis?.financials?.vehiclePrice ||
        0
    );
    const savings = purchasePrice * 0.08;
    return sum + savings;
  }, 0);

  return <div className="dashboard-shell"><DashboardHeader navigate={navigate} /><main className="dashboard-page"><div className="dash-welcome"><div><span className="dash-kicker">CARWISE AI / WORKSPACE</span><h1>Good evening, Piyush <span>👋</span></h1><p>Monitor your vehicle contracts, identify hidden risks, and make smarter financial decisions with AI.</p><div className="dash-hero-meta"><span><i className="pulse-dot" /> Workspace synced</span><span><CalendarDays size={14} /> {totalContracts} contracts tracked</span></div></div><div className="hero-score-panel"><div className="hero-score-ring"><strong>{averageRiskScore}</strong><small>AI score</small></div><div><span>Portfolio health</span><b>{averageRiskScore >= 70 ? "Looking strong" : "Ready to improve"}</b><small>Based on analyzed contracts</small></div><Sparkles className="hero-score-sparkle" size={18} /></div></div>{error && <div className="dash-error"><ShieldAlert size={17} />{error}</div>}{loading ? <div className="dash-loading"><div /><div /><div /><div /></div> : contracts.length === 0 ? <EmptyState navigate={navigate} /> : <><section className="dash-stats-grid"><StatCard icon={FileText} label="Total contracts" value={totalContracts} detail="Across your workspace" trend="12%" tone="blue" /><StatCard icon={ShieldAlert} label="High risk" value={highRiskContracts.length} detail="Contracts needing review" trend="4%" tone="red" points="0,22 14,19 28,28 42,15 56,21 70,9 86,17 100,4" /><StatCard icon={ShieldCheck} label="Safe contracts" value={safeContracts.length} detail="Low risk portfolio" trend="18%" tone="green" points="0,31 14,26 28,29 42,18 56,22 70,12 86,10 100,3" /><StatCard icon={Gauge} label="Average AI score" value={averageRiskScore} detail="Safety across analyses" trend="8%" tone="cyan" /><StatCard icon={CircleDollarSign} label="Money saved" value={formatCurrency(moneySaved)} detail="Potential value identified" trend="22%" tone="amber" /><StatCard icon={Clock3} label="Need review" value={highRiskContracts.length + analyzedContracts.filter(({ summary }) => summary.riskLevel === "MEDIUM RISK").length} detail="Open recommendations" trend="2%" tone="purple" /></section><QuickActions navigate={navigate} /><div className="dash-content-grid"><div><div className="dash-charts-grid"><RiskChart analyzedContracts={analyzedContracts} /><ScoreChart analyzedContracts={analyzedContracts} /></div><RecentContracts contracts={analyzedContracts} navigate={navigate} setContracts={setContracts} /><Timeline contracts={analyzedContracts} /></div><AIInsights averageRiskScore={averageRiskScore} safeCount={safeContracts.length} moneySaved={moneySaved} latestContract={analyzedContracts[0]?.contract} /></div></>}</main></div>;
}

export default Dashboard;