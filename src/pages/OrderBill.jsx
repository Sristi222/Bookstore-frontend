"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OrderBill = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderResponse, setOrderResponse] = useState(null); // ✅ hold order result
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const API_URL = "https://localhost:7085/api";

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    if (storedCart.length === 0) {
      alert("No cart data. Redirecting to cart.");
      navigate("/cart");
    } else {
      setCart(storedCart);
      const totalPrice = storedCart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      setTotal(totalPrice);
      setLoading(false);
    }
  }, []);

  const confirmOrder = async () => {
    try {
      const res = await axios.post(`${API_URL}/Orders?userId=${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("cartItems"); // clear cart
      setOrderResponse(res.data); // ✅ store order result
    } catch (err) {
      alert("Failed to place order: " + (err.response?.data || err.message));
    }
  };

  if (loading) return <div>Loading your bill...</div>;

  return (
    <div className="order-bill-container">
      <h1>Order Bill Summary</h1>

      {orderResponse ? (
        <>
          <h2>✅ Order Confirmed!</h2>
          <p><strong>Order ID:</strong> {orderResponse.id}</p>
          <p><strong>Claim Code:</strong> {orderResponse.claimCode}</p>
          <p><strong>Status:</strong> {orderResponse.status}</p>
          <p><strong>Total:</strong> Rs. {orderResponse.totalAmount.toFixed(2)}</p>

          <button onClick={() => navigate("/orders")}>
            Go to My Orders
          </button>
          <button onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </>
      ) : (
        <>
          <table className="bill-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product.name}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {item.product.price.toFixed(2)}</td>
                  <td>Rs. {(item.product.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: "right", fontWeight: "bold" }}>
                  Total
                </td>
                <td style={{ fontWeight: "bold" }}>Rs. {total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <button className="confirm-btn" onClick={confirmOrder}>
            Confirm & Place Order
          </button>

          <button className="back-btn" onClick={() => navigate("/cart")}>
            ← Back to Cart
          </button>
        </>
      )}
    </div>
  );
};

export default OrderBill;
