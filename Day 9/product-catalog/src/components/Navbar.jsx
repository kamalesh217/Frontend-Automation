import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMobile}>
          LUXE
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={closeMobile}>Home</NavLink>
          <NavLink to="/products" onClick={closeMobile}>Products</NavLink>
          <NavLink to="/about" onClick={closeMobile}>About</NavLink>
          <NavLink to="/contact" onClick={closeMobile}>Contact</NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="navbar-cart" aria-label="Cart">
            🛒
            <span className="cart-count">3</span>
          </button>

          <button
            className={`mobile-toggle ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}
