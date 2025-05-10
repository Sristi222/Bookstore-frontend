checkout.jsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./checkout.css"

const Checkout = () => {
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    address: "",
  })

  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")
  const totalAmount = 1600 // Replace with real total from cart if needed

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const orderPayload = {
      userId: userId,
      total: totalAmount,
    }

    try {
      const res = await axios.post("https://localhost:7085/api/order", orderPayload, {
        headers: {
          Authorization: Bearer ${token},
        },
      })

      // Merge personal details into saved order
      const savedOrder = {
        ...res.data,
        ...details,
      }

      localStorage.setItem("lastOrder", JSON.stringify(savedOrder))
      navigate("/order-confirmation")
    } catch (err) {
      console.error("Order failed:", err)
      alert("Failed to place order")
    }
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <label>Name:</label>
        <input name="name" value={details.name} onChange={handleChange} required />

        <label>Phone:</label>
        <input name="phone" value={details.phone} onChange={handleChange} required />

        <label>Address:</label>
        <textarea name="address" value={details.address} onChange={handleChange} required />

        <button type="submit" className="place-order-btn">Place Order</button>
      </form>
    </div>
  )
}

export default Checkout