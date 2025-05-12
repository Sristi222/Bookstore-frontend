Orders.jsx


import { useEffect, useState } from "react"
import "./Orders.css"

const Orders = () => {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("adminOrders")) || []
    setOrders(savedOrders)
  }, [])

  const updateStatus = (id, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    )
    setOrders(updatedOrders)
    localStorage.setItem("adminOrders", JSON.stringify(updatedOrders))
  }

  return (
    <div className="admin-orders-container">
      <h2>All Placed Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="admin-order-card">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Name:</strong> {order.name}</p>
            <p><strong>Phone:</strong> {order.phone}</p>
            <p><strong>Address:</strong> {order.address}</p>
            <p><strong>Total:</strong> Rs. {order.total}</p>
            <p><strong>Date:</strong> {order.date}</p>
            <p><strong>Claim Code:</strong> <span className="code">{order.claimCode}</span></p>
            <p><strong>Status:</strong> {order.status}</p>
            <div className="status-buttons">
              {order.status === "Pending" && (
                <>
                  <button onClick={() => updateStatus(order.id, "Processing")}>Mark as Processing</button>
                  <button onClick={() => updateStatus(order.id, "Cancelled")}>Cancel</button>
                </>
              )}
              {order.status === "Processing" && (
                <button onClick={() => updateStatus(order.id, "Completed")}>Mark as Completed</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Orders