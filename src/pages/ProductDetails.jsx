"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { ShoppingCart, ArrowLeft, Star, Bookmark, BookOpen } from "lucide-react"
import "./ProductDetails.css"
import "./Home.css"

const isLoggedIn = () => !!localStorage.getItem("token")
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userId")
}

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")
  const API_URL = "https://localhost:7085/api"

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/Products/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        setProduct(res.data)
        console.log("Product loaded:", res.data)
      } catch (err) {
        console.error("Failed to fetch product:", err)
        showNotification("Error loading product.", "error")
        navigate("/") // go back if product not found
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate, token])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/Review/product/${id}`)
        setReviews(res.data)
        console.log("Reviews loaded:", res.data)
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
        showNotification("Error loading reviews.", "error")
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [id])

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!token || !userId) return
      try {
        const res = await axios.get(`${API_URL}/Bookmarks?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const bookmarks = res.data
        setIsBookmarked(bookmarks.some((b) => b.bookId === Number.parseInt(id)))
      } catch (err) {
        console.error("Failed to check bookmark status:", err)
      }
    }
    checkBookmarkStatus()
  }, [id, token, userId])

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type,
    })
  }

  const addToCart = async () => {
    if (!isLoggedIn()) {
      showNotification("Please log in to add items to your cart.", "error")
      setTimeout(() => navigate("/login"), 2000)
      return
    }

    try {
      let cartUserId = userId
      if (!cartUserId || cartUserId.startsWith("guest-")) {
        cartUserId = "guest-" + Math.random().toString(36).substring(2, 15)
        localStorage.setItem("userId", cartUserId)
      }

      await axios.post(
        `${API_URL}/Cart?userId=${cartUserId}`,
        { productId: product.id, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      showNotification(`${product.name} added to cart!`, "success")
    } catch (err) {
      showNotification("Failed to add item to cart. Please try again.", "error")
      console.error("Error adding to cart:", err)
    }
  }

  const toggleBookmark = async () => {
    if (!token) {
      showNotification("Login required to use bookmarks.", "error")
      return
    }

    try {
      if (isBookmarked) {
        await axios.delete(`${API_URL}/Bookmarks/${product.id}?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setIsBookmarked(false)
        showNotification("Bookmark removed.", "info")
      } else {
        await axios.post(
          `${API_URL}/Bookmarks?userId=${userId}`,
          { bookId: product.id },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
        )
        setIsBookmarked(true)
        showNotification("Bookmark added.", "success")
      }
    } catch (err) {
      showNotification("Failed to update bookmark.", "error")
      console.error("Bookmark toggle failed:", err)
    }
  }

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((total, review) => total + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (loading) return <div className="bookshop-loading-container">Loading product details...</div>
  if (!product) return <div className="bookshop-error-container">Product not found.</div>

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

      <main className="bookshop-product-detail-main">
        <div className="container">
          <button onClick={() => navigate(-1)} className="bookshop-back-button">
            <ArrowLeft size={18} /> Back
          </button>

          <div className="bookshop-product-detail-container">
            <div className="bookshop-product-detail-left">
              <div className="bookshop-product-image-container">
                {product.image && product.image !== "string" && product.image !== "" ? (
                  <img
                    src={
                      product.image.startsWith("/uploads") ? `https://localhost:7085${product.image}` : product.image
                    }
                    alt={product.name}
                    className="bookshop-product-detail-image"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/400x600?text=No+Image"
                    alt="No Image"
                    className="bookshop-product-detail-image"
                  />
                )}
              </div>
            </div>

            <div className="bookshop-product-detail-right">
              <div className="bookshop-product-category">
                <span>
                  <BookOpen size={18} className="bookshop-category-icon" /> Category: {product.genre || "Novel"}
                </span>
              </div>

              <h1 className="bookshop-product-title">{product.name}</h1>

              <div className="bookshop-product-meta">
                <p>
                  <strong>Author:</strong> {product.author || "N/A"}
                </p>
                <p>
                  <strong>Publisher:</strong> {product.publisher || "N/A"}
                </p>
              </div>

              <div className="bookshop-product-rating">
                <div className="bookshop-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= Math.round(calculateAverageRating()) ? "star filled" : "star"}
                    />
                  ))}
                </div>
                <span className="bookshop-rating-text">
                  {calculateAverageRating()} ({reviews.length} reviews)
                </span>
              </div>

              <div className="bookshop-product-price">
                {product.finalPrice !== product.price && product.finalPrice ? (
                  <>
                    <span className="bookshop-original-price">Rs. {product.price.toFixed(2)}</span>
                    <span className="bookshop-final-price">Rs. {product.finalPrice.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="bookshop-final-price">Rs. {product.price.toFixed(2)}</span>
                )}

                {product.discountPercent > 0 && (
                  <span className="bookshop-discount-badge">{product.discountPercent}% OFF</span>
                )}
              </div>

              {product.discountPercent > 0 && (
                <div className="bookshop-discount-info">
                  <p>
                    Offer ends:{" "}
                    {product.discountEndDate ? new Date(product.discountEndDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              )}

              <div className="bookshop-product-stock">
                <span className={product.stockQuantity > 0 ? "bookshop-in-stock" : "bookshop-out-of-stock"}>
                  {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : "Out of Stock"}
                </span>
              </div>

              <div className="bookshop-product-actions">
                <div className="bookshop-quantity-selector">
                  <button
                    className="bookshop-quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="bookshop-quantity">{quantity}</span>
                  <button
                    className="bookshop-quantity-btn"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>

                <button className="bookshop-add-to-cart-btn" onClick={addToCart} disabled={product.stockQuantity <= 0}>
                  <ShoppingCart size={18} /> Add to Cart
                </button>

                <button className={`bookmark-btn ${isBookmarked ? "bookmarked" : ""}`} onClick={toggleBookmark}>
                  <Bookmark size={18} className={isBookmarked ? "fill-bookmark" : ""} />
                </button>
              </div>

              <div className="bookshop-product-details">
                <div className="bookshop-detail-row">
                  <span className="bookshop-detail-label">ISBN:</span>
                  <span className="bookshop-detail-value">{product.isbn || "N/A"}</span>
                </div>
                <div className="bookshop-detail-row">
                  <span className="bookshop-detail-label">Language:</span>
                  <span className="bookshop-detail-value">{product.language || "N/A"}</span>
                </div>
                <div className="bookshop-detail-row">
                  <span className="bookshop-detail-label">Format:</span>
                  <span className="bookshop-detail-value">{product.format || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bookshop-product-tabs">
            <div className="bookshop-tab-header">
              <button className="bookshop-tab-btn active">About This Book</button>
              <button className="bookshop-tab-btn">Reviews ({reviews.length})</button>
            </div>

            <div className="bookshop-tab-content">
              <div className="bookshop-tab-pane active">
                <h3>Description</h3>
                <p>{product.description || "No description available."}</p>
              </div>
            </div>
          </div>

          <div className="bookshop-reviews-section">
            <h2>Customer Reviews</h2>

            {loadingReviews ? (
              <div className="bookshop-loading-reviews">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              <div className="bookshop-reviews-list">
                {reviews.map((review) => (
                  <div className="bookshop-review-card" key={review.id}>
                    <div className="bookshop-review-header">
                      <div className="bookshop-review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={16} className={star <= review.rating ? "star filled" : "star"} />
                        ))}
                      </div>
                      <div className="bookshop-review-user">
                        <span>User {review.userId.substring(0, 5)}...</span>
                      </div>
                    </div>
                    <div className="bookshop-review-content">{review.comment}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bookshop-no-reviews">
                <p>No reviews yet for this product.</p>
              </div>
            )}
          </div>
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

export default ProductDetails
