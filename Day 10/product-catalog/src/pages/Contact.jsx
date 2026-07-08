import { useState } from 'react';

const infoCards = [
  { icon: '✉️', title: 'Email Us', lines: ['hello@luxe.com', 'support@luxe.com'] },
  { icon: '📞', title: 'Call Us', lines: ['+1 (555) 123-4567', 'Mon–Fri, 9am–6pm EST'] },
  { icon: '📍', title: 'Visit Us', lines: ['123 Design District', 'New York, NY 10001'] },
  { icon: '💬', title: 'Live Chat', lines: ['Available 24/7', 'Average response: 2 min'] },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="contact-hero" id="contact-hero">
        <div className="container">
          <h1>
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p>Have a question or feedback? We'd love to hear from you.</p>
        </div>
      </section>

      {/* Content */}
      <div className="container">
        <div className="contact-grid" id="contact-grid">
          {/* Info Cards */}
          <div className="contact-info-cards">
            {infoCards.map((card, i) => (
              <div key={i} className="contact-info-card glass-card">
                <div className="info-icon">{card.icon}</div>
                <div>
                  <h3>{card.title}</h3>
                  {card.lines.map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="contact-form glass-card" id="contact-form">
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more about your inquiry..."
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                  Send Message →
                </button>
              </form>
            ) : (
              <div className="form-success">
                <div className="success-icon">✅</div>
                <h3>Message Sent!</h3>
                <p>
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: '20px' }}
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ firstName: '', lastName: '', email: '', subject: '', message: '' });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
