// src/pages/AdminLayout.jsx
import { Link, Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/login"); // Redirects to login page
  };

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
          justifyContent: "space-between",
        }}
      >
        <div>
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

        {/* Signout Button */}
        <button
          onClick={handleSignOut}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "15px",
            marginTop: "20px",
          }}
        >
          🚪 Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#f9f9f9" }}>
        <Outlet /> {/* Nested routes render here */}
      </div>
    </div>
  );
};

export default AdminLayout;
