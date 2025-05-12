import { useEffect, useState } from "react";
import axios from "axios";

const MyReviews = () => {
  const [allowedProducts, setAllowedProducts] = useState([]);
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
        console.error("Error fetching orders/products:", err);
      }
    };

    fetchCompletedOrders();
  }, []);

  return (
    <div>
      <h1>My Purchased Products</h1>
      {allowedProducts.length === 0 ? (
        <p>You have no completed purchases yet.</p>
      ) : (
        <ul>
          {allowedProducts.map(product => (
            <li key={product.id} style={{ marginBottom: "20px" }}>
              <img src={product.image} alt={product.name} style={{ width: "80px", marginRight: "10px" }} />
              <strong>{product.name}</strong>
              <button onClick={() => window.location.href = `/write-review/${product.id}`}>
                Write Review
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyReviews;
