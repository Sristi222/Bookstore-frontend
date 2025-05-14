"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, Star, Edit, ArrowLeft } from "lucide-react"
import "./MyReviews.css"

const isLoggedIn = () => !!localStorage.getItem("token")
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userId")
}

const MyReviews = () => {
  const [allowedProducts, setAllowedProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")
  const API_URL = "https://localhost:7085/api"

  useEffect(() => {
    if (!isLoggedIn()) {
      alert("Please log in to view your reviews.")
      navigate("/login")
      return
    }

    const fetchCompletedOrders = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API_URL}/Orders?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const completedOrders = res.data.filter((order) => order.status === "Completed")
        const productIds = [
          ...new Set(completedOrders.flatMap((order) => order.orderItems.map((item) => item.productId))),
        ]

        const productDetails = await Promise.all(
          productIds.map((id) => axios.get(`${API_URL}/Products/${id}`).then((res) => res.data)),
        )

        setAllowedProducts(productDetails)
      } catch (err) {
        console.error("❌ Error fetching orders/products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompletedOrders()
  }, [userId, token, navigate])

  const openReviewModal = (product) => {
    setSelectedProduct(product)
    setRating(5)
    setComment("")
    setShowModal(true)
    document.body.style.overflow = "hidden" // Prevent scrolling when modal is open
  }

  const closeModal = () => {
    setShowModal(false)
    document.body.style.overflow = "auto" // Re-enable scrolling
  }

  const submitReview = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment.")
      return
    }

    try {
      await axios.post(
        `${API_URL}/Review?userId=${userId}&productId=${selectedProduct.id}`,
        { rating: Number.parseInt(rating), comment },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      alert("✅ Review submitted successfully!")
      closeModal()
    } catch (err) {
      console.error("❌ Failed to submit review:", err.response || err)
      alert(err.response?.data?.message || "Error submitting review.")
    }
  }

  const renderStars = (count) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= count) {
        stars.push(<Star key={i} className="star-icon filled" onClick={() => setRating(i)} />)
      } else {
        stars.push(<Star key={i} className="star-icon" onClick={() => setRating(i)} />)
      }
    }
    return stars
  }

  const handleProductClick = (productId) => {
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

            <a href="/my-reviews" className="nav-link active">
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

      <main className="reviews-main-content">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="reviews-heading">My Purchased Products</h1>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your purchased products...</p>
            </div>
          ) : allowedProducts.length === 0 ? (
            <div className="empty-reviews">
              <p>You have no completed purchases yet.</p>
              <button className="btn shop-now-btn" onClick={() => navigate("/")}>
                Browse Books
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {allowedProducts.map((product) => (
                <div key={product.id} className="product-review-card">
                  <div className="product-review-image" onClick={() => handleProductClick(product.id)}>
                    <img
                      src={
                        product.image?.startsWith("/uploads")
                          ? `https://localhost:7085${product.image}`
                          : product.image || "https://via.placeholder.com/150"
                      }
                      alt={product.name}
                    />
                  </div>
                  <div className="product-review-details">
                    <h3 onClick={() => handleProductClick(product.id)}>{product.name}</h3>
                    <p className="product-review-author">By {product.author || "Unknown Author"}</p>
                    <button className="write-review-btn" onClick={() => openReviewModal(product)}>
                      <Edit size={16} /> Write Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {showModal && selectedProduct && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <h2>Write Review for {selectedProduct.name}</h2>

            <div className="review-product-info">
              <img
                src={
                  selectedProduct.image?.startsWith("/uploads")
                    ? `https://localhost:7085${selectedProduct.image}`
                    : selectedProduct.image || "https://via.placeholder.com/150"
                }
                alt={selectedProduct.name}
              />
              <div>
                <h3>{selectedProduct.name}</h3>
                <p>By {selectedProduct.author || "Unknown Author"}</p>
              </div>
            </div>

            <div className="rating-container">
              <label>Your Rating:</label>
              <div className="stars-container">{renderStars(rating)}</div>
            </div>

            <div className="comment-container">
              <label htmlFor="review-comment">Your Review:</label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                placeholder="Share your thoughts about this book..."
              />
            </div>

            <div className="modal-actions">
              <button className="submit-review-btn" onClick={submitReview}>
                Submit Review
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default MyReviews
