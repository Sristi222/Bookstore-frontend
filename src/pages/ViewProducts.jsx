import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ViewProducts.css";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://localhost:7085/api/products");

      const productArray = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : res.data.products || [];

      setProducts(productArray);

      if (productArray.length === 0) {
        setMessage("No products found.");
      } else {
        setMessage("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`https://localhost:7085/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("✅ Product deleted.");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete product.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="view-products-container">
      <div className="view-products-card">
        <div className="view-products-header">
          <h2>📚 Admin &gt; View Products</h2>
          <p>Below is the list of all products in your store.</p>
        </div>

        {loading ? (
          <p className="status-msg">Loading products...</p>
        ) : message ? (
          <p className="status-msg">{message}</p>
        ) : (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>On Sale</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.author}</td>
                    <td>{product.genre}</td>
                    <td>Rs. {product.price}</td>
                    <td>{product.stockQuantity}</td>
                    <td>{product.onSale ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteProduct(product.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProducts;
