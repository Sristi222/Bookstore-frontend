import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddProduct from "./pages/AddProduct";
import Cart from "./pages/Cart";
import ContactUs from "./pages/Contact";
import ViewProducts from "./pages/ViewProducts";
import AdminLayout from "./pages/AdminLayout";
import Bookmarks from "./pages/Bookmark";
import AddBanner from "./pages/AddBanner";
import ProductDetails from "./pages/ProductDetails";
import OrderBill from "./pages/OrderBill";
import OrderHistory from "./pages/OrderHistory";
import StaffLayout from "./pages/StaffLayout";
import StaffOrders from "./pages/StaffOrders";
import StaffProcessClaim from "./pages/StaffProcessClaim";
import CustomerActivityNotification from './pages/CustomerActivityNotification';

import './App.css';

const isLoggedIn = () => !!localStorage.getItem("token");
const isAdmin = () => localStorage.getItem("isAdmin") === "true";
const isStaff = () => localStorage.getItem("isStaff") === "true";

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  return isLoggedIn() && isAdmin() ? children : <Navigate to="/login" />;
}

function StaffRoute({ children }) {
  return isLoggedIn() && isStaff() ? children : <Navigate to="/login" />;
}

function GuestRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <div className="app-wrapper">
      <BrowserRouter>
        <Routes>

          {/* USER SIDE */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
          <Route path="/order-bill" element={<PrivateRoute><OrderBill /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />

          {/* PRODUCT DETAILS */}
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* ADMIN SIDE */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="add-product" element={<AddProduct />} />
            <Route path="view-products" element={<ViewProducts />} />
            <Route path="add-banner" element={<AddBanner />} />
          </Route>

          {/*STAFF SIDE */}
          <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
            {/*ADD index route so /staff loads something */}
            <Route index element={<StaffOrders />} />   {/* default page for /staff */}
            <Route path="orders" element={<StaffOrders />} />
            <Route path="process-claim" element={<StaffProcessClaim />} />
          </Route>

        </Routes>
        
        {/* Add the CustomerActivityNotification component here, outside of Routes */}
        <CustomerActivityNotification />
      </BrowserRouter>
    </div>
  );
}

export default App;