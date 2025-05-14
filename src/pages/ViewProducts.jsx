"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Pencil,
  Trash2,
  X,
  Save,
  Upload,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Star,
  Award,
  Sparkles,
  Clock,
  Tag,
  Loader,
} from "lucide-react"
import "./ViewProducts.css"

const ViewProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
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
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://localhost:7085/api/products")

      const productArray = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : res.data.products || []

      setProducts(productArray)

      if (productArray.length === 0) {
        setMessage("No products found.")
      } else {
        setMessage("")
      }
    } catch (err) {
      console.error(err)
      setMessage("Failed to fetch products.")
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return

    try {
      await axios.delete(`https://localhost:7085/api/products/${id}`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      alert("Product deleted successfully.")
    } catch (err) {
      console.error(err)
      alert("Failed to delete product.")
    }
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || "",
      author: product.author || "",
      genre: product.genre || "",
      publisher: product.publisher || "",
      isbn: product.isbn || "",
      description: product.description || "",
      language: product.language || "",
      format: product.format || "",
      publicationDate: product.publicationDate ? new Date(product.publicationDate).toISOString().split("T")[0] : "",
      price: product.price ? product.price.toString() : "",
      discountPercent: product.discountPercent ? product.discountPercent.toString() : "",
      discountStartDate: product.discountStartDate
        ? new Date(product.discountStartDate).toISOString().split("T")[0]
        : "",
      discountEndDate: product.discountEndDate ? new Date(product.discountEndDate).toISOString().split("T")[0] : "",
      onSale: product.onSale || false,
      stockQuantity: product.stockQuantity ? product.stockQuantity.toString() : "0",
      isAvailableInStore: product.isAvailableInStore !== false,
      hasAward: product.hasAward || false,
      isTrending: product.isTrending || false,
      isBestseller: product.isBestseller || false,
      isNewRelease: product.isNewRelease || false,
      isComingSoon: product.isComingSoon || false,
      isOnDeal: product.isOnDeal || false,
    })
    setPreview(product.image || "")
    setIsModalOpen(true)
    setStatusMessage({ text: "", type: "" })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setImageFile(null)
    setPreview("")
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
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
    if (!formData.name || formData.name.trim() === "") {
      setStatusMessage({ text: "Product name is required", type: "error" })
      return false
    }

    if (!formData.price || isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) < 0) {
      setStatusMessage({ text: "Please enter a valid price", type: "error" })
      return false
    }

    // Validate discount percent if on sale
    if (formData.onSale) {
      if (!formData.discountPercent || isNaN(Number.parseFloat(formData.discountPercent))) {
        setStatusMessage({ text: "Please enter a valid discount percentage", type: "error" })
        return false
      }

      const discountPercent = Number.parseFloat(formData.discountPercent)
      if (discountPercent < 0 || discountPercent > 100) {
        setStatusMessage({ text: "Discount percentage must be between 0 and 100", type: "error" })
        return false
      }

      if (!formData.discountStartDate) {
        setStatusMessage({ text: "Discount start date is required for sale items", type: "error" })
        return false
      }

      if (!formData.discountEndDate) {
        setStatusMessage({ text: "Discount end date is required for sale items", type: "error" })
        return false
      }

      // Validate date range
      const startDate = new Date(formData.discountStartDate)
      const endDate = new Date(formData.discountEndDate)
      if (endDate < startDate) {
        setStatusMessage({ text: "Discount end date must be after start date", type: "error" })
        return false
      }
    }

    // Validate stock quantity
    if (
      formData.stockQuantity &&
      (isNaN(Number.parseInt(formData.stockQuantity)) || Number.parseInt(formData.stockQuantity) < 0)
    ) {
      setStatusMessage({ text: "Stock quantity must be a non-negative number", type: "error" })
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
    setStatusMessage({ text: "", type: "" })

    const formDataObj = new FormData()

    // Format and convert values before sending
    const formattedData = {
      ...formData,
      id: editingProduct.id,
      price: Number.parseFloat(formData.price),
      stockQuantity: Number.parseInt(formData.stockQuantity || "0"),
      discountPercent: formData.onSale ? Number.parseFloat(formData.discountPercent || "0") : null,
      discountStartDate: formData.onSale ? formData.discountStartDate : null,
      discountEndDate: formData.onSale ? formData.discountEndDate : null,
    }

    // Append all form fields to FormData
    Object.keys(formattedData).forEach((key) => {
      if (formattedData[key] !== null && formattedData[key] !== undefined) {
        formDataObj.append(key, formattedData[key].toString())
      }
    })

    // Append image if selected
    if (imageFile) {
      formDataObj.append("image", imageFile)
    }

    try {
      await axios.put(`https://localhost:7085/api/products/${editingProduct.id}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Update the product in the local state
      const updatedProducts = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            ...formattedData,
            image: preview || p.image, // Keep the existing image URL if no new image
          }
        }
        return p
      })

      setProducts(updatedProducts)
      setStatusMessage({ text: "Product updated successfully!", type: "success" })

      // Close modal after a short delay to show success message
      setTimeout(() => {
        closeModal()
      }, 1500)
    } catch (err) {
      console.error("Error updating product:", err)
      let errorMessage = "Failed to update product"

      // Extract more specific error message if available
      if (err.response?.data?.title) {
        errorMessage += `: ${err.response.data.title}`
      } else if (err.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`
      } else if (err.message) {
        errorMessage += `: ${err.message}`
      }

      setStatusMessage({
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

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="view-products-container">
      <div className="view-products-card">
        <div className="view-products-header">
          <h2>
            <BookOpen className="header-icon" /> Admin <ChevronRight size={18} /> View Products
          </h2>
          <p>Below is the list of all products in your store.</p>
        </div>

        {loading ? (
          <p className="status-msg">
            <Loader className="loading-icon" /> Loading products...
          </p>
        ) : message ? (
          <p className="status-msg">{message}</p>
        ) : (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>On Sale</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.author}</td>
                    <td>{product.genre}</td>
                    <td>Rs. {product.price}</td>
                    <td>{product.stockQuantity}</td>
                    <td>{product.onSale ? "Yes" : "No"}</td>
                    <td>
                      <button className="btn-edit" onClick={() => openEditModal(product)}>
                        <Pencil size={18} />
                      </button>
                      <button className="btnDelete" onClick={() => deleteProduct(product.id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="edit-product-modal">
            <div className="modal-header">
              <h3>Edit Book</h3>
              <button className="close-modal-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="edit-product-form" encType="multipart/form-data">
              {statusMessage.text && <div className={`message ${statusMessage.type}`}>{statusMessage.text}</div>}

              {/* Basic Information */}
              <h4>Basic Information</h4>
              {[
                { label: "Name", name: "name", type: "text", required: true },
                { label: "Author", name: "author", type: "text" },
                { label: "Genre", name: "genre", type: "text" },
                { label: "Publisher", name: "publisher", type: "text" },
                { label: "ISBN", name: "isbn", type: "text" },
                { label: "Description", name: "description", type: "textarea" },
                { label: "Language", name: "language", type: "text" },
                { label: "Format", name: "format", type: "text" },
                { label: "Publication Date", name: "publicationDate", type: "date" },
                { label: "Price", name: "price", type: "number", required: true, step: "0.01", min: "0" },
                { label: "Stock Quantity", name: "stockQuantity", type: "number", min: "0" },
              ].map((input) => (
                <div className="form-group" key={input.name}>
                  <label className="text-label">
                    {input.label}
                    {input.required && " *"}
                  </label>
                  {input.type === "textarea" ? (
                    <textarea
                      className="form-control"
                      name={input.name}
                      value={formData[input.name]}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <input
                      className="form-control"
                      type={input.type}
                      name={input.name}
                      value={formData[input.name]}
                      onChange={handleInputChange}
                      required={input.required || false}
                      step={input.step || undefined}
                      min={input.min || undefined}
                    />
                  )}
                </div>
              ))}

              {/* Availability Options */}
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isAvailableInStore"
                    checked={formData.isAvailableInStore}
                    onChange={handleInputChange}
                  />
                  Available in Store
                </label>
              </div>

              {/* Sale Information */}
              <h4>Sale Information</h4>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="onSale" checked={formData.onSale} onChange={handleInputChange} />
                  On Sale
                </label>
              </div>

              {formData.onSale && (
                <>
                  <div className="form-group">
                    <label className="text-label">Discount Percentage *</label>
                    <input
                      className="form-control"
                      type="number"
                      name="discountPercent"
                      value={formData.discountPercent}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-label">Discount Start Date *</label>
                    <input
                      className="form-control"
                      type="date"
                      name="discountStartDate"
                      value={formData.discountStartDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-label">Discount End Date *</label>
                    <input
                      className="form-control"
                      type="date"
                      name="discountEndDate"
                      value={formData.discountEndDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}

              {/* Category Flags */}
              <div className="category-flags-section">
                <h4>Product Categories</h4>
                <p>Select the categories this product belongs to:</p>
                <div className="category-flags-grid">
                  {categoryFlags.map((flag) => (
                    <div className="category-flag-item" key={flag.name}>
                      <label>
                        <input
                          type="checkbox"
                          name={flag.name}
                          checked={formData[flag.name]}
                          onChange={handleInputChange}
                        />
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
              <div className="form-group">
                <label className="text-label">Product Image</label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control file-input"
                  />
                  <label htmlFor="image-upload" className="file-input-label">
                    <Upload size={18} />
                    <span>{imageFile ? "Change Image" : "Choose Image"}</span>
                  </label>
                </div>
                {preview && (
                  <div className="image-preview-container">
                    <img
                      src={
                        preview.startsWith("blob:")
                          ? preview
                          : preview.startsWith("/uploads")
                            ? `https://localhost:7085${preview}`
                            : preview
                      }
                      alt="Preview"
                      className="image-preview"
                    />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  <X size={18} /> Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="loading-icon" /> Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Update Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewProducts
