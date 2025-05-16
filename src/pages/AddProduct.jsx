"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { PlusCircle, Save, X, Upload, Award, TrendingUp, Star, Sparkles, Clock, Tag } from "lucide-react"
import "./AddProduct.css"

const AddProduct = () => {
  const [showForm, setShowForm] = useState(true)
  const [form, setForm] = useState({
    name: "",
    author: "",
    genre: "",
    publisher: "",
    isbn: "",
    description: "",
    language: "",
    format: "",
    publicationDate: "",
    price: "",
    discountPercent: "",
    discountStartDate: "",
    discountEndDate: "",
    onSale: false,
    stockQuantity: "0", // Default to "0" as a string
    isAvailableInStore: true, // Default to true
    // Category flags
    hasAward: false,
    isTrending: false,
    isBestseller: false,
    isNewRelease: false,
    isComingSoon: false,
    isOnDeal: false,
  })

  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [message, setMessage] = useState({ text: "", type: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    navigate("/login")
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const validateForm = () => {
    // Required fields
    if (!form.name || form.name.trim() === "") {
      setMessage({ text: "Product name is required", type: "error" })
      return false
    }

    if (!form.price || isNaN(Number.parseFloat(form.price)) || Number.parseFloat(form.price) < 0) {
      setMessage({ text: "Please enter a valid price", type: "error" })
      return false
    }

    // Validate discount percent if on sale
    if (form.onSale) {
      if (!form.discountPercent || isNaN(Number.parseFloat(form.discountPercent))) {
        setMessage({ text: "Please enter a valid discount percentage", type: "error" })
        return false
      }

      const discountPercent = Number.parseFloat(form.discountPercent)
      if (discountPercent < 0 || discountPercent > 100) {
        setMessage({ text: "Discount percentage must be between 0 and 100", type: "error" })
        return false
      }

      if (!form.discountStartDate) {
        setMessage({ text: "Discount start date is required for sale items", type: "error" })
        return false
      }

      if (!form.discountEndDate) {
        setMessage({ text: "Discount end date is required for sale items", type: "error" })
        return false
      }

      // Validate date range
      const startDate = new Date(form.discountStartDate)
      const endDate = new Date(form.discountEndDate)
      if (endDate < startDate) {
        setMessage({ text: "Discount end date must be after start date", type: "error" })
        return false
      }
    }

    // Validate stock quantity
    if (form.stockQuantity && (isNaN(Number.parseInt(form.stockQuantity)) || Number.parseInt(form.stockQuantity) < 0)) {
      setMessage({ text: "Stock quantity must be a non-negative number", type: "error" })
      return false
    }

    // Validate image
    if (!imageFile) {
      setMessage({ text: "Please upload a product image", type: "error" })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setMessage({ text: "", type: "" })

    const formData = new FormData()

    // Format and convert values before sending
    const formattedData = {
      ...form,
      price: Number.parseFloat(form.price),
      stockQuantity: Number.parseInt(form.stockQuantity || "0"),
      discountPercent: form.onSale ? Number.parseFloat(form.discountPercent || "0") : null,
      discountStartDate: form.onSale ? form.discountStartDate : null,
      discountEndDate: form.onSale ? form.discountEndDate : null,
    }

    // Append all form fields to FormData
    Object.keys(formattedData).forEach((key) => {
      if (formattedData[key] !== null && formattedData[key] !== undefined) {
        formData.append(key, formattedData[key].toString())
      }
    })

    // Append image if selected
    if (imageFile) {
      formData.append("image", imageFile)
    }

    try {
      const response = await axios.post("https://localhost:7085/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setMessage({ text: "Product added successfully!", type: "success" })
      setForm({
        name: "",
        author: "",
        genre: "",
        publisher: "",
        isbn: "",
        description: "",
        language: "",
        format: "",
        publicationDate: "",
        price: "",
        discountPercent: "",
        discountStartDate: "",
        discountEndDate: "",
        onSale: false,
        stockQuantity: "0",
        isAvailableInStore: true,
        hasAward: false,
        isTrending: false,
        isBestseller: false,
        isNewRelease: false,
        isComingSoon: false,
        isOnDeal: false,
      })
      setImageFile(null)
      setPreview("")
    } catch (err) {
      console.error("FULL BACKEND ERROR:", err.response?.data)
      let errorMessage = "Failed to add product"

      // Extract more specific error message if available
      if (err.response?.data?.title) {
        errorMessage += `: ${err.response.data.title}`
      } else if (err.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`
      } else if (err.message) {
        errorMessage += `: ${err.message}`
      }

      setMessage({
        text: errorMessage,
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Category flags configuration with icons
  const categoryFlags = [
    {
      name: "isTrending",
      label: "Trending",
      description: "Mark as a trending product",
      icon: <TrendingUp size={18} />,
    },
    {
      name: "isBestseller",
      label: "Bestseller",
      description: "Mark as a bestselling product",
      icon: <Star size={18} />,
    },
    {
      name: "hasAward",
      label: "Award Winner",
      description: "Mark as an award-winning product",
      icon: <Award size={18} />,
    },
    {
      name: "isNewRelease",
      label: "New Release",
      description: "Mark as a newly released product",
      icon: <Sparkles size={18} />,
    },
    {
      name: "isComingSoon",
      label: "Coming Soon",
      description: "Mark as an upcoming product",
      icon: <Clock size={18} />,
    },
    {
      name: "isOnDeal",
      label: "On Deal",
      description: "Mark as a special deal product",
      icon: <Tag size={18} />,
    },
  ]

  return (
    <div className="add-product-container">
      <div className="top-bar">
        <button className="btn-toggle-form" onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X size={18} /> Hide Form
            </>
          ) : (
            <>
              <PlusCircle size={18} /> Add Product
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="add-product-card">
          <div className="add-product-header">
            <h3>Add New Book</h3>
            <p>Fill out the form to add a book to your store</p>
          </div>

          <form onSubmit={handleSubmit} className="add-product-form" encType="multipart/form-data">
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {/* Basic Information */}
            <h4>Basic Information</h4>

            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input className="form-control" type="text" name="author" value={form.author} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Genre</label>
                <input className="form-control" type="text" name="genre" value={form.genre} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input
                  className="form-control"
                  type="text"
                  name="publisher"
                  value={form.publisher}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ISBN</label>
                <input className="form-control" type="text" name="isbn" value={form.isbn} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Language</label>
                <input
                  className="form-control"
                  type="text"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Format</label>
                <input className="form-control" type="text" name="format" value={form.format} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Publication Date</label>
                <input
                  className="form-control"
                  type="date"
                  name="publicationDate"
                  value={form.publicationDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price *</label>
                <input
                  className="form-control"
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  className="form-control"
                  type="number"
                  name="stockQuantity"
                  value={form.stockQuantity}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea className="form-control" name="description" value={form.description} onChange={handleChange} />
            </div>

            {/* Availability Options */}
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isAvailableInStore"
                  checked={form.isAvailableInStore}
                  onChange={handleChange}
                />
                Available in Store
              </label>
            </div>

            {/* Sale Information */}
            <h4>Sale Information</h4>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="onSale" checked={form.onSale} onChange={handleChange} />
                On Sale
              </label>
            </div>

            {form.onSale && (
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Percentage *</label>
                  <input
                    className="form-control"
                    type="number"
                    name="discountPercent"
                    value={form.discountPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount Start Date *</label>
                  <input
                    className="form-control"
                    type="date"
                    name="discountStartDate"
                    value={form.discountStartDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount End Date *</label>
                  <input
                    className="form-control"
                    type="date"
                    name="discountEndDate"
                    value={form.discountEndDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Category Flags */}
            <div className="category-flags-section">
              <h4>Product Categories</h4>
              <p>Select the categories this product belongs to:</p>
              <div className="category-flags-grid">
                {categoryFlags.map((flag) => (
                  <div className="category-flag-item" key={flag.name}>
                    <label>
                      <input type="checkbox" name={flag.name} checked={form[flag.name]} onChange={handleChange} />
                      <div className="flag-content">
                        <div className="flag-title">
                          {flag.icon}
                          <span>{flag.label}</span>
                        </div>
                        <div className="flag-description">{flag.description}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Image */}
            <div className="form-row image-upload-row">
              <div className="form-group">
                <label>Product Image *</label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control file-input"
                    required={!imageFile}
                  />
                  <label htmlFor="image-upload" className="file-input-label">
                    <Upload size={18} />
                    <span>{imageFile ? "Change Image" : "Choose Image"}</span>
                  </label>
                </div>
              </div>
              {preview && (
                <div className="image-preview-container">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="image-preview" />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                <X size={18} /> Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                <Save size={18} /> {isSubmitting ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AddProduct
