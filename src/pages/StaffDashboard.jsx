"use client"

import { useState } from "react"
import "./StaffLayout.css"

const StaffDashboard = () => {
  const [orderStats, setOrderStats] = useState({
    totalOrders: 1284,
    pendingOrders: 45,
    completedOrders: 1239,
    revenue: 45231,
  })

  const [recentOrders, setRecentOrders] = useState([
    { id: 7245, customer: "John Smith", status: "Pending", total: 1200, date: "Today, 2:30 PM" },
    { id: 7244, customer: "Sarah Johnson", status: "Completed", total: 850, date: "Today, 11:15 AM" },
    { id: 7243, customer: "Michael Brown", status: "Completed", total: 2400, date: "Yesterday, 4:45 PM" },
    { id: 7242, customer: "Emily Davis", status: "Pending", total: 1750, date: "Yesterday, 2:30 PM" },
    { id: 7241, customer: "David Wilson", status: "Completed", total: 950, date: "Yesterday, 10:15 AM" },
  ])

  // Monthly order data for the chart
  const orderData = [
    { date: "Jan", orders: 65, revenue: 15600 },
    { date: "Feb", orders: 59, revenue: 12800 },
    { date: "Mar", orders: 80, revenue: 19200 },
    { date: "Apr", orders: 81, revenue: 21500 },
    { date: "May", orders: 56, revenue: 15800 },
    { date: "Jun", orders: 55, revenue: 14900 },
    { date: "Jul", orders: 40, revenue: 12000 },
    { date: "Aug", orders: 70, revenue: 18500 },
    { date: "Sep", orders: 90, revenue: 22800 },
    { date: "Oct", orders: 110, revenue: 28500 },
    { date: "Nov", orders: 130, revenue: 32600 },
    { date: "Dec", orders: 150, revenue: 38000 },
  ]

  // For the donut chart
  const orderStatusData = [
    { status: "Completed", count: orderStats.completedOrders, color: "#10b981" },
    { status: "Pending", count: orderStats.pendingOrders, color: "#f59e0b" },
  ]

  return (
    <>
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="date-display">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="date-icon"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Orders</div>
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
              className="stat-icon"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <path d="M3 6h18"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div className="stat-value">{orderStats.totalOrders.toLocaleString()}</div>
          <div className="stat-change positive">
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
              <path d="m5 12 7-7 7 7"></path>
              <path d="M12 19V5"></path>
            </svg>
            <span>12.5% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Pending Orders</div>
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
              className="stat-icon"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-value">{orderStats.pendingOrders}</div>
          <div className="stat-change positive">
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
              <path d="m5 12 7-7 7 7"></path>
              <path d="M12 19V5"></path>
            </svg>
            <span>8.2% from yesterday</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Completed Orders</div>
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
              className="stat-icon"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <path d="m9 11 3 3L22 4"></path>
            </svg>
          </div>
          <div className="stat-value">{orderStats.completedOrders.toLocaleString()}</div>
          <div className="stat-change positive">
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
              <path d="m5 12 7-7 7 7"></path>
              <path d="M12 19V5"></path>
            </svg>
            <span>12.2% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Revenue</div>
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
              className="stat-icon"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-value">Rs. {orderStats.revenue.toLocaleString()}</div>
          <div className="stat-change negative">
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
              <path d="M12 5v14"></path>
              <path d="m19 12-7 7-7-7"></path>
            </svg>
            <span>3.1% from last week</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Order Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h2 className="card-title">Order Overview</h2>
            <div className="card-actions">
              <select className="chart-select">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>
          <div className="card-content">
            <div className="chart-container">
              {/* Bar Chart */}
              <div className="bar-chart">
                {orderData.map((item, index) => {
                  const maxValue = Math.max(...orderData.map((d) => d.orders))
                  const height = (item.orders / maxValue) * 100

                  return (
                    <div key={index} className="bar-column">
                      <div className="bar-value">{item.orders}</div>
                      <div
                        className="bar"
                        style={{
                          height: `${height}%`,
                          backgroundColor: index === orderData.length - 1 ? "#f59e0b" : "#60a5fa",
                        }}
                      ></div>
                      <div className="bar-label">{item.date}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Donut Chart */}
        <div className="card chart-card donut-card">
          <div className="card-header">
            <h2 className="card-title">Order Status</h2>
          </div>
          <div className="card-content">
            <div className="donut-container">
              <div className="donut-chart">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                  {/* Completed Orders Arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${(orderStats.completedOrders / orderStats.totalOrders) * 377} 377`}
                    strokeDashoffset="0"
                    transform="rotate(-90 80 80)"
                  />
                  {/* Pending Orders Arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="20"
                    strokeDasharray={`${(orderStats.pendingOrders / orderStats.totalOrders) * 377} 377`}
                    strokeDashoffset={`${-1 * (orderStats.completedOrders / orderStats.totalOrders) * 377}`}
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div className="donut-center">
                  <div className="donut-number">{orderStats.totalOrders}</div>
                  <div className="donut-label">Total Orders</div>
                </div>
              </div>
              <div className="donut-legend">
                {orderStatusData.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                    <div className="legend-label">{item.status}</div>
                    <div className="legend-value">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Orders</h2>
          <div className="card-actions">
            <button className="btn btn-outline">
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
                className="icon"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export
            </button>
            <button className="btn btn-primary">View All</button>
          </div>
        </div>
        <div className="card-content">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td>Rs. {order.total.toLocaleString()}</td>
                    <td>{order.date}</td>
                    <td>
                      <button className="btn btn-sm btn-outline">
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default StaffDashboard
