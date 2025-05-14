"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Plus, CheckCircle, Trash2, AlertTriangle, X } from "lucide-react"
import "./BannerManager.css"

const BannerManager = () => {
  const [banners, setBanners] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState(null)
  const [notification, setNotification] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [form, setForm] = useState({
    title: "",
    subTitle: "",
    link: "",
    startDateTime: "",
    endDateTime: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState("")

  const fetchBanners = async () => {
    try {
      const res = await axios.get("https://localhost:7085/api/Banners")
      setBanners(res.data)
    } catch (err) {
      console.error("Failed to fetch banners", err)
      showNotification("Error", "Failed to fetch banners", "error")
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      setPreview("")
    }
  }

  const showNotification = (title, message, type = "success") => {
    setNotification({ title, message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000) // Hide after 5 seconds
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    const data = new FormData()
    Object.keys(form).forEach((key) => data.append(key, form[key]))
    if (imageFile) data.append("Image", imageFile)

    try {
      await axios.post("https://localhost:7085/api/Banners", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      showNotification("Success", "Banner added successfully!")
      setForm({ title: "", subTitle: "", link: "", startDateTime: "", endDateTime: "" })
      setImageFile(null)
      setPreview("")
      setShowAddModal(false)
      fetchBanners()
    } catch (err) {
      console.error("Failed to add banner:", err)
      showNotification("Error", "Failed to add banner", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const openDeleteModal = (banner) => {
    setBannerToDelete(banner)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setBannerToDelete(null)
  }

  const confirmDelete = async () => {
    if (!bannerToDelete) return

    setIsProcessing(true)
    try {
      await axios.delete(`https://localhost:7085/api/Banners/${bannerToDelete.id}`)
      showNotification("Success", "Banner deleted successfully!")
      fetchBanners()
      closeDeleteModal()
    } catch (err) {
      console.error("Delete error:", err)
      showNotification("Error", "Failed to delete banner", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleActivate = async (id) => {
    setIsProcessing(true)
    try {
      await axios.put(`https://localhost:7085/api/Banners/${id}/activate`)
      showNotification("Success", `Banner ${id} activated successfully!`)
      fetchBanners()
    } catch (err) {
      console.error("Activate error:", err)
      showNotification("Error", "Failed to activate banner", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="banner-container">
      <h2 className="banner-heading">Banner Manager</h2>
      <button className="btn-add-banner" onClick={() => setShowAddModal(true)}>
        <Plus size={18} /> Add Banner
      </button>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add Banner</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="banner-form">
              <div className="modal-content">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subTitle">Subtitle</label>
                  <input
                    type="text"
                    id="subTitle"
                    name="subTitle"
                    placeholder="Subtitle"
                    value={form.subTitle}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="link">Link (optional)</label>
                  <input
                    type="text"
                    id="link"
                    name="link"
                    placeholder="Link (optional)"
                    value={form.link}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="startDateTime">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    id="startDateTime"
                    name="startDateTime"
                    value={form.startDateTime}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDateTime">End Date & Time</label>
                  <input
                    type="datetime-local"
                    id="endDateTime"
                    name="endDateTime"
                    value={form.endDateTime}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bannerImage">Banner Image</label>
                  <input
                    type="file"
                    id="bannerImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="form-control"
                  />
                </div>

                {preview && (
                  <div className="preview-container">
                    <img src={preview || "/placeholder.svg"} alt="Preview" className="image-preview" />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? (
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
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bannerToDelete && (
        <div className="modal-overlay">
          <div className="modal-container confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="modal-close-btn" onClick={closeDeleteModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="confirmation-icon">
                <AlertTriangle size={48} className="warning-icon" />
              </div>
              <p>Are you sure you want to delete this banner?</p>
              <p className="banner-to-delete">
                <strong>{bannerToDelete.title}</strong>
              </p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={confirmDelete} disabled={isProcessing}>
                {isProcessing ? (
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
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete Banner"
                )}
              </button>
              <button className="btn btn-outline" onClick={closeDeleteModal} disabled={isProcessing}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="banner-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td>{banner.id}</td>
                <td>{banner.title}</td>
                <td>{banner.subTitle}</td>
                <td>{banner.isActive ? <CheckCircle size={18} className="active-icon" /> : ""}</td>
                <td>
                  <button onClick={() => handleActivate(banner.id)} className="btn-activate" disabled={isProcessing}>
                    Activate
                  </button>
                  <button onClick={() => openDeleteModal(banner)} className="btn-delete" disabled={isProcessing}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-header">
            <h4>{notification.title}</h4>
            <button className="notification-close" onClick={() => setNotification(null)}>
              <X size={16} />
            </button>
          </div>
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  )
}

export default BannerManager
