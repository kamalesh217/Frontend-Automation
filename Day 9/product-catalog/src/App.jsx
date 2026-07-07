import React, { useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Laptop",
      category: "Electronics",
      price: 65000,
    },
    {
      id: 2,
      name: "Shoes",
      category: "Fashion",
      price: 2500,
    },
    {
      id: 3,
      name: "Book",
      category: "Education",
      price: 600,
    },
  ]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const addProduct = () => {
    if (!name || !category || !price) {
      alert("Please fill all fields");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name,
      category,
      price,
    };

    setProducts([...products, newProduct]);

    setName("");
    setCategory("");
    setPrice("");
  };

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      filter === "All" || product.category === filter;

    return matchSearch && matchCategory;
  });

  return (
    <div className="container">

      <h1>🛍 Product Catalog</h1>

      <div className="form">

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button onClick={addProduct}>Add Product</button>

      </div>

      <div className="filters">

        <input
          type="text"
          placeholder="Search Product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Electronics</option>
          <option>Fashion</option>
          <option>Education</option>
        </select>

      </div>

      <div className="products">

        {filteredProducts.length === 0 ? (
          <h2>No Products Found</h2>
        ) : (
          filteredProducts.map((product) => (
            <div className="card" key={product.id}>

              <h2>{product.name}</h2>

              <p>
                <strong>Category:</strong> {product.category}
              </p>

              <p>
                <strong>Price:</strong> ₹{product.price}
              </p>

              <button
                className="delete"
                onClick={() => deleteProduct(product.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default App;