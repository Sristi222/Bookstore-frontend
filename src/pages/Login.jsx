import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // Import the external CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      const res = await axios.post("https://localhost:7085/api/Auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      if (email === "admin@gmail.com" && password === "admin123") {
        localStorage.setItem("isAdmin", "true");
        navigate("/add-product");
      } else {
        localStorage.setItem("isAdmin", "false");
        navigate("/");
      }
    } catch (err) {
      alert("Invalid credentials");
      console.error(err);
    }
  };

  const goToSignUp = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-form-section">
          <h2 className="login-title">WELCOME MEMBER</h2>
          <p className="login-subtitle">Welcome back! Please enter your details.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginUser();
            }}
          >
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>

            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#forgot" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="login-button">Sign in</button>
          </form>

          <div className="signup-link">
            <p>
              Don’t have an account?{" "}
              <a href="#" onClick={goToSignUp} style={{ textDecoration: 'none', color: "#b8860b" }}>
  Sign up
</a>


            </p>
          </div>
        </div>

        <div className="login-image-section">
          <img
            src="https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books-illustration_23-2149341898.jpg?semt=ais_hybrid&w=740"
            alt="Books"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
