import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://localhost:7085/api/products");
      console.log("API response:", res.data);

      const productArray = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : res.data.products || [];

      setProducts(productArray);

      if (productArray.length === 0) {
        setMessage("No products found.");
      } else {
        setMessage(""); // clear if products exist
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
    <div style={{ padding: "20px" }}>
      <h2>Admin &gt; View Products</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : message ? (
        <p>{message}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#333", color: "#fff" }}>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Name</th>
                <th style={cellStyle}>Author</th>
                <th style={cellStyle}>Genre</th>
                <th style={cellStyle}>Price</th>
                <th style={cellStyle}>Stock</th>
                <th style={cellStyle}>On Sale</th>
                <th style={cellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={cellStyle}>{product.id}</td>
                  <td style={cellStyle}>{product.name}</td>
                  <td style={cellStyle}>{product.author}</td>
                  <td style={cellStyle}>{product.genre}</td>
                  <td style={cellStyle}>${product.price}</td>
                  <td style={cellStyle}>{product.stockQuantity}</td>
                  <td style={cellStyle}>{product.onSale ? "Yes" : "No"}</td>
                  <td style={cellStyle}>
                    <button
                      onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                      style={{ marginRight: "5px" }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      style={{ backgroundColor: "red", color: "white" }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const cellStyle = { border: "1px solid #ccc", padding: "8px", textAlign: "center" };

export default ViewProducts;
