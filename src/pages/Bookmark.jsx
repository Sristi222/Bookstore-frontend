"use client"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { ShoppingCart } from "lucide-react"
import "./Home.css"

const isLoggedIn = () => !!localStorage.getItem("token")
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userId")
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const navigate = useNavigate()

  const API_URL = "https://localhost:7085/api"
  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")

  useEffect(() => {
    if (!isLoggedIn()) {
      showNotification("Please log in to view your bookmarks.", "error")
      setTimeout(() => navigate("/login"), 2000)
      return
    }
    fetchBookmarks()
  }, [navigate])

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get(`${API_URL}/Bookmarks?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setBookmarks(res.data)
    } catch (error) {
      console.error("Failed to load bookmarks:", error)
      showNotification("Failed to load bookmarks.", "error")
    }
  }

  // Function to show notifications
  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type,
    })
  }

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const removeBookmark = async (bookId, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await axios.delete(`${API_URL}/Bookmarks/${bookId}?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setBookmarks((prev) => prev.filter((b) => b.bookId !== bookId))
      showNotification("Bookmark removed.", "info")
    } catch (error) {
      console.error("Error removing bookmark:", error)
      showNotification("Failed to remove bookmark.", "error")
    }
  }

  const addToCart = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      let cartUserId = userId
      if (!cartUserId || cartUserId.startsWith("guest-")) {
        cartUserId = "guest-" + Math.random().toString(36).substring(2, 15)
        localStorage.setItem("userId", cartUserId)
      }

      await axios.post(
        `${API_URL}/Cart?userId=${cartUserId}`,
        { productId: product.id, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      showNotification(`${product.name} added to cart!`, "success")
      setTimeout(() => navigate("/cart"), 2000)
    } catch (error) {
      showNotification("Failed to add item to cart. Please try again.", "error")
      console.error("Error adding to cart:", error)
    }
  }

  return (
    <div className="app-container">
      {/* Notification */}
      {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}

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
            <a href="/orders" className="nav-link">
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

      <main className="main-content">
        <div className="container">
          <h1 className="section-heading">Your Bookmarked Books</h1>

          {bookmarks.length === 0 ? (
            <div className="empty-bookmarks">
              <p>You haven't bookmarked any books yet.</p>
              <button className="btn shop-now-btn" onClick={() => navigate("/")}>
                Browse Books
              </button>
            </div>
          ) : (
            <section className="product-grid">
              {bookmarks.map((bookmark) => (
                <Link to={`/products/${bookmark.bookId}`} className="product-card" key={bookmark.bookId}>
                  <div className="product-image">
                    <img
                      src={
                        bookmark.book.image?.startsWith("/uploads")
                          ? `https://localhost:7085${bookmark.book.image}`
                          : bookmark.book.image || "https://via.placeholder.com/150"
                      }
                      alt={bookmark.book.name}
                    />
                  </div>
                  <div className="product-details">
                    <h3>{bookmark.book.name}</h3>
                    <p>{bookmark.book.description}</p>
                    <div className="product-footer">
                      <span className="product-price">Rs. {bookmark.book.price}</span>
                      <div className="product-actions">
                        <button className="btn add-to-cart-btn" onClick={(e) => addToCart(bookmark.book, e)}>
                          Add to Cart
                        </button>
                        <button
                          className="bookmark-button bookmarked"
                          onClick={(e) => removeBookmark(bookmark.bookId, e)}
                          title="Remove from bookmarks"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
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
    </div>
  )
}

export default Bookmarks
