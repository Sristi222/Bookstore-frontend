"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, ShoppingBag, CheckCircle, AlertTriangle } from "lucide-react"
import "./OrderBill.css"

const OrderBill = () => {
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [orderResponse, setOrderResponse] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0) // Store the discount amount
  const [subtotal, setSubtotal] = useState(0)
  const [discountReasons, setDiscountReasons] = useState([])

  const navigate = useNavigate()

  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const API_URL = "https://localhost:7085/api"

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]")
    if (storedCart.length === 0) {
      setError("No items in cart")
      setTimeout(() => {
        navigate("/cart")
      }, 2000)
    } else {
      setCart(storedCart)

      // Calculate total price before discounts
      const subtotal = storedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

      // Fetch user's order history to check for loyalty discount
      const fetchOrderHistory = async () => {
        try {
          const res = await axios.get(`${API_URL}/Orders?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          // Count completed orders
          const completedOrders = res.data.filter((order) => order.status === "Completed")
          const completedOrdersCount = completedOrders.length

          // Calculate discounts
          let discount = 0
          const discountReasons = []

          // Volume discount: 5% for ordering 5+ books
          const totalQuantity = storedCart.reduce((sum, item) => sum + item.quantity, 0)
          if (totalQuantity >= 5) {
            discount += subtotal * 0.05 // 5% discount
            discountReasons.push("5% volume discount (5+ books)")
          }

          // Loyalty discount: 10% after 10 completed orders
          if (completedOrdersCount >= 10) {
            discount += subtotal * 0.1 // 10% discount
            discountReasons.push("10% loyalty discount (10+ completed orders)")
          }

          setDiscountAmount(discount)
          setDiscountReasons(discountReasons)

          // Update total with discount
          setTotal(subtotal - discount)
          setSubtotal(subtotal)
          setLoading(false)
        } catch (err) {
          console.error("Error fetching order history:", err)
          // If we can't fetch order history, just apply the volume discount
          const totalQuantity = storedCart.reduce((sum, item) => sum + item.quantity, 0)
          let discount = 0
          const discountReasons = []

          if (totalQuantity >= 5) {
            discount = subtotal * 0.05 // 5% discount
            discountReasons.push("5% volume discount (5+ books)")
          }

          setDiscountAmount(discount)
          setDiscountReasons(discountReasons)
          setTotal(subtotal - discount)
          setSubtotal(subtotal)
          setLoading(false)
        }
      }

      fetchOrderHistory()
    }
  }, [navigate, API_URL, userId, token])

  const openConfirmModal = () => {
    setShowConfirmModal(true)
    document.body.style.overflow = "hidden"
  }

  const closeConfirmModal = () => {
    setShowConfirmModal(false)
    document.body.style.overflow = "auto"
  }

  const confirmOrder = async () => {
    setIsProcessing(true)
    try {
      const res = await axios.post(`${API_URL}/Orders?userId=${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      localStorage.removeItem("cartItems") // clear cart
      setOrderResponse(res.data)
      closeConfirmModal()
    } catch (err) {
      setError(err.response?.data || err.message)
      closeConfirmModal()
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = () => {
    const date = new Date()
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your bill...</p>
      </div>
    )
  }

  return (
    <div className="order-bill-container">
      {error && (
        <div className="error-message">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {orderResponse ? (
        <div className="order-confirmation">
          <div className="confirmation-icon">
            <CheckCircle size={50} color="#4CAF50" />
          </div>

          <h1>Order Confirmed!</h1>
          <p className="confirmation-message">Thank you for your purchase. Your order has been received.</p>

          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">Order Number:</span>
              <span className="detail-value">ORD{orderResponse.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formatDate()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total:</span>
              <span className="detail-value">Rs. {orderResponse.totalAmount.toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Claim Code:</span>
              <span className="detail-value highlight">{orderResponse.claimCode}</span>
            </div>
          </div>

          <div className="claim-instructions">
            <h3>Claim Instructions</h3>
            <p>
              Please visit any of our physical stores with your claim code to collect your books. The staff will process
              your order.
            </p>
            <div className="note">
              <strong>Note:</strong> Your order can be cancelled from your order history page until it's processed by
              our staff.
            </div>
          </div>

          <div className="action-buttons">
            <button className="secondary-btn" onClick={() => navigate("/")}>
              <ArrowLeft size={16} /> Continue Shopping
            </button>
            <button className="primary-btn" onClick={() => navigate("/orders")}>
              View Order History <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="order-summary">
          <h1>Order Bill Summary</h1>

          <div className="bill-table-container">
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td className="book-name">{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>Rs. {item.product.price.toFixed(2)}</td>
                    <td>Rs. {(item.product.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-right">
                    Subtotal
                  </td>
                  <td>Rs. {subtotal.toFixed(2)}</td>
                </tr>
                {discountAmount > 0 && (
                  <>
                    <tr className="discount-row">
                      <td colSpan="3" className="text-right">
                        Discount
                      </td>
                      <td className="discount-amount">- Rs. {discountAmount.toFixed(2)}</td>
                    </tr>
                    {discountReasons.map((reason, idx) => (
                      <tr key={idx} className="discount-reason-row">
                        <td colSpan="4" className="discount-reason">
                          <small>
                            <i>{reason}</i>
                          </small>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
                <tr className="final-total-row">
                  <td colSpan="3" className="text-right">
                    <strong>Final Total</strong>
                  </td>
                  <td>
                    <strong>Rs. {total.toFixed(2)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="action-buttons">
            <button className="secondary-btn" onClick={() => navigate("/cart")}>
              <ArrowLeft size={16} /> Back to Cart
            </button>
            <button className="primary-btn" onClick={openConfirmModal}>
              Confirm & Place Order
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h2>Confirm Your Order</h2>
            <p>Are you sure you want to place this order for Rs. {total.toFixed(2)}?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeConfirmModal} disabled={isProcessing}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmOrder} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <div className="button-spinner"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderBill
