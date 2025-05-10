import { Outlet, Link } from "react-router-dom";
import './StaffLayout.css';

const StaffLayout = () => {
  return (
    <div className="staff-dashboard">
      <nav className="sidebar">
        <h2>Staff Dashboard</h2>
        <ul>
          <li><Link to="/staff/orders">Manage Orders</Link></li>
          <li><Link to="/staff/process-claim">Process Claim</Link></li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
