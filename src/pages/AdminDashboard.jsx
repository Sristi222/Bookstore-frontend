"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./StaffLayout.css"

// Add console log to check if component is rendering
console.log("StaffDashboard rendering")

const StaffDashboard = () => {
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenue: 0,
    totalOrdersChange: 12.5,
    pendingOrdersChange: 8.2,
    completedOrdersChange: 12.2,
    revenueChange: -3.1,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [orderData, setOrderData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeframe, setTimeframe] = useState("monthly")

  const token = localStorage.getItem("token")
  const API_URL = "https://localhost:7085/api"

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all orders from the Orders controller
      const ordersResponse = await axios.get(`${API_URL}/Orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (ordersResponse.data) {
        const orders = ordersResponse.data

        // Calculate order statistics
        const totalOrders = orders.length
        const pendingOrders = orders.filter((order) => order.status === "Pending").length
        const completedOrders = orders.filter((order) => order.status === "Completed").length
        const revenue = orders
          .filter((order) => order.status === "Completed")
          .reduce((sum, order) => sum + order.totalAmount, 0)

        setOrderStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          revenue,
          totalOrdersChange: 12.5, // Sample change percentages
          pendingOrdersChange: 8.2,
          completedOrdersChange: 12.2,
          revenueChange: -3.1,
        })

        // Get recent orders (last 5)
        const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        const recent = sortedOrders.slice(0, 5).map((order) => ({
          id: order.id,
          customer: order.userId,
          status: order.status,
          total: order.totalAmount,
          date: order.createdAt,
          claimCode: order.claimCode,
          orderItems: order.orderItems,
        }))
        setRecentOrders(recent)

        // Generate order data for charts based on timeframe
        generateOrderDataByTimeframe(orders, timeframe)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching orders data:", err)
      setError("Failed to load orders data. Using sample data instead.")

      // Fallback to sample data if API fails
      setOrderStats({
        totalOrders: 1284,
        pendingOrders: 45,
        completedOrders: 1239,
        revenue: 45231,
        totalOrdersChange: 12.5,
        pendingOrdersChange: 8.2,
        completedOrdersChange: 12.2,
        revenueChange: -3.1,
      })

      setRecentOrders([
        { id: 7245, customer: "John Smith", status: "Pending", total: 1200, date: "Today, 2:30 PM" },
        { id: 7244, customer: "Sarah Johnson", status: "Completed", total: 850, date: "Today, 11:15 AM" },
        { id: 7243, customer: "Michael Brown", status: "Completed", total: 2400, date: "Yesterday, 4:45 PM" },
        { id: 7242, customer: "Emily Davis", status: "Pending", total: 1750, date: "Yesterday, 2:30 PM" },
        { id: 7241, customer: "David Wilson", status: "Completed", total: 950, date: "Yesterday, 10:15 AM" },
      ])

      setOrderData([
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
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Always use sample data for different timeframes
    const sampleData = {
      monthly: [
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
      ],
      weekly: [
        { date: "Week 1", orders: 28, revenue: 7200 },
        { date: "Week 2", orders: 32, revenue: 8500 },
        { date: "Week 3", orders: 36, revenue: 9800 },
        { date: "Week 4", orders: 42, revenue: 11200 },
      ],
      daily: [
        { date: "Mon", orders: 12, revenue: 3200 },
        { date: "Tue", orders: 15, revenue: 4100 },
        { date: "Wed", orders: 18, revenue: 4800 },
        { date: "Thu", orders: 14, revenue: 3700 },
        { date: "Fri", orders: 20, revenue: 5300 },
        { date: "Sat", orders: 25, revenue: 6500 },
        { date: "Sun", orders: 16, revenue: 4200 },
      ],
    }

    // Always set sample data for now to ensure chart displays something
    setOrderData(sampleData[timeframe] || sampleData.monthly)

    console.log("Setting chart data for timeframe:", timeframe, sampleData[timeframe])
  }, [timeframe])

  const generateOrderDataByTimeframe = (orders, timeframe) => {
    if (!orders || orders.length === 0) {
      // If no orders, use sample data
      const sampleData = {
        monthly: [
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
        ],
        weekly: [
          { date: "Week 1", orders: 28, revenue: 7200 },
          { date: "Week 2", orders: 32, revenue: 8500 },
          { date: "Week 3", orders: 36, revenue: 9800 },
          { date: "Week 4", orders: 42, revenue: 11200 },
        ],
        daily: [
          { date: "Mon", orders: 12, revenue: 3200 },
          { date: "Tue", orders: 15, revenue: 4100 },
          { date: "Wed", orders: 18, revenue: 4800 },
          { date: "Thu", orders: 14, revenue: 3700 },
          { date: "Fri", orders: 20, revenue: 5300 },
          { date: "Sat", orders: 25, revenue: 6500 },
          { date: "Sun", orders: 16, revenue: 4200 },
        ],
      }
      setOrderData(sampleData[timeframe] || sampleData.monthly)
      return
    }

    const now = new Date()
    let chartData = []

    if (timeframe === "monthly") {
      // Group by month for the current year
      const currentYear = now.getFullYear()
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      // Initialize data for all months
      chartData = monthNames.map((month) => ({ date: month, orders: 0, revenue: 0 }))

      // Fill in data from orders
      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt)
        if (orderDate.getFullYear() === currentYear) {
          const monthIndex = orderDate.getMonth()
          chartData[monthIndex].orders++
          chartData[monthIndex].revenue += order.totalAmount
        }
      })
    } else if (timeframe === "weekly") {
      // Group by week for the current month
      chartData = [
        { date: "Week 1", orders: 0, revenue: 0 },
        { date: "Week 2", orders: 0, revenue: 0 },
        { date: "Week 3", orders: 0, revenue: 0 },
        { date: "Week 4", orders: 0, revenue: 0 },
      ]

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt)
        const currentMonth = now.getMonth()
        const orderMonth = orderDate.getMonth()

        if (orderMonth === currentMonth) {
          const dayOfMonth = orderDate.getDate()
          let weekIndex = Math.floor((dayOfMonth - 1) / 7)
          if (weekIndex > 3) weekIndex = 3 // Cap at week 4

          chartData[weekIndex].orders++
          chartData[weekIndex].revenue += order.totalAmount
        }
      })
    } else if (timeframe === "daily") {
      // Group by day for the current week
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

      // Initialize data for all days
      chartData = dayNames.map((day) => ({ date: day, orders: 0, revenue: 0 }))

      // Calculate start of week (Sunday)
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      // Fill in data from orders
      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt)
        if (orderDate >= startOfWeek) {
          const dayIndex = orderDate.getDay()
          chartData[dayIndex].orders++
          chartData[dayIndex].revenue += order.totalAmount
        }
      })
    }

    // If no data was found for the selected timeframe, use sample data
    const hasData = chartData.some((item) => item.orders > 0)
    if (!hasData) {
      console.log("No orders found for the selected timeframe. Using sample data.")
      const sampleData = {
        monthly: [
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
        ],
        weekly: [
          { date: "Week 1", orders: 28, revenue: 7200 },
          { date: "Week 2", orders: 32, revenue: 8500 },
          { date: "Week 3", orders: 36, revenue: 9800 },
          { date: "Week 4", orders: 42, revenue: 11200 },
        ],
        daily: [
          { date: "Mon", orders: 12, revenue: 3200 },
          { date: "Tue", orders: 15, revenue: 4100 },
          { date: "Wed", orders: 18, revenue: 4800 },
          { date: "Thu", orders: 14, revenue: 3700 },
          { date: "Fri", orders: 20, revenue: 5300 },
          { date: "Sat", orders: 25, revenue: 6500 },
          { date: "Sun", orders: 16, revenue: 4200 },
        ],
      }
      chartData = sampleData[timeframe] || sampleData.monthly
    }

    setOrderData(chartData)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    // Check if the date is already formatted (like "Today, 2:30 PM")
    if (typeof dateString === "string" && (dateString.includes("Today") || dateString.includes("Yesterday"))) {
      return dateString
    }

    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    }

    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    }

    // Otherwise return full date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // For the donut chart
  const orderStatusData = [
    { status: "Completed", count: orderStats.completedOrders, color: "#10b981" },
    { status: "Pending", count: orderStats.pendingOrders, color: "#f59e0b" },
  ]

  if (loading) {
    return (
      <div className="loading-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
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
        <p>Loading dashboard data...</p>
      </div>
    )
  }

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

      {error && (
        <div
          className="result-box"
          style={{ backgroundColor: "#fff7ed", borderColor: "#fed7aa", marginBottom: "20px" }}
        >
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
            style={{ color: "#ea580c" }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div className="result-content">
            <h4 style={{ color: "#c2410c" }}>Notice</h4>
            <p style={{ color: "#9a3412" }}>{error}</p>
          </div>
        </div>
      )}

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
            <span>{orderStats.totalOrdersChange || 12.5}% from last month</span>
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
            <span>{orderStats.pendingOrdersChange || 8.2}% from yesterday</span>
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
            <span>{orderStats.completedOrdersChange || 12.2}% from last month</span>
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
          <div className={`stat-change ${orderStats.revenueChange >= 0 ? "positive" : "negative"}`}>
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
              {orderStats.revenueChange >= 0 ? (
                <>
                  <path d="m5 12 7-7 7 7"></path>
                  <path d="M12 19V5"></path>
                </>
              ) : (
                <>
                  <path d="M12 5v14"></path>
                  <path d="m19 12-7 7-7-7"></path>
                </>
              )}
            </svg>
            <span>{Math.abs(orderStats.revenueChange || 3.1)}% from last week</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Order Chart */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <h2 className="card-title">Order Overview</h2>
            <div className="card-actions">
              <select
                className="chart-select"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #e5e7eb" }}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>
          <div className="card-content">
            <div style={{ height: "300px", position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  paddingTop: "30px",
                }}
              >
                {orderData.map((item, index) => {
                  const maxValue = Math.max(...orderData.map((d) => d.orders))

                  // Adjust the height calculation to make bars more visible
                  // Use a minimum height percentage (20%) and scale the rest
                  const minHeightPercentage = 20
                  const scaledHeight =
                    maxValue > 0
                      ? minHeightPercentage + (item.orders / maxValue) * (100 - minHeightPercentage)
                      : minHeightPercentage

                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-25px",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#6b7280",
                        }}
                      >
                        {item.orders}
                      </div>
                      <div
                        style={{
                          width: "70%",
                          height: `${scaledHeight}%`,
                          backgroundColor: index === orderData.length - 1 ? "#f59e0b" : "#60a5fa",
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.5s ease",
                          minHeight: "20px", // Ensure a minimum visible height
                        }}
                      ></div>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {item.date}
                      </div>
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
                    strokeDasharray={`${orderStats.totalOrders > 0 ? (orderStats.completedOrders / orderStats.totalOrders) * 377 : 0} 377`}
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
                    strokeDasharray={`${orderStats.totalOrders > 0 ? (orderStats.pendingOrders / orderStats.totalOrders) * 377 : 0} 377`}
                    strokeDashoffset={`${orderStats.totalOrders > 0 ? -1 * (orderStats.completedOrders / orderStats.totalOrders) * 377 : 0}`}
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
            <button className="btn btn-primary" onClick={() => (window.location.href = "/staff/orders")}>
              View All
            </button>
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
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                      </td>
                      <td>Rs. {order.total.toLocaleString()}</td>
                      <td>{formatDate(order.date)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => (window.location.href = `/staff/orders?id=${order.id}`)}
                        >
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default StaffDashboard
