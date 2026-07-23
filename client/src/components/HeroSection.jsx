import { ArrowRight, Play, ShieldCheck, Sparkles, Zap } from "lucide-react";

function HeroSection({ file, handleFileChange, handleAnalyze, loading, error, focusUpload }) {
  return (
    <section className="hero-content">
      <div className="badge">
        <Sparkles size={15} /> AI-powered contract intelligence
      </div>

      <h1>
        Understand every vehicle contract <span>before you sign.</span>
      </h1>

      <p>
        CarWise AI finds hidden risks, financial obligations, and important clauses
        in seconds, so you can sign with clarity.
      </p>

      <div className="hero-actions">
        <button className="hero-primary-button" type="button" onClick={focusUpload}>
          Analyze Contract <ArrowRight size={17} />
        </button>
        <a className="hero-secondary-button" href="#report">
          <Play size={15} fill="currentColor" /> Watch Demo
        </a>
      </div>

      <div className="trust-badges" aria-label="CarWise AI benefits">
        <span><Sparkles size={14} /> AI powered</span>
        <span><ShieldCheck size={14} /> Secure PDF upload</span>
        <span><Zap size={14} /> Instant analysis</span>
        <span>✓ No hidden charges</span>
      </div>

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
          <div className="upload-icon">↥</div>

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