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
