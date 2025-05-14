"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import { ShoppingCart } from "lucide-react"
import "./Home.css"

const isLoggedIn = () => !!localStorage.getItem("token")
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userId")
}

const Home = () => {
  // State variables
  const [products, setProducts] = useState([])
  const [trendingProducts, setTrendingProducts] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [awardWinners, setAwardWinners] = useState([])
  const [comingSoonProducts, setComingSoonProducts] = useState([])
  const [dealProducts, setDealProducts] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryPages, setCategoryPages] = useState({
    all: { current: 1, total: 1 },
    trending: { current: 1, total: 1 },
    newReleases: { current: 1, total: 1 },
    bestsellers: { current: 1, total: 1 },
    awardWinners: { current: 1, total: 1 },
    comingSoon: { current: 1, total: 1 },
    deals: { current: 1, total: 1 },
  })
  const [priceRange, setPriceRange] = useState(10000)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("name") // Add this line - options: "name" or "author"
  const [sortOrder, setSortOrder] = useState("asc")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [banner, setBanner] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [activeCategory, setActiveCategory] = useState("all") // Default to "all"
  const [loading, setLoading] = useState({
    all: true,
    trending: true,
    bestsellers: true,
    newReleases: true,
    awardWinners: true,
    comingSoon: true,
    deals: true,
  })

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

  const productSectionRef = useRef(null)

  // Fetch all products for browsing
  const fetchProducts = async () => {
    try {
      setLoading((prev) => ({ ...prev, all: true }))
      const res = await axios.get(`${API_URL}/Products?page=${categoryPages.all.current}&limit=6`)
      const filtered = res.data.data
        .filter((p) => {
          if (searchType === "author") {
            return p.author?.toLowerCase().includes(searchTerm.toLowerCase()) || false
          } else {
            return p.name.toLowerCase().includes(searchTerm.toLowerCase())
          }
        })
        .filter((p) => Number.parseFloat(p.finalPrice || p.price) <= priceRange)
        .sort((a, b) => {
          const priceA = a.finalPrice || a.price
          const priceB = b.finalPrice || b.price
          return sortOrder === "asc" ? priceA - priceB : priceB - priceA
        })
      setProducts(filtered)
      setCategoryPages((prev) => ({
        ...prev,
        all: { ...prev.all, total: Math.ceil(res.data.total / res.data.limit) },
      }))
      setLoading((prev) => ({ ...prev, all: false }))
    } catch (err) {
      console.error("Error fetching products:", err.message)
      setLoading((prev) => ({ ...prev, all: false }))
    }
  }

  // Fetch trending products
  const fetchTrendingProducts = async () => {
    try {
      setLoading((prev) => ({ ...prev, trending: true }))
      const res = await axios.get(`${API_URL}/Products/trending?page=${categoryPages.trending.current}&limit=6`)
      if (Array.isArray(res.data)) {
        setTrendingProducts(res.data)
        setCategoryPages((prev) => ({
          ...prev,
          trending: { ...prev.trending, total: Math.ceil(res.data.length / 6) || 1 },
        }))
      } else if (res.data && Array.isArray(res.data.data)) {
        setTrendingProducts(res.data.data)
        setCategoryPages((prev) => ({
          ...prev,
          trending: { ...prev.trending, total: Math.ceil(res.data.total / res.data.limit) || 1 },
        }))
      } else {
        console.error("Unexpected response format for trending products:", res.data)
        setTrendingProducts([])
      }
      setLoading((prev) => ({ ...prev, trending: false }))
    } catch (err) {
      console.error("Error fetching trending products:", err.message)
      setTrendingProducts([])
      setLoading((prev) => ({ ...prev, trending: false }))
    }
  }

  // Fetch bestsellers
  const fetchBestSellers = async () => {
    try {
      setLoading((prev) => ({ ...prev, bestsellers: true }))
      const res = await axios.get(`${API_URL}/Products/bestsellers?page=${categoryPages.bestsellers.current}&limit=6`)
      if (Array.isArray(res.data)) {
        setBestSellers(res.data)
        setCategoryPages((prev) => ({
          ...prev,
          bestsellers: { ...prev.bestsellers, total: Math.ceil(res.data.length / 6) || 1 },
        }))
      } else if (res.data && Array.isArray(res.data.data)) {
        setBestSellers(res.data.data)
        setCategoryPages((prev) => ({
          ...prev,
          bestsellers: { ...prev.bestsellers, total: Math.ceil(res.data.total / res.data.limit) || 1 },
        }))
      } else {
        console.error("Unexpected response format for bestsellers:", res.data)
        setBestSellers([])
      }
      setLoading((prev) => ({ ...prev, bestsellers: false }))
    } catch (err) {
      console.error("Error fetching bestsellers:", err.message)
      setBestSellers([])
      setLoading((prev) => ({ ...prev, bestsellers: false }))
    }
  }

  // Fetch new releases
  const fetchNewReleases = async () => {
    try {
      setLoading((prev) => ({ ...prev, newReleases: true }))
      const res = await axios.get(`${API_URL}/Products/new-releases?page=${categoryPages.newReleases.current}&limit=6`)
      if (Array.isArray(res.data)) {
        setNewReleases(res.data)
        setCategoryPages((prev) => ({
          ...prev,
          newReleases: { ...prev.newReleases, total: Math.ceil(res.data.length / 6) || 1 },
        }))
      } else if (res.data && Array.isArray(res.data.data)) {
        setNewReleases(res.data.data)
        setCategoryPages((prev) => ({
          ...prev,
          newReleases: { ...prev.newReleases, total: Math.ceil(res.data.total / res.data.limit) || 1 },
        }))
      } else {
        console.error("Unexpected response format for new releases:", res.data)
        setNewReleases([])
      }
      setLoading((prev) => ({ ...prev, newReleases: false }))
    } catch (err) {
      console.error("Error fetching new releases:", err.message)
      setNewReleases([])
      setLoading((prev) => ({ ...prev, newReleases: false }))
    }
  }

  // Fetch award winners
  const fetchAwardWinners = async () => {
    try {
      setLoading((prev) => ({ ...prev, awardWinners: true }))
      const res = await axios.get(
        `${API_URL}/Products/award-winners?page=${categoryPages.awardWinners.current}&limit=6`,
      )
      if (Array.isArray(res.data)) {
        setAwardWinners(res.data)
        setCategoryPages((prev) => ({
          ...prev,
          awardWinners: { ...prev.awardWinners, total: Math.ceil(res.data.length / 6) || 1 },
        }))
      } else if (res.data && Array.isArray(res.data.data)) {
        setAwardWinners(res.data.data)
        setCategoryPages((prev) => ({
          ...prev,
          awardWinners: { ...prev.awardWinners, total: Math.ceil(res.data.total / res.data.limit) || 1 },
        }))
      } else {
        console.error("Unexpected response format for award winners:", res.data)
        setAwardWinners([])
      }
      setLoading((prev) => ({ ...prev, awardWinners: false }))
    } catch (err) {
      console.error("Error fetching award winners:", err.message)
      setAwardWinners([])
      setLoading((prev) => ({ ...prev, awardWinners: false }))
    }
  }

  // Fetch coming soon products
  const fetchComingSoonProducts = async () => {
    try {
      setLoading((prev) => ({ ...prev, comingSoon: true }))
      const res = await axios.get(`${API_URL}/Products/coming-soon?page=${categoryPages.comingSoon.current}&limit=6`)
      if (Array.isArray(res.data)) {
        setComingSoonProducts(res.data)
        setCategoryPages((prev) => ({
          ...prev,
          comingSoon: { ...prev.comingSoon, total: Math.ceil(res.data.length / 6) || 1 },
        }))
      } else if (res.data && Array.isArray(res.data.data)) {
        setComingSoonProducts(res.data.data)
        setCategoryPages((prev) => ({
          ...prev,
          comingSoon: { ...prev.comingSoon, total: Math.ceil(res.data.total / res.data.limit) || 1 },
        }))
      } else {
        console.error("Unexpected response format for coming soon products:", res.data)
        setComingSoonProducts([])
      }
      setLoading((prev) => ({ ...prev, comingSoon: false }))
    } catch (err) {
      console.error("Error fetching coming soon products:", err.message)
      setComingSoonProducts([])
      setLoading((prev) => ({ ...prev, comingSoon: false }))
    }
  }

  // Fetch deal products
  const fetchDealProducts = async () => {
    try {
      setLoading((prev) => ({ ...prev, deals: true }))
      const res = await axios.get(`${API_URL}/Products/deals?page=${categoryPages.deals.current}&limit=6`)
      if (Array.isArray(res.data)) {
        setDealProducts(res.data)
        setCategoryPages((prev) => ({
          ...prev,
          deals: { ...prev.deals, total: Math.ceil(res.data.length / 6) || 1 },
        }))
      } else if (res.data && Array.isArray(res.data.data)) {
        setDealProducts(res.data.data)
        setCategoryPages((prev) => ({
          ...prev,
          deals: { ...prev.deals, total: Math.ceil(res.data.total / res.data.limit) || 1 },
        }))
      } else {
        console.error("Unexpected response format for deal products:", res.data)
        setDealProducts([])
      }
      setLoading((prev) => ({ ...prev, deals: false }))
    } catch (err) {
      console.error("Error fetching deal products:", err.message)
      setDealProducts([])
      setLoading((prev) => ({ ...prev, deals: false }))
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
        const validBanners = Array.isArray(res.data)
          ? res.data.filter(
              (b) =>
                b.isActive &&
                (!b.startDateTime || new Date(b.startDateTime) <= now) &&
                (!b.endDateTime || new Date(b.endDateTime) >= now),
            )
          : [res.data]
        if (validBanners.length > 0) {
          setBanner(validBanners[0])
          setShowBanner(true)
        }
      }
    } catch (err) {
      console.error("Failed to fetch banner:", err)
    }
  }

  // Fetch category-specific products on initial load
  useEffect(() => {
    fetchProducts()
    fetchTrendingProducts()
    fetchBestSellers()
    fetchNewReleases()
    fetchAwardWinners()
    fetchComingSoonProducts()
    fetchDealProducts()
    fetchBookmarks()
    fetchBanner()
  }, [])

  // Fetch filtered products when filters change
  useEffect(() => {
    fetchProducts()
  }, [searchTerm, searchType, priceRange, sortOrder])

  // Fetch products when category page changes
  useEffect(() => {
    switch (activeCategory) {
      case "all":
        fetchProducts()
        break
      case "trending":
        fetchTrendingProducts()
        break
      case "newReleases":
        fetchNewReleases()
        break
      case "bestsellers":
        fetchBestSellers()
        break
      case "awardWinners":
        fetchAwardWinners()
        break
      case "comingSoon":
        fetchComingSoonProducts()
        break
      case "deals":
        fetchDealProducts()
        break
      default:
        break
    }
  }, [
    categoryPages.all.current,
    categoryPages.trending.current,
    categoryPages.newReleases.current,
    categoryPages.bestsellers.current,
    categoryPages.awardWinners.current,
    categoryPages.comingSoon.current,
    categoryPages.deals.current,
  ])

  // Add/remove body class when banner is shown/hidden
  useEffect(() => {
    if (showBanner) {
      document.body.classList.add("banner-open")
    } else {
      document.body.classList.remove("banner-open")
    }

    // Cleanup function
    return () => {
      document.body.classList.remove("banner-open")
    }
  }, [showBanner])

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

  const addToCart = async (product, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!isLoggedIn()) {
      showNotification("Please log in to add items to your cart.", "error")
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
      showNotification(`${product.name} added to cart!`, "success")
    } catch (err) {
      showNotification("Failed to add item to cart. Please try again.", "error")
      console.error("Error adding to cart:", err.response?.data || err.message)
    }
  }

  const toggleBookmark = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token) {
      showNotification("Login required to use bookmarks.", "error")
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
        showNotification("Bookmark removed.", "info")
      } else {
        await axios.post(
          `${API_URL}/Bookmarks?userId=${userId}`,
          { bookId: product.id },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
        )
        setBookmarks([...bookmarks, product.id])
        showNotification("Bookmark added.", "success")
      }
    } catch (err) {
      showNotification("Failed to update bookmark.", "error")
      console.error("Bookmark toggle failed:", err)
    }
  }

  const isBookmarkedFunc = (productId) => bookmarks.includes(productId)

  // Render category badges
  const renderCategoryBadges = (product) => {
    return (
      <div className="category-badges">
        {product.isTrending && <span className="category-badge trending">Trending</span>}
        {product.isBestseller && <span className="category-badge bestseller">Bestseller</span>}
        {product.hasAward && <span className="category-badge award">Award Winner</span>}
        {product.isNewRelease && <span className="category-badge new">New Release</span>}
        {product.isComingSoon && <span className="category-badge coming-soon">Coming Soon</span>}
        {product.isOnDeal && <span className="category-badge deal">Deal</span>}
      </div>
    )
  }

  // Render a product card
  const renderProductCard = (product) => (
    <Link to={`/products/${product.id}`} className="product-card" key={product.id}>
      <div className="product-image">
        {product.finalPrice && product.finalPrice !== product.price && (
          <div className="sale-badge">SALE {Math.round(100 - (product.finalPrice / product.price) * 100)}% OFF</div>
        )}
        {renderCategoryBadges(product)}
        <img
          src={
            product.image?.startsWith("/uploads")
              ? `${BACKEND_URL}${product.image}`
              : product.image || "https://via.placeholder.com/150"
          }
          alt={product.name}
        />
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
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
      <div className="product-details">
        <h3>{product.name}</h3>
        <p>
          {product.description?.substring(0, 60)}
          {product.description?.length > 60 ? "..." : ""}
        </p>
        <div className="product-footer">
          {product.finalPrice && product.finalPrice !== product.price ? (
            <span className="product-price">
              <span className="original-price">Rs. {Number(product.price).toFixed(2)}</span>
              <span className="sale-price">Rs. {Number(product.finalPrice).toFixed(2)}</span>
            </span>
          ) : (
            <span className="product-price">Rs. {Number(product.price).toFixed(2)}</span>
          )}
          <button className="btn add-to-cart-btn" onClick={(e) => addToCart(product, e)}>
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )

  // Get current products based on active category
  const getCurrentCategoryProducts = () => {
    switch (activeCategory) {
      case "all":
        return {
          products: products,
          isLoading: loading.all,
          title: "All Products",
          currentPage: categoryPages.all.current,
          totalPages: categoryPages.all.total,
          setPage: (page) => setCategoryPages((prev) => ({ ...prev, all: { ...prev.all, current: page } })),
        }
      case "trending":
        return {
          products: trendingProducts,
          isLoading: loading.trending,
          title: "Trending Products",
          currentPage: categoryPages.trending.current,
          totalPages: categoryPages.trending.total,
          setPage: (page) => setCategoryPages((prev) => ({ ...prev, trending: { ...prev.trending, current: page } })),
        }
      case "newReleases":
        return {
          products: newReleases,
          isLoading: loading.newReleases,
          title: "New Releases",
          currentPage: categoryPages.newReleases.current,
          totalPages: categoryPages.newReleases.total,
          setPage: (page) =>
            setCategoryPages((prev) => ({ ...prev, newReleases: { ...prev.newReleases, current: page } })),
        }
      case "bestsellers":
        return {
          products: bestSellers,
          isLoading: loading.bestsellers,
          title: "Bestsellers",
          currentPage: categoryPages.bestsellers.current,
          totalPages: categoryPages.bestsellers.total,
          setPage: (page) =>
            setCategoryPages((prev) => ({ ...prev, bestsellers: { ...prev.bestsellers, current: page } })),
        }
      case "awardWinners":
        return {
          products: awardWinners,
          isLoading: loading.awardWinners,
          title: "Award Winners",
          currentPage: categoryPages.awardWinners.current,
          totalPages: categoryPages.awardWinners.total,
          setPage: (page) =>
            setCategoryPages((prev) => ({ ...prev, awardWinners: { ...prev.awardWinners, current: page } })),
        }
      case "comingSoon":
        return {
          products: comingSoonProducts,
          isLoading: loading.comingSoon,
          title: "Coming Soon",
          currentPage: categoryPages.comingSoon.current,
          totalPages: categoryPages.comingSoon.total,
          setPage: (page) =>
            setCategoryPages((prev) => ({ ...prev, comingSoon: { ...prev.comingSoon, current: page } })),
        }
      case "deals":
        return {
          products: dealProducts,
          isLoading: loading.deals,
          title: "Deals",
          currentPage: categoryPages.deals.current,
          totalPages: categoryPages.deals.total,
          setPage: (page) => setCategoryPages((prev) => ({ ...prev, deals: { ...prev.deals, current: page } })),
        }
      default:
        return {
          products: products,
          isLoading: loading.all,
          title: "All Products",
          currentPage: categoryPages.all.current,
          totalPages: categoryPages.all.total,
          setPage: (page) => setCategoryPages((prev) => ({ ...prev, all: { ...prev.all, current: page } })),
        }
    }
  }

  const {
    products: displayProducts,
    isLoading: isProductsLoading,
    title: categoryTitle,
    currentPage: currentCategoryPage,
    totalPages: totalCategoryPages,
    setPage: setCurrentCategoryPage,
  } = getCurrentCategoryProducts()

  return (
    <div className="app-container">
      {/* Notification */}
      {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}

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
            <h2>{banner.title}</h2>
            {banner.subTitle && <h4 style={{ marginTop: "10px", color: "#555" }}>{banner.subTitle}</h4>}
            {banner.description && <p style={{ marginTop: "8px", color: "#666" }}>{banner.description}</p>}
          </div>
        </div>
      )}

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

      {/* Hero */}
      <section className="hero">
        <div className="hero-background" style={{ backgroundImage: `url('/hero-background.png')` }}></div>
        <div className="hero-content">
          <div className="hero-text">
            {/*<span className="offer-badge">20% OFF</span>*/}
            <h1>Discover Your Next Favorite Book</h1>
            <p>
              Welcome to the ultimate book lover's paradise! Join our community and explore our vast collection of
              stories that will transport you to new worlds.
            </p>
            <button
              className="btn shop-now-btn"
              onClick={() => productSectionRef.current.scrollIntoView({ behavior: "smooth" })}
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* All Products Section with Tabs */}
          <section className="all-products-section" ref={productSectionRef}>
            <h2 className="section-heading">All Products</h2>

            {/* Category Tabs */}
            <div className="category-tabs">
              <button
                className={`category-tab ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                All Products
              </button>
              <button
                className={`category-tab ${activeCategory === "trending" ? "active" : ""}`}
                onClick={() => setActiveCategory("trending")}
              >
                Trending
              </button>
              <button
                className={`category-tab ${activeCategory === "newReleases" ? "active" : ""}`}
                onClick={() => setActiveCategory("newReleases")}
              >
                New Releases
              </button>
              <button
                className={`category-tab ${activeCategory === "bestsellers" ? "active" : ""}`}
                onClick={() => setActiveCategory("bestsellers")}
              >
                Bestsellers
              </button>
              <button
                className={`category-tab ${activeCategory === "awardWinners" ? "active" : ""}`}
                onClick={() => setActiveCategory("awardWinners")}
              >
                Award Winners
              </button>
              <button
                className={`category-tab ${activeCategory === "comingSoon" ? "active" : ""}`}
                onClick={() => setActiveCategory("comingSoon")}
              >
                Coming Soon
              </button>
              <button
                className={`category-tab ${activeCategory === "deals" ? "active" : ""}`}
                onClick={() => setActiveCategory("deals")}
              >
                Deals
              </button>
            </div>

            {/* Mobile dropdown for categories */}
            <div className="category-dropdown">
              <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
                <option value="all">All Products</option>
                <option value="trending">Trending</option>
                <option value="newReleases">New Releases</option>
                <option value="bestsellers">Bestsellers</option>
                <option value="awardWinners">Award Winners</option>
                <option value="comingSoon">Coming Soon</option>
                <option value="deals">Deals</option>
              </select>
            </div>

            {/* Filter bar - show for all categories */}
            <div className="filter-bar">
              <div className="search-container">
                <div className="search-type-container">
                  <input
                    className="search-input"
                    placeholder={searchType === "name" ? "Search books..." : "Search by author..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="search-type-toggle">
                    <button
                      className={`search-type-btn ${searchType === "name" ? "active" : ""}`}
                      onClick={() => setSearchType("name")}
                    >
                      Book Title
                    </button>
                    <button
                      className={`search-type-btn ${searchType === "author" ? "active" : ""}`}
                      onClick={() => setSearchType("author")}
                    >
                      Author
                    </button>
                  </div>
                </div>
              </div>
              <div className="sort-container">
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                </select>
              </div>
              <div className="price-range-container">
                <label>Max Price: Rs. {priceRange}</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="price-range-slider"
                />
              </div>
            </div>

            {isProductsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading {categoryTitle.toLowerCase()}...</p>
              </div>
            ) : (
              <div className="product-grid category-grid">
                {displayProducts.length > 0 ? (
                  displayProducts.map(renderProductCard)
                ) : (
                  <div className="no-products-message">
                    <p>No books found. Try adjusting your search criteria or selecting a different category.</p>
                    <button
                      className="reset-filters-btn"
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
            )}

            {/* Pagination for all categories */}
            <div className="pagination">
              <button
                disabled={currentCategoryPage === 1}
                onClick={() => setCurrentCategoryPage(currentCategoryPage - 1)}
              >
                Previous
              </button>
              <span>
                Page {currentCategoryPage} of {totalCategoryPages || 1}
              </span>
              <button
                disabled={currentCategoryPage === totalCategoryPages || totalCategoryPages === 0}
                onClick={() => setCurrentCategoryPage(currentCategoryPage + 1)}
              >
                Next
              </button>
            </div>
          </section>
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

export default Home
