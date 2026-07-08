import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    const elements = ref.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

const stats = [
  { value: '2,500+', label: 'Products Curated' },
  { value: '150K+', label: 'Happy Customers' },
  { value: '45+', label: 'Countries Served' },
  { value: '99.2%', label: 'Satisfaction Rate' },
];

const values = [
  { icon: '💎', title: 'Quality First', desc: 'Every product undergoes rigorous testing and meets our exacting standards before earning a place in our catalog.' },
  { icon: '🌱', title: 'Sustainability', desc: 'We partner with brands committed to ethical sourcing, sustainable materials, and reducing environmental impact.' },
  { icon: '🤝', title: 'Customer Obsession', desc: 'From curated recommendations to hassle-free returns, every decision we make starts with you.' },
];

const team = [
  { name: 'Elena Vasquez', role: 'Founder & CEO', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
  { name: 'Marcus Chen', role: 'Head of Product', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
  { name: 'Aisha Patel', role: 'Creative Director', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
  { name: 'David Kim', role: 'Head of Engineering', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
];

export default function About() {
  const pageRef = useReveal();

  return (
    <div className="page-enter" ref={pageRef}>
      {/* Hero */}
      <section className="about-hero" id="about-hero">
        <div className="container">
          <h1>
            Our <span className="gradient-text">Story</span>
          </h1>
          <p>
            Founded in 2020, Luxe was born from a simple belief: everyone deserves access to beautifully designed, premium-quality products without the traditional luxury markup.
          </p>

          <div className="about-stats reveal">
            {stats.map((s, i) => (
              <div key={i} className="about-stat glass-card">
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section" id="about-story-section">
        <div className="container">
          <div className="about-story reveal">
            <div className="about-story-image">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80"
                alt="Our workspace"
              />
            </div>
            <div className="about-story-content">
              <h2>
                Built for the <span className="gradient-text">Modern Consumer</span>
              </h2>
              <p>
                We started as a small team of design enthusiasts frustrated with the gap between mass-market mediocrity and out-of-reach luxury. We knew there had to be a better way.
              </p>
              <p>
                Today, Luxe partners with over 200 independent brands and artisans worldwide, bringing their finest creations to a global audience. Every product in our catalog is personally tested and approved by our curation team.
              </p>
              <p>
                Our commitment goes beyond products. We're building a community of people who value thoughtful design, sustainable practices, and the joy of owning something truly special.
              </p>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Get in Touch →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section about-values" id="about-values-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">
              What We <span className="gradient-text">Stand For</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              The principles that guide everything we do
            </p>
          </div>

          <div className="values-grid reveal">
            {values.map((v, i) => (
              <div key={i} className="value-card glass-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section about-team" id="about-team-section">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">
              Meet the <span className="gradient-text">Team</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              The passionate people behind Luxe
            </p>
          </div>

          <div className="team-grid reveal">
            {team.map((t, i) => (
              <div key={i} className="team-card glass-card">
                <img src={t.avatar} alt={t.name} />
                <h4>{t.name}</h4>
                <span>{t.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section reveal" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title">
            Want to <span className="gradient-text">Join Us</span>?
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 36px' }}>
            We're always looking for talented, passionate people to join our growing team.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1rem' }}>
            Get in Touch →
          </Link>
        </div>
      </section>
    </div>
  );
}
