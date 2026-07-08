import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

function StarIcons({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(<span key={i}>{i <= Math.round(rating) ? '★' : '☆'}</span>);
  }
  return <div className="product-stars">{stars}</div>;
}

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="detail-page page-enter">
        <div className="container" style={{ textAlign: 'center', paddingTop: '120px' }}>
          <h2>Product not found</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '16px 0 32px' }}>
            The product you're looking for doesn't exist.
          </p>
          <Link to="/products" className="btn btn-primary">← Back to Products</Link>
        </div>
      </div>
    );
  }

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="detail-page page-enter" id="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <Link to="/products">Products</Link>
          <span className="separator">/</span>
          <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="detail-grid">
          {/* Gallery */}
          <div className="detail-gallery">
            <div className="detail-main-image">
              <img src={product.images[selectedImage]} alt={product.name} />
            </div>
            {product.images.length > 1 && (
              <div className="detail-thumbnails">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`detail-thumbnail ${idx === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>

            {product.badge && (
              <div style={{ marginBottom: '12px' }}>
                <span className="badge">{product.badge}</span>
              </div>
            )}

            <div className="detail-rating">
              <StarIcons rating={product.rating} />
              <span>
                {product.rating} · {product.reviews} reviews
              </span>
            </div>

            <div className="detail-price">
              <span className="current">${product.price.toFixed(2)}</span>
              <span className="original">${product.originalPrice.toFixed(2)}</span>
              <span className="save">Save {discount}%</span>
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-features">
              <h3>Key Features</h3>
              <ul>
                {product.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>
            </div>

            <div className="detail-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button className="btn btn-primary" style={{ flex: 1 }} id="add-to-cart-btn">
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </button>

              <button className="btn btn-secondary" aria-label="Add to wishlist">
                ♡
              </button>
            </div>

            {product.inStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>In Stock</span>
                <span style={{ color: 'var(--text-muted)' }}>· Free shipping over $99</span>
              </div>
            )}

            {/* Specs Table */}
            <div className="detail-specs">
              <h3>Specifications</h3>
              <table className="specs-table">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="related-section">
            <h2>You May Also Like</h2>
            <div className="products-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
