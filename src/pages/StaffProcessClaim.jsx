<<<<<<< HEAD
"use client"

import { useState } from "react"
import "./StaffLayout.css"

const StaffProcessClaim = () => {
  const [claimCode, setClaimCode] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const processClaim = async () => {
    if (!claimCode.trim()) {
      alert("Please enter a claim code.")
      return
    }

    setLoading(true)
    setResult(null)

    // Simulate API call
    setTimeout(() => {
      setResult({
        message: `Order with claim code ${claimCode} has been successfully processed and marked as completed.`,
      })
      setLoading(false)
    }, 1500)
  }

  return (
    <>
      <h1 className="page-title">Process Claim</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Process Claim Code</h2>
          <p className="card-description">Enter a claim code to verify and fulfill an order</p>
        </div>
        <div className="card-content">
          <div className="form-group">
            <div className="claim-form">
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="Enter Claim Code"
                className="form-input"
              />
              <button className="btn btn-primary" onClick={processClaim} disabled={loading || !claimCode.trim()}>
                {loading ? (
                  <>
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
                      className="loading-icon"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Verify & Fulfill"
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className="result-box">
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
                className="result-icon"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <div className="result-content">
                <h4>Claim Processed Successfully</h4>
                <p>{result.message}</p>
              </div>
            </div>
          )}

          <div className="info-box">
            <h4>How to Process Claims</h4>
            <ol>
              <li>Ask the customer for their claim code</li>
              <li>Enter the code in the field above</li>
              <li>Click "Verify & Fulfill" to process the order</li>
              <li>Confirm the order details match what the customer is claiming</li>
              <li>Hand over the ordered items to the customer</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}

export default StaffProcessClaim
=======
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
>>>>>>> cc9edb02afd520c6b5fa0ce0cd5d9527767a71c4
