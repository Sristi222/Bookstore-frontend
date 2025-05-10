import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [fullName, setFullName] = useState(""); // correct property name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const registerUser = async () => {
    try {
      const res = await axios.post("https://localhost:7085/api/Auth/register", {
        fullName, // ✅ must match backend DTO property
        email,
        password,
      });

      alert("Registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response && err.response.data) {
        // If backend returns identity validation errors (array)
        if (Array.isArray(err.response.data)) {
          const messages = err.response.data
            .map((e) => e.description || JSON.stringify(e))
            .join("\n");
          alert(messages);
        } else if (err.response.data.message) {
          alert(err.response.data.message);
        } else {
          alert("Registration failed. Please check input.");
        }
      } else {
        alert("Registration failed. Please check input.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h3>Register</h3>
      <input
        className="form-control mb-2"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn btn-success" onClick={registerUser}>
        Register
      </button>
    </div>
  );
};

export default Register;
