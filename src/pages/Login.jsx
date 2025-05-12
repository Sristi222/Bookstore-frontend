"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { ShoppingCart, Home, BookOpen, HelpCircle, Phone } from "lucide-react"
import "./Login.css"

const isLoggedIn = () => !!localStorage.getItem("token")
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userId")
}

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const loginUser = async () => {
    setLoading(true)
    try {
      const res = await axios.post("https://localhost:7085/api/Auth/login", {
        email,
        password,
      })

      const token = res.data.token
      const userId = res.data.userId

      localStorage.setItem("token", token)
      localStorage.setItem("userId", userId)

      const decoded = jwtDecode(token)
      const userRoles = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

      const isAdmin = (Array.isArray(userRoles) && userRoles.includes("Admin")) || userRoles === "Admin"
      const isStaff = (Array.isArray(userRoles) && userRoles.includes("Staff")) || userRoles === "Staff"

      localStorage.setItem("isAdmin", isAdmin ? "true" : "false")
      localStorage.setItem("isStaff", isStaff ? "true" : "false")

      if (isAdmin) {
        navigate("/admin")
      } else if (isStaff) {
        navigate("/staff")
      } else {
        navigate("/")
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || "Login failed. Please check credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") loginUser()
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

      <div className="login-container">
        <div className="login-content">
          <div className="login-form-container">
            <h1 className="login-title">WELCOME MEMBER</h1>
            <p className="login-subtitle">Welcome back! Please enter your details.</p>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="form-input"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="/forgot-password" className="forgot-password">
                Forgot password
              </a>
            </div>

            <button className="login-button" onClick={loginUser} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="signup-prompt">
              Don't have an account?{" "}
              <a href="/register" className="signup-link">
                Sign up
              </a>
            </p>
          </div>
          <div className="login-image-container">
            <img
              src="https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80"
              alt="Stack of books"
              className="login-image"
            />
          </div>
        </div>
      </div>

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
                  <a href="/products?category=new-releases">
                     New Arrivals
                  </a>
                </li>
                <li>
                  <a href="/products?category=bestsellers">
                     Best Sellers
                  </a>
                </li>
                <li>
                  <a href="/products?category=deals">
                     Sale
                  </a>
                </li>
                <li>
                  <a href="/products?category=award-winners">
                    Award Winners
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Help</h4>
              <ul>
                <li>
                  <a href="/contact">
                     Contact Us
                  </a>
                </li>
                <li>
                  <a href="/faq">
                     FAQs
                  </a>
                </li>
                <li>
                  <a href="/shipping">
                   Shipping
                  </a>
                </li>
                <li>
                  <a href="/returns">
                     Returns
                  </a>
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

export default Login
