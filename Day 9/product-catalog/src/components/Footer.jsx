import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="navbar-logo">LUXE</Link>
            <p>
              Curating premium products for modern living. Every item in our catalog is selected for quality, design, and purpose.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>

            <div className="footer-newsletter">
              <p>Stay updated with our latest drops</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email" aria-label="Newsletter email" />
                <button type="button">Subscribe</button>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="footer-column">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products">Electronics</Link>
            <Link to="/products">Fashion</Link>
            <Link to="/products">Home & Living</Link>
            <Link to="/products">Lifestyle</Link>
          </div>

          {/* Company */}
          <div className="footer-column">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Blog</a>
          </div>

          {/* Support */}
          <div className="footer-column">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Shipping Info</a>
            <a href="#">Returns</a>
            <a href="#">Size Guide</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Luxe. All rights reserved.</span>
          <span>Designed with ♥ for modern living</span>
        </div>
      </div>
    </footer>
  );
}
