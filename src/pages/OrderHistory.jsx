"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ShoppingCart, ArrowLeft, CheckCircle, Clock, Package, XCircle } from "lucide-react"
import "./OrderHistory.css"
import "./Home.css"

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [notification, setNotification] = useState(null)
  const [processingCancel, setProcessingCancel] = useState(false)

  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const API_URL = "https://localhost:7085/api"
  const navigate = useNavigate()

  const isLoggedIn = () => !!localStorage.getItem("token")
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/Orders?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(res.data)
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const openCancelConfirmModal = (orderId) => {
    setOrderToCancel(orderId)
    setIsConfirmModalOpen(true)
  }

  const closeCancelConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setOrderToCancel(null)
  }

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return

    setProcessingCancel(true)
    try {
      await axios.put(`${API_URL}/Orders/${orderToCancel}/cancel?userId=${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Show success notification instead of alert
      showNotification("Success", "Order cancelled successfully!", "success")
      fetchOrders() // refresh orders
    } catch (err) {
      showNotification("Error", "Failed to cancel order: " + (err.response?.data || err.message), "error")
    } finally {
      setProcessingCancel(false)
      closeCancelConfirmModal()
    }
  }

  const showNotification = (title, message, type = "success") => {
    setNotification({ title, message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000) // Hide after 5 seconds
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login")
      return
    }
    fetchOrders()
  }, [])

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle size={18} className="status-icon completed" />
      case "pending":
        return <Clock size={18} className="status-icon pending" />
      case "processing":
        return <Package size={18} className="status-icon processing" />
      case "cancelled":
        return <XCircle size={18} className="status-icon cancelled" />
      default:
        return <Clock size={18} className="status-icon" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Function to view product details
  const viewProductDetails = (productId) => {
    navigate(`/products/${productId}`)
  }

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo">
            BOOK SHOP
          </a>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
          <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <a href="/" className="nav-link">
              Home
            </a>

            <a href="/my-reviews" className="nav-link">
              My Reviews
            </a>

            <a href="/bookmarks" className="nav-link">
              Bookmarks
            </a>
            <a href="/orders" className="nav-link active">
              My Orders
            </a>
            <a href="/cart" className="cart-icon">
              <ShoppingCart size={20} style={{ color: "#b8860b" }} />
            </a>
            <div className="auth-buttons">
              {isLoggedIn() ? (
                <button
                  className="btn logout-btn"
                  onClick={() => {
                    logout()
                    window.location.reload()
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <a href="/login" className="btn login-btn">
                    Login
                  </a>
                  <a href="/register" className="btn register-btn">
                    Register
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="order-history-main">
        <div className="container">
          <div className="order-history-header">
            <button onClick={() => navigate(-1)} className="back-button">
              <ArrowLeft size={18} /> Back
            </button>
            <h1 className="order-history-title">Order History</h1>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-orders">
              <p>You haven't placed any orders yet.</p>
              <button className="shop-now-btn" onClick={() => navigate("/")}>
                Shop Now
              </button>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Claim Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="order-row">
                      <td className="order-id">{order.id}</td>
                      <td className="order-date">{formatDate(order.createdAt)}</td>
                      <td className="order-status-cell">
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="order-items-cell">
                        <div className="order-items-list">
                          {order.orderItems.map((item, idx) => (
                            <div key={idx} className="table-item">
                              <span className="item-name">{item.productName}</span>
                              <span className="item-qty">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="order-total">Rs. {order.totalAmount.toFixed(2)}</td>
                      <td className="claim-code">{order.claimCode}</td>
                      <td className="actions-cell">
                        {(order.status === "Pending" || order.status === "Processing") && (
                          <button className="cancelBtn" onClick={() => openCancelConfirmModal(order.id)}>
                            Cancel
                          </button>
                        )}
                        {order.orderItems.length > 0 && order.orderItems[0].productId && (
                          <button
                            className="view-btn"
                            onClick={() => viewProductDetails(order.orderItems[0].productId)}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
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
                <li>
                  <a href="/products?category=new-releases">New Arrivals</a>
                </li>
                <li>
                  <a href="/products?category=bestsellers">Best Sellers</a>
                </li>
                <li>
                  <a href="/products?category=deals">Sale</a>
                </li>
                <li>
                  <a href="/products?category=award-winners">Award Winners</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Help</h4>
              <ul>
                <li>
                  <a href="/contact">Contact Us</a>
                </li>
                <li>
                  <a href="/faq">FAQs</a>
                </li>
                <li>
                  <a href="/shipping">Shipping</a>
                </li>
                <li>
                  <a href="/returns">Returns</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Book Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Cancellation</h3>
              <button className="modal-close-btn" onClick={closeCancelConfirmModal}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to cancel this order?</p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={confirmCancelOrder} disabled={processingCancel}>
                {processingCancel ? (
                  <>
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
                      className="loading-icon"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Yes, Cancel Order"
                )}
              </button>
              <button className="btn btn-outline" onClick={closeCancelConfirmModal}>
                No, Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-header">
            <h4>{notification.title}</h4>
            <button className="notification-close" onClick={() => setNotification(null)}>
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
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  )
}

export default OrderHistory
