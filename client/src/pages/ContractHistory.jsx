import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  FileText,
  ArrowLeft,
  Eye,
  Calendar,
  CheckCircle,
} from "lucide-react";

function ContractHistory() {
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
          "Failed to load contract history"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [navigate]);

  return (
    <div className="history-page">

      <div className="history-header">

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div>
          <p className="dashboard-eyebrow">
            CONTRACT HISTORY
          </p>

          <h1>
            Your Contract Analyses
          </h1>

          <p className="dashboard-subtitle">
            View all your uploaded and analyzed vehicle contracts.
          </p>
        </div>

      </div>

      {loading && (

        <div className="history-empty-state">
          <h2>
            Loading contracts...
          </h2>
        </div>

      )}

      {error && (

        <div className="history-empty-state">
          <h2>
            {error}
          </h2>
        </div>

      )}

      {!loading &&
        !error &&
        contracts.length === 0 && (

          <div className="history-empty-state">

            <div className="empty-dashboard-icon">
              <FileText size={32} />
            </div>

            <h2>
              No contracts found
            </h2>

            <p>
              Upload your first vehicle contract to begin analysis.
            </p>

            <button
              className="dashboard-primary-button"
              onClick={() => navigate("/analyze")}
            >
              Analyze Contract
            </button>

          </div>

        )}

      {!loading &&
        !error &&
        contracts.length > 0 && (

          <div className="history-list">

            {contracts.map((contract) => (

              <div
                className="history-card"
                key={contract._id}
              >

                <div className="history-file-icon">
                  <FileText size={24} />
                </div>

                <div className="history-details">

                  <h3>
                    {contract.originalName}
                  </h3>

                  <div className="history-meta">

                    <span>
                      <Calendar size={15} />

                      {new Date(
                        contract.createdAt
                      ).toLocaleDateString()}
                    </span>

                    <span>
                      Status: {contract.status}
                    </span>

                  </div>

                </div>

                <div className="history-actions">

                  {contract.status === "analyzed" && (

                    <span className="history-status">
                      <CheckCircle size={16} />
                      Analyzed
                    </span>

                  )}

                 <button
  className="history-view-button"
  onClick={() => {
    navigate(`/contract/${contract._id}`);
  }}
>
  <Eye size={17} />
  View
</button>

                </div>

              </div>

            ))}

          </div>

        )}

    </div>
  );
}

export default ContractHistory;