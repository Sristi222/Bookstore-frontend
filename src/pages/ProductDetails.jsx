"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "./ProductDetails.css"

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [relatedBooks, setRelatedBooks] = useState([])

  const BACKEND_URL = "https://localhost:7085"
  const API_URL = `${BACKEND_URL}/api`
  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/Products/${id}`)
        setProduct(res.data)

        // Fetch related books based on genre or author
        if (res.data.genre || res.data.author) {
          const relatedRes = await axios.get(`${API_URL}/Products?limit=4`)
          setRelatedBooks(relatedRes.data.data.filter((book) => book.id !== id).slice(0, 4))
        }
      } catch (err) {
        console.error("Failed to fetch product:", err)
        setNotification({
          show: true,
          message: "Product not found",
          type: "error",
        })
        setTimeout(() => navigate("/"), 3000)
      } finally {
        setLoading(false)
      }
    }

    const checkBookmarkStatus = async () => {
      if (!token || !userId) return

      try {
        const res = await axios.get(`${API_URL}/Bookmarks?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const bookmarkIds = res.data.map((b) => b.bookId)
        setIsBookmarked(bookmarkIds.includes(Number.parseInt(id)))
      } catch (err) {
        console.error("Failed to check bookmark status:", err)
      }
    }

    fetchProduct()
    checkBookmarkStatus()
  }, [id, navigate, token, userId])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/Reviews/${id}`)
        setReviews(res.data)
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
      }
    }
    fetchReviews()
  }, [id])

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const toggleBookmark = async () => {
    if (!token) {
      setNotification({
        show: true,
        message: "Please log in to bookmark books",
        type: "error",
      })
      return
    }

    try {
      if (isBookmarked) {
        await axios.delete(`${API_URL}/Bookmarks/${id}?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setIsBookmarked(false)
        setNotification({
          show: true,
          message: "Bookmark removed",
          type: "remove",
        })
      } else {
        await axios.post(
          `${API_URL}/Bookmarks?userId=${userId}`,
          { bookId: id },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
        )
        setIsBookmarked(true)
        setNotification({
          show: true,
          message: "Bookmark added",
          type: "success",
        })
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err)
      setNotification({
        show: true,
        message: "Failed to update bookmark",
        type: "error",
      })
    }
  }

  const addToCart = async () => {
    if (!token) {
      setNotification({
        show: true,
        message: "Please log in to add items to your cart",
        type: "error",
      })
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
        { productId: id, quantity: quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setNotification({
        show: true,
        message: `${product.name} added to cart!`,
        type: "success",
      })
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to add item to cart",
        type: "error",
      })
      console.error("Error adding to cart:", err)
    }
  }

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((total, review) => total + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="star full">
            ★
          </span>,
        )
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="star half">
            ★
          </span>,
        )
      } else {
        stars.push(
          <span key={i} className="star empty">
            ☆
          </span>,
        )
      }
    }

    return stars
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Product not found</h2>
        <p>The book you're looking for doesn't exist or has been removed.</p>
        <button className="back-to-shop-btn" onClick={() => navigate("/")}>
          Back to Shop
        </button>
      </div>
    )
  }

  const averageRating = calculateAverageRating()
  const discountPercentage =
    product.discountPercent ||
    (product.price !== product.finalPrice ? Math.round(100 - (product.finalPrice / product.price) * 100) : 0)

  return (
    <div className="product-details-container">
      {/* Toast Notification */}
      {notification.show && (
        <div className={`toast-notification ${notification.type}`}>
          <div className="toast-icon">
            {notification.type === "success" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            )}
            {notification.type === "remove" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            )}
            {notification.type === "error" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
          </div>
          <div className="toast-message">{notification.message}</div>
        </div>
      )}

      <div className="back-navigation">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="product-main">
        <div className="product-image-container">
          <div className="product-image-wrapper">
            {discountPercentage > 0 && <div className="sale-badge">SALE {discountPercentage}% OFF</div>}
            <img
              src={
                product.image?.startsWith("/uploads")
                  ? `${BACKEND_URL}${product.image}`
                  : product.image || "https://via.placeholder.com/400x600"
              }
              alt={product.name}
              className="product-image"
            />
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>

          {product.author && (
            <div className="product-author">
              by <span>{product.author}</span>
            </div>
          )}

          <div className="product-rating">
            <div className="stars">{renderStars(averageRating)}</div>
            <span className="rating-value">{averageRating}</span>
            <span className="reviews-count">({reviews.length} reviews)</span>
          </div>

          <div className="product-price-container">
            {product.finalPrice !== product.price ? (
              <>
                <span className="original-price">Rs. {Number(product.price).toFixed(2)}</span>
                <span className="sale-price">Rs. {Number(product.finalPrice).toFixed(2)}</span>
              </>
            ) : (
              <span className="regular-price">Rs. {Number(product.price).toFixed(2)}</span>
            )}
          </div>

          {product.discountPercent > 0 && (
            <div className="discount-info">
              <span className="discount-label">Limited Time Offer:</span>
              <span className="discount-dates">
                {product.discountStartDate ? new Date(product.discountStartDate).toLocaleDateString() : "Now"} -
                {product.discountEndDate ? new Date(product.discountEndDate).toLocaleDateString() : "Until stock lasts"}
              </span>
            </div>
          )}

          <div className="product-availability">
            <span className={`availability-status ${product.stockQuantity > 0 ? "in-stock" : "out-of-stock"}`}>
              {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
            </span>
            {product.stockQuantity > 0 && (
              <span className="stock-quantity">
                {product.stockQuantity < 10
                  ? `Only ${product.stockQuantity} left!`
                  : `${product.stockQuantity} available`}
              </span>
            )}
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button
                className="quantity-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(product.stockQuantity, Math.max(1, Number.parseInt(e.target.value) || 1)))
                }
                className="quantity-input"
              />
              <button
                className="quantity-btn"
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                disabled={quantity >= product.stockQuantity}
              >
                +
              </button>
            </div>

            <button className="add-to-cart-btn" onClick={addToCart} disabled={product.stockQuantity <= 0}>
              Add to Basket
            </button>

            <button
              className={`bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
              onClick={toggleBookmark}
              title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>
          </div>

          <div className="product-meta">
            {product.genre && (
              <div className="meta-item">
                <span className="meta-label">Genre:</span>
                <span className="meta-value">{product.genre}</span>
              </div>
            )}
            {product.publisher && (
              <div className="meta-item">
                <span className="meta-label">Publisher:</span>
                <span className="meta-value">{product.publisher}</span>
              </div>
            )}
            {product.isbn && (
              <div className="meta-item">
                <span className="meta-label">ISBN:</span>
                <span className="meta-value">{product.isbn}</span>
              </div>
            )}
            {product.language && (
              <div className="meta-item">
                <span className="meta-label">Language:</span>
                <span className="meta-value">{product.language}</span>
              </div>
            )}
            {product.format && (
              <div className="meta-item">
                <span className="meta-label">Format:</span>
                <span className="meta-value">{product.format}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({reviews.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === "description" && (
            <div className="tab-pane">
              <h3>About this Book</h3>
              <div className="description-content">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p className="no-content">No description available for this book.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="tab-pane">
              <div className="reviews-summary">
                <div className="average-rating">
                  <div className="rating-number">{averageRating}</div>
                  <div className="rating-stars">{renderStars(averageRating)}</div>
                  <div className="rating-count">Based on {reviews.length} reviews</div>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="reviewer-name">
                            {review.userName || `User ${review.userId.substring(0, 5)}`}
                          </div>
                        </div>
                        <div className="review-rating">
                          {renderStars(review.rating)}
                          <span className="rating-value">{review.rating}</span>
                        </div>
                      </div>
                      <div className="review-content">{review.comment || "No comment provided."}</div>
                      <div className="review-date">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Unknown date"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-reviews">
                  <p>No reviews yet for this book.</p>
                  <p>Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="tab-pane">
              <h3>Book Details</h3>
              <div className="details-grid">
                {product.author && (
                  <div className="detail-item">
                    <div className="detail-label">Author</div>
                    <div className="detail-value">{product.author}</div>
                  </div>
                )}
                {product.publisher && (
                  <div className="detail-item">
                    <div className="detail-label">Publisher</div>
                    <div className="detail-value">{product.publisher}</div>
                  </div>
                )}
                {product.isbn && (
                  <div className="detail-item">
                    <div className="detail-label">ISBN</div>
                    <div className="detail-value">{product.isbn}</div>
                  </div>
                )}
                {product.language && (
                  <div className="detail-item">
                    <div className="detail-label">Language</div>
                    <div className="detail-value">{product.language}</div>
                  </div>
                )}
                {product.format && (
                  <div className="detail-item">
                    <div className="detail-label">Format</div>
                    <div className="detail-value">{product.format}</div>
                  </div>
                )}
                {product.pages && (
                  <div className="detail-item">
                    <div className="detail-label">Pages</div>
                    <div className="detail-value">{product.pages}</div>
                  </div>
                )}
                {product.dimensions && (
                  <div className="detail-item">
                    <div className="detail-label">Dimensions</div>
                    <div className="detail-value">{product.dimensions}</div>
                  </div>
                )}
                {product.weight && (
                  <div className="detail-item">
                    <div className="detail-label">Weight</div>
                    <div className="detail-value">{product.weight}</div>
                  </div>
                )}
                {product.publicationDate && (
                  <div className="detail-item">
                    <div className="detail-label">Publication Date</div>
                    <div className="detail-value">{new Date(product.publicationDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <div className="related-books">
          <h2 className="section-title">You May Also Like</h2>
          <div className="related-books-grid">
            {relatedBooks.map((book) => (
              <div key={book.id} className="related-book-card" onClick={() => navigate(`/books/${book.id}`)}>
                <div className="related-book-image">
                  <img
                    src={
                      book.image?.startsWith("/uploads")
                        ? `${BACKEND_URL}${book.image}`
                        : book.image || "https://via.placeholder.com/150"
                    }
                    alt={book.name}
                  />
                </div>
                <div className="related-book-info">
                  <h3 className="related-book-title">{book.name}</h3>
                  {book.author && <p className="related-book-author">{book.author}</p>}
                  <div className="related-book-price">
                    {book.finalPrice !== book.price ? (
                      <>
                        <span className="original-price">Rs. {Number(book.price).toFixed(2)}</span>
                        <span className="sale-price">Rs. {Number(book.finalPrice).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="regular-price">Rs. {Number(book.price).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetails
