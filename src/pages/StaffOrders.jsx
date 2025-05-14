<<<<<<< HEAD
"use client"

import { useState } from "react"
import "./StaffLayout.css"

// Replace the entire component with this updated version
const StaffOrders = () => {
  // Sample data for demonstration
  const sampleOrders = [
    { id: 7245, userId: "user123", status: "Pending", totalAmount: 1200.0, claimCode: "CLAIM7245" },
    { id: 7244, userId: "user456", status: "Completed", totalAmount: 850.0, claimCode: "CLAIM7244" },
    { id: 7243, userId: "user789", status: "Completed", totalAmount: 2400.0, claimCode: "CLAIM7243" },
    { id: 7242, userId: "user321", status: "Pending", totalAmount: 1750.0, claimCode: "CLAIM7242" },
    { id: 7241, userId: "user654", status: "Completed", totalAmount: 950.0, claimCode: "CLAIM7241" },
    { id: 7240, userId: "user987", status: "Pending", totalAmount: 1500.0, claimCode: "CLAIM7240" },
    { id: 7239, userId: "user135", status: "Completed", totalAmount: 2100.0, claimCode: "CLAIM7239" },
    { id: 7238, userId: "user246", status: "Pending", totalAmount: 780.0, claimCode: "CLAIM7238" },
  ]

  const [orders, setOrders] = useState(sampleOrders)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.claimCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const processOrder = (claimCode) => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setOrders(orders.map((order) => (order.claimCode === claimCode ? { ...order, status: "Completed" } : order)))
      setLoading(false)
    }, 1000)
  }

  return (
    <>
      <h1 className="page-title">Manage Orders</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Orders</h2>
          <p className="card-description">View and manage all customer orders</p>
        </div>
        <div className="card-content">
          <div className="filters">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search by order ID, user, or claim code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <div className="filter-dropdown">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Claim Code</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.userId}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                      </td>
                      <td>Rs. {order.totalAmount.toFixed(2)}</td>
                      <td>{order.claimCode}</td>
                      <td>
                        {order.status !== "Completed" ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => processOrder(order.claimCode)}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="loading-icon"
                                >
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                </svg>
                                Processing
                              </>
                            ) : (
                              "Fulfill"
                            )}
                          </button>
                        ) : (
                          <span className="completed-status">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default StaffOrders
=======
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const API_URL = "https://localhost:7085/api";

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/Orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      alert("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="staff-orders">
      <h2>All Orders</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>OrderId</th>
            <th>User</th>
            <th>Status</th>
            <th>Total</th>
            <th>ClaimCode</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan="6">No orders found.</td></tr>
          ) : (
            orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.userId}</td>
                <td>{order.status}</td>
                <td>Rs. {order.totalAmount.toFixed(2)}</td>
                <td>{order.claimCode}</td>
                <td>
                  {order.status !== "Completed" ? (
                    <button onClick={() => processOrder(order.claimCode)}>
                      Fulfill
                    </button>
                  ) : (
                    "✅ Completed"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const processOrder = async (claimCode) => {
  const confirm = window.confirm(`Mark order with claim code ${claimCode} as completed?`);
  if (!confirm) return;

  const token = localStorage.getItem("token");
  const API_URL = "https://localhost:7085/api";

  try {
    const res = await axios.post(`${API_URL}/Orders/process-claim?claimCode=${claimCode}`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert(res.data.message || "Order fulfilled.");
    window.location.reload();
  } catch (err) {
    alert(err.response?.data || "Failed to fulfill order.");
    console.error("Error processing claim:", err);
  }
};

export default StaffOrders;
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
