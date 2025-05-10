import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://localhost:7085/api/Auth/login", {
        email,
        password,
      });

      const token = res.data.token;
      const userId = res.data.userId; // ✅ still here

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);

      const userRoles =
        decoded.role ||
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      const isAdmin =
        (Array.isArray(userRoles) && userRoles.includes("Admin")) ||
        userRoles === "Admin";

      const isStaff =
        (Array.isArray(userRoles) && userRoles.includes("Staff")) ||
        userRoles === "Staff";

      localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
      localStorage.setItem("isStaff", isStaff ? "true" : "false");

      if (isAdmin) {
        navigate("/admin");
      } else if (isStaff) {
        navigate("/staff");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") loginUser();
  };

  return (
    <div className="container mt-4">
      <h3>Login</h3>
      <input
        className="form-control mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <input
        className="form-control mb-2"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="btn btn-primary"
        onClick={loginUser}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
};

export default Login;
