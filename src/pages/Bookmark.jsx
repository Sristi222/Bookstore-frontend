"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const isLoggedIn = () => !!localStorage.getItem("token");
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
};

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const API_URL = "https://localhost:7085/api";
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!isLoggedIn()) {
      alert("Please log in to view your bookmarks.");
      navigate("/login");
      return;
    }
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get(`${API_URL}/Bookmarks?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookmarks(res.data);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
  };

  const removeBookmark = async (bookId, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await axios.delete(`${API_URL}/Bookmarks/${bookId}?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookmarks((prev) => prev.filter((b) => b.bookId !== bookId));
      alert("Bookmark removed.");
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const addToCart = async (product) => {
    try {
      let cartUserId = userId;
      if (!cartUserId || cartUserId.startsWith("guest-")) {
        cartUserId = "guest-" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("userId", cartUserId);
      }

      await axios.post(
        `${API_URL}/Cart?userId=${cartUserId}`,
        { productId: product.id, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(`${product.name} added to cart!`);
      navigate("/cart");
    } catch (error) {
      alert("Failed to add item to cart. Please try again.");
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <div className="container">
          <h1 className="my-4">Your Bookmarked Books</h1>

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
                <div className="product-card" key={bookmark.bookId}>
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
                        <button
                          className="btn add-to-cart-btn"
                          onClick={() => addToCart(bookmark.book)}
                        >
                          Add to Basket
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
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bookmarks;
