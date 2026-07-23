import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Upload,
  FileText,
  LoaderCircle,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";

function AnalyzeContract() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [toast, setToast] = useState({ message: "", type: "" });

  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 3500);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return false;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Invalid file format.");
      showToast("Invalid file format.", "error");
      setFile(null);
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10 MB.");
      showToast("File size exceeds 10 MB.", "error");
      setFile(null);
      return false;
    }

    return true;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);
    setError("");
    setAnalysis(null);
    showToast("File ready for analysis.", "success");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const selectedFile = event.dataTransfer?.files?.[0];

    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);
    setError("");
    setAnalysis(null);
    showToast("File added. Ready to upload.", "success");
  };

  const loadingSteps = [
    "Uploading Contract...",
    "Extracting Text...",
    "Detecting Financial Terms...",
    "Checking Hidden Risks...",
    "Calculating Risk Score...",
    "Generating Recommendations...",
    "Analysis Complete.",
  ];

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      setLoadingStepIndex(0);
      setLoadingProgress(0);
      return;
    }

    setLoadingStepIndex(0);
    setLoadingProgress(10);

    const stepTimer = setInterval(() => {
      setLoadingStepIndex((current) =>
        Math.min(current + 1, loadingSteps.length - 1)
      );
    }, 1300);

    return () => {
      clearInterval(stepTimer);
    };
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    if (loadingStepIndex === 0) {
      setLoadingProgress(uploadProgress);
      return;
    }

    const nextProgress = Math.min(
      90,
      10 + Math.round((loadingStepIndex / (loadingSteps.length - 1)) * 80)
    );

    setLoadingProgress(Math.max(nextProgress, uploadProgress));
  }, [loadingStepIndex, loading, uploadProgress]);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please choose a file first.");
      showToast("Please upload a PDF contract.", "error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      setLoadingStepIndex(0);
      setLoadingProgress(10);
      setError("");
      setAnalysis(null);

      const formData = new FormData();
      formData.append("contract", file);

      const uploadResponse = await api.post(
        "/contracts/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      const newContractId = uploadResponse.data.contract._id;
      setContractId(newContractId);

      const analysisResponse = await api.post(
        `/contracts/${newContractId}/analyze`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalysis(
        analysisResponse.data.analysis
      );
      navigate(`/contract/${newContractId}`);

    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const status = error.response?.status;
      const rawMessage = error.response?.data?.message || error.response?.data || error.message;

      if (status === 503) {
        setError("The AI model is currently busy. Please try again in a few seconds.");
      } else if (status === 429) {
        setError("API usage limit reached. Please try again later.");
      } else if (status === 404) {
        setError("The selected AI model is not available.");
      } else if (/network/i.test(rawMessage)) {
        setError("Unable to connect to the AI service.");
      } else {
        setError(
          typeof rawMessage === "string" && rawMessage.trim()
            ? rawMessage
            : "Something went wrong while analyzing the contract."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyze-page">

      {/* HEADER */}

      <div className="analyze-header">

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div>
          <p className="dashboard-eyebrow">
            CONTRACT INTELLIGENCE
          </p>

          <h1>
            Analyze Your Contract
          </h1>

          <p className="dashboard-subtitle">
            Upload your vehicle contract and let AI uncover
            important terms and potential risks.
          </p>
        </div>

      </div>

      {/* UPLOAD SECTION */}

      {loading && !analysis && (
        <div className="analysis-loading-shell">
          <div className="analysis-loading-card">
            <div className="loading-icon-glow">
              <LoaderCircle size={52} className="spin" />
            </div>
            <div className="loading-copy">
              <p className="dashboard-eyebrow">AI ANALYSIS IN PROGRESS</p>
              <h2>Intelligent contract analysis is running</h2>
              <p>
                Our engine is reviewing your contract, extracting core terms,
                and identifying hidden risk factors.
              </p>
            </div>

            <div className="analysis-progress-bar">
              <div
                className="analysis-progress-fill"
                style={{ width: `${Math.max(uploadProgress, loadingProgress)}%` }}
              />
            </div>

            <div className="analysis-loading-meta">
              <span>{Math.max(uploadProgress, loadingProgress)}% complete</span>
              <span>{loadingSteps[loadingStepIndex]}</span>
            </div>
          </div>
        </div>
      )}

      {!analysis && !loading && (

        <div className="analyze-upload-card">

          <div className="analyze-upload-icon">
            <Upload size={32} />
          </div>

          <h2>
            Upload Vehicle Contract
          </h2>

          <p>
            Upload your contract as a PDF file to begin the AI analysis.
          </p>

          <input
            type="file"
            id="contract-upload"
            accept="application/pdf"
            onChange={handleFileChange}
            hidden
          />

          <div
            className={`analyze-dropzone ${dragActive ? "drag-active" : ""}`}
            onClick={() => document.getElementById("contract-upload").click()}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
          >
            {file ? (
              <>
                <FileText size={30} />

                <strong>{file.name}</strong>

                <span>PDF ready for analysis</span>
              </>
            ) : (
              <>
                <Upload size={30} />

                <strong>Drag & drop your PDF here</strong>

                <span>Or click to browse files</span>
              </>
            )}
          </div>

          <div className="upload-details-grid">
            <div className="upload-details-block">
              <span>Supported Files</span>
              <ul>
                <li>PDF only</li>
                <li>Maximum size: 10 MB</li>
              </ul>
            </div>

            <div className="upload-details-block">
              <span>Supported Contracts</span>
              <ul>
                <li>Vehicle Purchase Agreement</li>
                <li>Car Loan Agreement</li>
                <li>Lease Contract</li>
              </ul>
            </div>
          </div>

          <div className="browse-row">
            <button
              type="button"
              className="browse-button"
              onClick={() => document.getElementById("contract-upload").click()}
            >
              Browse Files
            </button>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="progress-wrapper">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <span>{uploadProgress}% uploaded</span>
              </div>
            )}
          </div>

          <button
            className="dashboard-primary-button analyze-submit-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={20} className="spin" />
                AI is analyzing...
              </>
            ) : (
              <>
                Analyze Contract
                <CheckCircle size={20} />
              </>
            )}
          </button>

          {error && <p className="error-message">{error}</p>}

          {toast.message && (
            <div className={`toast ${toast.type}`}>
              {toast.message}
            </div>
          )}

        </div>

      )}

      {/* ANALYSIS RESULT */}

      {analysis && (

        <div className="analysis-result-page">

          <div className="analysis-result-header">

            <div>

              <p className="dashboard-eyebrow">
                ANALYSIS COMPLETE
              </p>

              <h2>
                Contract Analysis Result
              </h2>

            </div>
            
             <button
  className="dashboard-primary-button"
  onClick={() => navigate(`/contract/${contractId}`)}
>
  <FileText size={18} />
  View Full Details
</button>

            <button
              className="dashboard-primary-button"
              onClick={() => {
                setAnalysis(null);
                setFile(null);
              }}
            >
              <Upload size={18} />
              Analyze Another
            </button>

          </div>

          {/* VEHICLE + FINANCIAL */}

          <div className="analysis-overview-grid">

            <div className="analysis-info-card">

              <div className="analysis-card-title">
                <FileText size={20} />
                Vehicle Information
              </div>

              <h3>
                {analysis.vehicle?.make || "Unknown"}{" "}
                {analysis.vehicle?.model || ""}
              </h3>

              <p>
                Year: {analysis.vehicle?.year || "N/A"}
              </p>

              <p>
                Mileage: {analysis.vehicle?.mileage || "N/A"}
              </p>

            </div>

            <div className="analysis-info-card">

              <div className="analysis-card-title">
                <CheckCircle size={20} />
                Financial Summary
              </div>

              <h3>
                $
                {analysis.financials?.purchasePrice || "N/A"}
              </h3>

              <p>
                Purchase Price
              </p>

            </div>

          </div>

          {/* CONTRACT TERMS */}

          <div className="analysis-section-card">

            <div className="analysis-card-title">
              <FileText size={20} />
              Contract Terms
            </div>

            <div className="contract-terms-grid">

              <div>
                <span>
                  Condition
                </span>

                <strong>
                  {analysis.contractTerms?.condition || "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Warranty
                </span>

                <strong>
                  {analysis.contractTerms?.warranty || "N/A"}
                </strong>
              </div>

            </div>

          </div>

          {/* RISKS */}

         <div className="analysis-section-card">

  <div className="analysis-card-title">
    <AlertTriangle size={20} />
    Risk Analysis
  </div>

  <div className="analysis-risks">

    {analysis.riskAnalysis?.map((risk, index) => (

      <div
        key={index}
        className={`analysis-risk-card ${risk.severity?.toLowerCase()}`}
      >

        <div className="risk-severity">
          {risk.severity}
        </div>

        <div className="risk-content">
          <h4>{risk.title}</h4>

          <p>{risk.explanation}</p>
        </div>

      </div>

    ))}

  </div>

</div>

          {/* SUMMARY */}

          <div className="analysis-section-card">

            <div className="analysis-card-title">
              <FileText size={20} />
              Summary
            </div>

            <p className="analysis-summary">
              {analysis.summary}
            </p>

          </div>

          {/* RECOMMENDATIONS */}

          <div className="analysis-section-card">

            <div className="analysis-card-title">
              <Lightbulb size={20} />
              Recommendations
            </div>

            <ul className="recommendations-list">

              {analysis.recommendations?.map(
                (recommendation, index) => (

                  <li key={index}>
                    {recommendation}
                  </li>

                )
              )}

            </ul>

          </div>

        </div>

      )}

    </div>
  );
}

export default AnalyzeContract;