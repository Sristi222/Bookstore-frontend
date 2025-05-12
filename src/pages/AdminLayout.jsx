"use client"

import { Link, Outlet, useNavigate } from "react-router-dom"
import { PlusCircle, Package, ImageIcon, FileText, LogOut, ShoppingBag } from "lucide-react"
import "./AdminLayout.css"

const AdminLayout = () => {
  const navigate = useNavigate()

  const handleSignOut = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("isAdmin")
    navigate("/login") // Redirects to login page
  }

  return (
    <div className="staff-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>
          Admin Panel
        </h2>
        <nav>
          <ul>
            <li>
              <Link to="/admin" className="sidebar-link">
                 Admin Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/add-product" className="sidebar-link">
                <PlusCircle className="icon" /> Add Product
              </Link>
            </li>
            <li>
              <Link to="/admin/view-products" className="sidebar-link">
                <Package className="icon" /> View Products
              </Link>
            </li>
            <li>
              <Link to="/admin/add-banner" className="sidebar-link">
                <ImageIcon className="icon" /> Manage Banners
              </Link>
            </li>
            <li>
              <Link to="/admin/view-orders" className="sidebar-link">
                <FileText className="icon" /> View Orders
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleSignOut} className="logout-btn">
            <LogOut className="icon" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="content-container">
          <Outlet /> {/* Nested routes render here */}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
