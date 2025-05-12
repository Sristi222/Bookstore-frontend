"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const API_URL = "https://localhost:7085/api";
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/Orders?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await axios.put(`${API_URL}/Orders/${orderId}/cancel?userId=${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Order cancelled!");
      fetchOrders(); // refresh orders
    } catch (err) {
      alert("Failed to cancel order: " + (err.response?.data || err.message));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading your orders...</div>;

  return (
    <div className="order-history-container">
      <h1>Your Orders</h1>

      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Claim Code</th> {/* ✅ added */}
              <th>Status</th>
              <th>Total (Rs.)</th>
              <th>Date</th>
              <th>Items</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.claimCode}</td> {/* ✅ display claim code */}
                <td>{order.status}</td>
                <td>{order.totalAmount.toFixed(2)}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx}>
                      {item.productName} x {item.quantity}
                    </div>
                  ))}
                </td>
                <td>
                  {order.status === "Pending" || order.status === "Processing" ? (
                    <button onClick={() => cancelOrder(order.id)}>Cancel</button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={() => navigate("/")}>← Back to Home</button>
    </div>
  );
};

export default OrderHistory;
