"use client"

import { useEffect, useState, useRef } from "react"
import * as signalR from "@microsoft/signalr"
import "./CustomerActivityNotification.css"

const CustomerActivityNotification = () => {
  const [notifications, setNotifications] = useState([])
  const connectionRef = useRef(null)
  const BACKEND_URL = "https://localhost:7085"
  const NOTIFICATION_DURATION = 15000

  useEffect(() => {
    if (connectionRef.current) return // Prevent multiple initializations

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BACKEND_URL}/customernotificationhub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    connectionRef.current = connection

    connection.on("ReceiveNotification", (message) => {
      console.log("🔔 NOTIFICATION RECEIVED:", message)
      showNotification(message)
    })

    connection.on("ReceiveNotificationHistory", (messages) => {
      console.log("📚 NOTIFICATION HISTORY RECEIVED:", messages)
      if (messages?.length) {
        messages.forEach((msg, i) => {
          setTimeout(() => showNotification(msg), i * 1000)
        })
      }
    })

    const startConnection = async () => {
      try {
        await connection.start()
        console.log("SignalR Connected successfully")
      } catch (err) {
        console.error("SignalR Connection Error:", err)
        setTimeout(startConnection, 5000)
      }
    }

    startConnection()

    return () => {
      connection.stop()
      console.log("SignalR connection stopped")
    }
  }, [])

  const showNotification = (message) => {
    const id = Date.now()
    const newNotification = { id, message, visible: true }

    setNotifications((prev) => [...prev, newNotification])

    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, visible: false } : notif))
      )
      setTimeout(() => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id))
      }, 500)
    }, NOTIFICATION_DURATION)
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification-toast ${notification.visible ? "visible" : "hidden"}`}>
          <div className="notification-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <p className="notification-message">{notification.message}</p>
        </div>
      ))}
    </div>
  )
}

export default CustomerActivityNotification
