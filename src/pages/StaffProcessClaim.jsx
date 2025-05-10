// src/pages/StaffProcessClaim.jsx
import { useState } from "react";
import axios from "axios";

const StaffProcessClaim = () => {
  const [claimCode, setClaimCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const API_URL = "https://localhost:7085/api";

  const processClaim = async () => {
    if (!claimCode.trim()) {
      alert("Please enter a claim code.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        `${API_URL}/Orders/process-claim?claimCode=${encodeURIComponent(claimCode)}`,
        null, // no body
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
      alert(res.data.message || "Claim processed successfully.");
    } catch (err) {
      alert(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-process-claim" style={{ padding: "20px" }}>
      <h2>Process Claim Code</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          value={claimCode}
          onChange={(e) => setClaimCode(e.target.value)}
          placeholder="Enter Claim Code"
          style={{ padding: "8px", width: "250px", marginRight: "10px" }}
        />
        <button onClick={processClaim} disabled={loading}>
          {loading ? "Processing..." : "Verify & Fulfill"}
        </button>
      </div>

      {result && (
        <div className="claim-result" style={{ marginTop: "20px", background: "#f0f0f0", padding: "15px" }}>
          <h4>✅ Claim Processed</h4>
          <p><strong>{result.message}</strong></p>
        </div>
      )}
    </div>
  );
};

export default StaffProcessClaim;
