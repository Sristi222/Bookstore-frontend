"use client"

import { useState } from "react"
import { Link, useLocation, Outlet } from "react-router-dom"
import "./StaffLayout.css"

const StaffLayout = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <div className="staff-dashboard">
      <nav className="sidebar">
        <h2>Staff Dashboard</h2>
        <ul>
          <li>
            <Link to="/staff" className={currentPath === "/staff" ? "active" : ""}>
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
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/staff/orders" className={currentPath === "/staff/orders" ? "active" : ""}>
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
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                <path d="M3 6h18"></path>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Manage Orders
            </Link>
          </li>
          <li>
            <Link to="/staff/process-claim" className={currentPath === "/staff/process-claim" ? "active" : ""}>
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
                <path d="m9 11-6 6v3h9l3-3"></path>
                <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path>
              </svg>
              Process Claim
            </Link>
          </li>
          <li>
            <Link to="/staff/reports" className={currentPath === "/staff/reports" ? "active" : ""}>
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
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Reports
            </Link>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn">
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </nav>
      <main>
        <header className="main-header">
          <div className="search-container">
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <svg
              className="search-icon"
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
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <div className="user-profile">
            <div className="avatar">SA</div>
          </div>
        </header>
        <div className="content-container">
          {/* This is the key addition - render nested routes here */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default StaffLayout
