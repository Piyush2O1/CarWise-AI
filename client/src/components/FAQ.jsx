import { useState } from "react";
import { Plus } from "lucide-react";

const questions = [
  ["How secure are uploaded PDFs?", "Your documents are encrypted in transit and handled only to provide your requested analysis."],
  ["What contracts are supported?", "ContractIQ supports purchase agreements, loan documents, leases, and related business paperwork."],
  ["How accurate is the AI?", "The AI is designed to surface relevant terms and risks clearly. Always use the report as an aid alongside professional advice."],
  ["Is my data stored?", "Your analysis is available in your account history so you can revisit it. You can manage your account data from the dashboard."],
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return <section className="faq-section" id="faq"><div className="section-heading"><span className="section-label">QUESTIONS, ANSWERED</span><h2>Good to know.</h2></div><div className="faq-list">{questions.map(([question, answer], index) => <div className={`faq-item ${open === index ? "is-open" : ""}`} key={question}><button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span>{question}</span><Plus size={19} /></button>{open === index && <p>{answer}</p>}</div>)}</div></section>;
}

export default FAQ;