"use client"

import { useState } from "react"
import axios from "axios"
import "./StaffLayout.css"

const StaffProcessClaim = () => {
  const [claimCode, setClaimCode] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = localStorage.getItem("token")
  const API_URL = "https://localhost:7085/api"

  const processClaim = async () => {
    if (!claimCode.trim()) {
      setError("Please enter a claim code.")
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await axios.post(
        `${API_URL}/Orders/process-claim?claimCode=${encodeURIComponent(claimCode)}`,
        null, // no body
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setResult(res.data)
    } catch (err) {
      console.error("Error processing claim:", err)
      setError(
        err.response?.data?.message || err.message || "Failed to process claim. Please check the code and try again.",
      )
    } finally {
      setLoading(false)
    }
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

          {error && (
            <div className="result-box" style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5" }}>
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
                style={{ color: "#dc2626" }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div className="result-content">
                <h4 style={{ color: "#b91c1c" }}>Error Processing Claim</h4>
                <p style={{ color: "#991b1b" }}>{error}</p>
              </div>
            </div>
          )}

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
                <p>{result.message || "Order has been successfully processed and marked as completed."}</p>
                {result.orderId && <p>Order ID: #{result.orderId}</p>}
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
