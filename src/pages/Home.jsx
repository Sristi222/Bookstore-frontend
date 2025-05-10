"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import "./Home.css"

const isLoggedIn = () => !!localStorage.getItem("token")
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userId")
}

const Home = () => {
  const [products, setProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [awardWinners, setAwardWinners] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [priceRange, setPriceRange] = useState(1000)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [banner, setBanner] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  const navigate = useNavigate()
  const BACKEND_URL = "https://localhost:7085"
  const API_URL = `${BACKEND_URL}/api`
  const token = localStorage.getItem("token")

  const getUserId = () => {
    let id = localStorage.getItem("userId")
    if (!id || id.startsWith("guest-")) {
      id = "guest-" + Math.random().toString(36).substring(2, 15)
      localStorage.setItem("userId", id)
    }
    return id
  }

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/Products?page=${currentPage}&limit=6`)
      const filtered = res.data.data
        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((p) => Number.parseFloat(p.finalPrice) <= priceRange)
        .sort((a, b) => (sortOrder === "asc" ? a.finalPrice - b.finalPrice : b.finalPrice - a.finalPrice))

      setProducts(filtered)

      // Create separate sections for display
      if (res.data.data.length > 0) {
        // For demo purposes, we'll just split the products into different sections
        // In a real app, you'd fetch these separately or have specific APIs
        setNewArrivals(res.data.data.slice(0, 4))
        setBestSellers(res.data.data.slice(0, 4))
        setAwardWinners(res.data.data.slice(0, 4))
      }

      setTotalPages(Math.ceil(res.data.total / res.data.limit))
    } catch (err) {
      console.error("Error fetching products:", err.message)
    }
  }

  const fetchBookmarks = async () => {
    const userId = getUserId()
    if (!token || userId.startsWith("guest-")) return
    try {
      const res = await axios.get(`${API_URL}/Bookmarks?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBookmarks(res.data.map((b) => b.bookId))
    } catch (err) {
      console.error("Failed to load bookmarks:", err)
    }
  }

  const fetchBanner = async () => {
    try {
      const res = await axios.get(`${API_URL}/Banners`)
      if (res.data) {
        const now = new Date()
        const validBanners = res.data.filter(
          (b) =>
            b.isActive &&
            (!b.startDateTime || new Date(b.startDateTime) <= now) &&
            (!b.endDateTime || new Date(b.endDateTime) >= now),
        )
        if (validBanners.length > 0) {
          setBanner(validBanners[0])
          setShowBanner(true)
        }
      }
    } catch (err) {
      console.error("Failed to fetch banner:", err)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchBookmarks()
    fetchBanner()
  }, [currentPage, searchTerm, priceRange, sortOrder])

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const addToCart = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn()) {
      setNotification({
        show: true,
        message: "Please log in to add items to your cart",
        type: "error",
      })
      setTimeout(() => navigate("/login"), 2000)
      return
    }
    try {
      const userId = getUserId()
      await axios.post(
        `${API_URL}/Cart?userId=${userId}`,
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
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
      console.error("Error adding to cart:", err.response?.data || err.message)
    }
  }

  const toggleBookmark = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token) {
      setNotification({
        show: true,
        message: "Login required to use bookmarks",
        type: "error",
      })
      return
    }
    const userId = getUserId()
    const isBookmarked = bookmarks.includes(product.id)
    try {
      if (isBookmarked) {
        await axios.delete(`${API_URL}/Bookmarks/${product.id}?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setBookmarks(bookmarks.filter((id) => id !== product.id))
        setNotification({
          show: true,
          message: "Bookmark removed",
          type: "remove",
        })
      } else {
        await axios.post(
          `${API_URL}/Bookmarks?userId=${userId}`,
          { bookId: product.id },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
        )
        setBookmarks([...bookmarks, product.id])
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

  const isBookmarkedFunc = (productId) => bookmarks.includes(productId)

  const renderBookCard = (product) => (
    <div className="book-card" key={product.id}>
      <div className="book-image">
        {product.finalPrice !== product.price && (
          <div className="sale-badge">SALE {Math.round(100 - (product.finalPrice / product.price) * 100)}% OFF</div>
        )}
        <img
          src={
            product.image?.startsWith("/uploads")
              ? `${BACKEND_URL}${product.image}`
              : product.image || "https://via.placeholder.com/150"
          }
          alt={product.name}
        />
        <div className="book-overlay">
        <Link to={`/products/${product.id}`} className="product-card" key={product.id}>
            View Details
          </Link>
        </div>
        <button
          className={`bookmark-button ${isBookmarkedFunc(product.id) ? "bookmarked" : ""}`}
          onClick={(e) => toggleBookmark(product, e)}
          title={isBookmarkedFunc(product.id) ? "Remove from bookmarks" : "Add to bookmarks"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isBookmarkedFunc(product.id) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="bookmark-icon"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
      <div className="book-details">
        <h3 className="book-title gradient-text">{product.name}</h3>
        <p className="book-category">Fiction book</p>
        <div className="book-price">
          {product.finalPrice !== product.price ? (
            <>
              <span className="original-price">Rs. {Number(product.price).toFixed(2)}</span>
              <span className="sale-price">Rs. {Number(product.finalPrice).toFixed(2)}</span>
            </>
          ) : (
            <span className="regular-price">Rs. {Number(product.price).toFixed(2)}</span>
          )}
        </div>
        <button className="add-to-basket-btn" onClick={(e) => addToCart(product, e)}>
          Add to Basket
        </button>
      </div>
    </div>
  )

  return (
    <div className="app-container">
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

      {/* Banner */}
      {showBanner && banner && (
        <div className="banner-popup">
          <div className="banner-popup-content">
            <button className="banner-close" onClick={() => setShowBanner(false)}>
              ×
            </button>
            <a href={banner.link || "#"}>
              <img
                src={banner.imageUrl?.startsWith("/uploads") ? `${BACKEND_URL}${banner.imageUrl}` : banner.imageUrl}
                alt={banner.title}
                className="banner-popup-image"
              />
            </a>
            <h2 className="gradient-text">{banner.title}</h2>
            <p>{banner.description}</p>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo">
            <img src="/bookverselogo.png" alt="Book Shop Logo" className="logo-image" />
          </a>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
          <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <a href="/" className="nav-link">
              Home
            </a>
            <a href="/about" className="nav-link">
              About
            </a>
            <a href="/ContactUs" className="nav-link">
              Contact
            </a>
            {isLoggedIn() && (
              <a href="/bookmarks" className="nav-link">
                Bookmarks
              </a>
            )}
            {isLoggedIn() && (
              <a href="/orders" className="nav-link">
                My Orders
              </a>
            )}
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
              <a href="/cart" className="cart-icon">
                🛒
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="gradient-text">25% off total e-books purchased</h1>
            <p>
              Welcome to the ultimate book lover's paradise! Join our community and contribute to the ever-evolving
              library of stories, where every book has a chance to inspire someone new.
            </p>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="book-section">
        <div className="container">
          <div className="section-title-container">
            <h2 className="section-title gradient-text">New Arrivals</h2>
          </div>
          <div className="book-grid">{newArrivals.map(renderBookCard)}</div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="book-section">
        <div className="container">
          <div className="section-title-container">
            <h2 className="section-title gradient-text">Best Sellers</h2>
          </div>
          <div className="book-grid">{bestSellers.map(renderBookCard)}</div>
        </div>
      </section>

      {/* Award Winners Section */}
      <section className="book-section">
        <div className="container">
          <div className="section-title-container">
            <h2 className="section-title gradient-text">Award Winners</h2>
          </div>
          <div className="book-grid">{awardWinners.map(renderBookCard)}</div>
        </div>
      </section>

      {/* Browse All Products */}
      <section className="browse-section">
        <div className="container">
          <div className="browse-header">
            <div className="section-title-container">
              <h2 className="section-title gradient-text">Browse All Books</h2>
            </div>

            <div className="filter-container">
              <div className="search-container">
                <div className="search-icon">🔍</div>
                <input
                  className="search-input"
                  placeholder="Search for books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-controls">
                <div className="sort-container">
                  <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="asc">Sort by Price: Low to High</option>
                    <option value="desc">Sort by Price: High to Low</option>
                    <option value="name_asc">Sort by Name: A to Z</option>
                    <option value="name_desc">Sort by Name: Z to A</option>
                  </select>
                </div>

                <div className="price-filter-container">
                  <div className="price-label">Max ₹{priceRange}</div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="price-slider"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="book-grid">
            {products.length > 0 ? (
              products.map(renderBookCard)
            ) : (
              <div className="no-products">
                <div className="no-products-icon">📚</div>
                <p>No books found matching your criteria.</p>
                <button
                  className="btn reset-btn"
                  onClick={() => {
                    setSearchTerm("")
                    setPriceRange(10000)
                    setSortOrder("asc")
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          <div className="pagination">
            <button
              className="pagination-btn prev"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>
            <div className="pagination-info">
              Page <span className="current-page gradient-text">{currentPage}</span> of{" "}
              <span className="total-pages gradient-text">{totalPages}</span>
            </div>
            <button
              className="pagination-btn next"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-columns">
            <div className="footer-column">
              <h3 className="gradient-text">JG Enterprise</h3>
              <p>Your one-stop destination for books and literary treasures.</p>
            </div>
            <div className="footer-column">
              <h4 className="gradient-text">Shop</h4>
              <ul>
                <li>
                  <a href="#">New Arrivals</a>
                </li>
                <li>
                  <a href="#">Best Sellers</a>
                </li>
                <li>
                  <a href="#">Sale</a>
                </li>
                <li>
                  <a href="#">Collections</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="gradient-text">Help</h4>
              <ul>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">FAQs</a>
                </li>
                <li>
                  <a href="#">Shipping</a>
                </li>
                <li>
                  <a href="#">Returns</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="gradient-text">Newsletter</h4>
              <p>Subscribe to get special offers and updates.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email" />
                <button className="btn subscribe-btn">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} JG Enterprise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
