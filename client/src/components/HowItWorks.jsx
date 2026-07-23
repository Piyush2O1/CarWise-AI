import {
  Upload,
  FileSearch,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Contract",
    description:
      "Upload your vehicle purchase, lease, or financing contract as a PDF.",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "AI Reads the Document",
    description:
      "ContractIQ extracts important information and key clauses from your contract.",
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "AI Analyzes the Terms",
    description:
      "Our AI identifies financial terms, hidden risks, warranties, and important conditions.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Understand Before You Sign",
    description:
      "Get a clear summary, risk analysis, and recommendations before making a decision.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="how-it-works-section"
    >
      <div className="section-heading">
        <span className="section-label">
          HOW IT WORKS
        </span>

        <h2>
          From Complex Contract
          <span> to Clear Understanding</span>
        </h2>

        <p>
          ContractIQ makes understanding your contract simple.
        </p>
      </div>

      <div className="steps-grid">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              className="step-card"
              key={step.number}
            >
              <div className="step-top">
                <span className="step-number">
                  {step.number}
                </span>

                <div className="step-icon">
                  <Icon size={24} />
                </div>
              </div>

              <h3>
                {step.title}
              </h3>

              <p>
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorks;