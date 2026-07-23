const metrics = [
  ["1000+", "Contracts analyzed"],
  ["98%", "Accuracy"],
  ["2 sec", "Average analysis"],
  ["24/7", "Availability"],
];

function Metrics() {
  return <section className="metrics-section" aria-label="ContractIQ metrics">
    {metrics.map(([value, label]) => <div className="metric" key={label}><strong>{value}</strong><span>{label}</span></div>)}
  </section>;
}

export default Metrics;