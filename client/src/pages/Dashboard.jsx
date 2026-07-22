import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  ShieldAlert,
  Plus,
  ArrowRight,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { resolveContractRiskSummary } from "../utils/contractRisk";

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

      const response = await axios.get(
        "http://localhost:5000/api/contracts",
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

  const analyzedContracts = contracts.filter(
    (contract) => contract.status === "analyzed"
  );

  const riskSummaries = analyzedContracts.map(resolveContractRiskSummary);
  const scoredContracts = riskSummaries.filter((summary) =>
    Number.isFinite(Number(summary.riskScore))
  );

  const highRiskContracts = scoredContracts.filter(
    (summary) => summary.riskLevel === "HIGH RISK"
  );

  const mediumRiskContracts = scoredContracts.filter(
    (summary) => summary.riskLevel === "MEDIUM RISK"
  );

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

  const averageRiskScore = scoredContracts.length
    ? Math.round(
        scoredContracts.reduce((sum, summary) => sum + Number(summary.riskScore), 0) /
          scoredContracts.length
      )
    : 0;

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

  return (
    <div className="dashboard-page">

      {/* DASHBOARD HEADER */}
      <div className="dashboard-header">

        <div>
          <p className="dashboard-eyebrow">
            CARWISE AI DASHBOARD
          </p>

          <h1>
            Welcome back 👋
          </h1>

          <p className="dashboard-subtitle">
            Track and understand your vehicle contract analyses.
          </p>
        </div>

        <button
          className="dashboard-primary-button"
          onClick={() => navigate("/analyze")}
        >
          <Plus size={20} />
          Analyze New Contract
        </button>

      </div>

      {/* STATS */}
      <div className="dashboard-stats">

        <div className="stat-card premium-card">
          <div className="stat-icon primary">
            <FileText size={24} />
          </div>

          <div>
            <p>Total Contracts</p>
            <h2>{totalContracts}</h2>
            <small>All uploaded vehicle contracts</small>
          </div>
        </div>

        <div className="stat-card premium-card">
          <div className="stat-icon danger">
            <ShieldAlert size={24} />
          </div>

          <div>
            <p>High Risk Contracts</p>
            <h2>{highRiskContracts.length}</h2>
            <small>Contracts that need attention</small>
          </div>
        </div>

        <div className="stat-card premium-card">
          <div className="stat-icon success">
            <DollarSign size={24} />
          </div>

          <div>
            <p>Money Saved</p>
            <h2>${moneySaved.toLocaleString()}</h2>
            <small>Potential savings from risk reduction</small>
          </div>
        </div>

        <div className="stat-card premium-card">
          <div className="stat-icon accent">
            <BarChart3 size={24} />
          </div>

          <div>
            <p>Average Risk Score</p>
            <h2>{averageRiskScore}</h2>
            <small>AI risk score across contracts</small>
          </div>
        </div>

      </div>

      {/* RECENT CONTRACTS */}
      <section className="recent-contracts">

        <div className="section-header">

          <div>
            <h2>
              Recent Contract Analyses
            </h2>

            <p>
              Your recently analyzed vehicle contracts will appear here.
            </p>
          </div>

          <button
            className="view-all-button"
            onClick={() => navigate("/history")}
          >
            View All
            <ArrowRight size={18} />
          </button>

        </div>

        {loading ? (

  <div className="empty-dashboard">

    <h3>
      Loading your contracts...
    </h3>

  </div>

) : error ? (

  <div className="empty-dashboard">

    <h3>
      {error}
    </h3>

  </div>

) : analyzedContracts.length === 0 ? (

  <div className="empty-dashboard">

    <div className="empty-dashboard-icon">
      <FileText size={32} />
    </div>

    <h3>
      No contracts analyzed yet
    </h3>

    <p>
      Upload your first vehicle contract to get AI-powered insights.
    </p>

    <button
      className="dashboard-primary-button"
      onClick={() => navigate("/analyze")}
    >
      <Plus size={18} />
      Analyze Your First Contract
    </button>

  </div>

) : (

  <div className="contracts-table-wrapper">
    <div className="contracts-table-header">
      <h3>Recent Contract Analyses</h3>
      <span>{analyzedContracts.length} analyzed contracts</span>
    </div>

    <div className="contracts-table">
      <div className="contracts-table-row header-row">
        <span>Contract Name</span>
        <span>Contract Type</span>
        <span>Risk Level</span>
        <span>Analysis Date</span>
        <span>Status</span>
      </div>

      {analyzedContracts.slice(0, 5).map((contract) => {
        const riskSummary = resolveContractRiskSummary(contract);
        const riskLevel = riskSummary.riskLevel || "NOT ANALYZED";

        const contractType = contract.originalName?.includes("Lease")
          ? "Lease"
          : contract.originalName?.includes("Loan")
          ? "Loan"
          : "Purchase";

        return (
          <div
            className="contracts-table-row"
            key={contract._id}
            onClick={() => navigate(`/contract/${contract._id}`)}
          >
            <span className="contract-name">
              {contract.originalName}
            </span>

            <span>{contractType}</span>

            <span className={`risk-pill ${riskLevel.replace(" ", "-").toLowerCase()}`}>
              {riskLevel}
            </span>

            <span>
              {new Date(contract.createdAt).toLocaleDateString()}
            </span>

            <span className="status-pill">
              {contract.status}
            </span>
          </div>
        );
      })}
    </div>
  </div>
)}

      </section>

    </div>
  );
}

export default Dashboard;