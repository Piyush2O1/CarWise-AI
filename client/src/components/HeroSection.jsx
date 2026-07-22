function HeroSection({ file, handleFileChange, handleAnalyze, loading, error }) {
  return (
    <section className="hero-content">
      <div className="badge">
        🤖 AI-Powered Vehicle Contract Intelligence
      </div>

      <h1>
        Understand Your
        <span> Car Contract </span>
        Before You Sign
      </h1>

      <p>
        Upload your vehicle contract and let CarWise AI uncover hidden risks,
        financial terms, and important clauses in seconds.
      </p>

      <div className="upload-card">
        <input
          type="file"
          id="contract-file"
          accept=".pdf"
          onChange={handleFileChange}
          hidden
        />

        <label
          htmlFor="contract-file"
          className="upload-area"
        >
          <div className="upload-icon">
            📄
          </div>

          {file ? (
            <>
              <h3>{file.name}</h3>

              <p>
                Ready to analyze your contract
              </p>
            </>
          ) : (
            <>
              <h3>
                Upload your vehicle contract
              </h3>

              <p>
                Drag & drop your PDF here or click to browse
              </p>
            </>
          )}
        </label>

        {file && (
          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading
              ? "Analyzing Contract..."
              : "Analyze Contract 🚀"}
          </button>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

export default HeroSection;