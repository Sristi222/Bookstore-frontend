import { useEffect, useState } from "react";
import axios from "axios";

const MyReviews = () => {
  const [allowedProducts, setAllowedProducts] = useState([]);
<<<<<<< HEAD
=======
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const API_URL = "https://localhost:7085/api";

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/Orders?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const completedOrders = res.data.filter(order => order.status === "Completed");
        const productIds = [...new Set(completedOrders.flatMap(order =>
          order.orderItems.map(item => item.productId)
        ))];

        const productDetails = await Promise.all(
          productIds.map(id =>
            axios.get(`${API_URL}/Products/${id}`).then(res => res.data)
          )
        );

        setAllowedProducts(productDetails);
      } catch (err) {
<<<<<<< HEAD
        console.error("Error fetching orders/products:", err);
=======
        console.error("❌ Error fetching orders/products:", err);
        alert("Failed to load your purchased products.");
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
      }
    };

    fetchCompletedOrders();
  }, []);

<<<<<<< HEAD
  return (
    <div>
      <h1>My Purchased Products</h1>
=======
  const openReviewModal = (product) => {
    setSelectedProduct(product);
    setRating(5);
    setComment("");
    setShowModal(true);
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/Review?userId=${userId}&productId=${selectedProduct.id}`,
        { rating: parseInt(rating), comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Review submitted successfully!");
      setShowModal(false);
    } catch (err) {
      console.error("❌ Failed to submit review:", err.response || err);
      alert(err.response?.data?.message || "Error submitting review.");
    }
  };

  return (
    <div>
      <h1>My Purchased Products</h1>

>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
      {allowedProducts.length === 0 ? (
        <p>You have no completed purchases yet.</p>
      ) : (
        <ul>
          {allowedProducts.map(product => (
            <li key={product.id} style={{ marginBottom: "20px" }}>
              <img src={product.image} alt={product.name} style={{ width: "80px", marginRight: "10px" }} />
              <strong>{product.name}</strong>
<<<<<<< HEAD
              <button onClick={() => window.location.href = `/write-review/${product.id}`}>
=======
              <button onClick={() => openReviewModal(product)} style={{ marginLeft: "10px" }}>
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
                Write Review
              </button>
            </li>
          ))}
        </ul>
      )}
<<<<<<< HEAD
=======

      {showModal && selectedProduct && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
        }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "400px", boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}>
            <h3>Write Review for {selectedProduct.name}</h3>
            <label>Rating (1-5):</label><br />
            <input
              type="number"
              value={rating}
              min="1"
              max="5"
              onChange={e => setRating(e.target.value)}
              style={{ width: "60px" }}
            /><br /><br />
            <label>Comment:</label><br />
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows="4"
              cols="40"
              placeholder="Write your review here..."
            /><br /><br />
            <button onClick={submitReview}>Submit</button>
            <button onClick={() => setShowModal(false)} style={{ marginLeft: "10px" }}>Cancel</button>
          </div>
        </div>
      )}
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
    </div>
  );
};

export default MyReviews;
