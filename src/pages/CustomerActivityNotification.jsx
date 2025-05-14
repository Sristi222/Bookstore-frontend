"use client"

import { useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import "./CustomerActivityNotification.css"

const CustomerActivityNotification = () => {
  const [notifications, setNotifications] = useState([])
  const BACKEND_URL = "https://localhost:7085"
  const NOTIFICATION_DURATION = 15000 // Increased to 15 seconds

  useEffect(() => {
    console.log("CustomerActivityNotification component mounted")

    // Create SignalR connection with FULL backend URL
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BACKEND_URL}/customernotificationhub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    console.log("SignalR connection created with URL:", `${BACKEND_URL}/customernotificationhub`)

    // Set up the event handler for notifications
    connection.on("ReceiveNotification", (message) => {
      console.log("🔔 NOTIFICATION RECEIVED:", message)

      // Create a new notification with unique ID
      const newNotification = {
        id: Date.now(),
        message,
        visible: true,
      }

      // Add to notifications array
      setNotifications((prev) => [...prev, newNotification])

      // Auto-hide after duration
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === newNotification.id ? { ...notif, visible: false } : notif)),
        )

        // Remove from array after animation completes
        setTimeout(() => {
          setNotifications((prev) => prev.filter((notif) => notif.id !== newNotification.id))
        }, 500)
      }, NOTIFICATION_DURATION)
    })

    // Handle receiving notification history
    connection.on("ReceiveNotificationHistory", (messages) => {
      console.log("📚 NOTIFICATION HISTORY RECEIVED:", messages)

      if (messages && messages.length > 0) {
        // Create notifications from history with staggered display
        messages.forEach((message, index) => {
          setTimeout(() => {
            const newNotification = {
              id: Date.now() + index,
              message,
              visible: true,
            }

            setNotifications((prev) => [...prev, newNotification])

            // Auto-hide after duration
            setTimeout(() => {
              setNotifications((prev) =>
                prev.map((notif) => (notif.id === newNotification.id ? { ...notif, visible: false } : notif)),
              )

              setTimeout(() => {
                setNotifications((prev) => prev.filter((notif) => notif.id !== newNotification.id))
              }, 500)
            }, NOTIFICATION_DURATION)
          }, index * 1000) // Stagger notifications by 1 second
        })
      }
    })

    // Start the connection
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

    // Clean up
    return () => {
      if (connection) {
        connection.stop()
        console.log("SignalR connection stopped")
      }
    }
  }, [])

  return (
    <div className="notification-container">

      {notifications.map((notification) => (
        <div key={notification.id} className={`notification-toast ${notification.visible ? "visible" : "hidden"}`}>
          <div className="notification-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
