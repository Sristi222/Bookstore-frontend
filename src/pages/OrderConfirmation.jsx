import { useEffect, useState } from "react"
import "./OrderConfirmation.css"

const OrderConfirmation = () => {
  const [details, setDetails] = useState({})
  const [orderId, setOrderId] = useState("")
  const [claimCode, setClaimCode] = useState("")

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("lastOrder"))
    setDetails(saved || {})
    setOrderId("ORD" + Date.now())
    setClaimCode(Math.random().toString(36).substring(2, 10).toUpperCase())
  }, [])

  return (
    <div className="confirmation-container">
      <h1>Order Confirmed!</h1>
      <p>Thank you for your purchase. Your order has been received.</p>

      <div className="order-details">
        <p><strong>Order Number:</strong> {orderId}</p>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        <p><strong>Name:</strong> {details.name}</p>
        <p><strong>Phone:</strong> {details.phone}</p>
        <p><strong>Address:</strong> {details.address}</p>
        <p><strong>Claim Code:</strong> <span className="code">{claimCode}</span></p>
      </div>

      <p className="note">
        Note: Visit a physical store with the claim code to collect your books. Orders can be cancelled from your account before processing.
      </p>

      <div className="order-actions">
        <a href="/">← Continue Shopping</a>
        <a href="/orders">View Order History →</a>
      </div>
    </div>
  )
}

export default OrderConfirmation