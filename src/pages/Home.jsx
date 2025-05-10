"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";

const isLoggedIn = () => !!localStorage.getItem("token");
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState(1000);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [banner, setBanner] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  const navigate = useNavigate();
  const BACKEND_URL = "https://localhost:7085";
  const API_URL = `${BACKEND_URL}/api`;
  const token = localStorage.getItem("token");

  const getUserId = () => {
    let id = localStorage.getItem("userId");
    if (!id || id.startsWith("guest-")) {
      id = "guest-" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("userId", id);
    }
    return id;
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/Products?page=${currentPage}&limit=6`);
      const filtered = res.data.data
        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((p) => Number.parseFloat(p.finalPrice) <= priceRange)
        .sort((a, b) => (sortOrder === "asc" ? a.finalPrice - b.finalPrice : b.finalPrice - a.finalPrice));
      setProducts(filtered);
      setTotalPages(Math.ceil(res.data.total / res.data.limit));
    } catch (err) {
      console.error("Error fetching products:", err.message);
    }
  };

  const fetchBookmarks = async () => {
    const userId = getUserId();
    if (!token || userId.startsWith("guest-")) return;
    try {
      const res = await axios.get(`${API_URL}/Bookmarks?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarks(res.data.map((b) => b.bookId));
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    }
  };

  const fetchBanner = async () => {
    try {
      const res = await axios.get(`${API_URL}/Banners`);
      if (res.data) {
        const now = new Date();
        const validBanners = res.data.filter(
          (b) =>
            b.isActive &&
            (!b.startDateTime || new Date(b.startDateTime) <= now) &&
            (!b.endDateTime || new Date(b.endDateTime) >= now)
        );
        if (validBanners.length > 0) {
          setBanner(validBanners[0]);
          setShowBanner(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch banner:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBookmarks();
    fetchBanner();
  }, [currentPage, searchTerm, priceRange, sortOrder]);

  const addToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn()) {
      alert("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    try {
      const userId = getUserId();
      await axios.post(
        `${API_URL}/Cart?userId=${userId}`,
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      alert(`${product.name} added to cart!`);
      navigate("/cart");
    } catch (err) {
      alert("Failed to add item to cart. Please try again.");
      console.error("Error adding to cart:", err.response?.data || err.message);
    }
  };

  const toggleBookmark = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      alert("Login required to use bookmarks.");
      return;
    }
    const userId = getUserId();
    const isBookmarked = bookmarks.includes(product.id);
    try {
      if (isBookmarked) {
        await axios.delete(`${API_URL}/Bookmarks/${product.id}?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarks(bookmarks.filter((id) => id !== product.id));
        alert("Bookmark removed.");
      } else {
        await axios.post(
          `${API_URL}/Bookmarks?userId=${userId}`,
          { bookId: product.id },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        setBookmarks([...bookmarks, product.id]);
        alert("Bookmark added.");
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const isBookmarkedFunc = (productId) => bookmarks.includes(productId);

  return (
    <div className="app-container">
      {/* Banner */}
      {showBanner && banner && (
        <div className="banner-popup">
          <div className="banner-popup-content">
            <button className="banner-close" onClick={() => setShowBanner(false)}>×</button>
            <a href={banner.link || "#"}>
              <img
                src={banner.imageUrl?.startsWith("/uploads") ? `${BACKEND_URL}${banner.imageUrl}` : banner.imageUrl}
                alt={banner.title}
                className="banner-popup-image"
              />
            </a>
            <h2>{banner.title}</h2>
            <p>{banner.description}</p>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo">🛍 JG Enterprise</a>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
          <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <a href="/" className="nav-link">Home</a>
            <a href="/about" className="nav-link">About</a>
            <a href="/ContactUs" className="nav-link">Contact</a>
            {isLoggedIn() && <a href="/bookmarks" className="nav-link">Bookmarks</a>}
            {isLoggedIn() && <a href="/orders" className="nav-link">My Orders</a>}
            <div className="auth-buttons">
              {isLoggedIn() ? (
                <button className="btn logout-btn" onClick={() => { logout(); window.location.reload(); }}>Logout</button>
              ) : (
                <>
                  <a href="/login" className="btn login-btn">Login</a>
                  <a href="/register" className="btn register-btn">Register</a>
                </>
              )}
              <a href="/cart" className="cart-icon">🛒</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="offer-badge">Special Offer</span>
            <h1>20% OFF ONLY TODAY AND GET SPECIAL GIFT!</h1>
            <p>Today only, enjoy a stylish 20% off and receive an exclusive gift with your purchase!</p>
            <button className="btn shop-now-btn">Shop Now</button>
          </div>
          <div className="hero-image">
            <img src="https://i.ibb.co/4NRtXNz/fashion-hero.png" alt="Fashion promotion" />
          </div>
        </div>
      </section>

      {/* Products */}
      <main className="main-content">
        <div className="container">
          <div className="filter-bar d-flex flex-wrap justify-content-between align-items-center mb-3">
            <input
              className="form-control mb-2 me-2"
              placeholder="🔍 Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "200px" }}
            />
            <select
              className="form-select mb-2 me-2"
              style={{ width: "180px" }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Sort by Price: Low to High</option>
              <option value="desc">Sort by Price: High to Low</option>
            </select>
            <div className="mb-2">
              <label className="me-2 fw-bold">Max ₹{priceRange}</label>
              <input
                type="range"
                min="0"
                max="1000000"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              />
            </div>
          </div>

          <section className="product-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <Link to={`/products/${product.id}`} className="product-card" key={product.id}>
                  <div className="product-image" style={{ position: "relative" }}>
                    {product.finalPrice !== product.price && (
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          background: "red",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        SALE {Math.round(100 - (product.finalPrice / product.price) * 100)}% OFF
                      </div>
                    )}
                    <img
                      src={product.image?.startsWith("/uploads")
                        ? `${BACKEND_URL}${product.image}`
                        : product.image || "https://via.placeholder.com/150"}
                      alt={product.name}
                    />
                  </div>
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-footer">
                      {product.finalPrice !== product.price ? (
                        <span className="product-price">
                          <span style={{ textDecoration: "line-through", color: "gray", marginRight: "8px" }}>
                            Rs. {Number(product.price).toFixed(2)}
                          </span>
                          <span style={{ color: "red", fontWeight: "bold" }}>
                            Rs. {Number(product.finalPrice).toFixed(2)}
                          </span>
                        </span>
                      ) : (
                        <span className="product-price">Rs. {Number(product.price).toFixed(2)}</span>
                      )}
                      <div className="product-actions">
                        <button className="btn add-to-cart-btn" onClick={(e) => addToCart(product, e)}>
                          Add to Basket
                        </button>
                        <button
                          className={`bookmark-button ${isBookmarkedFunc(product.id) ? "bookmarked" : ""}`}
                          onClick={(e) => toggleBookmark(product, e)}
                          title={isBookmarkedFunc(product.id) ? "Remove from bookmarks" : "Add to bookmarks"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                            viewBox="0 0 24 24" fill={isBookmarkedFunc(product.id) ? "currentColor" : "none"}
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="loading-message"><p>No products found.</p></div>
            )}
          </section>

          <div className="pagination mt-4 d-flex justify-content-center">
            <button className="btn btn-secondary me-2" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
            <span className="align-self-center">Page {currentPage} of {totalPages}</span>
            <button className="btn btn-secondary ms-2" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-columns">
            <div className="footer-column">
              <h3>JG Enterprise</h3>
              <p>Your one-stop destination for trendy fashion and accessories.</p>
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
            <div className="footer-column">
              <h4>Newsletter</h4>
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
  );
};

export default Home;
