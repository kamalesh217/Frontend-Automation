import { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';

export default function Products() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const filtered = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [search, activeCategory, sortBy]);

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="products-header" id="products-page-header">
        <div className="container">
          <h1>
            Our <span className="gradient-text">Collection</span>
          </h1>
          <p>Explore our full range of premium products, curated for quality and design</p>
        </div>
      </div>

      {/* Filters */}
      <div className="container">
        <div className="filters-bar" id="filters-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-input"
            />
          </div>

          <div className="filter-pills">
            <button
              className={`filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                id={`filter-${cat.id}`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            id="sort-select"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">A → Z</option>
          </select>
        </div>

        <p className="results-count">
          Showing {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        </p>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <div className="products-grid" id="products-grid" style={{ paddingBottom: '80px' }}>
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔎</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
