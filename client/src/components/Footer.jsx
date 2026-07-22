function Footer() {
  return (
    <footer className="footer">

      <div className="footer-content">

        <div className="footer-brand">
          <div className="footer-logo">
            🚗 CarWise AI
          </div>

          <p>
            Understand your vehicle contract before you sign.
          </p>
        </div>

        <div className="footer-links">

          <div>
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="#features">Features</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/analyze">Analyze Contract</a>
          </div>

          <div>
            <h4>Account</h4>
            <a href="/login">Login</a>
            <a href="/signup">Signup</a>
          </div>

          <div>
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms and Conditions</a>
          </div>

          <div>
            <h4>Social</h4>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>

        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © 2026 CarWise AI. All rights reserved.
        </p>

        <p>
          AI-powered contract intelligence 🚗
        </p>
      </div>

    </footer>
  );
}

export default Footer;