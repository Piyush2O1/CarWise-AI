function AnalysisPreview({ analysis }) {
  return (
    <section className="hero-visual">
      {analysis ? (
        <div className="dashboard-card">

          <div className="card-header">
            <span>Contract Analysis</span>

            <span className="status">
              ● Analyzed
            </span>
          </div>

          {/* VEHICLE INFORMATION */}
          <div className="vehicle-info">

            <div>
              <small>Vehicle</small>

              <h2>
                {analysis.vehicle?.make}{" "}
                {analysis.vehicle?.model}
              </h2>

              <p>
                {analysis.vehicle?.year}
                {" • "}
                {analysis.vehicle?.mileage}
                {" miles"}
              </p>
            </div>

            <div className="price">
              <small>Purchase Price</small>

              <h2>
                $
                {analysis.financials?.purchasePrice}
              </h2>
            </div>

          </div>

          {/* CONTRACT TERMS */}
          <div className="contract-terms">

            <h3>
              📄 Contract Terms
            </h3>

            <p>
              <strong>Condition:</strong>{" "}
              {analysis.contractTerms?.condition}
            </p>

            <p>
              <strong>Warranty:</strong>{" "}
              {analysis.contractTerms?.warranty}
            </p>

          </div>

          {/* RISK ANALYSIS */}
          <div className="risk-section">

            <h3>
              ⚠️ Risk Analysis
            </h3>

            {analysis.riskAnalysis?.map(
              (risk, index) => (
                <div
                  className={`risk ${risk.severity.toLowerCase()}`}
                  key={index}
                >
                  <strong>
                    {risk.severity}
                  </strong>

                  <span>
                    {risk.title}
                  </span>
                </div>
              )
            )}

          </div>

          {/* SUMMARY */}
          <div className="summary">

            <h3>
              📝 Summary
            </h3>

            <p>
              {analysis.summary}
            </p>

          </div>

          {/* RECOMMENDATIONS */}
          <div className="recommendations">

            <h3>
              💡 Recommendations
            </h3>

            <ul>
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
      ) : (
        <div className="dashboard-card">

          <div className="card-header">
            <span>
              Contract Analysis
            </span>

            <span className="status">
              ● Waiting
            </span>
          </div>

          <div className="empty-analysis">

            <div>
              🔍
            </div>

            <h2>
              Upload a contract
            </h2>

            <p>
              Your vehicle information,
              financial terms, risks, and
              recommendations will appear here.
            </p>

          </div>

        </div>
      )}
    </section>
  );
}

export default AnalysisPreview;