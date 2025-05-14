"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import "./StaffLayout.css"

const StaffOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [claimToProcess, setClaimToProcess] = useState(null)
  const [processingOrder, setProcessingOrder] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [notification, setNotification] = useState(null)

  const token = localStorage.getItem("token")
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7085/api"

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/Orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(res.data)
    } catch (err) {
      console.error("Error fetching orders:", err)
      alert("Failed to load orders.")
      // Fallback to sample data if API fails
      setOrders([
        {
          id: 7245,
          userId: "user123",
          status: "Pending",
          totalAmount: 1200.0,
          claimCode: "CLAIM7245",
          createdAt: "2023-05-15T14:30:00",
          orderItems: [
            { productId: 1, productName: "The Great Gatsby", quantity: 2, price: 450 },
            { productId: 3, productName: "To Kill a Mockingbird", quantity: 1, price: 300 },
          ],
        },
        {
          id: 7244,
          userId: "user456",
          status: "Completed",
          totalAmount: 850.0,
          claimCode: "CLAIM7244",
          createdAt: "2023-05-14T10:15:00",
          orderItems: [{ productId: 5, productName: "Pride and Prejudice", quantity: 1, price: 850 }],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.claimCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderItems &&
        order.orderItems.some(
          (item) => item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase()),
        ))

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Sort orders by date (latest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const openConfirmModal = (claimCode) => {
    setClaimToProcess(claimCode)
    setConfirmMessage(`Mark order with claim code ${claimCode} as completed?`)
    setIsConfirmModalOpen(true)
  }

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setClaimToProcess(null)
  }

  const processOrder = async (claimCode) => {
    // Open the custom confirmation modal instead of using window.confirm
    openConfirmModal(claimCode)
  }

  const confirmProcessOrder = async () => {
    if (!claimToProcess) return

    setProcessingOrder(true)
    try {
      const res = await axios.post(`${API_URL}/Orders/process-claim?claimCode=${claimToProcess}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update the local state to reflect the change
      setOrders(orders.map((order) => (order.claimCode === claimToProcess ? { ...order, status: "Completed" } : order)))

      // If the order being processed is currently displayed in the modal, update it
      if (selectedOrder && selectedOrder.claimCode === claimToProcess) {
        setSelectedOrder({ ...selectedOrder, status: "Completed" })
      }

      // Show success message
      setIsConfirmModalOpen(false)

      // Show success notification
      showNotification("Success", res.data.message || "Order fulfilled successfully!")
    } catch (err) {
      showNotification("Error", err.response?.data || "Failed to fulfill order.", "error")
      console.error("Error processing claim:", err)
    } finally {
      setProcessingOrder(false)
      setClaimToProcess(null)
    }
  }

  const showNotification = (title, message, type = "success") => {
    setNotification({ title, message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000) // Hide after 5 seconds
  }

  const openOrderModal = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <h1 className="page-title">Manage Orders</h1>

      {notification && (
        <div className={`notification ${notification.type}`}>
          <strong>{notification.title}:</strong> {notification.message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Orders</h2>
          <p className="card-description">View and manage all customer orders</p>
        </div>
        <div className="card-content">
          <div className="filters">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search by order ID, user, book title, or claim code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <div className="filter-dropdown">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="loading-icon"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              <p>Loading orders...</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Claim Code</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    sortedOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.userId}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                        </td>
                        <td>Rs. {order.totalAmount.toFixed(2)}</td>
                        <td>{order.claimCode}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            {order.status !== "Completed" && order.status !== "Cancelled" ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => openConfirmModal(order.claimCode)}
                              >
                                Fulfill
                              </button>
                            ) : (
                              <span className="completed-status">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                {order.status}
                              </span>
                            )}
                            <button className="btn btn-outline btn-sm" onClick={() => openOrderModal(order)}>
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="order-info-grid">
                <div className="order-info-item">
                  <span className="info-label">Order ID:</span>
                  <span className="info-value">#{selectedOrder.id}</span>
                </div>
                <div className="order-info-item">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{selectedOrder.userId}</span>
                </div>
                <div className="order-info-item">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span>
                </div>
                <div className="order-info-item">
                  <span className="info-label">Date:</span>
                  <span className="info-value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="order-info-item">
                  <span className="info-label">Claim Code:</span>
                  <span className="info-value">{selectedOrder.claimCode}</span>
                </div>
                <div className="order-info-item">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value">Rs. {selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-items-section">
                <h4>Order Items</h4>
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Book Title</th>
                        <th>Quantity</th>
                        <th>Product ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName || "Unknown Book"}</td>
                          <td>{item.quantity}</td>
                          <td>{item.productId}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="total-label">
                          Total Amount: <span className="total-value">Rs. {selectedOrder.totalAmount.toFixed(2)}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="empty-state">No items found for this order.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedOrder.status !== "Completed" && selectedOrder.status !== "Cancelled" ? (
                <button className="btn btn-primary" onClick={() => openConfirmModal(selectedOrder.claimCode)}>
                  Fulfill Order
                </button>
              ) : (
                <div className="order-status-message">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={selectedOrder.status.toLowerCase() === "completed" ? "icon-success" : "icon-cancelled"}
                  >
                    {selectedOrder.status.toLowerCase() === "completed" ? (
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    ) : (
                      <circle cx="12" cy="12" r="10"></circle>
                    )}
                    {selectedOrder.status.toLowerCase() === "completed" ? (
                      <path d="m9 11 3 3L22 4"></path>
                    ) : (
                      <>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </>
                    )}
                  </svg>
                  <span>This order has been {selectedOrder.status.toLowerCase()}</span>
                </div>
              )}
              <button className="btn btn-outline" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Action</h3>
              <button className="modal-close-btn" onClick={closeConfirmModal}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <p>{confirmMessage}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={confirmProcessOrder} disabled={processingOrder}>
                {processingOrder ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="loading-icon"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
              <button className="btn btn-outline" onClick={closeConfirmModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-header">
            <h4>{notification.title}</h4>
            <button className="notification-close" onClick={() => setNotification(null)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p>{notification.message}</p>
        </div>
      )}
    </>
  )
}

export default StaffOrders
