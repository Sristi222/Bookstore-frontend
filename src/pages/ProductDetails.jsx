import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [reviews, setReviews] = useState([]); // ✅ added
=======
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const token = localStorage.getItem("token");
  const API_URL = "https://localhost:7085/api"; // ✅ make sure this is correct
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4

  useEffect(() => {
    const fetchProduct = async () => {
      try {
<<<<<<< HEAD
        const res = await axios.get(`https://localhost:7085/api/Products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        alert("Product not found.");
        navigate("/");
=======
        const res = await axios.get(`${API_URL}/Products/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setProduct(res.data);
        console.log("Product loaded:", res.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        alert(err.response?.data?.message || "Error loading product.");
        navigate("/"); // go back if product not found
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
<<<<<<< HEAD
  }, [id, navigate]);
=======
  }, [id, navigate, token]);
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4

  useEffect(() => {
    const fetchReviews = async () => {
      try {
<<<<<<< HEAD
        const res = await axios.get(`https://localhost:7085/api/Reviews/${id}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
=======
        const res = await axios.get(`${API_URL}/Review/product/${id}`);
        setReviews(res.data);
        console.log("Reviews loaded:", res.data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        alert(err.response?.data?.message || "Error loading reviews.");
      } finally {
        setLoadingReviews(false);
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
      }
    };
    fetchReviews();
  }, [id]);

  if (loading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "15px" }}>⬅️ Back</button>

      <h2>{product.name}</h2>

<<<<<<< HEAD
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          style={{ maxWidth: "300px", display: "block", marginBottom: "15px" }}
        />
=======
      {product.image && product.image !== "string" && product.image !== "" ? (
        <img
          src={product.image.startsWith("/uploads") ? `https://localhost:7085${product.image}` : product.image}
          alt={product.name}
          style={{ maxWidth: "300px", display: "block", marginBottom: "15px" }}
        />
      ) : (
        <img
          src="https://via.placeholder.com/300x200?text=No+Image"
          alt="No Image"
          style={{ maxWidth: "300px", display: "block", marginBottom: "15px" }}
        />
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
      )}

      <p><strong>Author:</strong> {product.author || "N/A"}</p>
      <p><strong>Genre:</strong> {product.genre || "N/A"}</p>
      <p><strong>Publisher:</strong> {product.publisher || "N/A"}</p>
      <p><strong>ISBN:</strong> {product.isbn || "N/A"}</p>
      <p><strong>Language:</strong> {product.language || "N/A"}</p>
      <p><strong>Format:</strong> {product.format || "N/A"}</p>
<<<<<<< HEAD
      <p><strong>Price:</strong> ${product.price}</p>
=======
      <p><strong>Price:</strong> Rs. {product.finalPrice ?? product.price}</p>
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
      <p><strong>Stock:</strong> {product.stockQuantity} units</p>

      {product.discountPercent > 0 && (
        <>
          <p><strong>Discount:</strong> {product.discountPercent}%</p>
          <p>
            <strong>Discount Valid:</strong>{" "}
            {product.discountStartDate ? new Date(product.discountStartDate).toLocaleDateString() : "N/A"}{" "}
            -{" "}
            {product.discountEndDate ? new Date(product.discountEndDate).toLocaleDateString() : "N/A"}
          </p>
        </>
      )}

      <p><strong>Description:</strong></p>
      <p>{product.description || "No description available."}</p>

      <hr />
      <h3>Reviews</h3>
<<<<<<< HEAD
      {reviews.length > 0 ? (
        reviews.map((review, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
=======

      {loadingReviews ? (
        <p>Loading reviews...</p>
      ) : reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
            <p><strong>Rating:</strong> {review.rating} ⭐</p>
            <p><strong>Comment:</strong> {review.comment}</p>
            <p style={{ fontSize: "12px", color: "gray" }}>Reviewed by User ID: {review.userId}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet for this product.</p>
      )}
    </div>
  );
};

export default ProductDetails;
