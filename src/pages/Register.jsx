"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ShoppingCart } from 'lucide-react'
import "./Home.css"
import "./Register.css"

const Register = () => {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const isLoggedIn = () => !!localStorage.getItem("token")
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
  }

  const registerUser = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    try {
      const res = await axios.post("https://localhost:7085/api/Auth/register", {
        fullName,
        email,
        password,
        phoneNumber,
      })

      alert("Registered successfully. Please login.")
      navigate("/login")
    } catch (err) {
      console.error("Registration error:", err)

      if (err.response && err.response.data) {
        // If backend returns identity validation errors (array)
        if (Array.isArray(err.response.data)) {
          const messages = err.response.data.map((e) => e.description || JSON.stringify(e)).join("\n")
          alert(messages)
        } else if (err.response.data.message) {
          alert(err.response.data.message)
        } else {
          alert("Registration failed. Please check input.")
        }
      } else {
        alert("Registration failed. Please check input.")
      }
    }
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

      <main className="register-main">
        <div className="register-container">
          <div className="register-form-container">
            <div className="register-form">
              <h1 className="register-title">BECOME A MEMBER</h1>
              <p className="register-subtitle">Create an account to enjoy personalized book recommendations and easy checkout.</p>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              <button className="sign-in-button" onClick={registerUser}>
                Create Account
              </button>

              <p className="register-footer">
                Already have an account?{" "}
                <a href="/login" className="sign-up-link">
                  Sign in
                </a>
              </p>
            </div>
          </div>

          <div className="register-image">
            <img
              src="https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80"
              alt="Stack of books"
            />
            <div className="image-overlay">
              <div className="overlay-content">
                <h2>Join Our Book Community</h2>
                <p>Discover new stories, share your thoughts, and connect with fellow book lovers.</p>
              </div>
            </div>
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

export default Register