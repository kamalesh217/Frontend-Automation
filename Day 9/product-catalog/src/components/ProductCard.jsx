import { Link } from 'react-router-dom';

function StarIcons({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i}>{i <= Math.round(rating) ? '★' : '☆'}</span>
    );
  }
  return <div className="product-stars">{stars}</div>;
}

export default function ProductCard({ product }) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <Link to={`/products/${product.id}`} className="product-card glass-card" id={`product-card-${product.id}`}>
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <div className="product-badge">
            <span className="badge">{product.badge}</span>
          </div>
        )}
        <button
          className="product-wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label="Add to wishlist"
        >
          ♡
        </button>
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          <StarIcons rating={product.rating} />
          <span className="product-rating-text">
            {product.rating} ({product.reviews})
          </span>
        </div>

        <div className="product-price-row">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <span className="product-original-price">${product.originalPrice.toFixed(2)}</span>
          {discount > 0 && (
            <span className="product-discount">-{discount}%</span>
          )}
        </div>
      </div>
    </Link>
  );
}
