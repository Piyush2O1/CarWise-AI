import { AlertTriangle, Check, CircleDollarSign, FileText, ShieldCheck } from "lucide-react";

function ReportPreview() {
  return <section className="report-section" id="report">
    <div className="section-heading report-heading"><span className="section-label">A CLEARER VIEW</span><h2>See the signal inside<br /><span>the paperwork.</span></h2><p>One focused report turns dense contract language into decisions you can act on.</p></div>
    <div className="report-window">
      <div className="report-topbar"><span><i className="window-dot" /> Contract analysis</span><span className="report-live"><Check size={13} /> Complete</span></div>
      <div className="report-body">
        <aside className="report-sidebar"><div className="report-brand"><ShieldCheck size={18} /> CarWise AI</div><span className="sidebar-active"><FileText size={15} /> Overview</span><span><CircleDollarSign size={15} /> Financial terms</span><span><AlertTriangle size={15} /> Risk flags <b>2</b></span><span><Check size={15} /> Recommendations</span></aside>
        <div className="report-content"><div className="report-title"><div><small>VEHICLE LOAN.PDF</small><h3>Contract overview</h3></div><span className="safe-pill"><Check size={14} /> SAFE TO REVIEW</span></div>
          <div className="report-summary-grid"><div className="score-panel"><span>Safety score</span><strong>84</strong><small>out of 100</small><div className="score-bar"><i /></div><em>Low risk contract</em></div><div className="report-details"><div><span>Vehicle</span><strong>2024 Honda City</strong></div><div><span>Purchase price</span><strong>₹12,40,000</strong></div><div><span>Loan term</span><strong>60 months</strong></div><div><span>Est. savings</span><strong className="green-text">₹25,000</strong></div></div></div>
          <div className="clause-grid"><div><div className="mini-heading"><FileText size={15} /> Important clauses <b>8</b></div><p>Warranty coverage is limited to 3 years or 60,000 km.</p><p>Prepayment charges apply after the first 12 months.</p></div><div><div className="mini-heading warning"><AlertTriangle size={15} /> Hidden risks <b>2</b></div><p>Processing fee is excluded from the advertised interest rate.</p><p>Late payment penalty may compound monthly.</p></div></div>
          <div className="recommendation"><Check size={17} /><div><strong>Our recommendation</strong><span>Ask the dealer to confirm all fees in writing before signing.</span></div></div>
        </div>
      </div>
    </div>
  </section>;
}

export default ReportPreview;