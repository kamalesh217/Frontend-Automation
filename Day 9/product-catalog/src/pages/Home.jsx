import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products, categories, testimonials } from '../data/products';

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
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

export default function Home() {
  const pageRef = useReveal();
  const featured = products.filter((p) => p.badge).slice(0, 4);

  return (
    <div className="page-enter" ref={pageRef}>
      {/* Hero */}
      <section className="hero" id="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Discover <span className="gradient-text">Premium</span> Products for Modern Living
              </h1>
              <p>
                Curated collections of the finest electronics, fashion, home goods, and lifestyle essentials — designed for those who appreciate quality.
              </p>
              <div className="hero-buttons">
                <Link to="/products" className="btn btn-primary">
                  Explore Collection →
                </Link>
                <Link to="/about" className="btn btn-secondary">
                  Our Story
                </Link>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <h3>2,500+</h3>
                  <p>Premium Products</p>
                </div>
                <div className="hero-stat">
                  <h3>150K+</h3>
                  <p>Happy Customers</p>
                </div>
                <div className="hero-stat">
                  <h3>4.9★</h3>
                  <p>Average Rating</p>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"
                  alt="Premium product showcase"
                />
              </div>

              <div className="hero-float-card card-1">
                <div className="card-label">Daily Orders</div>
                <div className="card-value">📦 1,240+</div>
              </div>

              <div className="hero-float-card card-2">
                <div className="card-label">Customer Rating</div>
                <div className="card-value">⭐ 4.9 / 5.0</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" id="categories-section">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <h2 className="section-title">
              Shop by <span className="gradient-text">Category</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Browse our carefully curated categories to find exactly what you need
            </p>
          </div>

          <div className="categories-grid reveal">
            {categories.map((cat) => (
              <Link
                to="/products"
                key={cat.id}
                className="category-card glass-card"
                id={`category-${cat.id}`}
              >
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" id="featured-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <h2 className="section-title">
                Featured <span className="gradient-text">Products</span>
              </h2>
              <p className="section-subtitle">
                Hand-picked favorites our customers love
              </p>
            </div>
            <Link to="/products" className="btn btn-outline">
              View All →
            </Link>
          </div>

          <div className="products-grid reveal">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" id="testimonials-section">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <h2 className="section-title">
              What Our Customers <span className="gradient-text">Say</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Real reviews from real people who love our products
            </p>
          </div>

          <div className="testimonials-grid reveal">
            {testimonials.map((t) => (
              <div key={t.id} className="testimonial-card glass-card">
                <div className="stars">
                  {Array.from({ length: t.rating }, (_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p>"{t.text}"</p>
                <div className="testimonial-author">
                  <img src={t.avatar} alt={t.name} />
                  <div className="testimonial-author-info">
                    <h4>{t.name}</h4>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section reveal" id="cta-section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title">
            Ready to <span className="gradient-text">Elevate</span> Your Lifestyle?
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 36px' }}>
            Join 150,000+ customers who have already discovered the Luxe difference.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1rem' }}>
            Start Shopping →
          </Link>
        </div>
      </section>
    </div>
  );
}
