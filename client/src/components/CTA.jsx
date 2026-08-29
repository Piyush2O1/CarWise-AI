import { ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CTA() {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="cta-content">

        <div className="cta-icon">
          <ShieldCheck size={32} />
        </div>

        <h2>
          Know What You’re
          <span> Signing Before You Sign</span>
        </h2>

        <p>
          Upload your contract and let CarWise AI uncover
          important terms, hidden risks, and financial details in seconds.
        </p>

        <button
          className="cta-button"
          onClick={() => navigate("/login")}
        >
          Analyze Your Contract
          <ArrowRight size={20} />
        </button>

      </div>
    </section>
  );
}

export default CTA;