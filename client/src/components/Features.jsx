import {
  ShieldAlert,
  FileText,
  DollarSign,
  Sparkles,
  SearchCheck,
  Lightbulb,
} from "lucide-react";

const features = [
  {
    icon: ShieldAlert,
    title: "Risk Detection",
    description:
      "Identify high-risk clauses, hidden conditions, and potential problems before signing.",
  },
  {
    icon: FileText,
    title: "Important Clauses",
    description:
      "Quickly understand warranties, vehicle condition, obligations, and other important terms.",
  },
  {
    icon: DollarSign,
    title: "Financial Analysis",
    description:
      "Get a clear view of purchase price, fees, financing terms, and other financial details.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description:
      "Advanced AI transforms complex legal language into simple and understandable insights.",
  },
  {
    icon: SearchCheck,
    title: "Contract Review",
    description:
      "Analyze your entire vehicle contract without manually searching through every page.",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description:
      "Receive practical recommendations to help you make more informed decisions.",
  },
];

function Features() {
  return (
    <section
      id="features"
      className="features-section"
    >
      <div className="section-heading">
        <span className="section-label">
          POWERFUL FEATURES
        </span>

        <h2>
          Everything You Need to
          <span> Understand Your Contract</span>
        </h2>

        <p>
          ContractIQ helps you discover what really matters in your contract.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              className="feature-card"
              key={feature.title}
            >
              <div className="feature-icon">
                <Icon size={25} />
              </div>

              <h3>
                {feature.title}
              </h3>

              <p>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Features;