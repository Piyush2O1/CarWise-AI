const testimonials = [
  ["AS", "Aarav Sharma", "First-time buyer", "This AI saved me from hidden loan charges. I walked into the dealership with the right questions."],
  ["NP", "Nisha Patel", "Small business owner", "Finally, a contract review that speaks like a human. The report made comparing two offers easy."],
  ["RK", "Rohan Kapoor", "Car enthusiast", "The risk score gave me confidence to negotiate instead of signing terms I did not understand."],
];

function Testimonials() {
  return <section className="testimonials-section"><div className="section-heading"><span className="section-label">FROM THE DRIVER'S SEAT</span><h2>Clarity feels <span>good.</span></h2></div><div className="testimonials-grid">{testimonials.map(([initials, name, role, quote]) => <article className="testimonial-card" key={name}><div className="testimonial-head"><div className="avatar">{initials}</div><div><strong>{name}</strong><span>{role}</span></div><b className="stars">★★★★★</b></div><p>“{quote}”</p></article>)}</div></section>;
}

export default Testimonials;