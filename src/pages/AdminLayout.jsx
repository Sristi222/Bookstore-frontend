// src/pages/AdminLayout.jsx
import { Link, Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#333",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Admin Panel</h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/admin/add-product" style={{ color: "#fff", textDecoration: "none" }}>
                ➕ Add Product
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/admin/view-products" style={{ color: "#fff", textDecoration: "none" }}>
                📦 View Products
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/admin/add-banner" style={{ color: "#fff", textDecoration: "none" }}>
                🖼️ Add Banner
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet /> {/* Render nested routes here */}
      </div>
    </div>
  );
};

export default AdminLayout;
