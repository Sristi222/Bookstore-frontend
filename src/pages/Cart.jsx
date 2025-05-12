"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Menu, X, ShoppingCart, Settings } from "lucide-react";
import "./Home.css";
import "./Cart.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isLoggedIn = () => !!localStorage.getItem("token");
  const API_URL = "https://localhost:7085/api";
  const userId = localStorage.getItem("userId") || "guest";
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/Cart?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      setCart(response.data.items || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cart:", err.response?.data || err.message);
      setCart([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `${API_URL}/Cart/${itemId}?userId=${userId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const proceedToOrderBill = () => {
    localStorage.setItem("cartItems", JSON.stringify(cart));
    navigate("/order-bill"); // 🟢 new page for Order Summary
  };

  if (loading) return <div className="loading">Loading your cart...</div>;

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo">BOOK SHOP</a>
          <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <div className="nav-center">
              <a href="/" className="nav-link">Home</a>
              <a href="/shop" className="nav-link">Shop</a>
              <a href="/cart" className="nav-link">Cart</a>
              <a href="/bookmarks" className="nav-link">Bookmarks</a>
            </div>
            <div className="nav-right">
              {isLoggedIn() ? (
                <button
                  className="btn logout-btn"
                  onClick={() => { logout(); window.location.reload(); }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <a href="/login" className="btn login-btn">Login</a>
                  <a href="/register" className="btn signup-btn">Sign Up</a>
                </>
              )}
              <a href="/cart" className="cart-icon">
                <ShoppingCart size={20} style={{ color: "#b8860b" }} />
              </a>
              <button className="settings-icon">
                <Settings size={20} style={{ color: "#b8860b" }} />
              </button>
            </div>
          </nav>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X style={{ color: "#b8860b" }} />
            ) : (
              <Menu style={{ color: "#b8860b" }} />
            )}
          </button>
        </div>
      </header>

      <main className="cart-main">
        <div className="cart-container">
          <h1 className="cart-title">Cart Items</h1>
          <div className="cart-details">
            <h2 className="cart-subtitle">Your Cart Details</h2>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any books to your cart yet.</p>
                <button
                  className="continue-shopping-btn"
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="item-image">
                        <img
                          src={
                            item.product.image?.startsWith("/uploads")
                              ? `https://localhost:7085${item.product.image}`
                              : item.product.image || "/placeholder.svg"
                          }
                          alt={item.product.name}
                        />
                      </div>
                      <div className="item-name">
                        <h3>Book Name</h3>
                        <p>{item.product.name}</p>
                      </div>
                      <div className="item-description">
                        <h3>{item.product.description}</h3>
                      </div>
                      <div className="item-price">
                        <h3>Rs {item.product.price}</h3>
                      </div>
                      <div className="item-quantity">
                        <h3>Copies</h3>
                        <div className="quantity-control">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <h3>Total Price: Rs. {calculateTotal().toFixed(2)}</h3>
                  </div>
                  <div className="cart-actions">
                    <button
                      className="checkout-btn"
                      onClick={proceedToOrderBill}
                    >
                      Proceed to Checkout
                    </button>
                    <button className="details-btn">Add Personal Details</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-columns">
            <div className="footer-column">
              <h3>Book Shop</h3>
              <p>Your one-stop destination for books that inspire, educate, and entertain.</p>
            </div>
            <div className="footer-column">
              <h4>Shop</h4>
              <ul>
                <li><a href="#">New Arrivals</a></li>
                <li><a href="#">Best Sellers</a></li>
                <li><a href="#">Sale</a></li>
                <li><a href="#">Collections</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Help</h4>
              <ul>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQs</a></li>
                <li><a href="#">Shipping</a></li>
                <li><a href="#">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Book Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
