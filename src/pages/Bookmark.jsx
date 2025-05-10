"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./Bookmark.css"

const isLoggedIn = () => !!localStorage.getItem("token")
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userId")
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const navigate = useNavigate()

  const API_URL = "https://localhost:7085/api"
  const BACKEND_URL = "https://localhost:7085"
  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")

  useEffect(() => {
    if (!isLoggedIn()) {
      alert("Please log in to view your bookmarks.")
      navigate("/login")
      return
    }
    fetchBookmarks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchBookmarks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/Bookmarks?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setBookmarks(res.data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load bookmarks:", error)
      setLoading(false)
    }
  }

  const removeBookmark = async (bookId, bookName, e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await axios.delete(`${API_URL}/Bookmarks/${bookId}?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setBookmarks((prev) => prev.filter((b) => b.bookId !== bookId))
      setNotification({
        show: true,
        message: `"${bookName}" removed from bookmarks`,
        type: "remove",
      })
    } catch (error) {
      console.error("Error removing bookmark:", error)
      setNotification({
        show: true,
        message: "Failed to remove bookmark",
        type: "error",
      })
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

      setNotification({
        show: true,
        message: `"${product.name}" added to cart!`,
        type: "success",
      })
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to add item to cart",
        type: "error",
      })
      console.error("Error adding to cart:", error)
    }
  }

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    // Filter by category if not "all"
    const categoryMatch =
      filterCategory === "all" || (bookmark.book.category && bookmark.book.category.toLowerCase() === filterCategory)

    // Filter by search term
    const searchMatch =
      !searchTerm ||
      bookmark.book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bookmark.book.description && bookmark.book.description.toLowerCase().includes(searchTerm.toLowerCase()))

    return categoryMatch && searchMatch
  })

  // Get unique categories for filter
  const categories = [
    "all",
    ...new Set(
      bookmarks.filter((bookmark) => bookmark.book.category).map((bookmark) => bookmark.book.category.toLowerCase()),
    ),
  ]

  return (
    <div className="bookmarks-container">
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

      <header className="bookmarks-header">
        <div className="header-content">
          <h1 className="gradient-text">Your Bookmarked Books</h1>
          <p className="bookmarks-subtitle">Manage your favorite books collection</p>
        </div>
      </header>

      <main className="bookmarks-main">
        <div className="bookmarks-controls">
          <div className="search-container">
            <div className="search-icon">🔍</div>
            <input
              className="search-input"
              placeholder="Search your bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filter">
            <span className="filter-label">Filter by:</span>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${filterCategory === category ? "active" : ""}`}
                  onClick={() => setFilterCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your bookmarks...</p>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="empty-bookmarks">
            {searchTerm || filterCategory !== "all" ? (
              <>
                <div className="empty-icon">🔍</div>
                <h2>No matching bookmarks found</h2>
                <p>Try adjusting your search or filter criteria</p>
                <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterCategory("all")
                  }}
                >
                  Reset Filters
                </button>
              </>
            ) : (
              <>
                <div className="empty-icon">📚</div>
                <h2>Your bookmark collection is empty</h2>
                <p>Start adding books to your bookmarks to see them here</p>
                <button className="browse-books-btn" onClick={() => navigate("/")}>
                  Browse Books
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="bookmarks-count">
              <span>
                {filteredBookmarks.length} book{filteredBookmarks.length !== 1 ? "s" : ""} bookmarked
              </span>
            </div>

            <div className="bookmarks-grid">
              {filteredBookmarks.map((bookmark) => (
                <div className="bookmark-card" key={bookmark.bookId}>
                  <div className="bookmark-image-container">
                    <img
                      src={
                        bookmark.book.image?.startsWith("/uploads")
                          ? `${BACKEND_URL}${bookmark.book.image}`
                          : bookmark.book.image || "https://via.placeholder.com/150"
                      }
                      alt={bookmark.book.name}
                      className="bookmark-image"
                    />
                    <div className="bookmark-overlay">
                      <button className="view-details-btn" onClick={() => navigate(`/books/${bookmark.bookId}`)}>
                        View Details
                      </button>
                    </div>
                    <button
                      className="remove-bookmark-btn"
                      onClick={(e) => removeBookmark(bookmark.bookId, bookmark.book.name, e)}
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

                  <div className="bookmark-details">
                    <h3 className="bookmark-title">{bookmark.book.name}</h3>

                    {bookmark.book.category && <span className="bookmark-category">{bookmark.book.category}</span>}

                    <div className="bookmark-price">
                      {bookmark.book.finalPrice !== bookmark.book.price ? (
                        <>
                          <span className="original-price">Rs. {Number(bookmark.book.price).toFixed(2)}</span>
                          <span className="sale-price">Rs. {Number(bookmark.book.finalPrice).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="regular-price">Rs. {Number(bookmark.book.price).toFixed(2)}</span>
                      )}
                    </div>

                    <p className="bookmark-description">
                      {bookmark.book.description
                        ? bookmark.book.description.length > 100
                          ? bookmark.book.description.substring(0, 100) + "..."
                          : bookmark.book.description
                        : "No description available"}
                    </p>

                    <button className="add-to-cart-btn" onClick={(e) => addToCart(bookmark.book, e)}>
                      Add to Basket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <div className="back-to-home">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default Bookmarks
