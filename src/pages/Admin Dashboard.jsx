import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ books: 0, orders: 0, users: 0, revenue: 0 });
  const [activities, setActivities] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const books = await axios.get("https://localhost:7085/api/products");
      const orders = await axios.get("https://localhost:7085/api/orders");
      const users = await axios.get("https://localhost:7085/api/users");
      const revenue = orders.data.reduce((sum, o) => sum + o.totalAmount, 0);
      setSummary({
        books: books.data.length,
        orders: orders.data.length,
        users: users.data.length,
        revenue,
      });

      setActivities([
        { icon: "🛒", text: `New order #ORD123458`, time: "2 minutes ago" },
        { icon: "👤", text: `New user registered`, time: "15 minutes ago" },
        { icon: "📚", text: `Book stock updated`, time: "1 hour ago" },
        { icon: "💰", text: `Payment received`, time: "3 hours ago" },
        { icon: "✅", text: `Order #ORD123457 completed`, time: "5 hours ago" },
      ]);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Admin Dashboard</h2>
        <button className="btn-signout" onClick={handleSignOut}>🚪 Sign Out</button>
      </div>

      <div className="dashboard-metrics">
        <div className="card"><span>📚</span><h4>Total Books</h4><p>{summary.books}</p></div>
        <div className="card"><span>🛒</span><h4>Total Orders</h4><p>{summary.orders}</p></div>
        <div className="card"><span>👤</span><h4>Total Users</h4><p>{summary.users}</p></div>
        <div className="card"><span>💵</span><h4>Total Revenue</h4><p>Rs. {summary.revenue}/-</p></div>
      </div>

      <div className="dashboard-panels">
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <button onClick={() => navigate("/admin/add-product")}>Add New Book</button>
            <button onClick={() => navigate("/admin/view-products")}>Manage Books</button>
            <button onClick={() => navigate("/admin/orders")}>View Orders</button>
            <button onClick={() => navigate("/admin/banners")}>Manage Banners</button>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <ul>
            {activities.map((a, i) => (
              <li key={i}><span>{a.icon}</span> {a.text} <small>{a.time}</small></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
